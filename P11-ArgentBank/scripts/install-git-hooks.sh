#!/bin/bash

# Pre-commit hook installation script for pnpm
echo "🔧 Installing pre-commit hook for pnpm..."

HOOK_SOURCE="./scripts/pre-commit-hook.sh"
HOOK_DEST="../.git/hooks/pre-commit"

# Check that source script exists
if [ ! -f "$HOOK_SOURCE" ]; then
    echo "❌ Error: Script $HOOK_SOURCE does not exist"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p ../.git/hooks

# Copy the hook
cp "$HOOK_SOURCE" "$HOOK_DEST"

# Make executable
chmod +x "$HOOK_DEST"

echo "✅ Pre-commit hook installed successfully!"
echo "🔍 The hook will run automatically before each commit"
echo ""
echo "💡 Le hook va:"
echo "   • Nettoyer les sauvegardes Copilot"
echo "   • Synchroniser avec pnpm"
echo "   • Vérifier que pnpm est utilisé (pas npm)"
echo "   • Exécuter les linters"
echo "   • Formater le code"
echo ""
echo "🚀 Pour tester le hook manuellement:"
echo "   $HOOK_DEST"
