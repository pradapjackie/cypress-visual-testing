// ***********************************************************
// This file is processed and loaded automatically before your
// test files. You can put global configuration and behavior
// that modifies Cypress here.
// ***********************************************************

const { addCompareSnapshotCommand } = require('cypress-visual-regression/dist/command');

addCompareSnapshotCommand({
  capture: 'fullPage',
  errorThreshold: 0.01,
});
