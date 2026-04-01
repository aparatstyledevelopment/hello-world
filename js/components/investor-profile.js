/**
 * Investor Care OS - Investor Profile Component
 *
 * Renders a full investor profile view with header, tab navigation,
 * and five tab panels: Timeline, State, Contacts, Signals, Actions.
 */

import {
  investors,
  contacts,
  investorState,
  timelineEvents,
  signals,
  actions,
} from '../data/mock-data.js';

import {
  formatDate,
  formatDateRelative,
  daysSince,
  formatPercent,
  formatTrend,
  escapeHtml,
  truncate,
  renderSparkline,
  getUrgencyClass,
  getStateClass,
  getProvenanceLabel,
} from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS = ['Timeline', 'State', 'Contacts', 'Signals', 'Actions'];

const TIMELINE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'interactions', label: 'Interactions' },
  { key: 'ownership', label: 'Ownership changes' },
  { key: 'external', label: 'External events' },
  { key: 'system', label: 'System events' },
];

const TIMELINE_FILTER_MAP = {
  interactions: ['call', 'meeting', 'email'],
  ownership: ['ownership'],
  external: ['media', 'regulatory', 'earnings'],
  system: ['signal', 'action'],
};

const EVENT_ICONS = {
  call: '\uD83D\uDCDE',       // 📞
  meeting: '\uD83E\uDD1D',    // 🤝
  email: '\u2709\uFE0F',      // ✉️
  ownership: '\uD83D\uDCCA',  // 📊
  media: '\uD83D\uDCF0',      // 📰
  regulatory: '\u2696\uFE0F', // ⚖️
  earnings: '\uD83D\uDCE2',   // 📢
  signal: '\uD83D\uDD14',     // 🔔
  action: '\u2705',            // ✅
};

const TYPE_LABELS = {
  'foreign-institution': 'Foreign institution',
  'swedish-pension': 'Swedish pension fund',
  'holding-company': 'Holding company',
  retail: 'Retail',
};

// ---------------------------------------------------------------------------
// Helpers (internal)
// ---------------------------------------------------------------------------

function findInvestor(investorId) {
  return investors.find((inv) => inv.id === investorId);
}

function findContacts(investorId) {
  return contacts.filter((c) => c.investorId === investorId);
}

function findState(investorId) {
  return investorState.find((s) => s.investorId === investorId);
}

function findTimeline(investorId) {
  return timelineEvents
    .filter((e) => e.investorId === investorId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function findSignals(investorId) {
  return signals.filter((s) => s.investorId === investorId);
}

function findActions(investorId) {
  return actions.filter((a) => a.investorId === investorId);
}

function freshnessBadge(isoDate) {
  if (!isoDate) return '<span class="freshness freshness-red" title="No date">●</span>';
  const days = daysSince(isoDate);
  if (days < 30) return '<span class="freshness freshness-green" title="Fresh (< 30 days)">●</span>';
  if (days <= 90) return '<span class="freshness freshness-amber" title="Aging (30–90 days)">●</span>';
  return '<span class="freshness freshness-red" title="Stale (> 90 days)">●</span>';
}

function staleWarning(isoDate) {
  if (!isoDate) return '';
  return daysSince(isoDate) > 180
    ? '<span class="stale-warning">⚠ Stale – please review</span>'
    : '';
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function renderHeader(investor, investorContacts, state, events, investorSignals, investorActions) {
  const primaryContact = investorContacts.find((c) => c.primary) || investorContacts[0];
  const typeLabel = TYPE_LABELS[investor.type] || investor.type;
  const holdingPct = formatPercent(investor.holdingPercent);
  const trendArrow = formatTrend(investor.holdingTrend);
  const sparkline = renderSparkline(investor.holdingHistory || [], 80, 24);

  // Quick stats
  const lastInteractionDate = events.find((e) =>
    ['call', 'meeting', 'email'].includes(e.type),
  )?.date;
  const daysSinceLastInteraction = lastInteractionDate
    ? daysSince(lastInteractionDate)
    : '—';

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  const interactionsLast12 = events.filter(
    (e) =>
      ['call', 'meeting', 'email'].includes(e.type) &&
      new Date(e.date) >= twelveMonthsAgo,
  ).length;

  const activeSignals = investorSignals.filter(
    (s) => s.state === 'new' || s.state === 'active' || s.state === 'monitoring',
  ).length;

  const openActions = investorActions.filter(
    (a) => a.state !== 'completed' && a.state !== 'archived',
  ).length;

  return `
    <div class="ip-header">
      <div class="ip-header__top">
        <h1 class="ip-header__name">${escapeHtml(investor.name)}</h1>
        <span class="badge badge--type badge--${investor.type}">${escapeHtml(typeLabel)}</span>
        <span class="badge badge--tier">Tier ${investor.priorityTier || '—'}</span>
      </div>

      <div class="ip-header__holding">
        <span class="ip-header__holding-pct">${holdingPct}</span>
        <span class="ip-header__sparkline">${sparkline}</span>
        <span class="ip-header__trend ip-header__trend--${investor.holdingTrend}">${trendArrow}</span>
      </div>

      <div class="ip-header__meta">
        ${primaryContact ? `
          <div class="ip-header__meta-item">
            <span class="ip-header__meta-label">Primary contact</span>
            <span class="ip-header__meta-value">${escapeHtml(primaryContact.name)} – ${escapeHtml(primaryContact.role)}</span>
          </div>
        ` : ''}
        ${investor.relationshipOwner ? `
          <div class="ip-header__meta-item">
            <span class="ip-header__meta-label">Relationship owner</span>
            <span class="ip-header__meta-value">${escapeHtml(investor.relationshipOwner)}</span>
          </div>
        ` : ''}
      </div>

      <div class="ip-header__stats">
        <div class="ip-stat">
          <span class="ip-stat__value">${daysSinceLastInteraction}</span>
          <span class="ip-stat__label">Days since last interaction</span>
        </div>
        <div class="ip-stat">
          <span class="ip-stat__value">${interactionsLast12}</span>
          <span class="ip-stat__label">Interactions (12 mo)</span>
        </div>
        <div class="ip-stat">
          <span class="ip-stat__value">${activeSignals}</span>
          <span class="ip-stat__label">Active signals</span>
        </div>
        <div class="ip-stat">
          <span class="ip-stat__value">${openActions}</span>
          <span class="ip-stat__label">Open actions</span>
        </div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Tab navigation
// ---------------------------------------------------------------------------

function renderTabs(activeTab) {
  const items = TABS.map((tab) => {
    const slug = tab.toLowerCase();
    const cls = slug === activeTab ? 'ip-tab ip-tab--active' : 'ip-tab';
    return `<button class="${cls}" data-tab="${slug}">${escapeHtml(tab)}</button>`;
  }).join('');
  return `<nav class="ip-tabs">${items}</nav>`;
}

// ---------------------------------------------------------------------------
// Timeline tab
// ---------------------------------------------------------------------------

function renderTimelineTab(events, activeFilter) {
  const filter = activeFilter || 'all';

  const chips = TIMELINE_FILTERS.map((f) => {
    const cls = f.key === filter ? 'chip chip--active' : 'chip';
    return `<button class="${cls}" data-filter="${f.key}">${escapeHtml(f.label)}</button>`;
  }).join('');

  const filtered =
    filter === 'all'
      ? events
      : events.filter((e) => (TIMELINE_FILTER_MAP[filter] || []).includes(e.type));

  const items = filtered.map((event) => {
    const icon = EVENT_ICONS[event.type] || '📌';
    const desc = event.description || '';
    const shortDesc = truncate(desc, 140);
    const isLong = desc.length > 140;

    return `
      <li class="tl-event" data-event-id="${escapeHtml(String(event.id))}">
        <span class="tl-event__icon">${icon}</span>
        <div class="tl-event__body">
          <time class="tl-event__date">${formatDate(event.date)}</time>
          <h4 class="tl-event__title">${escapeHtml(event.title)}</h4>
          <p class="tl-event__desc" data-full="${escapeHtml(desc)}" data-collapsed="true">
            ${escapeHtml(shortDesc)}
            ${isLong ? '<button class="tl-event__expand" data-action="toggle-desc">Show more</button>' : ''}
          </p>
          ${event.source ? `<span class="badge badge--source">${escapeHtml(event.source)}</span>` : ''}
        </div>
      </li>`;
  }).join('');

  return `
    <div class="ip-panel ip-panel--timeline">
      <div class="ip-filter-bar">${chips}</div>
      <ul class="tl-list">${items.length ? items : '<li class="tl-empty">No events found.</li>'}</ul>
    </div>`;
}

// ---------------------------------------------------------------------------
// State tab
// ---------------------------------------------------------------------------

function renderStateTab(state) {
  if (!state) {
    return '<div class="ip-panel ip-panel--state"><p>No state data available.</p></div>';
  }

  function paramRow(param) {
    const val = param.value != null ? param.value : '—';
    const provLabel = getProvenanceLabel(param.provenance || '');
    const fresh = freshnessBadge(param.updatedAt);
    const histAvg = param.historicalAverage != null ? `<span class="state-avg">Hist avg: ${param.historicalAverage}</span>` : '';
    const peerAvg = param.peerAverage != null ? `<span class="state-avg">Peer avg: ${param.peerAverage}</span>` : '';

    return `
      <div class="state-param">
        <div class="state-param__header">
          <span class="state-param__label">${escapeHtml(param.label)}</span>
          ${fresh}
        </div>
        <div class="state-param__value">${escapeHtml(String(val))}</div>
        <div class="state-param__meta">
          <span class="badge badge--provenance">${escapeHtml(provLabel)}</span>
          ${histAvg}${peerAvg}
        </div>
      </div>`;
  }

  function columnHtml(title, colorClass, params) {
    const rows = (params || []).map(paramRow).join('');
    return `
      <div class="state-col">
        <h3 class="state-col__header state-col__header--${colorClass}">${escapeHtml(title)}</h3>
        <div class="state-col__body">${rows || '<p class="state-empty">No data</p>'}</div>
      </div>`;
  }

  // Build team-assessed column with stale warnings
  function teamParamRow(param) {
    const base = paramRow(param);
    const warning = staleWarning(param.updatedAt);
    return warning ? base.replace('</div><!--end-->', `${warning}</div>`) : base;
  }

  const teamRows = (state.teamAssessed || []).map((param) => {
    const val = param.value != null ? param.value : '—';
    const provLabel = getProvenanceLabel(param.provenance || '');
    const fresh = freshnessBadge(param.updatedAt);
    const warning = staleWarning(param.updatedAt);

    return `
      <div class="state-param">
        <div class="state-param__header">
          <span class="state-param__label">${escapeHtml(param.label)}</span>
          ${fresh}
        </div>
        <div class="state-param__value">${escapeHtml(String(val))}</div>
        <div class="state-param__meta">
          <span class="badge badge--provenance">${escapeHtml(provLabel)}</span>
          ${warning}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="ip-panel ip-panel--state">
      <div class="state-grid">
        ${columnHtml('Observed', 'blue', state.observed)}
        ${columnHtml('Inferred', 'amber', state.inferred)}
        <div class="state-col">
          <h3 class="state-col__header state-col__header--green">Team assessment</h3>
          <div class="state-col__body">${teamRows || '<p class="state-empty">No data</p>'}</div>
        </div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Contacts tab
// ---------------------------------------------------------------------------

function renderContactsTab(investorContacts, events) {
  if (!investorContacts.length) {
    return '<div class="ip-panel ip-panel--contacts"><p>No contacts on file.</p></div>';
  }

  const cards = investorContacts.map((contact) => {
    const lastContactDate = contact.lastContactDate
      ? formatDate(contact.lastContactDate)
      : '—';
    const respRate = contact.responsivenessRate != null
      ? `${contact.responsivenessRate}%`
      : '—';

    // Last 5 interactions for this contact
    const contactEvents = events
      .filter((e) => e.contactId === contact.id && ['call', 'meeting', 'email'].includes(e.type))
      .slice(0, 5);

    const miniHistory = contactEvents.length
      ? contactEvents.map((e) => `
          <li class="contact-history__item">
            <span>${EVENT_ICONS[e.type] || ''}</span>
            <span>${formatDate(e.date)}</span>
            <span>${escapeHtml(truncate(e.title, 50))}</span>
          </li>`).join('')
      : '<li class="contact-history__empty">No recent interactions</li>';

    return `
      <div class="contact-card">
        <div class="contact-card__header">
          <h4 class="contact-card__name">${escapeHtml(contact.name)}</h4>
          <span class="contact-card__role">${escapeHtml(contact.role || '')}</span>
        </div>
        <div class="contact-card__details">
          <div class="contact-card__detail">
            <span class="contact-card__label">Comm preference</span>
            <span class="contact-card__value">${escapeHtml(contact.communicationPreference || '—')}</span>
          </div>
          <div class="contact-card__detail">
            <span class="contact-card__label">Responsiveness</span>
            <span class="contact-card__value">${respRate}</span>
          </div>
          <div class="contact-card__detail">
            <span class="contact-card__label">Last contact</span>
            <span class="contact-card__value">${lastContactDate}</span>
          </div>
          <div class="contact-card__detail">
            <span class="contact-card__label">IR owner</span>
            <span class="contact-card__value">${escapeHtml(contact.relationshipOwner || '—')}</span>
          </div>
        </div>
        <div class="contact-card__history">
          <h5 class="contact-card__history-title">Recent interactions</h5>
          <ul class="contact-history">${miniHistory}</ul>
        </div>
      </div>`;
  }).join('');

  return `<div class="ip-panel ip-panel--contacts"><div class="contact-grid">${cards}</div></div>`;
}

// ---------------------------------------------------------------------------
// Signals tab
// ---------------------------------------------------------------------------

function renderSignalsTab(investorSignals) {
  if (!investorSignals.length) {
    return '<div class="ip-panel ip-panel--signals"><p>No signals recorded.</p></div>';
  }

  const rows = investorSignals.map((sig) => {
    const urgencyClass = getUrgencyClass(sig.urgency);
    const stateClass = getStateClass(sig.state);
    return `
      <tr class="${urgencyClass}">
        <td>${formatDate(sig.date)}</td>
        <td>${escapeHtml(sig.type || '—')}</td>
        <td>${escapeHtml(sig.title || '—')}</td>
        <td><span class="badge ${stateClass}">${escapeHtml(sig.state || '—')}</span></td>
        <td>${escapeHtml(sig.outcome || '—')}</td>
      </tr>`;
  }).join('');

  return `
    <div class="ip-panel ip-panel--signals">
      <table class="ip-table ip-table--signals">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Title</th>
            <th>State</th>
            <th>Outcome</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ---------------------------------------------------------------------------
// Actions tab
// ---------------------------------------------------------------------------

function renderActionsTab(investorActions) {
  if (!investorActions.length) {
    return '<div class="ip-panel ip-panel--actions"><p>No actions recorded.</p></div>';
  }

  const rows = investorActions.map((act) => {
    const isCompleted = act.state === 'completed';
    const stateCell = isCompleted
      ? '<span class="action-check">\u2705</span>'
      : `<span class="badge ${getStateClass(act.state)}">${escapeHtml(act.state || '—')}</span>`;

    return `
      <tr>
        <td>${formatDate(act.date)}</td>
        <td>${escapeHtml(act.type || '—')}</td>
        <td>${escapeHtml(act.objective || '—')}</td>
        <td>${stateCell}</td>
        <td>${escapeHtml(act.owner || '—')}</td>
        <td>${escapeHtml(act.outcomeSummary || '—')}</td>
      </tr>`;
  }).join('');

  return `
    <div class="ip-panel ip-panel--actions">
      <table class="ip-table ip-table--actions">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Objective</th>
            <th>State</th>
            <th>Owner</th>
            <th>Outcome summary</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Render the full investor profile into the given container element.
 *
 * @param {HTMLElement} container  - DOM element to render into
 * @param {string}      investorId - ID of the investor to display
 */
export function renderInvestorProfile(container, investorId) {
  const investor = findInvestor(investorId);
  if (!investor) {
    container.innerHTML = '<div class="ip-error">Investor not found.</div>';
    return;
  }

  const investorContacts = findContacts(investorId);
  const state = findState(investorId);
  const events = findTimeline(investorId);
  const investorSignals = findSignals(investorId);
  const investorActions = findActions(investorId);

  // Closure state for active tab and timeline filter
  let activeTab = 'timeline';
  let activeFilter = 'all';

  function renderTabContent() {
    switch (activeTab) {
      case 'timeline':
        return renderTimelineTab(events, activeFilter);
      case 'state':
        return renderStateTab(state);
      case 'contacts':
        return renderContactsTab(investorContacts, events);
      case 'signals':
        return renderSignalsTab(investorSignals);
      case 'actions':
        return renderActionsTab(investorActions);
      default:
        return '';
    }
  }

  function render() {
    const headerHtml = renderHeader(
      investor,
      investorContacts,
      state,
      events,
      investorSignals,
      investorActions,
    );
    const tabsHtml = renderTabs(activeTab);
    const panelHtml = renderTabContent();

    container.innerHTML = `
      <article class="investor-profile" data-investor-id="${escapeHtml(investorId)}">
        ${headerHtml}
        ${tabsHtml}
        <div class="ip-panel-container">${panelHtml}</div>
      </article>`;
  }

  // Initial render
  render();

  // -----------------------------------------------------------------------
  // Event delegation
  // -----------------------------------------------------------------------

  container.addEventListener('click', (e) => {
    const target = e.target;

    // Tab switching
    const tabBtn = target.closest('[data-tab]');
    if (tabBtn) {
      const newTab = tabBtn.dataset.tab;
      if (newTab !== activeTab) {
        activeTab = newTab;
        activeFilter = 'all'; // reset filter when switching tabs
        render();
      }
      return;
    }

    // Timeline filter chips
    const filterBtn = target.closest('[data-filter]');
    if (filterBtn) {
      const newFilter = filterBtn.dataset.filter;
      if (newFilter !== activeFilter) {
        activeFilter = newFilter;
        // Only re-render the panel, not the full profile
        const panelContainer = container.querySelector('.ip-panel-container');
        if (panelContainer) {
          panelContainer.innerHTML = renderTimelineTab(events, activeFilter);
        }
      }
      return;
    }

    // Expand / collapse timeline event descriptions
    const expandBtn = target.closest('[data-action="toggle-desc"]');
    if (expandBtn) {
      const descEl = expandBtn.closest('.tl-event__desc');
      if (descEl) {
        const isCollapsed = descEl.dataset.collapsed === 'true';
        const fullText = descEl.dataset.full;
        if (isCollapsed) {
          descEl.dataset.collapsed = 'false';
          descEl.innerHTML = `${escapeHtml(fullText)} <button class="tl-event__expand" data-action="toggle-desc">Show less</button>`;
        } else {
          const short = truncate(fullText, 140);
          descEl.dataset.collapsed = 'true';
          descEl.innerHTML = `${escapeHtml(short)} <button class="tl-event__expand" data-action="toggle-desc">Show more</button>`;
        }
      }
      return;
    }
  });
}
