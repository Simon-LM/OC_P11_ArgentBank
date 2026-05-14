<!-- @format -->

# Test Maintenance Guide - Vitest

This guide provides best practices for maintaining Vitest tests in the ArgentBank project over the long term.

## 🔄 Test lifecycle

### When to update tests

- ✅ When component APIs change
- ✅ When adding new features
- ✅ When fixing bugs
- ✅ When major dependencies change
- ✅ When refactoring

### Signs that tests need attention

- 🚩 Tests failing without changes to tested code
- 🚩 Unreliable tests (randomly passing/failing)
- 🚩 Decreasing code coverage
- 🚩 Tests taking increasingly long
- 🚩 Tests containing too many mocks or complexity

## 📈 Continuous improvement

### Analyzing existing tests

```bash
# Identify slowest tests
pnpm test -- --reporter=verbose | grep "took"

# Identify most frequently failing tests
pnpm test:watch -- --reporterUpdateInterval=1000
```

### Test refactoring

Principles to follow:

1. **Clarify intent**: Explicit test names
2. **Simplify**: Reduce complexity and dependencies
3. **Consolidate**: Group similar tests
4. **Isolate**: Ensure test independence

Refactoring example:

```typescript
// Before
it('test that component works', () => {
  render(<Component prop1="a" prop2="b" prop3="c" prop4="d" />);
  fireEvent.click(screen.getByText('Click'));
  expect(screen.getByText('Result')).toBeInTheDocument();
});

// After
it('displays result when button is clicked', () => {
  // Arrangement
  const defaultProps = { prop1: "a", prop2: "b", prop3: "c", prop4: "d" }; // Define defaultProps
  render(<Component {...defaultProps} />);
  const button = screen.getByRole('button', { name: /click/i });

  // Action
  fireEvent.click(button);

  // Assertion
  expect(screen.getByText('Result')).toBeInTheDocument();
});
```

## 🐛 Common problem resolution

### Flaky tests

Common causes:

- Poorly managed asynchronous expectations
- Dependencies between tests
- Timeouts too short
- Global state not reset

Solutions:

- Use `waitFor` or `findBy*` for asynchronous operations
- Add `vi.clearAllMocks()` in `afterEach`
- Increase timeouts for slow tests
- Isolate each test with clean initial state

```typescript
// Fixing an unstable asynchronous test
it('fetches and displays data', async () => {
  // Setup mocks
  const mockFetchData = vi.fn(); // Ensure mockFetchData is defined
  mockFetchData.mockResolvedValue({ name: 'Test User' });

  render(<UserProfile userId="123" />);

  // Use findBy instead of getBy to wait for result
  await screen.findByText('Test User');
  expect(mockFetchData).toHaveBeenCalledWith('123');
});
```

### Memory issues

If tests consume too much memory:

- Run tests in smaller groups
- Clean up resources in `afterEach`
- Monitor memory leaks with `--logHeapUsage`

```bash
# Detect memory leaks
pnpm test -- --logHeapUsage
```

## 📊 Quality monitoring

### Key metrics

1. **Code coverage**: Maintain or improve existing coverage
2. **Execution time**: Keep tests fast (< 30s for complete suite)
3. **Reliability**: 0% flaky tests
4. **Maintainability**: Readable and well-structured test code

### Regular reviews

Schedule quarterly reviews to:

- Identify under-tested areas
- Improve slow tests
- Update obsolete mocks
- Simplify complex tests

## 🚀 Dependency upgrades

### Update strategy

1. **Preparation**:

   - Capture current metrics (coverage, speed)
   - Run all tests to have a baseline

2. **Progressive update**:

   - Update one dependency at a time
   - Run tests after each update
   - Document necessary changes

3. **Verification**:
   - Compare before/after metrics
   - Verify all tests pass
   - Check for deprecation warnings

### Critical dependencies

For major updates of these dependencies, verify compatibility:

- Vitest
- Testing Library
- React
- Redux Toolkit
- TypeScript

```bash
# Check outdated dependencies
pnpm outdated

# Update a specific dependency
pnpm update @testing-library/react

# Update all test dependencies
pnpm update -r "@testing-library/*" vitest
```

## 🧰 Diagnostic tools

### Test debugging

```bash
# Debug mode with pause
pnpm test:debug -- Button.test.tsx

# UI mode
pnpm test:ui

# Verbose mode
pnpm test -- --reporter=verbose
```

### Useful scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test:find-slow": "pnpm test -- --reporter=verbose | grep -B 1 -A 1 'took.*>100ms'",
    "test:find-flaky": "pnpm test -- --retry=3 --reporter=json | jq '.testResults[] | select(.retry > 0)'",
    "test:by-file": "node scripts/run-tests-by-size.js",
    "test:watch-coverage": "pnpm test:coverage -- --watch"
  }
}
```

## 📝 Continuous documentation

### Pattern documentation

For each new test pattern:

1. Document the problem solved
2. Provide a minimal example
3. Explain when to use it
4. Add to appropriate documentation

### Test library

Maintain a library of test examples for common cases:

- Forms with validation
- API requests
- Controlled vs uncontrolled components
- Protected routes
- Global state with Redux

## 👥 Team best practices

### Code reviews

Checklist for test code reviews:

- [ ] Tests verify behavior, not implementation
- [ ] Test names are descriptive and behavior-based
- [ ] Arrangements, actions and assertions are clearly separated
- [ ] Mocks are minimal and explicit
- [ ] Tests are independent of each other

### Pair-testing sessions

Organize sessions where two developers:

1. Write tests together
2. Review and improve existing tests
3. Share techniques and tips

## 🔄 Continuous integration

### CI pipeline optimization

1. **Caching**:

   - Cache node_modules dependencies
   - Cache TypeScript compilation results

2. **Parallelization**:

   - Divide tests into balanced groups
   - Run groups in parallel

3. **Fail fast**:
   - Fail on first test failure
   - Run most likely to fail tests first

```yaml
# Example optimization in GitHub Actions
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Cache node_modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-modules-${{ hashFiles('pnpm-lock.yaml') }}

      - name: Run critical tests first
        run: pnpm test -- --grep="^(Authentication|User)"

      - name: Run remaining tests
        run: pnpm test -- --exclude="^(Authentication|User)"
```

## 🚦 Preventive maintenance

### Regular checks

Run these checks monthly:

```bash
# Check slow tests
pnpm test -- --reporter=verbose | grep -B 1 -A 1 "took.*>100ms"

# Check warnings
pnpm test -- 2>&1 | grep -i "warning\|deprecated"

# Check disabled tests
grep -r "it.skip\|describe.skip\|test.skip" --include="*.test.*" src/
```

### Cleanup plan

1. **Ignored tests**: Review and fix or remove `.skip` tests
2. **Duplicate tests**: Consolidate redundant tests
3. **Obsolete tests**: Remove tests for removed features
4. **Unused mocks**: Clean up unused mocks and fixtures

---

**Navigation**: [Configuration](./CONFIGURATION.md) | [Test Architecture](./TEST_ARCHITECTURE.md)
