#!/bin/bash

# Script pour synchroniser VS Code avec pnpm
echo "🔄 Synchronisation VS Code avec pnpm..."

# Forcer la sauvegarde de tous les fichiers ouverts
echo "💾 Forçage de la sauvegarde..."

# Nettoyer le cache VS Code
if [ -d ".vscode/workspaceStorage" ]; then
    echo "🗑️  Suppression du cache workspace VS Code..."
    rm -rf .vscode/workspaceStorage/
fi

# Nettoyer l'historique VS Code
if [ -d ".history" ]; then
    echo "🗑️  Suppression de l'historique VS Code..."
    rm -rf .history/
fi

# Recharger la configuration TypeScript si elle existe
if [ -f "tsconfig.json" ]; then
    echo "🔄 Rechargement de la configuration TypeScript..."
    touch tsconfig.json
fi

# Nettoyer et réinstaller les dépendances pnpm si nécessaire
if [ -f "pnpm-lock.yaml" ] && [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances pnpm..."
    pnpm install
fi

# Vérifier l'intégrité du lockfile pnpm
if [ -f "pnpm-lock.yaml" ]; then
    echo "🔍 Vérification de l'intégrité du lockfile pnpm..."
    pnpm install --frozen-lockfile 2>/dev/null || {
        echo "⚠️  Le lockfile pnpm semble obsolète"
        echo "💡 Exécutez 'pnpm install' pour le mettre à jour"
    }
fi

# Nettoyer le store pnpm si nécessaire
echo "🧹 Nettoyage du store pnpm..."
pnpm store prune 2>/dev/null || true

echo "✅ Synchronisation pnpm terminée!"
