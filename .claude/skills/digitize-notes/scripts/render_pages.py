# Рендер страниц PDF-скана в PNG, чтобы прочитать их через Read
# (Read без poppler PDF не открывает). Это только картинки — распознавание делаешь сам, глазами.
# usage: uv run render_pages.py "raw/лек 2 статрад.pdf" OUT_DIR [dpi=110]
import os
import sys

import pymupdf

src, out = sys.argv[1], sys.argv[2]
dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 110
os.makedirs(out, exist_ok=True)
doc = pymupdf.open(src)
for i, page in enumerate(doc, 1):
    page.get_pixmap(dpi=dpi).save(f"{out}/p{i:02d}.png")
print(f"{len(doc)} pages -> {out}")
