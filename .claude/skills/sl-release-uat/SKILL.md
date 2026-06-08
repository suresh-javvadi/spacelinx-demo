---
name: sl-release-uat
description: Cut a new UAT release — create a `release/v*` branch from `origin/main` and push it, which auto-triggers the UAT deploy pipeline.
argument-hint: <version — e.g. v1.0.1>
allowed-tools: Bash, Read
---

# Release to UAT

Cuts a new `release/v*` branch from the current tip of `origin/main` and pushes it to origin. The Azure DevOps pipeline (`azure-pipelines.yml`) auto-triggers the **Deploy to UAT** stage on any push to `refs/heads/release/v*`.

Repo: `SpaceLinx` (project `SpaceLinx`, repository GUID `a9516be3-36ad-421f-96ca-fe56266861dd`).
Target environment: **UAT** — `spacelinxapiuat.azurewebsites.net` / `spacelinxmesuat.azurewebsites.net`.

> This is a **shared-impact action**. It triggers a deployment visible to the whole UAT user base. Never proceed to the push step without explicit user confirmation. Never use destructive git commands (`--force`, `reset --hard`) unless the user explicitly authorizes it.

## 1. Parse version

Version comes from `$ARGUMENTS`. If not provided, stop and ask the user.

Validate the format:
- Must match `^v\d+\.\d+\.\d+$` (e.g. `v1.0.1`, `v2.3.0`). Reject anything else and ask.
- The resulting branch name will be `release/<version>` (e.g. `release/v1.0.1`).

## 2. Pre-flight checks

### 2a. Working tree clean
```bash
git status
```
If there are uncommitted or staged changes, **stop** and ask the user whether to stash / commit / abort. Do NOT proceed with a dirty working tree — you'd risk committing unrelated work to the release branch.

### 2b. Fetch latest
```bash
git fetch origin main
git fetch origin 'refs/heads/release/*:refs/remotes/origin/release/*'
```

### 2b-bis. Verify `origin/main` ref is not stale

**Why this matters:** on some setups (notably Windows with certain credential helpers / antivirus / network proxies) `git fetch` reports success but does not actually update the local `refs/remotes/origin/main` ref — the local view of main stays frozen at an older commit while the true remote tip has moved on. If you branch from this stale ref, the resulting release will silently miss commits that were already merged to main. This caused a real incident: a release was cut from a tip one commit behind the actual `origin/main`, leaving a merged PR out of UAT.

Confirm the local `origin/main` ref matches what the remote actually reports, and repair if they disagree:
```bash
# What does the remote say is the tip of main?
REMOTE_TIP=$(git ls-remote origin refs/heads/main | cut -f1)

# What does the local ref say?
LOCAL_TIP=$(git rev-parse origin/main)

# If they differ, the local ref is stale — force-update it from the remote.
if [ "$REMOTE_TIP" != "$LOCAL_TIP" ]; then
  echo "STALE: local origin/main=$LOCAL_TIP remote=$REMOTE_TIP — updating"
  git update-ref refs/remotes/origin/main "$REMOTE_TIP"
fi

# Confirm they now match
git rev-parse origin/main
```
After this step, the value of `origin/main` MUST equal the output of `git ls-remote origin refs/heads/main`. If it doesn't, **stop** and report — there is a deeper problem (e.g. fetch is fundamentally broken, permission issue) that needs investigating before cutting a release.

### 2c. Check the branch doesn't already exist
```bash
git ls-remote origin "refs/heads/release/<version>"
git show-ref --verify --quiet "refs/heads/release/<version>" && echo "LOCAL EXISTS"
```
If either local or remote `release/<version>` already exists, **stop** and ask the user. Options: pick a different version, delete the existing (only with explicit permission), or push an update to it.

### 2d. Resolve base commit
Base is the current tip of `origin/main` (after the stale-ref check in 2b-bis):
```bash
git rev-parse origin/main
git log --oneline origin/main -5
```
Show the user the exact commit SHA and the last few commit subjects so they can confirm this is the state they want to ship.

**Cross-check:** the SHA from `git rev-parse origin/main` MUST equal the `REMOTE_TIP` value captured in step 2b-bis. If they differ at this point (e.g. someone merged to main between 2b-bis and 2d), redo step 2b-bis and re-confirm with the user before proceeding — never branch off a moving target without an explicit re-confirmation.

## 3. Show what will be deployed

Compute a comparison against the most recent prior `release/v*` branch on origin so the user can see what's new in this release:

```bash
# Find the latest prior release branch (by version sort, excluding the one we're about to create)
git for-each-ref --sort=-v:refname --format='%(refname:short)' 'refs/remotes/origin/release/v*' | head -5
```

Pick the newest prior release branch (if any) and diff:
```bash
git log --oneline <prior-release>..origin/main
git diff --stat <prior-release>..origin/main
```

Present to the user:
- Version: `<version>`
- Branch to create: `release/<version>`
- Base commit: `<sha>` — `<subject>`
- Prior release (for comparison): `<prior-release>` or "no prior release found"
- Commit list shipping in this release (PRs + subjects)
- Files changed summary (from `--stat`)

**Ask the user to confirm** before proceeding. Do NOT push until confirmed.

## 4. Create the release branch locally

```bash
git branch release/<version> origin/main
```
Don't switch to it — keep the user on their current branch. Creating-only is safer and reversible.

Verify:
```bash
git log --oneline release/<version> -3
```

## 5. Push to origin

After the user confirms:
```bash
git push -u origin release/<version>
```

A plain push (non-force). If this errors, stop and report — do not escalate to `--force`.

## 6. Queue the CI/CD pipeline run

> **Why manual queue, not rely on auto-trigger:** When the new release branch's tip commit SHA already exists on `main` (normal case when cutting from `origin/main`), Azure DevOps dedupes the push and does NOT auto-queue a new build for the branch — the commit has already been built on `main`. So we must explicitly queue a run for the new branch, which forces the pipeline to evaluate stage conditions under `Build.SourceBranch = refs/heads/release/<version>` and trigger the **Deploy to UAT** stage.

Verify by listing recent runs immediately after push:
```bash
az pipelines runs list --branch "refs/heads/release/<version>" --top 3 --output json
```
If a run is already queued/running, skip this step. Otherwise, manually queue:

```bash
# Pipeline id for SpaceLinx-CI-CD is 57 (path: \) — fallback: `az pipelines list` and grep
az pipelines run --id 57 --branch "release/<version>" --output json
```

Capture the returned `id` and `buildNumber` for the report. If the queue call errors (permissions, pipeline deleted, etc.), stop and report — do NOT escalate by pushing an empty commit to force a trigger without the user's permission.

## 7. Report

Print a summary:
- **Branch pushed:** `release/<version>` → `origin/release/<version>`
- **Base commit:** `<sha>` (from `origin/main`)
- **Commits shipping vs prior release** (from step 3)
- **Pipeline run queued:** build `<buildNumber>` (run id `<id>`) → `https://dev.azure.com/XDLinxDev/SpaceLinx/_build/results?buildId=<id>`
- **Stage flow:** BuildAPI → BuildFrontend → **DeployUAT** (auto-runs per `startsWith(..., 'refs/heads/release/v')` condition)
- **UAT URLs** once deploy completes:
  - API: `https://spacelinxapiuat.azurewebsites.net`
  - Frontend: `https://spacelinxmesuat.azurewebsites.net`
- **Next step:** after UAT sign-off, run `/sl-release-prod <version>` to tag this release and deploy to Production.

Stop here. Do NOT attempt to create tags, promote to prod, or run additional pipelines.

## Aborting after push

If the user realizes something is wrong after the push, the safe recovery is:
- Create another release branch with a higher patch version from a fixed commit, OR
- Push a correcting commit to the release branch.

Never `git push --force` a release branch unless the user explicitly requests it and confirms no other deploy is in flight — force-pushing a branch that UAT is already deploying from can corrupt the deploy.
