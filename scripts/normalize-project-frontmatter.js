const fs = require("fs");
const path = require("path");

const matter = require("gray-matter");

const projectsDir = path.join(__dirname, "..", "src", "projects");

const defaults = {
  draft: false,
  featured: false,
  featuredOrder: 99,
  workOrder: 99,
  passwordProtected: false,
  password: "",
};

fs.readdirSync(projectsDir)
  .filter(function (file) {
    return file.endsWith(".md");
  })
  .forEach(function (file) {
    const filePath = path.join(projectsDir, file);
    const parsed = matter(fs.readFileSync(filePath, "utf8"));
    let changed = false;

    Object.keys(defaults).forEach(function (key) {
      if (parsed.data[key] === undefined) {
        parsed.data[key] = defaults[key];
        changed = true;
      }
    });

    if (parsed.data.password === null) {
      parsed.data.password = "";
      changed = true;
    }

    if (!changed) {
      return;
    }

    fs.writeFileSync(filePath, matter.stringify(parsed.content, parsed.data));
    console.log("Normalized frontmatter:", file);
  });
