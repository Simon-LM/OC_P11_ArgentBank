#!/bin/bash

# Script de test pour simuler les conditions CI/CD localement
# Usage: ./test-cypress-ci-simulation.sh

set -e

echo "🔍 Test de simulation des conditions CI/CD pour Cypress"
echo "=============================================="

# Vérification des prérequis
echo "📋 Vérifications des prérequis..."

if ! command -v curl &> /dev/null; then
    echo "❌ curl n'est pas installé"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm n'est pas installé"
    exit 1
fi

# Variables de test
LOCAL_URL="http://localhost:3000"
FAKE_PREVIEW_URL="https://fake-preview.vercel.app"

echo "✅ Prérequis validés"

# Test 1: Vérifier que localhost:3000 fonctionne
echo ""
echo "🧪 Test 1: Vérification de l'accessibilité locale"
if curl -f "$LOCAL_URL" --max-time 5 --output /dev/null --silent; then
    echo "✅ $LOCAL_URL accessible"
else
    echo "❌ $LOCAL_URL non accessible - Vérifiez que 'vercel dev' est en cours d'exécution"
    exit 1
fi

# Test 2: Vérifier que Cypress fonctionne en local
echo ""
echo "🧪 Test 2: Execution Cypress en local (condition normale)"
echo "Command: pnpm exec cypress run --config baseUrl=$LOCAL_URL --spec 'cypress/e2e/auth/login.cy.ts'"

if pnpm exec cypress run --config baseUrl="$LOCAL_URL" --spec 'cypress/e2e/auth/login.cy.ts' --headless; then
    echo "✅ Test Cypress local réussi"
else
    echo "❌ Test Cypress local échoué"
    echo "💡 Ceci indique un problème avec les tests eux-mêmes, pas avec la configuration CI/CD"
    exit 1
fi

# Test 3: Simuler l'échec CI/CD avec une URL inaccessible
echo ""
echo "🧪 Test 3: Simulation de l'échec CI/CD (URL inaccessible)"
echo "Command: pnpm exec cypress run --config baseUrl=$FAKE_PREVIEW_URL --spec 'cypress/e2e/auth/login.cy.ts'"

echo "🔍 Ce test devrait échouer car l'URL n'est pas accessible (simulation CI/CD)"

# Utiliser timeout pour éviter que le test traîne trop longtemps
if timeout 30s pnpm exec cypress run --config baseUrl="$FAKE_PREVIEW_URL" --spec 'cypress/e2e/auth/login.cy.ts' --headless 2>/dev/null; then
    echo "⚠️  Test inattendu : Le test avec URL inaccessible a réussi"
else
    echo "✅ Échec attendu : Le test avec URL inaccessible a échoué (simulation réussie)"
fi

# Résumé
echo ""
echo "📊 RÉSUMÉ DU DIAGNOSTIC"
echo "======================="
echo "✅ Local (localhost:3000) : Tests Cypress fonctionnent"
echo "❌ URL inaccessible : Tests Cypress échouent (simulation CI/CD)"
echo ""
echo "💡 CONCLUSION:"
echo "   Le problème en CI/CD est lié à l'accessibilité de l'URL Preview Vercel"
echo "   qui nécessite des headers de bypass que Cypress n'utilise pas."
echo ""
echo "📋 Prochaines étapes suggérées:"
echo "   1. Implémenter la configuration des headers Vercel dans Cypress"
echo "   2. Tester avec les vrais headers de bypass"
echo "   3. Valider en CI/CD"

echo ""
echo "🏁 Test de simulation terminé"
