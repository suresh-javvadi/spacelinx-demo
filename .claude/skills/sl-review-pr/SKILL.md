---
name: sl-review-pr
description: Review Azure DevOps pull requests in the unified SpaceLinx repo. Pass a PR number to review one, or omit to review all active PRs assigned to you.
argument-hint: [pr-number (optional)]
allowed-tools: Bash, Read, Grep, Glob, Agent, WebFetch
---

# Review Azure DevOps Pull Request(s)

Repo: `SpaceLinx` (project `SpaceLinx`, repository GUID `a9516be3-36ad-421f-96ca-fe56266861dd`).

## Determine mode

- If `$ARGUMENTS` is provided and non-empty → **Single PR mode**: review only PR #$ARGUMENTS.
- If `$ARGUMENTS` is empty → **All PRs mode**: list and review all active PRs where you are a reviewer.

## All PRs mode (no argument)

### 1. List active PRs assigned to me
```bash
az repos pr list --repository SpaceLinx --status active --reviewer "$(az ad signed-in-user show --query id -o tsv)" --output json
```

If the above reviewer filter doesn't work, fall back to:
```bash
az repos pr list --repository SpaceLinx --status active --output json
```
Then filter the JSON results to only PRs where the current user appears in the `reviewers` array (match by `uniqueName` or `displayName`).

### 2. Show the list
Present a summary table to the user:

| PR # | Title | Author | Created |
|------|-------|--------|---------|

### 3. Review each PR
For each PR in the list, execute the **Single PR review** steps below. Process them sequentially — fetch, analyze, and post a review comment for each one before moving to the next.

After all PRs are reviewed, show a final summary table of all findings across all PRs.

---

## Single PR review

### 1. Fetch PR details
```
az repos pr show --id <PR_NUMBER> --output json
```

Extract: title, description, author, source/target branch, reviewers, status, and linked work item IDs.

### 2. Fetch linked work items
For each work item ID from the PR:
```
az boards work-item show --id <WORK_ITEM_ID> --output json
```
Extract the title, type, state, and description to understand the requirement.

### 3. Analyze the code diff
Get the diff between the target branch and source branch:
```
git fetch origin
git diff origin/<target-branch>...origin/<source-branch> --stat
git diff origin/<target-branch>...origin/<source-branch>
git log origin/<target-branch>...origin/<source-branch> --oneline
```

### 4. Review the changes
Analyze the diff against the work item requirements. Check for:

- **Requirement coverage**: Do the code changes fully implement what the work items describe?
- **Bugs**: Null handling issues, off-by-one errors, race conditions, unintended behavior changes
- **Logic errors**: Incorrect calculations, wrong conditions, missing edge cases
- **Security**: SQL injection, XSS, command injection, improper auth checks
- **Consistency**: Does the code follow existing patterns in the codebase?
  - API (`src/SpaceLinx.Api/`): `GenericRestController<T,...>` pattern, `BaseModel` audit fields (`CreatedBy/At`, `UpdatedBy/At`, `DeletedBy/At`), DTO conventions (`WriteModel`, `ReadModel`, `UpdateModel`, `RefModel`), `[SpaceLinxAuthroize]` attribute, soft-delete pattern.
  - Frontend (`src/spacelinx-mes/`): services in `src/services/{entity}Service.js`, `hasPermission()` via `UserContext`, `renderProtectedComponent()` in routes, `SPACELINX-TENANT-ID` / `SPACELINX-APP-NAME` headers, `ENTITY.ACTION` permission format.
  - Database (`database/`): SQL migration scripts under the schemas `mes`, `sc`, `application`, `common`, `pm`, `vm`, `dap`, `imagery`; UUID PKs; soft-delete columns.
- **Missing pieces**: Are there files or changes mentioned in the work items but not present in the diff?
- **Breaking changes**: Could these changes break existing functionality?

If needed, read the full source files for additional context beyond the diff.

**Important**: Database migrations are handled offline via SQL scripts in `database/`, NOT through EF Core migration tooling. Do NOT flag missing EF Core migration files as an issue.

### 5. Post the review

Post **two kinds** of threads via the Azure DevOps `pullRequestThreads` REST API:

#### 5a. Inline comments (one per concrete finding) — REQUIRED when a finding maps to a specific line

Anchor each Bug/Minor/Critical finding to its exact file and line so the author sees it in the diff. Add a `threadContext` with the repo-relative `filePath` (must start with `/`) and the **right-side** line range (the source/PR branch line numbers — get them with `git show origin/<source-branch>:<path> | grep -n`).

```bash
cat > /tmp/pr_inline.json << 'JSONEOF'
{
  "comments": [
    { "parentCommentId": 0, "content": "**Bug (lint break):** <finding + suggested fix in markdown>", "commentType": 1 }
  ],
  "status": 1,
  "threadContext": {
    "filePath": "/src/spacelinx-mes/src/features/Guides/AddBom.jsx",
    "rightFileStart": { "line": 117, "offset": 3 },
    "rightFileEnd": { "line": 117, "offset": 44 }
  }
}
JSONEOF

az devops invoke \
  --area git \
  --resource pullRequestThreads \
  --route-parameters project=SpaceLinx repositoryId=a9516be3-36ad-421f-96ca-fe56266861dd pullRequestId=<PR_NUMBER> \
  --http-method POST \
  --in-file /tmp/pr_inline.json \
  --api-version 7.1 \
  --query "id" -o tsv
```

Notes:
- `filePath` is relative to the repo root and must begin with `/`. Line numbers are 1-based; `offset` is the 1-based column. To anchor a whole line, set `rightFileStart.offset` to 1 and `rightFileEnd` to the line length (or just use `offset: 1` for both — a caret anchor is fine).
- Use `rightFile*` for added/changed/context lines on the PR branch. Use `leftFile*` only when commenting on a line that was **deleted** (exists only on the target branch).
- Post one thread per finding so each can be resolved independently.

#### 5b. Summary thread (overall review) — always post one

A single non-inline thread with the structured overview (see **Review comment format** below).

```bash
cat > /tmp/pr_review.json << 'JSONEOF'
{
  "comments": [
    {
      "parentCommentId": 0,
      "content": "<YOUR REVIEW IN MARKDOWN>",
      "commentType": 1
    }
  ],
  "status": 1
}
JSONEOF

az devops invoke \
  --area git \
  --resource pullRequestThreads \
  --route-parameters project=SpaceLinx repositoryId=a9516be3-36ad-421f-96ca-fe56266861dd pullRequestId=<PR_NUMBER> \
  --http-method POST \
  --in-file /tmp/pr_review.json \
  --api-version 7.1
```

If a finding is general (no single line — e.g. a missing file or a cross-cutting concern), keep it in the summary thread rather than forcing an inline anchor.

### 6. Set vote and finalize

If there are critical or bug-level issues:
```
az repos pr set-vote --id <PR_NUMBER> --vote wait-for-author
```

If the PR looks good (no critical or bug-level issues):

**a) Approve the PR:**
```
az repos pr set-vote --id <PR_NUMBER> --vote approve
```

**b) Resolve all active comment threads:**
First, list all threads on the PR:
```bash
az devops invoke \
  --area git \
  --resource pullRequestThreads \
  --route-parameters project=SpaceLinx repositoryId=a9516be3-36ad-421f-96ca-fe56266861dd pullRequestId=<PR_NUMBER> \
  --http-method GET \
  --api-version 7.1 \
  --output json
```
Then for each thread with `"status": "active"` (status value `1`), resolve it by updating its status to `"fixed"` (status value `2`):
```bash
cat > /tmp/resolve_thread.json << 'JSONEOF'
{
  "status": 2
}
JSONEOF

az devops invoke \
  --area git \
  --resource pullRequestThreads \
  --route-parameters project=SpaceLinx repositoryId=a9516be3-36ad-421f-96ca-fe56266861dd pullRequestId=<PR_NUMBER> threadId=<THREAD_ID> \
  --http-method PATCH \
  --in-file /tmp/resolve_thread.json \
  --api-version 7.1
```

**c) Set auto-complete:**
```bash
CURRENT_USER_ID=$(az ad signed-in-user show --query id -o tsv)

az repos pr update --id <PR_NUMBER> --auto-complete true
```

## Review comment format

Structure the review comment as:

```
## Code Review - PR #<number>

### [Severity]: [Issue title] ([file:line])
[Description of the issue]
**Suggested fix:**
[Code suggestion if applicable]

---

### What looks good
- [Positive observations]
```

Severity levels:
- **Critical** — blocks merge (missing required changes, data loss risk, security issue)
- **Bug** — incorrect behavior that should be fixed before merge
- **Minor** — style, redundancy, or suggestion (non-blocking)

## Final output
After posting, summarize the review findings to the user in a table format with severity, issue, and file.
