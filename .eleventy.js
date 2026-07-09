const markdownIt = require("markdown-it");

const md = markdownIt({
  html: true,
  breaks: true,
});

function isDraft(value) {
  return value === true || value === "true";
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("renderMarkdown", function (content) {
    return md.render(content || "");
  });

  eleventyConfig.addFilter("projectImageSrc", function (src, slug) {
    if (!src) {
      return src;
    }

    if (src.startsWith("http") || src.startsWith("/")) {
      return src;
    }

    if (src.startsWith("images/")) {
      return src;
    }

    return "images/" + src.replace(/^images\//, "");
  });

  eleventyConfig.addPassthroughCopy("projects/**/images");

  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("CSS");
  eleventyConfig.addPassthroughCopy("scripts");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("gallery.html");
  eleventyConfig.addPassthroughCopy("work.html");
  eleventyConfig.addPassthroughCopy("data");

  eleventyConfig.addWatchTarget("./src/projects/");
  eleventyConfig.addWatchTarget("./data/featured-projects.base.json");

  eleventyConfig.on("eleventy.after", function () {
    require("./scripts/publish-build-outputs.js")();
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
