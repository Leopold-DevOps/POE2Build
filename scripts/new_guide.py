#!/usr/bin/env python3
"""Scaffold a new Exile Codex build guide.

Creates data/guides/<slug>.json (with the standard section skeleton) and
appends the card entry to data/guides.json. This is the hand-off point for
the poe2-mcp pipeline: generate prose + a PoB2 code, upload it to pobb.in for
an id, then call this to wire the guide into the site.

Usage:
  python scripts/new_guide.py <slug> --title "Sanguine Detonation" \
      --class Witch --ascendancy "Blood Mage" --archetype Spell \
      --damage Chaos --difficulty Intermediate --budget "Low -> Mid" \
      --skill Hexblast --pobb 90pcuxN4XtJG --summary "One-line hook." \
      --tags Hexblast,Despair,Crit

Fill the empty section `html` fields afterwards (or have the AI emit them).
Pass --json <file> to load all fields from a JSON object instead of flags.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # POE2Build/
INDEX = ROOT / "data" / "guides.json"
GUIDE_DIR = ROOT / "data" / "guides"

SECTION_SKELETON = [
    ("overview", "Chapter I", "", "Build Overview"),
    ("engine", "Chapter II", "hexk", "The Engine — Why This Works"),
    ("ascendancy", "Chapter III", "", "Ascendancy Path"),
    ("skills", "Chapter IV", "hexk", "Skill Gems & Supports"),
    ("tree", "Chapter V", "", "Passive Tree Priorities"),
    ("gear", "Chapter VI", "", "Gear & Stat Priorities"),
    ("leveling", "Chapter VII", "hexk", "Leveling Roadmap"),
    ("mistakes", "Chapter VIII", "", "Common Mistakes & FAQ"),
]
# Card fields copied from the full guide into the lightweight index.
CARD_FIELDS = ("slug", "title", "class", "ascendancy", "archetype", "damage",
               "difficulty", "budget", "playstyle", "skill", "tags", "summary")


def build_fields(args):
    if args.json:
        data = json.loads(Path(args.json).read_text(encoding="utf-8"))
        data.setdefault("slug", args.slug)
        return data
    return {
        "slug": args.slug,
        "title": args.title or args.slug.replace("-", " ").title(),
        "class": getattr(args, "class"),
        "ascendancy": args.ascendancy,
        "archetype": args.archetype,
        "damage": args.damage,
        "difficulty": args.difficulty,
        "budget": args.budget,
        "playstyle": args.playstyle,
        "skill": args.skill,
        "tags": [t.strip() for t in args.tags.split(",") if t.strip()] if args.tags else [],
        "summary": args.summary or "",
    }


def main():
    p = argparse.ArgumentParser(description="Scaffold a new Exile Codex guide.")
    p.add_argument("slug")
    p.add_argument("--json", help="Load all fields from a JSON file")
    p.add_argument("--title"); p.add_argument("--class", dest="class")
    p.add_argument("--ascendancy"); p.add_argument("--archetype")
    p.add_argument("--damage"); p.add_argument("--difficulty")
    p.add_argument("--budget"); p.add_argument("--playstyle")
    p.add_argument("--skill"); p.add_argument("--tags")
    p.add_argument("--summary"); p.add_argument("--pobb", help="pobb.in build id")
    p.add_argument("--pob-code", dest="pob_code", help="raw PoB2 export string")
    p.add_argument("--force", action="store_true", help="overwrite existing guide")
    args = p.parse_args()

    if not re.fullmatch(r"[a-z0-9-]+", args.slug):
        p.error("slug must be lowercase letters, digits and hyphens only")

    fields = build_fields(args)
    out = GUIDE_DIR / f"{args.slug}.json"
    if out.exists() and not args.force:
        p.error(f"{out} already exists (use --force to overwrite)")

    guide = dict(fields)
    guide["subtitle"] = fields.get("subtitle", fields.get("summary", ""))
    guide["runeLine"] = fields.get(
        "runeLine",
        " · ".join(x for x in (fields.get("class"), fields.get("ascendancy")) if x),
    )
    guide["pobbId"] = args.pobb or fields.get("pobbId", "")
    guide["pobCode"] = args.pob_code or fields.get("pobCode")
    if not guide["pobbId"]:
        guide["pobbNote"] = "No pobb.in link attached yet — set pobbId."
    guide["sections"] = fields.get("sections") or [
        {"id": sid, "kicker": kick, "kickerClass": kc, "heading": head, "html": ""}
        for sid, kick, kc, head in SECTION_SKELETON
    ]

    GUIDE_DIR.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(guide, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    index = json.loads(INDEX.read_text(encoding="utf-8"))
    index.setdefault("guides", [])
    index["guides"] = [g for g in index["guides"] if g.get("slug") != args.slug]
    index["guides"].append({k: fields[k] for k in CARD_FIELDS if fields.get(k) not in (None, "")})
    INDEX.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"Created {out.relative_to(ROOT)} and updated {INDEX.relative_to(ROOT)}")
    print(f"Open: guide.html?build={args.slug}")


if __name__ == "__main__":
    sys.exit(main())
