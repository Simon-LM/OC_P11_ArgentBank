<!-- @format -->

# Performance Testing with Lighthouse

## 📊 Testing approach

ArgentBank uses Lighthouse to measure and improve the application's performance, accessibility, best practices, and SEO. Our testing approach is designed to ensure optimal user experience while accounting for differences between environments.

## 🗄️ Report structure

Test reports are organized as follows:

- **reports/**: Contains current and recent reports
- **reports/archive/**: Stores old reports for historical reference

## 🔍 Production Lighthouse results

Our application achieves excellent scores in production:

### Mobile Version

- **Performance**: 94/100
- **Accessibility**: 100/100
- **Best Practices**: 100/100
- **SEO**: 100/100

### Desktop Version

- **Performance**: 100/100
- **Accessibility**: 100/100
- **Best Practices**: 100/100
- **SEO**: 100/100

## 🛠️ Lighthouse test suite

We have developed a complete Lighthouse test suite that allows us to:

- Test main pages (home, login, profile)
- Test pages with authentication
- Compare performance with a baseline
- Detect performance regressions

## 📈 Testing strategy in different environments

Lighthouse scores can vary significantly depending on the environment:

| Environment | Characteristics                       | Testing approach               |
| ----------- | ------------------------------------- | ------------------------------ |
| Development | Limited resources, development server | Regression detection           |
| CI/CD       | Standardized environment, headless    | Adapted thresholds (~50% perf) |
| Production  | Optimized, caching, CDN               | High scores (>90%)             |

## 🧪 How to run tests

```bash
# Navigate to lighthouse folder
cd lighthouse

# Standard test
pnpm test

# Complete test suite
pnpm test:suite

# Test with authentication
pnpm test:auth

# Quick test
pnpm test:quick

# Check regressions
pnpm test:ci
pnpm test:regression

# Archive old reports (> 7 days)
pnpm archive
```

## 🔬 Implemented best practices

- Text compression
- JavaScript minification
- Image optimization
- Critical resource preloading
- Cumulative Layout Shift (CLS) reduction
- Semantic HTML structure for accessibility
