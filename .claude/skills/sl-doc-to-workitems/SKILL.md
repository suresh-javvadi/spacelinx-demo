---
name: sl-doc-to-workitems
description: Turn a requirements/spec document into Azure DevOps work items. Reads each task in the doc, analyzes it against the SpaceLinx codebase, and creates a work item per task with the analysis plus the doc's screenshots embedded inline.
argument-hint: <path-to-document> [--type Task|Bug|"User Story"] [--area "SpaceLinx\Area"] [--iteration "..."] [--parent <id>] [--dry-run]
allowed-tools: Bash, Read, Grep, Glob, Agent, AskUserQuestion, Write
---

# Document → Azure DevOps work items (with codebase analysis + inline screenshots)

Takes a requirements document (a `.docx`, `.md`/`.txt`, `.pdf`, or a directory of a
spec + images), splits it into individual tasks, analyzes each task against the
SpaceLinx codebase, and creates one Azure DevOps work item per task — with the
requirement, the codebase analysis, and the task's **screenshots embedded inline**
in the description.

- **Org**: `https://dev.azure.com/XDLinxDev`  ·  **Project**: `SpaceLinx`
- Repo layers for analysis: API `src/SpaceLinx.Api/`, Frontend `src/spacelinx-mes/`, DB `database/`.

> **Creating work items is an outward, hard-to-reverse action.** Never create anything
> until you have shown the parsed task list + planned fields and the user has explicitly
> confirmed. Support `--dry-run` to do everything *except* create. If the user is only
> exploring, prefer `--dry-run` first.

The mechanical Azure DevOps calls (attachment upload + work-item create) are handled by
the bundled helper `scripts/create_work_item.py`; document parsing by
`scripts/extract_doc.py`. You do the reading, task-splitting, and codebase analysis.

---

## 0. Parse arguments

- **`$ARGUMENTS`**: first non-flag token = **document path** (required). If missing, ask the user for it.
- Optional flags (with defaults):
  - `--type` → work item type. Default **`Task`**.
  - `--area` → `System.AreaPath` (e.g. `SpaceLinx\FrontEnd`). Default: omit (project root).
  - `--iteration` → `System.IterationPath`. Default: omit.
  - `--parent <id>` → link every created item under this parent (Feature/Epic/User Story).
  - `--dry-run` → parse + analyze + build descriptions, but **do not** upload or create.

Set a working dir in the scratchpad (avoids the `/tmp` bash-vs-Windows path mismatch —
always pass **absolute Windows-style** paths to `az`/`python`):
```bash
WORK="<scratchpad>/doc2wi"   # use the session scratchpad dir
mkdir -p "$WORK"
```

## 1. Ingest the document

```bash
python .claude/skills/sl-doc-to-workitems/scripts/extract_doc.py "<document>" --out-dir "$WORK"
```
This writes `$WORK/outline.md` (ordered outline with `<<IMG: assets/...>>` markers),
`$WORK/blocks.json` (structured blocks), and `$WORK/assets/` (extracted screenshots).

Then **Read `$WORK/outline.md`** to understand the content, and **Read the extracted
images** in `$WORK/assets/` so you can describe/caption them and place each with the
right task.

Notes by input type:
- **`.docx`** — headings/paragraphs come out in order; embedded images are mapped to the
  paragraph they sit in (so a screenshot lands with its task).
- **`.md`/`.txt`** — headings + `![](path)` image refs (resolved relative to the doc).
- **directory** — first `.docx`/`.md` spec + sibling image files as loose assets.
- **`.pdf`** — the script does **not** extract images. Use the **Read** tool with
  `pages=` to view the PDF visually, transcribe the tasks, and ask the user to supply the
  screenshots as separate image files (or a directory) if they must be embedded inline.

## 2. Split into tasks

From the outline, segment the document into discrete **tasks**. Heuristics: a heading
like `Task N:`, a numbered/bulleted requirement, or a distinct feature section is one
task. For each task capture:
- **title** — concise, imperative (e.g. *"Add date-range filter to stock report"*).
- **body** — the requirement text + any acceptance criteria / notes.
- **images** — the screenshot file(s) from `assets/` that belong to this task (from the
  `<<IMG: ...>>` markers, or that the user pointed at a specific task).

Present the parsed tasks back to the user as a table (`# | Title | # screenshots`) so
they can sanity-check the split before any analysis or creation.

## 3. Analyze each task against the codebase

For each task, investigate how it maps onto the current code. Use `Grep`/`Glob`, read
the relevant files, and for wider sweeps spawn an `Explore` agent. Determine:
- **Relevant files** (as `file:line`) and the layers touched (API / frontend / DB).
- **Current state** — not started / partially implemented / already exists. Follow the
  repo conventions when judging fit: `GenericRestController<T,...>`, `BaseModel` audit
  fields, DTO `WriteModel`/`ReadModel`/`UpdateModel`/`RefModel`, `[SpaceLinxAuthroize]`,
  soft-delete; frontend `services/{entity}Service.js`, `hasPermission()`,
  `renderProtectedComponent()`, `ENTITY.ACTION` permissions; DB schemas
  `mes/sc/application/common/pm/vm/dap/imagery`, UUID PKs, soft-delete columns.
- **Implementation notes** — concrete starting points and the pattern to mirror.
- **Risks / open questions** — edge cases, breaking changes, missing decisions.

Keep it grounded — cite real `file:line` references, don't invent APIs.

## 4. Build the work-item description (one HTML file per task)

Write each task's description to `$WORK/desc_<n>.html`. Keep it valid HTML (the ADO
`System.Description` field renders HTML). Escape `<`, `>`, `&` in any literal code you
quote. Place each screenshot with the token `__IMG_1__`, `__IMG_2__`, … in the **same
order** you will pass `--image` args to the helper.

Suggested structure:
```html
<div><b>Requirement</b><br/>&lt;the requirement text from the doc&gt;</div>
<div><b>Acceptance criteria</b><ul><li>&lt;criterion&gt;</li></ul></div>
<div><b>Codebase analysis</b>
  <ul>
    <li><b>Layers:</b> API / Frontend / DB</li>
    <li><b>Relevant files:</b> InventoryStockReportController.cs:24, ...</li>
    <li><b>Current state:</b> endpoint exists; frontend consumer missing</li>
    <li><b>Implementation notes:</b> mirror partService.js; gate on INVENTORY.VIEW</li>
    <li><b>Risks / open questions:</b> IST vs UTC day boundary</li>
  </ul>
</div>
<div><b>Screenshot from spec</b><br/>__IMG_1__</div>
<hr/><div><i>Generated from &lt;document name&gt; by sl-doc-to-workitems.</i></div>
```

## 5. Confirm, then create

Show the final plan: **N** work items, their titles, `--type`, `--area`, `--parent`,
and screenshot counts. **Get explicit user confirmation** (or `--dry-run` first).

For each task, call the helper (repeat `--image` in the token order; parent/area/tags
optional):
```bash
python .claude/skills/sl-doc-to-workitems/scripts/create_work_item.py \
  --title "Task 1: Add date-range filter to stock report" \
  --type "Task" \
  --area "SpaceLinx\FrontEnd" \
  --parent 2481 \
  --tags "from-doc; sl-doc-to-workitems" \
  --description-file "$WORK/desc_1.html" \
  --image "$WORK/assets/image1.png" \
  # add --dry-run to preview the patch without creating
```
The helper mints a bearer token (`az account get-access-token`, Azure DevOps resource
`499b84ac-1321-427f-aa17-267ca6975798`), uploads each screenshot as an ADO attachment,
substitutes `__IMG_n__` with an inline `<img>`, and POSTs the JSON-patch create. On
success it prints `{"id","url","webUrl"}`. Capture each id/webUrl.

> The token is short-lived; if you batch many items and hit a 401, just re-run — each
> call fetches a fresh token.

## 6. Verify & report

Optionally confirm one item rendered correctly:
```bash
az boards work-item show --id <ID> --query "{id:id,title:fields.'System.Title'}" -o json
```

Then give the user a summary table:

| Task | Work Item | Type | Screenshots | Key files |
|------|-----------|------|-------------|-----------|
| Add date-range filter | [#2490](webUrl) | Task | 1 | InventoryStockReportController.cs:24 |

If `--dry-run` was used, say clearly that **nothing was created** and point to the
`$WORK/desc_*.html` previews and the printed patch JSON.

### 6a. Paste-ready task list (Teams / email)

**Always** also emit a plain-text, paste-ready block the user can drop straight into
Teams or an email — no markdown tables (they don't paste cleanly), just a title, the
full `webUrl`, and a one-line summary per item. Lead with the source document + project.
Format:

```
Work items created from "<document name>" — project: SpaceLinx (XDLinxDev)

1. <Title> — <Type> #<id>
<webUrl>
<one/two-line summary + any key decision the assignee must make>

2. <Title> — <Type> #<id>
<webUrl>
<one/two-line summary + any key decision>
```

Keep each entry self-contained (a reader in Teams has no codebase context). Put the full
clickable URL on its own line so it auto-links. For a `--dry-run`, title the block
"Planned work items (not yet created)" and omit ids/URLs.

---

## Failure handling

- **`extract_doc.py` exits 2 on a PDF** — expected; fall back to the Read tool for pages
  and ask for separate screenshots (see step 1).
- **`az` not logged in** — the helper exits with a clear message; tell the user to run
  `az login` (suggest they type `! az login` in the prompt).
- **HTTP 4xx from the helper** — it prints the ADO response body. Common causes: bad
  `--area`/`--iteration` (must be an existing classification node — verify with
  `az boards area project list --project SpaceLinx`), or an invalid `--type` for the
  process. Fix the argument and re-run just that task.
- **Never** retry a create blindly after an ambiguous failure — first check with
  `az boards query`/`work-item show` whether the item was actually created, to avoid
  duplicates.
