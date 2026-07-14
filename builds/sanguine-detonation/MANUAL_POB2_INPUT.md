# Manual Path of Building 2 Input Guide

Since auto-generating PoB2 codes requires the proprietary format spec, here's the **step-by-step manual approach** to input the Sanguine Detonation build into PoB2 and upload to pobb.in.

## Prerequisites
- Path of Building 2 installed (available free at https://github.com/Openarl/PathOfBuilding)
- Access to pobb.in

## Step-by-Step Input

### 1. Open Path of Building 2
- Launch the application
- Click "New Build" or File → New

### 2. Character Setup
- **Class:** Witch
- **Ascendancy:** Blood Mage
- **Level:** 82

### 3. Ascendancy Nodes (In Order)
1. **Sunder the Flesh** (Points 1-2)
   - Effect: Spell Critical Strike Chance: 15%
2. **Gore Spike** (Points 3-4)
   - Effect: Gain X% of Critical Damage as Extra Damage per X of Maximum Life
3. **Whispers of the Flesh** (Points 5-6)
   - Effect: Enemies you curse have X% of Life Reserved; cursed enemies cannot regenerate
4. **Crimson Power** (Points 7-8)
   - Effect: Energy Shield on Body Armour counts as Extra Maximum Life

### 4. Skill Gems (6-Link Hexblast)
**Socket in Body Armour or 2-Hand Weapon:**

1. **Hexblast** (Level 20)
   - Main damage skill
2. **Spell Critical Strike Chance Support** (Level 20)
   - Multiplies the 15% base crit from ascendancy
3. **Critical Strike Multiplier Support** (Level 20)
   - Scales crit damage; works with Gore Spike
4. **Increased Area of Effect Support** (Level 20)
   - Widens curse and explosion chain
5. **Faster Casting Support** (Level 20)
   - Accelerates two-beat rhythm
6. **Chaos Damage Support** (Level 20)
   - Scales Hexblast chaos damage (patch-dependent: can swap for Controlled Destruction)

**Socket in Gloves or Boots (2-Link):**

1. **Despair** (Level 20)
   - Curse: lowers chaos resistance
2. **Curse Effect Support** (Level 20)
   - Deepens resistance reduction (hidden multiplier)

**Socket elsewhere (1-Link):**

1. **Blink Arrow** (Level 20)
   - Movement skill (non-negotiable for rhythm)

**Aura/Buff:**

1. **Malevolence** (Level 20)
   - Provides flat chaos damage to spells

### 5. Gear Setup

Use rares matching these targets (from `build-specification.json`):

| Slot | Base Type | Must-Have Mods | Target Stats |
|------|-----------|---|---|
| **Weapon** | Wand | Spell Damage, Crit Chance, Cast Speed, Flat Chaos | +65% spell damage, +18% crit, +0.25 speed, +22 flat chaos |
| **Body Armour** | Robe | Life, Resistances | +155 life, +32% fire, +28% cold, +35% lightning |
| **Helmet** | Any | Life, Crit, Resistances | +78 life, +20% crit, +25% fire, +24% cold |
| **Gloves** | Any | Life, Cast Speed, Resistances | +65 life, +0.15 speed, resistances |
| **Boots** | Any | Movement Speed, Life, Resistances | +30% move speed (NON-NEGOTIABLE), +72 life, resistances |
| **Ring 1** | Any | Life, Flat Chaos, Crit, Resistances | +48 life, +12 flat chaos, +18% crit, +24% fire res |
| **Ring 2** | Any | Life, Flat Chaos, Chaos Res, Resistances | +52 life, +15 flat chaos, +45% chaos res, +22% cold res |
| **Amulet** | Any | Life, Flat Chaos, Crit Multiplier, Resistances | +58 life, +16 flat chaos, +38% crit mult, +28% lightning res |
| **Flask 1** | Life Flask | Recovery Rate, Charge Generation, Instant Recovery | +40% recovery, +2 charges, instant when depleted |

### 6. Passive Tree Allocation (~82 points)

Allocate these clusters from the Witch start:

**Life Wheels (Priority 1):**
- Scion life wheel: +55% maximum life
- Ranger life wheel: +48% maximum life  
- Witch life wheel: +52% maximum life

**Crit Clusters (Priority 2):**
- Spell crit cluster (left side): +38% spell critical strike chance
- Crit multiplier cluster (right side): +82% critical damage

**Damage Clusters (Priority 3):**
- Spell damage (Witch): +48% spell damage
- Chaos damage: +32% chaos damage

**Defensive/Utility (Priority 4):**
- Flask recovery cluster: +48% flask recovery rate
- Curse effect: +28% curse effect
- 2× jewel sockets (off-path allocation)

### 7. Verify Build Stats

In PoB2, check that your character shows approximately:

| Stat | Target |
|------|--------|
| Maximum Life | 1600+ |
| Spell Crit Chance | 50%+ |
| Critical Damage | 180%+ |
| Spell Damage | 100%+ |
| Fire/Cold/Lightning Res | 75% (capped) |
| Chaos Res | 30%+ |
| Cast Speed | 1.0+ casts/sec |
| Curse Effect | 25%+ |

### 8. Export to pobb.in

1. In PoB2, click **Export** or **Share**
2. Select "PoB Link" (pobb.in format)
3. Copy the resulting **base64 code** (long string)
4. Go to https://pobb.in/
5. Paste the code into the **"Code"** field
6. Click **"Import"** or **"Generate"**
7. pobb.in returns a URL: `https://pobb.in/<ID>`
8. Copy the **`<ID>`** part (e.g., `90pcuxN4XtJG`)

### 9. Update the Guide

Edit `data/guides/sanguine-detonation.json` in the site repo:

```json
{
  "pobbId": "<ID>",
  "pobCode": "<raw_pob_export_code_if_available>"
}
```

Then reload the site — the pobb.in iframe will embed your build.

## Troubleshooting

**Problem:** "Gem not found in PoB2"
→ Check PoE2 patch version; some gems were renamed in early access.

**Problem:** "Can't allocate that passive"
→ Verify tree layout hasn't shifted; use the official GGG tree data.

**Problem:** "Stats don't match build-specification.json"
→ Gear quality and gem levels affect PoB2 calculations; exact match not required, but ballpark should align (±10%).

## Reference Files

- `build-specification.json` — Full build spec with all stats/gear
- `damage-scaling-analysis.json` — Why each stat scales the way it does
- `POBB_UPLOAD_GUIDE.md` — Quick reference for upload step

## Questions?

If specific gem names, passive nodes, or gear types don't exist in your patch:
1. Check the in-game UI for the actual name
2. Use the closest equivalent (e.g., if a support is renamed, use the new name)
3. Adjust gear targets to what's available in your league

Good luck building! 🗡️
