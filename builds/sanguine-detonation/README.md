# Sanguine Detonation — Research & Build Data

Research, gear recommendations, and synergy analysis for the **Sanguine Detonation** (Hexblast Blood Mage · Chaos Detonation) build.

## Files

### Core Synergy & Gear

### `research/synergistic-gear.json`
Comprehensive synergy breakdown: the build's four pillars (life, crit, chaos, curse), unique item candidates, base item tiers, and a synergy matrix explaining how stats feed each other.

**Use for:** Understanding what items synergize with the core loop (life → Gore Spike → crits → Hexblast → Despair → detonations → Remnants → overflow life).

### `research/gear-checklist.json`
Slot-by-slot shopping checklist with must-have stats, ideal rolls, and damage/defense floors by progression stage (acts 1–2, act 3, early maps, mid/late maps).

**Use for:** Making gear decisions. Quick ref: "Do I have movement speed on boots?" "Is my life high enough for maps?"

### `research/mods-priority.json`
Mod tier lists by stat type, slot-specific priorities (S/A/B tiers), and a quick-eval formula.

**Use for:** Evaluating gear trades. "Is +15 cast speed worth losing 30 life?"

### `research/trade-item-reference.json`
Trade site search templates per slot: exact stat targets, search progression steps, budget breakpoints per phase.

**Use for:** Building trade search strings. Templates show minimum targets and nice-to-haves per progression stage.

### Progression & Theory

### `research/leveling-progression.json`
Act-by-act guide with specific gear targets, skill gem rotations, ascendancy nodes, and common mistakes per phase.

**Use for:** Leveling. Shows what stats are mandatory at each act and maps tier; includes checklist.

### `research/skill-gem-progression.json`
Gem progression by phase (acts 1–2 Essence Drain → act 3 Despair introduction → level 41 Hexblast → maps scaling). Support gem roles and gem-level scaling.

**Use for:** Choosing skills and supports. Shows why each gem is picked and when it's swapped.

### `research/passive-tree-guide.json`
Key clusters, level milestones, pathing rules, and tier-by-tier checklist (acts → early/mid/late maps).

**Use for:** Tree pathing. Shows which clusters matter most and when to allocate them.

### `research/damage-scaling-analysis.json`
Stat scaling tiers (life → Gore Spike, crit chance, crit multiplier, curse effect), DPS calculator checklist, and phase-by-phase priorities.

**Use for:** Understanding scaling. Shows how stats interact (e.g., life is exponential via Gore Spike, curse effect is a hidden multiplier).

## How to Use These Files

### By Phase
- **Leveling (acts 1–40)**: Read `leveling-progression.json` + `skill-gem-progression.json` → grab targets from `gear-checklist.json` for your level bracket.
- **Early maps (tier 1–3)**: Use `passive-tree-guide.json` for tree checklist; `trade-item-reference.json` for search templates; `gear-checklist.json` for damage/defense floors.
- **Mid/late maps (tier 7–16)**: Cross-reference `damage-scaling-analysis.json` (what scales best) + `mods-priority.json` (which mods to upgrade).
- **Endgame optimization**: Use `synergistic-gear.json` (unique candidates) + `damage-scaling-analysis.json` (scaling priorities).

### By Task
- **Building a trade search**: Open `trade-item-reference.json`, find your slot, use the search progression template.
- **Evaluating a rare drop**: Open `mods-priority.json`, find your slot, cross-check S/A/B tiers.
- **Planning passive tree**: Open `passive-tree-guide.json`, find your level bracket, check the checklist.
- **Comparing damage investments**: Open `damage-scaling-analysis.json`, check stat_scaling_tiers to see which stat scales best for you.

## Key Principles

From the guide:
- **Triple-dip stat**: Maximum life is simultaneously defense, spell-fuel (Sanguimancy), and damage (Gore Spike). Every life node is a damage node post-ascendancy.
- **Loop**: Life → Gore Spike → Crits → Hexblast Detonations → Remnants → Life Overflow → back to Gore Spike.
- **Curse effect is a hidden multiplier**: Despair reduces chaos resistance; resistance reduction past 0% multiplies damage harder than "+X% damage" mods.

## Research Coverage

### ✓ Complete
- Synergy pillars & scaling mechanics
- Gear slot priorities & mod tier lists
- Trade search templates per slot & budget breakpoints
- Full leveling progression (acts 1–40, map tiers, checklists)
- Skill gem progression & support roles
- Passive tree clusters & level milestones
- Damage scaling analysis (stats to DPS conversion, phase priorities)

### TODO (Next Pass)
- [ ] Live trade data integration (poe2-mcp queries for item availability/prices)
- [ ] Unique item price tracking (The Covenant, Shavronne's, etc. viability by league)
- [ ] Boss-specific strategies (Despair duration vs. single-target DPS tradeoffs)
- [ ] Content-tier recommendations (which map types favor the build?)
- [ ] Crimson Power vs. Vitality Siphon comparison (gear cost/DPS/defense tradeoff)

## Usage by the Pipeline

The `poe2-mcp` AI pipeline can:
1. Reference these files to ground gear recommendations in data.
2. Generate gear shopping lists by reading `gear-checklist.json` for the target progression stage.
3. Evaluate unique items by cross-referencing `synergistic-gear.json`.
4. Justify mod tier choices using `mods-priority.json`.
