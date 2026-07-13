#!/usr/bin/env node

const { execFileSync } = require("child_process");

const matter = require("gray-matter");

function run(command, args) {
  return execFileSync(command, args, { encoding: "utf8" }).trim();
}

function runGh(args) {
  return run("gh", args);
}

function gitShow(ref, filePath) {
  try {
    return run("git", ["show", ref + ":" + filePath]);
  } catch (error) {
    return null;
  }
}

function parseProjectPath(headRefName) {
  const match = headRefName.match(/^cms\/projects\/(.+)$/);
  if (!match) {
    return null;
  }

  return {
    slug: match[1],
    filePath: "src/projects/" + match[1] + ".md",
  };
}

function normalizeProjectData(data) {
  const copy = JSON.parse(JSON.stringify(data || {}));
  delete copy.draft;
  return copy;
}

function listOpenCmsPullRequests() {
  const output = runGh([
    "pr",
    "list",
    "--state",
    "open",
    "--json",
    "number,headRefName,title,labels",
    "--limit",
    "100",
  ]);

  return JSON.parse(output).filter(function (pr) {
    return pr.headRefName.startsWith("cms/");
  });
}

function hasGitDiff(baseRef, headRef, filePath) {
  try {
    run("git", ["diff", "--quiet", baseRef + "..." + headRef, "--", filePath]);
    return false;
  } catch (error) {
    return true;
  }
}

function compareProjectContent(baseRef, headRef, filePath) {
  const baseRaw = gitShow(baseRef, filePath);
  const headRaw = gitShow(headRef, filePath);

  if (!baseRaw || !headRaw) {
    return { status: "missing", reason: "Could not read project file on one or both refs." };
  }

  if (!hasGitDiff(baseRef, headRef, filePath)) {
    return { status: "stale", reason: "No file changes to publish." };
  }

  const baseData = normalizeProjectData(matter(baseRaw).data);
  const headData = normalizeProjectData(matter(headRaw).data);
  const sameContent =
    JSON.stringify(baseData) === JSON.stringify(headData);

  if (sameContent) {
    return { status: "stale", reason: "Only formatting differs from master." };
  }

  return { status: "pending", reason: "Has unpublished content changes." };
}

function closePullRequest(number) {
  runGh(["pr", "close", String(number), "--delete-branch"]);
}

function printUsage() {
  console.log(
    [
      "Usage:",
      "  node scripts/cleanup-cms-workflow.js [--dry-run]",
      "  node scripts/cleanup-cms-workflow.js --discard <pr-number>",
      "",
      "Without flags, closes open CMS PRs that have no unpublished project changes.",
    ].join("\n")
  );
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const discardIndex = args.indexOf("--discard");
  const discardNumber =
    discardIndex !== -1 ? Number(args[discardIndex + 1]) : null;

  if (args.includes("--help")) {
    printUsage();
    return;
  }

  run("git", ["fetch", "origin", "master"]);

  if (discardNumber) {
    const pr = listOpenCmsPullRequests().find(function (item) {
      return item.number === discardNumber;
    });

    if (!pr) {
      console.error("Open CMS pull request #" + discardNumber + " not found.");
      process.exit(1);
    }

    if (dryRun) {
      console.log("Would discard #" + pr.number + " " + pr.title);
      return;
    }

    console.log("Discarding #" + pr.number + " " + pr.title + "...");
    closePullRequest(pr.number);
    console.log("Done.");
    return;
  }

  const pullRequests = listOpenCmsPullRequests();

  if (!pullRequests.length) {
    console.log("No open CMS editorial workflow pull requests.");
    return;
  }

  pullRequests.forEach(function (pr) {
    const project = parseProjectPath(pr.headRefName);
    if (!project) {
      console.log(
        "#" + pr.number + " " + pr.headRefName + ": skipped (unknown branch pattern)"
      );
      return;
    }

    const comparison = compareProjectContent(
      "origin/master",
      "origin/" + pr.headRefName,
      project.filePath
    );

    console.log(
      "#" + pr.number + " " + project.slug + ": " + comparison.status + " — " + comparison.reason
    );

    if (comparison.status === "stale" && !dryRun) {
      console.log("  Closing stale pull request...");
      closePullRequest(pr.number);
    }
  });

  if (dryRun) {
    console.log("Dry run only. Re-run without --dry-run to close stale pull requests.");
  }
}

try {
  if (require.main === module) {
    main();
  }
} catch (error) {
  if (error.message && error.message.includes("ENOENT")) {
    console.error("The GitHub CLI (gh) is required. Install it and run `gh auth login`.");
    process.exit(1);
  }

  console.error(error.message || error);
  process.exit(1);
}
