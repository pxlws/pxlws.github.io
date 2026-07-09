const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const matter = require("gray-matter");

const root = path.join(__dirname, "..");
const projectsDir = path.join(root, "src", "projects");
const gatesPath = path.join(root, "data", "project-gates.json");
const featuredBasePath = path.join(root, "data", "featured-projects.base.json");
const featuredPath = path.join(root, "data", "featured-projects.json");
const workPath = path.join(root, "data", "work-projects.json");

const GRID_CLASSES = ["grid-col1", "grid-col2", "grid-col3"];

function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(salt + password).digest("hex");
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

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
      const content = fs.readFileSync(path.join(projectsDir, file), "utf8");
      const parsed = matter(content);
      const slug = parsed.data.slug || file.replace(/\.md$/, "");

      return {
        slug: slug,
        data: parsed.data,
      };
    });
}

function syncFeaturedProjects(cmsProjects) {
  const featured = readJson(featuredBasePath, []).filter(function (project) {
    return !cmsProjects.some(function (cmsProject) {
      return cmsProject.slug === project.slug;
    });
  });

  cmsProjects.forEach(function (project) {
    const data = project.data;

    if (!data.featured || data.draft) {
      return;
    }

    featured.push({
      slug: project.slug,
      title: data.title,
      href: "/projects/" + project.slug + "/",
      cardDescription: data.cardDescription || "",
      cardTag: data.cardTag || "Product Design",
      cardThumb: data.cardThumb || "",
      featuredOrder: data.featuredOrder || 99,
    });
  });

  featured.sort(function (a, b) {
    return (a.featuredOrder || 99) - (b.featuredOrder || 99);
  });

  featured.forEach(function (project, index) {
    project.gridClass = GRID_CLASSES[index % GRID_CLASSES.length];
  });

  fs.writeFileSync(featuredPath, JSON.stringify(featured, null, 2) + "\n");
  console.log("Updated data/featured-projects.json");
}

function syncProjectGates(cmsProjects) {
  const gates = readJson(gatesPath, {});

  cmsProjects.forEach(function (project) {
    const data = project.data;
    const slug = project.slug;

    if (!data.passwordProtected || data.draft) {
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

function syncWorkProjects(cmsProjects) {
  const work = cmsProjects
    .filter(function (project) {
      const data = project.data;
      return !data.draft && data.showOnWork !== false;
    })
    .map(function (project) {
      const data = project.data;

      return {
        slug: project.slug,
        title: data.title,
        href: "/projects/" + project.slug + "/index.html",
        cardDescription: data.cardDescription || "",
        cardTag: data.cardTag || "Product Design",
        cardThumb: data.cardThumb || "",
        workOrder: data.workOrder || 99,
      };
    })
    .sort(function (a, b) {
      return a.workOrder - b.workOrder;
    });

  const columns = [];

  work.forEach(function (project, index) {
    const gridClass = GRID_CLASSES[Math.floor(index / 2) % GRID_CLASSES.length];
    let column = columns[columns.length - 1];

    if (!column || column.gridClass !== gridClass) {
      column = { gridClass: gridClass, projects: [] };
      columns.push(column);
    }

    column.projects.push(project);
  });

  fs.writeFileSync(workPath, JSON.stringify(columns, null, 2) + "\n");
  console.log("Updated data/work-projects.json");
}

const cmsProjects = loadCmsProjects();
syncFeaturedProjects(cmsProjects);
syncProjectGates(cmsProjects);
syncWorkProjects(cmsProjects);
