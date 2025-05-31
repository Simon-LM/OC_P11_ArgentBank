#!/bin/bash

# Script pour nettoyer les sauvegardes et préparer un commit propre
# Usage: ./scripts/clean-before-commit.sh

echo "🧹 Nettoyage des fichiers temporaires et sauvegardes..."

# Forcer la sauvegarde de tous les fichiers ouverts
echo "💾 Sauvegarde forcée des fichiers en cours..."

# Nettoyer les fichiers temporaires de VS Code
if [ -d ".vscode" ]; then
    find .vscode -name "*.tmp" -delete 2>/dev/null || true
    find .vscode -name "*.backup" -delete 2>/dev/null || true
    echo "✅ Fichiers temporaires VS Code nettoyés"
fi

# Nettoyer les fichiers de sauvegarde système
find . -name "*~" -delete 2>/dev/null || true
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Nettoyer les logs et rapports
rm -rf coverage/ 2>/dev/null || true
rm -rf cypress/reports/ 2>/dev/null || true
rm -rf cypress/screenshots/ 2>/dev/null || true
rm -rf cypress/videos/ 2>/dev/null || true
rm -rf lighthouse/reports/ 2>/dev/null || true

# Vérifier que tous les fichiers sont sauvegardés
echo "🔍 Vérification des modifications non sauvegardées..."
if git diff --name-only | grep -q .; then
    echo "📝 Fichiers modifiés détectés:"
    git diff --name-only
    echo ""
    echo "⚠️  Assurez-vous que tous vos fichiers sont sauvegardés dans VS Code avant de continuer."
    read -p "Continuer? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Opération annulée"
        exit 1
    fi
fi

echo "✅ Nettoyage terminé! Prêt pour le commit."
