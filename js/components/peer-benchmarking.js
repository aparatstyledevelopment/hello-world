/**
 * Investor Care OS - Peer Benchmarking
 *
 * Compares investor engagement and ownership patterns against sector peers.
 * Part of blueprint section 11.4 for Swedish large-cap IR teams.
 */

import { investors, investorStates, marketIntelligence } from '../data/mock-data.js';
import { escapeHtml, formatPercent, renderSparkline } from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Mock peer data (prototype - realistic sector comparisons)
// ---------------------------------------------------------------------------

const peerCompanies = [
  { name: 'Our Company', ownership: 18.7, topHolderConcentration: 40, avgEngagement: 3.2, baseStability: 78, foreignShare: 42, domesticShare: 38, retailShare: 8 },
  { name: 'Competitor AB', ownership: 22.1, topHolderConcentration: 48, avgEngagement: 2.8, baseStability: 72, foreignShare: 51, domesticShare: 30, retailShare: 12 },
  { name: 'Beta Corp', ownership: 19.5, topHolderConcentration: 35, avgEngagement: 3.5, baseStability: 82, foreignShare: 38, domesticShare: 42, retailShare: 10 },
  { name: 'Nordic Industries', ownership: 15.2, topHolderConcentration: 52, avgEngagement: 2.1, baseStability: 68, foreignShare: 55, domesticShare: 25, retailShare: 15 },
  { name: 'Sector Average', ownership: 18.9, topHolderConcentration: 44, avgEngagement: 2.9, baseStability: 75, foreignShare: 47, domesticShare: 34, retailShare: 11 },
];

const ownershipOverlap = [
  {
    investor: 'BlackRock',
    holdings: [
      { company: 'Our Company', pct: 3.1 },
      { company: 'Competitor AB', pct: 2.8 },
      { company: 'Beta Corp', pct: 3.5 },
    ],
  },
  {
    investor: 'Vanguard',
    holdings: [
      { company: 'Our Company', pct: 2.5 },
      { company: 'Competitor AB', pct: 2.2 },
      { company: 'Beta Corp', pct: 2.8 },
      { company: 'Nordic Industries', pct: 2.0 },
    ],
  },
  {
    investor: 'Allianz',
    holdings: [
      { company: 'Our Company', pct: 1.4 },
      { company: 'Nordic Industries', pct: 1.9 },
    ],
  },
];

const overlapSummaries = [
  '3 of our top 10 investors also hold Competitor AB',
  '3 of our top 10 investors also hold Beta Corp',
  '2 of our top 10 investors also hold Nordic Industries',
];

const keyInsights = [
  { text: 'Our engagement intensity (3.2) is above sector average (2.9), ranking 2nd among peers', sentiment: 'positive' },
  { text: 'Shareholder base stability (78%) is above average, indicating good investor retention', sentiment: 'positive' },
  { text: 'Foreign institutional ownership (42%) is below sector average (47%), suggesting room for international outreach', sentiment: 'warning' },
  { text: 'Top 3 holder concentration (40%) is the lowest among peers, indicating a well-diversified base', sentiment: 'positive' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SECTOR_AVG = peerCompanies.find((p) => p.name === 'Sector Average');

function isOurCompany(name) {
  return name === 'Our Company';
}

function isSectorAverage(name) {
  return name === 'Sector Average';
}

function rowClass(name) {
  const classes = ['ic-peer-row'];
  if (isOurCompany(name)) classes.push('ic-peer-row--highlight');
  if (isSectorAverage(name)) classes.push('ic-peer-row--average');
  return classes.join(' ');
}

function comparisonIndicator(value, sectorValue) {
  if (value > sectorValue) {
    return '<span class="ic-indicator ic-indicator--above">&#9650; Above avg</span>';
  } else if (value < sectorValue) {
    return '<span class="ic-indicator ic-indicator--below">&#9660; Below avg</span>';
  }
  return '<span class="ic-indicator ic-indicator--equal">&#9644; At avg</span>';
}

function horizontalBar(value, maxValue, colorClass) {
  const widthPct = Math.min((value / maxValue) * 100, 100);
  return `<div class="ic-bar-track">
    <div class="ic-bar-fill ${colorClass}" style="width: ${widthPct}%"></div>
  </div>`;
}

function stackedBar(foreign, domestic, retail) {
  const other = Math.max(0, 100 - foreign - domestic - retail);
  return `<div class="ic-stacked-bar">
    <div class="ic-stacked-segment ic-stacked-segment--foreign" style="width: ${foreign}%" title="Foreign institutional: ${foreign}%"></div>
    <div class="ic-stacked-segment ic-stacked-segment--domestic" style="width: ${domestic}%" title="Domestic institutional: ${domestic}%"></div>
    <div class="ic-stacked-segment ic-stacked-segment--retail" style="width: ${retail}%" title="Retail: ${retail}%"></div>
    <div class="ic-stacked-segment ic-stacked-segment--other" style="width: ${other}%" title="Other: ${other}%"></div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

function renderOverlapSection() {
  const peerNames = ['Our Company', 'Competitor AB', 'Beta Corp', 'Nordic Industries'];

  const headerCells = peerNames.map((n) =>
    `<th class="${isOurCompany(n) ? 'ic-overlap-th--highlight' : ''}">${escapeHtml(n)}</th>`
  ).join('');

  const bodyRows = ownershipOverlap.map((row) => {
    const cells = peerNames.map((peerName) => {
      const holding = row.holdings.find((h) => h.company === peerName);
      if (holding) {
        return `<td class="${isOurCompany(peerName) ? 'ic-overlap-td--highlight' : ''}">${holding.pct}%</td>`;
      }
      return `<td class="${isOurCompany(peerName) ? 'ic-overlap-td--highlight' : ''}">—</td>`;
    }).join('');
    return `<tr><td class="ic-overlap-investor">${escapeHtml(row.investor)}</td>${cells}</tr>`;
  }).join('');

  const summaryItems = overlapSummaries.map((s) =>
    `<li class="ic-overlap-summary-item">${escapeHtml(s)}</li>`
  ).join('');

  return `
    <section class="ic-section ic-peer-section">
      <h3 class="ic-section-title">Ownership overlap</h3>
      <div class="ic-table-wrap">
        <table class="ic-table ic-overlap-table">
          <thead>
            <tr>
              <th>Investor</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </div>
      <ul class="ic-overlap-summary">${summaryItems}</ul>
    </section>`;
}

function renderEngagementSection() {
  const maxVal = Math.max(...peerCompanies.map((p) => p.avgEngagement));
  const rows = peerCompanies.map((p) => {
    const barColor = isOurCompany(p.name) ? 'ic-bar-fill--primary' : isSectorAverage(p.name) ? 'ic-bar-fill--muted' : 'ic-bar-fill--default';
    const indicator = isOurCompany(p.name) ? comparisonIndicator(p.avgEngagement, SECTOR_AVG.avgEngagement) : '';
    return `
      <div class="${rowClass(p.name)}">
        <div class="ic-peer-label">${escapeHtml(p.name)}</div>
        <div class="ic-peer-bar-cell">
          ${horizontalBar(p.avgEngagement, maxVal * 1.15, barColor)}
        </div>
        <div class="ic-peer-value">${p.avgEngagement} ${indicator}</div>
      </div>`;
  }).join('');

  return `
    <section class="ic-section ic-peer-section">
      <h3 class="ic-section-title">Engagement intensity comparison</h3>
      <p class="ic-section-subtitle">Avg interactions per investor per half-year</p>
      <div class="ic-peer-chart">${rows}</div>
    </section>`;
}

function renderStabilitySection() {
  const maxVal = 100;
  const rows = peerCompanies.map((p) => {
    const barColor = isOurCompany(p.name) ? 'ic-bar-fill--primary' : isSectorAverage(p.name) ? 'ic-bar-fill--muted' : 'ic-bar-fill--default';
    const indicator = isOurCompany(p.name) ? comparisonIndicator(p.baseStability, SECTOR_AVG.baseStability) : '';
    return `
      <div class="${rowClass(p.name)}">
        <div class="ic-peer-label">${escapeHtml(p.name)}</div>
        <div class="ic-peer-bar-cell">
          ${horizontalBar(p.baseStability, maxVal, barColor)}
        </div>
        <div class="ic-peer-value">${p.baseStability}% ${indicator}</div>
      </div>`;
  }).join('');

  return `
    <section class="ic-section ic-peer-section">
      <h3 class="ic-section-title">Shareholder base stability</h3>
      <p class="ic-section-subtitle">% of holders maintained over 12 months</p>
      <div class="ic-peer-chart">${rows}</div>
    </section>`;
}

function renderOwnershipStructureSection() {
  const rows = peerCompanies.map((p) => {
    const other = Math.max(0, 100 - p.foreignShare - p.domesticShare - p.retailShare);
    return `
      <div class="${rowClass(p.name)}">
        <div class="ic-peer-label">${escapeHtml(p.name)}</div>
        <div class="ic-peer-bar-cell">
          ${stackedBar(p.foreignShare, p.domesticShare, p.retailShare)}
        </div>
        <div class="ic-peer-value-sm">
          <span class="ic-legend-dot ic-legend-dot--foreign"></span>${p.foreignShare}%
          <span class="ic-legend-dot ic-legend-dot--domestic"></span>${p.domesticShare}%
          <span class="ic-legend-dot ic-legend-dot--retail"></span>${p.retailShare}%
          <span class="ic-legend-dot ic-legend-dot--other"></span>${other}%
        </div>
      </div>`;
  }).join('');

  return `
    <section class="ic-section ic-peer-section">
      <h3 class="ic-section-title">Ownership structure comparison</h3>
      <div class="ic-stacked-legend">
        <span class="ic-legend-item"><span class="ic-legend-dot ic-legend-dot--foreign"></span>Foreign institutional</span>
        <span class="ic-legend-item"><span class="ic-legend-dot ic-legend-dot--domestic"></span>Domestic institutional</span>
        <span class="ic-legend-item"><span class="ic-legend-dot ic-legend-dot--retail"></span>Retail</span>
        <span class="ic-legend-item"><span class="ic-legend-dot ic-legend-dot--other"></span>Other</span>
      </div>
      <div class="ic-peer-chart">${rows}</div>
    </section>`;
}

function renderInsightsSection() {
  const items = keyInsights.map((insight) =>
    `<li class="ic-insight-item ic-insight-item--${insight.sentiment}">
      <span class="ic-insight-icon">${insight.sentiment === 'positive' ? '&#10003;' : '&#9888;'}</span>
      <span class="ic-insight-text">${escapeHtml(insight.text)}</span>
    </li>`
  ).join('');

  return `
    <section class="ic-section ic-peer-section">
      <h3 class="ic-section-title">Key insights</h3>
      <ul class="ic-insights-list">${items}</ul>
    </section>`;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function injectStyles() {
  if (document.getElementById('ic-peer-benchmarking-styles')) return;

  const style = document.createElement('style');
  style.id = 'ic-peer-benchmarking-styles';
  style.textContent = `
    /* ---- Peer Benchmarking Layout ---- */

    .ic-peer-header {
      margin-bottom: 2rem;
    }

    .ic-peer-header h2 {
      margin: 0 0 0.25rem;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .ic-peer-header p {
      margin: 0;
      color: var(--color-text-secondary, #6b7280);
      font-size: 0.95rem;
    }

    .ic-peer-section {
      margin-bottom: 2rem;
      padding: 1.25rem;
      background: var(--color-surface, #fff);
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 8px;
    }

    .ic-section-subtitle {
      margin: 0 0 1rem;
      color: var(--color-text-secondary, #6b7280);
      font-size: 0.85rem;
    }

    /* ---- Overlap Table ---- */

    .ic-overlap-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .ic-overlap-table th,
    .ic-overlap-table td {
      padding: 0.5rem 0.75rem;
      text-align: center;
      border-bottom: 1px solid var(--color-border, #e5e7eb);
    }

    .ic-overlap-table th {
      font-weight: 600;
      background: var(--color-surface-alt, #f9fafb);
    }

    .ic-overlap-investor {
      text-align: left !important;
      font-weight: 500;
    }

    .ic-overlap-th--highlight,
    .ic-overlap-td--highlight {
      background: var(--color-primary-light, #eff6ff) !important;
    }

    .ic-overlap-summary {
      margin: 1rem 0 0;
      padding: 0;
      list-style: none;
    }

    .ic-overlap-summary-item {
      padding: 0.35rem 0;
      font-size: 0.85rem;
      color: var(--color-text-secondary, #6b7280);
    }

    .ic-overlap-summary-item::before {
      content: '\\2022';
      margin-right: 0.5rem;
      color: var(--color-primary, #2563eb);
    }

    /* ---- Horizontal Bar Chart ---- */

    .ic-peer-chart {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .ic-peer-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
    }

    .ic-peer-row--highlight {
      background: var(--color-primary-light, #eff6ff);
      font-weight: 600;
    }

    .ic-peer-row--average {
      border-top: 1px dashed var(--color-border, #d1d5db);
      margin-top: 0.25rem;
      padding-top: 0.75rem;
      font-style: italic;
    }

    .ic-peer-label {
      min-width: 140px;
      flex-shrink: 0;
      font-size: 0.875rem;
    }

    .ic-peer-bar-cell {
      flex: 1;
      min-width: 0;
    }

    .ic-peer-value {
      min-width: 130px;
      flex-shrink: 0;
      text-align: right;
      font-size: 0.875rem;
      white-space: nowrap;
    }

    .ic-peer-value-sm {
      min-width: 220px;
      flex-shrink: 0;
      text-align: right;
      font-size: 0.75rem;
      white-space: nowrap;
    }

    /* ---- Bar track & fill ---- */

    .ic-bar-track {
      height: 22px;
      background: var(--color-surface-alt, #f3f4f6);
      border-radius: 4px;
      overflow: hidden;
    }

    .ic-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease;
    }

    .ic-bar-fill--primary {
      background: var(--color-primary, #2563eb);
    }

    .ic-bar-fill--default {
      background: var(--color-text-secondary, #9ca3af);
    }

    .ic-bar-fill--muted {
      background: var(--color-border, #d1d5db);
    }

    /* ---- Stacked Bar ---- */

    .ic-stacked-bar {
      display: flex;
      height: 22px;
      border-radius: 4px;
      overflow: hidden;
    }

    .ic-stacked-segment {
      height: 100%;
      transition: width 0.4s ease;
    }

    .ic-stacked-segment--foreign  { background: var(--color-primary, #2563eb); }
    .ic-stacked-segment--domestic { background: #10b981; }
    .ic-stacked-segment--retail   { background: #f59e0b; }
    .ic-stacked-segment--other    { background: var(--color-border, #d1d5db); }

    .ic-stacked-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.8rem;
      color: var(--color-text-secondary, #6b7280);
    }

    .ic-legend-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .ic-legend-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 2px;
      margin-right: 0.2rem;
    }

    .ic-legend-dot--foreign  { background: var(--color-primary, #2563eb); }
    .ic-legend-dot--domestic { background: #10b981; }
    .ic-legend-dot--retail   { background: #f59e0b; }
    .ic-legend-dot--other    { background: var(--color-border, #d1d5db); }

    /* ---- Comparison Indicators ---- */

    .ic-indicator {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      margin-left: 0.35rem;
    }

    .ic-indicator--above {
      color: #047857;
      background: #d1fae5;
    }

    .ic-indicator--below {
      color: #b45309;
      background: #fef3c7;
    }

    .ic-indicator--equal {
      color: #6b7280;
      background: #f3f4f6;
    }

    /* ---- Insights ---- */

    .ic-insights-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .ic-insight-item {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      padding: 0.6rem 0;
      font-size: 0.9rem;
      line-height: 1.45;
      border-bottom: 1px solid var(--color-border, #f3f4f6);
    }

    .ic-insight-item:last-child {
      border-bottom: none;
    }

    .ic-insight-icon {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 0.75rem;
      margin-top: 0.1rem;
    }

    .ic-insight-item--positive .ic-insight-icon {
      color: #047857;
      background: #d1fae5;
    }

    .ic-insight-item--warning .ic-insight-icon {
      color: #b45309;
      background: #fef3c7;
    }
  `;

  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Main render
// ---------------------------------------------------------------------------

export function renderPeerBenchmarking(container) {
  injectStyles();

  container.innerHTML = `
    <div class="ic-peer-benchmarking">
      <div class="ic-peer-header">
        <h2>Peer benchmarking</h2>
        <p>Compare investor engagement and ownership patterns against sector peers</p>
      </div>
      ${renderOverlapSection()}
      ${renderEngagementSection()}
      ${renderStabilitySection()}
      ${renderOwnershipStructureSection()}
      ${renderInsightsSection()}
    </div>
  `;
}
