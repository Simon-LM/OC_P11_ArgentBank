<!-- @format -->

# Lighthouse Testing Suite

Lighthouse testing suite for the ArgentBank application with authentication support.

## Project Structure

```plaintext
lighthouse/
├── auth/              # Authentication data
│   └── auth-cookies.json
├── config/            # Lighthouse configuration
│   ├── lighthouse.config.js
│   └── lighthouse-ci.config.js
├── lib/               # Libraries and utilities
│   ├── lighthouse-analyzer.js
│   ├── lighthouse-auth-v2.js
│   └── lighthouse-regression.js
├── reports/           # Generated reports
│   ├── lighthouse-report.html
│   ├── lighthouse-report.json
│   └── archive/       # Old reports archive
└── scripts/           # Execution scripts
    ├── lighthouse-auth-runner.sh
    ├── lighthouse-quick.sh
    ├── lighthouse-runner.js
    ├── lighthouse-test-suite.js
    └── pre-commit-lighthouse.sh
```

## Main Scripts

### `lighthouse-runner.js`

Main CLI runner with automatic authentication support.

**Usage:**

```bash
node lighthouse/scripts/lighthouse-runner.js
```

### `lighthouse-global-report.js`

#### 🌍 NEW: Differentiated global report script

Automatically generates Lighthouse reports for all pages (Home, SignIn, Profile) on mobile and desktop, then produces a comparative global analysis.

**Features:**

- ✅ Tests automatisés sur 3 pages × 2 devices = 6 rapports JSON
- ✅ Gestion automatique de l'authentification pour la page Profile
- ✅ Horodatage systématique des fichiers pour éviter les conflits
- ✅ Génération automatique de l'analyse HTML et texte après les tests
- ✅ Résumé détaillé des tests réussis/échoués
- ✅ Compatible CI/CD GitHub Actions

**Usage :**

```bash
# Via npm script (recommandé)
pnpm test:global

# Ou directement
node lighthouse/scripts/lighthouse-global-report.js
```

**Sortie attendue :**

```plaintext
📄 home-mobile-2024-03-14_15-30-45.json
📄 home-desktop-2024-03-14_15-30-45.json
📄 signin-mobile-2024-03-14_15-30-45.json
📄 signin-desktop-2024-03-14_15-30-45.json
📄 profile-mobile-2024-03-14_15-30-45.json
📄 profile-desktop-2024-03-14_15-30-45.json
📊 analysis.html (rapport global)
📝 analysis.txt (résumé textuel)
```

### `lighthouse-auth-runner.sh`

Script shell pour tests avec authentification avancée.

**Usage :**

```bash
./lighthouse/scripts/lighthouse-auth-runner.sh
```

### `lighthouse-test-suite.js`

Complete test suite for multiple pages.

**Usage :**

```bash
node lighthouse/scripts/lighthouse-test-suite.js
```

## Configuration

### Configuration principale

Voir `lighthouse/config/lighthouse.config.js` pour la configuration des tests.

### Authentification

Les données d'authentification sont stockées dans `lighthouse/auth/auth-cookies.json`.

## Utilisation rapide

1. Démarrer l'application :

   ```bash
   vercel dev
   ```

2. Exécuter les tests Lighthouse :

   ```bash
   # Test simple
   node lighthouse/scripts/lighthouse-runner.js

   # Test avec authentification
   ./lighthouse/scripts/lighthouse-auth-runner.sh

   # Suite complète
   node lighthouse/scripts/lighthouse-test-suite.js
   ```

## Rapports

Les rapports sont générés dans `lighthouse/reports/` :

- `lighthouse-report.html` : Rapport visuel
- `lighthouse-report.json` : Données JSON pour analyse

## Analyse de régression

Pour surveiller les performances au fil du temps, utilisez l'outil de régression :

```bash
# Générer un rapport JSON pour analyse
pnpm test:ci

# Comparer avec la baseline
pnpm test:regression
```

## Notes de performance

**Différences entre environnements :**

- Développement local : ~55-60% performance
- CI/CD : ~60-70% performance (estimation)
- Production : ~90-95% performance

Ces différences sont normales et dues aux conditions d'exécution :

- Optimisations de production (compression, minification)
- Mise en cache et CDN en production
- Ressources système et réseau variables

**Approche recommandée :** Comparer les performances relatives (détection de régression) plutôt que les scores absolus.

## Développement

Pour modifier la configuration ou ajouter de nouveaux tests, consultez les fichiers dans `lighthouse/lib/` et `lighthouse/config/`.

## Nettoyage

Pour nettoyer les rapports et ne garder que les plus récents :

```bash
pnpm clean:all
```
