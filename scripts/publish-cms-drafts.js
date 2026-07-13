#!/usr/bin/env node

const { execFileSync } = require("child_process");

function runGh(args) {
  return execFileSync("gh", args, { encoding: "utf8" }).trim();
}

function listOpenCmsPullRequests() {
  const output = runGh([
    "pr",
    "list",
    "--state",
    "open",
    "--json",
    "number,headRefName,title",
    "--limit",
    "100",
  ]);

  return JSON.parse(output).filter(function (pr) {
    return pr.headRefName.startsWith("cms/");
  });
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const pullRequests = listOpenCmsPullRequests();

  if (!pullRequests.length) {
    console.log("No open CMS draft pull requests to publish.");
    return;
  }

  console.log(
    "Found " +
      pullRequests.length +
      " CMS draft" +
      (pullRequests.length === 1 ? "" : "s") +
      ":"
  );

  pullRequests.forEach(function (pr) {
    console.log("  #" + pr.number + " " + pr.title + " (" + pr.headRefName + ")");
  });

  if (dryRun) {
    console.log("Dry run only. Re-run without --dry-run to merge these pull requests.");
    return;
  }

  pullRequests.forEach(function (pr) {
    console.log("Merging #" + pr.number + "...");
    runGh(["pr", "merge", String(pr.number), "--squash", "--delete-branch"]);
  });

  console.log("Done. GitHub Actions will build master once the merges finish.");
}

try {
  main();
} catch (error) {
  if (error.message && error.message.includes("ENOENT")) {
    console.error("The GitHub CLI (gh) is required. Install it and run `gh auth login`.");
    process.exit(1);
  }

  console.error(error.message || error);
  process.exit(1);
}
