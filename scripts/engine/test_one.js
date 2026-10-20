const fs = require('fs');
const path = require('path');
const { buildSingleArticle } = require('./article_builder');

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '../articles_catalog.json'), 'utf8'));

// Test on one article: recommend/beginners/beginners-top-3-picks.md
const sample = catalog['recommend']['beginners'][0];
console.log('Testing on:', sample);

const md = buildSingleArticle('recommend', 'beginners', sample);
const hanziMatch = md.match(/[\u4e00-\u9fa5]/g);
const hanziCount = hanziMatch ? hanziMatch.length : 0;

console.log('Sample generated successfully!');
console.log('汉字字数 (Chinese words):', hanziCount);
console.log('总字符数 (Total chars):', md.length);
