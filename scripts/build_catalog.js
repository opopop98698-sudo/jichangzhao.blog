const fs = require('fs');
const path = require('path');

const sections = ['recommend', 'finder', 'cheap', 'free', 'scenarios', 'compare', 'brands', 'guides'];
const catalog = {};

sections.forEach(sec => {
  catalog[sec] = {};
  const secDir = path.join('content', sec);
  if (!fs.existsSync(secDir)) return;
  const subdirs = fs.readdirSync(secDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  
  subdirs.forEach(sub => {
    const subDir = path.join(secDir, sub);
    const files = fs.readdirSync(subDir).filter(f => f.endsWith('.md') && f !== '_index.md');
    catalog[sec][sub] = [];
    
    files.forEach(f => {
      const fullPath = path.join(subDir, f);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      let title = '';
      let desc = '';
      for (const line of lines) {
        if (!title && line.startsWith('title:')) {
          title = line.replace('title:', '').trim().replace(/^["']|["']$/g, '');
        }
        if (!desc && line.startsWith('description:')) {
          desc = line.replace('description:', '').trim().replace(/^["']|["']$/g, '');
        }
        if (title && desc) break;
      }
      const slug = f.replace('.md', '');
      catalog[sec][sub].push({
        file: f,
        slug: slug,
        url: `/${sec}/${sub}/${slug}/`,
        title: title || slug,
        desc: desc || ''
      });
    });
  });
});

fs.writeFileSync('scripts/articles_catalog.json', JSON.stringify(catalog, null, 2), 'utf8');
console.log('Catalog generated successfully. Total sections:', Object.keys(catalog).length);
let totalArticles = 0;
for (const s of Object.keys(catalog)) {
  for (const sub of Object.keys(catalog[s])) {
    totalArticles += catalog[s][sub].length;
  }
}
console.log('Total articles cataloged:', totalArticles);
