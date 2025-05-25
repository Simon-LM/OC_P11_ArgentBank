#!/bin/bash

# Script Lighthouse simplifié et fonctionnel
# Compatible avec Lighthouse 11.7.1 et Node.js 18

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
LIGHTHOUSE_VERSION="11.7.1"
BASE_URL="http://localhost:4173"  # Version de production par défaut
OUTPUT_DIR="./reports"

# Fonction d'aide
show_help() {
    echo "Script Lighthouse pour ArgentBank"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commandes:"
    echo "  mobile       Test mobile de la page d'accueil"
    echo "  desktop      Test desktop de la page d'accueil"
    echo "  profile      Test mobile de la page profil"
    echo "  dev          Test sur le serveur de développement (port 3000)"
    echo "  all          Lance tous les tests"
    echo "  help         Affiche cette aide"
    echo ""
    echo "Options:"
    echo "  --url URL    URL personnalisée à tester"
    echo "  --dev        Utilise le serveur de dev (port 3000)"
    echo ""
    echo "Exemples:"
    echo "  $0 mobile"
    echo "  $0 desktop --dev"
    echo "  $0 profile --url http://localhost:3000/profile"
}

# Vérification du serveur
check_server() {
    local url=$1
    echo -e "${YELLOW}🔍 Vérification du serveur $url...${NC}"
    
    if ! curl -s --max-time 5 "$url" > /dev/null; then
        echo -e "${RED}❌ Erreur: Le serveur $url n'est pas accessible${NC}"
        if [[ "$url" == *":4173"* ]]; then
            echo -e "${YELLOW}💡 Lancez 'pnpm build && pnpm preview' pour le serveur de production${NC}"
        else
            echo -e "${YELLOW}💡 Lancez 'pnpm dev' pour le serveur de développement${NC}"
        fi
        exit 1
    fi
    echo -e "${GREEN}✅ Serveur accessible${NC}"
}

# Fonction de test Lighthouse
run_lighthouse() {
    local url=$1
    local output_file=$2
    local form_factor=${3:-mobile}
    local categories=${4:-performance,accessibility,best-practices,seo}
    
    echo -e "${BLUE}🚀 Test Lighthouse $form_factor...${NC}"
    echo -e "${BLUE}📱 URL: $url${NC}"
    echo -e "${BLUE}📄 Rapport: $output_file${NC}"
    
    # Créer le dossier de sortie
    mkdir -p "$(dirname "$output_file")"
    
    # Lancer Lighthouse
    if npx lighthouse@$LIGHTHOUSE_VERSION "$url" \
        --output=html \
        --output-path="$output_file" \
        --form-factor="$form_factor" \
        --only-categories="$categories" \
        --preset=perf \
        --quiet \
        --chrome-flags="--no-sandbox --disable-dev-shm-usage"; then
        
        echo -e "${GREEN}✅ Test terminé avec succès !${NC}"
        echo -e "${GREEN}📁 Rapport: $(realpath "$output_file")${NC}"
        return 0
    else
        echo -e "${RED}❌ Erreur lors du test Lighthouse${NC}"
        return 1
    fi
}

# Parse des arguments
COMMAND=""
CUSTOM_URL=""
USE_DEV=false

while [[ $# -gt 0 ]]; do
    case $1 in
        mobile|desktop|profile|dev|all|help)
            COMMAND="$1"
            shift
            ;;
        --url)
            CUSTOM_URL="$2"
            shift 2
            ;;
        --dev)
            USE_DEV=true
            shift
            ;;
        *)
            echo "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Définir l'URL de base
if [[ "$USE_DEV" == true ]]; then
    BASE_URL="http://localhost:3000"
fi

# Exécuter la commande
case $COMMAND in
    mobile)
        URL=${CUSTOM_URL:-$BASE_URL}
        check_server "$URL"
        run_lighthouse "$URL" "$OUTPUT_DIR/home-mobile.html" "mobile"
        ;;
    desktop)
        URL=${CUSTOM_URL:-$BASE_URL}
        check_server "$URL"
        run_lighthouse "$URL" "$OUTPUT_DIR/home-desktop.html" "desktop"
        ;;
    profile)
        URL=${CUSTOM_URL:-$BASE_URL/profile}
        check_server "$BASE_URL"  # Vérifier la base d'abord
        run_lighthouse "$URL" "$OUTPUT_DIR/profile-mobile.html" "mobile"
        ;;
    dev)
        URL=${CUSTOM_URL:-http://localhost:3000}
        check_server "$URL"
        run_lighthouse "$URL" "$OUTPUT_DIR/dev-mobile.html" "mobile" "performance"
        ;;
    all)
        echo -e "${BLUE}🧪 Suite complète de tests Lighthouse${NC}"
        check_server "$BASE_URL"
        
        echo -e "\n${YELLOW}Test 1/4: Page d'accueil - Mobile${NC}"
        run_lighthouse "$BASE_URL" "$OUTPUT_DIR/home-mobile.html" "mobile"
        
        echo -e "\n${YELLOW}Test 2/4: Page d'accueil - Desktop${NC}"
        run_lighthouse "$BASE_URL" "$OUTPUT_DIR/home-desktop.html" "desktop"
        
        echo -e "\n${YELLOW}Test 3/4: Page de connexion - Mobile${NC}"
        run_lighthouse "$BASE_URL/sign-in" "$OUTPUT_DIR/signin-mobile.html" "mobile"
        
        echo -e "\n${YELLOW}Test 4/4: Page profil - Mobile${NC}"
        run_lighthouse "$BASE_URL/profile" "$OUTPUT_DIR/profile-mobile.html" "mobile"
        
        # Créer un index
        create_index
        ;;
    help|"")
        show_help
        ;;
    *)
        echo "Commande inconnue: $COMMAND"
        show_help
        exit 1
        ;;
esac

# Fonction pour créer un index des rapports
create_index() {
    local index_file="$OUTPUT_DIR/index.html"
    echo -e "${YELLOW}📄 Création de l'index des rapports...${NC}"
    
    cat > "$index_file" << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapports Lighthouse - ArgentBank</title>
    <style>
        body { font-family: system-ui; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .reports { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .report { border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
        .report h3 { margin-top: 0; }
        .report a { display: inline-block; background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
        .report a:hover { background: #0052a3; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Rapports Lighthouse - ArgentBank</h1>
        <p>Rapports générés le $(date '+%d/%m/%Y à %H:%M')</p>
    </div>
    <div class="reports">
EOF

    # Ajouter les rapports existants
    for report in "$OUTPUT_DIR"/*.html; do
        if [[ -f "$report" && "$(basename "$report")" != "index.html" ]]; then
            local filename=$(basename "$report")
            local title=$(echo "$filename" | sed 's/-/ /g' | sed 's/.html//' | sed 's/\b\w/\U&/g')
            
            cat >> "$index_file" << EOF
        <div class="report">
            <h3>$title</h3>
            <p>Fichier: $filename</p>
            <a href="$filename">📄 Voir le rapport</a>
        </div>
EOF
        fi
    done
    
    cat >> "$index_file" << 'EOF'
    </div>
    <div style="margin-top: 40px; text-align: center;">
        <p>🔄 Pour relancer les tests: <code>./lighthouse.sh all</code></p>
    </div>
</body>
</html>
EOF

    echo -e "${GREEN}✅ Index créé: $(realpath "$index_file")${NC}"
}

echo -e "\n${GREEN}🎉 Terminé !${NC}"
