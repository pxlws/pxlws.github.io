(function () {
  if (typeof CMS === "undefined" || typeof CMS.getLocale !== "function") {
    return;
  }

  function deepMerge(target, source) {
    var output = Object.assign({}, target);

    Object.keys(source).forEach(function (key) {
      var sourceValue = source[key];
      var targetValue = target[key];

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        output[key] = deepMerge(targetValue, sourceValue);
        return;
      }

      output[key] = sourceValue;
    });

    return output;
  }

  CMS.registerLocale(
    "en",
    deepMerge(CMS.getLocale("en") || {}, {
      editor: {
        editorToolbar: {
          draft: "Unpublished changes",
          statusInfoTooltipDraft:
            "This entry has unpublished changes. Set the status to ‘In review’ when you are ready to publish.",
        },
      },
      workflow: {
        workflowList: {
          draftHeader: "Unpublished changes",
        },
      },
    })
  );
})();
