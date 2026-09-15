#!/usr/bin/env bash
# Скриншот собранного HTML на ширине телефона (412px), нарезанный кусками по 1400px — чтобы глазами проверить через Read.
# usage: phone_shots.sh html/lec01.html OUT_DIR [dark]
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../../../.." && pwd)
html=$(realpath "$1"); out=$2; mkdir -p "$out"
B=$(find ~/.cache/ms-playwright -type f -name chrome-headless-shell | head -1)
[ -n "$B" ] || { echo "нет chrome-headless-shell: npx playwright install chromium-headless-shell" >&2; exit 1; }

page=$html; prefix=light
if [ "${3:-}" = dark ]; then
  # headless не отдаёт prefers-color-scheme: dark — включаем тему атрибутом в копии
  prefix=dark; page=$out/_dark.html
  { echo '<script>document.documentElement.dataset.theme="dark"</script>'; cat "$html"; } > "$page"
fi

"$B" --no-sandbox --hide-scrollbars --force-device-scale-factor=1 --window-size=412,25000 \
  --screenshot="$out/_$prefix.png" "file://$page" 2>/dev/null

uv run --project "$ROOT" python - "$out/_$prefix.png" "$out/$prefix" <<'EOF'
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB"); w, h = im.size; px = im.load()
bg = px[2, h - 1]; end = h
for y in range(h - 1, 0, -10):  # обрезаем пустой хвост окна
    if any(px[x, y] != bg for x in range(0, w, 4)):
        end = y + 40; break
if end >= h - 50:
    print("WARNING: страница длиннее окна 25000px — увеличь --window-size", file=sys.stderr)
n = 0
for y in range(0, end, 1400):
    im.crop((0, y, w, min(y + 1400, end))).save(f"{sys.argv[2]}{n:02d}.png"); n += 1
print(f"{n} shots: {sys.argv[2]}00..{n - 1:02d}.png")
EOF
