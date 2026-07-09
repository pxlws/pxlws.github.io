(function () {
  if (typeof CMS === "undefined" || typeof createClass === "undefined" || typeof h === "undefined") {
    return;
  }

  function renderMarkdown(text) {
    if (!text) return "";

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

  function renderImageBlock(block, getAsset, key) {
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
        var asset = src && getAsset ? getAsset(src) : null;
        var url = asset ? asset.toString() : src;

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
      var getAsset = this.props.getAsset;
      var title = entry.getIn(["data", "title"]);
      var summary = entry.getIn(["data", "summary"]);
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
                              dangerouslySetInnerHTML: {
                                __html: renderMarkdown(block.get("body") || ""),
                              },
                            });
                          }

                          if (type === "images") {
                            return renderImageBlock(block, getAsset, blockIndex);
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
  CMS.registerPreviewStyle("/assets/fonts/all.css");
  CMS.registerPreviewTemplate("projects", ProjectPreview);
})();
