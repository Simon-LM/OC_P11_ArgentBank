#!/bin/bash
# Script de test local pour simuler les conditions CI/CD Cypress

echo "🧪 Test de simulation Cypress CI/CD"
echo "=================================="

# Vérifier que le serveur local fonctionne
echo "📍 Vérification du serveur local..."
curl -s -I "http://localhost:3000" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Serveur local non accessible sur http://localhost:3000"
    echo "Veuillez démarrer 'vercel dev' dans un autre terminal"
    exit 1
fi
echo "✅ Serveur local accessible"

# Simulation des variables d'environnement CI/CD
export CI=true
export VERCEL_AUTOMATION_BYPASS_SECRET="test-local-bypass-secret"
export CYPRESS_BASE_URL="http://localhost:3000"

echo ""
echo "🔧 Variables d'environnement configurées :"
echo "   CI: $CI"
echo "   CYPRESS_BASE_URL: $CYPRESS_BASE_URL"
echo "   VERCEL_AUTOMATION_BYPASS_SECRET: $(if [ -n "$VERCEL_AUTOMATION_BYPASS_SECRET" ]; then echo '***SECRET_PRESENT***'; else echo 'NOT_FOUND'; fi)"

echo ""
echo "🚀 Exécution du test Cypress avec simulation CI/CD..."
echo "   (Les headers de bypass seront configurés automatiquement)"

# Exécuter Cypress avec un test spécifique pour réduire le temps d'exécution
pnpm exec cypress run \
  --config baseUrl=$CYPRESS_BASE_URL \
  --spec "cypress/e2e/auth/login.cy.ts" \
  --browser electron \
  --headless

echo ""
echo "📋 Test terminé"
echo "Vérifiez les logs ci-dessus pour confirmer que :"
echo "   ✅ '🔐 [Cypress CI/CD] Configuring Vercel bypass headers...' apparaît"
echo "   ✅ '✅ [Cypress CI/CD] Vercel bypass headers configured successfully' apparaît"
echo "   ✅ Les tests passent ou au moins démarrent correctement"
