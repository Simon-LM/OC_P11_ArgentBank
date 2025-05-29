#!/bin/bash

# Script de validation des liens de documentation Cypress
# Usage: bash cypress/doc/validate-links.sh

echo "🔍 Validation des liens de documentation Cypress..."
echo "=================================================="

DOC_DIR="cypress/doc"
ERRORS=0

# Fonction pour vérifier un lien
check_link() {
    local file="$1"
    local link="$2"
    local target="$3"
    
    if [[ "$target" == "./"* ]]; then
        # Lien relatif vers le dossier doc
        target_file="${DOC_DIR}/${target#./}"
    elif [[ "$target" == "../"* ]]; then
        # Lien relatif vers le dossier parent (cypress/)
        target_file="cypress/${target#../}"
    else
        # Lien externe ou absolu - on ne valide pas
        return 0
    fi
    
    if [[ ! -f "$target_file" ]]; then
        echo "❌ Lien cassé dans $file: $link -> $target"
        echo "   Fichier non trouvé: $target_file"
        ((ERRORS++))
    else
        echo "✅ $file: $link"
    fi
}

# Rechercher tous les liens Markdown dans les fichiers .md
echo "📋 Fichiers à vérifier:"
for file in "$DOC_DIR"/*.md; do
    if [[ -f "$file" ]]; then
        echo "   - $(basename "$file")"
    fi
done
echo ""

echo "🔗 Vérification des liens..."

# Extraire et vérifier les liens
for file in "$DOC_DIR"/*.md; do
    if [[ -f "$file" ]]; then
        filename=$(basename "$file")
        echo ""
        echo "📄 $filename:"
        
        # Rechercher les liens au format [text](link)
        while IFS= read -r line; do
            if [[ -n "$line" ]]; then
                link_text=$(echo "$line" | sed -n 's/.*\[\([^]]*\)\](\([^)]*\)).*/\1/p')
                link_target=$(echo "$line" | sed -n 's/.*\[\([^]]*\)\](\([^)]*\)).*/\2/p')
                
                if [[ -n "$link_target" && "$link_target" == *".md"* ]]; then
                    check_link "$filename" "$link_text" "$link_target"
                fi
            fi
        done < <(grep -o '\[[^]]*\]([^)]*.md[^)]*)' "$file" || true)
    fi
done

echo ""
echo "=================================================="
if [[ $ERRORS -eq 0 ]]; then
    echo "✅ Tous les liens de documentation sont valides!"
    echo "📚 Documentation prête pour utilisation."
else
    echo "❌ $ERRORS lien(s) cassé(s) détecté(s)."
    echo "🔧 Veuillez corriger les liens avant de continuer."
    exit 1
fi

echo ""
echo "📊 Résumé de la documentation:"
echo "   - $(ls "$DOC_DIR"/*.md | wc -l) fichiers de documentation"
echo "   - Structure complète des tests E2E + Accessibilité"
echo "   - Navigation inter-documents validée"
echo ""
echo "🎯 Prochaines étapes:"
echo "   1. Lire ACCESSIBILITY_TESTS.md pour guide technique"
echo "   2. Consulter E2E_TESTS.md pour patterns d'intégration" 
echo "   3. Suivre BEST_PRACTICES.md pour standards qualité"
