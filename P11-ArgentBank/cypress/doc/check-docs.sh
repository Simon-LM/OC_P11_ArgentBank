#!/bin/bash

# Script simple de validation de la documentation Cypress
echo "🔍 Validation de la documentation Cypress..."
echo "=============================================="

DOC_DIR="/media/simpnlm329budgie/ef264f95-2d57-4eae-85f9-710bfd4f5fc4/SimonLM329_PUBLIC/GIT/Projet_OC/P11/P11_ArgentBank_Vite-React/P11-ArgentBank/cypress/doc"
CYPRESS_DIR="/media/simpnlm329budgie/ef264f95-2d57-4eae-85f9-710bfd4f5fc4/SimonLM329_PUBLIC/GIT/Projet_OC/P11/P11_ArgentBank_Vite-React/P11-ArgentBank/cypress"

echo "📁 Vérification des fichiers de documentation..."

# Vérifier les fichiers principaux
files=(
    "$DOC_DIR/ACCESSIBILITY_TESTS.md"
    "$DOC_DIR/BEST_PRACTICES.md" 
    "$DOC_DIR/E2E_TESTS.md"
    "$DOC_DIR/INSTALLATION.md"
    "$DOC_DIR/MAINTENANCE.md"
    "$DOC_DIR/IMPLEMENTATION_STATUS.md"
    "$DOC_DIR/DOCUMENTATION_UPDATE.md"
    "$CYPRESS_DIR/README.md"
)

valid=0
total=${#files[@]}

for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $(basename "$file")"
        ((valid++))
    else
        echo "❌ $(basename "$file") - MANQUANT"
    fi
done

echo ""
echo "📊 Résultat: $valid/$total fichiers trouvés"

if [[ $valid -eq $total ]]; then
    echo "🎉 Tous les fichiers de documentation sont présents !"
else
    echo "⚠️  Certains fichiers sont manquants"
fi

echo ""
echo "📂 Structure actuelle du dossier doc/:"
ls -la "$DOC_DIR"

exit 0
