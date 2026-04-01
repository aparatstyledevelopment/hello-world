/**
 * Investor Care OS - Investors List Page
 *
 * Displays a filterable, sortable table of all investors with key metrics.
 * Rows are clickable to navigate to the individual investor profile.
 * Uses ic- prefix classes and event delegation for efficient DOM handling.
 */

import {
  investors,
  contacts,
  investorStates,
  signals,
  actions,
  teamMembers,
} from '../data/mock-data.js';

import {
  formatPercent,
  formatTrend,
  daysSince,
  renderSparkline,
  escapeHtml,
  getUrgencyClass,
} from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INVESTOR_TYPES = [
  { key: 'all', label: 'All types' },
  { key: 'foreign_institution', label: 'Foreign institution' },
  { key: 'swedish_pension', label: 'Swedish pension' },
  { key: 'holding_company', label: 'Holding company' },
  { key: 'retail', label: 'Retail' },
];

const PRIORITY_TIERS = [
  { key: 'all', label: 'All tiers' },
  { key: '1', label: 'Tier 1' },
  { key: '2', label: 'Tier 2' },
  { key: '3', label: 'Tier 3' },
];

const TYPE_LABELS = {
  foreign_institution: 'Foreign institution',
  swedish_pension: 'Swedish pension',
  holding_company: 'Holding company',
  retail: 'Retail',
  institutional: 'Foreign institution',
  'index-fund': 'Foreign institution',
  'pension-fund': 'Swedish pension',
};

const TIER_CLASSES = {
  1: 'ic-badge--tier-1',
  2: 'ic-badge--tier-2',
  3: 'ic-badge--tier-3',
};

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

/**
 * Look up the primary contact for an investor.
 * Falls back to investor.primaryContact if the contacts array is unavailable.
 */
function getPrimaryContact(investor) {
  if (contacts && Array.isArray(contacts)) {
    const contact = contacts.find(
      (c) => c.investorId === investor.id && c.isPrimary,
    );
    if (contact) {
      return { name: contact.name, role: contact.role || '' };
    }
  }
  // Fallback: use the flat primaryContact field from mock data
  return { name: investor.primaryContact || '-', role: '' };
}

/**
 * Get the investor state / engagement info.
 * Falls back to investor.engagementStatus if investorStates is unavailable.
 */
function getInvestorState(investor) {
  if (investorStates && Array.isArray(investorStates)) {
    const state = investorStates.find((s) => s.investorId === investor.id);
    if (state) return state;
  }
  // Fallback: synthesise from investor fields
  return {
    momentum: investor.engagementStatus || 'unknown',
    momentumValue: null,
  };
}

/**
 * Count open signals for an investor.
 */
function countOpenSignals(investorId) {
  if (!signals || !Array.isArray(signals)) {
    // Fallback to investor field
    const inv = investors.find((i) => i.id === investorId);
    return inv ? inv.openSignals : 0;
  }
  return signals.filter(
    (s) =>
      s.investorIds &&
      s.investorIds.includes(investorId) &&
      s.state !== 'resolved' &&
      s.state !== 'archived' &&
      s.state !== 'dismissed',
  ).length;
}

/**
 * Count open actions for an investor.
 */
function countOpenActions(investorId) {
  if (!actions || !Array.isArray(actions)) {
    const inv = investors.find((i) => i.id === investorId);
    return inv ? inv.openActions : 0;
  }
  return actions.filter(
    (a) =>
      a.investorIds &&
      a.investorIds.includes(investorId) &&
      a.status !== 'completed' &&
      a.status !== 'cancelled',
  ).length;
}

// ---------------------------------------------------------------------------
// Freshness helpers
// ---------------------------------------------------------------------------

function getInteractionFreshness(lastInteraction) {
  if (!lastInteraction) return { class: 'ic-freshness--stale', label: 'No data' };
  const days = daysSince(lastInteraction);
  if (days <= 7) return { class: 'ic-freshness--fresh', label: `${days}d ago`, days };
  if (days <= 30) return { class: 'ic-freshness--aging', label: `${days}d ago`, days };
  return { class: 'ic-freshness--stale', label: `${days}d ago`, days };
}

function getMomentumIndicator(state) {
  const val = state.momentumValue;
  if (val === null || val === undefined) {
    // Map text status to a display
    const status = state.momentum;
    const colorMap = {
      active: '#059669',
      monitoring: '#d97706',
      passive: '#94a3b8',
      'at-risk': '#dc2626',
      new: '#3b82f6',
      inactive: '#94a3b8',
    };
    const color = colorMap[status] || '#94a3b8';
    const label = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
    return `<span class="ic-freshness"><span class="ic-freshness__dot" style="background:${color}"></span> ${escapeHtml(label)}</span>`;
  }
  const color = val >= 70 ? '#059669' : val >= 40 ? '#d97706' : '#dc2626';
  return `<span class="ic-freshness"><span class="ic-freshness__dot" style="background:${color}"></span> ${val}</span>`;
}

// ---------------------------------------------------------------------------
// Sort & filter
// ---------------------------------------------------------------------------

function sortInvestors(list) {
  return [...list].sort((a, b) => {
    if (a.priorityTier !== b.priorityTier) return a.priorityTier - b.priorityTier;
    return a.name.localeCompare(b.name);
  });
}

function filterInvestors(list, typeFilter, tierFilter) {
  let filtered = list;
  if (typeFilter !== 'all') {
    filtered = filtered.filter((inv) => {
      // Match against both the canonical type and mapped type
      return inv.type === typeFilter || TYPE_LABELS[inv.type] === TYPE_LABELS[typeFilter];
    });
  }
  if (tierFilter !== 'all') {
    filtered = filtered.filter((inv) => String(inv.priorityTier) === tierFilter);
  }
  return filtered;
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function renderFilters(activeType, activeTier) {
  const typeOptions = INVESTOR_TYPES.map(
    (t) =>
      `<option value="${t.key}"${t.key === activeType ? ' selected' : ''}>${escapeHtml(t.label)}</option>`,
  ).join('');

  const tierOptions = PRIORITY_TIERS.map(
    (t) =>
      `<option value="${t.key}"${t.key === activeTier ? ' selected' : ''}>${escapeHtml(t.label)}</option>`,
  ).join('');

  return `
    <div class="ic-filters">
      <select class="ic-filter" id="ic-type-filter" aria-label="Filter by investor type">
        ${typeOptions}
      </select>
      <select class="ic-filter" id="ic-tier-filter" aria-label="Filter by priority tier">
        ${tierOptions}
      </select>
    </div>
  `;
}

function renderTableRow(inv) {
  const contact = getPrimaryContact(inv);
  const state = getInvestorState(inv);
  const openSigs = countOpenSignals(inv.id);
  const openActs = countOpenActions(inv.id);
  const freshness = getInteractionFreshness(inv.lastInteraction);
  const typeLabel = TYPE_LABELS[inv.type] || inv.type;
  const tierClass = TIER_CLASSES[inv.priorityTier] || 'ic-badge--tier-3';

  // Determine row urgency based on open signals
  let rowUrgencyClass = '';
  if (openSigs > 0) {
    // Check if any signal is critical/high
    const investorSignals = (signals || []).filter(
      (s) => s.investorIds && s.investorIds.includes(inv.id) && s.state !== 'resolved',
    );
    const hasCritical = investorSignals.some((s) => s.urgency === 'critical');
    const hasHigh = investorSignals.some((s) => s.urgency === 'high');
    if (hasCritical || hasHigh) {
      rowUrgencyClass = ' ic-table__row--urgency-high';
    } else {
      rowUrgencyClass = ' ic-table__row--urgency-medium';
    }
  }

  const contactDisplay = contact.role
    ? `${escapeHtml(contact.name)} <span class="ic-text-secondary">${escapeHtml(contact.role)}</span>`
    : escapeHtml(contact.name);

  return `
    <tr class="ic-table__row${rowUrgencyClass}" data-investor-id="${inv.id}" tabindex="0" role="link" aria-label="View ${escapeHtml(inv.name)}">
      <td class="ic-table__cell"><a href="#/investors/${inv.id}" class="ic-table__link">${escapeHtml(inv.name)}</a></td>
      <td class="ic-table__cell"><span class="ic-badge ic-badge--type">${escapeHtml(typeLabel)}</span></td>
      <td class="ic-table__cell">${formatPercent(inv.holdingPercent)}</td>
      <td class="ic-table__cell"><span class="ic-sparkline">${renderSparkline(inv.holdingHistory, 80, 24)}</span></td>
      <td class="ic-table__cell"><span class="ic-badge ${tierClass}">Tier ${inv.priorityTier}</span></td>
      <td class="ic-table__cell">${contactDisplay}</td>
      <td class="ic-table__cell"><span class="${freshness.class}">${escapeHtml(freshness.label)}</span></td>
      <td class="ic-table__cell">${getMomentumIndicator(state)}</td>
      <td class="ic-table__cell">${openSigs > 0 ? `<span class="ic-badge ic-badge--urgency-high">${openSigs}</span>` : `<span class="ic-text-secondary">0</span>`}</td>
      <td class="ic-table__cell"><span class="ic-text-secondary">${openActs}</span></td>
    </tr>
  `;
}

function renderTable(list) {
  if (list.length === 0) {
    return `
      <div class="ic-placeholder">
        <div class="ic-placeholder__icon">&#128203;</div>
        <div class="ic-placeholder__title">No investors found</div>
        <div class="ic-placeholder__text">No investors match the selected filters. Try adjusting your criteria.</div>
      </div>
    `;
  }

  const rows = list.map(renderTableRow).join('\n');
  return `
    <table class="ic-table" role="grid">
      <thead>
        <tr>
          <th class="ic-table__th">Name</th>
          <th class="ic-table__th">Type</th>
          <th class="ic-table__th">Holding %</th>
          <th class="ic-table__th">Trend</th>
          <th class="ic-table__th">Priority</th>
          <th class="ic-table__th">Primary Contact</th>
          <th class="ic-table__th">Last Interaction</th>
          <th class="ic-table__th">Engagement</th>
          <th class="ic-table__th">Open Signals</th>
          <th class="ic-table__th">Open Actions</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Render the Investors list page into the given container.
 * Uses event delegation for row clicks and filter changes.
 *
 * @param {HTMLElement} container - Target DOM element
 */
export function renderInvestorsList(container) {
  let typeFilter = 'all';
  let tierFilter = 'all';

  function render() {
    const filtered = filterInvestors(investors, typeFilter, tierFilter);
    const sorted = sortInvestors(filtered);

    const html = `
      <div class="ic-page">
        <div class="ic-page__header">
          <div>
            <h1 class="ic-page__title">Investors</h1>
            <span class="ic-page__subtitle">${sorted.length} investor${sorted.length !== 1 ? 's' : ''} total</span>
          </div>
        </div>

        ${renderFilters(typeFilter, tierFilter)}

        ${renderTable(sorted)}
      </div>
    `;

    container.innerHTML = html;
  }

  // Initial render
  render();

  // ---------------------------------------------------------------------------
  // Event delegation - single listener on container
  // ---------------------------------------------------------------------------

  container.addEventListener('change', (e) => {
    const target = e.target;
    if (target.id === 'ic-type-filter') {
      typeFilter = target.value;
      render();
    } else if (target.id === 'ic-tier-filter') {
      tierFilter = target.value;
      render();
    }
  });

  container.addEventListener('click', (e) => {
    // Find the closest table row with an investor id
    const row = e.target.closest('tr[data-investor-id]');
    if (row) {
      const id = row.dataset.investorId;
      window.location.hash = `#/investors/${id}`;
    }
  });

  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const row = e.target.closest('tr[data-investor-id]');
      if (row) {
        e.preventDefault();
        const id = row.dataset.investorId;
        window.location.hash = `#/investors/${id}`;
      }
    }
  });
}
