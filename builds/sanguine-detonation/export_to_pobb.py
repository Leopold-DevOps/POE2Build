#!/usr/bin/env python3
"""Export Sanguine Detonation build to PoB2 format for pobb.in upload.

Uses poe2-mcp's PoBExporter to generate a base64-encoded PoB2 code from
the build-specification.json.
"""
import json
import sys
import base64
import zlib
import xml.etree.ElementTree as ET
from pathlib import Path

# Add poe2-mcp to path
MCP_DIR = Path(__file__).resolve().parent.parent.parent.parent / "poe2-mcp"
sys.path.insert(0, str(MCP_DIR))

BUILD_SPEC_PATH = Path(__file__).resolve().parent / "build-specification.json"


def build_pob_xml(spec: dict) -> str:
    """Build PoB XML structure from build specification."""
    root = ET.Element("PathOfBuilding")
    root.set("version", "2")

    # Build node
    build = ET.SubElement(root, "Build")
    build.set("level", str(spec["target_level"]))
    build.set("className", spec["character"]["class"])

    # Tree node - note: this is simplified; full tree data requires the actual tree export
    tree = ET.SubElement(build, "Tree")
    tree.set("ascendancy", spec["character"]["ascendancy"])

    # Skills node
    skills = ET.SubElement(build, "Skills")

    # Hexblast setup
    hexblast_skill = ET.SubElement(skills, "Skill")
    hexblast_skill.set("gemName", "Hexblast")
    hexblast_skill.set("level", "20")
    hexblast_skill.set("quality", "0")
    for support in spec["skill_gems"]["hexblast_setup"]["supports"]:
        support_elem = ET.SubElement(hexblast_skill, "Support")
        support_elem.set("gemName", support["gem"])
        support_elem.set("level", str(support["level"]))

    # Despair setup
    despair_skill = ET.SubElement(skills, "Skill")
    despair_skill.set("gemName", "Despair")
    despair_skill.set("level", "20")
    for support in spec["skill_gems"]["despair_setup"]["supports"]:
        support_elem = ET.SubElement(despair_skill, "Support")
        support_elem.set("gemName", support["gem"])
        support_elem.set("level", str(support["level"]))

    # Items node
    items = ET.SubElement(build, "Items")

    for slot, item_data in spec["gear_optimized"].items():
        if slot.startswith("flask"):
            continue
        item = ET.SubElement(items, "Item")
        item.set("slot", slot)
        item.set("rarity", item_data.get("rarity", "Rare"))
        item.set("baseType", item_data.get("base_type", ""))
        if "rare_example_mods" in item_data:
            for mod in item_data["rare_example_mods"]:
                mod_elem = ET.SubElement(item, "Mod")
                mod_elem.text = mod

    # Convert to string
    return ET.tostring(root, encoding="unicode")


def export_to_pob(spec_path: Path) -> str:
    """Export build specification to PoB2 base64 code."""
    with open(spec_path, encoding="utf-8") as f:
        spec = json.load(f)

    # Build XML
    xml_str = build_pob_xml(spec)

    # Compress and encode (PoB2 format)
    xml_bytes = xml_str.encode("utf-8")
    compressed = zlib.compress(xml_bytes, 9)
    encoded = base64.b64encode(compressed).decode("ascii")

    return encoded


def main():
    if not BUILD_SPEC_PATH.exists():
        print(f"ERROR: {BUILD_SPEC_PATH} not found")
        sys.exit(1)

    try:
        pob_code = export_to_pob(BUILD_SPEC_PATH)
        output_path = BUILD_SPEC_PATH.parent / "pob_export_code.txt"
        output_path.write_text(pob_code, encoding="utf-8")

        print(f"[OK] PoB2 code generated: {output_path}")
        print(f"\nCode length: {len(pob_code)} characters")
        print(f"\nFirst 100 chars: {pob_code[:100]}...")
        print("\n--- UPLOAD INSTRUCTIONS ---")
        print("1. Go to https://pobb.in/")
        print("2. Paste this entire code into the 'Code' field")
        print("3. Click 'Import' or 'Generate'")
        print("4. Copy the resulting pobb.in/<id> link")
        print(f"\nCode saved to: {output_path}")
        print("\nTo view the code:")
        print(f"  type {output_path}")

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
