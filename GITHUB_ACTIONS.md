<!-- @format -->

# 🚀 GitHub Actions - ArgentBank

## 📍 Accès Rapide

- **🔗 Workflows**: [GitHub Actions](https://github.com/votre-username/P11_ArgentBank_Vite-React/actions)
- **📊 Pipeline Status**: [CI/CD Pipeline](https://github.com/votre-username/P11_ArgentBank_Vite-React/actions/workflows/ci-cd.yml)
- **📧 Test Email**: [Email Test](https://github.com/votre-username/P11_ArgentBank_Vite-React/actions/workflows/test-email.yml)

## 📋 Workflows Disponibles

### 🏗️ CI/CD Pipeline (`ci-cd.yml`)

- **Déclencheurs**: Push sur `main`/`develop`, PR vers `main`
- **Fonctionnalités**:
  - Build et validation production
  - Tests unitaires (Vitest)
  - Tests E2E (Cypress + Axe)
  - Tests accessibilité (Pa11y)
  - Audits Lighthouse
  - Notifications email ProtonMail

### 📧 Test Email (`test-email.yml`)

- **Déclencheur**: Manuel uniquement
- **Usage**: Tester la configuration SMTP ProtonMail

## 🔧 Configuration Requise

```bash
# GitHub Secrets
SMTP_USERNAME=<votre-username-protonmail>
SMTP_PASSWORD=<votre-smtp-token-protonmail>
```

## 📚 Documentation Complète

Voir [CICD_PIPELINE.md](./CICD_PIPELINE.md) pour la documentation complète.
