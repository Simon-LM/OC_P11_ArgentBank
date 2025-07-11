<!-- @format -->

# 📋 Summary - Automated Vercel Workflow

## ✅ Configuration completed

Your Vercel automation system is now fully operational with integrated Git management!

## 🔄 Daily workflow

### **Local development**

```bash
pnpm vercel:dev
# ➜ Removes vercel.json and launches vercel dev
```

### **Before committing - 3 options depending on context**

```bash
# ⚡⚡⚡ Option 1: Simple restoration (2 sec)
pnpm vercel:commit       # Just restores vercel.json

# ⚡⚡ Option 2: Daily preparation (15-20 sec) - RECOMMENDED
pnpm commit-ready        # Restores + cleans + Git preview
git add .
git commit -m "feat: my new feature"

# ⚡ Option 3: Important commit (30-45 sec)
pnpm pre-commit          # Restores + cleans + lint + formatting
git add .
git commit -m "feat: major feature"
```

### **After commit (back to dev)**

```bash
pnpm vercel:dev
# ➜ Re-removes vercel.json to continue development
```

### **Production deployment**

```bash
pnpm vercel:prod
# ➜ Ensures vercel.json and launches vercel --prod
```

## 📁 File status

### **In Git (repository)**

- ✅ `vercel.json` - **Committed** (for automatic Vercel)
- ✅ `vercel.only-prod.json` - **Committed** (backup)

### **Locally during dev**

- ❌ `vercel.json` - **Removed** (to avoid conflicts with vercel dev)
- ✅ `vercel.only-prod.json` - **Present** (source of truth)

## 🎯 Available scripts

| Script               | Action                    | Usage        | Speed  |
| -------------------- | ------------------------- | ------------ | ------ |
| `pnpm vercel:dev`    | Local dev                 | Daily        | ⚡⚡   |
| `pnpm vercel:prod`   | Production                | Deployment   | ⚡⚡   |
| `pnpm vercel:commit` | Restores vercel.json      | Occasional   | ⚡⚡⚡ |
| `pnpm commit-ready`  | Prepares commit + preview | **Daily**    | ⚡⚡   |
| `pnpm pre-commit`    | Full commit + lint        | Important    | ⚡     |
| `pnpm vercel:clean`  | Cleans vercel.json        | Troubleshoot | ⚡⚡⚡ |

## 🔒 Built-in security

✅ **Impossible to forget `vercel.json`** - Automatically restored before commit
✅ **Impossible dev conflicts** - Automatically removed for `vercel dev`
✅ **CI/CD compatible** - Scripts usable in pipelines
✅ **Clean Git** - `vercel.json` removed from `.gitignore`, present in repo

## 🛠️ Config modification

To change the Vercel configuration:

1. **Modify** `vercel.only-prod.json` (never `vercel.json` directly)
2. **Test** with `pnpm vercel:prod`
3. **Commit** with `pnpm commit-ready`

## 🎉 Result

No more manual renaming! The workflow is fully automated and secure.

---

_System implemented on June 2, 2025 - Compatible with pnpm + Git + Vercel CI/CD_
