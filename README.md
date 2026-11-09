# Stadt-Videos

Deutsche TikTok-Videos im „In dieser Stadt…“-Stil, komplett im Code gebaut mit
[HyperFrames](https://github.com/heygen-com/hyperframes) und Three.js.

- `STYLE_GUIDE.md`: Analyse der Referenzvideos (Aufbau, Optik, Overlays)
- `.claude/skills/stadt-video/SKILL.md`: Arbeitsablauf für neue Videos
- `engine/`: 3D-Baukasten (Figuren, Häuser, Pillen) + Runner
- `tools/`: Stimme (`tts.py`), Musik (`music.py`), Builder (`build.mjs`), Setup
- `videos/<slug>/`: ein Video pro Ordner (`video.json`, `assets/scene.js`, generiertes `index.html`)

```bash
bash tools/setup.sh
python3 tools/tts.py videos/niemand-arbeitet
python3 tools/music.py videos/niemand-arbeitet
node tools/build.mjs videos/niemand-arbeitet
cd videos/niemand-arbeitet && npx hyperframes render -o ../../renders/niemand-arbeitet.mp4
```
