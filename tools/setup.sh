#!/usr/bin/env bash
# Einmalige Einrichtung pro Sitzung: Node-Pakete, Piper-TTS, deutsche Stimme.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d node_modules/hyperframes ] || npm install --no-audit --no-fund
python3 -c "import piper" 2>/dev/null || pip install -q piper-tts numpy
mkdir -p .cache/voices
if [ ! -f .cache/voices/de-thorsten-low.onnx ]; then
  # Stimmenmodell (nur Daten, kein ausführbarer Code) aus dem offiziellen Piper-Release
  curl -sL -o .cache/voices/voice.tar.gz https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-de-thorsten-low.tar.gz
  tar xzf .cache/voices/voice.tar.gz -C .cache/voices && rm .cache/voices/voice.tar.gz
fi
echo "Setup fertig: hyperframes $(npx hyperframes --version 2>/dev/null | tail -1), Stimme: .cache/voices/de-thorsten-low.onnx"
