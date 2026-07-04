#!/usr/bin/env python3
"""
Create ONE Azure DevOps work item with inline screenshots.

Mechanical, deterministic half of the sl-doc-to-workitems skill: the model does
the reading / analysis and writes an HTML description file; this script uploads
the screenshots as attachments and creates the work item, embedding each image
inline. Stdlib only (urllib) so no pip installs are needed.

The description HTML may contain ordered tokens __IMG_1__, __IMG_2__, ...
matching the order of --image args; each token is replaced with an
<img src="<attachment-url>"> after upload. Any --image with no matching token is
appended at the end of the description.

Auth: mints a bearer token via `az account get-access-token` (Azure DevOps
resource 499b84ac-1321-427f-aa17-267ca6975798). Requires an az login.

Prints JSON {id, url, webUrl} on success. Use --dry-run to resolve/preview
without uploading or creating anything.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

ADO_RESOURCE = "499b84ac-1321-427f-aa17-267ca6975798"
API_VERSION = "7.1"


def get_token():
    # az is az.cmd on Windows; Python 3.13 subprocess won't launch a .cmd
    # without a shell, so resolve the full path and run via the shell.
    az = shutil.which("az") or "az"
    out = subprocess.run(
        f'"{az}" account get-access-token --resource {ADO_RESOURCE} '
        f'--query accessToken -o tsv',
        capture_output=True, text=True, shell=True)
    if out.returncode != 0:
        sys.exit(f"Failed to get Azure DevOps token (is 'az login' done?):\n{out.stderr}")
    return out.stdout.strip()


def http(method, url, token, body=None, content_type="application/json"):
    headers = {"Authorization": f"Bearer {token}"}
    data = None
    if body is not None:
        if isinstance(body, (bytes, bytearray)):
            data = bytes(body)
        else:
            data = body.encode("utf-8")
        headers["Content-Type"] = content_type
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")
        sys.exit(f"HTTP {e.code} {method} {url}\n{detail}")


def upload_attachment(org, project, token, image_path):
    fname = os.path.basename(image_path)
    url = (f"{org}/{project}/_apis/wit/attachments"
           f"?fileName={urllib.parse.quote(fname)}&api-version={API_VERSION}")
    with open(image_path, "rb") as f:
        content = f.read()
    res = http("POST", url, token, body=content,
               content_type="application/octet-stream")
    return res["url"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--title", required=True)
    ap.add_argument("--type", default="Task")
    ap.add_argument("--org", default=os.environ.get(
        "ADO_ORG", "https://dev.azure.com/XDLinxDev"))
    ap.add_argument("--project", default=os.environ.get("ADO_PROJECT", "SpaceLinx"))
    ap.add_argument("--area")
    ap.add_argument("--iteration")
    ap.add_argument("--parent", help="parent work item id (Hierarchy-Reverse link)")
    ap.add_argument("--assigned-to")
    ap.add_argument("--tags", help="semicolon-separated tags")
    ap.add_argument("--description-file", required=True,
                    help="HTML file; may contain __IMG_n__ tokens")
    ap.add_argument("--image", action="append", default=[],
                    help="local screenshot to attach (repeatable, ordered)")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    org = args.org.rstrip("/")
    with open(args.description_file, "r", encoding="utf-8") as f:
        html = f.read()

    token = None if args.dry_run else get_token()

    # upload images, resolve __IMG_n__ tokens
    used_tokens = set()
    for idx, img in enumerate(args.image, start=1):
        token_str = f"__IMG_{idx}__"
        if args.dry_run:
            tag = f'<img alt="screenshot {idx} (dry-run: {os.path.basename(img)})" />'
        else:
            att_url = upload_attachment(org, args.project, token, img)
            tag = f'<img src="{att_url}" alt="screenshot {idx}" />'
        if token_str in html:
            html = html.replace(token_str, tag)
            used_tokens.add(idx)
        else:
            html += f"\n<div>{tag}</div>"

    fields = [
        {"op": "add", "path": "/fields/System.Title", "value": args.title},
        {"op": "add", "path": "/fields/System.Description", "value": html},
    ]
    if args.area:
        fields.append({"op": "add", "path": "/fields/System.AreaPath", "value": args.area})
    if args.iteration:
        fields.append({"op": "add", "path": "/fields/System.IterationPath", "value": args.iteration})
    if args.assigned_to:
        fields.append({"op": "add", "path": "/fields/System.AssignedTo", "value": args.assigned_to})
    if args.tags:
        fields.append({"op": "add", "path": "/fields/System.Tags", "value": args.tags})
    if args.parent:
        fields.append({"op": "add", "path": "/relations/-", "value": {
            "rel": "System.LinkTypes.Hierarchy-Reverse",
            "url": f"{org}/_apis/wit/workItems/{args.parent}",
        }})

    if args.dry_run:
        print(json.dumps({
            "dry_run": True,
            "title": args.title,
            "type": args.type,
            "area": args.area,
            "iteration": args.iteration,
            "parent": args.parent,
            "tags": args.tags,
            "images": args.image,
            "patch": fields,
        }, indent=2))
        return

    type_seg = urllib.parse.quote("$" + args.type)
    url = f"{org}/{args.project}/_apis/wit/workitems/{type_seg}?api-version={API_VERSION}"
    res = http("POST", url, token, body=json.dumps(fields),
               content_type="application/json-patch+json")
    wid = res.get("id")
    web = (((res.get("_links") or {}).get("html") or {}).get("href")
           or f"{org}/{args.project}/_workitems/edit/{wid}")
    print(json.dumps({"id": wid, "url": res.get("url"), "webUrl": web}))


if __name__ == "__main__":
    main()
