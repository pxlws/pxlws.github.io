const fs = require("fs");
const path = require("path");

module.exports = function () {
  const featuredPath = path.join(__dirname, "..", "..", "data", "featured-projects.json");

  if (!fs.existsSync(featuredPath)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(featuredPath, "utf8"));
};
