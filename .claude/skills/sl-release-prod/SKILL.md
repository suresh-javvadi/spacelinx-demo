---
name: sl-release-prod
description: Promote an existing `release/v*` branch to Production — create and push a `v*` tag, which auto-triggers the Prod + Demo deploy pipeline (with manual approval gate).
argument-hint: <version — e.g. v1.0.1>
allowed-tools: Bash, Read
---

# Release to Production (and Demo)

Creates a `v*` annotated tag on the tip of an existing `release/v*` branch and pushes it. The Azure DevOps pipeline (`azure-pipelines.yml`) auto-triggers the **Deploy to Production + Demo** stage on any push of `refs/tags/v*`. Prod deploys are gated behind a manual approval in the `spacelinx-mes-prod` environment (Azure DevOps Environments UI).

Repo: `SpaceLinx` (project `SpaceLinx`, repository GUID `a9516be3-36ad-421f-96ca-fe56266861dd`).
Target environments: **Production** (`spacelinxapiprod` / `spacelinxmesprod`) **and Demo** (`spacelinxapidemo` / `spacelinxmesdemo`) — both deploy in the same pipeline stage.

> This is the **highest-impact action** in this repo. Never proceed to `git push` the tag without explicit user confirmation that UAT sign-off has happened. A pushed tag is effectively permanent — deleting a published tag is messy and confusing for auditors. Never use destructive git commands unless the user explicitly authorizes it.

## 1. Parse version

Version comes from `$ARGUMENTS`. If not provided, stop and ask the user.

Validate:
- Must match `^v\d+\.\d+\.\d+$` (e.g. `v1.0.1`).
- The corresponding release branch `release/<version>` **must already exist on origin** (created earlier via `/sl-release-uat`).
- The tag `<version>` must **not** already exist anywhere.

## 2. Pre-flight checks

### 2a. Fetch latest branches and tags
```bash
git fetch origin --tags --prune --prune-tags
git fetch origin "refs/heads/release/<version>:refs/remotes/origin/release/<version>"
git fetch origin main
```

### 2a-bis. Verify local refs are not stale

**Why this matters:** on some setups (notably Windows with certain credential helpers / antivirus / network proxies) `git fetch` reports success but does not actually update the local `refs/remotes/origin/*` refs — the local view stays frozen at older commits while the true remote tips have moved on. For a prod release this is dangerous in two ways:
1. A stale `origin/release/<version>` means `git tag -a <version> origin/release/<version>` tags an older commit than what's actually on the release branch, shipping less than the user thinks they're shipping.
2. A stale `origin/main` makes the back-merge / ancestor check in step 2e produce false positives — commits that are already on main appear "on release but not on main", spooking the user.

This caused a real incident on the UAT side (`release/v1.0.4`, 2026-05-27) — a release was cut from a tip one commit behind real remote, silently dropping a merged PR.

Cross-check each local ref against the remote and repair if stale:
```bash
# origin/main
REMOTE_MAIN=$(git ls-remote origin refs/heads/main | cut -f1)
LOCAL_MAIN=$(git rev-parse origin/main)
if [ "$REMOTE_MAIN" != "$LOCAL_MAIN" ]; then
  echo "STALE: local origin/main=$LOCAL_MAIN remote=$REMOTE_MAIN — updating"
  git update-ref refs/remotes/origin/main "$REMOTE_MAIN"
fi

# origin/release/<version>
REMOTE_REL=$(git ls-remote origin refs/heads/release/<version> | cut -f1)
LOCAL_REL=$(git rev-parse "origin/release/<version>")
if [ "$REMOTE_REL" != "$LOCAL_REL" ]; then
  echo "STALE: local origin/release/<version>=$LOCAL_REL remote=$REMOTE_REL — updating"
  git update-ref "refs/remotes/origin/release/<version>" "$REMOTE_REL"
fi

# Confirm both match remote now
git rev-parse origin/main "origin/release/<version>"
```
After this step, both refs MUST equal what `git ls-remote` reports. If a ref still disagrees, **stop** and report — there is a deeper problem (fetch broken, permissions, etc.) that needs investigating before publishing a production tag.

### 2b. Verify the release branch exists on origin
```bash
git ls-remote origin "refs/heads/release/<version>"
```
If the branch does NOT exist on origin, **stop**. Tell the user they need to run `/sl-release-uat <version>` first, have UAT sign-off, and then come back here.

### 2c. Verify the tag doesn't already exist
```bash
git ls-remote origin "refs/tags/<version>"
git tag -l "<version>"
```
If a tag already exists either locally or on origin, **stop** and ask. Reusing a tag name is a hard no.

### 2d. Show the release branch state
```bash
git log --oneline "origin/release/<version>" -5
git rev-parse "origin/release/<version>"
```
Report the tip commit SHA and the last few commit subjects.

### 2e. Check the release branch is ancestor-consistent with `origin/main`
This catches a common mistake: someone made a fix directly on `release/v*` but never merged it back, and now the prod tag will ship code that isn't on main.
```bash
# origin/main and origin/release/<version> are already verified fresh in step 2a-bis
git log --oneline "origin/main..origin/release/<version>" | head -20
```
If this shows commits, **flag to the user**: "the release branch has N commits that are NOT on main. These will be deployed to prod. Continue? You probably also want to back-merge them to main." Do NOT block — sometimes this is intentional (e.g. release-pipeline hotfixes) — but always surface it.

## 3. Confirm UAT sign-off

**Explicitly ask the user** before continuing:

> This will tag `origin/release/<version>` at commit `<sha>` as `<version>` and push the tag, triggering the Production + Demo deployment pipeline. Has UAT sign-off been confirmed? Please confirm before I proceed.

Do NOT continue without a yes. If the user cannot confirm UAT sign-off, stop.

## 4. Draft tag message

Show the user a proposed annotated tag message and ask for approval:

```
<version>

Release of <version>.

Includes:
- <bullet per PR / subject from `git log --oneline origin/<prior-release>..origin/release/<version>`>

UAT-verified: <date-or-ticket>
```

The user may edit the message. Do not proceed with a generic message unless the user explicitly says "default is fine".

## 5. Create the tag locally

**Just-in-time stale-ref re-check.** Between step 2a-bis and now, the user has confirmed UAT sign-off and approved the tag message — that's typically a few minutes of wall time. If someone pushed an additional commit to `release/<version>` during that window (rare, but possible for last-minute hotfixes), tagging from the now-stale local ref would silently miss those commits. Re-verify immediately before tagging:
```bash
REMOTE_REL=$(git ls-remote origin refs/heads/release/<version> | cut -f1)
LOCAL_REL=$(git rev-parse "origin/release/<version>")
if [ "$REMOTE_REL" != "$LOCAL_REL" ]; then
  echo "STALE between 2a-bis and tag time: local=$LOCAL_REL remote=$REMOTE_REL"
  # STOP. Do not tag. Re-run from step 2a — the user needs to see the new commits
  # and re-approve before we ship them to prod.
fi
```
If the refs disagree here, **stop, report to the user, and restart the pre-flight checks from step 2a**. Do NOT silently auto-update and proceed — a new commit on the release branch right before tagging deserves an explicit re-confirmation.

Then create the tag:
```bash
git tag -a "<version>" "origin/release/<version>" -m "<approved message>"
```

Annotated tag (`-a`), not lightweight. Annotated tags carry the tagger identity and message, which matters for audit trail.

Verify:
```bash
git show "<version>" --no-patch
```

## 6. Push the tag

After the user confirms:
```bash
git push origin "refs/tags/<version>"
```

Push only the tag — do NOT push any branches in the same command.

If this errors, stop and report — never escalate to `--force`. Do NOT delete and re-push a tag unless the user explicitly authorizes it and acknowledges the audit implication.

## 7. Report

Print a summary:
- **Tag pushed:** `<version>` → `origin/refs/tags/<version>`
- **Tagged commit:** `<sha>` (tip of `release/<version>`)
- **Commits in this release** (from the log list gathered in step 2d)
- **Pipeline trigger:** Prod + Demo deployment stage will auto-queue. **Manual approval is required** in the Azure DevOps Environments UI (`spacelinx-mes-prod`) before the deploy proceeds — tell the user explicitly that they (or an approver) need to go click Approve.
- **Pipeline URL:** `https://dev.azure.com/XDLinxDev/SpaceLinx/_build` (or direct environment URL if known).
- **Post-deploy URLs:**
  - Prod API: `https://spacelinxapiprod.azurewebsites.net`
  - Prod Frontend: `https://spacelinxmesprod.azurewebsites.net`
  - Demo API: `https://spacelinxapidemo.azurewebsites.net`
  - Demo Frontend: `https://spacelinxmesdemo.azurewebsites.net`
- **Reminder:** if the release branch had commits not on main (flagged in step 2e), the user should open a PR to back-merge `release/<version>` into `main`. Offer to do that if they ask, but don't do it unprompted.

Stop here. Do NOT attempt to:
- Approve the Azure DevOps environment deploy (that's a human gate by policy)
- Delete the release branch (it stays around for hotfixes and audit)
- Create a GitHub/Azure release page unless the user asks

## Aborting after tag push

Tags are persistent and visible. If the user realizes a mistake *after* the tag is pushed:
- If the deploy hasn't been approved yet in the Environments UI, tell them to **reject** it there — that's the safest path. Then cut a corrected tag (e.g. `v1.0.2`) from a fixed commit.
- Do NOT `git push --delete origin <version>` unless the user explicitly requests it and understands that any already-built artifacts and audit records will still exist.
