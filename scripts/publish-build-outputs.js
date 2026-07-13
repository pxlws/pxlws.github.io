const fs = require("fs");
const path = require("path");

const matter = require("gray-matter");

const { isHiddenFromSite } = require("./lib/cms-projects");

const root = path.join(__dirname, "..");
const projectsDir = path.join(root, "src", "projects");
const builtRoot = path.join(root, "_site", "projects");

function loadCmsProjects() {
  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  return fs
    .readdirSync(projectsDir)
    .filter(function (file) {
      return file.endsWith(".md");
    })
    .map(function (file) {
      const filePath = path.join(projectsDir, file);
      const parsed = matter(fs.readFileSync(filePath, "utf8"));
      const slug = parsed.data.slug || file.replace(/\.md$/, "");

      return {
        slug: slug,
        hidden: isHiddenFromSite(parsed.data),
        built: path.join(builtRoot, slug, "index.html"),
        target: path.join(root, "projects", slug, "index.html"),
      };
    });
}

function copyIfExists(source, target) {
  if (!fs.existsSync(source)) {
    return false;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  return true;
}

function publishBuildOutputs() {
  let hadError = false;

  const indexBuilt = path.join(root, "_site", "index.html");
  const indexTarget = path.join(root, "index.html");

  if (copyIfExists(indexBuilt, indexTarget)) {
    console.log("Copied home page to index.html");
  }

  const workBuilt = path.join(root, "_site", "work", "index.html");
  const workTarget = path.join(root, "work", "index.html");

  if (copyIfExists(workBuilt, workTarget)) {
    console.log("Copied work page to work/index.html");
  }

  loadCmsProjects().forEach(function (project) {
    if (project.hidden) {
      if (fs.existsSync(project.target)) {
        fs.unlinkSync(project.target);
        console.log("Removed hidden project page:", project.target);
      }

      if (fs.existsSync(project.built)) {
        fs.unlinkSync(project.built);
        console.log("Removed hidden build output:", project.built);
      }

      return;
    }

    if (!copyIfExists(project.built, project.target)) {
      console.error("Build output not found:", project.built);
      hadError = true;
      return;
    }

    console.log("Copied project page to", project.target);
  });

  return !hadError;
}

module.exports = publishBuildOutputs;

if (require.main === module) {
  if (!publishBuildOutputs()) {
    process.exit(1);
  }
}
