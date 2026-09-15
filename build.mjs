// Сборка: lectures/lecNN/lecNN.md -> html/lecNN.html (формулы KaTeX пререндерены, SVG и шрифты встроены — файл автономный)
// Запуск: node build.mjs [lectures/lec01/lec01.md ...]  (без аргументов — все лекции)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { Marked } from 'marked';
import markedKatex from 'marked-katex-extension';

const require = createRequire(import.meta.url);
const katexDir = path.dirname(require.resolve('katex/package.json'));

// katex.min.css со шрифтами woff2, встроенными как data: URI
function katexCss() {
  const css = fs.readFileSync(path.join(katexDir, 'dist/katex.min.css'), 'utf8');
  return css
    .replace(/,url\(fonts\/[^)]+\.woff\)[^,;}]*|,url\(fonts\/[^)]+\.ttf\)[^,;}]*/g, '')
    .replace(/url\((fonts\/[^)]+\.woff2)\)/g, (_, f) =>
      `url(data:font/woff2;base64,${fs.readFileSync(path.join(katexDir, 'dist', f)).toString('base64')})`);
}

const STYLE = `
:root{--bg:#fbfaf7;--fg:#1f2937;--muted:#6b7280;--rule:#e5e2da;--accent:#2b59c3;--card:#f3f1ec}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#15171b;--fg:#e5e7eb;--muted:#9ca3af;--rule:#2d3139;--accent:#7aa2ff;--card:#1d2026}}
:root[data-theme="dark"]{--bg:#15171b;--fg:#e5e7eb;--muted:#9ca3af;--rule:#2d3139;--accent:#7aa2ff;--card:#1d2026}
body{background:var(--bg);color:var(--fg);font:17px/1.6 Georgia,"PT Serif","Times New Roman",serif;padding-inline:16px;padding-block:24px 64px}
main{max-width:720px;margin:0 auto}
h1{font-size:1.35em;line-height:1.3;margin:0 0 .3em}
h2{font-size:1.25em;margin:2em 0 .6em;padding-bottom:.25em;border-bottom:1px solid var(--rule)}
h3{font-size:1.05em;margin:1.6em 0 .4em}
h1+p{color:var(--muted);margin-top:0}
hr{border:0;border-top:1px solid var(--rule);margin:2em 0}
ul{padding-left:1.2em}
blockquote{margin:1em 0;padding:.6em .9em;background:var(--card);border-left:3px solid var(--accent);border-radius:4px}
blockquote p{margin:0}
.katex-display{overflow-x:auto;overflow-y:hidden;padding:.3em 0;margin:.8em 0}
.katex{font-size:1.08em}
@media (max-width:480px){.katex-display>.katex{font-size:.98em}}
figure{margin:1.2em 0;text-align:center}
figure svg{width:100%;max-width:420px;height:auto;color:var(--fg)}
figure svg .acc{stroke:var(--accent)}
figure svg .accf{fill:var(--accent)}
figcaption{font-size:.85em;color:var(--muted);margin-top:.3em}
`;

function build(mdFile) {
  const dir = path.dirname(path.resolve(mdFile));
  const marked = new Marked();
  marked.use(markedKatex({ throwOnError: true, nonStandard: true }));
  marked.use({
    renderer: {
      // картинка .svg -> встроенный <figure> (цвета берутся из темы)
      image({ href, text }) {
        if (!href.endsWith('.svg')) return false;
        const svg = fs.readFileSync(path.join(dir, href), 'utf8')
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/ color="[^"]*"/, '')
          .replace('<svg ', `<svg role="img" aria-label="${text}" `);
        return `<figure>${svg}<figcaption>${text}</figcaption></figure>`;
      },
      // абзац из одной картинки не оборачиваем в <p>
      paragraph({ tokens }) {
        const html = this.parser.parseInline(tokens);
        return html.startsWith('<figure>') ? html + '\n' : `<p>${html}</p>\n`;
      },
    },
  });

  const md = fs.readFileSync(mdFile, 'utf8');
  const title = (md.match(/^## (.+)$/m) || md.match(/^# (.+)$/m))[1];
  const html = `<title>${title}</title>
<style>${katexCss()}${STYLE}</style>
<main>
${marked.parse(md)}</main>
`;
  fs.mkdirSync('html', { recursive: true });
  const out = path.join('html', path.basename(mdFile).replace(/\.md$/, '.html'));
  fs.writeFileSync(out, html);
  console.log(`${out}: ${(html.length / 1024).toFixed(0)} KB`);
}

const files = process.argv.slice(2);
const all = () => fs.readdirSync('lectures').sort()
  .map(d => path.join('lectures', d, `${d}.md`)).filter(f => fs.existsSync(f));
for (const f of files.length ? files : all()) build(f);
