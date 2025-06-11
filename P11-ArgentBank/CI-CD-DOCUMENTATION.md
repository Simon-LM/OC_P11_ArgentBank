<!-- @format -->

# 🚀 Documentation CI/CD - ArgentBank

## 📋 Vue d'ensemble

Cette documentation décrit la stratégie de déploiement continu (CI/CD) pour le projet ArgentBank avec GitHub Actions et Vercel, en tenant compte de la configuration Root Directory.

## 🏗️ Architecture CI/CD

### Configuration Vercel actuelle

```yaml
Configuration Vercel:
├── Root Directory: P11-ArgentBank/
├── Build Command: pnpm build
├── Output Directory: dist/
├── Install Command: pnpm install
└── Node.js Version: 18.x
```

### Workflow GitHub Actions proposé

```text
GitHub Actions Workflow
├── 🔍 Code Quality
│   ├── ESLint
│   ├── TypeScript Check
│   └── Format Check (Prettier)
├── 🧪 Tests
│   ├── Tests Unitaires (Vitest)
│   ├── Tests d'Intégration (Vitest)
│   ├── Tests d'Accessibilité (Axe intégré)
│   └── Tests E2E (Cypress) - OBLIGATOIRES
├── 📊 Analyse
│   ├── Coverage Report
│   ├── Bundle Size Analysis
│   └── Security Audit
└── 🚀 Déploiement
    ├── Preview (Pull Requests)
    └── Production (main branch)
```

## 📁 Structure des workflows

```text
.github/
├── workflows/
│   ├── ci.yml                    # Workflow principal CI
│   ├── lighthouse.yml            # Tests de performance (optionnel)
│   ├── security.yml              # Audit de sécurité
│   └── cleanup.yml               # Nettoyage des artifacts
└── ISSUE_TEMPLATE/               # Templates d'issues (optionnel)
```

## 🎯 Stratégie de déploiement

### Branches et environnements

| Branch      | Environnement | Action              | URL                                   |
| ----------- | ------------- | ------------------- | ------------------------------------- |
| `main`      | Production    | Auto-deploy         | https://slm-argentbank.vercel.app     |
| `develop`   | Staging       | Auto-deploy preview | https://slm-argentbank-git-develop... |
| `feature/*` | Preview       | Deploy on PR        | https://slm-argentbank-git-feature... |

### Déclencheurs

**CI s'exécute sur :**

- ✅ Push sur `main`
- ✅ Push sur `develop`
- ✅ Pull Requests vers `main` ou `develop`
- ✅ Manuellement (workflow_dispatch)

**Déploiement automatique :**

- ✅ Production : Push sur `main`
- ✅ Preview : Pull Requests

## 🧪 Stratégie de tests par environnement

### Tests sur Pull Request

```yaml
Tests obligatoires (PR blocking):
├── ✅ Lint (ESLint)
├── ✅ Type Check (TypeScript)
├── ✅ Unit Tests (Vitest)
├── ✅ Integration Tests (Vitest)
├── ✅ Accessibility Tests (Axe intégré)
└── ✅ Build Success
```

### Tests sur main/develop

```yaml
Tests complets:
├── Tous les tests PR +
├── 📊 Coverage Report
├── 🔍 Security Audit
├── 📦 Bundle Analysis
└── 🚀 Deploy Success Check
```

### Tests d'accessibilité et performance (obligatoires)

```yaml
Tests d'accessibilité et performance:
├── 🏃 E2E Tests (Cypress) - Obligatoire
├── ⚡ Lighthouse Performance - Obligatoire
├── ♿ Pa11y Accessibility - Obligatoire (priorité absolue)
└── 🔄 Visual Regression Tests - Optionnel
```

## ⚙️ Configuration détaillée

### Variables d'environnement requises

```bash
# GitHub Secrets nécessaires
VERCEL_TOKEN=              # Token Vercel pour déploiement
VERCEL_ORG_ID=            # ID de l'organisation Vercel
VERCEL_PROJECT_ID=        # ID du projet Vercel

# Variables d'environnement projet
NODE_ENV=production
API_BASE_URL=             # URL de l'API backend
```

### Working Directory

**Important :** Tous les jobs doivent utiliser le bon répertoire de travail :

```yaml
defaults:
  run:
    working-directory: P11-ArgentBank
```

### Cache Strategy

```yaml
Cache Configuration:
├── Node Modules: ~/.pnpm-store
├── TypeScript: P11-ArgentBank/tsconfig.app.tsbuildinfo
├── Vite Build: P11-ArgentBank/node_modules/.vite
└── Coverage: P11-ArgentBank/coverage
```

## 📊 Métriques et reporting

### Badges de statut (README)

```markdown
![CI](https://github.com/user/repo/workflows/CI/badge.svg)
![Coverage](https://img.shields.io/codecov/c/github/user/repo)
![License](https://img.shields.io/github/license/user/repo)
```

### Reports générés

- **Coverage Report** : Couverture de code détaillée
- **Bundle Analysis** : Taille et composition du bundle
- **Test Results** : Résultats détaillés des tests
- **Security Report** : Audit de sécurité des dépendances

## 🚀 Plan d'implémentation progressive

### Phase 1 : CI de base ✅ (À implémenter en premier)

```yaml
Jobs essentiels:
├── 🔍 lint
├── 🔍 typecheck
├── 🧪 test
└── 🏗️ build
```

### Phase 2 : Déploiement automatique

```yaml
Jobs déploiement:
├── 🚀 deploy-preview (PR)
└── 🚀 deploy-production (main)
```

### Phase 3 : Analyse avancée

```yaml
Jobs analyse:
├── 📊 coverage-report
├── 📦 bundle-analysis
└── 🔒 security-audit
```

### Phase 4 : Tests d'accessibilité et performance (obligatoires)

```yaml
Jobs accessibilité et performance:
├── 🏃 e2e-tests (Cypress) - Navigation utilisateur
├── ⚡ lighthouse-tests - Performance et bonnes pratiques
└── ♿ pa11y-tests - Conformité WCAG (priorité absolue)
```

## 🔧 Configuration des outils

### ESLint pour CI

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:ci": "eslint . --ext .ts,.tsx --format json --output-file eslint-report.json"
  }
}
```

### Vitest pour CI

```json
{
  "scripts": {
    "test": "vitest run",
    "test:ci": "vitest run --coverage --reporter=verbose --reporter=json --outputFile=test-results.json"
  }
}
```

### TypeScript pour CI

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:ci": "tsc --noEmit --pretty false"
  }
}
```

## 🐛 Dépannage

### Problèmes courants

1. **Working Directory incorrect**

   - Solution : Vérifier `working-directory: P11-ArgentBank`

2. **Cache invalide**

   - Solution : Versionner les clés de cache

3. **Timeouts de tests**

   - Solution : Augmenter le timeout ou paralléliser

4. **Problèmes de dépendances**
   - Solution : Lock file à jour et cache pnpm

### Debug des workflows

```bash
# Activer les logs de debug GitHub Actions
ACTIONS_STEP_DEBUG=true
ACTIONS_RUNNER_DEBUG=true
```

## 📝 Bonnes pratiques

### Sécurité

- ✅ Utiliser des secrets GitHub pour les tokens
- ✅ Limiter les permissions des workflows
- ✅ Audit régulier des dépendances
- ✅ Pas de données sensibles dans les logs

### Performance

- ✅ Utiliser le cache pour node_modules
- ✅ Paralléliser les jobs indépendants
- ✅ Optimiser la taille des images Docker
- ✅ Limiter la durée des tests

### Maintenance

- ✅ Documenter les workflows
- ✅ Versionner les actions utilisées
- ✅ Monitorer les temps d'exécution
- ✅ Nettoyer les artifacts anciens

## 🎯 Objectifs de performance

### Temps d'exécution cibles

- **Lint + TypeCheck** : < 2 minutes
- **Tests unitaires** : < 5 minutes
- **Build** : < 3 minutes
- **Tests d'accessibilité** : < 4 minutes (Pa11y + Axe intégré)
- **Tests E2E** : < 8 minutes (Cypress)
- **Tests de performance** : < 6 minutes (Lighthouse)
- **Déploiement** : < 2 minutes (en parallèle avec tests)
- **Total CI complet** : < 15 minutes

### Métriques de succès

- **Success Rate** : > 95% (taux de PR qui passent sans intervention)
- **MTTR** (Mean Time To Recovery) : < 30 minutes
- **Feedback Time** : < 10 minutes (temps de retour sur PR)
- **False Positive Rate** : < 5% (tests qui échouent à tort)
- **Accessibilité** : 100% conforme WCAG 2.1 AA (priorité absolue)

---

## 🚀 Prochaines étapes

1. **Créer le workflow CI de base** (Phase 1)
2. **Tester avec une PR simple**
3. **Ajouter le déploiement automatique** (Phase 2)
4. **Itérer et améliorer** progressivement

---

**Dernière mise à jour** : 11 juin 2025
**Mainteneur** : Équipe ArgentBank
