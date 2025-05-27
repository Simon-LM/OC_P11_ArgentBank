<!-- @format -->

# Documentation des Scripts Lighthouse

## 📁 **Structure et rôles des scripts**

### `/scripts/` - Scripts d'exécution

| Script                     | Rôle                                       | Usage recommandé                   |
| -------------------------- | ------------------------------------------ | ---------------------------------- |
| `lighthouse-test-suite.js` | Suite complète de 6 tests (mobile/desktop) | Tests complets avant déploiement   |
| `lighthouse-runner.js`     | Runner principal avec gestion d'auth       | Tests individuels de pages         |
| `lighthouse-auth-v2.js`    | Test avec authentification automatique     | Tests des pages protégées          |
| `lighthouse-analyzer.js`   | Analyse des rapports JSON générés          | Analyse post-test et comparaisons  |
| `lighthouse-regression.js` | Détection des régressions de performance   | Tests CI/CD et validation continue |

### `/lib/` - Bibliothèques utilitaires

| Fichier                  | Fonction                                | Dépendances |
| ------------------------ | --------------------------------------- | ----------- |
| `analyzer.js`            | Analyse et parsing des rapports         | Aucune      |
| `auth-v2.js`             | Gestion de l'authentification Puppeteer | puppeteer   |
| `regression.js`          | Comparaison avec baseline               | analyzer.js |
| `analyze-performance.js` | Métriques de performance détaillées     | Aucune      |

### `/config/` - Configuration

| Fichier                   | Objectif                               | Modification        |
| ------------------------- | -------------------------------------- | ------------------- |
| `lighthouse.config.js`    | Configuration Lighthouse personnalisée | Rarement            |
| `lighthouse-ci.config.js` | Configuration pour CI/CD               | Selon environnement |

### Scripts utilitaires (racine)

| Script               | Usage                          | Fréquence    |
| -------------------- | ------------------------------ | ------------ |
| `run.sh`             | Lancement rapide des tests     | Quotidienne  |
| `clean.sh`           | Nettoyage des anciens rapports | Hebdomadaire |
| `migrate-reports.sh` | Migration vers archive/        | Mensuelle    |

## 🎯 **Recommandations d'usage**

### Tests quotidiens (développement)

```bash
# Test rapide pendant le développement
./run.sh quick

# Test complet avant commit
pnpm test:suite
```

### Tests de validation (CI/CD)

```bash
# Détection de régressions
pnpm test:regression

# Validation complète
pnpm test:ci
```

### Maintenance périodique

```bash
# Nettoyage hebdomadaire
./clean.sh

# Archivage mensuel
./migrate-reports.sh
```
