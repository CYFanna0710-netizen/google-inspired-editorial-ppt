#!/usr/bin/env python3
import argparse
import fnmatch
import json
import os
import tempfile
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
for prefix, uri in NS.items():
    ET.register_namespace(prefix, uri)

DRAWABLE = {
    f"{{{NS['p']}}}sp", f"{{{NS['p']}}}pic", f"{{{NS['p']}}}graphicFrame",
    f"{{{NS['p']}}}cxnSp", f"{{{NS['p']}}}grpSp", f"{{{NS['p']}}}contentPart",
}

def shape_name(element):
    node = element.find(f".//{{{NS['p']}}}cNvPr")
    return node.get("name", "") if node is not None else ""

def matches(name, patterns):
    return any(fnmatch.fnmatchcase(name, pattern) for pattern in patterns)

def reorder(xml_bytes, rule):
    root = ET.fromstring(xml_bytes)
    tree = root.find("p:cSld/p:spTree", NS)
    if tree is None:
        return xml_bytes, {"front": [], "back": []}
    children = list(tree)
    front_patterns = rule.get("front", [])
    back_patterns = rule.get("back", [])
    front = [c for c in children if c.tag in DRAWABLE and matches(shape_name(c), front_patterns)]
    back = [c for c in children if c.tag in DRAWABLE and matches(shape_name(c), back_patterns) and c not in front]
    for child in front + back:
        tree.remove(child)
    insert_at = min(2, len(tree))
    for child in back:
        tree.insert(insert_at, child)
        insert_at += 1
    for child in front:
        tree.append(child)
    return ET.tostring(root, encoding="utf-8", xml_declaration=True), {
        "front": [shape_name(x) for x in front],
        "back": [shape_name(x) for x in back],
    }

def main():
    ap = argparse.ArgumentParser(description="Move named PPTX slide elements to the front or back without rasterizing them.")
    ap.add_argument("--input", required=True)
    ap.add_argument("--output", required=True)
    ap.add_argument("--rules", required=True, help='JSON: {"slides":{"1":{"front":["title*"],"back":["background*"]}}}')
    ap.add_argument("--report")
    args = ap.parse_args()

    input_path = Path(args.input).resolve()
    output_path = Path(args.output).resolve()
    rules = json.loads(Path(args.rules).read_text(encoding="utf-8"))
    slide_rules = rules.get("slides", {})
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(suffix=".pptx", dir=str(output_path.parent))
    os.close(fd)
    report = {"input": str(input_path), "output": str(output_path), "slides": {}}
    try:
        with zipfile.ZipFile(input_path, "r") as zin, zipfile.ZipFile(temp_name, "w") as zout:
            for info in zin.infolist():
                data = zin.read(info.filename)
                if info.filename.startswith("ppt/slides/slide") and info.filename.endswith(".xml"):
                    slide_no = info.filename.rsplit("slide", 1)[1].split(".xml", 1)[0]
                    if slide_no in slide_rules:
                        data, moved = reorder(data, slide_rules[slide_no])
                        report["slides"][slide_no] = moved
                zout.writestr(info, data)
        os.replace(temp_name, output_path)
    finally:
        if os.path.exists(temp_name):
            os.unlink(temp_name)
    if args.report:
        Path(args.report).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))

if __name__ == "__main__":
    main()
