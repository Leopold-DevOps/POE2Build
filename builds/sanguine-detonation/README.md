# Sanguine Detonation — Research & Build Data

Research, gear recommendations, and synergy analysis for the **Sanguine Detonation** (Hexblast Blood Mage · Chaos Detonation) build.

## Files

### `research/synergistic-gear.json`
Comprehensive synergy breakdown: the build's four pillars (life, crit, chaos, curse), unique item candidates, base item tiers, and a synergy matrix explaining how stats feed each other.

**Use this for:** Understanding what items synergize with the build's core loop (life → Gore Spike damage → Hexblast crits → Despair curse → detonations → Life Remnants → overflow life).

### `research/gear-checklist.json`
Slot-by-slot shopping checklist with must-have stats, ideal rolls, and damage/defense floors by progression stage (acts 1–2, act 3, early maps, mid maps, late maps).

**Use this for:** Making gear decisions when leveling or gearing. Quick reference: "Do I have movement speed on boots?" "Is my life high enough for maps?"

### `research/mods-priority.json`
Mod tier lists by stat type, slot-specific mod priorities (S/A/B tiers), and a quick-eval formula for any item.

**Use this for:** Evaluating gear on the trade site or rare drops. "Is +15 cast speed worth losing 30 life?" Use the tier lists and formula.

## How to Use

1. **Gear shopping**: Load `gear-checklist.json` → find your character level → check which stats are must-haves for your slots.
2. **Item evaluation**: Load `mods-priority.json` → find your slot → check S/A/B tiers → compare candidate items.
3. **Synergy deep-dive**: Load `synergistic-gear.json` → read `synergy_pillars` and `synergy_matrix` to understand how stats interact.
4. **Build progress**: Use all three together—checklist sets the floor, mods-priority orders the preference, synergistic-gear explains the *why*.

## Key Principles

From the guide:
- **Triple-dip stat**: Maximum life is simultaneously defense, spell-fuel (Sanguimancy), and damage (Gore Spike). Every life node is a damage node post-ascendancy.
- **Loop**: Life → Gore Spike → Crits → Hexblast Detonations → Remnants → Life Overflow → back to Gore Spike.
- **Curse effect is a hidden multiplier**: Despair reduces chaos resistance; resistance reduction past 0% multiplies damage harder than "+X% damage" mods.

## Research Gaps (TODO)

- [ ] Poll poe2-mcp for active trade data (prices, availability of top-synergy items)
- [ ] Tier-list actual unique bases (e.g., early vs. late game The Covenant viability)
- [ ] Analyze passive tree wheels feeding life for budget checks per level bracket
- [ ] Create a leveling progression guide (acts, maps tier-0 → tier-3)
- [ ] Compare Crimson Power vs. Vitality Siphon endgame (cost/benefit)

## Usage by the Pipeline

The `poe2-mcp` AI pipeline can:
1. Reference these files to ground gear recommendations in data.
2. Generate gear shopping lists by reading `gear-checklist.json` for the target progression stage.
3. Evaluate unique items by cross-referencing `synergistic-gear.json`.
4. Justify mod tier choices using `mods-priority.json`.
