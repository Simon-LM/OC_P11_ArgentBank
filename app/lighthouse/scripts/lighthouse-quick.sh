#!/bin/bash

# 🚀 Script de Test Lighthouse Rapide
# Génère tous les rapports essentiels en une commande

echo "🚀 LIGHTHOUSE QUICK TEST - ARGENTBANK"
echo "====================================="
echo "🕒 Démarrage: $(date)"
echo

# Vérifier les services
echo "🔍 Vérification des services..."
if curl -I http://localhost:4173 --max-time 5 --silent > /dev/null; then
    echo "✅ Serveur de production (4173) : OK"
    PROD_SERVER=true
else
    echo "❌ Serveur de production (4173) : INDISPONIBLE"
    echo "💡 Démarrez le serveur avec: npm run preview"
    PROD_SERVER=false
fi

if curl -I http://localhost:3000 --max-time 5 --silent > /dev/null; then
    echo "✅ Serveur de développement (3000) : OK"
    DEV_SERVER=true
else
    echo "⚠️  Serveur de développement (3000) : INDISPONIBLE"
    DEV_SERVER=false
fi

echo

# Tests de production
if [ "$PROD_SERVER" = true ]; then
    echo "📊 Tests de performance PRODUCTION..."
    echo "-------------------------------------"
    
    echo "🔄 Test Mobile..."
    npm run lighthouse:mobile
    
    echo "🔄 Test Desktop..."  
    npm run lighthouse:desktop
    
    echo "🔄 Export JSON..."
    npm run lighthouse:json
    
    echo "🔄 Test Profil..."
    npm run lighthouse:profile
    
    echo "📈 Génération de l'analyse..."
    npm run lighthouse:analyze
    
    echo "✅ Tests de production terminés"
else
    echo "⚠️  Tests de production ignorés (serveur indisponible)"
fi

echo

# Test de développement (optionnel)
if [ "$DEV_SERVER" = true ]; then
    echo "🛠️  Test DÉVELOPPEMENT (optionnel)..."
    echo "-------------------------------------"
    npm run lighthouse:dev
    echo "✅ Test de développement terminé"
fi

echo
echo "🎉 TESTS TERMINÉS"
echo "=================="
echo "📁 Rapports disponibles dans: ../reports/"
echo "🌐 Tableau de bord: ../reports/index.html"
echo "📊 Analyse détaillée: ../reports/analysis.html"
echo

# Ouvrir les résultats
if command -v xdg-open > /dev/null; then
    echo "🔗 Ouverture du tableau de bord..."
    xdg-open ../reports/index.html
elif command -v open > /dev/null; then
    echo "🔗 Ouverture du tableau de bord..."
    open ../reports/index.html
else
    echo "💡 Ouvrez manuellement: file://$(pwd)/../reports/index.html"
fi
