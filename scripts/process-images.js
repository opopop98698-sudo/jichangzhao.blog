const fs = require('fs');
const path = require('path');

const extractedDir = 'C:\\Users\\Pro User\\Desktop\\机场品牌信息\\extracted';
const testChartDir = 'C:\\Users\\Pro User\\Desktop\\测试图解锁图';
const gsyChartDir = 'C:\\Users\\Pro User\\Desktop\\光速云测试图解锁图';

const destSpeedtest = path.join(__dirname, '../static/images/speedtest');
const destUnlock = path.join(__dirname, '../static/images/unlock');

// Mapping of extracted PNGs
const extractedMapping = {
  '光速云-节点测速实测.png': 'gsy-speedtest-2026.png',
  '飞猫云-节点测速实测.png': 'feimao-speedtest-2026.png',
  '微风-节点测速实测.png': 'weifeng-speedtest-2026.png',
  '幕光加速-节点测速实测.png': 'muguang-speedtest-2026.png',
  '星岛梦-节点测速实测.png': 'xingdaomeng-speedtest-2026.png',
  '二猫云-节点测速实测.png': 'ermao-speedtest-2026.png',
  '唯兔云-节点测速实测.png': 'weitu-speedtest-2026.png',
  '宇宙云-节点测速实测.png': 'yuzhou-speedtest-2026.png',
  'U1S1-节点测速实测.png': 'u1s1-speedtest-2026.png',
  '灵猫网络-节点测速实测.png': 'lingmao-speedtest-2026.png',
  '极连云-节点测速实测.png': 'jilian-speedtest-2026.png',
  '光年梯-节点测速实测.png': 'guangnian-speedtest-2026.png',
  '一翻云-节点测速实测.png': 'yifan-speedtest-2026.png',
  'SOGO云-节点测速实测.png': 'sogo-speedtest-2026.png',
  '可信云-节点测速实测.png': 'kexin-speedtest-2026.png',
  '速界-节点测速实测.png': 'sujie-speedtest-2026.png',
  '全球云-节点测速实测.png': 'quanqiu-speedtest-2026.png'
};

for (const [srcName, destName] of Object.entries(extractedMapping)) {
  const src = path.join(extractedDir, srcName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(destSpeedtest, destName));
    console.log(`Copied speedtest: ${srcName} -> ${destName}`);
  } else {
    console.warn(`File not found: ${src}`);
  }
}

// Copy wuyou images
const wuyou1 = path.join(testChartDir, 'photo_2026-09-07_12-51-58.jpg');
const wuyou2 = path.join(testChartDir, 'photo_2026-09-07_12-51-59.jpg');
if (fs.existsSync(wuyou1)) {
  fs.copyFileSync(wuyou1, path.join(destSpeedtest, 'wuyou-speedtest-2026.jpg'));
  console.log(`Copied wuyou speedtest image.`);
}
if (fs.existsSync(wuyou2)) {
  fs.copyFileSync(wuyou2, path.join(destUnlock, 'wuyou-unlock-2026.jpg'));
  console.log(`Copied wuyou unlock image.`);
}

// Copy GSY detailed unlock images
const gsyPhotos = [
  { src: 'photo_2026-08-19_12-13-01.jpg', dest: 'gsy-unlock-media-1.jpg' },
  { src: 'photo_2026-08-19_12-13-50.jpg', dest: 'gsy-unlock-media-2.jpg' },
  { src: 'photo_2026-08-19_12-13-58.jpg', dest: 'gsy-unlock-media-3.jpg' },
  { src: 'photo_2026-08-19_12-18-40.jpg', dest: 'gsy-speedtest-detail-1.jpg' },
  { src: 'photo_2026-08-19_12-20-10.jpg', dest: 'gsy-speedtest-detail-2.jpg' }
];

for (const p of gsyPhotos) {
  const src = path.join(gsyChartDir, p.src);
  if (fs.existsSync(src)) {
    if (p.dest.includes('unlock')) {
      fs.copyFileSync(src, path.join(destUnlock, p.dest));
    } else {
      fs.copyFileSync(src, path.join(destSpeedtest, p.dest));
    }
    console.log(`Copied GSY asset: ${p.src} -> ${p.dest}`);
  }
}

console.log('All image assets processed successfully.');
