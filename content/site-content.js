/*
  Compatibility adapter for the dependency-free site generator.
  Edit content/site-content.json through Pages CMS instead of this file.
*/
const SITE_CONTENT = require('./site-content.json');

if (typeof window !== 'undefined') window.SITE_CONTENT = SITE_CONTENT;
if (typeof module !== 'undefined' && module.exports) module.exports = SITE_CONTENT;
