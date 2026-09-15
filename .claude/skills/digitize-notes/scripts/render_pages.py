# Рендер страниц PDF-скана в PNG, чтобы прочитать их через Read
# (Read без poppler PDF не открывает). Это только картинки — распознавание делаешь сам, глазами.
# usage: uv run render_pages.py "raw/лек 2 статрад.pdf" OUT_DIR [dpi=110] [--halves]
#   --halves: каждая страница двумя половинами pNNNa/pNNNb с перекрытием 4% — для мелкого почерка (dpi 200)
import os
import sys

import pymupdf

args = [a for a in sys.argv[1:] if a != "--halves"]
halves = "--halves" in sys.argv
src, out = args[0], args[1]
dpi = int(args[2]) if len(args) > 2 else (200 if halves else 110)
os.makedirs(out, exist_ok=True)
doc = pymupdf.open(src)
for i, page in enumerate(doc, 1):
    if not halves:
        page.get_pixmap(dpi=dpi).save(f"{out}/p{i:02d}.png")
        continue
    W, H = page.rect.width, page.rect.height
    for suf, (a, b) in (("a", (0, 0.52)), ("b", (0.48, 1.0))):
        page.get_pixmap(dpi=dpi, clip=pymupdf.Rect(0, H * a, W, H * b)).save(f"{out}/p{i:03d}{suf}.png")
print(f"{len(doc)} pages -> {out}")
