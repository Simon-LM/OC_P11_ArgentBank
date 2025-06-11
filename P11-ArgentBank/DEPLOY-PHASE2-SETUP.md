# 🚀 Phase 2 : Configuration Déploiement Automatique Vercel

## 📋 Secrets GitHub requis

Pour activer le déploiement automatique, vous devez configurer ces secrets dans votre repository GitHub :

### 1. Obtenir les tokens Vercel

```bash
# Dans votre terminal
vercel login  # Si pas déjà connecté
vercel link   # Lier le projet Vercel (dans P11-ArgentBank/)

# Récupérer les informations nécessaires
vercel env ls --environment=production  # Voir les variables
```

### 2. Secrets à configurer sur GitHub

Allez dans **Settings > Secrets and variables > Actions** de votre repository et ajoutez :

| Secret Name         | Description                     | Où le trouver                                                  |
| ------------------- | ------------------------------- | -------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Token d'authentification Vercel | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`     | ID de votre organisation Vercel | Fichier `.vercel/project.json` (après `vercel link`)           |
| `VERCEL_PROJECT_ID` | ID de votre projet Vercel       | Fichier `.vercel/project.json` (après `vercel link`)           |

### 3. Récupération automatique des IDs

```bash
cd P11-ArgentBank
vercel link --yes  # Crée .vercel/project.json
cat .vercel/project.json  # Affiche orgId et projectId
```

## 🔄 Fonctionnement du déploiement

### **Pull Request** → Déploiement Preview

- ✅ Build automatique
- ✅ Tests CI/CD passent
- ✅ Déploiement sur URL preview Vercel
- ✅ Commentaire automatique avec lien preview

### **Merge vers main** → Déploiement Production

- ✅ Build automatique
- ✅ Tests CI/CD passent
- ✅ Déploiement production sur votre domaine Vercel

## 🛠️ Workflows créés

- **`.github/workflows/ci.yml`** - Tests et validation (Phase 1) ✅
- **`.github/workflows/deploy.yml`** - Déploiement automatique (Phase 2) 🆕

## ⚡ Test du déploiement

Une fois les secrets configurés :

1. **Créer une nouvelle PR** → Déclenche le déploiement preview
2. **Merger la PR** → Déclenche le déploiement production

## 🔧 Troubleshooting

### Erreur "VERCEL_TOKEN invalid"

- Régénérer le token sur [vercel.com/account/tokens](https://vercel.com/account/tokens)
- Vérifier que le token a les permissions "Deploy"

### Erreur "Project not found"

- Vérifier `VERCEL_PROJECT_ID` et `VERCEL_ORG_ID`
- Re-lancer `vercel link` dans P11-ArgentBank/

### Déploiement bloqué

- Vérifier que tous les secrets sont bien configurés
- Regarder les logs GitHub Actions pour plus de détails

## 🎯 Prochaines étapes

Une fois la Phase 2 fonctionnelle :

- **Phase 3** : Analyse avancée (coverage, bundle, security)
- **Phase 4** : Tests accessibilité (Pa11y, Lighthouse, Cypress)
