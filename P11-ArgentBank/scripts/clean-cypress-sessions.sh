#!/bin/bash

# Script pour nettoyer les sessions Cypress et redémarrer les tests
# Usage: ./scripts/clean-cypress-sessions.sh

echo "🧹 Nettoyage des sessions Cypress..."

# Supprimer le cache des sessions Cypress
if [ -d "cypress/.sessions" ]; then
    rm -rf cypress/.sessions
    echo "✅ Cache des sessions supprimé"
else
    echo "ℹ️  Aucun cache de session trouvé"
fi

# Supprimer les screenshots et vidéos de test
if [ -d "cypress/screenshots" ]; then
    rm -rf cypress/screenshots
    echo "✅ Screenshots supprimés"
fi

if [ -d "cypress/videos" ]; then
    rm -rf cypress/videos
    echo "✅ Vidéos supprimées"
fi

# Supprimer les rapports précédents
if [ -d "cypress/reports" ]; then
    rm -rf cypress/reports
    echo "✅ Rapports supprimés"
fi

echo "🎯 Nettoyage terminé. Vous pouvez maintenant relancer les tests."
echo ""
echo "Commandes disponibles :"
echo "  npm run cypress:open    # Interface graphique"
echo "  npm run cypress:run     # Exécution en mode headless"
echo "  npm run test:e2e        # Tests E2E complets"
