(function () {
  if (typeof CMS === "undefined" || typeof createClass === "undefined" || typeof h === "undefined") {
    return;
  }

  var md =
    typeof window.markdownit === "function"
      ? window.markdownit({ html: true, breaks: true })
      : null;

  function renderMarkdown(text) {
    if (!text) return "";

    if (md) {
      return md.render(text);
    }

    var html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/^- (.+)$/gm, "<li>$1</li>");

    if (html.indexOf("<li>") !== -1) {
      html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, "<ul>$1</ul>");
    }

    return html
      .split(/\n\s*\n/)
      .map(function (paragraph) {
        return paragraph.trim() ? "<p>" + paragraph.replace(/\n/g, "<br>") + "</p>" : "";
      })
      .join("");
  }

  function normalizeHtmlParagraphs(html) {
    if (!html) {
      return "";
    }

    return html
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "</p><p>")
      .replace(/<p>\s*<\/p>/gi, "");
  }

  function resolveImageUrl(src, slug) {
    if (!src || !slug) {
      return src;
    }

    if (/^https?:\/\//i.test(src)) {
      return src;
    }

    if (src.indexOf("/projects/") === 0) {
      return src;
    }

    if (src.indexOf("images/") === 0) {
      return "/projects/" + slug + "/" + src;
    }

    if (src.indexOf("/") === 0) {
      return src;
    }

    return "/projects/" + slug + "/images/" + src.replace(/^images\//, "");
  }

  function rewriteHtmlImageSrcs(html, slug) {
    if (!html || !slug) {
      return html;
    }

    return html.replace(
      /(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi,
      function (match, prefix, src, suffix) {
        return prefix + resolveImageUrl(src, slug) + suffix;
      }
    );
  }

  function renderTextBody(text, slug) {
    if (!text) {
      return "";
    }

    if (/<[a-z][\s\S]*>/i.test(text)) {
      return rewriteHtmlImageSrcs(normalizeHtmlParagraphs(text), slug);
    }

    return rewriteHtmlImageSrcs(renderMarkdown(text), slug);
  }

  function renderImageBlock(block, slug, key) {
    var items = block.get("items");
    if (!items || !items.size) return null;

    return h(
      "div",
      {
        key: key,
        style: {
          backgroundColor: "#e4eaee",
          width: "100%",
          padding: "3% 6% 6% 6%",
          margin: "30px 0",
          borderRadius: "8px",
        },
      },
      items.map(function (image, index) {
        var src = image.get("src");
        var url = resolveImageUrl(src, slug);

        return h(
          "div",
          { key: index, style: index > 0 ? { paddingTop: "25px" } : {} },
          h("img", { src: url, style: { width: "100%", paddingBottom: "0" } }),
          h(
            "p",
            {
              style: {
                textAlign: "center",
                fontSize: "13px",
                fontStyle: "italic",
                color: "rgb(97, 97, 97)",
              },
            },
            image.get("caption")
          )
        );
      })
    );
  }

  var ProjectPreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var title = entry.getIn(["data", "title"]);
      var summary = entry.getIn(["data", "summary"]);
      var slug = entry.getIn(["data", "slug"]);
      var sections = entry.getIn(["data", "sections"]);

      return h(
        "div",
        { id: "layout" },
        h(
          "div",
          { className: "project-content" },
          h(
            "div",
            { className: "project-header" },
            h(
              "div",
              { className: "project-header-content" },
              h("h2", {}, title),
              h("p", {}, summary)
            )
          ),
          sections && sections.size
            ? sections.map(function (section, sectionIndex) {
                var blocks = section.get("blocks");

                return h(
                  "div",
                  { className: "project-section", key: sectionIndex },
                  h(
                    "div",
                    { className: "project-col1" },
                    h("h3", {}, section.get("heading")),
                    h("div", { style: { clear: "both" } })
                  ),
                  h(
                    "div",
                    { className: "project-col2" },
                    blocks && blocks.size
                      ? blocks.map(function (block, blockIndex) {
                          var type = block.get("type");

                          if (type === "text") {
                            return h("div", {
                              key: blockIndex,
                              className: "project-text-block",
                              dangerouslySetInnerHTML: {
                                __html: renderTextBody(block.get("body") || "", slug),
                              },
                            });
                          }

                          if (type === "images") {
                            return renderImageBlock(block, slug, blockIndex);
                          }

                          return null;
                        })
                      : null,
                    h("div", { style: { clear: "both" } })
                  )
                );
              })
            : null
        )
      );
    },
  });

  CMS.registerPreviewStyle("/CSS/style.css");
  CMS.registerPreviewStyle("/admin/preview.css");
  CMS.registerPreviewStyle("/assets/fonts/all.css");
  CMS.registerPreviewTemplate("projects", ProjectPreview);
})();
