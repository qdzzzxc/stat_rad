#!/usr/bin/env bash
# Скриншоты собранного HTML на ширине телефона (412px), нарезанные кусками по 1400px — чтобы глазами проверить через Read.
# Длинные страницы (серия лекций) снимаются окнами по 10000px со сдвигом, куски нумеруются подряд.
# usage: phone_shots.sh html/lec01.html OUT_DIR [dark]
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../../../.." && pwd)
html=$(realpath "$1"); mkdir -p "$2"; out=$(realpath "$2")
B=$(find ~/.cache/ms-playwright -type f -name chrome-headless-shell | head -1)
[ -n "$B" ] || B=$(find ~/.cache/ms-playwright -type f -name chrome | head -1)
[ -n "$B" ] || { echo "нет Chromium: npx playwright install chromium" >&2; exit 1; }

prefix=light; theme=''
if [ "${3:-}" = dark ]; then
  # headless не отдаёт prefers-color-scheme: dark — включаем тему атрибутом в копии
  prefix=dark; theme='<script>document.documentElement.dataset.theme="dark"</script>'
fi

WIN=10000; off=0; n=0
while :; do
  page=$out/_$prefix.html
  # сдвиг окна: поднимаем содержимое на off пикселей
  { echo "$theme<style>main{margin-top:-${off}px!important}</style>"; cat "$html"; } > "$page"
  "$B" --headless=new --no-sandbox --hide-scrollbars --force-device-scale-factor=1 --window-size=412,$((WIN + 400)) \
    --screenshot="$out/_$prefix.png" "file://$page" 2>/dev/null
  res=$(uv run --project "$ROOT" python - "$out/_$prefix.png" "$out/$prefix" "$n" "$WIN" "$off" <<'EOF'
import sys
from PIL import Image
src, dst, n, win, off = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
im = Image.open(src).convert("RGB"); w, h = im.size; px = im.load()
top = 0 if off == 0 else 400          # при сдвиге верх окна перекрывает предыдущий кусок
bg = px[2, h - 1]; end = h
for y in range(h - 1, 0, -10):        # обрезаем пустой хвост
    if any(px[x, y] != bg for x in range(0, w - 70, 4)):  # правый край — плавающая кнопка
        end = y + 40; break
stop = min(end, top + win)
for y in range(top, stop, 1400):
    im.crop((0, y, w, min(y + 1400, stop))).save(f"{dst}{n:02d}.png"); n += 1
print(n, "more" if end > top + win else "done")
EOF
)
  n=${res% *}
  [ "${res#* }" = done ] && break
  off=$((off + WIN - 400))
done
rm -f "$out/_$prefix.html" "$out/_$prefix.png"
echo "$n shots: $out/${prefix}00..$(printf %02d $((n - 1))).png"
