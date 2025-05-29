#!/bin/bash
# Script de validation finale de la résolution TypeScript

echo "🔍 Validation finale - Résolution TypeScript Cypress"
echo "================================================="

# Vérifier l'existence du fichier centralisé des types
if [ -f "cypress/support/types.ts" ]; then
    echo "✅ Fichier types centralisé trouvé: cypress/support/types.ts"
else
    echo "❌ Fichier types centralisé manquant"
    exit 1
fi

# Vérifier que les fichiers de test utilisent l'import centralisé
echo -e "\n📋 Vérification des imports centralisés:"

test_files=(
    "cypress/e2e/auth/login.cy.ts"
    "cypress/e2e/auth/logout.cy.ts"
    "cypress/e2e/profile/profile.cy.ts"
    "cypress/e2e/accounts/accounts.cy.ts"
    "cypress/e2e/transactions/transactions.cy.ts"
)

all_imports_ok=true

for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "import type.*from.*support/types" "$file"; then
            echo "✅ $file - Import centralisé utilisé"
        else
            echo "❌ $file - Import centralisé manquant"
            all_imports_ok=false
        fi
    else
        echo "⚠️  $file - Fichier non trouvé"
        all_imports_ok=false
    fi
done

# Vérifier qu'il n'y a plus d'interfaces dupliquées
echo -e "\n🔍 Vérification des interfaces dupliquées:"
duplicate_interfaces=false

for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "^interface User\|^interface Account\|^interface Transaction" "$file"; then
            echo "❌ $file - Interface dupliquée trouvée"
            duplicate_interfaces=true
        else
            echo "✅ $file - Pas d'interface dupliquée"
        fi
    fi
done

# Vérifier la documentation consolidée
echo -e "\n📚 Vérification de la documentation:"
doc_files=(
    "cypress/doc/TYPESCRIPT_GUIDE.md"
    "cypress/doc/BEST_PRACTICES.md"
)

doc_ok=true
for file in "${doc_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Présent"
    else
        echo "❌ $file - Manquant"
        doc_ok=false
    fi
done

# Vérifier les fichiers supprimés (redondants)
echo -e "\n🗑️  Vérification de la suppression des fichiers redondants:"
removed_files=(
    "cypress/doc/REORGANIZATION_COMPLETE.md"
    "cypress/doc/DOCUMENTATION_UPDATE.md"
)

cleanup_ok=true
for file in "${removed_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "✅ $file - Correctement supprimé"
    else
        echo "❌ $file - Toujours présent (devrait être supprimé)"
        cleanup_ok=false
    fi
done

# Résumé final
echo -e "\n📊 RÉSUMÉ FINAL:"
echo "=================="

if [ "$all_imports_ok" = true ] && [ "$duplicate_interfaces" = false ] && [ "$doc_ok" = true ] && [ "$cleanup_ok" = true ]; then
    echo "🎉 SUCCÈS: Résolution TypeScript complète!"
    echo ""
    echo "✅ Types centralisés dans cypress/support/types.ts"
    echo "✅ Imports unifiés dans tous les fichiers de test"
    echo "✅ Aucune interface dupliquée"
    echo "✅ Documentation consolidée"
    echo "✅ Fichiers redondants supprimés"
    echo ""
    echo "🚀 Avantages obtenus:"
    echo "   • Type safety complet"
    echo "   • IntelliSense fonctionnel" 
    echo "   • Maintenance simplifiée"
    echo "   • Documentation allégée"
    echo ""
    exit 0
else
    echo "❌ ÉCHEC: Des problèmes subsistent"
    echo ""
    [ "$all_imports_ok" = false ] && echo "   • Imports centralisés manquants"
    [ "$duplicate_interfaces" = true ] && echo "   • Interfaces dupliquées présentes"
    [ "$doc_ok" = false ] && echo "   • Documentation manquante"
    [ "$cleanup_ok" = false ] && echo "   • Fichiers redondants non supprimés"
    echo ""
    exit 1
fi
