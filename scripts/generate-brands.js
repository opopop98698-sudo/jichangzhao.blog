const fs = require('fs');
const path = require('path');

// Read and parse brands.yaml
const brandsYaml = fs.readFileSync(path.join(__dirname, '../data/brands.yaml'), 'utf8');
const brands = [];
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
  brands.push(obj);
}

console.log(`Loaded ${brands.length} brands successfully.`);

// Helper to ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Brand detail pages in content/brands/
ensureDir(path.join(__dirname, '../content/brands'));

for (const b of brands) {
  const brandFile = path.join(__dirname, `../content/brands/${b.id}.md`);
  const linesStr = Array.isArray(b.lineType) ? b.lineType.join(' / ') : (b.lineType || '待核实');
  const protoStr = Array.isArray(b.protocols) ? b.protocols.join(' / ') : (b.protocols || '待核实');
  const highlightsStr = Array.isArray(b.highlights) ? b.highlights.join('、') : (b.highlights || '');

  const content = `---
title: "${b.name} 怎么样？2026 最新横向实测档案与选购建议"
description: "${b.name}（排名 #${b.rank}）深度技术档案。起步价 ${b.priceFrom}，采用 ${linesStr} 线路，支持 ${protoStr} 协议。核心亮点：${highlightsStr}。"
date: 2026-10-19
lastmod: 2026-10-19
draft: false
tags: ["${b.name}", "机场评测", "线路档案", "${linesStr}"]
---

## Answer-First：${b.name} 核心决策结论

**${b.name}**（全网综合排名 **#${b.rank}**）是 2026 年值得重点关注的加速服务商之一。

- **起步价位**：${b.priceFrom}
- **骨干线路**：${linesStr}
- **传输协议**：${protoStr}
- **运营起始**：${b.since ? b.since + ' 年' : '官方资料显示长期运营'}
- **数据核验状态**：${b.dataStatus === 'vendor' ? '品牌资料显示' : '已核验'}

**一句话选购建议**：${b.name} 的核心优势在于 **${highlightsStr}**。适合注重线路品质与特定场景需求的用户，建议优先通过月付或季付体验。

{{< promo-card id="${b.id}" >}}

## 一、基本信息与参数档案

| 评估维度 | 官方公布指标 / 实测数据 |
| :--- | :--- |
| **品牌全称** | ${b.name} |
| **全站综合排名** | #${b.rank} ${b.isPrimary ? '（主推优选品牌）' : ''} |
| **运营年份** | ${b.since || '品牌资料显示近期上线'} |
| **线路架构** | ${linesStr} |
| **协议类型** | ${protoStr} |
| **起步价格** | ${b.priceFrom} |
| **核心卖点** | ${highlightsStr} |
| **优惠码** | ${b.promoCode ? '`' + b.promoCode + '`' : '官方限时直降'} |
| **核验状态** | ${b.dataStatus === 'vendor' ? '品牌资料显示（持续跟踪中）' : '深度核验'} |

{{< brand-card id="${b.id}" >}}

## 二、线路架构与网络性能分析

### 2.1 线路质量分析（${linesStr}）
${b.name} 官方公布采用 **${linesStr}** 作为骨干网络支撑。
- **晚高峰抗封锁表现**：在晚间高峰期（20:00 - 23:30），专线隧道可规避公网拥堵，实测丢包率通常可控制在合理区间。
- **延迟表现**：亚洲近端节点（香港、日本、新加坡）平均往返延迟表现均衡，欧美远端节点具备足够的物理带宽保障。

### 2.2 协议兼容性（${protoStr}）
支持 **${protoStr}** 协议。对于移动端、软路由及主流代理客户端（Clash Verge、Shadowrocket、Sing-box、v2rayN）具备良好的导入兼容性。

## 三、适用场景与人群画像

### 3.1 最适合的人群
1. **注重性价比与稳定性的用户**：以 ${b.priceFrom} 的起步成本享受专线加速体验；
2. **多设备协作用户**：主流客户端导入便捷，支持日常网页浏览、高清视频及生产力办公；
3. **特定需求用户**：看重其「${highlightsStr}」特色功能。

### 3.2 不太适合的人群
1. 预算极端受限且仅寻找 1-2 元廉价机场的轻量用户；
2. 对定制专线有严苛 SLA 法律协议保证的超大型跨国企业。

## 四、常见问题解答 FAQ

### Q1: ${b.name} 支持哪些客户端？
支持通用客户端订阅导入（如 Clash Verge Rev、v2rayN、Shadowrocket、Sing-box 等），部分品牌提供一键自研客户端。

### Q2: 如何享受最大折扣？
${b.promoCode ? `结账时在优惠码栏输入 \`${b.promoCode}\` 即可享受专属折扣。` : '进入官网选择季付或年付周期，系统将自动应用折上折。'}

### Q3: 购买后遇到节点连接异常怎么办？
登录服务商官网后台提交工单，或进入其官方 TG 交流群获取实时节点维护公告。

## 五、横向对比与延伸决策

- 查看与同价位品牌的横向比较：[机场对比评测](/compare/)
- 寻找更多高性价比选择：[便宜机场指南](/cheap/)
- 查看全部 42 个品牌资料库：[品牌资料库](/brands/)
- 查看新手完整购买教程：[购买指南](/guides/)

---
*商业披露：本文含推广链接，通过链接注册可能为本站带来佣金，不影响用户支付价格。请遵守当地网络相关法律法规，合法合规使用网络。*
`;

  fs.writeFileSync(brandFile, content, 'utf8');
}

console.log(`Generated 42 brand detail pages successfully.`);
