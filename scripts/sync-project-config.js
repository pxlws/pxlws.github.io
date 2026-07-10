const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
  buildFeaturedProjects,
  isDraft,
  loadCmsProjects,
} = require("./lib/cms-projects");

const root = path.join(__dirname, "..");
const gatesPath = path.join(root, "data", "project-gates.json");
const featuredBasePath = path.join(root, "data", "featured-projects.base.json");
const featuredPath = path.join(root, "data", "featured-projects.json");

function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(salt + password).digest("hex");
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function syncFeaturedProjects(cmsProjects) {
  const featured = buildFeaturedProjects(cmsProjects, featuredBasePath);
  fs.writeFileSync(featuredPath, JSON.stringify(featured, null, 2) + "\n");
  console.log("Updated data/featured-projects.json");
}

function syncProjectGates(cmsProjects) {
  const gates = readJson(gatesPath, {});

  cmsProjects.forEach(function (project) {
    const data = project.data;
    const slug = project.slug;

    if (!data.passwordProtected || isDraft(data.draft)) {
      delete gates[slug];
      return;
    }

    const password = (data.password || "").trim();

    if (password) {
      const existing = gates[slug];
      const salt = existing && existing.salt ? existing.salt : crypto.randomBytes(8).toString("hex");

      gates[slug] = {
        salt: salt,
        hash: hashPassword(password, salt),
      };
      return;
    }

    if (!gates[slug]) {
      console.warn(
        "Warning: " + slug + " is password protected but has no password set."
      );
    }
  });

  fs.writeFileSync(gatesPath, JSON.stringify(gates, null, 2) + "\n");
  console.log("Updated data/project-gates.json");
}

const cmsProjects = loadCmsProjects();
syncFeaturedProjects(cmsProjects);
syncProjectGates(cmsProjects);
