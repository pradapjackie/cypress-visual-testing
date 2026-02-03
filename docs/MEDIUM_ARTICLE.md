# How to Set Up Cypress Visual Testing From Scratch

*A complete guide to visual regression testing with Cypress, multiple viewports, and CI/CD*

---

Visual regression testing catches unintended UI changes before they reach production. In this guide, you'll build a Cypress visual testing framework from scratch that runs across web, tablet, and mobile viewports—and executes automatically on every push via GitHub Actions.

## What You'll Build

- **Visual regression tests** that compare screenshots against baseline images
- **Multi-viewport testing** (desktop, tablet, mobile)
- **GitHub Actions CI** that runs on every push
- **HTML comparison report** for easy visual diff review

## Prerequisites

- Node.js 18+ installed
- A GitHub account
- A website or URL to test (we'll use a public site as an example)

---

## Step 1: Initialize the Project

Create a new folder and initialize npm:

```bash
mkdir cypress-visual-testing
cd cypress-visual-testing
npm init -y
```

## Step 2: Install Dependencies

Install Cypress and the visual regression plugin:

```bash
npm install --save-dev cypress cypress-visual-regression
```

- **Cypress** — End-to-end testing framework
- **cypress-visual-regression** — Adds screenshot comparison with pixel-diff capabilities

## Step 3: Configure Cypress

Create `cypress.config.js` in the project root:

```javascript
const { defineConfig } = require('cypress');
const { configureVisualRegression } = require('cypress-visual-regression');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://your-website.com',  // Change to your target URL
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0,
    env: {
      visualRegressionType: 'regression',
      visualRegressionBaseDirectory: 'cypress/snapshots/base',
      visualRegressionDiffDirectory: 'cypress/snapshots/diff',
      visualRegressionGenerateDiff: 'always',
    },
    screenshotsFolder: './cypress/snapshots/actual',
    video: true,
    setupNodeEvents(on, config) {
      configureVisualRegression(on);
    },
  },
});
```

**Key settings:**
- `baseUrl` — The site you're testing
- `visualRegressionType` — `'regression'` compares to baseline; `'base'` generates baselines
- `experimentalMemoryManagement` — Reduces memory usage during full-page screenshots

## Step 4: Add the Compare Snapshot Command

Create `cypress/support/e2e.js`:

```javascript
const { addCompareSnapshotCommand } = require('cypress-visual-regression/dist/command');

addCompareSnapshotCommand({
  capture: 'fullPage',
  errorThreshold: 0.01,  // 1% pixel difference allowed
});
```

## Step 5: Write Your First Visual Test

Create `cypress/e2e/visual.cy.js`:

```javascript
const VIEWPORTS = [
  { name: 'web', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

describe('Visual Regression', () => {
  VIEWPORTS.forEach(({ name, width, height }, index) => {
    describe(`Viewport: ${name} (${width}x${height})`, () => {
      beforeEach(() => {
        if (index > 0) cy.wait(5000);  // Avoid rate limiting on some sites
        cy.viewport(width, height);
        cy.visit('/', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
      });

      it('should match homepage snapshot', () => {
        cy.get('body').should('be.visible');
        cy.wait(500);
        cy.compareSnapshot(`homepage-${name}`);
      });
    });
  });
});
```

**Why the delay?** Some sites (e.g., Medium) rate-limit rapid requests. A 5-second wait between viewports helps avoid 403 errors.

## Step 6: Add NPM Scripts

Update `package.json`:

```json
{
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run",
    "cy:run:base": "cypress run --env visualRegressionType=base",
    "cy:run:regression": "cypress run --env visualRegressionType=regression",
    "cy:report": "node scripts/generate-visual-report.js"
  }
}
  }
}
```

## Step 7: Generate Baseline Images

Before running regression tests, create baseline screenshots:

```bash
npm run cy:run:base
```

This creates images in `cypress/snapshots/base/`. **Commit these to your repo**—CI needs them for comparison.

## Step 8: Run Regression Tests

Compare current screenshots against baselines:

```bash
npm run cy:run:regression
```

Tests fail if the pixel difference exceeds your `errorThreshold`. Diff images appear in `cypress/snapshots/diff/`.

## Step 9: Set Up GitHub Actions CI

Create `.github/workflows/cypress-visual.yml`:

```yaml
name: Cypress Visual Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  workflow_dispatch:

jobs:
  cypress-visual:
    runs-on: ubuntu-24.04
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Cypress run
        uses: cypress-io/github-action@v7
        with:
          browser: chrome
          env: visualRegressionType=regression

      - name: Upload screenshots on failure
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/snapshots

      - name: Upload videos
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cypress-videos
          path: cypress/videos
```

Push to GitHub—the workflow runs on every push to `main` or `master`.

## Step 10: Generate HTML Comparison Report

Create `scripts/generate-visual-report.js` to build an HTML report from your snapshots. The script scans `base`, `actual`, and `diff` folders, matches images by name, and generates a table with side-by-side comparison. Full source: [github.com/pradapjackie/cypress-visual-testing](https://github.com/pradapjackie/cypress-visual-testing).

After a test run:

```bash
npm run cy:report
```

Open `cypress/snapshots/visual-report.html` in your browser to view baseline vs. actual vs. diff images in a dark-themed, responsive table.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **403 Forbidden** on visit | Add delay between viewports, set User-Agent header |
| **Base image not found** | Run `npm run cy:run:base` and commit baseline images |
| **Tests pass locally, fail in CI** | CI uses a fixed environment; minor rendering differences can occur. Consider increasing `errorThreshold` |
| **Electron crashes** | Enable `experimentalMemoryManagement` and `numTestsKeptInMemory: 0` |

---

## Summary

You now have a complete visual testing setup:

1. ✅ Cypress + cypress-visual-regression
2. ✅ Multi-viewport tests (web, tablet, mobile)
3. ✅ Baseline generation and regression comparison
4. ✅ GitHub Actions CI
5. ✅ HTML comparison report

Visual regression testing helps you ship with confidence—catch UI regressions before your users do.

---

*Full example: [github.com/pradapjackie/cypress-visual-testing](https://github.com/pradapjackie/cypress-visual-testing)*
