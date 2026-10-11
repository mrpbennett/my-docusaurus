#!/usr/bin/env bash
# Regenerates the social card and icon set in static/img from the HTML
# sources next to this script, using headless Google Chrome.
#   ./scripts/images/build-images.sh
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../../static/img"
chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

render() { # <source.html> <size WxH> <output.png>
  "$chrome" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size="$2" \
    --screenshot="$3" "file://$here/$1" >/dev/null 2>&1
}

render og-card.html 1200,630 "$out/og-card.png"

# Headless Chrome won't lay out narrower than ~500px, so render the icon once
# at 512 and downscale with macOS sips.
render icon.html 512,512 "$out/icon-512.png"
resize() { sips -z "$1" "$1" "$out/icon-512.png" --out "$2" >/dev/null; }
resize 192 "$out/icon-192.png"
resize 180 "$out/apple-touch-icon.png"
resize 32 "$here/.favicon-32.png"
resize 16 "$here/.favicon-16.png"

# favicon.ico with PNG-encoded 16px and 32px entries
python3 -I - "$here/.favicon-16.png" "$here/.favicon-32.png" "$out/favicon.ico" <<'EOF'
import struct, sys
*pngs, dest = sys.argv[1:]
blobs = [open(p, "rb").read() for p in pngs]
sizes = [struct.unpack(">II", b[16:24])[0] for b in blobs]  # width from IHDR
header = struct.pack("<HHH", 0, 1, len(blobs))
offset = 6 + 16 * len(blobs)
entries = b""
for size, blob in zip(sizes, blobs):
    entries += struct.pack("<BBBBHHII", size % 256, size % 256, 0, 0, 1, 32, len(blob), offset)
    offset += len(blob)
open(dest, "wb").write(header + entries + b"".join(blobs))
EOF
rm -f "$here"/.favicon-*.png
echo "Wrote og-card.png, apple-touch-icon.png, icon-192.png, icon-512.png, favicon.ico to static/img"
