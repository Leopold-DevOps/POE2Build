#!/usr/bin/env python3
"""Collect research data for Sanguine Detonation build.

Queries poe2-mcp for gear, mods, and uniques that synergize with:
- Maximum life (triple-dip stat)
- Spell crit chance & damage
- Chaos damage
- Cast speed & curse effect
- Flask recovery (life spend mechanic)
- Energy shield conversion (Crimson Power)
"""
import json
import sys
from pathlib import Path

# Add poe2-mcp to path
MCP_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent / "poe2-mcp"
sys.path.insert(0, str(MCP_DIR))

try:
    from src.config import settings, DATA_DIR
    from src.database.manager import DatabaseManager
except ImportError:
    print("ERROR: Cannot import poe2-mcp. Is poe2-mcp initialized?")
    sys.exit(1)

OUTPUT_DIR = Path(__file__).parent
SYNERGY_KEYWORDS = {
    "life": ["maximum life", "life +", "% of maximum life", "life recovery",
             "recover life", "gain life"],
    "crit": ["critical strike chance", "critical damage", "crit multiplier"],
    "chaos": ["chaos damage", "added chaos"],
    "cast_speed": ["cast speed", "attack speed"],
    "curse": ["curse effect", "curse duration"],
    "es": ["energy shield", "% of"],  # for Crimson Power conversions
    "flask": ["flask charges", "flask recovery", "flask effect"],
}


def collect_base_items():
    """Collect relevant base item types."""
    db = DatabaseManager()

    # Relevant bases for Sanguine Detonation
    slots = {
        "weapon": ["Wand", "Sceptre", "Staff"],
        "body": ["Robe", "Dress", "Tunic", "Coat"],
        "helmet": ["Helmet"],
        "gloves": ["Gloves"],
        "boots": ["Boots"],
        "shield": ["Shield"],
        "rings": ["Ring"],
        "amulet": ["Amulet"],
    }

    results = {}
    for slot, base_names in slots.items():
        results[slot] = []
        for base in base_names:
            # Fetch base item stats
            data = db.query_base_item(base) if hasattr(db, 'query_base_item') else None
            if data:
                results[slot].append({"base": base, "stats": data})

    return results


def collect_mods():
    """Collect mods that synergize with the build."""
    db = DatabaseManager()

    results = {
        "life_mods": [],
        "crit_mods": [],
        "chaos_mods": [],
        "cast_speed_mods": [],
        "curse_mods": [],
        "flask_mods": [],
    }

    # Search mods by category
    search_terms = {
        "life_mods": "maximum life",
        "crit_mods": "critical strike",
        "chaos_mods": "chaos damage",
        "cast_speed_mods": "cast speed",
        "curse_mods": "curse effect",
        "flask_mods": "flask charges",
    }

    for category, term in search_terms.items():
        # Query database for mods matching term
        try:
            # This is a placeholder - actual implementation depends on DB schema
            mods = db.search_mods(term) if hasattr(db, 'search_mods') else []
            results[category] = mods[:5]  # Top 5 per category
        except Exception as e:
            results[category] = []

    return results


def collect_uniques():
    """Collect unique items that synergize."""
    db = DatabaseManager()

    # Known PoE2 uniques relevant to the build
    relevant_uniques = [
        "The Covenant",  # Life Remnants + life-cost casting
        "Shavronne's Wrapping",  # ES-based defense
        "Crown of Eyes",  # Spell crit conversions
        "Kaom's Heart",  # Max life
    ]

    results = {}
    for unique in relevant_uniques:
        try:
            data = db.query_unique(unique) if hasattr(db, 'query_unique') else None
            if data:
                results[unique] = data
        except Exception:
            results[unique] = None

    return results


def save_research():
    """Save collected research as JSON."""
    research = {
        "build": "Sanguine Detonation",
        "timestamp": str(Path(__file__).stat().st_mtime),
        "synergy_keywords": SYNERGY_KEYWORDS,
        "research_sources": {
            "base_items": collect_base_items(),
            "mods": collect_mods(),
            "uniques": collect_uniques(),
        }
    }

    out = OUTPUT_DIR / "synergistic-gear.json"
    out.write_text(json.dumps(research, indent=2), encoding="utf-8")
    print(f"✓ Saved research to {out.relative_to(OUTPUT_DIR.parent.parent)}")


if __name__ == "__main__":
    save_research()
