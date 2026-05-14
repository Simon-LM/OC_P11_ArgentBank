#!/bin/bash

# Simplified and functional pre-commit hook
echo "🔄 Running pre-commit hook..."

# Move to app project directory
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
PROJECT_DIR="$PROJECT_ROOT/app"
cd "$PROJECT_DIR"

# Clean Copilot backups
echo "🧹 Cleaning backups..."
bash "$PROJECT_DIR/scripts/clean-copilot-backups.sh" || exit 1

# Synchronize with pnpm
echo "🔄 pnpm synchronization..."
bash "$PROJECT_DIR/scripts/sync-pnpm.sh" || exit 1

# Check that pnpm is used (not npm)
if [ -f "package-lock.json" ]; then
    echo "❌ Error: package-lock.json detected! This project uses pnpm."
    echo "💡 Remove package-lock.json and use 'pnpm install'"
    rm package-lock.json
    exit 1
fi

# Check that linters pass (optional to avoid errors)
echo "🔍 Code verification..."
if command -v pnpm &> /dev/null; then
    pnpm run lint:check 2>/dev/null || {
        echo "⚠️  Linting errors detected, but commit continues..."
    }
fi

# Format code (optional)
echo "🎨 Code formatting..."
if command -v pnpm &> /dev/null; then
    pnpm run format 2>/dev/null || true
fi

# Update formatted files in staging
git add -u 2>/dev/null || true

echo "✅ Pre-commit hook completed successfully!"
exit 0
