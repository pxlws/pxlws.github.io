#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 \"password\" [salt]" >&2
  echo "Generates a salted SHA-256 entry for data/project-gates.json" >&2
  exit 1
fi

password="$1"
salt="${2:-$(openssl rand -hex 8)}"
hash="$(printf '%s' "${salt}${password}" | openssl dgst -sha256 -hex | awk '{print $NF}')"

cat <<EOF
Add to data/project-gates.json:

  "project-slug": {
    "salt": "${salt}",
    "hash": "${hash}"
  }
EOF
