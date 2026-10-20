const fs = require('fs');
const path = require('path');
const htmls = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (f.endsWith('.html')) htmls.push(full);
  }
}
walk('public');
const missing = [];
htmls.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const imgRegex = /<img\s+([^>]+)>/gi;
  let m;
  while ((m = imgRegex.exec(content)) !== null) {
    const tag = m[1];
    const hasWidth = /width=["']?\d+/i.test(tag);
    const hasHeight = /height=["']?\d+/i.test(tag);
    if (!hasWidth || !hasHeight) {
      missing.push({ file: f.replace(/\\/g, '/'), tag: m[0] });
    }
  }
});

console.log('Total missing width/height:', missing.length);
missing.slice(0, 10).forEach(x => console.log(x.file, ':', x.tag));
