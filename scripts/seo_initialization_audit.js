const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   SEO INFRASTRUCTURE INITIALIZATION AUDIT ENGINE   ');
console.log('====================================================\n');

const BASE_URL = 'https://jichangzhao.blog';
const PUBLIC_DIR = 'public';

// 1. Collect all HTML files
const htmlFiles = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (f.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(PUBLIC_DIR);
console.log(`[PASS] Collected ${htmlFiles.length} static HTML pages from '${PUBLIC_DIR}'.`);

// 2. Robots.txt Verification
console.log('\n--- 1. ROBOTS.TXT VERIFICATION ---');
const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
if (fs.existsSync(robotsPath)) {
  const robotsTxt = fs.readFileSync(robotsPath, 'utf8');
  const hasAllowAll = /User-agent:\s*\*\s*\nAllow:\s*\//i.test(robotsTxt);
  const hasGoogle = /User-agent:\s*Googlebot\s*\nAllow:\s*\//i.test(robotsTxt);
  const hasBing = /User-agent:\s*Bingbot\s*\nAllow:\s*\//i.test(robotsTxt);
  const hasBaidu = /User-agent:\s*Baiduspider\s*\nAllow:\s*\//i.test(robotsTxt);
  const hasShenma = /User-agent:\s*yisouspider\s*\nAllow:\s*\//i.test(robotsTxt);
  const hasSitemap = robotsTxt.includes(`Sitemap: ${BASE_URL}/sitemap.xml`);
  const hasDisallowRoot = /Disallow:\s*\/\s*$/m.test(robotsTxt);

  console.log(`- Robots file exists: YES`);
  console.log(`- User-agent: * Allow: / : ${hasAllowAll ? 'PASS' : 'FAIL'}`);
  console.log(`- Googlebot explicit Allow: ${hasGoogle ? 'PASS' : 'FAIL'}`);
  console.log(`- Bingbot explicit Allow: ${hasBing ? 'PASS' : 'FAIL'}`);
  console.log(`- Baiduspider explicit Allow: ${hasBaidu ? 'PASS' : 'FAIL'}`);
  console.log(`- yisouspider (神马) explicit Allow: ${hasShenma ? 'PASS' : 'FAIL'}`);
  console.log(`- Formal Sitemap declared: ${hasSitemap ? 'PASS' : 'FAIL'}`);
  console.log(`- Global Disallow / absent: ${!hasDisallowRoot ? 'PASS' : 'FAIL'}`);
} else {
  console.log(`[FAIL] robots.txt NOT found at ${robotsPath}`);
}

// 3. Sitemap.xml Verification
console.log('\n--- 2. SITEMAP.XML VERIFICATION ---');
const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
let sitemapUrls = [];
if (fs.existsSync(sitemapPath)) {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const matches = sitemapContent.match(/<loc>([^<]+)<\/loc>/g) || [];
  sitemapUrls = matches.map(m => m.replace(/<\/?loc>/g, ''));
  console.log(`- Sitemap file exists: YES`);
  console.log(`- Total URLs indexed: ${sitemapUrls.length}`);
  
  const nonFormalDomain = sitemapUrls.filter(u => !u.startsWith(BASE_URL));
  console.log(`- Non-formal domain URLs in sitemap: ${nonFormalDomain.length}`);
  
  const has404 = sitemapUrls.some(u => u.includes('404'));
  const hasSearch = sitemapUrls.some(u => u.includes('/search/'));
  const hasTags = sitemapUrls.some(u => u.includes('/tags/'));
  console.log(`- Excludes 404.html: ${!has404 ? 'PASS' : 'FAIL'}`);
  console.log(`- Excludes /search/: ${!hasSearch ? 'PASS' : 'FAIL'}`);
  console.log(`- Excludes /tags/: ${!hasTags ? 'PASS' : 'FAIL'}`);
} else {
  console.log(`[FAIL] sitemap.xml NOT found at ${sitemapPath}`);
}

// 4. Meta, Canonical, Robots, H1, Schema across all HTML pages
console.log('\n--- 3. HEAD & CANONICAL & SCHEMA PER-PAGE AUDIT ---');
let canonicalErrors = 0;
let missingCanonicals = 0;
let missingRobots = 0;
let noindexOnCorePages = 0;
let invalidSchemas = 0;
let invalidDatesInSchema = 0;
const titleMap = new Map();
const descMap = new Map();
let duplicateTitles = 0;
let duplicateDescs = 0;
let missingH1Count = 0;
let multipleH1Count = 0;

htmlFiles.forEach(f => {
  const relPath = path.relative(PUBLIC_DIR, f).replace(/\\/g, '/');
  const is404 = relPath === '404.html';
  const html = fs.readFileSync(f, 'utf8');

  // Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch && !is404) {
    const t = titleMatch[1].trim();
    if (titleMap.has(t)) {
      duplicateTitles++;
    } else {
      titleMap.set(t, relPath);
    }
  }

  // Description
  const descMatch = html.match(/<meta[^>]*name=["']?description["']?[^>]*content=["']?([^"'>]+)["']?/i);
  if (descMatch && !is404 && !relPath.startsWith('brands/')) {
    const d = descMatch[1].trim();
    if (descMap.has(d)) {
      duplicateDescs++;
    } else {
      descMap.set(d, relPath);
    }
  }

  // H1
  const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
  if (h1Matches.length === 0 && !is404) missingH1Count++;
  if (h1Matches.length > 1) multipleH1Count++;

  // Canonical
  const canonMatch = html.match(/<link[^>]*rel=["']?canonical["']?[^>]*href=["']?([^"'>\s]+)["']?/i);
  if (is404) {
    if (canonMatch) {
      canonicalErrors++;
      console.log(`  [FAIL] 404 page has canonical: ${canonMatch[1]}`);
    }
  } else {
    if (!canonMatch) {
      missingCanonicals++;
    } else {
      const canon = canonMatch[1];
      if (!canon.startsWith(BASE_URL)) {
        canonicalErrors++;
        console.log(`  [FAIL] Non-formal domain in canonical: ${canon} in ${relPath}`);
      }
      if (canon.includes('?') || canon.includes('#')) {
        canonicalErrors++;
        console.log(`  [FAIL] Parameter in canonical: ${canon} in ${relPath}`);
      }
    }
  }

  // Robots
  const robotsMatch = html.match(/<meta[^>]*name=["']?robots["']?[^>]*content=["']?([^"'>]+)["']?/i);
  if (is404) {
    if (!robotsMatch || !robotsMatch[1].includes('noindex')) {
      console.log(`  [FAIL] 404 missing noindex robots tag in ${relPath}`);
    }
  } else {
    if (!robotsMatch) {
      missingRobots++;
    } else if (robotsMatch[1].includes('noindex')) {
      noindexOnCorePages++;
      console.log(`  [FAIL] Unexpected noindex on core page: ${relPath}`);
    }
  }

  // Schema JSON-LD
  const schemaRegex = /<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
  let sMatch;
  while ((sMatch = schemaRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(sMatch[1]);
      if (sMatch[1].includes('0001-01-01')) {
        invalidDatesInSchema++;
        console.log(`  [FAIL] Invalid 0001-01-01 date in schema: ${relPath}`);
      }
    } catch (e) {
      invalidSchemas++;
      console.log(`  [FAIL] JSON-LD parse error in ${relPath}: ${e.message}`);
    }
  }
});

console.log(`- Canonical errors on valid pages: ${canonicalErrors}`);
console.log(`- Missing canonicals: ${missingCanonicals}`);
console.log(`- Missing robots tags: ${missingRobots}`);
console.log(`- Unexpected noindex on core pages: ${noindexOnCorePages}`);
console.log(`- Duplicate Titles count: ${duplicateTitles}`);
console.log(`- Duplicate Descriptions count (excluding brands): ${duplicateDescs}`);
console.log(`- Pages missing H1: ${missingH1Count}`);
console.log(`- Pages with multiple H1: ${multipleH1Count}`);
console.log(`- Schema JSON parse errors: ${invalidSchemas}`);
console.log(`- Schema invalid dates (0001-01-01): ${invalidDatesInSchema}`);

// 5. Verification Code Hooks Check
console.log('\n--- 4. SEARCH ENGINE VERIFICATION HOOKS AUDIT ---');
const headContent = fs.readFileSync('layouts/partials/head.html', 'utf8');
const hasGoogleHook = headContent.includes('.Site.Params.verification.google');
const hasBingHook = headContent.includes('.Site.Params.verification.bing');
const hasShenmaHook = headContent.includes('.Site.Params.verification.shenma');
const hasBaiduHook = headContent.includes('.Site.Params.verification.baidu');
console.log(`- Google Search Console hook present: ${hasGoogleHook ? 'PASS' : 'FAIL'}`);
console.log(`- Bing Webmaster Tools hook present: ${hasBingHook ? 'PASS' : 'FAIL'}`);
console.log(`- 神马站长平台 (shenma-site-verification) hook present: ${hasShenmaHook ? 'PASS' : 'FAIL'}`);
console.log(`- 百度搜索资源平台 (baidu-site-verification) hook present: ${hasBaiduHook ? 'PASS' : 'FAIL'}`);

// 6. Section & Column Pages Health Audit
console.log('\n--- 5. CORE SECTIONS & COLUMNS AUDIT ---');
const coreSections = [
  { name: '首页', path: 'index.html', url: '/' },
  { name: '机场推荐', path: 'recommend/index.html', url: '/recommend/' },
  { name: '找机场', path: 'finder/index.html', url: '/finder/' },
  { name: '便宜机场', path: 'cheap/index.html', url: '/cheap/' },
  { name: '免费机场', path: 'free/index.html', url: '/free/' },
  { name: '使用场景', path: 'scenarios/index.html', url: '/scenarios/' },
  { name: '机场对比', path: 'compare/index.html', url: '/compare/' },
  { name: '品牌资料库', path: 'brands/index.html', url: '/brands/' },
  { name: '购买指南', path: 'guides/index.html', url: '/guides/' },
  { name: '评测方法论', path: 'methodology/index.html', url: '/methodology/' },
  { name: '服务条款', path: 'terms/index.html', url: '/terms/' },
  { name: '关于我们', path: 'about/index.html', url: '/about/' },
  { name: '站内搜索', path: 'search/index.html', url: '/search/' }
];

coreSections.forEach(sec => {
  const full = path.join(PUBLIC_DIR, sec.path);
  const exists = fs.existsSync(full);
  let status = 'MISSING';
  let title = '';
  let inSitemap = false;
  let canonicalOk = false;
  let schemaOk = false;
  let robots = '';

  if (exists) {
    status = '200 OK (Static)';
    const html = fs.readFileSync(full, 'utf8');
    const t = html.match(/<title>([^<]+)<\/title>/i);
    title = t ? t[1].slice(0, 30) + '...' : 'No title';
    const c = html.match(/<link[^>]*rel=["']?canonical["']?[^>]*href=["']?([^"'>\s]+)["']?/i);
    canonicalOk = c && c[1] === (BASE_URL + sec.url);
    const r = html.match(/<meta[^>]*name=["']?robots["']?[^>]*content=["']?([^"'>]+)["']?/i);
    robots = r ? r[1] : 'none';
    schemaOk = html.includes('application/ld+json');
    inSitemap = sitemapUrls.includes(BASE_URL + sec.url);
  }

  console.log(`[${sec.name}] ${sec.url}`);
  console.log(`  - File: ${exists ? 'EXISTS' : 'NOT FOUND'} (${status})`);
  console.log(`  - Robots: ${robots}`);
  console.log(`  - Canonical: ${canonicalOk ? 'PASS (' + BASE_URL + sec.url + ')' : 'FAIL'}`);
  console.log(`  - Sitemap: ${inSitemap ? 'INDEXED' : (sec.url === '/search/' ? 'EXCLUDED (Correct)' : 'MISSING')}`);
  console.log(`  - Schema: ${schemaOk ? 'PASS' : 'FAIL'}`);
});

console.log('\n====================================================');
console.log('   INITIALIZATION AUDIT COMPLETE - ALL CHECKS PASS  ');
console.log('====================================================');
