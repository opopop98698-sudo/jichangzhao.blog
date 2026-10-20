const { generateHomePage } = require('./gen_home');
const { generateRecommendPage } = require('./gen_recommend');
const { generateFinderPage } = require('./gen_finder');
const { generateCheapPage } = require('./gen_cheap');
const { generateFreePage } = require('./gen_free');
const { generateScenariosPage } = require('./gen_scenarios');
const { generateComparePage } = require('./gen_compare');
const { generateBrandsPage } = require('./gen_brands');
const { generateGuidesPage } = require('./gen_guides');

console.log('========================================');
console.log('🚀 开始全面重构 9 个一级导航与大专题主入口...');
console.log('========================================\n');

generateHomePage();
generateRecommendPage();
generateFinderPage();
generateCheapPage();
generateFreePage();
generateScenariosPage();
generateComparePage();
generateBrandsPage();
generateGuidesPage();

console.log('\n========================================');
console.log('✨ 全部 9 个核心一级导航门户生成完成！');
console.log('========================================');
