const fs = require('fs');

// 1. Enrich compare/_index.md
let cmp = fs.readFileSync('content/compare/_index.md', 'utf8');
if (!cmp.includes('## 核心专线实测测速对比公示')) {
  const compareSpeedSection = `
---

## 核心专线实测测速对比公示（2026年测试批次）

以下为主力对比品牌的真实单线程带宽与延迟跑分比对数据，均有原始截图支撑，拒绝凭空臆测：

| 对比品牌 | 线路属性 | 香港实测延迟 | 日本实测延迟 | 最高实测下载 | 解锁特征 | 跑分截图证据 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **光速云** | IEPL + 内网双专线 | 22ms | 57ms | 529 Mbps | ChatGPT全解 / 4K无缝 | [查看实测截图](/brands/gsy/#41-节点测速实测证据原始数据截图) |
| **飞猫云** | IEPL 专线 | 21ms | 54ms | 526 Mbps | 主流流媒体全解 | [查看实测截图](/brands/feimao/#41-节点测速实测证据原始数据截图) |
| **星岛梦** | IEPL 专线 | 27ms | 57ms | 504 Mbps | 4K流媒体 / ChatGPT | [查看实测截图](/brands/xingdaomeng/#41-节点测速实测证据原始数据截图) |
| **U1S1** | IEPL 专线 | 26ms | 58ms | 488 Mbps | 自研客户端优化 | [查看实测截图](/brands/u1s1/#41-节点测速实测证据原始数据截图) |
| **二猫云** | IEPL 专线 | 24ms | 56ms | 495 Mbps | 大流量均衡型 | [查看实测截图](/brands/ermao/#41-节点测速实测证据原始数据截图) |
| **一翻云** | IEPL 专线 | 24ms | 63ms | 512 Mbps | 150GB高性价比 | [查看实测截图](/brands/yifan/#41-节点测速实测证据原始数据截图) |
`;
  cmp = cmp.replace('## 三、精选品牌推荐', compareSpeedSection + '\n## 三、精选品牌推荐');
  fs.writeFileSync('content/compare/_index.md', cmp, 'utf8');
  console.log('Enriched compare/_index.md successfully.');
}

// 2. Enrich scenarios/_index.md
let scn = fs.readFileSync('content/scenarios/_index.md', 'utf8');
if (!scn.includes('## AI 与 4K 场景专属实测数据')) {
  const scenarioSpeedSection = `
---

## AI 与 4K 场景专属实测数据与解锁公示

针对高要求的生产力（OpenAI/Claude）与高码率娱乐（Netflix 4K/YouTube 4K），以下品牌经过实测验证，具备良好的 IP 纯净度与大带宽吞吐能力：

| 匹配场景 | 首推品牌 | 关键指标 | 验证证据 | 直达方案 |
| :--- | :--- | :--- | :--- | :--- |
| **ChatGPT / Claude 办公** | **Firefly / 光速云** | 原生 IP、0封锁报警 | [查看光速云AI实测截图](/brands/gsy/#42-流媒体与-ai-平台解锁实测图集) | [查看光速云评测](/brands/gsy/) |
| **Netflix 4K 非自制剧** | **唯兔云 / Firefly** | 4K秒开、全区解锁 | [查看唯兔云实测图](/brands/weitu/#41-节点测速实测证据原始数据截图) | [查看唯兔云评测](/brands/weitu/) |
| **跨境电商与 TikTok** | **隐形人 / TNTCloud** | 企业级 IEPL、纯净长效IP | 专线 2Gbps+ 带宽 | [查看隐形人评测](/brands/yinxingren/) |
| **大文件传输与团队协作** | **一翻云 / CyberGuard** | 150G-350G 大流量包 | 实测峰值 > 500Mbps | [查看一翻云实测](/brands/yifan/#41-节点测速实测证据原始数据截图) |
`;
  scn = scn.replace('## 三、精选优选品牌推荐', scenarioSpeedSection + '\n## 三、精选优选品牌推荐');
  fs.writeFileSync('content/scenarios/_index.md', scn, 'utf8');
  console.log('Enriched scenarios/_index.md successfully.');
}
