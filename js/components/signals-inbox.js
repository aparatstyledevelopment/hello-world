/**
 * Investor Care OS - Signals Inbox Component
 *
 * Dense work queue for processing investor signals. Provides a filterable,
 * sortable table with inline actions for triage workflows.
 */

import {
  signals,
  investors,
  contacts,
  teamMembers,
} from '../data/mock-data.js';

import {
  formatDateRelative,
  daysSince,
  truncate,
  escapeHtml,
  renderTemplate,
  showToast,
} from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Constants & label maps
// ---------------------------------------------------------------------------

const URGENCY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const URGENCY_COLORS = {
  critical: '#dc2626',
  high: '#dc2626',
  medium: '#f59e0b',
  low: '#10b981',
};

const STATE_LABELS = {
  new: 'New',
  reviewing: 'Reviewing',
  confirmed: 'Confirmed',
  action_created: 'Action Created',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

const URGENCY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const SIGNAL_TYPE_LABELS = {
  retention_risk: 'Retention Risk',
  influence_opportunity: 'Influence Opportunity',
  governance_management: 'Governance & Management',
  information_gap: 'Information Gap',
  relationship_maintenance: 'Relationship Maintenance',
  sentiment_shift: 'Sentiment Shift',
  engagement_drop: 'Engagement Drop',
  ownership_change: 'Ownership Change',
  activist_approach: 'Activist Approach',
  peer_comparison: 'Peer Comparison',
  regulatory_flag: 'Regulatory Flag',
  meeting_request: 'Meeting Request',
  esg_concern: 'ESG Concern',
};

const DISMISS_REASONS = [
  { key: 'false_positive', label: 'False positive' },
  { key: 'already_handled', label: 'Already handled' },
  { key: 'not_actionable', label: 'Not actionable' },
  { key: 'duplicate', label: 'Duplicate' },
  { key: 'low_priority', label: 'Low priority' },
];

// ---------------------------------------------------------------------------
// Closure state
// ---------------------------------------------------------------------------

let filterState = {
  state: '',
  urgency: '',
  signalType: '',
  investorId: '',
  ownerId: '',
};

let sortColumn = 'urgency';
let sortAsc = true;
let dismissingSignalId = null; // tracks which row has the dismiss selector open

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

function investorName(id) {
  const inv = investors.find((i) => i.id === id);
  return inv ? inv.name : 'Unknown';
}

function contactName(id) {
  const c = contacts.find((ct) => ct.id === id);
  if (!c) return '\u2014';
  return c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '\u2014';
}

function teamMemberName(id) {
  const m = teamMembers.find((t) => t.id === id);
  if (!m) return '\u2014';
  return m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || '\u2014';
}

function signalTypeLabel(type) {
  return (
    SIGNAL_TYPE_LABELS[type] ||
    type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// ---------------------------------------------------------------------------
// Filtering & sorting
// ---------------------------------------------------------------------------

function applyFilters(list) {
  return list.filter((s) => {
    if (filterState.state && s.state !== filterState.state) return false;
    if (filterState.urgency && s.urgency !== filterState.urgency) return false;
    if (filterState.signalType && s.type !== filterState.signalType) return false;
    if (filterState.investorId && s.investorId !== filterState.investorId) return false;
    if (filterState.ownerId && s.ownerId !== filterState.ownerId) return false;
    return true;
  });
}

function applySort(list) {
  const copy = [...list];
  copy.sort((a, b) => {
    let va, vb;
    switch (sortColumn) {
      case 'urgency':
        va = URGENCY_ORDER[a.urgency] ?? 99;
        vb = URGENCY_ORDER[b.urgency] ?? 99;
        break;
      case 'type':
        va = signalTypeLabel(a.type);
        vb = signalTypeLabel(b.type);
        break;
      case 'investor':
        va = investorName(a.investorId);
        vb = investorName(b.investorId);
        break;
      case 'contact':
        va = contactName(a.contactId);
        vb = contactName(b.contactId);
        break;
      case 'summary':
        va = a.title || '';
        vb = b.title || '';
        break;
      case 'confidence':
        va = a.confidence === 'high' ? 3 : a.confidence === 'medium' ? 2 : 1;
        vb = b.confidence === 'high' ? 3 : b.confidence === 'medium' ? 2 : 1;
        break;
      case 'age':
        va = a.createdAt || '';
        vb = b.createdAt || '';
        // Older first when ascending
        return sortAsc
          ? (va < vb ? -1 : va > vb ? 1 : 0)
          : (va > vb ? -1 : va < vb ? 1 : 0);
      case 'state':
        va = STATE_LABELS[a.state] || a.state;
        vb = STATE_LABELS[b.state] || b.state;
        break;
      case 'owner':
        va = teamMemberName(a.ownerId);
        vb = teamMemberName(b.ownerId);
        break;
      default:
        va = '';
        vb = '';
    }
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });
  return copy;
}

// ---------------------------------------------------------------------------
// Sort indicator
// ---------------------------------------------------------------------------

function sortIndicator(col) {
  if (sortColumn !== col) return '';
  return sortAsc ? ' \u25B2' : ' \u25BC';
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

function renderFilterBar() {
  // State options
  const stateOptions = Object.entries(STATE_LABELS)
    .map(
      ([key, label]) =>
        `<option value="${key}" ${filterState.state === key ? 'selected' : ''}>${escapeHtml(label)}</option>`,
    )
    .join('');

  // Urgency options
  const urgencyOptions = Object.entries(URGENCY_LABELS)
    .map(
      ([key, label]) =>
        `<option value="${key}" ${filterState.urgency === key ? 'selected' : ''}>${escapeHtml(label)}</option>`,
    )
    .join('');

  // Signal type options
  const typeOptions = Object.entries(SIGNAL_TYPE_LABELS)
    .map(
      ([key, label]) =>
        `<option value="${key}" ${filterState.signalType === key ? 'selected' : ''}>${escapeHtml(label)}</option>`,
    )
    .join('');

  // Investor options
  const investorOptions = investors
    .map(
      (inv) =>
        `<option value="${inv.id}" ${filterState.investorId === inv.id ? 'selected' : ''}>${escapeHtml(inv.name)}</option>`,
    )
    .join('');

  // Owner options
  const ownerOptions = teamMembers
    .map((m) => {
      const name = m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim();
      return `<option value="${m.id}" ${filterState.ownerId === m.id ? 'selected' : ''}>${escapeHtml(name)}</option>`;
    })
    .join('');

  return `
    <div class="si-filter-bar">
      <label class="si-filter-group">
        <span class="si-filter-label">State</span>
        <select data-filter="state">
          <option value="">All States</option>
          ${stateOptions}
        </select>
      </label>

      <label class="si-filter-group">
        <span class="si-filter-label">Urgency</span>
        <select data-filter="urgency">
          <option value="">All Urgency</option>
          ${urgencyOptions}
        </select>
      </label>

      <label class="si-filter-group">
        <span class="si-filter-label">Signal Type</span>
        <select data-filter="signalType">
          <option value="">All Types</option>
          ${typeOptions}
        </select>
      </label>

      <label class="si-filter-group">
        <span class="si-filter-label">Investor</span>
        <select data-filter="investorId">
          <option value="">All Investors</option>
          ${investorOptions}
        </select>
      </label>

      <label class="si-filter-group">
        <span class="si-filter-label">Owner</span>
        <select data-filter="ownerId">
          <option value="">All Owners</option>
          ${ownerOptions}
        </select>
      </label>
    </div>`;
}

// ---------------------------------------------------------------------------
// Table rendering
// ---------------------------------------------------------------------------

function renderUrgencyCell(urgency) {
  const color = URGENCY_COLORS[urgency] || '#6b7280';
  const label = URGENCY_LABELS[urgency] || urgency;
  return `
    <td class="si-table__cell si-table__cell--urgency" style="border-left: 4px solid ${color};">
      <span class="si-urgency-badge" style="background-color: ${color}; color: #fff;">
        ${escapeHtml(label)}
      </span>
    </td>`;
}

function renderConfidenceBadge(level) {
  const cls =
    level === 'high'
      ? 'si-confidence--high'
      : level === 'medium'
        ? 'si-confidence--medium'
        : 'si-confidence--low';
  const label = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown';
  return `<span class="si-confidence-badge ${cls}">${escapeHtml(label)}</span>`;
}

function renderStateBadge(state) {
  const label = STATE_LABELS[state] || state;
  return `<span class="si-state-badge si-state--${escapeHtml(state)}">${escapeHtml(label)}</span>`;
}

function renderDismissSelector(signalId) {
  if (dismissingSignalId !== signalId) return '';
  const options = DISMISS_REASONS.map(
    (r) =>
      `<button class="si-dismiss-option" data-dismiss-signal="${escapeHtml(signalId)}" data-dismiss-reason="${r.key}" type="button">${escapeHtml(r.label)}</button>`,
  ).join('');
  return `
    <div class="si-dismiss-selector">
      <div class="si-dismiss-selector__header">Dismiss reason:</div>
      ${options}
      <button class="si-dismiss-option si-dismiss-option--cancel" data-dismiss-cancel="${escapeHtml(signalId)}" type="button">Cancel</button>
    </div>`;
}

function renderRow(signal) {
  const invName = signal.investorId ? escapeHtml(investorName(signal.investorId)) : '\u2014';
  const ctcName = signal.contactId ? escapeHtml(contactName(signal.contactId)) : '\u2014';
  const summary = escapeHtml(truncate(signal.title || '', 60));
  const age = signal.createdAt ? formatDateRelative(signal.createdAt) : '\u2014';
  const ageDays = signal.createdAt ? daysSince(signal.createdAt) : 0;
  const owner = signal.ownerId ? escapeHtml(teamMemberName(signal.ownerId)) : '\u2014';
  const confidence = signal.confidence || 'medium';

  return `
    <tr class="si-table__row" data-signal-id="${escapeHtml(signal.id)}">
      ${renderUrgencyCell(signal.urgency)}
      <td class="si-table__cell">
        <span class="si-type-badge">${escapeHtml(signalTypeLabel(signal.type))}</span>
      </td>
      <td class="si-table__cell">${invName}</td>
      <td class="si-table__cell">${ctcName}</td>
      <td class="si-table__cell si-table__cell--summary" title="${escapeHtml(signal.title || '')}">${summary}</td>
      <td class="si-table__cell">${renderConfidenceBadge(confidence)}</td>
      <td class="si-table__cell si-table__cell--age" title="${ageDays} days">
        <time datetime="${escapeHtml(signal.createdAt || '')}">${escapeHtml(age)}</time>
      </td>
      <td class="si-table__cell">${renderStateBadge(signal.state)}</td>
      <td class="si-table__cell">${owner}</td>
      <td class="si-table__cell si-table__cell--actions">
        <div class="si-inline-actions">
          <button class="si-btn si-btn--review" data-action-review="${escapeHtml(signal.id)}" type="button" title="Start review">Review</button>
          <button class="si-btn si-btn--create" data-action-create="${escapeHtml(signal.id)}" type="button" title="Create action">Create action</button>
          <button class="si-btn si-btn--dismiss" data-action-dismiss="${escapeHtml(signal.id)}" type="button" title="Dismiss signal">Dismiss</button>
        </div>
        ${renderDismissSelector(signal.id)}
      </td>
    </tr>`;
}

function renderTable(filtered) {
  const sorted = applySort(filtered);

  const columns = [
    { key: 'urgency', label: 'Urgency' },
    { key: 'type', label: 'Type' },
    { key: 'investor', label: 'Investor' },
    { key: 'contact', label: 'Contact' },
    { key: 'summary', label: 'Summary' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'age', label: 'Age' },
    { key: 'state', label: 'State' },
    { key: 'owner', label: 'Owner' },
  ];

  const thead = columns
    .map(
      (c) =>
        `<th class="si-table__th si-sortable" data-sort="${c.key}">${escapeHtml(c.label)}${sortIndicator(c.key)}</th>`,
    )
    .join('');

  const rows = sorted.map(renderRow).join('');

  return `
    <div class="si-table-wrapper" role="region" aria-label="Signals table" tabindex="0">
      <table class="si-table" aria-describedby="si-heading">
        <thead class="si-table__head">
          <tr>
            ${thead}
            <th class="si-table__th">Actions</th>
          </tr>
        </thead>
        <tbody class="si-table__body">
          ${rows || '<tr><td colspan="10" class="si-table-empty">No signals match the current filters.</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

// ---------------------------------------------------------------------------
// Counts
// ---------------------------------------------------------------------------

function renderCounts(totalCount, filteredCount) {
  const isFiltered = filteredCount !== totalCount;
  return `
    <div class="si-counts">
      ${isFiltered
        ? `<span class="si-counts__filtered">Showing ${filteredCount} of ${totalCount} signals</span>`
        : `<span class="si-counts__total">${totalCount} signals</span>`
      }
    </div>`;
}

// ---------------------------------------------------------------------------
// Event delegation
// ---------------------------------------------------------------------------

function attachEvents(container) {
  container.addEventListener('click', (event) => {
    const target = event.target;

    // Sort column clicks
    const sortHeader = target.closest('.si-sortable');
    if (sortHeader) {
      event.preventDefault();
      const col = sortHeader.dataset.sort;
      if (sortColumn === col) {
        sortAsc = !sortAsc;
      } else {
        sortColumn = col;
        sortAsc = true;
      }
      renderSignalsInbox(container);
      return;
    }

    // Dismiss button - open selector
    const dismissBtn = target.closest('[data-action-dismiss]');
    if (dismissBtn) {
      event.preventDefault();
      event.stopPropagation();
      const signalId = dismissBtn.dataset.actionDismiss;
      dismissingSignalId = dismissingSignalId === signalId ? null : signalId;
      renderSignalsInbox(container);
      return;
    }

    // Dismiss reason selected
    const dismissOption = target.closest('[data-dismiss-signal]');
    if (dismissOption) {
      event.preventDefault();
      event.stopPropagation();
      const signalId = dismissOption.dataset.dismissSignal;
      const reason = dismissOption.dataset.dismissReason;
      const signal = signals.find((s) => s.id === signalId);
      if (signal) {
        signal.state = 'dismissed';
        signal.dismissReason = reason;
      }
      dismissingSignalId = null;
      showToast(`Signal dismissed: ${DISMISS_REASONS.find((r) => r.key === reason)?.label || reason}`, 'success');
      renderSignalsInbox(container);
      return;
    }

    // Cancel dismiss
    const dismissCancel = target.closest('[data-dismiss-cancel]');
    if (dismissCancel) {
      event.preventDefault();
      event.stopPropagation();
      dismissingSignalId = null;
      renderSignalsInbox(container);
      return;
    }

    // Review button
    const reviewBtn = target.closest('[data-action-review]');
    if (reviewBtn) {
      event.preventDefault();
      event.stopPropagation();
      const signalId = reviewBtn.dataset.actionReview;
      window.location.hash = `#/signals/${signalId}`;
      return;
    }

    // Create action button
    const createBtn = target.closest('[data-action-create]');
    if (createBtn) {
      event.preventDefault();
      event.stopPropagation();
      const signalId = createBtn.dataset.actionCreate;
      window.location.hash = `#/actions/new?signal=${signalId}`;
      return;
    }

    // Row click - navigate to signal detail
    const row = target.closest('.si-table__row');
    if (row && !target.closest('.si-inline-actions') && !target.closest('.si-dismiss-selector')) {
      const signalId = row.dataset.signalId;
      if (signalId) {
        window.location.hash = `#/signals/${signalId}`;
      }
      return;
    }
  });

  // Filter changes
  container.addEventListener('change', (event) => {
    const filterEl = event.target.closest('[data-filter]');
    if (filterEl) {
      const key = filterEl.dataset.filter;
      if (key in filterState) {
        filterState[key] = filterEl.value;
        renderSignalsInbox(container);
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Main render
// ---------------------------------------------------------------------------

/**
 * Render the Signals Inbox into the given container element.
 *
 * @param {HTMLElement} container - DOM element to render into
 */
export function renderSignalsInbox(container) {
  const filtered = applyFilters(signals);

  const html = `
    <section class="si-inbox" role="main">
      <header class="si-inbox__header">
        <h1 id="si-heading" class="si-inbox__title">Signals Inbox</h1>
        ${renderCounts(signals.length, filtered.length)}
      </header>
      ${renderFilterBar()}
      ${renderTable(filtered)}
    </section>`;

  renderTemplate(html, container);
  attachEvents(container);
}
