#!/bin/bash

# Copilot backup cleanup script before commit
echo "🧹 Cleaning VS Code/Copilot backups..."

# Remove temporary backup files
find . -name "*.backup" -type f -delete 2>/dev/null || true
find . -name "*.bak" -type f -delete 2>/dev/null || true
find . -name "*.autosave" -type f -delete 2>/dev/null || true
find . -name "*~" -type f -delete 2>/dev/null || true
find . -name "*.tmp" -type f -delete 2>/dev/null || true

# Clean temporary VS Code directories
rm -rf .vscode/workspaceStorage/ 2>/dev/null || true
rm -rf .history/ 2>/dev/null || true
rm -f .vscode/.BROWSERSLISTRC 2>/dev/null || true
rm -f .vscode/argv.json 2>/dev/null || true

# Clean system files
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
find . -name "Desktop.ini" -type f -delete 2>/dev/null || true

# Clean pnpm cache if necessary
if [ -d "node_modules/.pnpm" ]; then
    echo "🗑️  Cleaning pnpm cache..."
    pnpm store prune 2>/dev/null || true
fi

# Check Git status
if git status --porcelain | grep -q "^??"; then
    echo "⚠️  Untracked files detected after cleanup:"
    git status --porcelain | grep "^??"
fi

echo "✅ Cleanup completed!"
