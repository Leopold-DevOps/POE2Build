# Sanguine Detonation — PoE2 Hexblast Blood Mage Planner

A lightweight, dependency-free build planner for a Path of Exile 2
**Hexblast Blood Mage**, deployable on Render as a free static site.

## Features

- **Passive Tree** — renders the *official* GGG tree export
  ([grindinggear/poe2-skilltree-export](https://github.com/grindinggear/poe2-skilltree-export))
  on a pan/zoom canvas. Click a node to allocate the shortest path to it from
  your current selection; right-click to unallocate. Search highlights nodes
  by name or stat text. Includes the full main tree plus the Blood Mage
  ascendancy cluster ("Focus Blood Mage" button jumps to it).
- **Gear** — a simulated PoE2 inventory (9 equipment slots + flasks and
  charms). Type mods one per line; a parser recognizes common lines
  (life, resistances, spell/chaos damage, crit, cast speed, added chaos…)
  and totals them.
- **Build Summary** — allocated notables/keystones, gear totals, and a
  shareable build code (base64) for moving builds between devices.
- **Guide** — the full "Sanguine Detonation" build guide (`guide.html`).

Everything is vanilla HTML/CSS/JS. No framework, no build step, no backend.
State persists in the browser via `localStorage`.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Any static server works — the app only needs to fetch `data/tree.min.json`.)

## Deploy on Render

1. Push this repo to GitHub (see below).
2. In the [Render dashboard](https://dashboard.render.com): **New → Blueprint**,
   pick this repo — `render.yaml` configures it as a free static site.
   (Or **New → Static Site**, publish directory `.`, no build command.)
3. Done. Every `git push` redeploys.

## Push to GitHub

```bash
git add -A
git commit -m "Sanguine Detonation planner"
git push origin main
```

## Updating tree data after a game patch

```bash
curl -sL https://raw.githubusercontent.com/grindinggear/poe2-skilltree-export/main/data.json -o data.json
python3 scripts/build-tree-data.py data.json data/tree.min.json
git commit -am "Tree data refresh" && git push
```

The script slims the ~5 MB official export to ~650 KB by keeping node
positions, names, cleaned stat text, node kind, and edges — plus only the
Blood Mage (`Witch2`) ascendancy. Edit `KEEP_ASCENDANCY` in
`scripts/build-tree-data.py` to plan a different ascendancy.

## Project layout

```
index.html            app shell (tabs: Tree / Gear / Build Summary / Guide)
guide.html            the written build guide
css/app.css           dark theme
js/app.js             tabs, state, persistence, build codes
js/tree.js            canvas tree renderer + allocation
js/gear.js            inventory + mod parser
data/tree.min.json    slimmed official tree data
scripts/build-tree-data.py   regenerates data/tree.min.json
render.yaml           Render blueprint (static site)
```

Tree data © Grinding Gear Games. Fan-made tool, not affiliated with GGG.
