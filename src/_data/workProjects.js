const path = require("path");

const { buildWorkColumns, loadCmsProjects } = require("../../scripts/lib/cms-projects");

module.exports = function () {
  return buildWorkColumns(loadCmsProjects());
};
