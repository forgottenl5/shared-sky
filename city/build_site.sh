#!/usr/bin/env bash
# Build the public static site into docs/ (GitHub Pages). Templates hold public links only; city/public_text.json and lab/public_text.json are kept for any future public-only text swaps.
# Usage: city/build_site.sh <houston data json> <dfw data json>   (data from planned/export_city.js, METRO=dfw for DFW)
set -euo pipefail; cd "$(dirname "$0")/.."
H=${1:?houston data} D=${2:?dfw data}
mkdir -p docs && cp city/site_index.html docs/index.html && touch docs/.nojekyll
rm -rf docs/vendor && cp -r vendor docs/vendor   # three.js and fonts served from the site itself (no CDN, no Google Fonts)
TEXT=city/public_text.json node city/build_city.js "$H" docs/houston.html
TEXT=city/dfw_text.json,city/public_text.json GROW=city/buildout_data_dfw.json node city/build_city.js "$D" docs/dfw.html city/osm_dallas.json
node lab/build_lab.js docs/lab.html
node taxi/build_airtaxi.js docs/airtaxi.html
node taxi/build_shared.js docs/shared.html
node lab/build_findings.js   # docs/findings.html and docs/about.html
node -e "const fs=require('fs');let s=fs.readFileSync('docs/lab.html','utf8');for(const [a,b] of JSON.parse(fs.readFileSync('lab/public_text.json','utf8'))){if(!s.includes(a))throw new Error('lab text not found: '+a);s=s.split(a).join(b);}fs.writeFileSync('docs/lab.html',s)"
# Private strings to block are read from an untracked file (.private_patterns, one grep -E pattern per line), so the check itself leaks nothing.
PAT='claude\.ai'; [ -f .private_patterns ] && PAT="$PAT|$(grep -v '^#' .private_patterns | paste -sd'|')" || echo "note: no .private_patterns file; checking claude.ai links only"
if grep -rl -i -E "$PAT" docs; then echo "PRIVATE LINK OR STRING FOUND - do not publish"; exit 1; fi
# no script, stylesheet or font may come from another server (links to sources are fine)
if grep -nE '<script[^>]+src="https?://|<link[^>]+rel="(stylesheet|preconnect)"[^>]+href="https?://|url\(https?://' docs/*.html; then echo "OUTSIDE RESOURCE FOUND - self-host it"; exit 1; fi
# the repository is private: no page may link to it until it is made public
if [ -z "$SHARED_SKY_PUBLIC" ] && grep -l "github.com/forgottenl5" docs/*.html; then echo "LINK TO PRIVATE REPOSITORY FOUND - remove it or make the repo public first"; exit 1; fi
ls -la docs
