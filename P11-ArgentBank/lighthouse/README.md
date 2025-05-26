<!-- @format -->

# Lighthouse Testing Suite

Suite de tests Lighthouse pour l'application ArgentBank avec support d'authentification.

## Structure du projet

```plaintext
lighthouse/
├── auth/              # Données d'authentification
│   └── auth-cookies.json
├── config/            # Configuration Lighthouse
│   ├── lighthouse.config.js
│   └── lighthouse-ci.config.js
├── lib/               # Bibliothèques et utilitaires
│   ├── lighthouse-analyzer.js
│   ├── lighthouse-auth-v2.js
│   └── lighthouse-regression.js
├── reports/           # Rapports générés
│   ├── lighthouse-report.html
│   ├── lighthouse-report.json
│   └── archive/       # Archives des anciens rapports
└── scripts/           # Scripts d'exécution
    ├── lighthouse-auth-runner.sh
    ├── lighthouse-quick.sh
    ├── lighthouse-runner.js
    ├── lighthouse-test-suite.js
    └── pre-commit-lighthouse.sh
```

## Scripts principaux

### `lighthouse-runner.js`

Runner principal CLI avec support d'authentification automatique.

**Usage :**

```bash
node lighthouse/scripts/lighthouse-runner.js
```

### `lighthouse-auth-runner.sh`

Script shell pour tests avec authentification avancée.

**Usage :**

```bash
./lighthouse/scripts/lighthouse-auth-runner.sh
```

### `lighthouse-test-suite.js`

Suite de tests complète pour multiple pages.

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
   npm run dev
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
