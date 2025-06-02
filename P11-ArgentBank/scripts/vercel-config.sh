#!/bin/bash

# Script de gestion automatique de la configuration Vercel
# Usage: ./vercel-config.sh [dev|prod|clean]

PROJECT_ROOT=$(dirname $(dirname $(realpath "$0")))
VERCEL_PROD_CONFIG="$PROJECT_ROOT/vercel.only-prod.json"
VERCEL_CONFIG="$PROJECT_ROOT/vercel.json"

case "$1" in
  "dev")
    echo "🔧 Configuration pour développement local (vercel dev)"
    if [ -f "$VERCEL_CONFIG" ]; then
      echo "⚠️  Suppression de vercel.json pour éviter les conflits en développement"
      rm "$VERCEL_CONFIG"
    fi
    echo "✅ Prêt pour vercel dev"
    ;;
  
  "prod")
    echo "🚀 Configuration pour production (vercel --prod)"
    if [ -f "$VERCEL_PROD_CONFIG" ]; then
      echo "📋 Copie de vercel.only-prod.json vers vercel.json"
      cp "$VERCEL_PROD_CONFIG" "$VERCEL_CONFIG"
      echo "✅ Prêt pour vercel --prod"
    else
      echo "❌ Erreur: vercel.only-prod.json introuvable"
      exit 1
    fi
    ;;
  
  "clean")
    echo "🧹 Nettoyage des fichiers de configuration"
    if [ -f "$VERCEL_CONFIG" ]; then
      rm "$VERCEL_CONFIG"
      echo "✅ vercel.json supprimé"
    else
      echo "ℹ️  Aucun vercel.json à supprimer"
    fi
    ;;
  
  *)
    echo "Usage: $0 [dev|prod|clean]"
    echo ""
    echo "Commandes disponibles:"
    echo "  dev   - Prépare l'environnement pour vercel dev (supprime vercel.json)"
    echo "  prod  - Prépare l'environnement pour vercel --prod (crée vercel.json)"
    echo "  clean - Supprime vercel.json"
    exit 1
    ;;
esac
