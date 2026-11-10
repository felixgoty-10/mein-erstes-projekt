#!/usr/bin/env python3
"""Erzählstimme über ElevenLabs erzeugen (Standard-Sprecher: "Mark - Casual, Relaxed and Light").

Aufruf: python3 tools/tts_elevenlabs.py videos/<slug>

- liest die Sätze aus video.json
- erzeugt die ganze Erzählung in EINEM Durchgang (natürlicher Sprachfluss) über
  /v1/text-to-speech/{voice}/with-timestamps → Zeitstempel pro Buchstabe
- schreibt assets/voice.wav (44.1 kHz mono) und assets/timing.json (Sätze + Wörter, exakt)

Der API-Schlüssel wird vom Netzwerk-Proxy der Umgebung eingesetzt (Header xi-api-key);
lokal genügt ein Platzhalter. Alternativ: ELEVENLABS_API_KEY setzen.
Konfiguration in video.json → "voice": { "provider": "elevenlabs", "voice_name": "Mark", "model_id": "eleven_v4" }
"""
import base64
import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.elevenlabs.io"
CACHE = ROOT / ".cache" / "elevenlabs.json"
DEFAULT_VOICE = "Mark"           # "Mark - Casual, Relaxed and Light"
DEFAULT_MODEL = "eleven_v4"      # Modell, mit dem die Referenz-Aufnahmen erzeugt wurden
FALLBACK_MODELS = ["eleven_v3", "eleven_multilingual_v2"]
TAIL = 1.0


def req(method, path, body=None):
    key = os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(API + path, data=data, method=method,
                               headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "application/json"})
    with urllib.request.urlopen(r, timeout=300) as resp:
        return json.loads(resp.read())


def find_voice(name):
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    if name in cache:
        return cache[name]
    voices = req("GET", "/v1/voices").get("voices", [])
    hits = [v for v in voices if v["name"].lower().startswith(name.lower())]
    if not hits:  # Bibliothek der geteilten Stimmen durchsuchen
        shared = req("GET", "/v1/shared-voices?search=" + urllib.request.quote(name) + "&page_size=30").get("voices", [])
        hits = [{"voice_id": v["voice_id"], "name": v["name"]} for v in shared if "casual" in v["name"].lower() or "relaxed" in v["name"].lower()] or \
               [{"voice_id": v["voice_id"], "name": v["name"]} for v in shared]
    if not hits:
        raise SystemExit(f"Stimme '{name}' nicht gefunden – bitte in ElevenLabs zur eigenen Bibliothek hinzufügen.")
    best = sorted(hits, key=lambda v: (("casual" not in v["name"].lower()), len(v["name"])))[0]
    cache[name] = best["voice_id"]
    CACHE.parent.mkdir(exist_ok=True)
    CACHE.write_text(json.dumps(cache, indent=1))
    print(f"Stimme: {best['name']} ({best['voice_id']})")
    return best["voice_id"]


def main():
    proj = Path(sys.argv[1]).resolve()
    spec = json.loads((proj / "video.json").read_text(encoding="utf-8"))
    vcfg = spec.get("voice", {})
    voice_id = vcfg.get("voice_id") or find_voice(vcfg.get("voice_name", DEFAULT_VOICE))
    sents = spec["sentences"]
    # Satzzeichen bleiben erhalten; Absätze zwischen den Sätzen geben kleine Pausen
    parts, spans, pos = [], [], 0
    for s in sents:
        t = s["text"].strip()
        spans.append((pos, pos + len(t)))
        parts.append(t)
        pos += len(t) + 1
    text = " ".join(parts)
    body = {"text": text, "model_id": vcfg.get("model_id", DEFAULT_MODEL), "language_code": "de",
            "voice_settings": vcfg.get("voice_settings", {"stability": 0.5, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True})}
    res = None
    for model in [body["model_id"]] + [m for m in FALLBACK_MODELS if m != body["model_id"]]:
        body["model_id"] = model
        try:
            res = req("POST", f"/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128", body)
            break
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="ignore")[:300]
            print(f"Modell {model} abgelehnt ({e.code}): {msg}")
            if e.code in (401, 403) and "model" not in msg.lower():
                raise
    if res is None:
        raise SystemExit("Keine Sprachausgabe erhalten.")
    assets = proj / "assets"; assets.mkdir(exist_ok=True)
    mp3 = assets / "voice_elevenlabs.mp3"
    mp3.write_bytes(base64.b64decode(res["audio_base64"]))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-ac", "1", "-ar", "44100",
                    "-af", f"loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur={TAIL}", str(assets / "voice.wav")], check=True)
    al = res.get("normalized_alignment") or res["alignment"]
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    # Zeichenpositionen der Antwort auf den gesendeten Text abbilden (gleiche Länge erwartet)
    if len(chars) != len(text):
        al = res["alignment"]; chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    out = []
    for s, (a, b) in zip(sents, spans):
        words, i = [], a
        for w in s["text"].split():
            j = text.index(w, i)
            k = j + len(w)
            words.append({"text": w, "start": round(st[j], 3), "end": round(en[k - 1], 3)})
            i = k
        out.append({"id": s["id"], "text": s["text"], "start": words[0]["start"], "end": words[-1]["end"], "words": words})
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(assets / "voice.wav")],
                               capture_output=True, text=True).stdout)
    (assets / "timing.json").write_text(json.dumps({"duration": round(dur, 3), "sentences": out}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"voice.wav: {dur:.2f}s, Modell {body['model_id']}, {len(out)} Sätze")


if __name__ == "__main__":
    main()
