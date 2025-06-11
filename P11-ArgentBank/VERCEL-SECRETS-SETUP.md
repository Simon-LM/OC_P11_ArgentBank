<!-- @format -->

# 🔐 Configuration des secrets Vercel pour GitHub Actions

## ✅ État actuel des secrets

**Secrets déjà configurés :**

- ✅ `VERCEL_TOKEN` - Configuré (2 semaines)
- ✅ `SMTP_USERNAME` - Configuré (2 semaines)
- ✅ `SMTP_PASSWORD` - Configuré (2 semaines)

**Secrets manquants pour Phase 2 :**

- ❌ `VERCEL_PROJECT_ID`
- ❌ `VERCEL_ORG_ID`

## 📝 Action requise

### Ajouter sur GitHub : Settings → Secrets and variables → Actions → New repository secret

#### 1. VERCEL_PROJECT_ID

```
Name: VERCEL_PROJECT_ID
Value: prj_4kEXVWjzQPnryLSBh8ESrUyAiLTC
```

#### 2. VERCEL_ORG_ID

```
Name: VERCEL_ORG_ID
Value: team_GxFkKw0gw04KLOSezINs1eQB
```

## 🚀 Après configuration

Une fois ces 2 secrets ajoutés :

- ✅ Le workflow `deploy.yml` fonctionnera
- ✅ Déploiement automatique Preview sur les PR
- ✅ Déploiement automatique Production sur main

## 📊 Workflow actuel

1. **✅ CI** (ci.yml) - Fonctionne parfaitement
2. **⏳ Deploy** (deploy.yml) - En attente des secrets
3. **🗑️ Debug** (debug.yml) - Supprimé (temporaire)

---

_IDs récupérés depuis `.vercel/project.json` le 11 juin 2025_
