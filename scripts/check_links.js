const fs = require('fs');
const path = require('path');

const publicDir = 'public';
const allHtml = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (f.endsWith('.html')) allHtml.push(full);
  }
}
walk(publicDir);

console.log('Total HTML files scanned:', allHtml.length);
const deadLinks = [];
let totalHrefs = 0;

allHtml.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const hrefs = content.match(/href=["']?([^"'>\s]+)["']?/gi) || [];
  hrefs.forEach(h => {
    let url = h.replace(/^href=["']?/i, '').replace(/["']$/, '');
    if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('javascript:')) return;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (!url.startsWith('https://jichangzhao.blog')) return;
      url = url.replace('https://jichangzhao.blog', '');
    }
    if (!url.startsWith('/')) return;
    totalHrefs++;
    
    // Clean query and hash
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (cleanUrl === '' || cleanUrl === '/') return;
    
    let targetPath = path.join('public', cleanUrl);
    if (cleanUrl.endsWith('/')) targetPath = path.join(targetPath, 'index.html');
    else if (!path.extname(cleanUrl)) {
      if (fs.existsSync(path.join(targetPath, 'index.html'))) return;
      if (fs.existsSync(targetPath + '.html')) return;
    }
    
    if (!fs.existsSync(targetPath)) {
      const alt = path.join(targetPath, 'index.html');
      if (!fs.existsSync(alt)) {
        deadLinks.push({ file: file.replace(/\\/g, '/'), link: url });
      }
    }
  });
});

console.log('Total internal hrefs checked:', totalHrefs);
console.log('Dead internal links count:', deadLinks.length);
if (deadLinks.length > 0) {
  console.log('All dead links:');
  const uniqueDead = {};
  deadLinks.forEach(d => {
    if (!uniqueDead[d.link]) uniqueDead[d.link] = [];
    uniqueDead[d.link].push(d.file);
  });
  for (const [lnk, files] of Object.entries(uniqueDead)) {
    console.log(`- ${lnk} (in ${files.length} pages: e.g. ${files[0]})`);
  }
}
