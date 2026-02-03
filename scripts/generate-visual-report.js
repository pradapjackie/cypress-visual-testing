#!/usr/bin/env node
/**
 * Generates an HTML report for visual regression comparison.
 * Run after: npm run cy:run or npm run cy:run:regression
 * Output: cypress/snapshots/visual-report.html
 */

const fs = require('fs');
const path = require('path');

const SNAPSHOTS_DIR = path.join(__dirname, '..', 'cypress', 'snapshots');
const BASE_DIR = path.join(SNAPSHOTS_DIR, 'base');
const ACTUAL_DIR = path.join(SNAPSHOTS_DIR, 'actual');
const DIFF_DIR = path.join(SNAPSHOTS_DIR, 'diff');
const OUTPUT_FILE = path.join(SNAPSHOTS_DIR, 'visual-report.html');

function findPngFiles(dir, basePath = dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(basePath, fullPath);
    if (entry.isDirectory()) {
      results.push(...findPngFiles(fullPath, basePath));
    } else if (entry.name.endsWith('.png')) {
      results.push(relativePath);
    }
  }
  return results;
}

function collectComparisons() {
  const baseFiles = new Set(findPngFiles(BASE_DIR));
  const actualFiles = findPngFiles(ACTUAL_DIR);
  const diffFiles = new Set(findPngFiles(DIFF_DIR));

  const comparisons = [];
  const seen = new Set();

  for (const actualPath of actualFiles) {
    const name = path.basename(actualPath);
    if (seen.has(name)) continue;
    seen.add(name);

    const basePath = [...baseFiles].find((f) => path.basename(f) === name);
    const diffPath = [...diffFiles].find((f) => path.basename(f) === name);

    comparisons.push({
      name: name.replace('.png', ''),
      base: basePath ? path.join('base', basePath) : null,
      actual: path.join('actual', actualPath),
      diff: diffPath ? path.join('diff', diffPath) : null,
      hasDiff: !!diffPath,
    });
  }

  if (comparisons.length === 0) {
    for (const basePath of baseFiles) {
      const name = path.basename(basePath);
      if (seen.has(name)) continue;
      seen.add(name);
      comparisons.push({
        name: name.replace('.png', ''),
        base: path.join('base', basePath),
        actual: null,
        diff: null,
        hasDiff: false,
      });
    }
  }

  return comparisons.sort((a, b) => a.name.localeCompare(b.name));
}

function generateHtml(comparisons) {
  const timestamp = new Date().toISOString();
  const passed = comparisons.filter((c) => !c.hasDiff).length;
  const failed = comparisons.filter((c) => c.hasDiff).length;

  const rows = comparisons
    .map(
      (c) => `
    <tr class="${c.hasDiff ? 'failed' : 'passed'}">
      <td><strong>${c.name}</strong></td>
      <td>
        ${c.base ? `<img src="${c.base}" alt="Baseline" loading="lazy" />` : '<em>No baseline</em>'}
      </td>
      <td>
        ${c.actual ? `<img src="${c.actual}" alt="Actual" loading="lazy" />` : '<em>No actual</em>'}
      </td>
      <td>
        ${c.diff ? `<img src="${c.diff}" alt="Diff" loading="lazy" class="diff-img" />` : '<span class="badge pass">✓ Match</span>'}
      </td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cypress Visual Regression Report</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      margin: 0;
      padding: 24px;
      background: #0f0f0f;
      color: #e0e0e0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #333;
    }
    h1 { margin: 0; font-size: 1.75rem; }
    .summary {
      display: flex;
      gap: 24px;
      font-size: 0.95rem;
    }
    .badge {
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 600;
    }
    .badge.pass { background: #1a472a; color: #4ade80; }
    .badge.fail { background: #4a1a1a; color: #f87171; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #1a1a1a;
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      padding: 16px;
      text-align: left;
      border-bottom: 1px solid #333;
      vertical-align: top;
    }
    th {
      background: #252525;
      font-weight: 600;
      color: #a0a0a0;
    }
    tr.failed { background: rgba(248, 113, 113, 0.08); }
    tr.passed:hover { background: #222; }
    td img {
      max-width: 100%;
      max-height: 400px;
      border-radius: 4px;
      border: 1px solid #333;
      display: block;
    }
    td img.diff-img { border-color: #f87171; }
    .meta { font-size: 0.85rem; color: #888; margin-top: 24px; }
    .slider-container {
      position: relative;
      max-width: 400px;
      overflow: hidden;
      border-radius: 4px;
    }
    .slider-container img {
      max-height: 350px;
    }
    @media (max-width: 768px) {
      th:nth-child(n), td:nth-child(n) { display: block; }
      tr { display: block; margin-bottom: 24px; border: 1px solid #333; border-radius: 8px; padding: 16px; }
      th { display: none; }
      td::before { content: attr(data-label); font-weight: 600; display: block; margin-bottom: 8px; color: #888; }
      td[data-label="Snapshot"]::before { content: "Snapshot"; }
      td[data-label="Baseline"]::before { content: "Baseline"; }
      td[data-label="Actual"]::before { content: "Actual"; }
      td[data-label="Diff"]::before { content: "Diff"; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🖼️ Cypress Visual Regression Report</h1>
    <div class="summary">
      <span class="badge pass">✓ ${passed} passed</span>
      <span class="badge fail">✗ ${failed} failed</span>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Snapshot</th>
        <th>Baseline</th>
        <th>Actual</th>
        <th>Diff</th>
      </tr>
    </thead>
    <tbody>${rows}
    </tbody>
  </table>
  <p class="meta">Generated: ${timestamp} | Run <code>npm run cy:report</code> to regenerate</p>
</body>
</html>`;
}

function main() {
  const comparisons = collectComparisons();
  if (comparisons.length === 0) {
    console.log('No snapshots found. Run "npm run cy:run" or "npm run cy:run:base" first.');
    process.exit(1);
  }
  const html = generateHtml(comparisons);
  fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
  console.log(`Report generated: ${OUTPUT_FILE}`);
}

main();
