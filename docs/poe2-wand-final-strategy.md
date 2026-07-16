# PoE2 Wand Crafting: Final Strategy Summary

**Build:** Sanguine Detonation (Hexblast Blood Mage)  
**Target Wand:** 3 damage prefixes + 3 crit/level suffixes = 156k DPS  
**Date:** 2026-07-16

---

## THE KEY INSIGHT: Perfect Essence of Sorcery

In PoE2 v0.5, the single most valuable crafting tool for your wand is:

**Perfect Essence of Sorcery** → Adds `+3 to Level of all Spell Skills` (crafted suffix)

**Why?**
- This mod has `weightVal = { 0 }` — it cannot roll naturally
- Only available via:
  1. Perfect Essence of Sorcery (guaranteed, 1 use)
  2. Crafting bench (deterministic but costs divines)
- Hitting +3 via pure exalting is impossible (no natural spawn)
- Your alternative is +1 via exalt (8% spawn = ~12 exalts = 12 div)
- **Perfect Essence costs ~1 div for the same value as 12 div in exalts**

This changes everything. Your old PoE1-style strategy of trying to exalt for +1 is wasteful in PoE2.

---

## OPTIMAL WAND CRAFTING PATH (PoE2 v0.5 Specific)

### Step 1: Acquire Base + Essence (Cost: ~1.5 div, Time: 10 min)

1. Buy/farm white **Attuned Wand** (cheap, ~0.2–0.5 div)
2. Acquire **Perfect Essence of Sorcery** (farm beast/drops, or buy ~1 div)
3. Use essence on wand → **Instant +3 Spell Level suffix locked**

**Result after Step 1:**
- Affixes: 0/3 prefixes, 1/3 suffixes (crafted)
- Cost: ~1.5 div
- Risk: None

---

### Step 2: Lock Prefixes & Roll (Cost: ~20–30 div, Time: 30–45 min)

**Goal:** 3 high-tier damage prefixes

4. Exalt wand once (50% chance hits prefix naturally)
   - If suffix: Annul it (~1 div), retry
   - If prefix: proceed to step 5

5. Craft "Prefixes cannot be changed" (~5–8 div)
   - This locks your 1 prefix in place
   - Forces next exalts to add prefixes/suffixes only

6. Exalt again → add 2nd prefix (should roll, but might retry if bad tier)
   - If bad tier (e.g., Chaos 75-89% instead of 105-119%), you have two options:
     - **Option A:** Keep it, save 20 div (accept 5% DPS loss)
     - **Option B:** Annul it (~1 div), Exalt again (~1 div)

7. Exalt again → add 3rd prefix

**Target prefixes (ideally all T1):**
- Chaos Damage (105-119)% — 1% spawn
- Spell Damage (105-119)% — 1% spawn
- Fire Damage Extra (25-27)% — 3% spawn

**Expected cost:**
- 3 exalts (3 div) + annuls for bad tiers (5–10 div) + prefix lock craft (5–8 div) = **~15–20 div**
- If you accept lower tiers: **~10–15 div**

**Result after Step 2:**
- Affixes: 3/3 prefixes (T1–T2 damage), 1/3 suffixes (crafted)
- Cost so far: ~16–35 div
- Risk: Low (locked prefixes prevent accidents)

---

### Step 3: Roll Remaining Suffixes (Cost: ~20–40 div, Time: 30–45 min)

**Goal:** 2 more crit-related suffixes

8. Remove "Prefixes cannot be changed" craft (frees up bench slot)

9. Craft "Suffixes cannot be changed" (~5–8 div)
   - Forces next exalts to add prefixes only
   - Protects your crafted +3 Spell Level

10. Exalt repeatedly until you hit **Critical Hit Chance for Spells**
    - Spawn rate varies by tier:
      - T1 (60-73%): 0.5% spawn = ~200 exalts (DON'T PUSH FOR THIS)
      - T5 (34-39%): 7.5% spawn = ~13 exalts = ~13 div ← AIM FOR THIS
    - Expected: 10–15 exalts needed (~10–15 div)

11. Annul the "Prefixes cannot be changed" craft (clean up)

12. Craft "Suffixes cannot be changed" again

13. Exalt repeatedly until you hit **Critical Spell Damage Bonus**
    - Spawn rate:
      - T1 (35-39%): 2% spawn = ~50 exalts (very expensive)
      - T2 (30-34%): 3% spawn = ~33 exalts (still expensive)
      - T3-T5: 6-9% spawn = ~10–15 exalts ← ACCEPT MID-TIER
    - Expected: 10–20 exalts if you accept T3–T5 (~10–20 div)

14. Done! Remove suffix lock craft, your wand is complete.

**Expected cost for Step 3:**
- Suffix lock crafts: 2 × (~5–8 div) = ~10–16 div
- Exalts for Crit Chance: ~10–15 div
- Exalts for Crit Damage: ~10–20 div (depending on how hard you push)
- **Total Step 3: ~30–50 div**

**Result after Step 3:**
- Affixes: 3/3 prefixes + 3/3 suffixes (complete)
- Estimated DPS: 140k–155k (depending on tiers hit)
- Cost so far: ~50–85 div total

---

## COST BREAKDOWN: Total Expected Investment

| Component | Cost (div) | Notes |
|---|---|---|
| White base | 0.2–0.5 | Abundant drops |
| Perfect Essence of Sorcery | 1–2 | Farmable, guarantees +3 Spell Level |
| Prefix lock craft (1×) | 5–8 | Bench cost |
| Exalts for prefixes | 10–15 | Aiming for T1–T2 damage |
| Suffix lock crafts (2×) | 10–16 | Bench costs |
| Exalts for Crit Chance | 10–15 | Aiming for T5, ~13 tries |
| Exalts for Crit Damage | 10–20 | Accept T3–T5 to save cost |
| **TOTAL** | **~50–80** | **Median: ~65 divines** |

---

## COMPARISON: Other Strategies

### Strategy 1A: Your Current Method (Magic Base + Regal) — IF IT WORKS

**Pros:**
- If you farm a +5 magic base, regal outcome gives you 1 free suffix
- Saves ~5–8 div on suffix farming

**Cons:**
- Farming +5 magic bases is tedious (rare drops)
- Regal has 50% chance to brick with bad suffix (restart cost ~40+ div)
- Expected cost if it works: 40–50 div
- Expected cost if it bricks: 90–100 div total

**Verdict:** Risky. Only use if you already have the base.

### Strategy 2: Pure Exalt (No Essence)

**Cost breakdown:**
- Prefixes via exalt: 15–25 div
- Spell Level +1 via exalt: ~12 div (8% spawn rate)
- Crit Chance via exalt: ~10 div
- Crit Damage via exalt: ~10–20 div
- **Total: ~50–70 div**

**Verdict:** Roughly same cost as Perfect Essence, but takes MORE time (more exalts) and loses the +3 vs. +1 Spell Level advantage (~5% DPS).

### Strategy 3: Buy Pre-crafted Wand (Market)

**Cost:** ~80–120 divines (depending on market rates)

**Verdict:** Only if you want instant gratification. Crafting saves 15–40 divines.

---

## ACTUAL RECOMMENDED PATH (For You)

**Given your experience with PoE1 crafting and comment about starting with magic bases:**

1. **Do you already have +5 magic bases farmed?**
   - YES → Use your magic base + regal strategy (~40–50 div if it works)
   - NO → Use Perfect Essence + exalt strategy (~65 div, more reliable)

2. **Can you afford the variance?**
   - If regal bricks (50% chance), you lose the entire 40+ div investment
   - Perfect Essence strategy is deterministic (no restart risk)

3. **Time available?**
   - Exalting is faster than farming magic bases
   - Both paths take 1–2 hours with good RNG

**My recommendation:** Use **Perfect Essence of Sorcery strategy** (~65 div, 1–2 hours, guaranteed result) unless you already have the bases.

---

## ENDGAME OPTIMIZATION: Desecrated Mod

**One-time corruption for a 4th suffix:**

After your wand is complete (3P + 3S), you can:
- Use a Vaal or corruption currency
- Roll for a random desecrated suffix
- If good (e.g., damage mod): huge DPS boost
- If bad: wand is bricked

**Examples of good desecrated suffixes:**
- Aspect grants (Aspect of X Skill)
- Infusion effects
- (Others unique to PoE2)

**When:** Only after you have a finished wand worth protecting.

**Not recommended for:** Initial craft (too risky to destroy a 65 div item on RNG).

---

## CRAFTING TIMELINE

| Phase | Action | Duration | Cost |
|---|---|---|---|
| 1 | Acquire base + essence | 10 min | 1.5 div |
| 2 | Prefix lock & exalt | 30–45 min | 15–20 div |
| 3 | Suffix rolling | 45–60 min | 30–50 div |
| | **Finish** | **~2 hours** | **~50–80 div** |
| (Bonus) | Desecrate (optional) | 10 min | Risk/reward |

---

## KEY MECHANICS TO REMEMBER

1. **One crafted mod per item** — Perfect Essence is a one-time craft, counts as 1 of your 3 suffixes
2. **Essences are deterministic** — Use them to lock high-value, hard-to-hit mods (like +3 Spell Level)
3. **Bench crafts cost divines** — "Prefixes cannot be changed" ~5–8 div, not free
4. **Exalt spray & accept tiers** — Push for T1 prefixes (1% spawn), accept T3–T5 suffixes (saves cost)
5. **Annul on bad tiers** — If affix tier is too low, annul (1 div) + retry is often cheaper than continuing

---

## FINAL ANSWER

**Best wand crafting strategy for PoE2 v0.5:**

1. Get white base (0.2 div)
2. Use Perfect Essence of Sorcery (1 div)
3. Exalt for 3 damage prefixes (15–20 div)
4. Exalt for 2 crit suffixes (20–30 div)
5. Use bench locks to guide prefixes/suffixes (10–15 div)

**Total: ~50–80 divines (median 65), 1–2 hours, deterministic result**

This is better than your PoE1-style magic base + regal because:
- No farming required
- No regal RNG (50% brick chance)
- Guaranteed +3 Spell Level vs. hoping for +1
- ~same cost, but lower variance
