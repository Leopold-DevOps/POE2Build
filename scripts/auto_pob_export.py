#!/usr/bin/env python3
"""Auto-generate PoB2 export code from build-specification.json using poe2-mcp."""
import json
import sys
from pathlib import Path

# Add poe2-mcp to path
MCP_DIR = Path(__file__).resolve().parent.parent.parent.parent / "poe2-mcp"
sys.path.insert(0, str(MCP_DIR))

from src.pob.xml_generator import PoBXMLGenerator

BUILD_SPEC_PATH = Path(__file__).resolve().parent.parent / "builds" / "sanguine-detonation" / "build-specification.json"


def build_character_data(spec: dict) -> dict:
    """Transform build-specification.json into PoBXMLGenerator format."""
    char = spec["character"]

    # Ascendancy mapping (add Blood Mage if missing)
    ascendancy_names = {
        "Blood Mage": "Blood Mage",  # Add Blood Mage mapping
        "Lich": "Lich",
        "Infernalist": "Infernalist",
    }

    character_data = {
        "name": "Sanguine Detonation",
        "level": spec["target_level"],
        "class": char["class"],
        "ascendancy": char["ascendancy"],
        "account": "Player",
    }

    # Passive tree: convert node names/descriptions to hashes (approximation)
    # NOTE: For actual hashes, we'd need the tree data; using placeholder indices
    passives = spec.get("passive_tree_allocation", {})
    node_list = []

    # Add a placeholder: in real PoB2, each node has a specific hash ID
    # Since we don't have the exact mapping, we'll skip tree for now
    # and document that this needs manual tree allocation

    character_data["passives"] = {
        "hashes": node_list,  # Empty for now; user manually allocates in PoB2
        "jewel_data": {}
    }

    # Skills: convert to gem format
    skills_data = []

    # Hexblast setup
    hexblast_group = spec["skill_gems"]["hexblast_setup"]
    hexblast_skill = {
        "slot": "Body Armour",
        "gems": [
            {"name": "Hexblast", "level": 20, "quality": 0}
        ]
    }

    # Add supports
    for support in hexblast_group["supports"]:
        hexblast_skill["gems"].append({
            "name": support["gem"],
            "level": support["level"],
            "quality": 0
        })

    skills_data.append(hexblast_skill)

    # Despair setup
    despair_group = spec["skill_gems"]["despair_setup"]
    despair_skill = {
        "slot": "Gloves",
        "gems": [
            {"name": "Despair", "level": 20, "quality": 0}
        ]
    }

    for support in despair_group["supports"]:
        despair_skill["gems"].append({
            "name": support["gem"],
            "level": support["level"],
            "quality": 0
        })

    skills_data.append(despair_skill)

    # Movement skill
    movement = spec["skill_gems"].get("movement")
    if movement:
        movement_skill = {
            "slot": "Boots",
            "gems": [
                {"name": movement["gem"], "level": 20, "quality": 0}
            ]
        }
        skills_data.append(movement_skill)

    # Utility buff / Aura
    buff = spec["skill_gems"].get("utility_buff")
    if buff:
        buff_skill = {
            "slot": "Aura",
            "gems": [
                {"name": buff["gem"], "level": 20, "quality": 0}
            ]
        }
        skills_data.append(buff_skill)

    character_data["skills"] = skills_data

    # Equipment: convert gear
    gear = spec["gear_optimized"]
    equipment = []

    slot_mapping = {
        "weapon": {"inventoryId": "Weapon", "typeLine": "Wand"},
        "body_armour": {"inventoryId": "BodyArmour", "typeLine": "Robe"},
        "helmet": {"inventoryId": "Helm", "typeLine": "Helmet"},
        "gloves": {"inventoryId": "Gloves", "typeLine": "Gloves"},
        "boots": {"inventoryId": "Boots", "typeLine": "Boots"},
        "ring_1": {"inventoryId": "Ring", "typeLine": "Ring"},
        "ring_2": {"inventoryId": "Ring2", "typeLine": "Ring"},
        "amulet": {"inventoryId": "Amulet", "typeLine": "Amulet"},
        "flask_1": {"inventoryId": "Flask", "typeLine": "Life Flask"},
    }

    for slot_key, item_data in gear.items():
        if slot_key not in slot_mapping:
            continue

        mapping = slot_mapping[slot_key]
        item = {
            "frameType": 2,  # Rare
            "inventoryId": mapping["inventoryId"],
            "typeLine": mapping["typeLine"],
            "explicitMods": item_data.get("rare_example_mods", []),
            "implicitMods": [],
        }
        equipment.append(item)

    character_data["equipment"] = equipment

    return character_data


def main():
    if not BUILD_SPEC_PATH.exists():
        print(f"ERROR: {BUILD_SPEC_PATH} not found")
        sys.exit(1)

    try:
        # Load build spec
        with open(BUILD_SPEC_PATH, encoding="utf-8") as f:
            spec = json.load(f)

        # Transform to character data format
        character_data = build_character_data(spec)

        # Generate PoB2 code
        generator = PoBXMLGenerator()
        pob_code = generator.generate_pob_code(character_data)

        # Save to file
        output_path = BUILD_SPEC_PATH.parent / "pob_export_code_auto.txt"
        output_path.write_text(pob_code, encoding="utf-8")

        print(f"[OK] PoB2 code generated: {output_path}")
        print(f"Code length: {len(pob_code)} characters")
        print(f"\nFirst 100 chars: {pob_code[:100]}...")
        print("\n--- NEXT STEPS ---")
        print("1. Go to https://pobb.in/")
        print("2. Paste the entire code into the 'Code' field")
        print("3. Click 'Import' - pobb.in will parse it")
        print("4. If it works: copy the resulting URL (pobb.in/<ID>)")
        print("5. If passive tree is empty: manually allocate in pobb.in and re-export")
        print(f"\nCode saved to: {output_path}")
        print(f"\nTo view the code:\n  type {output_path}")

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
