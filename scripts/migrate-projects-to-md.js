const fs = require("fs");
const path = require("path");

const cheerio = require("cheerio");
const matter = require("gray-matter");

const root = path.join(__dirname, "..");
const projectsRoot = path.join(root, "projects");
const outputDir = path.join(root, "src", "projects");
const meta = JSON.parse(fs.readFileSync(path.join(root, "data", "projects.meta.json"), "utf8"));

function normalizeImageSrc(src, slug) {
  if (!src) return src;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return "images/" + src.replace(/^images\//, "");
}

function isImageGroup(node) {
  const style = (node.attribs && node.attribs.style) || "";
  return style.indexOf("#e4eaee") !== -1 || style.indexOf("e4eaee") !== -1;
}

function nodeToHtml($, node) {
  return $.html(node).trim();
}

function parseBlocks($, col2, slug) {
  const blocks = [];
  let textParts = [];

  function flushText() {
    if (!textParts.length) return;
    const body = textParts.join("\n\n").trim();
    if (body) {
      blocks.push({ type: "text", body: body });
    }
    textParts = [];
  }

  col2.contents().each(function (_, node) {
    if (node.type === "text") {
      const value = (node.data || "").trim();
      if (value) textParts.push(value);
      return;
    }

    if (node.name === "div" && isImageGroup(node)) {
      flushText();
      const items = [];
      $(node)
        .find("img")
        .each(function (_, img) {
          const $img = $(img);
          const caption = $img.next("p").text().trim() || $img.parent().find("p").last().text().trim();
          items.push({
            src: normalizeImageSrc($img.attr("src"), slug),
            caption: caption,
          });
        });
      if (items.length) {
        blocks.push({ type: "images", items: items });
      }
      return;
    }

    if (node.name === "img") {
      flushText();
      blocks.push({
        type: "images",
        items: [
          {
            src: normalizeImageSrc($(node).attr("src"), slug),
            caption: "",
          },
        ],
      });
      return;
    }

    if (node.name === "br") {
      textParts.push("");
      return;
    }

    textParts.push(nodeToHtml($, node));
  });

  flushText();
  return blocks;
}

function migrateProject(slug) {
  const htmlPath = path.join(projectsRoot, slug, "index.html");
  const outputPath = path.join(outputDir, slug + ".md");

  if (!fs.existsSync(htmlPath)) {
    console.warn("Skipping missing project:", slug);
    return;
  }

  if (slug === "blinkappredesign" && fs.existsSync(outputPath)) {
    console.log("Keeping existing CMS project:", slug);
    return;
  }

  const html = fs.readFileSync(htmlPath, "utf8");
  const $ = cheerio.load(html);
  const title = $(".project-header-content h2").first().text().trim();
  const summary = $(".project-header-content p").first().text().trim();
  const sections = [];

  $(".project-section").each(function () {
    const heading = $(this).find(".project-col1 h3").first().text().trim();
    const col2 = $(this).find(".project-col2").first();
    if (!heading || !col2.length) return;

    sections.push({
      heading: heading,
      blocks: parseBlocks($, col2, slug),
    });
  });

  const projectMeta = meta[slug] || {};

  const data = {
    title: title,
    summary: summary,
    slug: slug,
    draft: projectMeta.draft === true,
    featured: !!projectMeta.featured,
    featuredOrder: projectMeta.featuredOrder || 99,
    showOnWork: projectMeta.draft ? false : projectMeta.showOnWork !== false,
    workOrder: projectMeta.workOrder || 99,
    passwordProtected: false,
    password: "",
    cardDescription: projectMeta.cardDescription || "",
    cardTag: projectMeta.cardTag || "Product Design",
    cardThumb: projectMeta.cardThumb || "",
    sections: sections,
  };

  const file = matter.stringify("", data);
  fs.writeFileSync(outputPath, file);
  console.log("Migrated", slug);
}

fs.mkdirSync(outputDir, { recursive: true });

Object.keys(meta).forEach(function (slug) {
  if (slug === "template") return;
  migrateProject(slug);
});

// Also migrate darkmode if present but not only in meta
if (fs.existsSync(path.join(projectsRoot, "darkmode", "index.html")) && !meta.darkmode) {
  migrateProject("darkmode");
}
