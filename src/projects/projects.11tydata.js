const { isVisibleOnSite } = require("../../scripts/lib/cms-projects");

module.exports = {
  layout: "layouts/project-sections.njk",
  eleventyComputed: {
    permalink(data) {
      if (!isVisibleOnSite(data)) {
        return false;
      }

      const slug = data.slug || data.page.fileSlug;
      return data.permalink || "/projects/" + slug + "/index.html";
    },
  },
};
