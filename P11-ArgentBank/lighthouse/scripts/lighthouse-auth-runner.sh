#!/usr/bin/env bash

# Lighthouse avec authentification pour ArgentBank
# Ce script automatise les tests Lighthouse sur les pages protégées

# Définir les couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# URL de base
BASE_URL="http://localhost:3000"

# Dossier pour les rapports
REPORTS_DIR="../reports"

# Fonction pour générer un timestamp
function generate_timestamp {
  date +"%Y-%m-%d_%H-%M-%S"
}

# Message d'aide
function show_help {
  echo -e "${BLUE}Lighthouse avec authentification pour ArgentBank${NC}"
  echo ""
  echo -e "Usage: ${YELLOW}./lighthouse-auth-runner.sh [option] [page]${NC}"
  echo ""
  echo "Options:"
  echo -e "  ${GREEN}-h, --help${NC}        Affiche cette aide"
  echo -e "  ${GREEN}-m, --mobile${NC}      Lance les tests en mode mobile (défaut)"
  echo -e "  ${GREEN}-d, --desktop${NC}     Lance les tests en mode desktop"
  echo -e "  ${GREEN}-a, --auth-only${NC}   Génère uniquement les données d'authentification"
  echo -e "  ${GREEN}-i, --inject${NC}      Injecte les données d'authentification et laisse le navigateur ouvert"
  echo ""
  echo "Pages disponibles:"
  echo -e "  ${CYAN}home${NC}       Page d'accueil"
  echo -e "  ${CYAN}signIn${NC}     Page de connexion"
  echo -e "  ${CYAN}user${NC}       Profil utilisateur (nécessite authentification)"
  echo ""
  echo "Exemples:"
  echo -e "  ${YELLOW}./lighthouse-auth-runner.sh${NC}               # Lance un test mobile sur la page d'accueil"
  echo -e "  ${YELLOW}./lighthouse-auth-runner.sh -d user${NC}       # Lance un test desktop sur la page utilisateur"
  echo -e "  ${YELLOW}./lighthouse-auth-runner.sh --auth-only${NC}   # Génère uniquement les données d'authentification"
  echo -e "  ${YELLOW}./lighthouse-auth-runner.sh --inject user${NC} # Injecte les données d'auth et ouvre un navigateur"
}

# Générer uniquement les données d'authentification
function auth_only {
  echo -e "${BLUE}Génération des données d'authentification...${NC}"
  cd "$(dirname "$0")/.." && node lib/lighthouse-auth-v2.js
}

# Fonction pour injecter les données d'authentification
function inject_auth {
  local page=$1
  echo -e "${BLUE}Injection des données d'authentification pour la page ${CYAN}${page}${NC}..."
  cd "$(dirname "$0")/.." && node lib/lighthouse-storage-injector.js "${BASE_URL}/${page}"
}

# Fonction pour exécuter Lighthouse
function run_lighthouse {
  local page=$1
  local device=$2
  
  local url="${BASE_URL}"
  if [ "$page" != "home" ]; then
    url="${url}/${page}"
  fi
  
  local device_flag=""
  if [ "$device" == "desktop" ]; then
    device_flag="--desktop"
  fi
  
  local output_file="${REPORTS_DIR}/${page}-${device}-$(generate_timestamp).html"
  
  echo -e "${BLUE}Exécution de Lighthouse pour ${CYAN}${url}${NC} en mode ${CYAN}${device}${NC}..."
  
  # Vérifier si c'est une page protégée
  if [ "$page" == "user" ]; then
    echo -e "${YELLOW}Page protégée détectée - authentification nécessaire${NC}"
    
    # 1. Générer les données d'authentification si elles n'existent pas
    if [ ! -f "../auth/auth-cookies.json" ]; then
      echo -e "${YELLOW}Données d'authentification non trouvées - génération...${NC}"
      auth_only
    fi
    
    # 2. Demander à l'utilisateur comment procéder
    echo ""
    echo -e "${MAGENTA}Comment souhaitez-vous procéder pour l'authentification ?${NC}"
    echo -e "  ${CYAN}1${NC}) Utiliser le script d'injection (recommandé)"
    echo -e "  ${CYAN}2${NC}) Laisser Lighthouse essayer d'utiliser les cookies (peut ne pas fonctionner)"
    echo ""
    read -p "Votre choix (1/2): " auth_choice
    
    if [ "$auth_choice" == "1" ]; then
      inject_auth "$page"
      echo -e "${GREEN}Vous pouvez maintenant lancer Lighthouse manuellement dans ce navigateur.${NC}"
      echo -e "Une fois terminé, appuyez sur Entrée dans le terminal où tourne le script d'injection."
      return
    fi
  fi
  
  # Exécuter Lighthouse normalement
  cd "$(dirname "$0")/.." && node scripts/lighthouse-runner.js --url "$url" $device_flag --output-path "$output_file"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Rapport généré avec succès: ${CYAN}${output_file}${NC}"
  else
    echo -e "${RED}Erreur lors de la génération du rapport${NC}"
  fi
}

# Paramètres par défaut
DEVICE="mobile"
PAGE="home"
ACTION="run"

# Analyser les arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -h|--help) show_help; exit 0 ;;
    -m|--mobile) DEVICE="mobile" ;;
    -d|--desktop) DEVICE="desktop" ;;
    -a|--auth-only) ACTION="auth_only" ;;
    -i|--inject) ACTION="inject" ;;
    home|signIn|user) PAGE="$1" ;;
    *) echo -e "${RED}Option inconnue: $1${NC}"; show_help; exit 1 ;;
  esac
  shift
done

# Créer le dossier de rapports s'il n'existe pas
mkdir -p "$REPORTS_DIR"

# Exécuter l'action demandée
case $ACTION in
  "auth_only") auth_only ;;
  "inject") inject_auth "$PAGE" ;;
  "run") run_lighthouse "$PAGE" "$DEVICE" ;;
esac
