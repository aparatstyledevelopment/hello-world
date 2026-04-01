/**
 * Investor Care OS - AGM & Proxy Intelligence Component
 *
 * Seasonal workflow layer for managing governance season. Covers predicted
 * voting behaviour, governance issue tracking, pre-AGM engagement planning
 * and historical voting outcomes for Swedish large-cap IR teams.
 *
 * Blueprint section 11.5
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
  formatPercent,
  getUrgencyClass,
  getStateClass,
} from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AGM_DATE = new Date('2026-05-03');
const CURRENT_DATE = new Date('2026-04-01');
const BOARD_DIVERSITY_PERCENT = 38;
const ISS_DIVERSITY_THRESHOLD = 40;

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

/**
 * Return the investorState record for a given investor id.
 */
function getInvestorState(investorId) {
  return investorStates.find((s) => s.investorId === investorId) || null;
}

/**
 * Return the investor record for a given id.
 */
function getInvestor(investorId) {
  return investors.find((inv) => inv.id === investorId) || null;
}

/**
 * Return all contacts belonging to a given investor.
 */
function getContactsForInvestor(investorId) {
  return contacts.filter((c) => c.investorId === investorId);
}

/**
 * Find the governance or stewardship contact for an investor, falling back
 * to the primary contact.
 */
function getGovernanceContact(investorId) {
  const investorContacts = getContactsForInvestor(investorId);
  const govContact = investorContacts.find(
    (c) =>
      /governance|stewardship/i.test(c.role),
  );
  if (govContact) return govContact;
  return investorContacts.find((c) => c.isPrimary) || investorContacts[0] || null;
}

/**
 * Return investors whose governanceSensitivity.level === 'high'.
 */
function getGovernanceSensitiveInvestors() {
  return investorStates
    .filter((s) => s.governanceSensitivity && s.governanceSensitivity.level === 'high')
    .map((s) => {
      const inv = getInvestor(s.investorId);
      return inv ? { ...inv, govState: s } : null;
    })
    .filter(Boolean);
}

/**
 * Count governance_engagement actions that are completed.
 */
function countCompletedGovernanceEngagements() {
  return actions.filter(
    (a) => a.type === 'governance_engagement' && (a.state === 'completed' || a.status === 'completed'),
  ).length;
}

/**
 * Count open (non-resolved) governance_management signals.
 */
function countOpenGovernanceSignals() {
  return signals.filter(
    (s) => s.type === 'governance_management' && s.state !== 'resolved',
  ).length;
}

/**
 * Calculate days until AGM from the current mock date.
 */
function daysUntilAGM() {
  const diff = AGM_DATE.getTime() - CURRENT_DATE.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Determine ISS alignment label based on investor type.
 */
function getISSAlignment(investor) {
  if (investor.type === 'index-fund') return { label: 'High (85%)', value: 85 };
  if (investor.type === 'pension-fund') return { label: 'High (85%)', value: 85 };
  return { label: 'Medium (70%)', value: 70 };
}

/**
 * Predict vote on board composition.
 * If board diversity (38%) is below ISS 40% threshold and investor is
 * ISS-aligned (high alignment), flag as "At risk".
 */
function predictBoardVote(investor, issAlignment) {
  const govState = getInvestorState(investor.id);
  const topics = govState?.governanceSensitivity?.topics || [];
  const hasBoardTopic = topics.some((t) =>
    /board\s*(diversity|composition)/i.test(t),
  );

  if (
    BOARD_DIVERSITY_PERCENT < ISS_DIVERSITY_THRESHOLD &&
    issAlignment.value >= 70 &&
    hasBoardTopic
  ) {
    return 'At risk';
  }
  return 'Support';
}

/**
 * Predict vote on compensation.
 */
function predictCompensationVote(investor) {
  const govState = getInvestorState(investor.id);
  const topics = govState?.governanceSensitivity?.topics || [];
  const hasCompTopic = topics.some((t) =>
    /executive\s*(compensation|pay)|exec.*comp/i.test(t),
  );
  return hasCompTopic ? 'Neutral' : 'Support';
}

/**
 * Find governance_engagement actions for a given investor.
 */
function getGovernanceActions(investorId) {
  return actions.filter(
    (a) =>
      a.type === 'governance_engagement' &&
      (a.investorId === investorId ||
        (a.investorIds && a.investorIds.includes(investorId))),
  );
}

/**
 * Find the most recent governance-related timeline event for an investor.
 */
function getLastGovernanceEvent(investorId) {
  const govEvents = timelineEvents
    .filter(
      (e) =>
        e.investorId === investorId &&
        (/governance/i.test(e.title) || /governance/i.test(e.description || '')),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return govEvents[0] || null;
}

/**
 * List investors with specific governance topics.
 */
function investorsWithTopic(topicPattern) {
  const re = new RegExp(topicPattern, 'i');
  return getGovernanceSensitiveInvestors().filter((inv) => {
    const topics = inv.govState.governanceSensitivity.topics || [];
    return topics.some((t) => re.test(t));
  });
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function renderSensitivityBadge(level) {
  const cls =
    level === 'high'
      ? 'ic-badge ic-badge--danger'
      : level === 'medium'
        ? 'ic-badge ic-badge--warning'
        : 'ic-badge ic-badge--info';
  return `<span class="${cls}">${escapeHtml(level)}</span>`;
}

function renderVoteBadge(prediction) {
  if (prediction === 'Support') {
    return '<span class="ic-badge ic-badge--success">Support</span>';
  }
  if (prediction === 'At risk') {
    return '<span class="ic-badge ic-badge--warning">At risk</span>';
  }
  if (prediction === 'Against') {
    return '<span class="ic-badge ic-badge--danger">Against</span>';
  }
  return '<span class="ic-badge ic-badge--info">Neutral</span>';
}

function renderRiskBadge(level) {
  if (level === 'high') {
    return '<span class="ic-badge ic-badge--danger">High</span>';
  }
  if (level === 'medium') {
    return '<span class="ic-badge ic-badge--warning">Medium</span>';
  }
  return '<span class="ic-badge ic-badge--success">Low</span>';
}

function renderEngagementStatus(investorId) {
  const govActions = getGovernanceActions(investorId);
  if (govActions.length === 0) {
    return '<span class="ic-badge ic-badge--danger">Not planned</span>';
  }

  const completed = govActions.find(
    (a) => a.state === 'completed' || a.status === 'completed',
  );
  if (completed) {
    return '<span class="ic-badge ic-badge--success">Completed</span>';
  }

  const inProgress = govActions.find(
    (a) =>
      a.state === 'in_progress' ||
      a.state === 'preparing' ||
      a.state === 'planned',
  );
  if (inProgress) {
    return '<span class="ic-badge ic-badge--warning">Scheduled</span>';
  }

  return '<span class="ic-badge ic-badge--info">Pending</span>';
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

function renderSummaryBar() {
  const days = daysUntilAGM();
  const govSensitiveCount = getGovernanceSensitiveInvestors().length;
  const completedEngagements = countCompletedGovernanceEngagements();
  const openGovSignals = countOpenGovernanceSignals();

  return `
    <div class="ic-summary-bar">
      <div class="ic-summary-stat">
        <span class="ic-summary-stat__value">${days} days</span>
        <span class="ic-summary-stat__label">Days until AGM</span>
      </div>
      <div class="ic-summary-stat">
        <span class="ic-summary-stat__value">${govSensitiveCount}</span>
        <span class="ic-summary-stat__label">Governance-sensitive investors</span>
      </div>
      <div class="ic-summary-stat">
        <span class="ic-summary-stat__value">${completedEngagements}</span>
        <span class="ic-summary-stat__label">Pre-AGM engagements completed</span>
      </div>
      <div class="ic-summary-stat">
        <span class="ic-summary-stat__value">${openGovSignals}</span>
        <span class="ic-summary-stat__label">Open governance signals</span>
      </div>
    </div>`;
}

function renderPredictedVotingTable() {
  const govInvestors = getGovernanceSensitiveInvestors();

  const rows = govInvestors
    .map((inv) => {
      const issAlignment = getISSAlignment(inv);
      const boardVote = predictBoardVote(inv, issAlignment);
      const compVote = predictCompensationVote(inv);
      const topics = inv.govState.governanceSensitivity.topics || [];

      return `
        <tr>
          <td><a href="#/investors/${escapeHtml(inv.id)}" class="ic-link" data-nav="investor">${escapeHtml(inv.name)}</a></td>
          <td>${formatPercent(inv.holdingPercent)}</td>
          <td>${renderSensitivityBadge(inv.govState.governanceSensitivity.level)}</td>
          <td>${topics.map((t) => `<span class="ic-tag">${escapeHtml(t)}</span>`).join(' ')}</td>
          <td>${escapeHtml(issAlignment.label)}</td>
          <td>${renderVoteBadge(boardVote)}</td>
          <td>${renderVoteBadge(compVote)}</td>
          <td>${renderEngagementStatus(inv.id)}</td>
        </tr>`;
    })
    .join('');

  return `
    <section class="ic-section">
      <h2 class="ic-section__title">Predicted voting behavior</h2>
      <div class="ic-table-wrapper">
        <table class="ic-table">
          <thead>
            <tr>
              <th>Investor</th>
              <th>Holding %</th>
              <th>Governance sensitivity</th>
              <th>Key topics</th>
              <th>ISS alignment</th>
              <th>Board composition</th>
              <th>Compensation</th>
              <th>Engagement status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
}

function renderGovernanceIssueTracker() {
  const boardDiversityInvestors = investorsWithTopic('board\\s*(diversity|composition)');
  const compInvestors = investorsWithTopic('executive\\s*(compensation|pay)|exec.*comp');

  const boardInvestorNames =
    boardDiversityInvestors.length > 0
      ? boardDiversityInvestors.map((inv) => escapeHtml(inv.name)).join(', ')
      : 'None identified';

  const compInvestorNames =
    compInvestors.length > 0
      ? compInvestors.map((inv) => escapeHtml(inv.name)).join(', ')
      : 'None identified';

  const issues = [
    {
      title: 'Board composition and re-election',
      risk: 'medium',
      issue: `Board gender diversity at ${BOARD_DIVERSITY_PERCENT}%, below new ISS ${ISS_DIVERSITY_THRESHOLD}% threshold`,
      objectors: boardInvestorNames,
      action: 'Present concrete 40% roadmap to all governance-sensitive investors before ISS report',
    },
    {
      title: 'Executive compensation resolution',
      risk: 'low',
      issue: 'Standard say-on-pay proposal',
      objectors: compInvestorNames,
      action: 'Prepare compensation rationale brief for governance-focused investors',
    },
    {
      title: 'Sustainability targets approval',
      risk: 'low',
      issue: 'Proposal to approve updated Science Based Targets',
      objectors: 'None identified \u2014 broad support expected',
      action: 'Standard communication sufficient',
    },
  ];

  const cards = issues
    .map(
      (item) => `
      <div class="ic-card ic-card--issue">
        <div class="ic-card__header">
          <h3 class="ic-card__title">${escapeHtml(item.title)}</h3>
          ${renderRiskBadge(item.risk)}
        </div>
        <dl class="ic-card__details">
          <dt>Issue</dt>
          <dd>${escapeHtml(item.issue)}</dd>
          <dt>Investors who may object</dt>
          <dd>${item.objectors}</dd>
          <dt>Recommended action</dt>
          <dd>${escapeHtml(item.action)}</dd>
        </dl>
      </div>`,
    )
    .join('');

  return `
    <section class="ic-section">
      <h2 class="ic-section__title">Governance issue tracker</h2>
      <div class="ic-card-grid">${cards}</div>
    </section>`;
}

function renderPreAGMEngagementPlan() {
  const govInvestors = getGovernanceSensitiveInvestors();

  const cards = govInvestors
    .map((inv) => {
      const contact = getGovernanceContact(inv.id);
      const topics = inv.govState.governanceSensitivity.topics || [];
      const govActions = getGovernanceActions(inv.id);
      const lastGovEvent = getLastGovernanceEvent(inv.id);

      // Engagement status detail
      let statusHtml = '';
      const completedAction = govActions.find(
        (a) => a.state === 'completed' || a.status === 'completed',
      );
      const scheduledAction = govActions.find(
        (a) =>
          a.state === 'in_progress' ||
          a.state === 'preparing' ||
          a.state === 'planned',
      );

      if (completedAction) {
        const outcomeText = completedAction.outcome
          ? escapeHtml(completedAction.outcome.whatHappened)
          : 'Engagement completed';
        const completedDate = completedAction.dueDate
          ? formatDate(completedAction.dueDate)
          : 'Date not recorded';
        statusHtml = `
          <div class="ic-engagement-status ic-engagement-status--completed">
            <span class="ic-badge ic-badge--success">Completed</span>
            <span class="ic-engagement-status__date">${completedDate}</span>
            <p class="ic-engagement-status__outcome">${outcomeText}</p>
          </div>`;
      } else if (scheduledAction) {
        const dueDate = scheduledAction.dueDate
          ? formatDate(scheduledAction.dueDate)
          : 'TBD';
        statusHtml = `
          <div class="ic-engagement-status ic-engagement-status--scheduled">
            <span class="ic-badge ic-badge--warning">Scheduled</span>
            <span class="ic-engagement-status__date">Due: ${dueDate}</span>
          </div>`;
      } else {
        statusHtml = `
          <div class="ic-engagement-status ic-engagement-status--not-planned">
            <span class="ic-badge ic-badge--danger">Not yet planned</span>
            <a href="#/actions/new" class="ic-btn ic-btn--sm" data-action="create-engagement">Create action</a>
          </div>`;
      }

      const lastGovDateHtml = lastGovEvent
        ? `<span class="ic-meta">${formatDate(lastGovEvent.date)}</span>`
        : '<span class="ic-meta">No governance interaction recorded</span>';

      return `
        <div class="ic-card ic-card--engagement">
          <div class="ic-card__header">
            <h3 class="ic-card__title">${escapeHtml(inv.name)}</h3>
            <span class="ic-card__holding">${formatPercent(inv.holdingPercent)}</span>
          </div>
          <dl class="ic-card__details">
            <dt>Primary governance contact</dt>
            <dd>${contact ? escapeHtml(contact.name) + ' \u2014 ' + escapeHtml(contact.role) : 'Not identified'}</dd>
            <dt>Key concerns</dt>
            <dd>${topics.map((t) => `<span class="ic-tag">${escapeHtml(t)}</span>`).join(' ') || 'None specified'}</dd>
            <dt>Engagement status</dt>
            <dd>${statusHtml}</dd>
            <dt>Last governance interaction</dt>
            <dd>${lastGovDateHtml}</dd>
          </dl>
        </div>`;
    })
    .join('');

  return `
    <section class="ic-section">
      <h2 class="ic-section__title">Pre-AGM engagement plan</h2>
      <div class="ic-card-grid">${cards}</div>
    </section>`;
}

function renderHistoricalVotingOutcomes() {
  const historicalData = [
    { year: 2025, board: 94, compensation: 88, sustainability: 96 },
    { year: 2024, board: 91, compensation: 85, sustainability: null },
    { year: 2023, board: 89, compensation: 82, sustainability: null },
  ];

  const rows = historicalData
    .map(
      (row) => `
      <tr>
        <td>${row.year} AGM</td>
        <td>${row.board}% support</td>
        <td>${row.compensation}% support</td>
        <td>${row.sustainability !== null ? row.sustainability + '% support' : '\u2014'}</td>
      </tr>`,
    )
    .join('');

  return `
    <section class="ic-section">
      <h2 class="ic-section__title">Historical voting outcomes</h2>
      <div class="ic-table-wrapper">
        <table class="ic-table">
          <thead>
            <tr>
              <th>AGM</th>
              <th>Board re-election</th>
              <th>Compensation</th>
              <th>Sustainability</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="ic-section__trend">
        <strong>Trend:</strong> Board support improving, Compensation stable
      </p>
    </section>`;
}

// ---------------------------------------------------------------------------
// Main render
// ---------------------------------------------------------------------------

/**
 * Render the AGM & Proxy Intelligence view into the given container element.
 * @param {HTMLElement} container - Target DOM element
 */
export function renderAGMIntelligence(container) {
  const html = `
    <div class="ic-page ic-page--agm-intelligence">
      <header class="ic-page__header">
        <h1 class="ic-page__title">AGM and proxy intelligence</h1>
        <p class="ic-page__subtitle">Governance season preparation and voting behavior analysis</p>
      </header>

      ${renderSummaryBar()}
      ${renderPredictedVotingTable()}
      ${renderGovernanceIssueTracker()}
      ${renderPreAGMEngagementPlan()}
      ${renderHistoricalVotingOutcomes()}
    </div>`;

  container.innerHTML = html;

  // ------------------------------------------------------------------
  // Event delegation
  // ------------------------------------------------------------------
  container.addEventListener('click', (e) => {
    const link = e.target.closest('[data-nav="investor"]');
    if (link) {
      // Hash navigation handled by the router; no extra logic needed.
      return;
    }

    const createBtn = e.target.closest('[data-action="create-engagement"]');
    if (createBtn) {
      // Navigation to action creation is handled via the href.
      return;
    }
  });
}
