// Master Corpus Dispatcher
const { getScenariosCorpus } = require('./corpus_scenarios');
const { getCheapCorpus } = require('./corpus_cheap');
const { getRecommendCorpus } = require('./corpus_recommend');
const { getFinderCorpus } = require('./corpus_finder');
const { getFreeCorpus } = require('./corpus_free');
const { getCompareCorpus } = require('./corpus_compare');
const { getBrandsCorpus } = require('./corpus_brands');
const { getGuidesCorpus } = require('./corpus_guides');

function getCorpus(section, subtopic, title, primaryBrand, secondaryBrand) {
  let result;
  switch (section) {
    case 'scenarios':
      result = getScenariosCorpus(subtopic, title, primaryBrand, secondaryBrand);
      break;
    case 'cheap':
      result = getCheapCorpus(subtopic, title, primaryBrand, secondaryBrand);
      break;
    case 'recommend':
      result = getRecommendCorpus(subtopic, title, primaryBrand, secondaryBrand);
      break;
    case 'finder':
      result = getFinderCorpus(subtopic, title, primaryBrand, secondaryBrand);
      break;
    case 'free':
      result = getFreeCorpus(subtopic, title, primaryBrand, secondaryBrand);
      break;
    case 'compare':
      result = getCompareCorpus(subtopic, title, primaryBrand, secondaryBrand);
      break;
    case 'brands':
      result = getBrandsCorpus(subtopic, title, primaryBrand, secondaryBrand);
      break;
    case 'guides':
      result = getGuidesCorpus(subtopic, title, primaryBrand, secondaryBrand);
      break;
    default:
      result = getScenariosCorpus(subtopic, title, primaryBrand, secondaryBrand);
      break;
  }

  return result;
}

module.exports = { getCorpus };
