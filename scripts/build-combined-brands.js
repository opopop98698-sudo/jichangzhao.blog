const fs = require('fs');
const path = require('path');

// 1. Read existing YAML for base info (rank, id, promo, registerUrl)
const brandsYaml = fs.readFileSync(path.join(__dirname, '../data/brands.yaml'), 'utf8');
const brandsYamlList = [];
const blocks = brandsYaml.split(/\n\s*-\s*id:\s*/).slice(1);
for (const b of blocks) {
  const lines = b.split('\n');
  const id = lines[0].trim().replace(/^['"]|['"]$/g, '');
  const obj = { id };
  for (const line of lines.slice(1)) {
    const m = line.match(/^\s*([a-zA-Z0-9]+):\s*(.*)$/);
    if (m) {
      const k = m[1];
      let v = m[2].trim();
      if (v.startsWith('[') && v.endsWith(']')) {
        v = v.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      } else {
        v = v.replace(/^['"]|['"]$/g, '');
      }
      obj[k] = v;
    }
  }
  brandsYamlList.push(obj);
}

// 2. Parse 28个机场品牌清单.txt
const raw28 = fs.readFileSync('C:\\Users\\Pro User\\Desktop\\机场品牌信息\\28个机场品牌清单.txt', 'utf8');
const sec28 = raw28.split(/\n(?=(?:主推)?##\s+\d+\.)/);
const brandDetails = {};

for (const sec of sec28) {
  if (!sec.includes('##')) continue;
  const headerMatch = sec.match(/(?:主推)?##\s+(\d+)\.\s+([^\n（(]+)(?:[（(]([a-zA-Z0-9_-]+)[）)])?/);
  if (!headerMatch) continue;
  const rank = parseInt(headerMatch[1], 10);
  const name = headerMatch[2].trim();
  const explicitId = headerMatch[3] ? headerMatch[3].trim() : null;

  // find yaml item
  let matched = null;
  if (explicitId) {
    matched = brandsYamlList.find(b => b.id.toLowerCase() === explicitId.toLowerCase());
  }
  if (!matched) {
    matched = brandsYamlList.find(b => b.name === name || name.includes(b.name) || b.name.includes(name));
  }
  if (!matched) {
    matched = brandsYamlList.find(b => parseInt(b.rank, 10) === rank);
  }

  const id = matched ? matched.id : (explicitId || name);

  // Extract plans
  let plans = [];
  const planBlockMatch = sec.match(/套餐名称\s+计费方式\s+价格\s+流量[^\n]*\r?\n([\s\S]*?)(?=\r?\n\r?\n|\r?\n[#测流介]|$)/);
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

  // Extract speedtests
  let speedtests = [];
  const speedBlockMatch = sec.match(/测速[^\n]*\r?\n(?:节点|节点地区)\s+延迟\s+下载[^\n]*\r?\n([\s\S]*?)(?=\r?\n\r?\n|\r?\n[#流介]|$)/);
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

  // Extract unlock
  let unlock = '';
  const unlockMatch = sec.match(/流媒体 & AI 解锁\r?\n([\s\S]*?)(?=\r?\n介绍说明|\r?\n[#]|$)/);
  if (unlockMatch) {
    unlock = unlockMatch[1].trim();
  }

  // Extract intro
  let intro = '';
  const introMatch = sec.match(/介绍说明[:：]?\s*([^\n#]+(?:\r?\n[^\n#]+)*)/);
  if (introMatch) {
    intro = introMatch[1].trim();
  }

  // Extract features
  let features = [];
  const featMatch = sec.match(/(?:核心特色|\*\*品牌资料明确说了的\*\*[:：]?)\r?\n([\s\S]*?)(?=\r?\n套餐价格|\r?\n测速|\r?\n\*\*与同类差异\*\*|\r?\n##|$)/);
  if (featMatch) {
    features = featMatch[1].trim().split('\n').map(l => l.replace(/^[-*•\s]+/, '').trim()).filter(Boolean);
  }

  // Extract comparison difference
  let difference = '';
  const diffMatch = sec.match(/\*\*与同类差异\*\*[:：]?\r?\n([\s\S]*?)(?=\r?\n\*\*文末引导\*\*|\r?\n##|$)/);
  if (diffMatch) {
    difference = diffMatch[1].trim();
  }

  brandDetails[id] = {
    rank,
    name,
    id,
    plans,
    speedtests,
    unlock,
    intro,
    features,
    difference,
    source: '28-brands-list'
  };
}

// 3. Parse 14个机场品牌清单.txt (Brands 29-42)
const raw14 = fs.readFileSync('C:\\Users\\Pro User\\Desktop\\机场品牌信息\\14个机场品牌清单.txt', 'utf8');
const brandBlocks14 = raw14.split(/\r?\n\r?\n(?=[^\n\r]+(?:\r?\n基础信息|\r?\n- 资料更新时间))/);

for (const bText of brandBlocks14) {
  const firstLine = bText.trim().split('\n')[0].replace(/[\r\n#*]/g, '').trim();
  if (!firstLine || firstLine.length > 30) continue;

  const matched = brandsYamlList.find(b => b.name === firstLine || firstLine.includes(b.name) || b.name.includes(firstLine));
  if (!matched) continue;
  const id = matched.id;

  // Extract plans
  let plans = [];
  const planMatch = bText.match(/套餐名称\s+计费方式\s+价格\s+流量[^\n]*\r?\n([\s\S]*?)(?=\r?\n\r?\n|\r?\n[#测流介]|$)/);
  if (planMatch) {
    const lines = planMatch[1].trim().split('\n');
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

  // Extract speedtests
  let speedtests = [];
  const speedMatch = bText.match(/测速[^\n]*\r?\n(?:节点|节点地区)\s+统计?延迟\s+统计?下载[^\n]*\r?\n([\s\S]*?)(?=\r?\n\r?\n|\r?\n[#流介]|$)/);
  if (speedMatch) {
    const lines = speedMatch[1].trim().split('\n');
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

  // Extract unlock
  let unlock = '';
  const unlockMatch = bText.match(/流媒体 & AI 解锁\r?\n([\s\S]*?)(?=\r?\n介绍说明|\r?\n[#]|$)/);
  if (unlockMatch) {
    unlock = unlockMatch[1].trim();
  }

  // Extract features
  let features = [];
  const featMatch = bText.match(/核心特色\r?\n([\s\S]*?)(?=\r?\n套餐价格|\r?\n测速|\r?\n##|$)/);
  if (featMatch) {
    features = featMatch[1].trim().split('\n').map(l => l.replace(/^[-*•\s]+/, '').trim()).filter(Boolean);
  }

  // Extract intro
  let intro = '';
  const introMatch = bText.match(/介绍说明\r?\n([\s\S]*?)(?=\r?\n待核实信息|\r?\n[#]|$)/);
  if (introMatch) {
    intro = introMatch[1].trim();
  }

  brandDetails[id] = {
    rank: parseInt(matched.rank, 10),
    name: matched.name,
    id,
    plans,
    speedtests,
    unlock,
    intro,
    features,
    difference: '',
    source: '14-brands-list'
  };
}

// 4. Attach image assets
const imageMap = {
  gsy: {
    speedtest: '/images/speedtest/gsy-speedtest-2026.png',
    unlocks: [
      '/images/unlock/gsy-unlock-media-1.jpg',
      '/images/unlock/gsy-unlock-media-2.jpg',
      '/images/unlock/gsy-unlock-media-3.jpg'
    ],
    details: [
      '/images/speedtest/gsy-speedtest-detail-1.jpg',
      '/images/speedtest/gsy-speedtest-detail-2.jpg'
    ]
  },
  feimao: { speedtest: '/images/speedtest/feimao-speedtest-2026.png' },
  weifeng: { speedtest: '/images/speedtest/weifeng-speedtest-2026.png' },
  muguang: { speedtest: '/images/speedtest/muguang-speedtest-2026.png' },
  xingdaomeng: { speedtest: '/images/speedtest/xingdaomeng-speedtest-2026.png' },
  ermao: { speedtest: '/images/speedtest/ermao-speedtest-2026.png' },
  wuyou: {
    speedtest: '/images/speedtest/wuyou-speedtest-2026.jpg',
    unlocks: ['/images/unlock/wuyou-unlock-2026.jpg']
  },
  weitu: { speedtest: '/images/speedtest/weitu-speedtest-2026.png' },
  yuzhou: { speedtest: '/images/speedtest/yuzhou-speedtest-2026.png' },
  u1s1: { speedtest: '/images/speedtest/u1s1-speedtest-2026.png' },
  lingmao: { speedtest: '/images/speedtest/lingmao-speedtest-2026.png' },
  jilian: { speedtest: '/images/speedtest/jilian-speedtest-2026.png' },
  guangnian: { speedtest: '/images/speedtest/guangnian-speedtest-2026.png' },
  yifan: { speedtest: '/images/speedtest/yifan-speedtest-2026.png' },
  sogo: { speedtest: '/images/speedtest/sogo-speedtest-2026.png' },
  kexin: { speedtest: '/images/speedtest/kexin-speedtest-2026.png' },
  sujie: { speedtest: '/images/speedtest/sujie-speedtest-2026.png' },
  quanqiu: { speedtest: '/images/speedtest/quanqiu-speedtest-2026.png' }
};

for (const b of brandsYamlList) {
  if (!brandDetails[b.id]) {
    brandDetails[b.id] = {
      rank: parseInt(b.rank, 10),
      name: b.name,
      id: b.id,
      plans: [],
      speedtests: [],
      unlock: '',
      intro: '',
      features: Array.isArray(b.highlights) ? b.highlights : [b.highlights],
      difference: ''
    };
  }
  brandDetails[b.id].yaml = b;
  brandDetails[b.id].images = imageMap[b.id] || null;
}

console.log('Total merged brands count:', Object.keys(brandDetails).length);
fs.writeFileSync('scripts/combined-brands-data.json', JSON.stringify(brandDetails, null, 2), 'utf8');
console.log('Saved combined-brands-data.json successfully.');
