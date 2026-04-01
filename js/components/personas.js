/**
 * Investor Care OS - Investor Personas Page
 *
 * Structured profiles capturing how an investor typically behaves, what they
 * care about, and how they prefer to be engaged. Per the blueprint
 * (section 11.2), each persona card surfaces archetype, key characteristics,
 * behavioral indicators, signal-interpretation context and data provenance.
 *
 * Uses ic- prefixed classes, event delegation and semantic HTML.
 */

import {
  investors,
  contacts,
  investorStates,
  signals,
  actions,
  timelineEvents,
} from '../data/mock-data.js';

import {
  escapeHtml,
  formatDate,
  daysSince,
  renderSparkline,
  formatPercent,
  getProvenanceLabel,
} from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Archetype derivation
// ---------------------------------------------------------------------------

const TYPE_LABELS = {
  institutional: 'Institutional',
  'index-fund': 'Index fund',
  'pension-fund': 'Pension fund',
};

/**
 * Derive a persona archetype label from the investor record.
 * The order of checks mirrors the specification priority.
 */
function deriveArchetype(investor) {
  const { holdingTrend, engagementStatus, type } = investor;

  if (holdingTrend === 'increasing' && engagementStatus === 'active') {
    return 'Active accumulator';
  }
  if (holdingTrend === 'stable' && type.includes('index')) {
    return 'Passive index tracker';
  }
  if (type.includes('pension')) {
    return 'Long-term stewardship';
  }
  if (holdingTrend === 'declining') {
    return 'Reducing position';
  }
  if (engagementStatus === 'new') {
    return 'New entrant';
  }
  if (engagementStatus === 'active' && holdingTrend === 'stable') {
    return 'Stable conviction holder';
  }
  return 'Monitored holder';
}

/**
 * Return a CSS modifier class for the archetype badge.
 */
function archetypeModifier(archetype) {
  const map = {
    'Active accumulator': 'accumulator',
    'Passive index tracker': 'passive',
    'Long-term stewardship': 'stewardship',
    'Reducing position': 'reducing',
    'New entrant': 'new',
    'Stable conviction holder': 'stable',
    'Monitored holder': 'monitored',
  };
  return map[archetype] || 'monitored';
}

// ---------------------------------------------------------------------------
// Characteristic helpers
// ---------------------------------------------------------------------------

function deriveHoldingPeriod(holdingHistory) {
  if (!holdingHistory || holdingHistory.length === 0) return 'Unknown';
  const firstNonZero = holdingHistory.findIndex((v) => v > 0);
  if (firstNonZero === -1) return 'No position';
  const periodsHeld = holdingHistory.length - firstNonZero;
  // Each data-point represents roughly a quarter
  if (periodsHeld >= 5) return 'Long-term (2+ years)';
  if (periodsHeld >= 3) return 'Medium-term';
  return 'New position';
}

function deriveDecisionStructure(type) {
  if (type.includes('pension')) return 'Committee-based';
  if (type.includes('index')) return 'Index-rule-based';
  return 'Centralized PM-driven';
}

function formatCommPref(pref) {
  const map = {
    phone: 'Phone',
    email: 'Email',
    in_person: 'In-person meetings',
    video: 'Video calls',
  };
  return map[pref] || pref || 'Not specified';
}

// ---------------------------------------------------------------------------
// Signal-interpretation note generation
// ---------------------------------------------------------------------------

function generateInterpretationNote(archetype, state) {
  const govLevel = state?.governanceSensitivity?.level || 'low';
  const retRisk = state?.retentionRisk?.level || 'low';

  switch (archetype) {
    case 'Passive index tracker':
      return 'Low responsiveness signals mean less for this passive index tracker than for an active investor. Focus engagement around proxy season and governance topics.';
    case 'Long-term stewardship':
      return 'Governance signals are high priority given this investor\'s stewardship focus. Proactive engagement on ESG and board matters strengthens the relationship.';
    case 'Active accumulator':
      return 'Rising conviction suggests strong alignment with the equity story. Maintain high-touch engagement to reinforce thesis and support continued accumulation.';
    case 'Reducing position':
      if (retRisk === 'high') {
        return 'Position reduction combined with high retention risk warrants urgent attention. Prioritize direct engagement to understand concerns and rebuild confidence.';
      }
      return 'Position reduction may be mandate-driven rather than conviction-based. Monitor sell-down pace and verify root cause before escalating.';
    case 'New entrant':
      return 'As a new entrant, early signals carry outsized weight for relationship-building. Prioritize onboarding engagement and timely responses to information requests.';
    case 'Stable conviction holder':
      if (govLevel === 'high') {
        return 'Stable conviction combined with high governance sensitivity means this investor values stewardship dialogue. Maintain regular governance updates.';
      }
      return 'Stable holding pattern indicates satisfied investor. Maintain current engagement cadence and ensure timely access to material updates.';
    default:
      return 'Standard monitoring applies. Escalate if engagement frequency or holding trajectory changes significantly from baseline.';
  }
}

// ---------------------------------------------------------------------------
// Freshness helpers
// ---------------------------------------------------------------------------

function freshnessIndicator(lastUpdated) {
  if (!lastUpdated) return { label: 'Unknown', cls: 'stale' };
  const days = daysSince(lastUpdated);
  if (days <= 14) return { label: 'Fresh', cls: 'fresh' };
  if (days <= 30) return { label: 'Aging', cls: 'aging' };
  return { label: 'Stale', cls: 'stale' };
}

// ---------------------------------------------------------------------------
// Bar indicator rendering
// ---------------------------------------------------------------------------

/**
 * Render a horizontal colored bar for a level indicator.
 * @param {string} label - Display label
 * @param {'high'|'medium'|'low'} level - Severity / intensity level
 * @param {'engagement'|'governance'|'risk'} kind - Determines color mapping
 * @returns {string} HTML string
 */
function renderIndicatorBar(label, level, kind) {
  // Map level to fill percentage and color class
  const fillMap = { high: 100, medium: 60, low: 30 };
  const fill = fillMap[level] || 30;

  // Color meaning varies by kind:
  // engagement: high=green, medium=amber, low=red
  // governance: high=red, medium=amber, low=green
  // risk: high=red, medium=amber, low=green
  let colorCls;
  if (kind === 'engagement') {
    colorCls = level === 'high' ? 'ic-bar--green' : level === 'medium' ? 'ic-bar--amber' : 'ic-bar--red';
  } else {
    colorCls = level === 'high' ? 'ic-bar--red' : level === 'medium' ? 'ic-bar--amber' : 'ic-bar--green';
  }

  return `
    <div class="ic-persona-indicator">
      <span class="ic-persona-indicator__label">${escapeHtml(label)}</span>
      <span class="ic-persona-indicator__level">${escapeHtml(level)}</span>
      <div class="ic-persona-indicator__track">
        <div class="ic-persona-indicator__fill ${colorCls}" style="width:${fill}%" role="progressbar" aria-valuenow="${fill}" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </div>`;
}

/**
 * Map engagementFrequency value to a level string.
 */
function engagementLevel(freq) {
  if (!freq) return 'low';
  const v = freq.value ?? 0;
  if (v >= 4) return 'high';
  if (v >= 2) return 'medium';
  return 'low';
}

// ---------------------------------------------------------------------------
// Provenance badge rendering
// ---------------------------------------------------------------------------

function renderProvenanceBadge(provenance) {
  const isSystem = provenance === 'inferred' || provenance === 'observed';
  const label = isSystem ? 'System-inferred' : 'Team-maintained';
  const cls = isSystem ? 'ic-provenance-badge--system' : 'ic-provenance-badge--team';
  return `<span class="ic-provenance-badge ${cls}">${escapeHtml(label)}</span>`;
}

// ---------------------------------------------------------------------------
// Trend arrow helper
// ---------------------------------------------------------------------------

function trendArrow(direction) {
  const arrows = { increasing: '\u2191', declining: '\u2193', stable: '\u2192' };
  const cls = {
    increasing: 'ic-trend--up',
    declining: 'ic-trend--down',
    stable: 'ic-trend--stable',
  };
  return `<span class="ic-trend ${cls[direction] || ''}">${arrows[direction] || '\u2192'}</span>`;
}

// ---------------------------------------------------------------------------
// Unique filter values
// ---------------------------------------------------------------------------

function collectFilterOptions() {
  const archetypes = new Set();
  const types = new Set();
  const govLevels = new Set();

  investors.forEach((inv) => {
    archetypes.add(deriveArchetype(inv));
    types.add(inv.type);
    const state = investorStates.find((s) => s.investorId === inv.id);
    if (state?.governanceSensitivity?.level) {
      govLevels.add(state.governanceSensitivity.level);
    }
  });

  return {
    archetypes: [...archetypes].sort(),
    types: [...types].sort(),
    govLevels: [...govLevels].sort(),
  };
}

// ---------------------------------------------------------------------------
// Card rendering
// ---------------------------------------------------------------------------

function renderPersonaCard(investor) {
  const state = investorStates.find((s) => s.investorId === investor.id);
  const primaryContact = contacts.find(
    (c) => c.investorId === investor.id && c.isPrimary
  );
  const archetype = deriveArchetype(investor);

  // --- 1. Header ---
  const typeBadge = TYPE_LABELS[investor.type] || investor.type;

  // --- 3. Key characteristics ---
  const holdingPeriod = deriveHoldingPeriod(investor.holdingHistory);
  const govTopics =
    state?.governanceSensitivity?.topics?.length > 0
      ? state.governanceSensitivity.topics.join(', ')
      : 'Not governance-focused';
  const votingPattern =
    state?.governanceSensitivity?.topics?.length > 0
      ? `Active on: ${govTopics}`
      : 'Not governance-focused';
  const commPref = formatCommPref(primaryContact?.communicationPreference);
  const decisionStructure = deriveDecisionStructure(investor.type);
  const responsiveness = primaryContact?.responsiveness || 'N/A';

  // --- 4. Behavioral indicators ---
  const engLevel = engagementLevel(state?.engagementFrequency);
  const govLevel = state?.governanceSensitivity?.level || 'low';
  const retRisk = state?.retentionRisk?.level || 'low';

  // --- 5. Signal interpretation ---
  const interpretationNote = generateInterpretationNote(archetype, state);

  // --- 6. Provenance ---
  const lastUpdated = state?.teamAssessment?.lastUpdated;
  const freshness = freshnessIndicator(lastUpdated);

  return `
    <article class="ic-persona-card" data-investor-id="${escapeHtml(investor.id)}" data-archetype="${escapeHtml(archetype)}" data-type="${escapeHtml(investor.type)}" data-gov-level="${escapeHtml(govLevel)}">

      <header class="ic-persona-card__header" role="link" tabindex="0" data-nav="investor">
        <div class="ic-persona-card__title-row">
          <h3 class="ic-persona-card__name">${escapeHtml(investor.name)}</h3>
          <span class="ic-persona-card__type-badge ic-badge">${escapeHtml(typeBadge)}</span>
        </div>
        <div class="ic-persona-card__holding">
          <span class="ic-persona-card__holding-pct">${formatPercent(investor.holdingPercent)}</span>
          ${trendArrow(investor.holdingTrend)}
          <span class="ic-persona-card__sparkline">${renderSparkline(investor.holdingHistory, 60, 20)}</span>
        </div>
      </header>

      <div class="ic-persona-card__archetype">
        <span class="ic-archetype-badge ic-archetype-badge--${archetypeModifier(archetype)}">${escapeHtml(archetype)}</span>
      </div>

      <section class="ic-persona-card__characteristics">
        <h4 class="ic-persona-card__section-title">Key characteristics</h4>
        <dl class="ic-persona-card__dl">
          <div class="ic-persona-card__dl-row">
            <dt>Typical holding period</dt>
            <dd>${escapeHtml(holdingPeriod)}</dd>
          </div>
          <div class="ic-persona-card__dl-row">
            <dt>Governance voting pattern</dt>
            <dd>${escapeHtml(votingPattern)}</dd>
          </div>
          <div class="ic-persona-card__dl-row">
            <dt>Known sensitivities</dt>
            <dd>${escapeHtml(govTopics)}</dd>
          </div>
          <div class="ic-persona-card__dl-row">
            <dt>Communication style preference</dt>
            <dd>${escapeHtml(commPref)}</dd>
          </div>
          <div class="ic-persona-card__dl-row">
            <dt>Decision-making structure</dt>
            <dd>${escapeHtml(decisionStructure)}</dd>
          </div>
          <div class="ic-persona-card__dl-row">
            <dt>Historical response pattern</dt>
            <dd>${escapeHtml(responsiveness)}</dd>
          </div>
        </dl>
      </section>

      <section class="ic-persona-card__indicators">
        <h4 class="ic-persona-card__section-title">Behavioral indicators</h4>
        ${renderIndicatorBar('Engagement level', engLevel, 'engagement')}
        ${renderIndicatorBar('Governance sensitivity', govLevel, 'governance')}
        ${renderIndicatorBar('Retention risk', retRisk, 'risk')}
      </section>

      <section class="ic-persona-card__interpretation">
        <h4 class="ic-persona-card__section-title">How persona affects signal interpretation</h4>
        <p class="ic-persona-card__note">${escapeHtml(interpretationNote)}</p>
      </section>

      <footer class="ic-persona-card__provenance">
        <h4 class="ic-persona-card__section-title">Data provenance</h4>
        <div class="ic-persona-card__provenance-badges">
          ${renderProvenanceBadge(state?.sentiment?.provenance)}
          ${renderProvenanceBadge(state?.teamAssessment?.provenance)}
        </div>
        <p class="ic-persona-card__freshness">
          Last updated: ${lastUpdated ? formatDate(lastUpdated) : 'Unknown'}
          <span class="ic-freshness-dot ic-freshness-dot--${freshness.cls}" title="${freshness.label}"></span>
          <span class="ic-freshness-label">${freshness.label}</span>
        </p>
      </footer>
    </article>`;
}

// ---------------------------------------------------------------------------
// Filter bar rendering
// ---------------------------------------------------------------------------

function renderFilterBar(options) {
  const archetypeOpts = options.archetypes
    .map((a) => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`)
    .join('');

  const typeOpts = options.types
    .map(
      (t) =>
        `<option value="${escapeHtml(t)}">${escapeHtml(TYPE_LABELS[t] || t)}</option>`
    )
    .join('');

  const govOpts = options.govLevels
    .map(
      (g) =>
        `<option value="${escapeHtml(g)}">${escapeHtml(g.charAt(0).toUpperCase() + g.slice(1))}</option>`
    )
    .join('');

  return `
    <div class="ic-personas-filters" role="search" aria-label="Filter investor personas">
      <label class="ic-personas-filters__group">
        <span class="ic-personas-filters__label">Archetype</span>
        <select class="ic-personas-filters__select" data-filter="archetype">
          <option value="all">All archetypes</option>
          ${archetypeOpts}
        </select>
      </label>

      <label class="ic-personas-filters__group">
        <span class="ic-personas-filters__label">Investor type</span>
        <select class="ic-personas-filters__select" data-filter="type">
          <option value="all">All types</option>
          ${typeOpts}
        </select>
      </label>

      <label class="ic-personas-filters__group">
        <span class="ic-personas-filters__label">Governance sensitivity</span>
        <select class="ic-personas-filters__select" data-filter="gov">
          <option value="all">All levels</option>
          ${govOpts}
        </select>
      </label>
    </div>`;
}

// ---------------------------------------------------------------------------
// Main render function
// ---------------------------------------------------------------------------

/**
 * Render the Investor Personas page into the given container element.
 * @param {HTMLElement} container - Target DOM element
 */
export function renderPersonas(container) {
  const filterOptions = collectFilterOptions();

  const cards = investors
    .map((inv) => renderPersonaCard(inv))
    .join('');

  container.innerHTML = `
    <section class="ic-personas" aria-labelledby="ic-personas-heading">
      <header class="ic-personas__header">
        <h1 id="ic-personas-heading" class="ic-personas__title">Investor personas</h1>
        <p class="ic-personas__subtitle">Structured profiles capturing investor behavior patterns, priorities, and engagement preferences</p>
      </header>

      ${renderFilterBar(filterOptions)}

      <div class="ic-personas__grid" role="list">
        ${cards}
      </div>
    </section>`;

  // -------------------------------------------------------------------------
  // Event delegation
  // -------------------------------------------------------------------------

  // Filter change handler
  container.addEventListener('change', (e) => {
    const select = e.target.closest('[data-filter]');
    if (!select) return;
    applyFilters(container);
  });

  // Card header click → navigate to investor profile
  container.addEventListener('click', (e) => {
    const header = e.target.closest('[data-nav="investor"]');
    if (!header) return;
    const card = header.closest('.ic-persona-card');
    if (!card) return;
    const investorId = card.dataset.investorId;
    if (investorId) {
      window.location.hash = `#/investors/${investorId}`;
    }
  });

  // Keyboard support for card header navigation
  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const header = e.target.closest('[data-nav="investor"]');
    if (!header) return;
    e.preventDefault();
    header.click();
  });
}

// ---------------------------------------------------------------------------
// Filter logic
// ---------------------------------------------------------------------------

function applyFilters(container) {
  const archetypeVal =
    container.querySelector('[data-filter="archetype"]')?.value || 'all';
  const typeVal =
    container.querySelector('[data-filter="type"]')?.value || 'all';
  const govVal =
    container.querySelector('[data-filter="gov"]')?.value || 'all';

  const cards = container.querySelectorAll('.ic-persona-card');
  cards.forEach((card) => {
    const matchArchetype =
      archetypeVal === 'all' || card.dataset.archetype === archetypeVal;
    const matchType =
      typeVal === 'all' || card.dataset.type === typeVal;
    const matchGov =
      govVal === 'all' || card.dataset.govLevel === govVal;

    card.style.display =
      matchArchetype && matchType && matchGov ? '' : 'none';
  });
}
