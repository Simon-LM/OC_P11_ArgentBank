#!/bin/bash

# Script de nettoyage des rapports Cypress
# Usage: ./cypress/clean-reports.sh

REPORTS_DIR="cypress/reports"

echo "🧹 Nettoyage des anciens rapports Cypress..."

# Créer le répertoire reports s'il n'existe pas
mkdir -p "$REPORTS_DIR"
mkdir -p "$REPORTS_DIR/html"

# Supprimer tous les anciens rapports individuels
echo "📁 Suppression des rapports individuels..."
rm -f "$REPORTS_DIR"/mochawesome_*.json
rm -f "$REPORTS_DIR"/mochawesome_*.html

# Garder le rapport consolidé
echo "✅ Conservation du rapport consolidé..."
echo "   - $REPORTS_DIR/merged-report.json"
echo "   - $REPORTS_DIR/html/merged-report.html"

# Supprimer les assets anciens s'ils existent
if [ -d "$REPORTS_DIR/assets" ]; then
    echo "🗑️ Suppression des anciens assets..."
    rm -rf "$REPORTS_DIR/assets"
fi

echo "✨ Nettoyage terminé !"
echo "📊 Prochain rapport : pnpm run test:e2e:a11y:report"
