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

function slugifyCategory(label) {
  return label.trim().toLowerCase().replace(/\s+/g, "-");
}

function projectCategories(cardTag) {
  return (cardTag || "Product Design")
    .split("•")
    .map(function (tag) {
      return slugifyCategory(tag);
    })
    .filter(Boolean);
}

function buildWorkCategories(cmsProjects) {
  const labels = new Set();

  cmsProjects.forEach(function (project) {
    if (isDraft(project.data.draft)) {
      return;
    }

    (project.data.cardTag || "Product Design")
      .split("•")
      .forEach(function (tag) {
        const label = tag.trim();
        if (label) {
          labels.add(label);
        }
      });
  });

  return Array.from(labels)
    .sort()
    .map(function (label) {
      return {
        label: label,
        slug: slugifyCategory(label),
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
        workOrder: data.workOrder ?? 99,
        categories: projectCategories(data.cardTag),
      };
    })
    .sort(function (a, b) {
      return a.workOrder - b.workOrder;
    });

  const columns = GRID_CLASSES.map(function (gridClass) {
    return { gridClass: gridClass, projects: [] };
  });

  work.forEach(function (project, index) {
    columns[index % columns.length].projects.push(project);
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
  isDraft: isDraft,
  loadCmsProjects: loadCmsProjects,
  buildWorkColumns: buildWorkColumns,
  buildWorkCategories: buildWorkCategories,
  buildFeaturedProjects: buildFeaturedProjects,
};
