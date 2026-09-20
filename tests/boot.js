// Loads the real site files into a simulated browser, in the same order as index.html.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const ROOT = process.env.MQ_DIR || path.resolve(__dirname, '..');
module.exports = async function boot(storage) {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const dom = new JSDOM(html, { url: 'https://fadl462.github.io/MindQuest-Arcade/index.html', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window; const errs = [];
  w.scrollTo = () => {};
  w.addEventListener('error', (e) => errs.push(e.message));
  if (storage) for (const [k, v] of Object.entries(storage)) w.localStorage.setItem(k, v);
  const scripts = [...html.matchAll(/<script src="([^"?]+)/g)].map((m) => m[1]);
  const inlines = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const run = (src, name) => { try { w.eval(src); } catch (e) { errs.push(name + ': ' + e.message); } };
  run(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8'), 'app.js');
  run(inlines[0], 'inline0');
  for (const s of scripts.filter((s) => s !== 'app.js')) run(fs.readFileSync(path.join(ROOT, s), 'utf8'), s);
  run(inlines[1], 'inline1');
  w.__errs = errs;
  return w;
};
