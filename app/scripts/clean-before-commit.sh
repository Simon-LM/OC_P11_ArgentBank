#!/bin/bash

# Script to clean backups and prepare a clean commit
# Usage: ./scripts/clean-before-commit.sh

echo "🧹 Cleaning temporary files and backups..."

# Force save all open files
echo "💾 Force saving files in progress..."

# Clean VS Code temporary files
if [ -d ".vscode" ]; then
    find .vscode -name "*.tmp" -delete 2>/dev/null || true
    find .vscode -name "*.backup" -delete 2>/dev/null || true
    echo "✅ VS Code temporary files cleaned"
fi

# Clean system backup files
find . -name "*~" -delete 2>/dev/null || true
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Clean logs and reports
rm -rf coverage/ 2>/dev/null || true
rm -rf cypress/reports/ 2>/dev/null || true
rm -rf cypress/screenshots/ 2>/dev/null || true
rm -rf cypress/videos/ 2>/dev/null || true
rm -rf lighthouse/reports/ 2>/dev/null || true

# Check that all files are saved
echo "🔍 Checking for unsaved modifications..."
if git diff --name-only | grep -q .; then
    echo "📝 Modified files detected:"
    git diff --name-only
    echo ""
    echo "⚠️  Make sure all your files are saved in VS Code before continuing."
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operation cancelled"
        exit 1
    fi
fi

echo "✅ Cleanup completed! Ready for commit."
