const fs = require('fs');
const path = require('path');

function walk(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full, list);
    else if (file.endsWith('.html')) list.push(full);
  });
  return list;
}

const htmls = walk('public');

// Map of URL -> file path & file path -> URL
const urlToHtml = new Map();
const htmlToUrl = new Map();

htmls.forEach(f => {
  let rel = f.replace(/^public[\\\/]/, '').replace(/\\/g, '/');
  let urlPath = '/' + rel.replace(/index\.html$/, '');
  if (urlPath !== '/' && urlPath.endsWith('/')) {
    // normalized url
  }
  urlToHtml.set(urlPath, f);
  htmlToUrl.set(f, urlPath);
});

// Build Internal Link Graph for Depth & Orphan Page Detection
const linkGraph = new Map(); // fromUrl -> Set of toUrls
const incomingLinks = new Map(); // toUrl -> Set of fromUrls

htmls.forEach(f => {
  const fromUrl = htmlToUrl.get(f);
  if (!linkGraph.has(fromUrl)) linkGraph.set(fromUrl, new Set());
  
  const content = fs.readFileSync(f, 'utf8');
  const aRegex = /<a\s+[^>]*href=["']?([^"'\s>]+)["']?[^>]*>/gi;
  let m;
  while ((m = aRegex.exec(content)) !== null) {
    let href = m[1];
    if (href.startsWith('/') && !href.startsWith('//')) {
      // normalize internal link
      let target = href.split('#')[0].split('?')[0];
      if (!target.endsWith('/') && !path.extname(target)) target += '/';
      
      linkGraph.get(fromUrl).add(target);
      if (!incomingLinks.has(target)) incomingLinks.set(target, new Set());
      incomingLinks.get(target).add(fromUrl);
    }
  }
});

// Breadth-First Search (BFS) for Click Depth from '/'
const clickDepth = new Map();
const queue = ['/'];
clickDepth.set('/', 0);

while (queue.length > 0) {
  const curr = queue.shift();
  const d = clickDepth.get(curr);
  const neighbors = linkGraph.get(curr) || new Set();
  
  for (const n of neighbors) {
    if (!clickDepth.has(n) && urlToHtml.has(n)) {
      clickDepth.set(n, d + 1);
      queue.push(n);
    }
  }
}

// Depth statistics
let depthCounts = { d0: 0, d1: 0, d2: 0, d3: 0, d4plus: 0, unreachable: 0 };
let over3DepthUrls = [];
let orphanUrls = [];

for (const [url, f] of urlToHtml.entries()) {
  if (url.includes('/tags/') || url.includes('/categories/')) continue;
  const inc = incomingLinks.get(url) || new Set();
  if (inc.size === 0 && url !== '/') {
    orphanUrls.push(url);
  }
  
  if (!clickDepth.has(url)) {
    depthCounts.unreachable++;
  } else {
    const d = clickDepth.get(url);
    if (d === 0) depthCounts.d0++;
    else if (d === 1) depthCounts.d1++;
    else if (d === 2) depthCounts.d2++;
    else if (d === 3) depthCounts.d3++;
    else {
      depthCounts.d4plus++;
      over3DepthUrls.push({ url, depth: d });
    }
  }
}

console.log('=== CLICK DEPTH & INTERNAL GRAPH AUDIT ===');
console.log('Depth distribution (content & core pages):', depthCounts);
console.log('Depth > 3 count:', depthCounts.d4plus);
console.log('Orphan pages count (0 incoming links):', orphanUrls.length);
if (orphanUrls.length > 0) console.log('Orphan samples:', orphanUrls.slice(0, 5));

// Check Dates & Lastmod
let now = new Date('2026-10-20');
let over6Months = [];
let over12Months = [];

htmls.forEach(f => {
  if (f.includes('tags') || f.includes('categories') || f.includes('404.html')) return;
  const content = fs.readFileSync(f, 'utf8');
  const dateMatch = content.match(/最后更新：(\d{4}-\d{2}-\d{2})/) || content.match(/dateModified["']?:\s*["'](\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    const d = new Date(dateMatch[1]);
    const diffMonths = (now - d) / (1000 * 60 * 60 * 24 * 30);
    if (diffMonths > 12) over12Months.push({ file: f, date: dateMatch[1] });
    else if (diffMonths > 6) over6Months.push({ file: f, date: dateMatch[1] });
  }
});

console.log('\n=== CONTENT RECENCY AUDIT ===');
console.log('Pages > 6 months without update:', over6Months.length);
console.log('Pages > 12 months without update:', over12Months.length);

// Check Images width/height & lazy loading
let totalImages = 0;
let missingWidthHeight = 0;
let missingLazy = 0;

htmls.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const imgRegex = /<img\s+([^>]+)>/gi;
  let m;
  while ((m = imgRegex.exec(content)) !== null) {
    totalImages++;
    const tag = m[1];
    const hasWidth = /width=["']?\d+/i.test(tag);
    const hasHeight = /height=["']?\d+/i.test(tag);
    const hasLazy = /loading=["']?lazy/i.test(tag);
    
    if (!hasWidth || !hasHeight) missingWidthHeight++;
    if (!hasLazy) missingLazy++;
  }
});

console.log('\n=== IMAGE OPTIMIZATION AUDIT ===');
console.log('Total <img> tags:', totalImages);
console.log('Missing width/height attribute:', missingWidthHeight);
console.log('Missing loading="lazy":', missingLazy);

// Check CSS & JS bundles size
console.log('\n=== ASSET BUNDLE SIZES ===');
const cssDir = 'public/css';
if (fs.existsSync(cssDir)) {
  fs.readdirSync(cssDir).forEach(file => {
    const stat = fs.statSync(path.join(cssDir, file));
    console.log(`CSS: ${file.padEnd(20)}: ${(stat.size / 1024).toFixed(2)} KB`);
  });
}
const jsDir = 'public/pagefind';
if (fs.existsSync(jsDir)) {
  fs.readdirSync(jsDir).forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.css')) {
      const stat = fs.statSync(path.join(jsDir, file));
      console.log(`Pagefind: ${file.padEnd(20)}: ${(stat.size / 1024).toFixed(2)} KB`);
    }
  });
}
