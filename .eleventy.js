const markdownIt = require("markdown-it");

const md = markdownIt({
  html: true,
  breaks: true,
});

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("renderMarkdown", function (content) {
    return md.render(content || "");
  });

  eleventyConfig.addPassthroughCopy("projects/**/images");

  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("CSS");
  eleventyConfig.addPassthroughCopy("scripts");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("gallery.html");
  eleventyConfig.addPassthroughCopy("work.html");
  eleventyConfig.addPassthroughCopy("data");

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
