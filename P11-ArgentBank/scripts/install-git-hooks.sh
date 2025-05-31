#!/bin/bash

# Script d'installation du hook pre-commit pour pnpm
echo "🔧 Installation du hook pre-commit pour pnpm..."

HOOK_SOURCE="./scripts/pre-commit-hook.sh"
HOOK_DEST="../.git/hooks/pre-commit"

# Vérifier que le script source existe
if [ ! -f "$HOOK_SOURCE" ]; then
    echo "❌ Erreur: Le script $HOOK_SOURCE n'existe pas"
    exit 1
fi

# Créer le dossier hooks s'il n'existe pas
mkdir -p ../.git/hooks

# Copier le hook
cp "$HOOK_SOURCE" "$HOOK_DEST"

# Rendre exécutable
chmod +x "$HOOK_DEST"

echo "✅ Hook pre-commit installé avec succès!"
echo "🔍 Le hook s'exécutera automatiquement avant chaque commit"
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
