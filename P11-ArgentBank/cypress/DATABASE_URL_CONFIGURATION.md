<!-- @format -->

# 🔧 Configuration DATABASE_URL pour Vercel Preview CI/CD

## 🎯 Problème identifié et résolu

**CAUSE** : Les tests Cypress fonctionnent en local car ils utilisent la vraie base de données VPS, mais échouent en CI/CD car Vercel Preview utilise une fausse DATABASE_URL.

**SOLUTION** : Configurer DATABASE_URL dans les secrets GitHub pour que Vercel Preview utilise la vraie base de données.

## ✅ Modifications apportées au CI/CD

### 1. Déploiement Vercel avec vraie DATABASE_URL

```yaml
- name: 🚀 Deploy to Vercel Preview
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: |
    PREVIEW_URL=$(vercel --yes --token $VERCEL_TOKEN --env DATABASE_URL="$DATABASE_URL")
```

### 2. Génération Prisma avec vraie DATABASE_URL

```yaml
- name: 🗃️ Generate Prisma Client
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: |
    echo "🔧 Using real DATABASE_URL for Cypress tests (VPS connection)"
    pnpm exec prisma generate
```

## 🔐 Configuration GitHub Secrets requise

Il faut ajouter le secret `DATABASE_URL` dans GitHub :

### Étapes à suivre

1. **Aller dans GitHub** : `Settings` > `Secrets and variables` > `Actions`

2. **Ajouter un nouveau secret** :

   - **Name** : `DATABASE_URL`
   - **Value** : `postgresql://argentbank_user:azRyPtf0A&w^RZkfJy@51.38.236.82:5432/argentbank?schema=public`

3. **Sauvegarder** le secret

## 🎯 Résultat attendu

Après configuration du secret :

### ✅ Comportement unifié

- **Local** : `http://localhost:3000/api` → VPS Database
- **CI/CD** : `https://[preview].vercel.app/api` → **MÊME VPS Database**

### ✅ Tests Cypress

- **Utilisateur** : `tony@stark.com` / `password123` (existe sur VPS)
- **Authentification** : ✅ Fonctionne
- **Tests avancés** : ✅ Fonctionnent (profil, transactions, etc.)

## 🧪 Validation

Une fois le secret configuré, tous les tests Cypress devraient passer en CI/CD car :

1. Vercel Preview aura accès à la vraie base de données
2. L'utilisateur `tony@stark.com` existera
3. Les données de test seront disponibles

## 📋 Statut

- ✅ **Headers Vercel bypass** : Configurés (fonctionnent)
- ⏳ **DATABASE_URL secret** : À configurer dans GitHub
- ⏳ **Tests complets** : Fonctionneront après configuration

Date : 22 juin 2025
