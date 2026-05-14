<!-- @format -->

# 🤖 GitHub Copilot Backup Management - Quick Guide

> **Automatic solution** to prevent Copilot/VS Code backup conflicts during restarts and commits with pnpm

## 🚀 Quick Usage

### Essential Commands

```bash
# Clean Copilot backups
pnpm run clean:copilot

# Synchronize pnpm (resolves npm/pnpm conflicts)
pnpm run sync:pnpm

# Complete preparation before commit
pnpm run commit-ready

# Install automatic hook (one time only)
bash scripts/install-git-hooks.sh
```

## 🔧 Initial Setup

### 1. Install Pre-commit Hook (One time only)

```bash
bash scripts/install-git-hooks.sh
```

### 2. Test Configuration

```bash
# Test cleanup
pnpm run clean:copilot

# Test synchronization
pnpm run sync:pnpm

# Complete test
pnpm run commit-ready
```

## 🔄 Daily Workflow

### Standard Development

```bash
# 1. Develop normally in VS Code
# ... code, save, etc ...

# 2. Before an important commit (optional)
pnpm run commit-ready

# 3. Normal commit - hook executes automatically
git add .
git commit -m "feat: new feature"
```

### Automatic Hook Actions

On each commit, the hook automatically executes:

- ✅ Cleans VS Code/Copilot backups
- ✅ Removes `package-lock.json` (npm/pnpm conflict)
- ✅ Verifies pnpm is used correctly
- ✅ Runs ESLint and Prettier

## 🚨 Common Problem Resolution

### Problem: `package-lock.json` Reappears

```bash
# The hook removes it automatically, or manually:
rm package-lock.json
pnpm install
```

### Problem: Corrupted Backups

```bash
# Complete cleanup
pnpm run clean:copilot

# Restart VS Code after cleanup
```

### Problem: Hook Doesn't Trigger

```bash
# Reinstall the hook
bash scripts/install-git-hooks.sh

# Test manually
.git/hooks/pre-commit
```

### Problem: Corrupted pnpm Cache

```bash
# Clean and reinstall
rm -rf node_modules/
pnpm store prune
pnpm install
```

## 💡 Best Practices

### ✅ Do

- **Always use pnpm** in this project
- **Keep the hook enabled** for consistency
- **Run `pnpm run commit-ready`** before important commits
- **Clean regularly** with `pnpm run clean:copilot`

### ❌ Don't

- **Don't use npm** in this pnpm project
- **Don't bypass the hook** except in exceptional cases
- **Don't ignore script warnings**

## 🔍 Diagnostic Commands

```bash
# Check Git status
git status

# Check installed hooks
ls -la .git/hooks/pre-commit

# Test performance
time pnpm run commit-ready

# Check VS Code configuration
cat .vscode/settings.json | grep -E "(hotExit|packageManager)"
```

## 🎯 Specific Use Cases

### Temporarily Bypass Hook

```bash
# Commit without hook (emergency only)
git commit --no-verify -m "emergency commit"

# Temporarily disable
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled

# Re-enable
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

### Migration from npm Project

```bash
# 1. Remove npm artifacts
rm package-lock.json
rm -rf node_modules/

# 2. Install with pnpm
pnpm install

# 3. Install hooks
bash scripts/install-git-hooks.sh

# 4. First cleanup
pnpm run commit-ready
```

## 📁 Script Architecture

```
scripts/
├── clean-copilot-backups.sh    # Backup cleanup
├── sync-pnpm.sh                # pnpm synchronization
├── install-git-hooks.sh        # Hook installation
└── pre-commit-hook.sh           # Pre-commit hook

.vscode/
└── settings.json                # Optimized VS Code configuration
```

## 🔗 Useful Links

- [Complete Detailed Guide](./COPILOT_MANAGEMENT_GUIDE.md) - Comprehensive documentation
- [pnpm Documentation](https://pnpm.io/motivation)
- [VS Code Settings Reference](https://code.visualstudio.com/docs/getstarted/settings)

---

**✨ With this configuration, your Copilot backups are managed automatically!**

_Last updated: May 31, 2025_
