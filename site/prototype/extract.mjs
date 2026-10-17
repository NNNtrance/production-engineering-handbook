// Scratch: turn the handbook READMEs into the data shape the prototype reads.
// usage: node extract.mjs <repoRoot> <outFile>
import fs from 'node:fs';
import path from 'node:path';

const [root, out] = process.argv.slice(2);
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8').split(/\r?\n/);

const blurbs = {};
for (const l of readme) {
  const m = l.match(/[├└]── (\d\d-[a-z-]+)\/\s*# (.+)$/);
  if (m) blurbs[m[1]] = m[2].trim();
}

const start = readme.findIndex((l) => l.startsWith('## ⚡ Quick'));
const end = readme.findIndex((l, i) => i > start && l.startsWith('## '));
const books = [];
for (const l of readme.slice(start, end)) {
  let m = l.match(/^### \S+ \[(\d+)\. (.+?)\]/);
  if (m) { books.push({ n: +m[1], name: m[2], cases: [] }); continue; }
  m = l.match(/^\* \[\*\*(.+?)\*\*\]\(#(.+?)\)/);
  if (m) books.at(-1).cases.push({ slug: m[2], q: m[1] });
}

const dirs = fs.readdirSync(root).filter((d) => /^\d\d-/.test(d));
function sections(md) {
  const out = {};
  let cur = null;
  for (const l of md.split(/\r?\n/)) {
    const h = l.match(/^## \d+\. (.+)$/);
    if (h) { cur = h[1].replace(/ \(.*\)$/, ''); out[cur] = []; continue; }
    if (cur && l.trim() !== '---') out[cur].push(l);
  }
  for (const k in out) out[k] = out[k].join('\n').trim();
  return out;
}

for (const b of books) {
  const dir = dirs.find((d) => d.startsWith(String(b.n).padStart(2, '0') + '-'));
  b.dir = dir;
  b.blurb = blurbs[dir] || '';
  for (const c of b.cases) {
    const md = fs.readFileSync(path.join(root, dir, c.slug, 'README.md'), 'utf8');
    const s = sections(md);
    c.problem = s['Problem'] || '';
    c.naive = [];
    for (const l of (s['Why Naive Approaches Fail'] || '').split('\n')) {
      const t = l.match(/^\d+\. \*\*(.+?):?\*\*:?\s*(.*)$/);
      if (t) c.naive.push({ t: t[1].replace(/:$/, ''), n: t[2] ? [t[2]] : [] });
      else if (/^\s+\* /.test(l) && c.naive.length) c.naive.at(-1).n.push(l.replace(/^\s+\* /, ''));
    }
    c.arch = s['Architecture'] || '';
    c.verify = s['How to Verify'] || '';
    const src = (s['Implementation'] || '').match(/\(\.\/(src\/[^)]+)\)/);
    c.src = src ? src[1] : '';
  }
}

fs.writeFileSync(out, '// Generated from the handbook READMEs (prototype data).\nwindow.HANDBOOK = ' + JSON.stringify(books) + ';\n');
console.log(books.map((b) => `${b.n} ${b.name}: ${b.cases.length} cases, missing problem: ${b.cases.filter((c) => !c.problem || !c.arch || !c.naive.length).map((c) => c.slug).join(',') || 'none'}`).join('\n'));
