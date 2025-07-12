#!/bin/bash

# 🚀 Test script to verify installation
echo "🔍 Testing Copilot Backup Manager..."

# Check that files exist
echo "📋 Checking scripts..."

SCRIPTS_DIR="scripts"
REQUIRED_SCRIPTS=(
    "clean-copilot-backups.sh"
    "sync-package-manager.sh" 
    "commit-ready.sh"
    "pre-commit-hook.sh"
    "install-git-hooks.sh"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [ -f "$SCRIPTS_DIR/$script" ]; then
        echo "✅ $script"
    else
        echo "❌ $script missing"
    fi
done

# Check VS Code configuration
echo ""
echo "📋 Checking VS Code..."
if [ -f ".vscode/settings.json" ]; then
    echo "✅ .vscode/settings.json configured"
else
    echo "❌ .vscode/settings.json missing"
fi

# Check package.json
echo ""
echo "📋 Checking package.json..."
if grep -q "clean:copilot" package.json 2>/dev/null; then
    echo "✅ npm scripts added"
else
    echo "❌ npm scripts missing"
fi

# Check Git hook
echo ""
echo "📋 Checking Git hook..."
GIT_DIR=$(git rev-parse --git-dir 2>/dev/null)
if [ -f "$GIT_DIR/hooks/pre-commit" ]; then
    echo "✅ Pre-commit hook installed"
else
    echo "❌ Pre-commit hook missing"
fi

# Functional test
echo ""
echo "🧪 Functional test..."
if [ -f "package.json" ]; then
    PACKAGE_MANAGER="npm"
    if [ -f "pnpm-lock.yaml" ]; then
        PACKAGE_MANAGER="pnpm"
    elif [ -f "yarn.lock" ]; then
        PACKAGE_MANAGER="yarn"
    fi
    
    echo "Running: $PACKAGE_MANAGER run clean:copilot"
    $PACKAGE_MANAGER run clean:copilot
    
    if [ $? -eq 0 ]; then
        echo "✅ Functional test successful"
    else
        echo "❌ Functional test failed"
    fi
else
    echo "❌ package.json not found"
fi

echo ""
echo "🎉 Test completed!"
