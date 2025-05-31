#!/bin/bash

# 🚀 Script de test pour vérifier l'installation
echo "🔍 Test du Copilot Backup Manager..."

# Vérifier que les fichiers existent
echo "📋 Vérification des scripts..."

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
        echo "❌ $script manquant"
    fi
done

# Vérifier la configuration VS Code
echo ""
echo "📋 Vérification VS Code..."
if [ -f ".vscode/settings.json" ]; then
    echo "✅ .vscode/settings.json configuré"
else
    echo "❌ .vscode/settings.json manquant"
fi

# Vérifier le package.json
echo ""
echo "📋 Vérification package.json..."
if grep -q "clean:copilot" package.json 2>/dev/null; then
    echo "✅ Scripts npm ajoutés"
else
    echo "❌ Scripts npm manquants"
fi

# Vérifier le hook Git
echo ""
echo "📋 Vérification hook Git..."
GIT_DIR=$(git rev-parse --git-dir 2>/dev/null)
if [ -f "$GIT_DIR/hooks/pre-commit" ]; then
    echo "✅ Hook pre-commit installé"
else
    echo "❌ Hook pre-commit manquant"
fi

# Test fonctionnel
echo ""
echo "🧪 Test fonctionnel..."
if [ -f "package.json" ]; then
    PACKAGE_MANAGER="npm"
    if [ -f "pnpm-lock.yaml" ]; then
        PACKAGE_MANAGER="pnpm"
    elif [ -f "yarn.lock" ]; then
        PACKAGE_MANAGER="yarn"
    fi
    
    echo "Exécution de: $PACKAGE_MANAGER run clean:copilot"
    $PACKAGE_MANAGER run clean:copilot
    
    if [ $? -eq 0 ]; then
        echo "✅ Test fonctionnel réussi"
    else
        echo "❌ Test fonctionnel échoué"
    fi
else
    echo "❌ package.json introuvable"
fi

echo ""
echo "🎉 Test terminé!"
