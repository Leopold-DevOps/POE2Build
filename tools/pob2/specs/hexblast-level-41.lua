-- Build spec: Hexblast Transition (Level 41 Mid-Game)
-- Witch / Blood Mage ascendancy (partial, 4 points) → Sanguine Detonation
--
-- This is a transitional build for level 41, when Hexblast becomes available.
-- It bridges from early game to the endgame Sanguine Detonation build.
-- Can farm maps at this level and serves as foundation for scaling.
--
-- Build it with: tools\pob2\run.ps1 -Spec tools\pob2\specs\hexblast-level-41.lua -Slug hexblast-level-41

return {
  name = "Hexblast Transition (Level 41)",
  class = "Witch",
  ascendancy = "Blood Mage",
  level = 41,

  -- Level 41 = 4 ascendancy points spent (foundation path)
  -- Take: Sanguimancy (free) + Sunder the Flesh (2 points) + Gore Spike (2 points)
  -- This locks in the crit foundation early
  ascendancyNodes = { "Sunder the Flesh", "Gore Spike" },

  -- Level 41 budget: roughly 41 points total
  -- Strategy: core damage, life nodes, early spell scaling, path toward endgame
  -- Don't over-extend; save points for respec at level 60+
  treeBudget = 41,
  treeNodes = {
    -- Life (PRIORITY 1: survivability first)
    116,     -- +12 life near start
    2254,    -- +12 life (more life wheel)
    7344,    -- +15 life (higher tier)
    42077,   -- +12 life (upper area)

    -- Spell damage (PRIORITY 2: basic scaling)
    2138,    -- Increased spell damage node
    64046,   -- More spell damage
    19125,   -- Damage/casting node

    -- Crit foundation (PRIORITY 3: Sunder sets to 15%, scale it)
    51335,   -- +crit chance node
    5501,    -- More crit (on the way up)

    -- Curse scaling (PRIORITY 4: prep for Despair)
    50485,   -- Curse effect node

    -- Cast speed (PRIORITY 5: QoL, allows faster spellcasting)
    36302,   -- Cast speed cluster

    -- Remaining points: flex (aim for ~6-8 more life or crit)
    57110,   -- Extra life node
    13542,   -- Another life option
  },

  -- Level 41 gem setup is LIMITED compared to endgame
  -- Early supports are: Pinpoint Critical, basic damage/utility
  -- IMPORTANT: Real gem names must exist in PoE2 gem pool
  skills = {
    { slot = "Weapon 1", main = true,
      -- Hexblast is THE skill at this level
      -- Supports: keep it simple, focus on damage/crit synergy
      gems = { "Hexblast", "Pinpoint Critical" } },

    { slot = "Gloves",
      -- Despair is available early for curse setup
      -- No room for 3-link yet, just the curse
      gems = { "Despair" } },

    { slot = "Boots",
      -- Mobility spell (Blink or similar, if available)
      gems = { "Blink" } },
  },

  -- Level 41 gear recommendations (mid-tier rares, no uniques required)
  gear = {
    -- Wand: early version, NO crafting (get random rare wand)
    -- Focus on: +1 spell levels if lucky, spell damage, life
    { base = "Attuned Wand", name = "Early Hexblast Wand", wants = {
      "increased Spell Damage",
      "maximum Life",
    }},

    -- Off-hand: Focus (int scaling helps gear requirements)
    { base = "Attuned Focus", name = "Early Spellcaster Focus", wants = {
      "maximum Energy Shield",
      "increased Spell Damage",
    }},

    -- Body armor: ES robe for endurance, life for survivability
    { base = "Altar Robe", name = "Survivalist Robe", wants = {
      "maximum Energy Shield",
      "maximum Life",
      "to Fire Resistance",
    }},

    -- Head: Balance ES and life
    { base = "Ancestral Tiara", name = "Spell Tiara", wants = {
      "maximum Energy Shield",
      "maximum Life",
    }},

    -- Gloves: Defense focused (casters don't get attack damage on gloves)
    { base = "Adorned Gloves", name = "Early Gloves", wants = {
      "maximum Life",
      "to Cold Resistance",
    }},

    -- Boots: Resistance filler + life
    { base = "Bangled Sandals", name = "Early Boots", wants = {
      "increased Movement Speed",
      "maximum Life",
      "to Lightning Resistance",
    }},

    -- Rings: early versions, no crafting
    { base = "Amethyst Ring", name = "Early Ring 1", wants = {
      "maximum Life",
      "to Fire Resistance",
    }},

    { base = "Amethyst Ring", name = "Early Ring 2", wants = {
      "maximum Life",
      "to Cold Resistance",
    }},

    -- Amulet: spell damage + attributes + life
    { base = "Azure Amulet", name = "Early Amulet", wants = {
      "maximum Life",
      "increased Spell Damage",
      "to Lightning Resistance",
    }},

    -- Belt: basic resistances and life
    { base = "Ornate Belt", name = "Early Belt", wants = {
      "maximum Life",
      "to Fire Resistance",
    }},
  },

  -- No jewels at level 41 (not enough sockets allocated yet)
  jewels = {},
}
