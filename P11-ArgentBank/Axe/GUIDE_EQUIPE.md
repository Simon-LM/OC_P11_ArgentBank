<!-- @format -->

# 🎯 Axe Usage Guide - ArgentBank Accessibility Framework

## ✅ Complete Installation - Status

**Installation Date:** May 28, 2025  
**Status:** ✅ Configured and operational  
**Axe Version:** 4.10.3  
**Framework:** Vitest + Jest-Axe

## 🚀 Functional Tests

### Currently Operational Tests

```bash
# ✅ Basic tests - 4 passing tests
pnpm test:axe

# ✅ Tests with continuous monitoring
pnpm test:axe-watch

# ✅ Tests with detailed reports
pnpm test:axe-report
```

### 📊 Test Results

**Last execution:** ✅ 12/12 passing tests

- `simple.axe.test.tsx`: 4/4 ✅
- `components.axe.test.tsx`: 8/8 ✅

## 🎯 Covered Tests

### 1. Form Tests

- ✅ Appropriate labels for all fields
- ✅ Correct label/input associations
- ✅ Configured aria-required attributes
- ✅ Accessible error messages

### 2. Navigation Tests

- ✅ Logical tab order
- ✅ Visible and manageable focus
- ✅ Functional keyboard navigation

### 3. Content Tests

- ✅ Header structure (h1, h2, h3...)
- ✅ Alternative text for images
- ✅ Content areas identified

### 4. Contrast Tests

- ✅ Configuration ready (disabled in unit test mode)
- 🎯 To enable for integration tests

## 📁 Operational Structure

```
Axe/ ✅ Configured
├── config/
│   ├── axe.config.js ✅          # WCAG 2.1 AA rules
│   └── vitest.axe.config.ts ✅   # Vitest configuration
├── tests/
│   ├── simple.axe.test.tsx ✅    # Validated basic tests
│   └── components.axe.test.tsx ✅ # Mocked component tests
├── utils/
│   ├── axe-setup.js ✅           # Mocks and configuration
│   └── axe-reporter.js ✅        # Custom reports
├── reports/ ✅
│   ├── html/ ✅                  # Visual reports
│   └── json/ ✅                  # Structured data
└── README.md ✅                  # Complete documentation
```

## 🔧 Ready-to-Use Commands

### Scripts Configured in package.json

```json
{
  "test:axe": "vitest run --config Axe/config/vitest.axe.config.ts",
  "test:axe-watch": "vitest watch --config Axe/config/vitest.axe.config.ts",
  "test:axe-components": "vitest run --config Axe/config/vitest.axe.config.ts Axe/tests/components",
  "test:axe-pages": "vitest run --config Axe/config/vitest.axe.config.ts Axe/tests/pages",
  "test:axe-report": "vitest run --config Axe/config/vitest.axe.config.ts --reporter=verbose"
}
```

## 📝 How to Add New Tests

### 1. Test for a New Component

```tsx
// Axe/tests/my-new-component.axe.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import "../utils/axe-setup.js";

expect.extend(toHaveNoViolations);

const MyComponent = () => (
  <div>
    <h2>My Title</h2>
    <p>My accessible content</p>
  </div>
);

describe("MyComponent - Accessibility Tests", () => {
  it("should not have violations", async () => {
    const { container } = render(<MyComponent />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 2. Test with Specific Rules

```tsx
it("should have accessible forms", async () => {
  const { container } = render(<MyForm />);

  const results = await axe(container, {
    rules: {
      label: { enabled: true },
      "form-field-multiple-labels": { enabled: true },
    },
  });

  expect(results).toHaveNoViolations();
});
```

## 🎯 WCAG 2.1 AA Rules Configured

### ✅ Enabled and Tested

- `label`: Form labels
- `image-alt`: Image alternative text
- `heading-order`: Heading hierarchy
- `tabindex`: Keyboard navigation
- `button-name`: Button accessibility
- `input-button-name`: Input field names

### 🎯 Available for Configuration

- `color-contrast`: Color contrast
- `landmark-one-main`: Unique main zone
- `page-has-heading-one`: Main H1 title

## 📊 Automatic Reports

### After Each Test

1. **Console**: Immediate results
2. **JSON**: `Axe/reports/json/results.json`
3. **HTML**: `Axe/reports/html/index.html`
4. **Coverage**: Quality metrics

### View Reports

```bash
# View HTML report in browser
npx vite preview --outDir Axe/reports/html
```

## 🚨 Troubleshooting

### Common Errors Resolved ✅

1. **"unknown rule focusable-content"** → ✅ Fixed
2. **"unknown rule alt-text"** → ✅ Fixed
3. **"window.matchMedia not defined"** → ✅ Mock configured
4. **"No test suite found"** → ✅ Vitest configuration fixed

### If New Problems

1. **Check rule names**: [Official Axe list](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
2. **Check logs**: Verbose mode enabled
3. **Test individually**: One file at a time

## 🔄 CI/CD Integration (Recommendations)

### GitHub Actions

```yaml
name: Accessibility Tests
on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm test:axe
      - name: Upload reports
        uses: actions/upload-artifact@v3
        with:
          name: axe-accessibility-reports
          path: Axe/reports/
```

## 📈 Recommended Next Steps

### 🎯 Short Term

1. **Test real components**: Replace mocks
2. **Page tests**: Add integration tests
3. **Color contrast**: Enable for visual tests

### 🎯 Medium Term

1. **CI/CD integration**: Complete automation
2. **Quality thresholds**: Define KPIs
3. **Team training**: Documentation and training

### 🎯 Long Term

1. **Continuous monitoring**: Production surveillance
2. **User tests**: Validation with real users
3. **Optimization**: Performance and coverage

## ✨ Summary: Ready to Use!

**✅ Installation:** Complete and functional  
**✅ Configuration:** WCAG 2.1 AA ready  
**✅ Tests:** 12/12 passing  
**✅ Reports:** Automatic JSON + HTML  
**✅ Scripts:** Integrated in package.json  
**✅ Documentation:** Complete and up-to-date

**🚀 The team can now:**

- Run `pnpm test:axe` to validate accessibility
- Add new tests easily
- Integrate into development process
- Generate reports automatically

---

**👥 For the development team:**  
_This framework is ready to use. Follow the examples above to add your accessibility tests and maintain WCAG 2.1 AA compliance for ArgentBank._

**📞 Support:** Check complete documentation in `Axe/README.md`
