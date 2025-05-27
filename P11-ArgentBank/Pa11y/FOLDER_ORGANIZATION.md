<!-- @format -->

# Pa11y Folder Organization

## Structure des dossiers

```text
Pa11y/
├── scripts/
│   ├── run-pa11y-tests.js          # Script principal de test Pa11y
│   └── pa11y-auth.js               # Script d'authentification
├── config/
│   ├── pa11y-ci.config.cjs         # Configuration Pa11y CI
│   └── pa11y-ci.json               # Configuration JSON Pa11y CI
├── screenshots/
│   ├── debug/                      # Captures de débogage
│   ├── errors/                     # Captures d'erreurs
│   └── success/                    # Captures de succès
├── README.md                       # Documentation principale
└── FOLDER_ORGANIZATION.md          # Ce fichier
```

## Types de captures d'écran

### Debug (`screenshots/debug/`)

- `debug_before_button_search.png` - Capture avant la recherche du bouton de connexion
- `debug_before_submit_click.png` - Capture avant le clic sur le bouton de soumission
- `debug_signIn_page_before_wait.png` - Capture de la page de connexion avant attente

### Errors (`screenshots/errors/`)

- `error_in_auth_script.png` - Erreurs génériques dans le script d'authentification
- `error_test_http___localhost_3000_.png` - Erreurs sur la page d'accueil
- `error_test_http___localhost_3000_signIn.png` - Erreurs sur la page de connexion
- `error_test_http___localhost_3000_user.png` - Erreurs sur la page utilisateur
- `error_after_login_wrong_page.png` - Erreur de navigation après connexion
- `error_auth_user_page_content_verification_failed.png` - Erreur de vérification du contenu

### Success (`screenshots/success/`)

- `screenshot_user_page_after_auth.png` - Capture de succès de la page utilisateur après authentification
- `pa11y_user_page_after_auth.png` - Capture Pa11y de la page utilisateur authentifiée

## Configuration des chemins

Les scripts `run-pa11y-tests.js` et `pa11y-auth.js` utilisent `path.join(__dirname, ...)` pour construire les chemins vers les captures d'écran. Par exemple :

- Dans `run-pa11y-tests.js`:
  - `errorScreenshotPath` pointe vers `screenshots/errors/error_test_SCENARIO_URL.png`
- Dans `pa11y-auth.js`:
  - `screenshotBeforeButtonSearchPath` pointe vers `screenshots/debug/debug_before_button_search.png`

Assurez-vous que la structure de vos dossiers `screenshots/debug/` et `screenshots/errors/` correspond à ces chemins.

## Tests disponibles

1. **Page d'accueil** (`/`) - Sans authentification
2. **Page de connexion** (`/signIn`) - Sans authentification
3. **Page utilisateur** (`/user`) - Avec authentification requise

## Exécution des tests

```bash
# Depuis le dossier Pa11y
node run-pa11y-tests.js

# Ou depuis la racine du projet
node Pa11y/run-pa11y-tests.js
```

## Prochaines étapes

1. Intégration avec Cypress pour des tests E2E complets
2. Configuration CI/CD pour l'exécution automatique
3. Rapports HTML détaillés avec captures d'écran intégrées

---

**Date de création :** 26 mai 2025  
**Dernière mise à jour :** 26 mai 2025
