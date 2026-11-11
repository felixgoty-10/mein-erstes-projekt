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
**Optional fließend sprechen (nur auf Wunsch):** `"flow": true` in `voice`. Sätze bis einschließlich eines
Satzes mit `"end": true` werden in **einem Zug** gesprochen (Satzpunkt → Komma, Betonung läuft weiter, kurze
natürliche Atempausen). `"end": true` an Gedankenenden setzen (ca. alle 1–3 Sätze, immer vor einem Szenen-/Tageswechsel).
Kurze Nachsätze ("Kein Brot.", "Für Opa.") nie allein lassen, sondern mit dem Satz davor gruppieren.
Pause zwischen Gruppen: `"pause": 0.16`.

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
Grusel/Nacht: `W.set(name, x, z, { interior: true, night: true })` = Mondlicht; `room({ night: true })`;
`door()` (Blatt unter `userData.leaf`, z. B. zum Klopfen wackeln), `alarmClock("3:00")`, `nightstand()`;
schwarze Gestalt: `character({ shadow: true, hat: "hood", scale: 1.2 })` (nur leuchtende Augen);
Gesichter zusätzlich `scream`, `eyes`. Musik: `"music": { "mood": "horror", "volume": 0.32 }` in `video.json`.
Overlays zusätzlich: `keyhole` (Blick durchs Schlüsselloch), `flash` (`color`, `opacity`; `hold: true` blendet
bis zum Ende ein, z. B. Schwarzblende mit `"to": ["END", 0]`). Vorlage: `videos/lebenszeit/`.
Fahrzeuge: `car({ color, ambulance })` + `carLights(auto, t, { hazard, blue })` (Warnblinker/Blaulicht), `phone()`,
`stringLights(len)`; Kleidung `shirt: { type: "paramedic" }` (Rettungsdienst). Telefonieren: Arm `rotation.x = -2.5`, `z = 0.55`.
**Wichtig:** Jede Einstellung setzt Position/Rotation aller Figuren und Objekte, die sie zeigt, selbst neu (z. B. eine
`basis()`-Funktion am Anfang von `update`). Sonst „erbt“ sie Werte aus einer anderen Einstellung, denn HyperFrames
rendert Frames nicht zwingend in Reihenfolge.
Winter/Natur: `pine(s, snow)`, `snowGround()`, `snowfall()` + `snowfallAt(pts, t, wind, speed)` (Schneefall, reine
Funktion der Zeit), `stream()` (Bach mit Trittsteinen), `fallenLog()`, `frozenFall()`, `streetLamp(intensity)`,
`schoolBus()`, `busStop()`, `cafeteriaTable()`; Mütze `hat: "beanie"`; Musik `"mood": "sad"` (ruhige Moll-Arpeggien).
Ernste Themen (z. B. Rassismus): respektvoll, keine Zahlen-Pillen, die Menschen bewerten; Hautfarbe über `skin`.
**Kamera-Faustregel Hochkant (fov 40):** eine Figur Kopf+Schultern ≈ 9–10 Abstand, eine Figur ganz ≈ 13,
zwei Figuren nebeneinander ≈ 17, Gruppe ≈ 20–26.
Weitere Bauteile: `dog()` + `dogPose(hund, t, walk)` (wedelt/läuft), `ivStand()`, `cake()`, `flower(color)`, `fence(len)`,
`wateringCan()`, `balloon(color)`; `bench()` (Sitzhöhe ≈ 1.6; sitzende Figur: `.sit()` + `body.position.y = 0.1`).
Kamera immer innerhalb der Raumwände platzieren (room w=16 → x ±8, d=12 → z ±6; offen nach +z).
Kamera-Abstand: Hochkant ist schmal – für eine Halbnahe ca. 12–14 Einheiten Abstand bei fov 40, Nahaufnahme ≥ 9.
Im Drehbuch `k: 1.5` an einem Shot zieht die Kamera entlang der Blickrichtung zurück (siehe `videos/freunde/`).
Story vom Nutzer vorgegeben → seine Handlung und sein Ende haben Vorrang vor der Standard-Erzählstruktur.
Neue Bauteile gehören in `engine/stadt3d.js`, damit alle Videos sie nutzen können.

## Bildregeln

- Hochkant 1080×1920. Hauptfigur mittig; die Untertitel sitzen bei y ≈ 1150–1310 px und dürfen über den Körper laufen, nie über das Gesicht.
- Kamera nie hinter einer Figur, die die Szene verdeckt. Nahaufnahme: Kopf + Schultern, Pille dann ausblenden.
- Liegende Figuren: `lieSide()` (Gesicht bleibt lesbar), Kamera von vorne.
- Eigene Figuren und eigene Welt: keine Marken, keine bekannten Spielfiguren nachbauen.
- **Fester Synchronsprecher (vom Nutzer festgelegt): ElevenLabs „Mark – Casual, Relaxed and Light“, Modell eleven_v4.**
  Ablauf für jedes neue Video:
  1. Skript in `video.json` schreiben und dem Nutzer den **Sprechtext untereinander** schicken – jeder Satz in einer
     Zeile, betonte Wörter in GROSSBUCHSTABEN, darunter `→ Ton/Betonung` (keine Tabelle).
  2. Bis die Aufnahme kommt: Vorschau mit der Piper-Stimme (`tools/tts.py`, `"voice": { "length_scale": 1.0 }`) bauen.
  3. Der Nutzer erzeugt die Aufnahme bei ElevenLabs mit Mark und schickt die MP3 → `tools/align.py` (siehe unten),
     Ergebnis als `renders/<slug>-elevenlabs.mp4` rendern und schicken.
  Direkter API-Weg (nur wenn der Nutzer einen ElevenLabs-Schlüssel hinterlegt und api.elevenlabs.io in der Umgebung
  erlaubt): `python3 tools/tts_elevenlabs.py videos/<slug>` mit `"voice": { "provider": "elevenlabs", "voice_name": "Mark",
  "model_id": "eleven_v4" }` – erzeugt voice.wav + exakte Wort-Timings. Eine eigene Umgebung dafür hat der Nutzer
  einmal abgelehnt: nicht erneut vorschlagen, nur wenn er selbst danach fragt.
  Andere Stimmen (hell, Kind, Teenager, schneller) wurden verworfen. Keine Stimme einer realen Person klonen.
- **Eigene Sprachaufnahme vom Nutzer (z. B. ElevenLabs):** statt `tts.py`
  `python3 tools/align.py videos/<slug> <aufnahme.mp3>` → normalisiert die Aufnahme zu `assets/voice.wav`, ordnet die
  Sätze aus `video.json` den Sprechpausen zu und erzeugt `assets/timing.json`. Ausgabe prüfen (Satzzeiten plausibel?).
  Enthält die Aufnahme zusätzliche Sprache, die nicht im Skript steht, vorher abschneiden (`ffmpeg -t …`) und den
  Nutzer fragen. Danach 1 s Stille anhängen (`apad=pad_dur=1.0`, `duration` in timing.json +1), `music.py`, `build.mjs`.
  Original in `assets/recordings/` ablegen.
