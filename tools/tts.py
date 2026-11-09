#!/usr/bin/env python3
"""Deutsche Sprachausgabe + Wort-Timings für ein Stadt-Video.

Liest  videos/<slug>/video.json  (Liste "sentences": [{id, text, pause?}])
Schreibt videos/<slug>/assets/voice.wav   (44.1 kHz mono)
         videos/<slug>/assets/timing.json (Sätze + Wörter mit start/end in Sekunden)

Stimme: Piper (offline), Modell .cache/voices/de-thorsten-low.onnx.
Piper liefert keine Wort-Zeitstempel. Deshalb wird jeder Satz einzeln
synthetisiert, Stille am Rand abgeschnitten und die Satzdauer nach
Phonem-Anzahl auf die Wörter verteilt. Das reicht für 1-Wort-Untertitel.

Aufruf: python3 tools/tts.py videos/<slug>
"""
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
import pyworld as pw
from piper import PiperVoice
from piper.config import SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
VOICES = ROOT / ".cache" / "voices"
LEAD_IN = 0.25          # Stille vor dem ersten Wort
DEFAULT_PAUSE = 0.32    # Pause zwischen Sätzen
TAIL = 0.7              # Stille nach dem letzten Wort
STRESS = set("ˈˌː")
PUNCT_WEIGHT = {",": 2.5, ":": 3.0, "?": 1.0, "!": 1.0, ".": 0.5}


def trim(a, sr, thr=0.012):
    """Schneidet Stille am Anfang/Ende ab (mit 30 ms Polster)."""
    env = np.abs(a)
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return a
    pad = int(0.03 * sr)
    return a[max(0, idx[0] - pad): min(len(a), idx[-1] + pad)]


def shape_voice(a, sr, pitch_hz=None, pitch_range=1.0, formant=1.0):
    """Stimmformung mit WORLD: Tonhöhe (Median in Hz), Melodie-Umfang, Formanten.
    pitch_range > 1 = lebendigere Betonung, formant > 1 = jünger/heller."""
    if not pitch_hz and pitch_range == 1.0 and formant == 1.0:
        return a
    x = a.astype(np.float64)
    f0, t = pw.harvest(x, sr, f0_floor=60, f0_ceil=500, frame_period=5.0)
    sp = pw.cheaptrick(x, f0, t, sr)
    ap = pw.d4c(x, f0, t, sr)
    v = f0 > 0
    if v.any():
        lf = np.log(f0[v])
        med = np.median(lf)
        target = np.log(pitch_hz) if pitch_hz else med
        f0 = f0.copy()
        f0[v] = np.exp(target + (lf - med) * pitch_range)
    if formant != 1.0:
        n = sp.shape[1]
        src = np.clip(np.arange(n) / formant, 0, n - 1)
        sp = np.stack([np.interp(src, np.arange(n), row) for row in sp])
        ap = np.stack([np.interp(src, np.arange(n), row) for row in ap])
    y = pw.synthesize(f0, sp, ap, sr, frame_period=5.0)
    return y[: len(a)].astype(np.float32)


def pitch_chain(vcfg):
    """Rubberband-Kette: 'formant_semitones' verschiebt Tonhöhe+Formanten gemeinsam (kürzerer Stimmtrakt,
    z. B. Kinderstimme), der Rest bis 'semitones' nur die Tonhöhe bei erhaltenen Formanten."""
    total = vcfg.get("semitones", 0)
    fs = vcfg.get("formant_semitones", 0)
    chain = ""
    if fs:
        chain += f"rubberband=pitch={2 ** (fs / 12):.4f}:formant=shifted:pitchq=quality:window=short,"
    if total - fs:
        chain += f"rubberband=pitch={2 ** ((total - fs) / 12):.4f}:formant=preserved:pitchq=quality:window=short,"
    return chain


def word_weights(voice, words):
    weights = []
    for w in words:
        clean = re.sub(r"[^\wäöüÄÖÜß-]", "", w)
        ph = voice.phonemize(clean or w)
        n = sum(1 for sent in ph for p in sent if p not in STRESS and p.strip())
        n = max(n, 2)
        tail = w[-1] if w[-1] in PUNCT_WEIGHT else None
        weights.append((n, PUNCT_WEIGHT.get(tail, 0.0)))
    return weights


def main():
    proj = Path(sys.argv[1]).resolve()
    spec = json.loads((proj / "video.json").read_text(encoding="utf-8"))
    vcfg = spec.get("voice", {})
    model = vcfg.get("model")
    if model:  # Piper-Modell im sherpa-onnx-Format (.onnx + .onnx.json), z. B. de_DE-thorsten-high
        model_path = ROOT / ".cache" / "sherpa" / f"vits-piper-{model}" / f"{model}.onnx"
    else:
        model_path = VOICES / f"de-{vcfg.get('base', 'thorsten')}-low.onnx"
    voice = PiperVoice.load(str(model_path))
    spk_map = getattr(voice.config, "speaker_id_map", None) or {}
    sr = voice.config.sample_rate
    syn = SynthesisConfig(
        speaker_id=spk_map.get(vcfg["speaker"]) if vcfg.get("speaker") else None,
        length_scale=vcfg.get("length_scale", 0.9),
        noise_scale=vcfg.get("noise_scale", 0.6),
        noise_w_scale=vcfg.get("noise_w_scale", 0.8),
    )

    pieces = [np.zeros(int(LEAD_IN * sr), dtype=np.float32)]
    cursor = LEAD_IN
    out = []
    for s in spec["sentences"]:
        audio = b"".join(ch.audio_int16_bytes for ch in voice.synthesize(s["text"], syn))
        a = np.frombuffer(audio, dtype=np.int16).astype(np.float32) / 32768.0
        a = shape_voice(a, sr, vcfg.get("pitch_hz"), vcfg.get("pitch_range", 1.0), vcfg.get("formant", 1.0))
        a = trim(a, sr)
        dur = len(a) / sr
        words = s["text"].split()
        ws = word_weights(voice, words)
        total = sum(n + p for n, p in ws)
        t = cursor
        wl = []
        for w, (n, p) in zip(words, ws):
            speak = dur * n / total
            gap = dur * p / total
            wl.append({"text": w, "start": round(t, 3), "end": round(t + speak, 3)})
            t += speak + gap
        out.append({"id": s["id"], "text": s["text"], "start": round(cursor, 3),
                    "end": round(cursor + dur, 3), "words": wl})
        pieces.append(a)
        cursor += dur
        pause = s.get("pause", vcfg.get("pause", DEFAULT_PAUSE))
        pieces.append(np.zeros(int(pause * sr), dtype=np.float32))
        cursor += pause
    pieces.append(np.zeros(int(TAIL * sr), dtype=np.float32))
    full = np.concatenate(pieces)
    full = full / max(1e-6, np.max(np.abs(full))) * 0.89

    assets = proj / "assets"
    assets.mkdir(exist_ok=True)
    raw = assets / "voice_raw.wav"
    with wave.open(str(raw), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes((full * 32767).astype(np.int16).tobytes())
    # 44.1 kHz, leichte Präsenz-Anhebung und Kompression für Social-Media-Klang
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", str(raw),
        "-af", pitch_chain(vcfg) + vcfg.get("eq", "highpass=f=80,equalizer=f=3000:t=q:w=1.2:g=3,acompressor=threshold=-18dB:ratio=3:attack=5:release=80") + ",aresample=44100",
        str(assets / "voice.wav")], check=True)
    raw.unlink()
    duration = round(len(full) / sr, 3)
    (assets / "timing.json").write_text(json.dumps(
        {"duration": duration, "sentences": out}, ensure_ascii=False, indent=1), encoding="utf-8")
    nwords = sum(len(s["words"]) for s in out)
    print(f"voice.wav: {duration:.2f}s, {len(out)} Sätze, {nwords} Wörter")


if __name__ == "__main__":
    main()
