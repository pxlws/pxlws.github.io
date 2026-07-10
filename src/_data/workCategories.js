const { buildWorkCategories, loadCmsProjects } = require("../../scripts/lib/cms-projects");

module.exports = function () {
  return buildWorkCategories(loadCmsProjects());
};
