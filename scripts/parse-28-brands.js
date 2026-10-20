const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync('C:\\Users\\Pro User\\Desktop\\机场品牌信息\\28个机场品牌清单.txt', 'utf8');

// The file divides brands by lines like '## 1. 光速云', '主推## 1. 光速云', '## 2. 飞猫云（feimao）', etc.
const sections = raw.split(/\n(?=(?:主推)?##\s+\d+\.)/);

console.log('Found sections count:', sections.length);

const parsedBrands = [];

for (const sec of sections) {
  if (!sec.includes('##')) continue;
  const headerMatch = sec.match(/(?:主推)?##\s+(\d+)\.\s+([^\n（(]+)(?:[（(]([a-zA-Z0-9_-]+)[）)])?/);
  if (!headerMatch) continue;
  const rank = parseInt(headerMatch[1], 10);
  const name = headerMatch[2].trim();
  const explicitId = headerMatch[3] ? headerMatch[3].trim() : null;

  // Extract registerUrl
  const urlMatch = sec.match(/\*\*注册链接\*\*[:：]\s*`([^`]+)`/);
  const registerUrl = urlMatch ? urlMatch[1].trim() : '';

  // Extract promo code
  const promoMatch = sec.match(/优惠码\s*`([^`]+)`/);
  const promoCode = promoMatch ? promoMatch[1].trim() : '';

  // Extract base data line
  const baseMatch = sec.match(/\*\*基础数据\*\*[:：]\s*([^\n]+)/);
  const baseData = baseMatch ? baseMatch[1].trim() : '';

  // Extract plan tables
  let plans = [];
  const planBlockMatch = sec.match(/套餐名称\s+计费方式\s+价格\s+流量[^\n]*\n([\s\S]*?)(?=\n\n|\n[#测流介]|$)/);
  if (planBlockMatch) {
    const lines = planBlockMatch[1].trim().split('\n');
    for (const line of lines) {
      const parts = line.split('\t').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 4) {
        plans.push({
          name: parts[0],
          billing: parts[1],
          price: parts[2],
          traffic: parts[3],
          cycle: parts[4] || ''
        });
      }
    }
  }

  // Extract speedtest tables
  let speedtests = [];
  const speedBlockMatch = sec.match(/测速[^\n]*\n(?:节点|节点地区)\s+延迟\s+下载[^\n]*\n([\s\S]*?)(?=\n\n|\n[#流介]|$)/);
  if (speedBlockMatch) {
    const lines = speedBlockMatch[1].trim().split('\n');
    for (const line of lines) {
      const parts = line.split('\t').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 3) {
        speedtests.push({
          node: parts[0],
          latency: parts[1],
          download: parts[2]
        });
      }
    }
  }

  // Extract streaming & AI unlock
  let unlockInfo = { ai: '', streaming: '', note: '' };
  const unlockMatch = sec.match(/流媒体 & AI 解锁\n([\s\S]*?)(?=\n介绍说明|\n[#]|$)/);
  if (unlockMatch) {
    unlockInfo.raw = unlockMatch[1].trim();
  }

  // Extract description
  let intro = '';
  const introMatch = sec.match(/介绍说明[:：]?\s*([^\n#]+(?:\n[^\n#]+)*)/);
  if (introMatch) {
    intro = introMatch[1].trim();
  }

  parsedBrands.push({
    rank,
    name,
    explicitId,
    registerUrl,
    promoCode,
    baseData,
    plans,
    speedtests,
    unlock: unlockInfo.raw || '',
    intro
  });
}

console.log('Parsed valid brands count:', parsedBrands.length);
console.log('First brand:', parsedBrands[0].name, 'Plans count:', parsedBrands[0].plans.length, 'Speedtests count:', parsedBrands[0].speedtests.length);
console.log('Second brand:', parsedBrands[1].name, 'Plans count:', parsedBrands[1].plans.length, 'Speedtests count:', parsedBrands[1].speedtests.length);
fs.writeFileSync('scripts/parsed-28-brands.json', JSON.stringify(parsedBrands, null, 2), 'utf8');
