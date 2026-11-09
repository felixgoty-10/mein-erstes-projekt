#!/usr/bin/env bash
# Einmalige Einrichtung pro Sitzung: Node-Pakete, Piper-TTS, deutsche Stimme.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d node_modules/hyperframes ] || npm install --no-audit --no-fund
python3 -c "import piper, pyworld" 2>/dev/null || pip install -q piper-tts numpy pyworld
mkdir -p .cache/voices
if [ ! -f .cache/voices/de-thorsten-low.onnx ]; then
  # Stimmenmodell (nur Daten, kein ausführbarer Code) aus dem offiziellen Piper-Release
  curl -sL -o .cache/voices/voice.tar.gz https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-de-thorsten-low.tar.gz
  tar xzf .cache/voices/voice.tar.gz -C .cache/voices && rm .cache/voices/voice.tar.gz
fi
mkdir -p .cache/sherpa
for m in vits-piper-de_DE-thorsten-high vits-piper-de_DE-thorsten_emotional-medium; do
  if [ ! -d .cache/sherpa/$m ]; then
    # Hochwertige Piper-Stimmen (Modelldaten) aus dem sherpa-onnx-Release auf GitHub
    curl -sL -o .cache/sherpa/$m.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/$m.tar.bz2
    tar xjf .cache/sherpa/$m.tar.bz2 -C .cache/sherpa && rm .cache/sherpa/$m.tar.bz2
  fi
done
echo "Setup fertig: hyperframes $(npx hyperframes --version 2>/dev/null | tail -1), Stimme: .cache/voices/de-thorsten-low.onnx"
