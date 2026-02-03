# Cypress Visual Testing Framework

Visual regression testing for [pradappandiyan.medium.com](https://pradappandiyan.medium.com/) across multiple viewport resolutions. Runs on GitHub Actions CI.

## Features

- **Multi-resolution testing**: Web (1920×1080), tablet (768×1024), and mobile (375×667)
- **Visual regression**: Compares screenshots against baseline images using [cypress-visual-regression](https://github.com/cypress-visual-regression/cypress-visual-regression)
- **CI integration**: GitHub Actions workflow runs on push/PR to `main` or `master`

## Setup

```bash
npm install
```

## Generate Baseline Images (First Run)

Before CI can run regression tests, you need to generate baseline screenshots locally:

```bash
npm run cy:run:base
```

This creates baseline images in `cypress/snapshots/base/`. **Commit these to your repository** so CI can compare against them.

## Run Tests

**Regression mode** (compare against baselines):

```bash
npm run cy:run:regression
# or
npm run cy:run
```

**Update baselines** (overwrite existing baselines):

```bash
npm run cy:run:base
```

**Interactive mode** (Cypress UI):

```bash
npm run cy:open
```

## Viewport Resolutions

| Resolution | Width × Height | Device type |
|------------|----------------|-------------|
| web | 1920 × 1080 | Desktop |
| tablet | 768 × 1024 | Tablet (e.g. iPad portrait) |
| mobile | 375 × 667 | Mobile (e.g. iPhone 6/7/8) |

## CI (GitHub Actions)

The workflow in `.github/workflows/cypress-visual.yml` runs on:

- Push to `main` or `master`
- Pull requests to `main` or `master`

**Important**: Baseline images in `cypress/snapshots/base/` must be committed to the repo for CI to pass.

On failure, the workflow uploads:

- Screenshots (actual vs baseline vs diff)
- Video recordings

## Configuration

- **Error threshold**: `0.01` (1% pixel difference allowed) in `cypress/support/e2e.js`
- **Base URL**: `https://pradappandiyan.medium.com` in `cypress.config.js`
- Adjust `VIEWPORTS` in `cypress/e2e/pradappandiyan.cy.js` to add/remove resolutions

## Troubleshooting

**Tests fail with "base image not found"**  
Run `npm run cy:run:base` locally and commit the generated baseline images.

**Visual differences on CI but not locally**  
CI runs in a fixed environment (Ubuntu, Chrome). Minor rendering differences can occur. Consider increasing `errorThreshold` in `cypress/support/e2e.js` or using a Docker image for consistency.
