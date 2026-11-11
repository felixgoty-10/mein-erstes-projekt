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


def horror(dur, rng):
    """Düster: tiefer Drone, verstimmte Spieluhr in Moll, leiser Herzschlag."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 55.7 * t) + 0.3 * np.sin(2 * np.pi * 82.4 * t))
    drone *= 0.18 * (0.75 + 0.25 * np.sin(2 * np.pi * 0.08 * t))
    noise = rng.normal(0, 1, n)
    k = int(0.02 * SR)
    wind = np.convolve(noise, np.ones(k) / k, mode="same") * 0.25 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.05 * t + 1))
    mix = drone + wind
    # Spieluhr: a-Moll, langsam, leicht verstimmt
    melody = [69, 72, 76, 74, 72, 71, 69, 64, 69, 72, 77, 76, 74, 72, 71, 68]
    step = 0.62
    i = 0
    while i * step < dur:
        m = melody[i % len(melody)] + 12
        f = note(m) * (1 + 0.004 * np.sin(i))
        L = int(SR * 1.6)
        tt = np.arange(L) / SR
        bell = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 2.76 * tt) + 0.15 * np.sin(2 * np.pi * f * 5.4 * tt)) * np.exp(-tt * 3.2) * 0.16
        i0 = int(i * step * SR)
        seg = bell[: max(0, min(L, n - i0))]
        mix[i0: i0 + len(seg)] += seg
        i += 1
    # Herzschlag ab der Hälfte, immer schneller
    tb = dur * 0.55
    while tb < dur - 0.3:
        for off, amp in ((0, 0.55), (0.18, 0.4)):
            L = int(0.16 * SR)
            tt = np.arange(L) / SR
            thump = np.sin(2 * np.pi * 48 * tt) * np.exp(-tt * 28) * amp
            i0 = int((tb + off) * SR)
            seg = thump[: max(0, min(L, n - i0))]
            mix[i0: i0 + len(seg)] += seg
        prog = (tb - dur * 0.55) / (dur * 0.45)
        tb += 0.95 - 0.45 * prog
    return mix


def main():
    proj = Path(sys.argv[1])
    if len(sys.argv) > 2:
        dur = float(sys.argv[2])
    else:
        dur = json.loads((proj / "assets" / "timing.json").read_text())["duration"]
    rng = np.random.default_rng(7)
    spec = json.loads((proj / "video.json").read_text(encoding="utf-8"))
    if spec.get("music", {}).get("mood") == "sad":
        # ruhige Moll-Arpeggien (Am – F – C – G), langsam, weich
        bpm = 66; beat = 60 / bpm; total = int(SR * (dur + 2)); mix = np.zeros(total)
        chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
        pat = [0, 1, 2, 1, 2, 1]
        t = 0.0; bar = 0; cache = {}
        while t < dur + 1:
            ch = chords[bar % 4]
            for k, idx in enumerate(pat):
                m = ch[idx] + 12
                if m not in cache:
                    cache[m] = pluck(note(m), beat * 3, rng, decay=0.998) * 0.3
                s_ = cache[m]; i0 = int((t + k * beat * 4 / len(pat)) * SR)
                seg = s_[: max(0, min(len(s_), total - i0))]; mix[i0: i0 + len(seg)] += seg
            bm = ch[0] - 12; tt = np.arange(int(SR * beat * 4)) / SR
            pad = (np.sin(2 * np.pi * note(bm) * tt) + 0.5 * np.sin(2 * np.pi * note(bm + 7) * tt)) * np.minimum(1, tt * 2) * np.exp(-tt * 0.5) * 0.12
            i0 = int(t * SR); seg = pad[: max(0, min(len(pad), total - i0))]; mix[i0: i0 + len(seg)] += seg
            t += 4 * beat; bar += 1
        mix = mix[: int(SR * dur)]; fade = int(SR * 2.0); mix[-fade:] *= np.linspace(1, 0, fade)
        write(proj / "assets" / "music.wav", mix / np.max(np.abs(mix)) * 0.8)
        tt = np.arange(int(SR * 0.18)) / SR
        write(proj / "assets" / "pop.wav", np.sin(2 * np.pi * np.cumsum(380 + 600 * np.exp(-tt * 30)) / SR) * np.exp(-tt * 22) * 0.5)
        print(f"music.wav (sad, {dur:.1f}s) + pop.wav")
        return
    if spec.get("music", {}).get("mood") == "horror":
        mix = horror(dur, rng)
        fade = int(SR * 1.0)
        mix[-fade:] *= np.linspace(1, 0, fade)
        write(proj / "assets" / "music.wav", mix / np.max(np.abs(mix)) * 0.85)
        tt = np.arange(int(SR * 0.9)) / SR  # "Hit" für Schockmomente
        hit = (rng.normal(0, 1, len(tt)) * 0.5 + np.sin(2 * np.pi * 40 * tt)) * np.exp(-tt * 4)
        write(proj / "assets" / "pop.wav", hit / np.max(np.abs(hit)) * 0.9)
        print(f"music.wav (horror, {dur:.1f}s) + pop.wav (hit)")
        return
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
