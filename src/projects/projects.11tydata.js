module.exports = {
  layout: "layouts/project-sections.njk",
  eleventyComputed: {
    permalink(data) {
      if (data.draft === true || data.draft === "true") {
        return false;
      }

      const slug = data.slug || data.page.fileSlug;
      return data.permalink || "/projects/" + slug + "/index.html";
    },
  },
};
