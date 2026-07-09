#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKER_DIR="$ROOT/workers/decap-oauth"

echo "Decap CMS OAuth proxy setup"
echo "==========================="
echo

cd "$WORKER_DIR"

is_wrangler_authenticated() {
  npx wrangler whoami 2>&1 | grep -qv "not authenticated"
}

if ! is_wrangler_authenticated; then
  echo "Step 1: Log into Cloudflare"
  echo "A browser window should open. Approve access, then return here."
  echo
  npx wrangler login
fi

if ! is_wrangler_authenticated; then
  echo "Cloudflare login did not complete. Run: npx wrangler login"
  exit 1
fi

echo
echo "Step 2: Deploy the OAuth worker (to get your workers.dev URL)"
DEPLOY_OUTPUT="$(npx wrangler deploy 2>&1 | tee /dev/stderr)"

WORKER_URL="$(echo "$DEPLOY_OUTPUT" | grep -Eo 'https://joneckert-cms-auth[^ ]*workers\.dev' | head -1)"
if [[ -z "$WORKER_URL" ]]; then
  echo
  echo "Could not detect the worker URL from deploy output."
  echo "Run: cd workers/decap-oauth && npx wrangler deploy"
  exit 1
fi

echo
echo "Worker URL: $WORKER_URL"
echo
echo "Step 3: Create a GitHub OAuth App"
echo "  https://github.com/settings/applications/new"
echo "  Homepage URL:            $WORKER_URL"
echo "  Authorization callback:  $WORKER_URL/callback"
echo
read -r -p "Press Enter after the OAuth App is created..."

echo
echo "Step 4: Add GitHub OAuth secrets to the worker"
echo "IMPORTANT: use wrangler secrets (encrypted), NOT plain dashboard variables."
echo "Plain variables are wiped on every deploy and cause GitHub 404 login errors."
npx wrangler secret put GITHUB_OAUTH_ID
npx wrangler secret put GITHUB_OAUTH_SECRET

echo
echo "Step 5: Update admin/config.yml"
node - "$WORKER_URL" <<'NODE'
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const workerUrl = process.argv[2].replace(/\/$/, "");
const configPath = path.join(__dirname, "..", "admin", "config.yml");
const config = yaml.load(fs.readFileSync(configPath, "utf8"));

config.backend.base_url = workerUrl;
config.backend.auth_endpoint = "/auth";
delete config.local_backend;

fs.writeFileSync(configPath, yaml.dump(config));
console.log(`Set backend.base_url to ${workerUrl}`);
NODE

node "$ROOT/scripts/sync-cms-local-config.js"

echo
echo "Done."
echo "Test the worker: curl $WORKER_URL"
echo "Then commit and push admin/config.yml, and try https://joneckert.com/admin/"
