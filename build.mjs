// Сборка в автономный HTML (формулы KaTeX пререндерены, SVG и шрифты встроены).
//   lectures/lecNN/lecNN.md                       -> html/lecNN.html    (одна лекция)
//   lectures/<серия>/index.md + <серия>/lecNN/lecNN.md -> html/<серия>.html (вся серия одной страницей с оглавлением)
// Запуск: node build.mjs [lectures/lec01/lec01.md | lectures/notes ...]  (без аргументов — всё)
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
h4{font-size:1em;margin:1.3em 0 .3em}
h2,h3,h4{scroll-margin-top:12px}
h1+p{color:var(--muted);margin-top:0}
a{color:var(--accent)}
hr{border:0;border-top:1px solid var(--rule);margin:2em 0}
ul,ol{padding-left:1.2em}
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
.toc{background:var(--card);border-radius:8px;padding:.8em 1em;margin:1.5em 0 2.5em}
.toc>h2{margin:0 0 .4em;border:0;padding:0;font-size:1.1em}
.toc ol{margin:0;padding-left:1.4em}
.toc ul{margin:.2em 0 .5em;padding-left:1.1em;font-size:.92em}
.toc li{margin:.25em 0}
.toc a{text-decoration:none}
.toc summary{cursor:pointer}
.lecture+.lecture{margin-top:3em}
.totop{position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));width:44px;height:44px;border-radius:22px;
  display:flex;align-items:center;justify-content:center;background:var(--card);color:var(--fg);border:1px solid var(--rule);
  text-decoration:none;font-size:20px;box-shadow:0 2px 8px rgb(0 0 0/.15)}
`;

// сколько раз каждый SVG уже встроен: при повторной вставке id внутри него нужно переименовать
const svgUses = new Map();

// marked для одного md: KaTeX, встраивание SVG относительно dir, id у заголовков (token.id)
function makeMarked(dir) {
  const marked = new Marked();
  // output: 'html' — без дублирующей MathML-разметки, иначе страница серии вдвое тяжелее
  marked.use(markedKatex({ throwOnError: true, nonStandard: true, output: 'html' }));
  marked.use({
    renderer: {
      heading(token) {
        const id = token.id ? ` id="${token.id}"` : '';
        return `<h${token.depth}${id}>${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
      },
      // картинка .svg -> встроенный <figure> (цвета берутся из темы)
      image({ href, text }) {
        if (!href.endsWith('.svg')) return false;
        const file = path.resolve(dir, href);
        // ключ — имя файла: один рисунок может лежать копиями в fig/ разных лекций серии
        const n = (svgUses.get(path.basename(file)) ?? 0) + 1;
        svgUses.set(path.basename(file), n);
        let svg = fs.readFileSync(file, 'utf8')
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/ color="[^"]*"/, '')
          .replace('<svg ', `<svg role="img" aria-label="${text}" `);
        if (n > 1) svg = svg.replace(/id="([^"]+)"/g, `id="$1-${n}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-${n})`);
        return `<figure>${svg}<figcaption>${text}</figcaption></figure>`;
      },
      // абзац из одной картинки не оборачиваем в <p>
      paragraph({ tokens }) {
        const html = this.parser.parseInline(tokens);
        return html.startsWith('<figure>') ? html + '\n' : `<p>${html}</p>\n`;
      },
    },
  });
  return marked;
}

function write(name, title, body) {
  const html = `<title>${title}</title>
<style>${katexCss()}${STYLE}</style>
<main>
${body}</main>
`;
  fs.mkdirSync('html', { recursive: true });
  const out = path.join('html', `${name}.html`);
  fs.writeFileSync(out, html);
  console.log(`${out}: ${(html.length / 1024).toFixed(0)} KB`);
}

function buildLecture(mdFile) {
  const md = fs.readFileSync(mdFile, 'utf8');
  const title = (md.match(/^## (.+)$/m) || md.match(/^# (.+)$/m))[1];
  write(path.basename(mdFile, '.md'), title, makeMarked(path.dirname(mdFile)).parse(md));
}

// серия: index.md (заголовок и вступление) + оглавление + все лекции подряд
function buildSeries(seriesDir) {
  const lectures = fs.readdirSync(seriesDir).sort()
    .map(d => path.join(seriesDir, d, `${d}.md`)).filter(f => fs.existsSync(f));
  const indexMd = fs.readFileSync(path.join(seriesDir, 'index.md'), 'utf8');
  const title = indexMd.match(/^# (.+)$/m)[1];

  let n = 0;
  const toc = [];
  const sections = lectures.map(file => {
    const marked = makeMarked(path.dirname(file));
    const tokens = marked.lexer(fs.readFileSync(file, 'utf8'));
    for (const t of tokens) {
      if (t.type !== 'heading' || t.depth > 3) continue;
      t.id = `h${++n}`;
      const item = { id: t.id, html: marked.parseInline(t.text), children: [] };
      if (t.depth === 2) toc.push(item);
      else toc.at(-1)?.children.push(item);
    }
    return `<section class="lecture">\n${marked.parser(tokens)}</section>\n`;
  });

  const link = i => `<a href="#${i.id}">${i.html}</a>`;
  const tocHtml = `<nav class="toc" id="toc"><h2>Оглавление</h2><ol>\n${toc.map(l => l.children.length
    ? `<li><details><summary>${link(l)}</summary><ul>${l.children.map(c => `<li>${link(c)}</li>`).join('')}</ul></details></li>`
    : `<li>${link(l)}</li>`).join('\n')}\n</ol></nav>\n`;

  const intro = makeMarked(seriesDir).parse(indexMd);
  write(path.basename(seriesDir), title,
    `${intro}${tocHtml}${sections.join('')}<a class="totop" href="#toc" aria-label="К оглавлению">☰</a>\n`);
}

function build(target) {
  if (fs.existsSync(path.join(target, 'index.md'))) buildSeries(target);
  else if (target.endsWith('.md')) buildLecture(target);
  else buildLecture(path.join(target, `${path.basename(target)}.md`));
}

const targets = process.argv.slice(2);
const all = () => fs.readdirSync('lectures').sort().map(d => path.join('lectures', d))
  .filter(d => fs.existsSync(path.join(d, 'index.md')) || fs.existsSync(path.join(d, `${path.basename(d)}.md`)));
for (const t of targets.length ? targets : all()) build(t);
