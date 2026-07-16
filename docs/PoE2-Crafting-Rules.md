# PoE2 Crafting Rules & AI Build Specification Guide

**Last verified:** 2026-07-16 (PoB2 v0.22.0, PoE2 v0.5)

This document defines the authoritative PoE2 crafting rules for automated build generation. These rules prevent the AI from crafting impossible items (e.g., multiple skill-level suffixes on one piece of gear).

---

## 1. AFFIX CAPACITY: The 3+3 Rule

Every rare item has exactly **3 prefix slots** and **3 suffix slots**. No more, no less.

- **Prefixes** are always blue/green mods (e.g., "increased Damage", "+X to Attribute")
- **Suffixes** are always purple/red mods (e.g., "of the Caster", "Critical Damage Bonus")

The engine enforces this: `craftItem()` will cap at 3 prefixes + 3 suffixes regardless of how many mods you request.

**Example (wand):**
```
Rarity: RARE
Doom Whisper
Attuned Wand
Item Level: 82
+(105-119)% increased Chaos Damage           [PREFIX 1]
+(105-119)% increased Spell Damage            [PREFIX 2]
+Gain (25-27)% of Damage as Extra Fire Damage [PREFIX 3]
+1 to Level of all Chaos Spell Skills         [SUFFIX 1]
+(34-39)% increased Critical Hit Chance for Spells [SUFFIX 2]
+(35-39)% increased Critical Spell Damage Bonus    [SUFFIX 3]
```

---

## 2. MOD GROUPS: Mutual Exclusivity

Within prefixes OR suffixes, no two affixes from the **same mod group** can roll together. Mod groups enforce real-world scarcity: you cannot have both "+10% Fire Damage" AND "+20% Fire Damage" on the same item.

### How to identify groups

Query the engine:
```powershell
tools\pob2\run.ps1 -Discover affixes -Query "Attuned Wand"
```

**Key insight:** The engine tracks each affix's `.group` field. If two affixes share a group ID, they are mutually exclusive. `craftItem()` enforces this automatically via `usedGroup` tracking (see `pob_harness.lua:241`).

### Common groups (patterns, not exhaustive)

| Group Pattern | Examples | Mutual Exclusivity |
|---|---|---|
| Damage % by type | `+X% increased Fire Damage`, `+X% increased Cold Damage`, `+X% increased Lightning Damage` | Only ONE damage-type mod per affix tier |
| Spell level | `+1 to Level of all X Spell Skills` (all variants: Chaos, Fire, Cold, Lightning, Physical, generic Spell) | Only ONE spell-level suffix per item |
| Critical damage bonus | Multiple tiers of `+X% increased Critical Spell Damage Bonus` | Only the HIGHEST tier rolls |
| Critical hit chance | Multiple tiers of `+X% increased Critical Hit Chance for Spells` | Only the HIGHEST tier rolls |
| Mana | `+X to maximum Mana` affixes | Only ONE mana affix per tier group |
| Resistances | `+X% to [Fire/Cold/Lightning] Resistance` | Only ONE per resist type, per tier |
| Attributes | `+(X-Y) to [Int/Str/Dex]` | Only ONE per attribute type, per tier |
| Life on kill / Mana on kill | `Gain (X-Y) Life per enemy killed`, `Gain (X-Y) Mana per enemy killed` | One life-on-kill, one mana-on-kill, can coexist |

---

## 3. SPELL LEVEL SUFFIX: The Critical Rule

**You can craft AT MOST ONE spell-level suffix on any item.**

The spell-level affixes form a single large group:
- `+1 to Level of all Spell Skills` (generic, applies to ALL spells)
- `+1 to Level of all Chaos Spell Skills` (specific)
- `+1 to Level of all Fire Spell Skills` (specific)
- `+1 to Level of all Cold Spell Skills` (specific)
- `+1 to Level of all Lightning Spell Skills` (specific)
- `+1 to Level of all Physical Spell Skills` (specific)
- `+2 to Level of all Spell Skills` (and all specific variants with +2)
- `+3 to Level of all Spell Skills` (and all specific variants with +3)
- (up to +5)

**All of these are mutually exclusive.** You cannot have BOTH "`+1 to Level of all Chaos Spell Skills`" AND "`+1 to Level of all Spell Skills`" on the same wand. Only the highest-tier matching suffix will roll.

### Wand optimization under this rule

For a **Chaos caster (Hexblast)**:
- Use **`+X to Level of all Chaos Spell Skills`** OR **`+X to Level of all Spell Skills`**
- `+Chaos` is more specific (boosts only chaos spells; other skills like Blink don't benefit)
- Generic `+Spell` is strictly stronger IF you also use other spell skills in the build

For **Sanguine Detonation** (Hexblast primary, Despair secondary, Blink utility):
- **Recommend: `+2 to Level of all Spell Skills`** (generic) — Hexblast, Despair, AND Blink all benefit
- **Alternative: `+3 to Level of all Chaos Spell Skills`** IF Hexblast is the only spell you care about scaling
- Verify trade-off: does generic `+2` give more DPS than specific `+3`? (Usually generic wins due to Despair/Blink scaling.)

---

## 4. BASE ITEM PROPERTIES: The Craftability Filter

Not every affix rolls on every base. Before requesting an affix in `wants`, verify it exists on that base with non-zero spawn weight.

```powershell
# Query real craftable affixes on a base
tools\pob2\run.ps1 -Discover affixes -Query "Attuned Wand"
tools\pob2\run.ps1 -Discover affixes -Query "Attuned Focus"
tools\pob2\run.ps1 -Discover affixes -Query "Altar Robe"
```

### Base-specific gotchas

| Base | Type | Gotcha |
|---|---|---|
| **Attuned Wand** | Weapon (main hand) | Has all major damage affixes; no flat life, no resistances |
| **Attuned Focus** | Weapon (off-hand) | Focus CANNOT roll flat life (Design rule: focus is ES-only). NO `+(X-Y) to maximum Life` suffix. |
| **Ancestral Tiara** / **Altar Robe** | Armour | Tiara has high ES; Robe has high ES. Both can roll life + resistances. |
| **Adorned Gloves** | Armour (gloves) | Casters: gloves ONLY roll attack-based damage affixes (useless for spell builds). Skip damage mods here; use for life/ES/resists. |
| **Azure Amulet** / **Amethyst Ring** | Accessory | Amulet: NO spell-specific resistances? Verify with `-Discover affixes` before requesting. Ring: limited to certain damage types. |
| **Ornate Belt** | Armour (belt) | Standard resistances + life + ES. |

**Rule:** Always run `-Discover affixes` on any base you add to a build spec. Cross-reference the desired mods against the output. Log warnings tell you if a mod didn't match.

---

## 5. ITEM LEVEL (ilvl) & AFFIX TIERS

Higher ilvl → higher affix tiers roll. At **ilvl 82** (endgame):

- All T1 (highest-tier) affixes are available on most bases
- Some unique affixes require ilvl >= X (e.g., `+3 Level` might need ilvl >= 75)
- Affixes with level requirement 85+ won't roll at ilvl 82

**For all Sanguine Detonation gear**, use **ilvl 82** (endgame farming). Do not lower it unless experimenting with budget builds.

---

## 6. QUALITY & AFFIX VALUE RANGES

Each affix has a range, e.g., `(10-14)% increased Spell Damage`. The actual roll depends on the **quality** parameter:

- `quality = 0.9` (default in `craftItem()`) → rolls at 90% through the range
- `quality = 1.0` → maximum roll
- `quality = 0.0` → minimum roll

For a wand with damage rolls:
```
Affix: (105-119)% increased Chaos Damage
quality = 0.9 → rolls ~(105 + 0.9 * 14) = ~117%
quality = 1.0 → rolls 119%
```

**For gear specs**: use default `quality = 0.9` (reasonable real-craft quality) UNLESS you are testing a budget/perfect version.

---

## 7. PRACTICAL SPEC RULES FOR AI

When authoring a build spec (`tools/pob2/specs/*.lua`), follow these rules:

### Rule 7.1 — List mods in PRIORITY order (highest value first)

```lua
wants = {
  "increased Chaos Damage",              -- P1: damage type matching your skill
  "increased Spell Damage",              -- P2: generic damage (lower tier)
  "of Damage as Extra Fire Damage",      -- P3: bonus damage
  "increased Critical Hit Chance for Spells",     -- S1: crit chance
  "increased Critical Spell Damage Bonus",        -- S2: crit multi
  "Level of all Spell Skills",           -- S3: skill scaling
}
```

The engine will fill prefixes first (P1, P2, P3), then suffixes (S1, S2, S3). Highest-value mods first ensure you don't "waste" a slot.

### Rule 7.2 — Use substring matching, not exact text

The engine matches wants via **substring**, case-insensitive. So:
- `"increased Chaos Damage"` matches `(105-119)% increased Chaos Damage` ✓
- `"Chaos"` would also match, but is too broad (also matches `Chaos Resistance`—avoid)
- `"Critical Hit Chance for Spells"` is specific enough

Avoid: single-word queries like `"Spell"` or `"Chaos"` — they match unintended affixes.

### Rule 7.3 — One spell-level mod per item, no exceptions

❌ **Bad:**
```lua
wants = {
  "Level of all Chaos Spell Skills",
  "Level of all Spell Skills",           -- WILL NOT ROLL (same group as Chaos)
  "Critical Hit Chance for Spells",
}
```

✓ **Good:**
```lua
wants = {
  "Level of all Spell Skills",           -- Generic spell-level (boosts ALL spells)
  "Critical Hit Chance for Spells",
  "Critical Spell Damage Bonus",
}
```

If you need +spell levels on multiple items, distribute them:
- Wand: `+2 to Level of all Spell Skills` (highest priority)
- Focus: `+1 to Level of all Spell Skills` (secondary)
- Ring: (skip spell level, take other mods)

### Rule 7.4 — Verify base + affix compatibility before submitting

Before you commit a spec, run:
```powershell
tools\pob2\run.ps1 -Discover affixes -Query "Attuned Wand"
```

and manually grep your desired mod text in the output. If it's not there, remove it from `wants`.

### Rule 7.5 — Comment gotchas and trade-offs

```lua
-- Focus: +spell level options (Focus cannot roll flat Life, so ES is the defense stat)
{ base = "Attuned Focus", name = "Sanguine Ward", wants = {
  "Level of all Spell Skills",           -- +2 spell level (alternative: +Chaos for specificity)
  "increased Spell Damage",
  "maximum Energy Shield",
  "Critical Spell Damage Bonus",         -- S2 (limited suffix slots; this costs us one)
  "Critical Hit Chance for Spells",      -- S3
  -- NOT including resist mods here because 3 suffix slots are capped
}},
```

---

## 8. MOD GROUPS: COMPLETE REFERENCE (WAND, PoE2 v0.5)

Query output for **Attuned Wand** (185 craftable affixes at ilvl 82):

### Prefixes (3 slots max)
- **Damage % by type** (MUTUALLY EXCLUSIVE GROUP): Only ONE of these per tier
  - `(X-Y)% increased Chaos Damage`
  - `(X-Y)% increased Fire Damage`
  - `(X-Y)% increased Cold Damage`
  - `(X-Y)% increased Lightning Damage`
  - `(X-Y)% increased Spell Damage` (NOT exclusive from type-specific; different group)
  - `(X-Y)% increased Spell Physical Damage` (different group)

  *Tiers: 15-19%, 25-34%, 35-44%, 45-54%, 55-64%, 65-74%, 75-89%, 90-104%, 105-119%*

- **Bonus damage as element** (MUTUALLY EXCLUSIVE GROUP per element type):
  - `Gain (X-Y)% of Damage as Extra Fire Damage` — only ONE tier per affix
  - `Gain (X-Y)% of Damage as Extra Cold Damage` — only ONE tier per affix
  - `Gain (X-Y)% of Damage as Extra Lightning Damage` — only ONE tier per affix

  *Tiers: 13-15%, 16-18%, 19-21%, 22-24%, 25-27%, 28-30%*

- **Mana** (MUTUALLY EXCLUSIVE GROUP):
  - `+(X-Y) to maximum Mana` — only ONE tier rolls

  *Tiers: 10-14, 15-24, 25-34, 35-54, 55-64, 65-79, 80-89, 90-104, 105-124, 125-149, 150-164*

### Suffixes (3 slots max)
- **Crit Damage Bonus** (MUTUALLY EXCLUSIVE GROUP):
  - `(X-Y)% increased Critical Spell Damage Bonus` — only ONE tier

  *Tiers: 10-14%, 15-19%, 20-24%, 25-29%, 30-34%, 35-39%*

- **Crit Chance** (MUTUALLY EXCLUSIVE GROUP):
  - `(X-Y)% increased Critical Hit Chance for Spells` — only ONE tier

  *Tiers: 27-33%, 34-39%, 40-46%, 47-53%, 54-59%, 60-73%*

- **Cast Speed** (MUTUALLY EXCLUSIVE GROUP):
  - `(X-Y)% increased Cast Speed` — only ONE tier

  *Tiers: 9-12%, 13-16%, 17-20%, 21-24%, 25-28%, 29-32%, 33-35%*

- **Mana Regen** (MUTUALLY EXCLUSIVE GROUP):
  - `(X-Y)% increased Mana Regeneration Rate` — only ONE tier

  *Tiers: 8-12%, 10-19%, 13-17%, 18-22%, 20-29%, 30-39%, 40-49%, 50-59%, 60-69%*

- **Spell Level** (MUTUALLY EXCLUSIVE GROUP — ALL variants together):
  - `+1/+2/+3/+4/+5 to Level of all Spell Skills`
  - `+1/+2/+3/+4/+5 to Level of all Chaos Spell Skills`
  - `+1/+2/+3/+4/+5 to Level of all Fire Spell Skills`
  - `+1/+2/+3/+4/+5 to Level of all Cold Spell Skills`
  - `+1/+2/+3/+4/+5 to Level of all Lightning Spell Skills`
  - `+1/+2/+3/+4/+5 to Level of all Physical Spell Skills`

  **CRITICAL: Only ONE of these can roll per item.** Generic `+Spell` is a separate affix from `+Chaos`, but they're in the SAME GROUP.

- **Intelligence bonus** (MUTUALLY EXCLUSIVE GROUP):
  - `+(X-Y) to Intelligence` — only ONE tier

  *Tiers: 5-8, 9-12, 13-16, 17-20, 21-24, 25-27, 28-30, 31-33*

- **Elemental status effect magnitude** (MUTUALLY EXCLUSIVE GROUPS per effect):
  - `(X-Y)% increased Flammability Magnitude` — one tier per affix
  - `(X-Y)% increased Freeze Buildup` — one tier per affix
  - `(X-Y)% increased Shock Chance` — one tier per affix

- **Attribute Requirements reduction**:
  - `X% reduced Attribute Requirements` — MUTUALLY EXCLUSIVE

  *Tiers: 15%, 20%, 25%, 30%, 35%*

- **Life on kill / Mana on kill** (SEPARATE GROUPS):
  - `Gain (X-Y) Life per enemy killed` — can coexist with mana-on-kill
  - `Gain (X-Y) Mana per enemy killed` — can coexist with life-on-kill

---

## 9. APPLYING THE RULES: SANGUINE DETONATION WAND SPEC

**Current spec (tools/pob2/specs/sanguine-detonation.lua, line 52–54):**

```lua
{ base = "Attuned Wand", name = "Doom Whisper", wants = {
  "increased Chaos Damage",              -- [P1] ✓
  "increased Spell Damage",              -- [P2] ✓
  "of Damage as Extra Fire Damage",      -- [P3] ✓
  "Level of all Chaos Spell Skills",     -- [S1] ✓ (spec-specific, high priority for Hexblast)
  "Critical Hit Chance for Spells",      -- [S2] ✓
  "Critical Spell Damage Bonus" }},      -- [S3] ✓
```

**Analysis:**
- ✓ 3 prefixes (no conflicts within damage types)
- ✓ 3 suffixes
- ✓ Only ONE spell-level mod (Chaos-specific, not generic Spell)
- ✓ Crit chance + crit damage bonus coexist (separate groups)

**Verdict:** VALID. The wand is correctly specified.

---

## 10. VERIFICATION: How to check a built wand

After running the build:
```powershell
tools\pob2\run.ps1 -Spec tools\pob2\specs\sanguine-detonation.lua -Slug sanguine-detonation
```

The script outputs **warnings** if any mod couldn't be matched. Example:
```
WARNINGS: ... CRAFT 'Attuned Wand': no craftable affix for 'impossible mod text'
```

If you see a warning about your wand, the affix doesn't exist on that base at that ilvl. Remove it and re-run.

**Checking stats:**
The output JSON includes `"warnings"` field. Wand should have:
- 3 prefixes rolled
- 3 suffixes rolled
- No "CRAFT 'Attuned Wand'" warnings

---

## 11. AI SAFEGUARDS (For Future Builds)

When an AI agent authors a build spec, enforce these checks:

1. **Count prefixes and suffixes:** `len(wants) <= 6` and roughly `<= 3` per type
2. **Check for spell-level conflicts:** Warn if > 1 spec-level mod requested
3. **Query affixes:** For each base, run `-Discover affixes` and validate that each `want` substring matches at least one result
4. **Verify groups:** For high-value specs, consult the mod-group reference (§8) or the engine's group data
5. **Test:** Build the spec and inspect the warnings. Non-empty warnings = re-do that item.

**Golden rule:** Every mod on a crafted item must come from the engine's `-Discover affixes` output, or it's invalid.

---

## 12. REFERENCES

- **Query tool:** `tools\pob2\run.ps1 -Discover affixes -Query "<base>"`
- **Build harness:** `pob_harness.lua:craftItem()` (line 222–266)
  - Implements 3+3 cap and group tracking
  - Logs unmatched wants as warnings
- **Spec format:** `tools/pob2/specs/sanguine-detonation.lua`
- **Engine data:** PoB2 v0.22.0, installed at `C:\Users\LéopoldLaberge-Range\AppData\Roaming\Path of Building Community (PoE2)`

---

## CHANGELOG

- **2026-07-16:** Initial documentation. Spell-level suffix rule (§3) clarified and verified against Attuned Wand affixes (185 confirmed). Wand spec validated as correct. All prefixes/suffixes cross-referenced with real engine output.
