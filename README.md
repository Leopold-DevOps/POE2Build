# Exile Codex — Path of Exile 2 build guides

A static, dependency-free **directory of AI-written PoE2 build guides**.
Each guide pairs a long-form written field manual with an **embedded
[Path of Building](https://pobb.in/) view via pobb.in** — an interactive
passive tree and gear you can hover for real item tooltips, plus gems and
computed stats. We don't re-implement the tree or gear; pobb.in renders them
from a Path of Building 2 export code.

> Not a build planner — Path of Building already does that. This is a library
> of *guides* built on top of it.

## How it works

- **`index.html`** — the directory. Renders a searchable / filterable grid of
  guide cards from `data/guides.json` (`js/directory.js`).
- **`guide.html`** — one template for every guide. Reads `?build=<slug>`, loads
  `data/guides/<slug>.json`, and renders the written sections plus the pobb.in
  `<iframe>` (`js/guide.js`).
- **`data/guides.json`** — lightweight index (card metadata only).
- **`data/guides/<slug>.json`** — one file per guide: metadata, the pobb.in id,
  an optional raw PoB2 code, and the prose sections.
- **`css/app.css`** — shared dark-fantasy design system.

Everything is vanilla HTML/CSS/JS. No framework, no build step, no backend.

## Adding a build guide

1. **Make the build in Path of Building 2**, then share it to get a pobb.in
   link (`https://pobb.in/<id>`). The `<id>` is what the site embeds.
2. **Create `data/guides/<slug>.json`** — copy an existing guide as a template.
   Set `pobbId` to the pobb.in id. Optionally set `pobCode` to the raw PoB2
   export string (enables the "Copy PoB2 code" button). Fill in the `sections`
   array — each section is `{ "id", "kicker", "heading", "html" }`, and the HTML
   may use the shared classes (`.box`, `.rotation`, `.statgrid`, `.slot`,
   `.pill`, `ul.clean`, tables, `<details>` FAQ). Use single quotes for HTML
   attributes to keep the JSON clean.
3. **Append a card entry** to `data/guides.json` → `guides[]` (metadata only:
   `slug`, `title`, `class`, `ascendancy`, `archetype`, `damage`, `difficulty`,
   `budget`, `skill`, `tags`, `summary`).
4. Reload — the card appears in the directory and links to
   `guide.html?build=<slug>`.

> The AI/content pipeline in [`../poe2-mcp`](../poe2-mcp) is the intended guide
> generator: draft prose + a PoB2 code → upload to pobb.in for an id → emit the
> two JSON edits above.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Any static server works — the app only fetches JSON from `data/`.

## Deploy on Render

`render.yaml` configures this repo as a free static site (publish path `.`,
no build command). Push to GitHub and every commit redeploys.

## Notes

- The pobb.in embed requires pobb.in to keep serving builds without an
  `X-Frame-Options`/`frame-ancestors` restriction (currently it does). If a
  build ever refuses to iframe, the guide still shows the **Open full build on
  pobb.in** button as a fallback. A self-hostable open-source renderer
  ([`atty303/pob-web`](https://github.com/atty303/pob-web)) is the backup plan.
- The bundled `sanguine-detonation` guide currently uses a **placeholder**
  pobb.in id for layout — replace its `pobbId` with the real Hexblast Blood Mage
  build link.

---

Fan-made. Path of Exile 2 © Grinding Gear Games. Not affiliated with GGG.
