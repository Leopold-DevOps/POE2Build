# Wand Crafting Research — Sanguine Detonation (Attuned Wand)

**Patch:** PoE2 0.5 (Return of the Ancients) · **Generated:** 2026-07-16
**Status:** ⚠️ **PARTIALLY RETRACTED — DO NOT CRAFT FROM THIS YET.** See §0.

---

## 0. ⚠️ Corrections (read first)

Two errors were found in the first version of this document. Both are corrected below,
but the headline result is **not yet trustworthy**:

1. **The DPS matrix was methodologically unsound.** Wand variants were fed to the engine as
   *raw item text*, which bypasses mod-group and spawn-weight rules entirely — PoB will
   compute DPS for any text, craftable or not. So **357,492 DPS is "if this item existed",
   not "this item is craftable."** The relative ranking (levels ≫ crit) is probably still
   directionally right, but the winning item must be re-tested through the craft rules
   (`craftItem`, which enforces groups + weight>0) before it means anything.

2. **The Perfect Essence finisher is NOT deterministic.** It is **~33%**, not 100%.
   Perfect Essence removes a **random** mod; *Omen of Dextral Crystallisation* only
   restricts removal to the **suffix class**, not to the specific junk suffix. With 3
   suffixes you have a **1/3 chance to eat the junk one and a 2/3 chance to destroy a mod
   you wanted.** Corroborated by a 0.5 community source:
   > *"If you have a Wand/Staff with 2 very good Suffixes and 1 bad Suffix, you have a 33%
   > chance to get +3 Spell Levels instead of that bad Suffix."*
   This materially worsens §7/§8 — expect ~3× the essence attempts, and a real risk of
   destroying finished suffixes each time.

3. **DISPUTED — the three-`+level`-suffix stack (§2).** PoB's data lists
   `GlobalIncreaseSpellSkillGemLevelWeapon`, `GlobalIncreaseChaosSpellSkillGemLevelWeapon`
   and `EssenceSpellSkillLevel` as three *different groups*, which is why it allowed the
   stack. Community evidence confirms **two** stack (the well-known "**+7 wand**" =
   `+4 of the Wizard` + `+3 of the Essence`). Whether a *third* (elemental/chaos) level
   suffix can also sit on the same wand is **unverified**, and has been challenged as
   impossible. **Treat §2's 3-level suffix set as unproven.**

---

## 1. TL;DR

The build's current wand is **leaving ~2.7× DPS on the table** and is genuinely missing a
mod (it has 2 prefixes, not 3).

| | Current wand | Optimal wand |
|---|---|---|
| Prefixes | 2 (chaos, spell dmg) | **3** (chaos, spell dmg, gain-as-extra) |
| Suffixes | +5 chaos lvl, crit chance, crit multi | **+5 chaos lvl, +4 spell lvl, +3 essence lvl** |
| **Build DPS** | **130,792** | **357,492** |

**The single biggest lesson: on this wand, gem levels beat crit by ~4×.** Three stacked
`+level` suffixes (357k) vs three crit/cast suffixes (90k) on an otherwise identical build.

**Recommended craft:** ilvl 81 base → build the 3 prefixes + 2 level-suffixes with
**Omen-targeted Exalted Orbs**, leave one junk suffix → finish with **Perfect Essence of
Sorcery + Omen of Dextral Crystallisation** to convert that junk suffix into
`+3 to Level of all Spell Skills`.

**Honest cost note:** an exact divine price cannot be computed — see §8. Real affix spawn
weights are **not published for PoE2 by anyone** (§7), so the odds below are a stated model,
not a guarantee.

---

## 2. The target wand

Base: **Attuned Wand, item level 81+** (81 is a hard gate — see §4).

### Prefixes (3)
| # | Mod | Roll | Group / tier | ilvl |
|---|-----|------|--------------|------|
| 1 | `#% increased Chaos Damage` | **(105–119)%** | ChaosDamageWeaponPrefix T1 *Malevolent* | 81 |
| 2 | `#% increased Spell Damage` | **(105–119)%** | WeaponSpellDamage T1 *Runic* | 80 |
| 3 | `Gain #% of Damage as Extra Fire Damage` | **(28–30)%** | DamageGainedAsFire T1 *Flamebound* | 80 |

> Fire / Cold / Lightning versions of prefix #3 tested **identical** (357,492 DPS each) —
> take whichever you hit first. This is the mod your current wand is missing: **+32,884 DPS (+10%)**.

### Suffixes (3)
| # | Mod | Roll | Group / tier | ilvl | Source |
|---|-----|------|--------------|------|--------|
| 1 | `+# to Level of all Chaos Spell Skills` | **+5** | GlobalIncreaseChaosSpellSkillGemLevelWeapon T1 *of Armageddon* | 81 | normal |
| 2 | `+# to Level of all Spell Skills` | **+4** | GlobalIncreaseSpellSkillGemLevelWeapon T1 *of the Wizard* | 78 | normal |
| 3 | `+# to Level of all Spell Skills` | **+3** | EssenceSpellSkillLevel1H1 *of the Essence* | 72 | **Perfect Essence of Sorcery only** |

**Why all three stack:** they are three *different mod groups*, and Hexblast is a chaos
spell — so it receives **+12 gem levels** from the weapon alone. Nothing else on a wand
comes close.

**Key discovery:** `EssenceSpellSkillLevel1H1` is defined with `weightVal = {0}` — it
**cannot roll naturally by any means**. Perfect Essence of Sorcery is its only source.

---

## 3. Evidence — full 40-variant DPS matrix

Every combination tested on the real engine, identical build, only the wand swapped
(`scratchpad/pob-headless/wand_matrix.lua`, output `wand_matrix.tsv`).

| Rank | DPS | Crit | Prefixes | Suffixes |
|---|---|---|---|---|
| 1–3 | **357,492** | 81.0% | chaos + spell + gain-as-**(fire\|cold\|lightning)** | +5 chaos, +4 spell, +3 essence |
| 4–5 | 324,608 | 81.0% | chaos + spell (+mana) | +5 chaos, +4 spell, +3 essence |
| 6–8 | 294,766 | 81.0% | chaos + spell + gain-as-X | +5 chaos, +4 spell, **cast speed** |
| 11–13 | 259,353 | 94.7% | chaos + spell + gain-as-X | +5 chaos, +4 spell, **crit chance** |
| 14–16 | 245,327 | 81.0% | chaos + spell + gain-as-X | +5 chaos, +4 spell, **crit multi** |
| 38–40 | **90,177** | 94.7% | chaos + spell (+/- 3rd) | crit + crit + cast (**no levels**) |

**Readings:**
- **Levels ≫ crit.** Best-crit variants (94.7% crit) lose to level-stacking by ~100k DPS.
  Crit chance *looks* better on the character sheet and is worse on the damage sheet.
- **`+mana` is a dead prefix** — 324,608 with it, 324,608 without. Never take it.
- The 3rd suffix ranking is: **essence +3 lvl (357k) > cast speed (295k) > crit chance (259k) > crit multi (245k)**.

---

## 4. The real affix pool (why this is tractable)

An Attuned Wand at ilvl 82 has only **11 prefix groups** and **18 suffix groups** — only
one mod per group can exist, so the search space is small.

**Prefix groups (11):** ChaosDamageWeaponPrefix, ColdDamageWeaponPrefix, FireDamageWeaponPrefix,
LightningDamageWeaponPrefix, PhysicalSpellDamageWeaponPrefix, DamageGainedAsCold,
DamageGainedAsFire, DamageGainedAsLightning, WeaponSpellDamage, WeaponSpellDamageAndMana,
IncreasedMana.

**Suffix groups (18):** GlobalIncrease{Chaos,Cold,Fire,Lightning,Physical}SpellSkillGemLevelWeapon,
GlobalIncreaseSpellSkillGemLevelWeapon, SpellCriticalStrikeChance, SpellCriticalStrikeMultiplier,
IncreasedCastSpeed, Intelligence, ManaRegeneration, LightRadiusAndManaRegeneration,
ManaGainedFromEnemyDeath, LifeGainedFromEnemyDeath, LocalAttributeRequirements,
FreezeDamageIncrease, IgniteChanceIncrease, ShockChanceIncrease.
(+ `EssenceSpellSkillLevel` — exists but weight 0, essence-only.)

### ilvl gate — use an **item level 81+** base
| Target mod | Required ilvl |
|---|---|
| +5 Chaos Spell levels (T1) | **81** |
| Chaos Damage T1 (105–119%) | **81** |
| Spell Damage T1 / Gain-as-extra T1 | 80 |
| +4 Spell levels (T1) | 78 |

ilvl 81 gets you every T1 on the list. Do **not** craft on a lower base — you cannot
hit the two most valuable mods.

---

## 5. Crafting mechanics used (PoE2 0.5)

| Tool | Effect |
|---|---|
| **Orb of Transmutation** | Normal → Magic (1 mod) |
| **Orb of Augmentation** | Magic, add 1 mod |
| **Regal Orb** | Magic → Rare, add 1 mod |
| **Exalted Orb** | Rare, add 1 random mod (up to 6) |
| **Omen of Sinistral Exaltation** | next Exalted adds **prefix only** |
| **Omen of Dextral Exaltation** | next Exalted adds **suffix only** |
| **Omen of Greater Exaltation** | next Exalted adds **two** mods |
| **Lesser/Greater Essence** | Magic → Rare with a **guaranteed** mod |
| **Perfect Essence** | on a **Rare**: removes a random mod, adds its guaranteed (often essence-exclusive) mod |
| **Omen of Dextral Crystallisation** | next Perfect Essence removes **suffix only** |
| **Orb of Annulment** | removes a random mod |
| **Divine Orb** | rerolls values within existing ranges |

**Wand-relevant essences (from game data):**
| Essence | Forces on a Wand |
|---|---|
| Essence of Sorcery / Greater | Spell Damage T4 / T6 |
| **Perfect Essence of Sorcery** | **`+3 to Level of all Spell Skills` (essence-exclusive)** |
| Essence of Seeking / Greater | Spell Crit Chance T3 / T4 |
| Essence of Alacrity / Greater | Cast Speed T3 / T5 |

Because our essence mod is a **suffix**, and Perfect Essence *removes a random mod first*,
**Omen of Dextral Crystallisation is mandatory** — without it the essence can eat one of
your three finished prefixes.

---

## 6. Methods evaluated

### ❌ A. Chaos / re-roll spam on a finished rare
Chaos Orb removes one random mod and adds one random mod. With 5 of 6 mods correct, each
chaos has a 5/6 chance to destroy a mod you wanted. **Regressive — never do this.**

### ❌ B. Regal → un-targeted Exalt slams
Exalts add prefix *or* suffix at random. Probability the 3 free slots all land correct is
the raw joint probability of §7 (~1 in 2,800 finished items). Wastes exalts on the wrong
affix class. **Strictly dominated by C.**

### ❌ C. Greater Essence of Sorcery opener
Guarantees Spell Damage **T6 (45–54%)** — but we need **T1 (105–119%)**. The essence locks
a *bad tier* into the group you care about, blocking the T1. **Only Perfect Essence of
Sorcery is worth using, and only at the end.**

### ✅ D. Omen-targeted build + Perfect Essence finisher — **RECOMMENDED**
Split the problem: use omens so every exalt is spent on the affix class you still need,
and use the essence last (where it's deterministic and cannot be wasted).

### ⚠️ E. Buy a partially-crafted base and finish it
Almost always cheaper in practice than gambling from white (§8). Search trade for a wand
already carrying **+5 Chaos Spell levels** (the rarest, ilvl-81-gated mod), then finish
with D. **Do this if any listing exists** — one mod is ~1/18 to hit but trivial to buy.

---

## 7. Odds — model and its honest limits

> ### ⚠️ Read this before trusting any number here
> **Real PoE2 affix spawn weights are not obtainable.** Verified three ways:
> 1. PoB2's data stores weight `1` for every eligible mod (binary can/can't-roll only).
> 2. Your `poe2-mcp` extraction says so in its own metadata: *"Parallel weight-values list
>    reads empty in this extraction."*
> 3. **poe2db.tw states it directly: _"Modifier weight information cannot be obtained from
>    game files."_** Its Weights column is empty.
>
> So the odds below use a **uniform-group model**: every eligible mod group in an affix
> class is equally likely. This is *definitely wrong in detail* (rarer mods have lower
> weight in-game), and it is **optimistic for rare mods** like +5 Chaos Spell levels.
> Treat these as a **best case / relative ranking**, not a promise.

### Per-stage odds (uniform model)

**Suffixes** — need `+5 chaos lvl` *and* `+4 spell lvl` among 3 suffix slots (3rd is junk,
later eaten by the essence). Drawing 3 distinct groups from 18:

$$P=\frac{\binom{16}{1}}{\binom{18}{3}}=\frac{16}{816}=\mathbf{1.96\%}$$

**Prefixes** — need `chaos` + `spell dmg` + any one of 3 `gain-as-extra` groups, from 11:

$$P=\frac{1\cdot1\cdot3}{\binom{11}{3}}=\frac{3}{165}=\mathbf{1.82\%}$$

**Both on one item (un-targeted, method B):** 1.96% × 1.82% ≈ **0.036%** → ~**1 in 2,800**.

### Why omens change the game
Omens make each exalt land in the class you still need, so you no longer pay for wrong-class
rolls — but they do **not** choose *which* mod. Expected exalts to fill a class rise ~linearly,
while failures become *re-rollable per class* instead of scrapping the whole item:

| Step | Uniform-model chance | Expected tries |
|---|---|---|
| Hit `+5 chaos lvl` on one Dextral exalt | 1/18 = 5.6% | ~18 |
| Then `+4 spell lvl` on next Dextral exalt | 1/17 = 5.9% | ~17 |
| Hit `chaos dmg` on one Sinistral exalt | 1/11 = 9.1% | ~11 |
| Then `spell dmg` | 1/10 = 10% | ~10 |
| Then any `gain-as-extra` (3 of 9 left) | 33% | ~3 |
| Perfect Essence of Sorcery + Dextral Cryst. | **~33% (NOT 100% — see §0.2)** | **~3, and each failure eats a good suffix** |

> **§0.2 correction applied.** The essence step is the opposite of deterministic: it removes
> a *random* suffix. Each failed attempt destroys one of your finished suffixes, which you
> then have to re-exalt (with omens) before trying again. This is the single most expensive
> part of the craft and the main reason to consider buying instead (§6E).

**Tier is a second roll.** Hitting the *group* does not give T1 — e.g. Chaos Damage has 8
tiers. Landing T1 specifically is a further fraction (unknown weights; ilvl 81 at least
removes nothing from the pool). **Divine Orbs** then reroll values inside the T1 range.

---

## 8. Cost model (in Divine Orbs)

> **I could not obtain live prices.** poe.ninja's PoE2 currency API and poe2scout's API both
> returned 404 from here, and I will not invent numbers for something you'd spend real
> currency on. Below is the **quantity model** — the part that doesn't expire. Multiply by
> today's rates (poe.ninja/poe2 or in-game trade) to price it.

**Shopping list for method D (one serious attempt):**

| Item | Qty (uniform model, expected) | Your price | Subtotal |
|---|---|---|---|
| Attuned Wand, **ilvl 81+**, white | 1 (a few if resetting) | ______ | ______ |
| Orb of Transmutation / Augmentation | ~2 | ______ | ______ |
| Regal Orb | 1 | ______ | ______ |
| **Exalted Orb** | **~55–60** (18+17 suffix, 11+10+3 prefix) | ______ | ______ |
| **Omen of Dextral Exaltation** | ~35 (one per suffix exalt) | ______ | ______ |
| **Omen of Sinistral Exaltation** | ~24 (one per prefix exalt) | ______ | ______ |
| **Perfect Essence of Sorcery** | **~3** (33% per try, §0.2) | ______ | ______ |
| **Omen of Dextral Crystallisation** | **~3** (one per essence try) | ______ | ______ |
| *extra* Exalts + Omens to repair suffixes eaten by failed essences | ~2 × (omen+exalt) | ______ | ______ |
| Divine Orb (roll T1 values up) | ~5–20 | ______ | ______ |
| Orb of Annulment (recover from a bad slot) | 0–5 | ______ | ______ |

**The cost is dominated by omens**, not exalts — you need ~59 omens. Price those first;
if `Omen of Dextral Exaltation` is expensive, **method E (buy a base with +5 chaos levels
already on it) is almost certainly cheaper**, because it deletes the single most expensive
line (~18 exalts + ~18 omens).

**Decision rule:**
> If `(cost of ~18 Dextral Omens + ~18 Exalts)` > `(price of a wand already carrying +5 to
> Level of all Chaos Spell Skills)` → **buy the base, don't gamble.** Then finish with the
> prefix omens + Perfect Essence.

---

## 9. Recommended step-by-step

1. **Acquire base:** Attuned Wand, **item level 81+**. (Check trade first for one already
   carrying `+5 to Level of all Chaos Spell Skills` — §6E.)
2. **Transmute → Augment → Regal** to a rare (or Regal a lucky magic).
3. **Suffixes first** (they're the rarest and the ilvl-81 gate):
   Hold **Omen of Dextral Exaltation** → **Exalted Orb**. Repeat until you have
   **`+5 Chaos Spell levels`** and **`+4 Spell levels`**.
   *Leave the 3rd suffix as whatever junk lands — it is fuel for step 5.*
4. **Prefixes:** hold **Omen of Sinistral Exaltation** → **Exalted Orb** until you have
   `chaos damage`, `spell damage`, and any `gain-as-extra` element.
5. **Finisher (~33%, NOT deterministic — see §0.2):** hold **Omen of Dextral
   Crystallisation** + apply **Perfect Essence of Sorcery**. It removes **a random suffix**
   and adds **`+3 to Level of all Spell Skills`**. With 3 suffixes that's a **1/3** chance
   it removes the junk one; **2/3 of the time it destroys a good suffix**, which you must
   re-exalt (omen + exalt) before retrying.
   *Implication:* keep the junk suffix count low and accept ~3 essences on average.
6. **Divine Orb** to push rolls toward the top of each T1 range.

**Failure handling:** if a wrong mod lands in a class, do **not** chaos-spam. Use
**Orb of Annulment** (optionally with a Crystallisation omen to bias the class) or restart
on a fresh base — bases are the cheapest input.

---

## 10. Provenance & limitations

**Verified from real data:**
- Affix pool, groups, tiers, ilvl gates, roll ranges — PoB2 engine (`Data/ModItem.lua`),
  cross-checked against poe2db (Spell Damage T1 "Runic" 105–119% @ ilvl 80 — exact match).
- `EssenceSpellSkillLevel1H1` = Suffix, `+3 to Level of all Spell Skills`, `weightVal={0}`,
  granted by `CurrencyPerfectEssenceCaster` (Perfect Essence of Sorcery) — `Data/Essence.lua`.
- All DPS numbers — the real PoB2 engine on the actual build, 40 variants.

**Modelled / uncertain:**
- **Odds** — uniform-group model; real spawn weights are unpublished (§7). Rare mods are
  likely *worse* than stated.
- **Tier-within-group odds** — unknown, not modelled.
- **Prices** — not obtained; §8 is a quantity model to price yourself.

**Reproduce:**
```powershell
# Wand affix pool + groups/tiers/ilvl
./tools/pob2/run.ps1 -Discover affixes -Query "Attuned Wand"
# Re-run the DPS matrix
luajit scratchpad/pob-headless/wand_matrix.lua
```
