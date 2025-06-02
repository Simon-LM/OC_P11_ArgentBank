<!-- @format -->

# 📋 Résumé - Workflow Vercel Automatisé

## ✅ Configuration terminée

Votre système d'automatisation Vercel est maintenant entièrement opérationnel avec gestion Git intégrée !

## 🔄 Workflow quotidien

### **Développement local**

```bash
pnpm vercel:dev
# ➜ Supprime vercel.json et lance vercel dev
```

### **Avant de committer - 3 options selon le contexte**

```bash
# ⚡⚡⚡ Option 1: Restauration simple (2 sec)
pnpm vercel:commit       # Juste restaure vercel.json

# ⚡⚡ Option 2: Préparation quotidienne (15-20 sec) - RECOMMANDÉE
pnpm commit-ready        # Restaure + nettoie + aperçu Git
git add .
git commit -m "feat: ma nouvelle fonctionnalité"

# ⚡ Option 3: Commit important (30-45 sec)
pnpm pre-commit          # Restaure + nettoie + lint + formatage
git add .
git commit -m "feat: fonctionnalité majeure"
```

### **Après le commit (retour en dev)**

```bash
pnpm vercel:dev
# ➜ Re-supprime vercel.json pour continuer le développement
```

### **Déploiement production**

```bash
pnpm vercel:prod
# ➜ Garantit vercel.json et lance vercel --prod
```

## 📁 État des fichiers

### **Dans Git (repository)**

- ✅ `vercel.json` - **Committé** (pour Vercel automatique)
- ✅ `vercel.only-prod.json` - **Committé** (sauvegarde)

### **En local pendant dev**

- ❌ `vercel.json` - **Supprimé** (pour éviter conflits avec vercel dev)
- ✅ `vercel.only-prod.json` - **Présent** (source de vérité)

## 🎯 Scripts disponibles

| Script               | Action                  | Usage         | Vitesse |
| -------------------- | ----------------------- | ------------- | ------- |
| `pnpm vercel:dev`    | Dev local               | Quotidien     | ⚡⚡    |
| `pnpm vercel:prod`   | Production              | Déploiement   | ⚡⚡    |
| `pnpm vercel:commit` | Restaure vercel.json    | Ponctuel      | ⚡⚡⚡  |
| `pnpm commit-ready`  | Prépare commit + aperçu | **Quotidien** | ⚡⚡    |
| `pnpm pre-commit`    | Commit complet + lint   | Important     | ⚡      |
| `pnpm vercel:clean`  | Nettoie vercel.json     | Dépannage     | ⚡⚡⚡  |

## 🔒 Sécurités intégrées

✅ **Impossible d'oublier `vercel.json`** - Restauré automatiquement avant commit
✅ **Impossible de conflit en dev** - Supprimé automatiquement pour `vercel dev`
✅ **CI/CD compatible** - Scripts utilisables dans les pipelines
✅ **Git propre** - `vercel.json` retiré du `.gitignore`, présent dans le repo

## 🛠️ Modification de config

Pour changer la configuration Vercel :

1. **Modifier** `vercel.only-prod.json` (jamais `vercel.json` directement)
2. **Tester** avec `pnpm vercel:prod`
3. **Committer** avec `pnpm commit-ready`

## 🎉 Résultat

Plus jamais de renommage manuel ! Le workflow est entièrement automatisé et sécurisé.

---

_Système mis en place le 2 juin 2025 - Compatible pnpm + Git + Vercel CI/CD_
