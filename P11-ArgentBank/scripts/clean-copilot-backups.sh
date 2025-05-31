#!/bin/bash

# Script de nettoyage des sauvegardes Copilot avant commit
echo "🧹 Nettoyage des sauvegardes VS Code/Copilot..."

# Supprimer les fichiers de sauvegarde temporaires
find . -name "*.backup" -type f -delete 2>/dev/null || true
find . -name "*.bak" -type f -delete 2>/dev/null || true
find . -name "*.autosave" -type f -delete 2>/dev/null || true
find . -name "*~" -type f -delete 2>/dev/null || true
find . -name "*.tmp" -type f -delete 2>/dev/null || true

# Nettoyer les dossiers VS Code temporaires
rm -rf .vscode/workspaceStorage/ 2>/dev/null || true
rm -rf .history/ 2>/dev/null || true
rm -f .vscode/.BROWSERSLISTRC 2>/dev/null || true
rm -f .vscode/argv.json 2>/dev/null || true

# Nettoyer les fichiers système
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
find . -name "Desktop.ini" -type f -delete 2>/dev/null || true

# Nettoyer le cache pnpm si nécessaire
if [ -d "node_modules/.pnpm" ]; then
    echo "🗑️  Nettoyage du cache pnpm..."
    pnpm store prune 2>/dev/null || true
fi

# Vérifier l'état Git
if git status --porcelain | grep -q "^??"; then
    echo "⚠️  Fichiers non suivis détectés après nettoyage:"
    git status --porcelain | grep "^??"
fi

echo "✅ Nettoyage terminé!"
