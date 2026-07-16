# PoB2 Build Toolkit

Generate and update **real, verified** Path of Exile 2 builds programmatically by driving
the actual Path of Building 2 engine headless. You write a small declarative **spec**;
the toolkit assembles the character in the real engine, rolls **only craftable affixes**,
computes real DPS/EHP, and emits a `pob.cool` / `pobb.in` import code (optionally writing
it straight into a guide's `pobCode`).

Why this exists: hand-writing PoB import codes or inventing item mods produces builds that
are wrong or don't import. This runs the genuine engine, so class/ascendancy/tree/gems/
items/jewels and every stat are exactly what PoB2 computes, and every item mod is a real
affix that can actually roll on that base in-game.

## Prerequisites (one-time)

- **Path of Building 2** installed (the PoE2 fork). Auto-detected at
  `%APPDATA%\Path of Building Community (PoE2)`.
- **LuaJIT**: `winget install DEVCOM.LuaJIT` (installs to `%LOCALAPPDATA%\Programs\LuaJIT`).
- **Python** on PATH (used only to zlib+base64 the export code).

No project build step; everything is driven by `run.ps1`.

## Quick start

```powershell
# From the repo root (POE2Build/):

# 1) Build a spec, print real stats, and write the code into a guide's pobCode:
./tools/pob2/run.ps1 -Spec ./tools/pob2/specs/sanguine-detonation.lua -Slug sanguine-detonation

# 2) Just build (no guide update) — code lands in tools/pob2/.cache/code.txt:
./tools/pob2/run.ps1 -Spec ./tools/pob2/specs/sanguine-detonation.lua

# 3) Regenerate data/gems.json (the gem DB behind the site's hover tooltips):
./tools/pob2/run.ps1 -ExportGems
```

With `-Slug`, the run writes **both** `pobCode` and `pobStats` (real engine DPS / crit /
life / ES / resists) into the guide — the build page renders `pobStats` as the stat strip
above the PoB frame, so the numbers can never drift from the actual build.

The run prints a line like:
```
BUILD OK  DPS=65623  Crit=82.7%  Life=2842  ES=1158  Res=75/75/75/40  tree=100/8asc
WARNINGS: CRAFT 'Azure Amulet': no craftable affix for 'increased Chaos Damage' | ...
```
**Read the WARNINGS.** Each one means a `want` you asked for cannot roll on that base — fix
the spec (that mod simply doesn't exist there) and re-run. No warning = every mod is real.

## Authoring a spec

A spec is a Lua file returning a table. See `specs/sanguine-detonation.lua` for a full
example. Fields:

```lua
return {
  name = "My Build",
  class = "Witch",              -- Witch|Ranger|Warrior|Sorceress|Huntress|Mercenary|Monk|Druid
  ascendancy = "Blood Mage",    -- by name
  level = 82,

  ascendancyNodes = { "Gore Spike", "Crimson Power" },  -- names or node ids; capped at 8 pts

  treeBudget = 100,             -- level 82 ≈ 105 available; leave headroom
  treeNodes = {                 -- PRIORITY ORDER; allocated (with auto-pathing) until budget.
    "Raw Destruction", 51184,   -- notable names OR node ids; jewel-socket ids go here too
    61419, 61834,               -- jewel sockets (must be allocated for jewels to slot)
  },

  skills = {
    { slot = "Weapon 1", main = true, gems = { "Hexblast", "Pinpoint Critical", ... } },
    { slot = "Gloves", gems = { "Despair", "Heightened Curse" } },
    { slot = "Boots",  gems = { "Blink" } },
  },

  gear = {
    -- Preferred: craft form. `wants` are mod-text substrings matched against the base's
    -- REAL affix pool; the best-tier match from each unused group is rolled at 90%.
    -- Max 3 prefixes + 3 suffixes; list highest priority first.
    { base = "Attuned Wand", name = "Doom Whisper", wants = {
      "increased Chaos Damage", "increased Spell Damage",
      "Critical Hit Chance for Spells", "Critical Spell Damage Bonus", "increased Cast Speed" } },
    -- Or a raw PoB item-text string (advanced / uniques).
  },

  jewels = {
    { socket = 61419, base = "Emerald", name = "Doom Shard", wants = { "increased Elemental Damage" } },
  },
}
```

### Rules the engine enforces for you
- **Tree**: nodes allocate in priority order until `treeBudget`; pathing/travel nodes are
  added automatically. Over-budget entries are skipped (logged).
- **Ascendancy**: hard cap of 8 points; extra notables are skipped (logged).
- **Gear**: 3 prefixes + 3 suffixes max; each `want` resolves to the highest-tier real
  affix in an unused mod group. Unmatched wants are logged, never faked.
- **Off-hand**: a `Focus` base auto-equips to the Weapon 2 slot.

## Discovery (find real ids/names/affixes to author a spec)

```powershell
./tools/pob2/run.ps1 -Discover nodes   -Query "chaos"            # notables (default class Witch), nearest first
./tools/pob2/run.ps1 -Discover nodes   -Query "life" -Class Monk
./tools/pob2/run.ps1 -Discover gems    -Query "curse"            # active + support gems (+ reqInt)
./tools/pob2/run.ps1 -Discover bases   -Query "wand"             # item base types
./tools/pob2/run.ps1 -Discover affixes -Query "Amethyst Ring"    # REAL craftable affixes on a base
```

`-Discover affixes` is the important one for itemization: it lists exactly which
prefixes/suffixes (with roll ranges) can appear on a base, so your `wants` always hit.

## Hoverable gems in guide prose (Maxroll-style)

Write a gem anywhere in a guide's section HTML as:

```html
<span class="gem" data-gem="Hexblast">Hexblast</span>
```

`js/guide.js` lazy-loads `data/gems.json` (only if the page has gem chips), colours the
chip by type (purple = active, gold = support), and shows a hover/focus tooltip with the
gem's **real in-game description, tags and Int requirement**. Unknown names are rendered
greyed-out rather than lying — regenerate the DB with `-ExportGems` after a patch.

## Files

| File | Role |
|------|------|
| `run.ps1` | Entry point. Detects engine + LuaJIT, handles paths, encodes the code, updates guides. |
| `make_build.lua` | CLI over the harness: `build` and `discover` commands. |
| `pob_harness.lua` | Library: boots the engine; `Builder` (class/tree/gems/`craftItem`/stats/saveXML); discovery. |
| `HeadlessWrapper.lua` | PoB's headless bootstrap (from the PoB2 repo). |
| `specs/*.lua` | Build definitions (declarative). |
| `.cache/` | Scratch: `build.xml`, `stats.json`, `code.txt` from the last run (gitignored). |

## How it works (and the gotchas it handles)

1. LuaJIT boots PoB2's real Lua with graphics stubbed; CWD is the install dir and module
   paths are kept **relative** because the install path has non-ASCII chars LuaJIT's file
   IO can't open. `run.ps1` also passes **8.3 short paths** for the same reason.
2. The engine loads the real 0_5 passive tree, gem DB, item bases and **affix pools**.
3. `craftItem` reads each base's affix pool, keeps only affixes with spawn weight > 0 on
   that base (i.e. actually craftable), matches your `wants`, and rolls a concrete in-range
   value. So the item text is real affixes at real values.
4. `SaveDB` serialises the build to canonical PoB2 XML; `run.ps1` zlib+base64url-encodes it
   into the share code that `pob.cool` / `pobb.in` import.

## Updating a build

Edit the spec, re-run with `-Slug <guide>`, commit. That's it — the guide's embedded
viewer picks up the new `pobCode`.
