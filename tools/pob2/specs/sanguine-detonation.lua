-- Build spec: Sanguine Detonation (Witch / Blood Mage, chaos-crit Hexblast).
-- Declarative — the harness resolves node/gem names and rolls REAL craftable affixes.
-- Build it with:  tools\pob2\run.ps1 -Spec tools\pob2\specs\sanguine-detonation.lua -Slug sanguine-detonation
--
-- gear/jewel `wants` are matched (substring) against each base's REAL affix pool, so
-- every mod is a genuine PoE2 affix rolled within its real range. craftItem caps at
-- 3 prefixes + 3 suffixes; list highest-priority mods first.

return {
  name = "Sanguine Detonation",
  class = "Witch",
  ascendancy = "Blood Mage",
  level = 82,

  -- Priority order; the 8-point cap takes as many as fit. Sunder first — it sets base
  -- spell crit to 15% (the crit enabler), then Gore Spike (crit dmg per life).
  ascendancyNodes = { "Sunder the Flesh", "Gore Spike", "Crimson Power" },

  -- Priority-ordered tree (allocated until budget). Jewel-socket node ids inline so
  -- they get allocated within budget. Level-82 budget is ~105; 100 leaves headroom.
  treeBudget = 100,
  treeNodes = {
    -- core damage
    51184, 19125, 2335, 64046, 2138, 56063,
    -- jewel sockets (allocated so jewels can slot)
    61419, 61834, 7960, 26196,
    -- crit
    5501, 51335, 10398, 57204, 13823, 13724,
    -- curse + cast
    50485, 44293, 14934, 36302,
    -- life / ES / int
    2254, 116, 42077, 57110, 3215, 48774, 13542, 7344,
  },

  skills = {
    { slot = "Weapon 1", main = true,
      gems = { "Hexblast", "Pinpoint Critical", "Supercritical", "Chaos Mastery", "Magnified Area II", "Rapid Casting III" } },
    { slot = "Gloves",
      gems = { "Despair", "Heightened Curse", "Focused Curse" } },
    { slot = "Boots",
      gems = { "Blink" } },
  },

  -- Every `want` below matches a REAL affix confirmed to roll on that base (verified via
  -- `run.ps1 -Discover affixes -Query "<base>"`). Max 3 prefixes + 3 suffixes per item.
  gear = {
    -- Wand: THE damage item. Built via craftItem so group/weight rules are enforced
    -- (raw text would bypass them). Adding the missing 3rd prefix: "gain % of damage as
    -- extra <element>" — engine-tested at +33k DPS, and a real craftable wand prefix.
    -- NOTE: the +level suffix stacking rules are still being verified; see
    -- research/wand-crafting-plan.md §7.
    { base = "Attuned Wand", name = "Doom Whisper", wants = {
      "increased Chaos Damage", "increased Spell Damage", "of Damage as Extra Fire Damage",
      "Level of all Chaos Spell Skills", "Critical Hit Chance for Spells", "Critical Spell Damage Bonus" } },
    -- Focus off-hand: +2 spell levels + spell damage + ES (no Life — Focus can't roll it).
    { base = "Attuned Focus", name = "Sanguine Ward", wants = {
      "Level of all Spell Skills", "increased Spell Damage", "maximum Energy Shield",
      "Critical Spell Damage Bonus", "Critical Hit Chance for Spells", "to Intelligence" } },
    -- Body: ES (Crimson Power turns it into Life) + Life + resists + Int.
    { base = "Altar Robe", name = "Sanguine Shroud", wants = {
      "maximum Energy Shield", "maximum Life",
      "to Fire Resistance", "to Cold Resistance", "to Intelligence" } },
    { base = "Ancestral Tiara", name = "Doom Crown", wants = {
      "maximum Energy Shield", "maximum Life",
      "to Lightning Resistance", "to Fire Resistance", "to Intelligence" } },
    -- Gloves are defensive for a caster (only roll attack damage, so skip damage).
    { base = "Adorned Gloves", name = "Blood Grip", wants = {
      "maximum Life", "maximum Energy Shield",
      "to Cold Resistance", "to Lightning Resistance", "to Intelligence" } },
    { base = "Bangled Sandals", name = "Crimson Stride", wants = {
      "increased Movement Speed", "maximum Life", "maximum Energy Shield",
      "to Fire Resistance", "to Cold Resistance" } },
    -- Rings: one carries +spell levels; both add % Chaos Damage + spell crit + Life + resist.
    { base = "Amethyst Ring", name = "Doom Coil", wants = {
      "Level of all Spell Skills", "maximum Life", "increased Chaos Damage",
      "Critical Hit Chance for Spells", "to Fire Resistance" } },
    { base = "Amethyst Ring", name = "Blight Loop", wants = {
      "maximum Life", "increased Chaos Damage",
      "Critical Hit Chance for Spells", "to Lightning Resistance", "to Cold Resistance" } },
    -- Amulet: Life + spell damage + crit chance & multi (generic "Critical Damage Bonus").
    { base = "Azure Amulet", name = "Sanguine Noose", wants = {
      "maximum Life", "increased Spell Damage",
      "Critical Damage Bonus", "increased Critical Hit Chance", "to all Attributes", "to Lightning Resistance" } },
    { base = "Ornate Belt", name = "Crimson Girdle", wants = {
      "maximum Life", "maximum Energy Shield",
      "to Fire Resistance", "to Chaos Resistance", "to Lightning Resistance" } },
  },

  -- Jewels: all Emerald (one verified pool). PoB2 jewels lack chaos/spell-crit mods, so
  -- the best real pick for a boss-killer is % Damage vs Rare & Unique.
  jewels = {
    { socket = 61419, base = "Emerald", name = "Doom Shard", wants = { "increased Damage with Hits against Rare and Unique" } },
    { socket = 61834, base = "Emerald", name = "Blood Ember", wants = { "increased Damage with Hits against Rare and Unique" } },
    { socket = 7960,  base = "Emerald", name = "Grim Facet", wants = { "increased Damage with Hits against Rare and Unique" } },
    { socket = 26196, base = "Emerald", name = "Vile Prism", wants = { "increased Damage with Hits against Rare and Unique" } },
  },
}
