#!/usr/bin/env python3
"""Erzeugt lizenzfreie, fröhliche Hintergrundmusik (Pluck-Arpeggio, Bass, Shaker)
und einen 'Pop'-Soundeffekt. Kein Download nötig.

Aufruf: python3 tools/music.py videos/<slug> [dauer_sek]
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 108


def pluck(freq, dur, rng, decay=0.996):
    n = int(SR * dur)
    period = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, period)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = decay * 0.5 * (buf[i % period] + buf[(i + 1) % period])
    return out


def note(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def write(path, a):
    a = np.clip(a, -1, 1)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes((a * 32767).astype(np.int16).tobytes())


def main():
    proj = Path(sys.argv[1])
    if len(sys.argv) > 2:
        dur = float(sys.argv[2])
    else:
        dur = json.loads((proj / "assets" / "timing.json").read_text())["duration"]
    rng = np.random.default_rng(7)
    beat = 60 / BPM
    total = int(SR * (dur + 1))
    mix = np.zeros(total)
    # C – G – Am – F
    chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
    bass = [36, 43, 45, 41]
    pattern = [0, 1, 2, 1, 0, 2, 1, 2]  # Achtel-Arpeggio
    t = 0.0
    bar = 0
    cache = {}
    while t < dur + 1:
        ch = chords[bar % 4]
        for k, idx in enumerate(pattern):
            m = ch[idx] + 12
            key = (m, "p")
            if key not in cache:
                cache[key] = pluck(note(m), beat * 1.5, rng) * 0.32
            s = cache[key]
            i0 = int((t + k * beat / 2) * SR)
            seg = s[: max(0, min(len(s), total - i0))]
            mix[i0: i0 + len(seg)] += seg
        # Bass auf 1 und 3
        for k in (0, 2):
            m = bass[bar % 4]
            key = (m, "b")
            if key not in cache:
                tt = np.arange(int(SR * beat * 1.8)) / SR
                cache[key] = np.sin(2 * np.pi * note(m) * tt) * np.exp(-tt * 3) * 0.45
            s = cache[key]
            i0 = int((t + k * beat) * SR)
            seg = s[: max(0, min(len(s), total - i0))]
            mix[i0: i0 + len(seg)] += seg
        # Shaker auf den Offbeats
        for k in range(4):
            i0 = int((t + k * beat + beat / 2) * SR)
            n = int(0.05 * SR)
            if i0 + n < total:
                mix[i0: i0 + n] += rng.uniform(-1, 1, n) * np.exp(-np.arange(n) / (0.012 * SR)) * 0.08
        t += 4 * beat
        bar += 1
    mix = mix[: int(SR * dur)]
    fade = int(SR * 1.0)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix = mix / np.max(np.abs(mix)) * 0.8
    write(proj / "assets" / "music.wav", mix)

    # Pop-Sound: kurzer Frequenz-Sweep mit Klick
    tt = np.arange(int(SR * 0.18)) / SR
    f = 380 + 900 * np.exp(-tt * 30)
    pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 22) * 0.9
    write(proj / "assets" / "pop.wav", pop)
    print(f"music.wav ({dur:.1f}s) + pop.wav")


if __name__ == "__main__":
    main()
