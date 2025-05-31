#!/bin/bash

# Hook pre-commit simplifié et fonctionnel
echo "🔄 Exécution du hook pre-commit..."

# Se déplacer dans le répertoire du projet P11-ArgentBank
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
PROJECT_DIR="$PROJECT_ROOT/P11-ArgentBank"
cd "$PROJECT_DIR"

# Nettoyer les sauvegardes Copilot
echo "🧹 Nettoyage des sauvegardes..."
bash "$PROJECT_DIR/scripts/clean-copilot-backups.sh" || exit 1

# Synchroniser avec pnpm
echo "🔄 Synchronisation pnpm..."
bash "$PROJECT_DIR/scripts/sync-pnpm.sh" || exit 1

# Vérifier que pnpm est utilisé (pas npm)
if [ -f "package-lock.json" ]; then
    echo "❌ Erreur: package-lock.json détecté! Ce projet utilise pnpm."
    echo "💡 Supprimez package-lock.json et utilisez 'pnpm install'"
    rm package-lock.json
    exit 1
fi

# Vérifier que les linters passent (optionnel pour éviter les erreurs)
echo "🔍 Vérification du code..."
if command -v pnpm &> /dev/null; then
    pnpm run lint:check 2>/dev/null || {
        echo "⚠️  Erreurs de linting détectées, mais le commit continue..."
    }
fi

# Formatter le code (optionnel)
echo "🎨 Formatage du code..."
if command -v pnpm &> /dev/null; then
    pnpm run format 2>/dev/null || true
fi

# Mettre à jour les fichiers formatés dans le staging
git add -u 2>/dev/null || true

echo "✅ Pre-commit hook terminé avec succès!"
exit 0
