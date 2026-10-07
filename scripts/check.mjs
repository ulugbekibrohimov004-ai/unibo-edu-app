// Statik sahifa uchun tezkor tekshiruv: node scripts/check.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const errors = [];
const fail = (m) => errors.push(m);

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

// 1) Inline skriptlar sintaksisi
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (!scripts.length) fail("inline <script> topilmadi");
scripts.forEach((code, i) => { try { new vm.Script(code, { filename: `inline-${i}.js` }); } catch (e) { fail(`skript #${i}: ${e.message}`); } });

// 2) CATALOG JSON
const cat = html.match(/const CATALOG = (\{[\s\S]*?\});\n/);
let catalog = null;
if (!cat) fail("CATALOG topilmadi"); else { try { catalog = JSON.parse(cat[1]); } catch (e) { fail("CATALOG JSON noto'g'ri: " + e.message); } }

// 3) Havola qilingan fayllar mavjudmi
const refs = new Set();
for (const m of html.matchAll(/(?:src|href)="((?:assets|fonts|videos)\/[^"$]+)"/g)) refs.add(m[1]);
for (const m of html.matchAll(/url\(((?:assets|fonts|videos)\/[^)]+)\)/g)) refs.add(m[1]);
for (const m of JSON.stringify(catalog || {}).matchAll(/"((?:assets|fonts|videos)\/[^"]+)"/g)) refs.add(m[1]);
for (const r of refs) if (!fs.existsSync(path.join(root, r))) fail(`fayl yo'q: ${r}`);

// 4) Videolar: faststart (moov mdat'dan oldin) va hajm
const MAX_MB = 25;
for (const f of fs.readdirSync(path.join(root, "videos")).filter((f) => f.endsWith(".mp4"))) {
  const file = path.join(root, "videos", f);
  const size = fs.statSync(file).size;
  if (size > MAX_MB * 1024 * 1024) fail(`${f}: ${(size / 1048576).toFixed(1)} MB > ${MAX_MB} MB`);
  const fd = fs.openSync(file, "r"), buf = Buffer.alloc(Math.min(size, 1 << 20));
  fs.readSync(fd, buf, 0, buf.length, 0); fs.closeSync(fd);
  const moov = buf.indexOf("moov"), mdat = buf.indexOf("mdat");
  if (moov < 0 || (mdat >= 0 && moov > mdat)) fail(`${f}: faststart yo'q (ffmpeg -movflags +faststart)`);
}

// 5) Rasm hajmi
for (const f of fs.readdirSync(path.join(root, "assets"))) {
  const size = fs.statSync(path.join(root, "assets", f)).size;
  if (size > 300 * 1024) fail(`assets/${f}: ${(size / 1024).toFixed(0)} KB > 300 KB`);
}

if (errors.length) { console.error("XATOLAR:\n- " + errors.join("\n- ")); process.exit(1); }
console.log(`OK: ${scripts.length} skript, ${refs.size} havola tekshirildi`);
