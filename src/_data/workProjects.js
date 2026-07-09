module.exports = function () {
  const fs = require("fs");
  const path = require("path");
  const workPath = path.join(__dirname, "..", "..", "data", "work-projects.json");

  if (!fs.existsSync(workPath)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(workPath, "utf8"));
};
