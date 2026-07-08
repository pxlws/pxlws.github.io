#!/bin/sh
# Refresh gallery data from Dribbble. Run from repo root:
#   DRIBBBLE_TOKEN=your_token ./scripts/update-dribbble-shots.sh

set -e

TOKEN="${DRIBBBLE_TOKEN:?Set DRIBBBLE_TOKEN to your Dribbble access token}"

curl -s "https://api.dribbble.com/v2/user/shots?per_page=21&access_token=${TOKEN}" \
  | python3 -c "
import json, sys
shots = json.load(sys.stdin)
out = [
    {
        'title': s['title'],
        'html_url': s['html_url'],
        'image': s['images'].get('hidpi') or s['images'].get('two_x') or s['images']['normal'],
    }
    for s in shots
]
json.dump(out, sys.stdout, indent=2)
print()
" > data/dribbble-shots.json

echo "Updated data/dribbble-shots.json with $(python3 -c "import json; print(len(json.load(open('data/dribbble-shots.json'))))") shots."
