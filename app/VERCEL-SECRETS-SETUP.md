<!-- @format -->

# 🔐 Vercel Secrets Configuration for GitHub Actions

## ✅ Current secrets status

**Already configured secrets:**

- ✅ `VERCEL_TOKEN` - Configured (2 weeks)
- ✅ `SMTP_USERNAME` - Configured (2 weeks)
- ✅ `SMTP_PASSWORD` - Configured (2 weeks)

**Missing secrets for Phase 2:**

- ❌ `VERCEL_PROJECT_ID`
- ❌ `VERCEL_ORG_ID`

## 📝 Required action

### Add on GitHub: Settings → Secrets and variables → Actions → New repository secret

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

## 🚀 After configuration

Once these 2 secrets are added:

- ✅ The `deploy.yml` workflow will work
- ✅ Automatic Preview deployment on PRs
- ✅ Automatic Production deployment on main

## 📊 Current workflow

1. **✅ CI** (ci.yml) - Works perfectly
2. **⏳ Deploy** (deploy.yml) - Waiting for secrets
3. **🗑️ Debug** (debug.yml) - Deleted (temporary)

---

_IDs retrieved from `.vercel/project.json` on June 11, 2025_
