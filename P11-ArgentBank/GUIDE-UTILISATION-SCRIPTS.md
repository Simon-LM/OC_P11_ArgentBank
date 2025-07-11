<!-- @format -->

# 🚀 Copilot Management Scripts Usage Guide

## 📋 Overview

Your project has a complete automatic management system for GitHub Copilot backups and pnpm/npm conflicts. Here's how to use it effectively.

## 🎯 Available Scripts

### 1. Cleanup Scripts

#### `pnpm run clean:copilot`

**Usage:** Cleans all Copilot automatic backups

```bash
pnpm run clean:copilot
```

**When to use:**

- Before each important commit
- When VS Code becomes slow
- After an intensive development session

#### `pnpm run sync:pnpm`

**Usage:** Synchronizes dependencies and resolves npm/pnpm conflicts

```bash
pnpm run sync:pnpm
```

**When to use:**

- After installing new dependencies
- When you see package-lock.json vs pnpm-lock.yaml conflicts
- In case of dependency errors

### 2. All-in-One Script

#### `pnpm run commit-ready`

**Usage:** Completely prepares the project for a commit

```bash
pnpm run commit-ready
```

**What it does:**

- ✅ Cleans Copilot backups
- ✅ Synchronizes pnpm
- ✅ Displays Git status

**Recommended usage:** Before each important commit

### 3. Automatic Hook (Pre-commit)

#### Installation (one time only)

```bash
bash scripts/install-git-hooks.sh
```

**What happens automatically on each commit:**

1. 🧹 Copilot backup cleanup
2. 🔄 pnpm synchronization
3. 🔍 Code linting (warnings only, doesn't prevent commit)
4. 🎨 Automatic code formatting
5. ➕ Adding formatted files to commit

## 🔄 Recommended Workflows

### Workflow 1: Daily Development

```bash
# 1. Normal work in VS Code
# 2. Hook automatically handles cleanup on each commit
git add .
git commit -m "feat: new feature"
```

### Workflow 2: Manual Cleanup

```bash
# If you want to clean manually
pnpm run clean:copilot

# Or complete preparation
pnpm run commit-ready
git add .
git commit -m "refactor: code improvement"
```

### Workflow 3: Problem Resolution

```bash
# In case of conflicts or issues
pnpm run sync:pnpm        # Resolves dependency conflicts
pnpm run clean:copilot    # Cleans backups
pnpm run commit-ready     # Complete verification
```

## 🎯 Usage WITHOUT Commit

### ⚡ Direct Answers to Your Questions

**Q: Does cleanup happen automatically during commits?**  
✅ **YES** - The pre-commit hook automatically cleans on each `git commit`

**Q: How to synchronize without committing?**  
✅ **YES** - Use exactly: `pnpm run clean:copilot`

**Q: What to do before closing VS Code without commit?**  
✅ **YES** - Execute: `pnpm run clean:copilot`

### 🔄 Practical Scenarios WITHOUT Commit

#### Scenario 1: End of work session

```bash
# Before closing VS Code without committing
pnpm run clean:copilot
```

**Why?** Cleans temporary backups accumulated during the session.

#### Scenario 2: VS Code becomes slow

```bash
# While you're developing
pnpm run clean:copilot
```

**Why?** Frees disk space and improves performance.

#### Scenario 3: Long development session

```bash
# Every 2-3 hours, or when VS Code slows down
pnpm run clean:copilot
```

**Why?** Prevents excessive accumulation of temporary backups.

#### Scenario 4: Branch change without commit

```bash
# Before changing branch with uncommitted modifications
pnpm run clean:copilot
git stash push -m "WIP: work in progress"
git checkout other-branch
```

**Why?** Avoids backup conflicts between branches.

#### Scenario 5: Frequent VS Code restart

```bash
# If you restart VS Code often
pnpm run clean:copilot
```

**Why?** Avoids session restoration conflicts.

## 🎮 Development Commands

### Test Scripts

```bash
# Unit tests
pnpm test                 # Tests in production mode
pnpm run test:watch      # Tests in watch mode

# E2E tests
pnpm run test:e2e        # Cypress tests
pnpm run cypress:open    # Cypress interface

# Accessibility tests
pnpm run test:a11y       # Pa11y
```

### Build Scripts

```bash
pnpm run build           # Production build
pnpm run build:analyze   # Build with bundle analysis
pnpm run dev             # Development server
```

### Code Quality Scripts

```bash
pnpm run lint            # Linting
pnpm run format          # Prettier formatting
pnpm run typecheck       # TypeScript verification
```

## 🚨 Problem Management

### Problem: VS Code opens automatically

**Solution:** ✅ Already resolved! The `sync-vscode.sh` script has been modified to no longer open VS Code automatically.

### Problem: package-lock.json vs pnpm-lock.yaml conflicts

```bash
pnpm run sync:pnpm
```

### Problem: VS Code becomes slow

```bash
pnpm run clean:copilot
```

### Problem: Hook doesn't work

```bash
# Reinstall the hook
bash scripts/install-git-hooks.sh

# Check permissions
chmod +x ../.git/hooks/pre-commit
```

## 📊 System Status

### Verify everything works

```bash
# 1. Test cleanup
pnpm run clean:copilot

# 2. Test synchronization
pnpm run sync:pnpm

# 3. Verify hook
ls -la ../.git/hooks/pre-commit

# 4. Complete test
pnpm run commit-ready
```

### VS Code Configuration

Settings in `.vscode/settings.json` prevent excessive backup creation:

- `"files.hotExit": "off"`
- `"editor.formatOnSave": true`
- Optimized pnpm configuration

## 💡 Usage Tips

### ✅ Best Practices

- Let the pre-commit hook automatically handle cleanup
- Use `pnpm run commit-ready` before important commits
- Execute `pnpm run clean:copilot` after long development sessions

### ❌ To Avoid

- Don't disable the pre-commit hook
- Don't mix npm and pnpm (always use pnpm)
- Don't ignore linting warnings (even if they don't prevent commit)

## 🔧 Customization

### Modify hook behavior

Edit `scripts/pre-commit-hook.sh` to:

- Add other verifications
- Modify linting rules
- Change cleanup patterns

### Add new scripts

Add to `package.json` in the `scripts` section and create the corresponding file in `scripts/`.

---

## 📞 Support

If you encounter problems:

1. Check logs in the terminal
2. Consult `COPILOT_MANAGEMENT_GUIDE.md` for technical details
3. Reinstall the hook with `bash scripts/install-git-hooks.sh`

**The system is now fully automatic! 🎉**
