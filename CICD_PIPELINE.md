<!-- @format -->

# 🚀 CI/CD Pipeline - ArgentBank

## 📋 Vue d'ensemble

Pipeline GitHub Actions complet avec validation de build, tests d'accessibilité, et notifications email via ProtonMail SMTP.

## 🏗️ Architecture du Pipeline

### 📦 Build & Validation

- **Build de production** avec Vite
- **Détection de pages blanches** automatique
- **Upload d'artifacts** pour debug
- **Cache pnpm** optimisé

### 🧪 Tests Parallèles

- **Tests unitaires** (Vitest)
- **Tests E2E** (Cypress + Axe)
- **Tests d'accessibilité** (Pa11y 100% requis)
- **Audits Lighthouse** (100% accessibilité requis)

### 📧 Notifications Email

- **ProtonMail SMTP** intégration
- **Alertes d'échec** automatiques
- **Notifications de succès**
- **Rapports détaillés** avec liens GitHub

## ⚙️ Configuration

### GitHub Secrets Requis

```bash
SMTP_USERNAME=<votre-username-protonmail>
SMTP_PASSWORD=<votre-smtp-token-protonmail>
```

### Configuration ProtonMail SMTP

- **Serveur**: `mail.protonmail.ch:587`
- **Sécurité**: TLS
- **Email destination**: `alerts@lostintab.com`

## 🚦 Déclencheurs

### Push/PR

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
```

### Manuel (Test Email)

```yaml
workflow_dispatch: # Via GitHub Actions UI
```

## 📊 Jobs du Pipeline

### 1. 🔨 Build & Validate

- Installation des dépendances pnpm
- Build de production
- Validation anti-pages blanches
- Upload des artifacts

### 2. 🧪 Unit Tests (Vitest)

- Tests unitaires complets
- Coverage reporting
- Parallel avec autres tests

### 3. 🌐 E2E & Accessibility Tests

- **Vercel Dev Server** : `vercel dev --yes` (Option 1 - no auth)
- **Cypress E2E** avec focus auth/login  
- **Cypress-Axe** intégration accessibilité
- **Pa11y** tests (100% score requis)
- **Lighthouse** audits (100% accessibilité)

### 4. 📧 Notifications

- Email d'échec avec détails complets
- Email de succès avec résumé
- Continue même en cas d'erreur SMTP

## 🎯 Points Critiques

### Route Prioritaire

- **Authentication/Login** - Route critique surveillée
- Tests E2E dédiés à l'authentification
- Validation de l'accessibilité sur parcours complet

### Validation Build

```bash
# Vérifications automatiques:
- dist/ directory exists
- index.html non-vide
- Root div présent
- Assets générés
```

### Scores Requis

- **Pa11y**: 100% (aucune erreur tolérée)
- **Lighthouse Accessibilité**: 100%
- **Cypress-Axe**: Toutes règles passées

## 📁 Artifacts

### Build Artifacts

- **production-build**: Dist complet (30j rétention)

### Test Reports

- **test-reports**: Rapports Cypress, Pa11y, Lighthouse (30j)

## 🔧 Maintenance

### Mise à jour des Secrets

1. ProtonMail → Paramètres → Sécurité → Tokens SMTP
2. GitHub Repository → Settings → Secrets
3. Test via workflow `test-email.yml`

### Monitoring des Performances

- Surveillance des temps de build
- Optimisation cache pnpm
- Parallélisation des tests

## 📈 Métriques

### Temps d'Exécution Cibles

- **Build**: < 3 minutes
- **Tests Unitaires**: < 2 minutes
- **Tests E2E**: < 5 minutes
- **Total Pipeline**: < 8 minutes

### Taux de Succès

- **Objectif**: > 95% de succès
- **Monitoring**: Email alerts actifs
- **Optimisation**: Continue selon feedback

## 🔗 Liens Utiles

- [ProtonMail SMTP Setup](https://protonmail.com/support/smtp-submission/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Pa11y Documentation](https://github.com/pa11y/pa11y)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## 🚨 Troubleshooting

### Pipeline Échec

1. Vérifier logs GitHub Actions
2. Télécharger artifacts pour debug
3. Tester localement: `pnpm run build && pnpm run test:unit`

### Email Non-Reçu

1. Vérifier secrets GitHub
2. Contrôler logs SMTP dans Actions
3. Tester workflow `test-email.yml` manuellement

### Tests Accessibilité Échec

1. Pa11y: Vérifier screenshots dans artifacts
2. Lighthouse: Consulter rapports détaillés
3. Cypress-Axe: Analyser logs de violations

---

**🎯 Pipeline prêt pour la production avec monitoring complet et notifications proactives !**
