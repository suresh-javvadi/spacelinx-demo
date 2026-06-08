---
name: sl-ship
description: End-to-end ship a feature/bugfix branch — self-review, pre-commit checks, commit, push, create PR, approve, and set auto-complete.
argument-hint: [target-branch (optional, defaults to main)]
allowed-tools: Bash, Read, Grep, Glob, Edit
---

# Ship current branch

End-to-end flow that takes the current branch from "working tree" to "PR with auto-complete set" against the unified SpaceLinx repo.

Repo: `SpaceLinx` (project `SpaceLinx`, repository GUID `a9516be3-36ad-421f-96ca-fe56266861dd`).

Target branch: `$ARGUMENTS` if provided, otherwise `main`.

Abort and ask the user if any step produces unexpected output. Never use destructive git commands (`--force`, `reset --hard`, `clean -f`) or skip hooks (`--no-verify`) unless the user explicitly authorizes it.

## 1. Pre-flight

### 1a. Current branch and target
```bash
git branch --show-current
```
- Refuse to ship if the current branch is `main` or a `release/v*` branch — those are protected and must be updated via PR only. Stop and report to the user.
- Confirm the target branch (default `main`). For a branch named `hotfix/*` the user may want to target a `release/v*` branch — ask before defaulting.

### 1b. Working tree state
```bash
git status
git diff --stat
git diff --cached --stat
```
Summarize for the user: unstaged files, staged files, untracked files. If nothing is staged AND nothing is unstaged AND no untracked files, stop — there is nothing to ship.

### 1c. Sync with target branch
```bash
git fetch origin <target-branch>
git log --oneline HEAD..origin/<target-branch>
```
If `origin/<target-branch>` has commits the current branch does not, ask the user whether to merge/rebase before shipping. Do NOT auto-merge.

## 2. Self-review the diff

Produce a focused self-review of the combined staged + unstaged diff (ignore untracked files unless the user wants them included):
```bash
git diff HEAD
```

Check for:
- Debug leftovers (`console.log`, `Console.WriteLine`, `Debug.WriteLine`, stray `debugger;`, commented-out code blocks)
- Secrets or connection strings accidentally committed (scan `.env*`, `appsettings*.json`, config files)
- TODO/FIXME introduced in this change
- Unintentional large/binary files
- Files outside the expected scope of the work

Report findings to the user. If anything critical is present, stop and ask before continuing.

## 3. Pre-commit checks

Run checks scoped to what actually changed. Determine which layers are touched:
```bash
git diff --name-only HEAD
```

### Frontend (if any file under `src/spacelinx-mes/` changed)
```bash
cd src/spacelinx-mes
npm run lint         # zero warnings tolerance
npm run build        # must succeed
cd -
```

### API (if any file under `src/SpaceLinx.Api/` changed)
```bash
cd src/SpaceLinx.Api
dotnet build SpaceLinx.Api.sln
cd -
```

### Database (if any file under `database/` changed)
Spot-check that new SQL scripts follow the schema/migration conventions in `database/CLAUDE.md`. Do NOT attempt to run them.

If any check fails, **stop**. Report the failure to the user and ask how to proceed. Do NOT attempt to auto-fix beyond obvious lint issues, and only then with the user's confirmation.

## 4. Commit

### 4a. Stage
Add only files that clearly belong to this change. Prefer explicit `git add <path>` over `git add -A` to avoid sweeping in unrelated files (e.g. `.env`, editor junk).

### 4b. Draft a commit message
Follow repo convention (see `git log --oneline -20`). Typical format:
```
<type>: <short summary>

<optional body — the WHY, not the WHAT>
```
Where `<type>` is `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, etc.

Show the draft message to the user and ask for approval before committing.

### 4c. Commit
```bash
git commit -m "$(cat <<'EOF'
<approved message>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```
If a pre-commit hook fails, do NOT `--amend` or `--no-verify`. Fix the underlying issue, re-stage, and create a new commit.

## 5. Push

```bash
git push -u origin <current-branch>
```
If the branch already tracks the remote and is up to date, a plain `git push` is fine.

## 6. Create PR

### 6a. Gather PR metadata
- Title: first line of the last commit, ≤70 chars.
- Description: full commit message body + any relevant work item IDs picked up from the branch name (e.g. `feature/12345-foo` → `#12345`).

### 6b. Create
```bash
az repos pr create \
  --repository SpaceLinx \
  --source-branch <current-branch> \
  --target-branch <target-branch> \
  --title "<title>" \
  --description "<description>" \
  --output json
```
Capture the returned `pullRequestId` — it's needed for the next steps.

### 6c. Link work items (if branch name contains an ID like `feature/12345-desc`)
```bash
az repos pr work-item add --id <PR_NUMBER> --work-items <WORK_ITEM_ID>
```

## 7. Approve

```bash
az repos pr set-vote --id <PR_NUMBER> --vote approve
```
Note: Azure DevOps branch policies may disallow self-approval. If this call errors, report it but continue — auto-complete will still be set.

## 8. Set auto-complete

```bash
az repos pr update --id <PR_NUMBER> --auto-complete true
```

## 9. Final report

Print a summary to the user:
- PR number and URL (from `webUrl` in the PR create response, or construct: `https://dev.azure.com/XDLinxDev/SpaceLinx/_git/SpaceLinx/pullrequest/<PR_NUMBER>`)
- Target branch
- Commits included (output of `git log --oneline origin/<target-branch>..HEAD`)
- Build/lint results
- Approve + auto-complete status (succeeded / skipped / failed)

Stop here. Do NOT attempt to force-merge or override branch policies.
