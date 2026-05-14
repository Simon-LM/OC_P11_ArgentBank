<!-- @format -->

# Vercel Protection Bypass Configuration

## Identified Problem

Vercel Preview deployments are protected, which prevents automated tests (Cypress, Lighthouse, Pa11y) from running in CI/CD. 401 Unauthorized errors occur because the standard Vercel token (`VERCEL_TOKEN`) is not designed to bypass deployment protection.

## Implemented Solution

Vercel offers a specific system called **"Protection Bypass for Automation"** which generates a dedicated secret to allow automation tools to access protected deployments.

### How it works

1. **Special header**: `x-vercel-protection-bypass` with the generated secret
2. **Optional header**: `x-vercel-set-bypass-cookie: true` to set an authentication cookie
3. **Environment variable**: `VERCEL_AUTOMATION_BYPASS_SECRET` automatically available in deployments

## Required Configuration

### 1. Generate the Bypass Secret

In your Vercel dashboard:

1. Go to **Project Settings** → **Deployment Protection**
2. Enable **"Protection Bypass for Automation"**
3. Copy the generated secret
4. Add it as a GitHub secret: `VERCEL_AUTOMATION_BYPASS_SECRET`

### 2. CI/CD Workflow Update

The workflow has been updated to use:

```yaml
env:
  VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}

# In curl requests
curl -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET"
```

### 3. Cypress Configuration

The `cypress/support/e2e.ts` file has been updated to automatically intercept all requests in CI and add the necessary headers:

```typescript
if (isCI && vercelBypassSecret) {
  beforeEach(() => {
    cy.intercept("**", (req) => {
      req.headers["x-vercel-protection-bypass"] = vercelBypassSecret;
      req.headers["x-vercel-set-bypass-cookie"] = "true";
    });
  });
}
```

## Updated Tests

### Cypress E2E

- ✅ Headers automatically added via global interceptor
- ✅ Variable `VERCEL_AUTOMATION_BYPASS_SECRET` passed from workflow

### Lighthouse

- ✅ Header `x-vercel-protection-bypass` added to curl requests
- ✅ Connectivity tests before execution

### Pa11y

- ✅ Header `x-vercel-protection-bypass` added to curl requests
- ✅ Connectivity tests before execution

## Required Actions

### Immediate

1. **Add the GitHub secret**:

   ```bash
   # In GitHub → Settings → Secrets and variables → Actions
   VERCEL_AUTOMATION_BYPASS_SECRET=your_vercel_secret
   ```

2. **Verify Vercel protection**:
   - The project must have protection enabled on Preview deployments
   - The "Protection Bypass for Automation" feature must be enabled

### Validation Test

1. Create a test PR
2. Verify that the workflow runs without 401 errors
3. Confirm that all tests (Cypress, Lighthouse, Pa11y) run correctly

## Benefits of this Solution

1. **Secure**: The secret is specifically designed for automation
2. **Official**: Solution recommended by Vercel
3. **Automatic**: Headers added automatically without modifying tests
4. **Reversible**: Can be easily disabled if necessary

## References

- [Vercel Protection Bypass for Automation](https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)
- [Vercel Deployment Protection](https://vercel.com/docs/security/deployment-protection)

## Status

- ✅ Code updated
- ⏳ GitHub secret to configure
- ⏳ Validation tests to perform
