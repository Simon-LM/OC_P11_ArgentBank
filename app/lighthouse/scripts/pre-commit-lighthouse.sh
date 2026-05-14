#!/bin/bash

# Script de pré-commit pour les tests Lighthouse
# Placez ce fichier dans .git/hooks/pre-commit et rendez-le exécutable (chmod +x)

echo "🔍 Exécution des tests Lighthouse avant le commit..."

# Vérification que le serveur est en cours d'exécution
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "❌ Le serveur n'est pas en cours d'exécution sur le port 3000."
  echo "   Démarrez le serveur avec 'pnpm dev' ou 'pnpm preview' et réessayez."
  exit 1
fi

# Exécution du test Lighthouse
cd lighthouse
pnpm test:ci

# Vérification des régressions
REGRESSION_RESULT=$(pnpm test:regression)
REGRESSION_STATUS=$?

if [ $REGRESSION_STATUS -ne 0 ]; then
  echo "⚠️ Des régressions de performance ont été détectées:"
  echo "$REGRESSION_RESULT"
  
  # Demander à l'utilisateur s'il souhaite continuer
  read -p "Voulez-vous continuer avec le commit malgré les régressions? (o/N) " response
  if [[ "$response" != "o" && "$response" != "O" ]]; then
    echo "❌ Commit annulé. Corrigez les problèmes de performance et réessayez."
    exit 1
  fi
  
  echo "⚠️ Commit autorisé malgré les régressions de performance."
fi

echo "✅ Tests Lighthouse terminés."
exit 0
