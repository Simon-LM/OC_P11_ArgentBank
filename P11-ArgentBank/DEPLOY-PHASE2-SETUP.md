<!-- @format -->

# 🚀 Phase 2: Vercel Automatic Deployment Configuration

## 📋 Required GitHub Secrets

To enable automatic deployment, you must configure these secrets in your GitHub repository:

### 1. Get Vercel tokens

```bash
# In your terminal
vercel login  # If not already connected
vercel link   # Link Vercel project (in P11-ArgentBank/)

# Get necessary information
vercel env ls --environment=production  # View variables
```

### 2. Secrets to configure on GitHub

Go to **Settings > Secrets and variables > Actions** of your repository and add:

| Secret Name         | Description                 | Where to find it                                               |
| ------------------- | --------------------------- | -------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel authentication token | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`     | Your Vercel organization ID | `.vercel/project.json` file (after `vercel link`)              |
| `VERCEL_PROJECT_ID` | Your Vercel project ID      | `.vercel/project.json` file (after `vercel link`)              |

### 3. Automatic ID retrieval

```bash
cd P11-ArgentBank
vercel link --yes  # Creates .vercel/project.json
cat .vercel/project.json  # Displays orgId and projectId
```

## 🔄 Deployment Process

### **Pull Request** → Preview Deployment

- ✅ Automatic build
- ✅ CI/CD tests pass
- ✅ Deployment to Vercel preview URL
- ✅ Automatic comment with preview link

### **Merge to main** → Production Deployment

- ✅ Automatic build
- ✅ CI/CD tests pass
- ✅ Production deployment to your Vercel domain

## 🛠️ Created Workflows

- **`.github/workflows/ci.yml`** - Tests and validation (Phase 1) ✅
- **`.github/workflows/deploy.yml`** - Automatic deployment (Phase 2) 🆕

## ⚡ Deployment Testing

Once secrets are configured:

1. **Create a new PR** → Triggers preview deployment
2. **Merge the PR** → Triggers production deployment

## 🔧 Troubleshooting

### Error "VERCEL_TOKEN invalid"

- Regenerate token on [vercel.com/account/tokens](https://vercel.com/account/tokens)
- Verify token has "Deploy" permissions

### Error "Project not found"

- Verify `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID`
- Re-run `vercel link` in P11-ArgentBank/

### Deployment blocked

- Verify all secrets are properly configured
- Check GitHub Actions logs for more details

## 🎯 Next Steps

Once Phase 2 is functional:

- **Phase 3**: Advanced analysis (coverage, bundle, security)
- **Phase 4**: Accessibility tests (Pa11y, Lighthouse, Cypress)
