const fs = require("fs");
const path = require("path");

const yaml = require("js-yaml");

const root = path.join(__dirname, "..");
const configPath = path.join(root, "admin", "config.yml");
const localPath = path.join(root, "admin", "config.local.yml");

const config = yaml.load(fs.readFileSync(configPath, "utf8"));

config.local_backend = true;
config.backend = {
  name: "proxy",
  proxy_url: "http://localhost:8081/api/v1",
  branch: "master",
};

const header = [
  "# Auto-generated from admin/config.yml — do not edit by hand.",
  "# Regenerate: node scripts/sync-cms-local-config.js",
  "# Requires `npm run cms` running alongside the dev server.",
  "",
].join("\n");

fs.writeFileSync(localPath, header + yaml.dump(config));
console.log("Updated admin/config.local.yml");
