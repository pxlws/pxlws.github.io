const fs = require("fs");
const path = require("path");

const matter = require("gray-matter");

const root = path.join(__dirname, "..", "..");
const projectsDir = path.join(root, "src", "projects");

const GRID_CLASSES = ["grid-col1", "grid-col2", "grid-col3"];

function isDraft(value) {
  return value === true || value === "true";
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

function buildWorkColumns(cmsProjects) {
  const work = cmsProjects
    .filter(function (project) {
      return !isDraft(project.data.draft);
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

  const columns = GRID_CLASSES.map(function (gridClass) {
    return { gridClass: gridClass, projects: [] };
  });

  work.forEach(function (project, index) {
    const pairColumn = Math.floor(index / 2);

    if (pairColumn < columns.length) {
      columns[pairColumn].projects.push(project);
      return;
    }

    let target = columns[0];
    columns.forEach(function (column) {
      if (column.projects.length < target.projects.length) {
        target = column;
      }
    });
    target.projects.push(project);
  });

  return columns.filter(function (column) {
    return column.projects.length > 0;
  });
}

function buildFeaturedProjects(cmsProjects, featuredBasePath) {
  const featured = [];

  if (fs.existsSync(featuredBasePath)) {
    const base = JSON.parse(fs.readFileSync(featuredBasePath, "utf8"));
    base.forEach(function (project) {
      const hasCmsEntry = cmsProjects.some(function (entry) {
        return entry.slug === project.slug;
      });

      if (!hasCmsEntry) {
        featured.push(project);
      }
    });
  }

  cmsProjects.forEach(function (project) {
    const data = project.data;

    if (!data.featured || isDraft(data.draft)) {
      return;
    }

    if (featured.some(function (entry) { return entry.slug === project.slug; })) {
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

  return featured;
}

module.exports = {
  GRID_CLASSES: GRID_CLASSES,
  loadCmsProjects: loadCmsProjects,
  buildWorkColumns: buildWorkColumns,
  buildFeaturedProjects: buildFeaturedProjects,
};
