#!/bin/bash

# Lighthouse Test Suite - Point d'entrée principal
# Usage: ./lighthouse/run.sh [test-type]

set -e

LIGHTHOUSE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$LIGHTHOUSE_DIR")"

echo "🏮 ArgentBank Lighthouse Test Suite"
echo "=================================="

# Fonction d'aide
show_help() {
    echo "Usage: ./lighthouse/run.sh [OPTIONS] [TEST_TYPE]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -v, --verbose  Mode verbeux"
    echo ""
    echo "Types de tests disponibles:"
    echo "  basic          Test Lighthouse basique (défaut)"
    echo "  auth           Test avec authentification"
    echo "  suite          Suite complète de tests"
    echo "  quick          Test rapide"
    echo ""
    echo "Exemples:"
    echo "  ./lighthouse/run.sh                 # Test basique"
    echo "  ./lighthouse/run.sh auth           # Test avec auth"
    echo "  ./lighthouse/run.sh suite          # Suite complète"
    echo ""
}

# Parsing des arguments
VERBOSE=false
TEST_TYPE="basic"

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        basic|auth|suite|quick)
            TEST_TYPE="$1"
            shift
            ;;
        *)
            echo "❌ Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Vérification que l'application est démarrée
echo "🔍 Vérification que l'application est démarrée..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ L'application n'est pas démarrée sur http://localhost:3000"
    echo "💡 Veuillez d'abord exécuter: npm run dev"
    exit 1
fi

echo "✅ Application détectée sur http://localhost:3000"

# Exécution du test selon le type
case $TEST_TYPE in
    basic)
        echo "🚀 Exécution du test Lighthouse basique..."
        cd "$PROJECT_ROOT"
        node "$LIGHTHOUSE_DIR/scripts/lighthouse-runner.js"
        ;;
    auth)
        echo "🔐 Exécution du test Lighthouse avec authentification..."
        cd "$PROJECT_ROOT"
        "$LIGHTHOUSE_DIR/scripts/lighthouse-auth-runner.sh"
        ;;
    suite)
        echo "📦 Exécution de la suite complète de tests..."
        cd "$PROJECT_ROOT"
        node "$LIGHTHOUSE_DIR/scripts/lighthouse-test-suite.js"
        ;;
    quick)
        echo "⚡ Exécution du test rapide..."
        cd "$PROJECT_ROOT"
        "$LIGHTHOUSE_DIR/scripts/lighthouse-quick.sh"
        ;;
esac

echo ""
echo "✅ Tests terminés ! Rapports disponibles dans lighthouse/reports/"
echo "📊 Ouvrez lighthouse/reports/lighthouse-report.html pour voir les résultats"
echo "📁 Les anciens rapports sont conservés dans lighthouse/reports/archive/"
