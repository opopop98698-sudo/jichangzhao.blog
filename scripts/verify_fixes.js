const fs = require('fs');

console.log('=== ROBOTS.TXT ===');
if (fs.existsSync('public/robots.txt')) {
  console.log(fs.readFileSync('public/robots.txt', 'utf8'));
} else {
  console.log('Missing robots.txt!');
}

console.log('=== SITEMAP.XML ===');
if (fs.existsSync('public/sitemap.xml')) {
  const sm = fs.readFileSync('public/sitemap.xml', 'utf8');
  const urlCount = (sm.match(/<loc>/g) || []).length;
  console.log('Total URLs in sitemap.xml:', urlCount);
  console.log('Has 404 in sitemap?', sm.includes('404'));
  console.log('Has search in sitemap?', sm.includes('/search'));
  console.log('Has tags in sitemap?', sm.includes('/tags/'));
  const locs = sm.match(/<loc>[^<]+<\/loc>/g) || [];
  console.log('Sample URLs (first 5):');
  console.log(locs.slice(0, 5).join('\n'));
} else {
  console.log('Missing sitemap.xml!');
}

console.log('=== 404.HTML ===');
if (fs.existsSync('public/404.html')) {
  const h404 = fs.readFileSync('public/404.html', 'utf8');
  console.log('Canonical in 404?', h404.includes('canonical'));
  console.log('Noindex in 404?', h404.includes('noindex'));
}

console.log('=== TAXONOMY / TAGS ===');
console.log('public/tags exists?', fs.existsSync('public/tags'));

console.log('=== METHODOLOGY & TERMS PAGES ===');
console.log('public/methodology/index.html exists?', fs.existsSync('public/methodology/index.html'));
console.log('public/terms/index.html exists?', fs.existsSync('public/terms/index.html'));

console.log('=== SAMPLE ARTICLE EEAT & SCHEMA ===');
const sampleArt = 'public/cheap/under-20/best-value-under-20-yuan/index.html';
console.log('Sample Article HTML:', sampleArt);
if (fs.existsSync(sampleArt)) {
  const art = fs.readFileSync(sampleArt, 'utf8');
  console.log('Article Schema present?', art.includes('"@type": "Article"') || art.includes('"@type":"Article"'));
  console.log('BreadcrumbList present?', art.includes('"@type": "BreadcrumbList"') || art.includes('"@type":"BreadcrumbList"'));
  console.log('Author byline present?', art.includes('机场找技术团队'));
  console.log('Author Bio box present?', art.includes('author-bio-box'));
  console.log('Rel sponsored in affiliate links?', art.includes('rel="nofollow sponsored noopener"') || art.includes('rel="noopener sponsored nofollow"') || art.includes('rel="nofollow noopener sponsored"'));
  console.log('Has author link to /about/#author?', art.includes('/about/#author'));
  console.log('Has methodology link to /methodology/?', art.includes('/methodology/'));
} else {
  console.log('File does not exist:', sampleArt);
}

console.log('=== FOOTER METHODOLOGY & TERMS LINKS ===');
const indexHtml = fs.readFileSync('public/index.html', 'utf8');
console.log('Footer has /methodology/?', indexHtml.includes('/methodology/'));
console.log('Footer has /terms/?', indexHtml.includes('/terms/'));

console.log('=== STRUCTURED DATA JSON-LD VALIDATION ===');
const pagesToCheck = [
  'public/index.html',
  'public/search/index.html',
  'public/about/index.html',
  'public/methodology/index.html',
  'public/cheap/index.html',
  'public/cheap/under-20/best-value-under-20-yuan/index.html'
];

pagesToCheck.forEach(p => {
  if (fs.existsSync(p)) {
    const html = fs.readFileSync(p, 'utf8');
    const regex = /<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    console.log(`Checking ${p}:`);
    let count = 0;
    while ((match = regex.exec(html)) !== null) {
      count++;
      try {
        const parsed = JSON.parse(match[1]);
        const type = parsed['@type'] || (parsed['@graph'] ? parsed['@graph'].map(g => g['@type']) : 'Unknown');
        console.log(`  Schema #${count}: Type = ${JSON.stringify(type)}`);
        if (match[1].includes('0001-01-01')) {
          console.log(`  ERROR: 0001-01-01 invalid date detected in ${p}`);
        }
      } catch (e) {
        console.log(`  JSON Parse Error in #${count}:`, e.message);
      }
    }
    if (count === 0) console.log('  No LD+JSON found!');
  } else {
    console.log(`Page not found: ${p}`);
  }
});
