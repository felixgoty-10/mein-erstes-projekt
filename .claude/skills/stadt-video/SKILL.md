---
name: stadt-video
description: Erstellt ein deutsches TikTok-Video im "In dieser Stadt…"-Stil (blockige 3D-Figuren, Pastell-Kleinstadt, Ein-Wort-Untertitel, Zahlen-Pillen über den Köpfen) komplett im Code mit HyperFrames + Three.js. Nutzen, wenn der Nutzer ein neues Video, ein Thema, eine "Was wäre wenn"-Idee oder eine Regel für eine Stadt nennt.
---

# Stadt-Video (immer auf Deutsch)

Jedes Video ist eine Mini-Geschichte über **eine absurde Regel** oder ein **"Was wäre, wenn…"** in einer
Kleinstadt, erzählt vom Jungen mit der roten "13"-Collegejacke. Optik und Aufbau stehen in
`STYLE_GUIDE.md` (aus 3 Referenzvideos abgeleitet), lies ihn zuerst.

**Sprache:** Skript, Untertitel, Schilder, Karten, Ladenschilder: alles Deutsch. Zahlen im Skript
ausschreiben ("Tag drei", "achthundert"), damit die Stimme sie richtig spricht; auf Karten/Pillen Ziffern.

## Ablauf

1. **Einrichten** (einmal pro Sitzung): `bash tools/setup.sh`
2. **Ordner anlegen:** `videos/<slug>/` (slug = kurz, z. B. `niemand-arbeitet`). Vorlage: `videos/niemand-arbeitet/`.
3. **Skript → `video.json`** schreiben (siehe unten). Länge: 30 s ≈ 80 Wörter, 60 s ≈ 170 Wörter.
4. **Stimme + Timings:** `python3 tools/tts.py videos/<slug>` → `assets/voice.wav`, `assets/timing.json`.
   Dauer prüfen; zu kurz/lang → Wörter ändern oder `voice.length_scale` (1.0 = normal, kleiner = schneller).
5. **Musik/SFX:** `python3 tools/music.py videos/<slug>` → `assets/music.wav`, `assets/pop.wav`.
6. **Drehbuch → `assets/scene.js`** schreiben: eine Einstellung pro Satz (bei Pointen auch mitten im Satz), alle 1–2 s ein Schnitt.
7. **Bauen:** `node tools/build.mjs videos/<slug>` → `index.html` (HyperFrames-Komposition).
8. **Prüfen:** im Projektordner `npx hyperframes check --json` (Fehler beheben; Warnungen
   `line_unread`/`timeline_track_too_dense` sind beim Ein-Wort-Stil gewollt) und
   `npx hyperframes snapshot --at <Mitte jedes Satzes> --no-end -o snapshots/x`. Kontaktbogen ansehen:
   Figuren im Bild? Gesichter lesbar? Nichts verdeckt die Hauptfigur? Untertitel lesbar?
9. **Rendern:** `npx hyperframes render -o ../../renders/<slug>.mp4` (dauert im Container ca. 10–20 min, im Hintergrund starten).
   Danach ein paar Frames aus dem MP4 mit ffmpeg prüfen und das Video per SendUserFile schicken.
10. **Committen & pushen** (ohne `renders/*.mp4`, ohne `assets/engine` und `assets/vendor`; die sind gitignored).

## Erzählstruktur (Pflicht)

| Anteil | Beat |
|---|---|
| 0–10 % | **Hook = die Regel.** Erster Satz: "In dieser Stadt …". Frame 0 zeigt schon Figur + Pille + erstes Wort. |
| 10–25 % | Welt erklären, Zahl einführen (Geld, Akku, Punkte …) |
| 25–60 % | Abwärtsspirale in 3 Stufen ("Tag eins … Tag drei … Tag fünf"), jede schlimmer |
| 60–70 % | Tiefpunkt (es trifft jemanden, der dem Helden wichtig ist, z. B. Opa) |
| 70–90 % | Wendung: Held versteht etwas oder hat einen Trick |
| 90–100 % | Happy End + **letzte Zeile mit Augenzwinkern** (Running Gag) |

Kurze Sätze (2–8 Wörter), Präsens, Ich-Perspektive, konkrete Zahlen, keine Nebenhandlung.

## `video.json`

```json
{
  "title": "…",
  "voice": { "length_scale": 1.0 },
  "sentences": [ { "id": "s1", "text": "In dieser Stadt …" }, { "id": "s2", "text": "…", "pause": 0.1 } ],
  "overlays": [
    { "type": "card", "header": "OHNE ARBEIT", "value": "TAG 1", "from": ["s2", 0], "to": ["s2", 2] },
    { "type": "sign", "text": "TAG 3", "from": ["s3", 0], "to": ["s4", "end"] }
  ]
}
```
`from`/`to` = `[Satz-ID, Wortindex | "end"]`. **card** = Vollbild-Karte auf Cremegrund (roter Kopf, große Zahl),
**sign** = weißes Schild oben mit Schlüsselsatz in GROSSBUCHSTABEN. Sparsam einsetzen (3–6 pro Video).

## `assets/scene.js` – Drehbuch-API

`export default function direct(W, S, T) { …; return [shots] }`

- `T.s(id)` Satzstart, `T.e(id)` Satzende, `T.w(id, i)` Start von Wort i → für Schnitte genau auf dem Wort.
- `W.set(name, x, z, {interior})` neues Set (weit auseinander platzieren, z. B. x in 300er-Schritten). Nur das aktive Set ist sichtbar.
- `W.add(set, obj, x, y, z, rotY)`, `W.addChar(set, figur, x, z, rotY)`.
- Shot: `{ at, set, cam: [{pos, look, fov}, {pos, look, fov}], update(lt, u) }`. Kamera fährt in der Shotdauer von A nach B.
  `update` setzt **jedes Frame** alles neu (Figuren werden vorher automatisch `reset()`): reine Funktion der Zeit, kein Zustand, kein `Math.random()` (nimm `S.rng(seed)`).

**Figuren** `S.character({ shirt:{type,color,number}, pants, skin, hair:{type,color,seed}, hat, glasses, beard })`
- shirt.type: `varsity` (Held), `suit`, `coat` (Arzt), `apron` (Bäcker), `plaid` (Opa), `jacket`, `hoodie`, `tee`
- hair.type: `messy` (Held), `curly`, `short`, `old`, `bun`, `long`; hat: `chef`, `cap`, `sleep`
- Methoden (verkettbar): `.face(expr)` mit `neutral happy laugh sad worried shock wow sleep sick smug`;
  `.idle(t) .walk(t, speed) .cheer(t) .wave(t) .reach("R", 0..1) .shrug(u) .handsOnHead(u) .sit() .lie(t) .lieSide(t,{arms}) .lookAt(rad)`;
  `.pill("500 €", "white"|"red"|"green")` = Zahl über dem Kopf (das Markenzeichen, ändert sich live).
- Requisit in die Hand: Objekt an `figur.armR` hängen, Position `(0, -1.95, 0.55)`.

**Bauteile:** `house({w,d,h,color,roof,flat,sign})`, `street(len)`, `plaza(w,d)`, `tree(s,seed)`, `cloud(s,seed)`,
`room({wall,floor,rug})`, `sofa(color)`, `bed(color)`, `shelf({stocked})`, `counter()`, `oven()`, `tv()`, `bread()`,
`trashBag(seed)`, `bin(color)`, `briefcase()`, `broom()`, `signMesh(text,w,h,style)`, `textSprite("Z")`.
Hilfen: `S.pop(t,t0,d)` (Auftauchen mit Überschwinger), `S.ramp(t,t0,d)`, `S.ease`, `S.lerp`, `S.clamp`.
Neue Bauteile gehören in `engine/stadt3d.js`, damit alle Videos sie nutzen können.

## Bildregeln

- Hochkant 1080×1920. Hauptfigur mittig; die Untertitel sitzen bei y ≈ 1150–1310 px und dürfen über den Körper laufen, nie über das Gesicht.
- Kamera nie hinter einer Figur, die die Szene verdeckt. Nahaufnahme: Kopf + Schultern, Pille dann ausblenden.
- Liegende Figuren: `lieSide()` (Gesicht bleibt lesbar), Kamera von vorne.
- Eigene Figuren und eigene Welt: keine Marken, keine bekannten Spielfiguren nachbauen.
- **Standard-Stimme (für jedes Video übernehmen):** junge, helle, energische Erzählstimme, abgestimmt auf die
  Referenz (Median ≈ 190 Hz, lebendige Betonung, schnelles Tempo). In `video.json`:
  ```json
  "voice": { "base": "thorsten", "length_scale": 0.82, "pause": 0.24, "pitch_hz": 182, "pitch_range": 1.4, "formant": 1.07,
             "eq": "highpass=f=110,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=2800:t=q:w=1.2:g=5,equalizer=f=5500:t=q:w=1:g=3,acompressor=threshold=-20dB:ratio=4:attack=3:release=60" }
  ```
  Basis ist Piper "thorsten" (offline), geformt mit dem WORLD-Vocoder (`pitch_hz` Tonhöhe, `pitch_range` Melodie,
  `formant` Klangfarbe). Keine Stimme einer realen Person 1:1 klonen; nur Charakter/Stil angleichen.
- Die Stimme ist Piper "thorsten" (offline). Wenn der Nutzer eine eigene Sprachaufnahme liefert: als `assets/voice.wav`
  ablegen, Satzzeiten in `assets/timing.json` von Hand eintragen (gleiches Format) und `tts.py` überspringen.
