<!-- @format -->

# Pa11y Folder Organization

## Folder structure

```text
Pa11y/
├── scripts/
│   ├── run-pa11y-tests.js          # Main Pa11y test script
│   └── pa11y-auth.js               # Authentication script
├── config/
│   ├── pa11y-ci.config.cjs         # Pa11y CI configuration
│   └── pa11y-ci.json               # Pa11y CI JSON configuration
├── screenshots/
│   ├── debug/                      # Debug captures
│   ├── errors/                     # Error captures
│   └── success/                    # Success captures
├── README.md                       # Main documentation
└── FOLDER_ORGANIZATION.md          # This file
```

## Screenshot types

### Debug (`screenshots/debug/`)

- `debug_before_button_search.png` - Capture before login button search
- `debug_before_submit_click.png` - Capture before submit button click
- `debug_signIn_page_before_wait.png` - Capture of login page before wait

### Errors (`screenshots/errors/`)

- `error_in_auth_script.png` - Generic errors in authentication script
- `error_test_http___localhost_3000_.png` - Errors on home page
- `error_test_http___localhost_3000_signIn.png` - Errors on login page
- `error_test_http___localhost_3000_user.png` - Errors on user page
- `error_after_login_wrong_page.png` - Navigation error after login
- `error_auth_user_page_content_verification_failed.png` - Content verification error

### Success (`screenshots/success/`)

- `screenshot_user_page_after_auth.png` - Success capture of user page after authentication
- `pa11y_user_page_after_auth.png` - Pa11y capture of authenticated user page

## Path configuration

The `run-pa11y-tests.js` and `pa11y-auth.js` scripts use `path.join(__dirname, ...)` to build paths to screenshots. For example:

- In `run-pa11y-tests.js`:
  - `errorScreenshotPath` points to `screenshots/errors/error_test_SCENARIO_URL.png`
- In `pa11y-auth.js`:
  - `screenshotBeforeButtonSearchPath` points to `screenshots/debug/debug_before_button_search.png`

Make sure your `screenshots/debug/` and `screenshots/errors/` folder structure matches these paths.

## Available tests

1. **Home page** (`/`) - No authentication
2. **Login page** (`/signIn`) - No authentication
3. **User page** (`/user`) - Authentication required

## Running tests

```bash
# From Pa11y folder
node run-pa11y-tests.js

# Or from project root
node Pa11y/run-pa11y-tests.js
```

## Next steps

1. Integration with Cypress for complete E2E tests
2. CI/CD configuration for automatic execution
3. Detailed HTML reports with integrated screenshots

---

**Creation date:** May 26, 2025  
**Last updated:** May 26, 2025
