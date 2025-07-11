<!-- @format -->

# 🔧 DATABASE_URL Configuration for Vercel Preview CI/CD

## 🎯 Problem Identified and Resolved

**CAUSE**: Cypress tests work locally because they use the real VPS database, but fail in CI/CD because Vercel Preview uses a fake DATABASE_URL.

**SOLUTION**: Configure DATABASE_URL in GitHub secrets so Vercel Preview uses the real database.

## ✅ Changes Made to CI/CD

### 1. Vercel Deployment with Real DATABASE_URL

```yaml
- name: 🚀 Deploy to Vercel Preview
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: |
    PREVIEW_URL=$(vercel --yes --token $VERCEL_TOKEN --env DATABASE_URL="$DATABASE_URL")
```

### 2. Prisma Generation with Real DATABASE_URL

```yaml
- name: 🗃️ Generate Prisma Client
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: |
    echo "🔧 Using real DATABASE_URL for Cypress tests (VPS connection)"
    pnpm exec prisma generate
```

## 🔐 Required GitHub Secrets Configuration

The `DATABASE_URL` secret must be added to GitHub:

### Steps to Follow

1. **Go to GitHub**: `Settings` > `Secrets and variables` > `Actions`

2. **Add a new secret**:

   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://argentbank_user:azRyPtf0A&w^RZkfJy@51.38.236.82:5432/argentbank?schema=public`

3. **Save** the secret

## 🎯 Expected Result

After secret configuration:

### ✅ Unified Behavior

- **Local**: `http://localhost:3000/api` → VPS Database
- **CI/CD**: `https://[preview].vercel.app/api` → **SAME VPS Database**

### ✅ Cypress Tests

- **User**: `tony@stark.com` / `password123` (exists on VPS)
- **Authentication**: ✅ Works
- **Advanced tests**: ✅ Work (profile, transactions, etc.)

## 🧪 Validation

Once the secret is configured, all Cypress tests should pass in CI/CD because:

1. Vercel Preview will have access to the real database
2. User `tony@stark.com` will exist
3. Test data will be available

## 📋 Status

- ✅ **Vercel bypass headers**: Configured (working)
- ⏳ **DATABASE_URL secret**: To be configured in GitHub
- ⏳ **Complete tests**: Will work after configuration

Date: June 22, 2025
