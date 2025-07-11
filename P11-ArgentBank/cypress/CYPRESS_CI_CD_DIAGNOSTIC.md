<!-- @format -->

# Cypress CI/CD Failure Diagnostic

## 🎯 Executive Summary

**PROBLEM**: Cypress tests work locally but fail systematically in CI/CD  
**ROOT CAUSE**: Cypress cannot access protected Vercel Preview URLs because it lacks bypass headers  
**SOLUTION**: Configure Cypress to use `x-vercel-protection-bypass` headers like Pa11y

## 📋 Analysis Evidence

### CI/CD Error Logs Analyzed

```
Tests:        3
Passing:      0  ← ALL TESTS FAIL
Failing:      1
Pending:      0
Skipped:      2
```

### Test Tools Comparison

| Tool           | Local | CI/CD | Vercel Headers | Status      |
| -------------- | ----- | ----- | -------------- | ----------- |
| **Lighthouse** | ✅    | ✅    | ✅ Configured  | Working     |
| **Pa11y**      | ✅    | ✅    | ✅ Configured  | Working     |
| **Cypress**    | ✅    | ❌    | ❌ Missing     | **PROBLEM** |

## Identified Problem

Cypress tests **work locally** but **fail in CI/CD**. After comparative analysis with Pa11y (which works in CI/CD), the root cause has been identified.

## Root Cause: Missing Vercel Bypass Headers

### Context

- In CI/CD, the application is deployed on Vercel Preview with access protection
- Pa11y works because it explicitly configures Vercel bypass headers
- Cypress fails because it doesn't have access to these headers

### Pa11y vs Cypress Comparison

#### ✅ Pa11y (WORKS in CI/CD)

```javascript
// Pa11y explicitly configures bypass headers
await page.setExtraHTTPHeaders({
  "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
});
```

#### ❌ Cypress (FAILS in CI/CD)

```typescript
// Cypress has no configuration for Vercel bypass headers
// It tries to access CYPRESS_BASE_URL directly without authentication
cy.visit("/signin"); // Fails because no access to protected Preview
```

## Technical Details

### Test Environment

- **Local**: `http://localhost:3000` (no protection) → ✅ Works
- **CI/CD**: `https://[preview-url].vercel.app` (protected) → ❌ Fails

### Current CI/CD Configuration

```yaml
- name: 🏃 Run Cypress E2E tests
  env:
    CYPRESS_BASE_URL: ${{ needs.deploy-preview.outputs.preview-url }}
    VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}
  run: |
    pnpm exec cypress run --config baseUrl=$CYPRESS_BASE_URL
```

### Problem

- The `VERCEL_AUTOMATION_BYPASS_SECRET` variable is available but **Cypress doesn't use it**
- Cypress cannot access protected Preview pages

## Possible Solutions

### Option 1: Cypress Configuration with Custom Headers

Implement a Cypress plugin to automatically inject bypass headers.

### Option 2: Custom Cypress Command

Create a `cy.visitWithBypass()` command that configures headers.

### Option 3: Request Interceptor

Use `cy.intercept()` to add headers to all requests.

### Option 4: Global Configuration in support/e2e.ts

Configure headers at the global level for all tests.

## Recommendation

**Option 4** seems most appropriate because it:

- Automatically configures all tests
- Maintains local/CI compatibility
- Requires no changes to existing tests

## Next Steps

1. ⏳ **Solution implementation** (after analysis validation)
2. ⏳ Local testing with CI conditions simulation
3. ⏳ CI/CD validation

## Analysis Validation

### Local Environment ✅

- Server: `vercel dev` on `http://localhost:3000`
- Cypress version: 14.4.0
- Tests: ✅ Pass (no access protection)

### CI/CD Environment ❌

- Server: Protected Vercel Preview
- URL: `https://[preview-url].vercel.app`
- Protection: `x-vercel-protection-bypass` headers required
- Tests: ❌ Fail (no authorized access)

Date: June 22, 2025 - 16:25
