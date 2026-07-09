const fs = require("fs");
const path = require("path");

const matter = require("gray-matter");

const root = path.join(__dirname, "..");
const projectsDir = path.join(root, "src", "projects");

function toCmsImagePath(slug, src) {
  if (!src || src.startsWith("http")) {
    return src;
  }

  const prefix = "/projects/" + slug + "/images/";
  if (src.startsWith(prefix)) {
    return src.slice(prefix.length);
  }

  if (src.startsWith("/projects/")) {
    const match = src.match(/\/projects\/[^/]+\/images\/(.+)$/);
    return match ? match[1] : src;
  }

  return src.replace(/^images\//, "");
}

function toPublicThumbPath(slug, src) {
  if (!src || src.startsWith("http")) {
    return src;
  }

  if (src.startsWith("/projects/")) {
    return src;
  }

  if (src.startsWith("/assets/")) {
    const filename = path.basename(src);
    const assetPath = path.join(root, src.replace(/^\//, ""));
    const destPath = path.join(root, "projects", slug, "images", filename);

    if (fs.existsSync(assetPath) && !fs.existsSync(destPath)) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(assetPath, destPath);
      console.log("Copied asset thumb to", destPath);
    }

    return "/projects/" + slug + "/images/" + filename;
  }

  const relative = toCmsImagePath(slug, src);
  return "/projects/" + slug + "/images/" + relative;
}

function fixProject(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = matter(content);
  const slug = parsed.data.slug || path.basename(filePath, ".md");
  let changed = false;

  if (parsed.data.cardThumb) {
    const nextThumb = toPublicThumbPath(slug, parsed.data.cardThumb);
    if (nextThumb !== parsed.data.cardThumb) {
      parsed.data.cardThumb = nextThumb;
      changed = true;
    }
  }

  (parsed.data.sections || []).forEach(function (section) {
    (section.blocks || []).forEach(function (block) {
      if (block.type !== "images" || !block.items) {
        return;
      }

      block.items.forEach(function (item) {
        if (!item.src) {
          return;
        }

        const nextSrc = toCmsImagePath(slug, item.src);
        if (nextSrc !== item.src) {
          item.src = nextSrc;
          changed = true;
        }

        if (item.caption === null || item.caption === undefined) {
          item.caption = "";
          changed = true;
        }
      });
    });
  });

  if (!changed) {
    return;
  }

  fs.writeFileSync(filePath, matter.stringify(parsed.content, parsed.data));
  console.log("Fixed image paths in", slug);
}

fs.readdirSync(projectsDir)
  .filter(function (file) {
    return file.endsWith(".md");
  })
  .forEach(function (file) {
    fixProject(path.join(projectsDir, file));
  });
