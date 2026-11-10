#!/usr/bin/env python3
"""Eigene Sprachaufnahme (z. B. ElevenLabs) als Stimme eines Videos verwenden.

Aufruf: python3 tools/align.py videos/<slug> <aufnahme.mp3|wav>

- kopiert die Aufnahme als assets/voice.wav (44.1 kHz mono, normalisiert)
- findet Sprechpausen und ordnet die Satzgrenzen aus video.json den passenden Pausen zu
  (dynamische Programmierung: Satzdauern sollen zu den erwarteten Längen passen)
- verteilt die Wörter jedes Satzes nach Phonem-Anzahl → assets/timing.json
Danach wie gewohnt: tools/music.py, tools/build.mjs, rendern.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))


def load_mono(path, sr=16000):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0, sr


def speech_runs(a, sr, thr_db=-38, min_gap=0.12):
    hop = int(0.01 * sr)
    n = len(a) // hop
    rms = np.sqrt(np.mean(a[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms / (np.max(rms) + 1e-12))
    sp = db > thr_db
    runs, start = [], None
    for i, s in enumerate(sp):
        if s and start is None:
            start = i
        if not s and start is not None:
            runs.append([start, i]); start = None
    if start is not None:
        runs.append([start, n])
    merged = []
    for r in runs:  # Lücken kürzer als min_gap gehören zum selben Lauf
        if merged and (r[0] - merged[-1][1]) * 0.01 < min_gap:
            merged[-1][1] = r[1]
        else:
            merged.append(r)
    merged = [r for r in merged if (r[1] - r[0]) * 0.01 > 0.06]
    return [(r[0] * 0.01, r[1] * 0.01) for r in merged]


def phon_count(voice, w):
    clean = re.sub(r"[^\wäöüÄÖÜß-]", "", w) or w
    ph = voice.phonemize(clean)
    return max(2, sum(1 for s in ph for p in s if p not in "ˈˌː" and p.strip()))


def main():
    proj = Path(sys.argv[1]).resolve()
    src = Path(sys.argv[2]).resolve()
    spec = json.loads((proj / "video.json").read_text(encoding="utf-8"))
    sents = spec["sentences"]
    assets = proj / "assets"; assets.mkdir(exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-ac", "1", "-ar", "44100",
                    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", str(assets / "voice.wav")], check=True)
    a, sr = load_mono(assets / "voice.wav")
    dur = len(a) / sr
    runs = speech_runs(a, sr)

    from piper import PiperVoice
    voice = PiperVoice.load(str(ROOT / ".cache" / "voices" / "de-thorsten-low.onnx"))
    wcounts = [[phon_count(voice, w) for w in s["text"].split()] for s in sents]
    expect = np.array([sum(c) for c in wcounts], float)
    speech_total = sum(e - s for s, e in runs)
    expect = expect / expect.sum() * speech_total

    # DP: Läufe 0..R-1 in S zusammenhängende Gruppen teilen
    R, S = len(runs), len(sents)
    if R < S:
        raise SystemExit(f"Nur {R} Sprechabschnitte für {S} Sätze gefunden – Pausen zu kurz? thr anpassen.")
    sp_len = np.array([e - s for s, e in runs])
    cum = np.concatenate([[0], np.cumsum(sp_len)])
    INF = 1e18
    cost = np.full((S + 1, R + 1), INF); back = np.zeros((S + 1, R + 1), int)
    cost[0, 0] = 0
    for i in range(1, S + 1):
        for j in range(i, R - (S - i) + 1):
            for k in range(i - 1, j):
                if cost[i - 1, k] >= INF: continue
                d = cum[j] - cum[k]
                c = cost[i - 1, k] + ((d - expect[i - 1]) / max(0.4, expect[i - 1])) ** 2
                if c < cost[i, j]:
                    cost[i, j] = c; back[i, j] = k
    bounds, j = [], R
    for i in range(S, 0, -1):
        k = back[i, j]; bounds.append((k, j)); j = k
    bounds.reverse()

    out = []
    for s, wc, (k, j) in zip(sents, wcounts, bounds):
        seg = runs[k:j]
        words = s["text"].split()
        # Wörter über die Sprech-Läufe des Satzes verteilen (Pausen innerhalb werden übersprungen)
        total = sum(wc); speech = sum(e - b for b, e in seg)
        wl, acc, ri = [], 0.0, 0
        pos = seg[0][0]
        for w, c in zip(words, wc):
            length = speech * c / total
            start = pos
            rem = length
            while rem > 1e-6:
                b, e = seg[ri]
                avail = e - pos
                if rem <= avail + 1e-6:
                    pos += rem; rem = 0
                else:
                    rem -= avail; ri = min(ri + 1, len(seg) - 1); pos = seg[ri][0]
                    if ri == len(seg) - 1 and seg[ri][1] - pos < rem: pos = seg[ri][1]; rem = 0
            wl.append({"text": w, "start": round(start, 3), "end": round(pos, 3)})
        out.append({"id": s["id"], "text": s["text"], "start": round(seg[0][0], 3), "end": round(seg[-1][1], 3), "words": wl})
    (assets / "timing.json").write_text(json.dumps({"duration": round(dur, 3), "sentences": out}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"voice.wav: {dur:.2f}s, {R} Sprechabschnitte → {S} Sätze")
    for o in out:
        print(f"  {o['id']:4s} {o['start']:6.2f}–{o['end']:6.2f}  {o['text']}")


if __name__ == "__main__":
    main()
