---
name: sl-sync-main
description: Fetch latest from main branch and merge into the current local branch
allowed-tools: Bash
---

# Sync current branch with latest main

Fetch the latest changes from the remote `main` branch and merge them into the current local branch.

> `main` is the protected, always-deployable branch for the unified SpaceLinx repo (auto-deploys to Dev). Feature/bugfix branches should be kept in sync with `main` before raising a PR.

## Steps

### 1. Check current state
```bash
git status
git branch --show-current
```

- If there are **uncommitted changes** (staged or unstaged), **stop and ask the user** whether to stash them, commit them, or abort. Do NOT proceed with a dirty working tree.
- Note the current branch name. If already on `main`, warn the user and ask if they just want to pull latest.

### 2. Fetch latest from remote
```bash
git fetch origin main
```

### 3. Merge main into current branch
```bash
git merge origin/main
```

### 4. Handle merge conflicts
If the merge produces conflicts:
1. Run `git diff --name-only --diff-filter=U` to list conflicted files.
2. Show the list to the user.
3. **Ask the user** how they want to resolve — do NOT auto-resolve or force anything.
4. If the user asks to abort: `git merge --abort`

### 5. Verify
After a successful merge:
```bash
git log --oneline -5
git status
```

Report the result to the user: how many commits were pulled in and whether the merge was clean.
