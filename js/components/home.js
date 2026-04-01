/**
 * Investor Care OS - Home Screen ("What to do next")
 *
 * Daily operating surface combining signals triage and upcoming actions
 * for Swedish large-cap IR teams.
 */

import {
  signals,
  actions,
  investors,
  contacts,
  teamMembers,
} from '../data/mock-data.js';

import {
  formatDate,
  formatDateRelative,
  daysSince,
  getUrgencyClass,
  getStateClass,
  truncate,
  escapeHtml,
} from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Constants & label maps
// ---------------------------------------------------------------------------

const CURRENT_DATE = new Date('2026-04-01');

const SIGNAL_TYPE_LABELS = {
  retention_risk: 'Retention Risk',
  influence_opportunity: 'Influence Opportunity',
  sentiment_shift: 'Sentiment Shift',
  engagement_drop: 'Engagement Drop',
  ownership_change: 'Ownership Change',
  activist_approach: 'Activist Approach',
  peer_comparison: 'Peer Comparison',
  regulatory_flag: 'Regulatory Flag',
  meeting_request: 'Meeting Request',
  esg_concern: 'ESG Concern',
};

const ACTION_TYPE_LABELS = {
  one_on_one_meeting: '1:1 Meeting',
  group_meeting: 'Group Meeting',
  roadshow: 'Roadshow',
  phone_call: 'Phone Call',
  email_outreach: 'Email Outreach',
  conference_attendance: 'Conference',
  site_visit: 'Site Visit',
  follow_up: 'Follow-up',
  report_distribution: 'Report Distribution',
  perception_study: 'Perception Study',
};

const ACTION_STATE_LABELS = {
  planned: 'Planned',
  preparing: 'Preparing',
  in_progress: 'In Progress',
  awaiting_logging: 'Awaiting Logging',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const ACTION_STATE_COLORS = {
  planned: '#6b7280',
  preparing: '#f59e0b',
  in_progress: '#3b82f6',
  awaiting_logging: '#8b5cf6',
  completed: '#10b981',
  cancelled: '#9ca3af',
};

const URGENCY_COLORS = {
  critical: '#dc2626',
  high: '#dc2626',
  medium: '#f59e0b',
  low: '#10b981',
};

const URGENCY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

function findInvestor(id) {
  return investors.find((inv) => inv.id === id);
}

function findContact(id) {
  return contacts.find((c) => c.id === id);
}

function findTeamMember(id) {
  return teamMembers.find((tm) => tm.id === id);
}

function investorName(id) {
  const inv = findInvestor(id);
  return inv ? escapeHtml(inv.name) : 'Unknown';
}

function contactName(id) {
  const c = findContact(id);
  return c ? escapeHtml(c.name) : 'Unknown';
}

function teamMemberName(id) {
  const tm = findTeamMember(id);
  return tm ? escapeHtml(tm.name) : 'Unknown';
}

function signalTypeLabel(type) {
  return SIGNAL_TYPE_LABELS[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function actionTypeLabel(type) {
  return ACTION_TYPE_LABELS[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Date helpers (using fixed current date)
// ---------------------------------------------------------------------------

function isOverdue(dueDateStr) {
  return new Date(dueDateStr) < CURRENT_DATE;
}

function isDueThisWeek(dueDateStr) {
  const due = new Date(dueDateStr);
  const weekEnd = new Date(CURRENT_DATE);
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
  return due >= CURRENT_DATE && due <= weekEnd;
}

// ---------------------------------------------------------------------------
// Summary stats
// ---------------------------------------------------------------------------

function computeStats() {
  const newSignals = signals.filter(
    (s) => s.state === 'new' || s.state === 'reviewing',
  ).length;

  const activeActionStates = ['planned', 'preparing', 'in_progress'];
  const activeActions = actions.filter((a) => activeActionStates.includes(a.state));
  const dueThisWeek = activeActions.filter((a) => a.dueDate && isDueThisWeek(a.dueDate)).length;

  const awaitingLogging = actions.filter((a) => a.state === 'awaiting_logging').length;

  const activeInvestorIds = new Set([
    ...signals
      .filter((s) => s.state !== 'archived' && s.state !== 'resolved')
      .map((s) => s.investorId),
    ...actions
      .filter((a) => a.state !== 'completed' && a.state !== 'cancelled')
      .map((a) => a.investorId),
  ]);
  const totalActiveInvestors = activeInvestorIds.size;

  return { newSignals, dueThisWeek, awaitingLogging, totalActiveInvestors };
}

// ---------------------------------------------------------------------------
// HTML renderers
// ---------------------------------------------------------------------------

function renderStatsBar(stats) {
  return `
    <section class="ic-stats-bar" aria-label="Summary statistics">
      <div class="ic-stats-bar__item">
        <span class="ic-stats-bar__value">${stats.newSignals}</span>
        <span class="ic-stats-bar__label">New signals</span>
      </div>
      <div class="ic-stats-bar__item">
        <span class="ic-stats-bar__value">${stats.dueThisWeek}</span>
        <span class="ic-stats-bar__label">Due this week</span>
      </div>
      <div class="ic-stats-bar__item">
        <span class="ic-stats-bar__value">${stats.awaitingLogging}</span>
        <span class="ic-stats-bar__label">Awaiting logging</span>
      </div>
      <div class="ic-stats-bar__item">
        <span class="ic-stats-bar__value">${stats.totalActiveInvestors}</span>
        <span class="ic-stats-bar__label">Active investors</span>
      </div>
    </section>`;
}

function renderUrgencyBadge(urgency) {
  const color = URGENCY_COLORS[urgency] || '#6b7280';
  const label = urgency.charAt(0).toUpperCase() + urgency.slice(1);
  return `<span class="ic-badge ic-badge--urgency ${getUrgencyClass(urgency)}" style="--badge-color: ${color}">${escapeHtml(label)}</span>`;
}

function renderConfidenceBadge(level) {
  const cls = level === 'high' ? 'ic-badge--confidence-high'
    : level === 'medium' ? 'ic-badge--confidence-medium'
    : 'ic-badge--confidence-low';
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  return `<span class="ic-badge ic-badge--confidence ${cls}">${escapeHtml(label)}</span>`;
}

function renderStateBadge(state) {
  const label = state.charAt(0).toUpperCase() + state.slice(1).replace(/_/g, ' ');
  return `<span class="ic-badge ic-badge--state ${getStateClass(state)}">${escapeHtml(label)}</span>`;
}

function renderSignalRow(signal) {
  const urgencyColor = URGENCY_COLORS[signal.urgency] || '#6b7280';
  const typeBadge = escapeHtml(signalTypeLabel(signal.type));
  const invName = signal.investorId ? investorName(signal.investorId) : '';
  const ctcName = signal.contactId ? contactName(signal.contactId) : '';
  const title = escapeHtml(truncate(signal.title || '', 80));
  const age = formatDateRelative(signal.createdAt);

  return `
    <tr class="ic-signals-table__row"
        data-navigate="#/signals/${escapeHtml(signal.id)}"
        role="link"
        tabindex="0"
        aria-label="Signal: ${title}">
      <td class="ic-signals-table__cell ic-signals-table__cell--border"
          style="border-left: 4px solid ${urgencyColor};">
        ${renderUrgencyBadge(signal.urgency)}
      </td>
      <td class="ic-signals-table__cell">
        <span class="ic-badge ic-badge--type">${typeBadge}</span>
      </td>
      <td class="ic-signals-table__cell">${invName}</td>
      <td class="ic-signals-table__cell">${ctcName}</td>
      <td class="ic-signals-table__cell ic-signals-table__cell--title">${title}</td>
      <td class="ic-signals-table__cell">${renderConfidenceBadge(signal.confidence || 'medium')}</td>
      <td class="ic-signals-table__cell ic-signals-table__cell--age">
        <time datetime="${escapeHtml(signal.createdAt)}">${escapeHtml(age)}</time>
      </td>
      <td class="ic-signals-table__cell">${renderStateBadge(signal.state)}</td>
      <td class="ic-signals-table__cell ic-signals-table__cell--action">
        <button class="ic-btn ic-btn--small ic-btn--primary"
                data-navigate="#/signals/${escapeHtml(signal.id)}"
                type="button">
          Review
        </button>
      </td>
    </tr>`;
}

function renderSignalsSection(triageSignals) {
  const rows = triageSignals.map(renderSignalRow).join('');

  return `
    <section class="ic-home__section ic-home__signals" aria-labelledby="ic-signals-heading">
      <header class="ic-section-header">
        <h2 id="ic-signals-heading" class="ic-section-header__title">
          Signals requiring triage
          <span class="ic-section-header__count">${triageSignals.length}</span>
        </h2>
      </header>
      <div class="ic-table-wrapper" role="region" aria-label="Signals table" tabindex="0">
        <table class="ic-signals-table" aria-describedby="ic-signals-heading">
          <thead class="ic-signals-table__head">
            <tr>
              <th scope="col" class="ic-signals-table__th">Urgency</th>
              <th scope="col" class="ic-signals-table__th">Type</th>
              <th scope="col" class="ic-signals-table__th">Investor</th>
              <th scope="col" class="ic-signals-table__th">Contact</th>
              <th scope="col" class="ic-signals-table__th">Title</th>
              <th scope="col" class="ic-signals-table__th">Confidence</th>
              <th scope="col" class="ic-signals-table__th">Age</th>
              <th scope="col" class="ic-signals-table__th">State</th>
              <th scope="col" class="ic-signals-table__th"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="ic-signals-table__body">
            ${rows || '<tr><td colspan="9" class="ic-table-empty">No signals requiring triage.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

function renderActionStateIndicator(state) {
  const color = ACTION_STATE_COLORS[state] || '#6b7280';
  const label = ACTION_STATE_LABELS[state] || state;
  return `
    <span class="ic-action-state">
      <span class="ic-action-state__dot" style="background-color: ${color};" aria-hidden="true"></span>
      <span class="ic-action-state__label">${escapeHtml(label)}</span>
    </span>`;
}

function renderActionRow(action) {
  const invName = action.investorId ? investorName(action.investorId) : '';
  const ctcName = action.contactId ? contactName(action.contactId) : '';
  const ownerName = action.ownerId ? teamMemberName(action.ownerId) : '';
  const objective = escapeHtml(truncate(action.objective || '', 80));
  const dueDateFormatted = action.dueDate ? formatDate(action.dueDate) : '';
  const overdue = action.dueDate && isOverdue(action.dueDate);
  const channel = action.channel
    ? escapeHtml(action.channel.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    : '';

  return `
    <tr class="ic-actions-table__row"
        data-navigate="#/actions/${escapeHtml(action.id)}"
        role="link"
        tabindex="0"
        aria-label="Action: ${objective}">
      <td class="ic-actions-table__cell">${renderActionStateIndicator(action.state)}</td>
      <td class="ic-actions-table__cell">
        <span class="ic-badge ic-badge--action-type">${escapeHtml(actionTypeLabel(action.type))}</span>
      </td>
      <td class="ic-actions-table__cell">${invName}</td>
      <td class="ic-actions-table__cell">${ctcName}</td>
      <td class="ic-actions-table__cell ic-actions-table__cell--objective">${objective}</td>
      <td class="ic-actions-table__cell">${ownerName}</td>
      <td class="ic-actions-table__cell ic-actions-table__cell--due">
        ${dueDateFormatted ? `<time datetime="${escapeHtml(action.dueDate)}">${dueDateFormatted}</time>` : ''}
        ${overdue ? '<span class="ic-badge ic-badge--overdue">Overdue</span>' : ''}
      </td>
      <td class="ic-actions-table__cell">${channel}</td>
      <td class="ic-actions-table__cell ic-actions-table__cell--action">
        <button class="ic-btn ic-btn--small ic-btn--secondary"
                data-navigate="#/actions/${escapeHtml(action.id)}"
                type="button">
          Open
        </button>
      </td>
    </tr>`;
}

function renderActionsTable(heading, headingId, actionsList, emptyMsg) {
  const rows = actionsList.map(renderActionRow).join('');

  return `
    <div class="ic-actions-subsection" aria-labelledby="${headingId}">
      <h3 id="${headingId}" class="ic-subsection-header">
        ${escapeHtml(heading)}
        <span class="ic-section-header__count">${actionsList.length}</span>
      </h3>
      <div class="ic-table-wrapper" role="region" aria-label="${escapeHtml(heading)} table" tabindex="0">
        <table class="ic-actions-table" aria-describedby="${headingId}">
          <thead class="ic-actions-table__head">
            <tr>
              <th scope="col" class="ic-actions-table__th">State</th>
              <th scope="col" class="ic-actions-table__th">Type</th>
              <th scope="col" class="ic-actions-table__th">Investor</th>
              <th scope="col" class="ic-actions-table__th">Contact</th>
              <th scope="col" class="ic-actions-table__th">Objective</th>
              <th scope="col" class="ic-actions-table__th">Owner</th>
              <th scope="col" class="ic-actions-table__th">Due date</th>
              <th scope="col" class="ic-actions-table__th">Channel</th>
              <th scope="col" class="ic-actions-table__th"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="ic-actions-table__body">
            ${rows || `<tr><td colspan="9" class="ic-table-empty">${escapeHtml(emptyMsg)}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderActionsSection(upcomingActions, awaitingActions) {
  const totalCount = upcomingActions.length + awaitingActions.length;

  return `
    <section class="ic-home__section ic-home__actions" aria-labelledby="ic-actions-heading">
      <header class="ic-section-header">
        <h2 id="ic-actions-heading" class="ic-section-header__title">
          Upcoming actions
          <span class="ic-section-header__count">${totalCount}</span>
        </h2>
      </header>
      ${renderActionsTable(
        'Scheduled & in progress',
        'ic-actions-upcoming-heading',
        upcomingActions,
        'No upcoming actions.',
      )}
      ${awaitingActions.length > 0
        ? renderActionsTable(
            'Awaiting outcome logging',
            'ic-actions-awaiting-heading',
            awaitingActions,
            'No actions awaiting logging.',
          )
        : ''}
    </section>`;
}

// ---------------------------------------------------------------------------
// Event delegation
// ---------------------------------------------------------------------------

function attachEventDelegation(container) {
  container.addEventListener('click', (event) => {
    const navigable = event.target.closest('[data-navigate]');
    if (navigable) {
      event.preventDefault();
      const hash = navigable.getAttribute('data-navigate');
      window.location.hash = hash;
    }
  });

  container.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      const navigable = event.target.closest('[data-navigate]');
      if (navigable && navigable === event.target) {
        event.preventDefault();
        const hash = navigable.getAttribute('data-navigate');
        window.location.hash = hash;
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Main render
// ---------------------------------------------------------------------------

/**
 * Render the Home screen into the given container element.
 *
 * @param {HTMLElement} container - DOM element to render into
 */
export function renderHome(container) {
  // Signals: new or reviewing, sorted by urgency (high first)
  const triageSignals = signals
    .filter((s) => s.state === 'new' || s.state === 'reviewing')
    .sort((a, b) => {
      const ua = URGENCY_ORDER[a.urgency] ?? 99;
      const ub = URGENCY_ORDER[b.urgency] ?? 99;
      return ua - ub;
    });

  // Actions: planned / preparing / in_progress, sorted by due date
  const upcomingActions = actions
    .filter((a) => ['planned', 'preparing', 'in_progress'].includes(a.state))
    .sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return da - db;
    });

  // Actions awaiting logging
  const awaitingActions = actions.filter((a) => a.state === 'awaiting_logging');

  const stats = computeStats();

  container.innerHTML = `
    <div class="ic-home" role="main">
      <header class="ic-home__header">
        <h1 class="ic-home__title">What to do next</h1>
      </header>
      ${renderStatsBar(stats)}
      ${renderSignalsSection(triageSignals)}
      ${renderActionsSection(upcomingActions, awaitingActions)}
    </div>`;

  attachEventDelegation(container);
}
