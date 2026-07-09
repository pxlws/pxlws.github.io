const path = require("path");

const { buildFeaturedProjects, loadCmsProjects } = require("../../scripts/lib/cms-projects");

module.exports = function () {
  const featuredBasePath = path.join(__dirname, "..", "..", "data", "featured-projects.base.json");
  return buildFeaturedProjects(loadCmsProjects(), featuredBasePath);
};
