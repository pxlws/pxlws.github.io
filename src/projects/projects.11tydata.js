module.exports = {
  layout: "layouts/project-sections.njk",
  eleventyComputed: {
    permalink(data) {
      if (data.draft) {
        return false;
      }

      const slug = data.slug || data.page.fileSlug;
      return data.permalink || "/projects/" + slug + "/index.html";
    },
  },
};
