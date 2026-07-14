#!/usr/bin/env python3
"""Preprocess the official GGG poe2-skilltree-export data.json into a slim
tree.min.json for the app. Re-run after each patch:

  curl -sL https://raw.githubusercontent.com/grindinggear/poe2-skilltree-export/main/data.json -o data.json
  python3 scripts/build-tree-data.py data.json data/tree.min.json
"""
import json, re, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "data.json"
DST = sys.argv[2] if len(sys.argv) > 2 else "data/tree.min.json"
KEEP_ASCENDANCY = "Witch2"  # Blood Mage

MARKUP = re.compile(r"\[([^\|\]]+)\|([^\]]+)\]")   # [Tag|Display] -> Display
MARKUP1 = re.compile(r"\[([^\]]+)\]")               # [Tag] -> Tag
UNDER = re.compile(r"<underline>\{([^}]*)\}")

def clean(s):
    s = MARKUP.sub(r"\2", s)
    s = MARKUP1.sub(r"\1", s)
    s = UNDER.sub(r"\1", s)
    return s

d = json.load(open(SRC))
out_nodes = {}
for nid, n in d["nodes"].items():
    if "x" not in n:
        continue
    asc = n.get("ascendancyId")
    if asc and asc != KEEP_ASCENDANCY:
        continue
    kind = ("keystone" if n.get("isKeystone")
            else "notable" if n.get("isNotable")
            else "jewel" if n.get("isJewelSocket")
            else "small")
    out_nodes[nid] = {
        "n": n.get("name", ""),
        "s": [clean(x) for x in n.get("stats", [])],
        "x": round(n["x"]),
        "y": round(n["y"]),
        "k": kind,
        "a": 1 if asc else 0,
        "o": [str(t) for t in n.get("out", []) if str(t) != "root"],
    }

for nid, n in out_nodes.items():
    n["o"] = [t for t in n["o"] if t in out_nodes]

slim = {
    "patch": d.get("tree", "Default"),
    "bounds": [d["min_x"], d["min_y"], d["max_x"], d["max_y"]],
    "nodes": out_nodes,
}
json.dump(slim, open(DST, "w"), separators=(",", ":"))
print(f"wrote {DST}: {len(out_nodes)} nodes")
