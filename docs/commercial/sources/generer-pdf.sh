#!/usr/bin/env bash
# Génère les PDF des plaquettes à partir des sources HTML (Chromium sans interface).
set -euo pipefail
ici="$(cd "$(dirname "$0")" && pwd)"
chrome="${CHROME:-$(command -v chromium || command -v google-chrome || echo /opt/pw-browsers/chromium-1194/chrome-linux/chrome)}"
for f in plaquette-generale plaquette-vendeurs-loueurs grille-tarifaire; do
  "$chrome" --headless=new --no-sandbox --disable-gpu --no-pdf-header-footer \
    --virtual-time-budget=8000 --print-to-pdf="$ici/../$f.pdf" "file://$ici/$f.html"
done
