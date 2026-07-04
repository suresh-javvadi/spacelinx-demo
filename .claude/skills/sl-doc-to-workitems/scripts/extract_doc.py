#!/usr/bin/env python3
"""
Extract an ordered outline + screenshots from a requirements document.

Supports:
  .docx  -> ordered headings/paragraphs + embedded images (word/media)
  .md/.txt -> passthrough text + referenced images (![](path)) resolved
  <dir>  -> first .docx/.md spec found + sibling image files as assets
  .pdf   -> NOT parsed here (advises using the Read tool for pages)

Stdlib only (zipfile, xml.etree) so it runs anywhere without pip installs.

Outputs into --out-dir:
  outline.md   human-readable ordered outline with <<IMG: assets/xxx>> markers
  blocks.json  [{kind:'heading'|'para', level:int, text:str, images:[paths]}]
  assets/      extracted image files

Prints the blocks.json path + a short summary to stdout.
"""
import argparse
import json
import os
import re
import shutil
import sys
import xml.etree.ElementTree as ET
import zipfile

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
IMG_EXT = (".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ".tif", ".tiff")


def _q(ns, tag):
    return f"{{{ns}}}{tag}"


def extract_docx(path, out_dir, assets_dir):
    blocks = []
    assets = []
    with zipfile.ZipFile(path) as z:
        names = z.namelist()
        # rId -> media target (e.g. media/image1.png)
        rels = {}
        if "word/_rels/document.xml.rels" in names:
            rroot = ET.fromstring(z.read("word/_rels/document.xml.rels"))
            for rel in rroot:
                rid = rel.get("Id")
                target = rel.get("Target")
                if rid and target:
                    rels[rid] = target.replace("\\", "/")
        # extract every media file, preserving base names
        for n in names:
            if n.startswith("word/media/"):
                base = os.path.basename(n)
                dest = os.path.join(assets_dir, base)
                with z.open(n) as src, open(dest, "wb") as out:
                    shutil.copyfileobj(src, out)
                assets.append(os.path.join("assets", base))

        doc = ET.fromstring(z.read("word/document.xml"))
        body = doc.find(_q(W, "body"))
        if body is None:
            return blocks, assets
        for p in body.iter(_q(W, "p")):
            # heading level from paragraph style
            level = 0
            kind = "para"
            ppr = p.find(_q(W, "pPr"))
            if ppr is not None:
                pstyle = ppr.find(_q(W, "pStyle"))
                if pstyle is not None:
                    val = (pstyle.get(_q(W, "val")) or "").lower()
                    m = re.search(r"heading\s*(\d+)", val)
                    if m:
                        kind, level = "heading", int(m.group(1))
                    elif val in ("title",):
                        kind, level = "heading", 1
            text = "".join(t.text or "" for t in p.iter(_q(W, "t")))
            imgs = []
            for blip in p.iter(_q(A, "blip")):
                rid = blip.get(_q(R, "embed")) or blip.get(_q(R, "link"))
                tgt = rels.get(rid)
                if tgt:
                    imgs.append(os.path.join("assets", os.path.basename(tgt)))
            if text.strip() or imgs:
                blocks.append({"kind": kind, "level": level,
                               "text": text.strip(), "images": imgs})
    return blocks, assets


def extract_markdown(path, out_dir, assets_dir):
    blocks = []
    assets = []
    base_dir = os.path.dirname(os.path.abspath(path))
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        lines = f.read().splitlines()
    img_re = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
    heading_re = re.compile(r"^(#{1,6})\s+(.*)$")
    for line in lines:
        h = heading_re.match(line)
        imgs = []
        for ref in img_re.findall(line):
            ref = ref.split()[0].strip("<>")
            if ref.lower().startswith(("http://", "https://")):
                imgs.append(ref)  # remote; keep URL as-is
                continue
            srcp = ref if os.path.isabs(ref) else os.path.join(base_dir, ref)
            if os.path.exists(srcp):
                base = os.path.basename(srcp)
                shutil.copyfile(srcp, os.path.join(assets_dir, base))
                rel = os.path.join("assets", base)
                imgs.append(rel)
                assets.append(rel)
        if h:
            blocks.append({"kind": "heading", "level": len(h.group(1)),
                           "text": h.group(2).strip(), "images": imgs})
        elif line.strip() or imgs:
            blocks.append({"kind": "para", "level": 0,
                           "text": line.strip(), "images": imgs})
    return blocks, assets


def extract_dir(path, out_dir, assets_dir):
    specs = []
    imgs = []
    for entry in sorted(os.listdir(path)):
        full = os.path.join(path, entry)
        if not os.path.isfile(full):
            continue
        low = entry.lower()
        if low.endswith(".docx") or low.endswith((".md", ".markdown", ".txt")):
            specs.append(full)
        elif low.endswith(IMG_EXT):
            imgs.append(full)
    if not specs:
        raise SystemExit(f"No .docx/.md/.txt spec file found in directory: {path}")
    spec = specs[0]
    if spec.lower().endswith(".docx"):
        blocks, assets = extract_docx(spec, out_dir, assets_dir)
    else:
        blocks, assets = extract_markdown(spec, out_dir, assets_dir)
    # add sibling images as loose assets (not yet mapped to a task)
    for im in imgs:
        base = os.path.basename(im)
        dest = os.path.join(assets_dir, base)
        if not os.path.exists(dest):
            shutil.copyfile(im, dest)
            assets.append(os.path.join("assets", base))
    return blocks, assets


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("document", help="path to .docx/.md/.txt/.pdf or a directory")
    ap.add_argument("--out-dir", required=True, help="working dir for outputs")
    args = ap.parse_args()

    doc = args.document
    out_dir = args.out_dir
    assets_dir = os.path.join(out_dir, "assets")
    os.makedirs(assets_dir, exist_ok=True)

    low = doc.lower()
    if os.path.isdir(doc):
        blocks, assets = extract_dir(doc, out_dir, assets_dir)
    elif low.endswith(".docx"):
        blocks, assets = extract_docx(doc, out_dir, assets_dir)
    elif low.endswith((".md", ".markdown", ".txt")):
        blocks, assets = extract_markdown(doc, out_dir, assets_dir)
    elif low.endswith(".pdf"):
        print(json.dumps({
            "type": "pdf",
            "error": "PDF is not parsed by this script. Use the Read tool to view "
                     "pages (pages=...), and pass screenshots as separate image "
                     "files (or a directory) to embed them inline.",
        }))
        sys.exit(2)
    else:
        raise SystemExit(f"Unsupported document type: {doc}")

    # write outline.md
    outline_path = os.path.join(out_dir, "outline.md")
    with open(outline_path, "w", encoding="utf-8") as f:
        for b in blocks:
            if b["kind"] == "heading":
                f.write("#" * max(1, min(6, b["level"])) + " " + b["text"] + "\n")
            elif b["text"]:
                f.write(b["text"] + "\n")
            for im in b["images"]:
                f.write(f"<<IMG: {im}>>\n")
        f.write("\n")

    blocks_path = os.path.join(out_dir, "blocks.json")
    with open(blocks_path, "w", encoding="utf-8") as f:
        json.dump(blocks, f, indent=2, ensure_ascii=False)

    print(json.dumps({
        "type": "dir" if os.path.isdir(doc) else low.rsplit(".", 1)[-1],
        "blocks_path": blocks_path,
        "outline_path": outline_path,
        "assets_dir": assets_dir,
        "num_blocks": len(blocks),
        "num_images": len(assets),
        "images": assets,
    }, indent=2))


if __name__ == "__main__":
    main()
