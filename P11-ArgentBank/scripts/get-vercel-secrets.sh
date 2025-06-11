#!/bin/bash
# @format

# Script pour récupérer les informations Vercel nécessaires aux secrets GitHub

echo "🔍 Récupération des informations Vercel pour GitHub Actions..."
echo ""

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis P11-ArgentBank/"
    exit 1
fi

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé. Installation..."
    npm i -g vercel
fi

echo "🔗 Liaison du projet Vercel..."
vercel link --yes

# Vérifier si .vercel/project.json existe
if [ ! -f ".vercel/project.json" ]; then
    echo "❌ Erreur: .vercel/project.json non trouvé. Assurez-vous que 'vercel link' a réussi."
    exit 1
fi

echo ""
echo "✅ Informations récupérées !"
echo ""
echo "📋 Secrets à configurer sur GitHub :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Extraire les informations du fichier project.json
ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)
PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)

echo "🔑 VERCEL_ORG_ID:"
echo "   $ORG_ID"
echo ""
echo "🔑 VERCEL_PROJECT_ID:" 
echo "   $PROJECT_ID"
echo ""
echo "🔑 VERCEL_TOKEN:"
echo "   À générer sur : https://vercel.com/account/tokens"
echo "   (Créer un nouveau token avec permissions Deploy)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Étapes suivantes :"
echo "1. Aller sur GitHub : Settings > Secrets and variables > Actions"
echo "2. Ajouter les 3 secrets ci-dessus"
echo "3. Créer une Pull Request pour tester le déploiement preview"
echo ""
echo "🎯 Fichier de configuration sauvegardé dans .vercel/"
