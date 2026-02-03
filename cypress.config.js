const { defineConfig } = require('cypress');
const { configureVisualRegression } = require('cypress-visual-regression');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://pradappandiyan.medium.com',
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
    videoCompression: 15,
    setupNodeEvents(on, config) {
      configureVisualRegression(on);
    },
  },
});
