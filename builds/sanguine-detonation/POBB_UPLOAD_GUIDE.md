# Uploading the Sanguine Detonation Build to pobb.in

This guide explains how to take the `build-specification.json` and get it onto pobb.in so the guide can embed it.

## Option 1: Manual Path of Building 2 Input (Fastest)

1. **Open Path of Building 2** (the official PoE2 build planner)
2. **Create a new build:**
   - Class: Witch
   - Ascendancy: Blood Mage
3. **Input from `build-specification.json`:**
   - **Ascendancy nodes:** Sunder the Flesh → Gore Spike → Whispers of the Flesh → Crimson Power
   - **Skill gems:** 6-link Hexblast (with supports listed in `gem_links`)
   - **Gear:** Input rares with stats from `gear_optimized` section (or use substitutes)
   - **Passive tree:** Allocate the clusters described in `passive_tree_allocation` (~82 points)
4. **Export the build:**
   - Click "Export" or "Share"
   - Copy the PoB2 export code (long base64 string)
5. **Upload to pobb.in:**
   - Go to https://pobb.in/
   - Paste the PoB2 code
   - Click "Import" or "Generate"
   - Copy the resulting pobb.in link (e.g., `https://pobb.in/ABC123XYZ`)

## Option 2: Using the poe2-mcp Pipeline (Future)

If the `poe2-mcp` system has PoB2 export capability:

```bash
python -m poe2_mcp.pob.exporter --build builds/sanguine-detonation/build-specification.json --output pobb2_code.txt
```

Then paste the output code into pobb.in.

## What to Do With the pobb.in Link

1. **Copy the `pobb.in/<id>` part** (e.g., `90pcuxN4XtJG` from `https://pobb.in/90pcuxN4XtJG`)
2. **Update the guide data:**
   - Edit `data/guides/sanguine-detonation.json` (in the site repo)
   - Set `"pobbId": "90pcuxN4XtJG"` (your new id)
   - Remove or update `"pobbNote"` 
3. **Reload the site:** `python3 -m http.server 8000`
4. **Test:** Navigate to `guide.html?build=sanguine-detonation` → the iframe should now show your live build

## Build Specification Highlights

- **Level:** 82
- **Life:** 1650 (+ 280 ES via Crimson Power = 1930 effective)
- **Estimated DPS:** 15-20k pack clear (6-7 chain explosions), 4-5k single target
- **Crit:** 52% chance × 182% multiplier (via Gore Spike + supports + gear)
- **Resistances:** 75% capped (fire/cold/lightning), 45% chaos
- **Playstyle:** Two-beat curse → Hexblast rhythm

## Validation Checklist

Before uploading, verify in Path of Building 2:

- [ ] All ascendancy nodes allocated (Sunder, Gore Spike, Whispers, Crimson Power)
- [ ] 6-link Hexblast with critical strike chance, multiplier, AoE, cast speed, chaos damage, flex
- [ ] 2-link Despair with AoE and curse effect
- [ ] Movement skill (Blink Arrow or similar)
- [ ] Utility buff (Malevolence for flat chaos)
- [ ] ~82 passive points allocated on life/crit/curse effect clusters
- [ ] Gear resembles the `gear_optimized` section (or close equivalents)
- [ ] Life pool ≥ 1600
- [ ] Crit chance ≥ 50%
- [ ] Resistances capped at 75%

If PoB2 shows DPS in the ballpark of 15-20k (packs) / 4-5k (single target), you're ready to export and upload.

## Notes

- The `build-specification.json` is optimized for **maps tier 7-10 (mid-endgame)**.
- **Gear substitution:** The rare examples are targets; use actual rares from your league with similar stats.
- **Patch-dependency:** Gem values, support levels, and explosion caps shift per patch. PoB2 will auto-update numbers.
- **DPS estimates:** The calculated numbers are conservative and based on research assumptions. Actual in-game DPS may vary ±15%.

## Troubleshooting

**Problem:** "Gem not found in Path of Building"
→ Check PoE2 patch version; some support gems were renamed or removed in early access.

**Problem:** "Passive tree nodes don't exist"
→ Verify tree layout hasn't shifted; check against the official GGG tree export.

**Problem:** "Export generates an unreadable code"
→ Try the browser-based pobb.in share button; some PoB2 versions use different export formats.
