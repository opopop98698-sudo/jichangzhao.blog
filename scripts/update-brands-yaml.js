const fs = require('fs');
const path = require('path');
const combined = require('./combined-brands-data.json');

const brandsYamlPath = path.join(__dirname, '../data/brands.yaml');
let yamlContent = '# data/brands.yaml - Enriched with 2026 real test data & images\n';

for (const [id, b] of Object.entries(combined)) {
  const y = b.yaml;
  const isPrimary = y.isPrimary ? 'true' : 'false';
  const lineTypes = Array.isArray(y.lineType) ? y.lineType : [y.lineType];
  const protos = Array.isArray(y.protocols) ? y.protocols : [y.protocols];
  const highlights = Array.isArray(y.highlights) ? y.highlights : [y.highlights];

  yamlContent += `- id: ${id}\n`;
  yamlContent += `  name: ${y.name}\n`;
  yamlContent += `  rank: ${y.rank}\n`;
  if (y.isPrimary) {
    yamlContent += `  isPrimary: true\n`;
  }
  yamlContent += `  registerUrl: "${y.registerUrl}"\n`;
  if (y.promoCode) {
    yamlContent += `  promoCode: "${y.promoCode}"\n`;
  }
  if (y.since) {
    yamlContent += `  since: "${y.since}"\n`;
  }
  yamlContent += `  lineType: [${lineTypes.map(s => `"${s}"`).join(', ')}]\n`;
  yamlContent += `  protocols: [${protos.map(s => `"${s}"`).join(', ')}]\n`;
  yamlContent += `  priceFrom: "${y.priceFrom}"\n`;
  yamlContent += `  highlights: [${highlights.map(s => `"${s}"`).join(', ')}]\n`;
  yamlContent += `  dataStatus: "${b.images ? 'measured' : y.dataStatus}"\n`;
  if (b.images && b.images.speedtest) {
    yamlContent += `  speedtestImage: "${b.images.speedtest}"\n`;
  }
  if (b.speedtests && b.speedtests.length > 0) {
    yamlContent += `  avgLatency: "${b.speedtests[0].latency}"\n`;
    yamlContent += `  topSpeed: "${b.speedtests[0].download}"\n`;
  }
  yamlContent += `\n`;
}

fs.writeFileSync(brandsYamlPath, yamlContent, 'utf8');
console.log('Successfully updated data/brands.yaml with enriched data and test images!');
