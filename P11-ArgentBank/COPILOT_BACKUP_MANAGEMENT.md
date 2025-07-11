<!-- @format -->

# 🤖 Complete Guide: GitHub Copilot Backup Management with pnpm

> **Problem Solved**: Copilot/VS Code backup conflicts during restarts and commits with pnpm

## 📋 **Table of Contents**

1. [Initial Problem](#-initial-problem)
2. [Implemented Solutions](#-implemented-solutions)
3. [Installation and Configuration](#-installation-and-configuration)
4. [Daily Usage](#-daily-usage)
5. [Troubleshooting](#-troubleshooting)
6. [Technical Architecture](#-technical-architecture)
7. [FAQ](#-faq)

---

## 🚨 **Initial Problem**

### Observed Symptoms

- ✗ Old file backups reappear when VS Code restarts
- ✗ Conflicts between npm and pnpm (package-lock.json vs pnpm-lock.yaml)
- ✗ Copilot backups not synchronized with Git state
- ✗ Corrupted VS Code cache causing inconsistencies

### Root Causes

- **VS Code**: `files.hotExit` enabled by default
- **Copilot**: Automatic backups not cleaned up
- **Package Manager**: Mixing npm/pnpm in the same project
- **Cache**: Accumulation of temporary files

---

## ✅ **Implemented Solutions**

### 1. **Optimized VS Code Configuration**

- `files.hotExit: "off"` - Disables automatic backups on close
- Exclusion of temporary folders from indexing
- `npm.packageManager: "pnpm"` configuration to force pnpm usage

### 2. **Automatic Cleanup Scripts**

#### 🧹 **Copilot Backup Cleanup**

```bash
pnpm run clean:copilot
# or directly
bash scripts/clean-copilot-backups.sh
```

#### 🔄 **pnpm Synchronization**

```bash
pnpm run sync:pnpm
# or directly
bash scripts/sync-pnpm.sh
```

#### 🚀 **Commit Preparation**

```bash
pnpm run commit-ready
```

This command:

- Cleans Copilot backups
- Synchronizes with pnpm
- Displays Git status

### 3. **Automatic Pre-commit Hook**

#### Hook Installation

```bash
bash scripts/install-git-hooks.sh
```

The hook runs automatically before each commit and:

- ✅ Cleans VS Code/Copilot backups
- ✅ Checks for absence of `package-lock.json`
- ✅ Synchronizes with pnpm
- ✅ Runs linters
- ✅ Formats code

### 4. **Updated Gitignore**

The following files are now ignored:

```gitignore
# VS Code and Copilot backups
.vscode/workspaceStorage/
.history/
*.backup
*.bak
*.autosave

# Package manager conflicts
package-lock.json
yarn.lock
```

## 🎯 **Recommended Workflow**

### Before Closing VS Code

```bash
pnpm run commit-ready
```

### Before an Important Commit

```bash
# Complete cleanup
pnpm run clean:copilot
pnpm run sync:pnpm

# Verification
git status

# Commit (hook triggers automatically)
git commit -m "your message"
```

### In Case of Synchronization Issues

```bash
# Force synchronization
pnpm run sync:pnpm

# Completely clean cache
rm -rf .vscode/workspaceStorage/
rm -rf .history/
pnpm store prune
```

## 🚨 **Common Conflict Resolution**

### Package-lock.json Detected

```bash
# The hook will remove it automatically
# Or manually:
rm package-lock.json
pnpm install
```

### Corrupted Backups

```bash
# Complete cleanup
pnpm run clean:copilot
# Restart VS Code
```

### pnpm Cache Issues

```bash
# Clean pnpm store
pnpm store prune
# Reinstall
pnpm install
```

## 📋 **Quick Commands**

| Action             | Command                             |
| ------------------ | ----------------------------------- |
| Quick cleanup      | `pnpm run clean:copilot`            |
| Sync pnpm          | `pnpm run sync:pnpm`                |
| Commit preparation | `pnpm run commit-ready`             |
| Install hook       | `bash scripts/install-git-hooks.sh` |
| Test hook          | `.git/hooks/pre-commit`             |

## 💡 **Best Practices**

1. **Run `pnpm run commit-ready` before closing VS Code**
2. **Always use pnpm, never npm** in this project
3. **The pre-commit hook protects against common errors**
4. **When in doubt, clean with `pnpm run clean:copilot`**

---

✨ **With this configuration, your Copilot backups will be managed automatically and you'll avoid conflicts!**
