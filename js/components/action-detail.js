/**
 * Investor Care OS - Action Detail / Form Component
 *
 * Renders a full action detail page with lifecycle stepper, form fields,
 * context sidebar, preparation brief, and action buttons.
 * Supports both creating new actions (optionally pre-filled from a signal)
 * and editing existing ones.
 */

import {
  actions,
  investors,
  contacts,
  teamMembers,
  signals,
  timelineEvents,
  investorStates as investorState,
} from '../data/mock-data.js';

import {
  formatDate,
  formatDateRelative,
  truncate,
  escapeHtml,
  renderTemplate,
  getUrgencyClass,
  getProvenanceLabel,
  showToast,
} from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TODAY = '2026-04-01';

const ACTION_STATES_ORDERED = [
  { key: 'planned', label: 'Planned' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'awaiting_logging', label: 'Awaiting Logging' },
  { key: 'completed', label: 'Completed' },
];

const CANCELLED_STATE = { key: 'cancelled', label: 'Cancelled' };

const ACTION_TYPES = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'internal_task', label: 'Internal Task' },
  { value: 'roadshow_outreach', label: 'Roadshow Outreach' },
  { value: 'governance_engagement', label: 'Governance Engagement' },
];

const CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'in_person', label: 'In Person' },
  { value: 'video', label: 'Video' },
];

const OBJECTIVE_MET_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'partially', label: 'Partially' },
];

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

/**
 * Normalise an action record so it works with both old and new mock-data
 * schemas (status vs state, assigneeId vs ownerId, etc.).
 */
function normaliseAction(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    state: raw.state || raw.status || 'planned',
    type: raw.type || 'internal_task',
    investorId: raw.investorId || (raw.investorIds && raw.investorIds[0]) || '',
    contactId: raw.contactId || '',
    objective: raw.objective || raw.title || '',
    ownerId: raw.ownerId || raw.assigneeId || '',
    dueDate: raw.dueDate || '',
    channel: raw.channel || '',
    linkedSignalId: raw.linkedSignalId || raw.signalId || '',
    talkingPoints: raw.talkingPoints || '',
    messageAngle: raw.messageAngle || '',
    successCriteria: raw.successCriteria || '',
    outcomeWhat: raw.outcomeWhat || '',
    outcomeLearned: raw.outcomeLearned || '',
    objectiveMet: raw.objectiveMet || '',
    outcomeNewInfo: raw.outcomeNewInfo || '',
    cancelReason: raw.cancelReason || '',
    notes: raw.notes || '',
    createdAt: raw.createdAt || '',
  };
}

function findAction(actionId) {
  const raw = actions.find((a) => a.id === actionId);
  return normaliseAction(raw);
}

function findSignal(signalId) {
  if (!signalId) return null;
  return signals.find((s) => s.id === signalId) || null;
}

function findInvestor(investorId) {
  return investors.find((i) => i.id === investorId) || null;
}

function contactsForInvestor(investorId) {
  if (!contacts || !investorId) return [];
  return contacts.filter((c) => c.investorId === investorId);
}

function contactLabel(c) {
  if (!c) return '';
  if (c.name) return c.name;
  if (c.firstName) return `${c.firstName} ${c.lastName || ''}`.trim();
  return c.id;
}

function teamMemberLabel(m) {
  if (!m) return '';
  if (m.name) return m.name;
  if (m.firstName) return `${m.firstName} ${m.lastName || ''}`.trim();
  return m.id;
}

function teamMemberInitials(m) {
  if (!m) return '??';
  if (m.initials) return m.initials;
  if (m.name) {
    const parts = m.name.split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return '??';
}

function actionsForInvestor(investorId) {
  if (!investorId) return [];
  return actions
    .filter((a) => {
      const iid = a.investorId || (a.investorIds && a.investorIds[0]) || '';
      return iid === investorId;
    })
    .map(normaliseAction);
}

function timelineForInvestor(investorId) {
  if (!timelineEvents || !investorId) return [];
  return timelineEvents
    .filter((e) => e.investorId === investorId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function stateForInvestor(investorId) {
  if (!investorState || !investorId) return null;
  return investorState.find((s) => s.investorId === investorId) || null;
}

function nextState(currentState) {
  const idx = ACTION_STATES_ORDERED.findIndex((s) => s.key === currentState);
  if (idx >= 0 && idx < ACTION_STATES_ORDERED.length - 1) {
    return ACTION_STATES_ORDERED[idx + 1];
  }
  return null;
}

function formatTypeLabel(type) {
  if (!type) return '\u2014';
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Lifecycle stepper
// ---------------------------------------------------------------------------

function renderLifecycleStepper(currentStateKey) {
  const isCancelled = currentStateKey === 'cancelled';
  const currentIdx = ACTION_STATES_ORDERED.findIndex((s) => s.key === currentStateKey);

  const steps = ACTION_STATES_ORDERED.map((s, i) => {
    let cls = 'stepper-step';
    if (isCancelled) {
      cls += ' stepper-step--dimmed';
    } else if (i < currentIdx) {
      cls += ' stepper-step--completed';
    } else if (i === currentIdx) {
      cls += ' stepper-step--current';
    } else {
      cls += ' stepper-step--upcoming';
    }
    return `
      <div class="${cls}">
        <div class="stepper-step__indicator">
          ${i < currentIdx && !isCancelled ? '<span class="stepper-check">\u2713</span>' : `<span class="stepper-number">${i + 1}</span>`}
        </div>
        <div class="stepper-step__label">${s.label}</div>
      </div>
      ${i < ACTION_STATES_ORDERED.length - 1 ? '<div class="stepper-connector' + (i < currentIdx && !isCancelled ? ' stepper-connector--completed' : '') + '"></div>' : ''}`;
  }).join('');

  const cancelledBranch = `
    <div class="stepper-cancelled-branch ${isCancelled ? 'stepper-cancelled-branch--active' : ''}">
      <div class="stepper-connector stepper-connector--branch"></div>
      <div class="stepper-step ${isCancelled ? 'stepper-step--cancelled-active' : 'stepper-step--cancelled'}">
        <div class="stepper-step__indicator stepper-step__indicator--cancelled">
          ${isCancelled ? '<span class="stepper-check">\u2717</span>' : '<span class="stepper-number">\u2717</span>'}
        </div>
        <div class="stepper-step__label">Cancelled</div>
      </div>
    </div>`;

  return `
    <div class="action-lifecycle-stepper">
      <div class="stepper-main">${steps}</div>
      ${cancelledBranch}
    </div>`;
}

// ---------------------------------------------------------------------------
// Form area (left side)
// ---------------------------------------------------------------------------

function renderFormArea(action, signalData) {
  const inv = findInvestor(action.investorId);
  const invContacts = contactsForInvestor(action.investorId);
  const showOutcome = action.state === 'awaiting_logging' || action.state === 'completed';

  // Contact dropdown
  const contactOptions = invContacts.length
    ? invContacts
        .map(
          (c) =>
            `<option value="${c.id}" ${action.contactId === c.id ? 'selected' : ''}>${escapeHtml(contactLabel(c))}</option>`,
        )
        .join('')
    : '<option value="">No contacts available</option>';

  // Investor dropdown
  const investorOptions = investors
    .map(
      (i) =>
        `<option value="${i.id}" ${action.investorId === i.id ? 'selected' : ''}>${escapeHtml(i.name)}</option>`,
    )
    .join('');

  // Action type dropdown
  const typeOptions = ACTION_TYPES.map(
    (t) =>
      `<option value="${t.value}" ${action.type === t.value ? 'selected' : ''}>${t.label}</option>`,
  ).join('');

  // Owner dropdown
  const ownerOptions = teamMembers
    .map(
      (m) =>
        `<option value="${m.id}" ${action.ownerId === m.id ? 'selected' : ''}>${escapeHtml(teamMemberLabel(m))}</option>`,
    )
    .join('');

  // Channel dropdown
  const channelOptions = CHANNELS.map(
    (ch) =>
      `<option value="${ch.value}" ${action.channel === ch.value ? 'selected' : ''}>${ch.label}</option>`,
  ).join('');

  // Talking points: show as bullet list if pre-filled
  const talkingPointsValue = action.talkingPoints || '';
  const talkingPointsDisplay = talkingPointsValue && talkingPointsValue.includes('\n')
    ? talkingPointsValue
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => (line.startsWith('- ') || line.startsWith('* ') ? line : `- ${line}`))
        .join('\n')
    : talkingPointsValue;

  // Objective met dropdown
  const objectiveMetOptions = OBJECTIVE_MET_OPTIONS.map(
    (o) =>
      `<option value="${o.value}" ${action.objectiveMet === o.value ? 'selected' : ''}>${o.label}</option>`,
  ).join('');

  return `
    <div class="action-form-area">
      <div class="form-row">
        <label class="form-field">
          <span class="form-label">Investor</span>
          <select name="investorId" class="form-select" data-field="investorId">
            <option value="">Select investor...</option>
            ${investorOptions}
          </select>
        </label>
        <label class="form-field">
          <span class="form-label">Contact</span>
          <select name="contactId" class="form-select" data-field="contactId">
            <option value="">Select contact...</option>
            ${contactOptions}
          </select>
        </label>
      </div>

      <div class="form-row">
        <label class="form-field">
          <span class="form-label">Action Type</span>
          <select name="type" class="form-select" data-field="type">
            <option value="">Select type...</option>
            ${typeOptions}
          </select>
        </label>
        <label class="form-field">
          <span class="form-label">Channel</span>
          <select name="channel" class="form-select" data-field="channel">
            <option value="">Select channel...</option>
            ${channelOptions}
          </select>
        </label>
      </div>

      <div class="form-row">
        <label class="form-field form-field--full">
          <span class="form-label">Objective <span class="form-required">*</span></span>
          <input type="text" name="objective" class="form-input" data-field="objective"
                 value="${escapeHtml(action.objective)}" required
                 placeholder="What is the primary goal of this action?" />
        </label>
      </div>

      <div class="form-row">
        <label class="form-field">
          <span class="form-label">Owner <span class="form-required">*</span></span>
          <select name="ownerId" class="form-select" data-field="ownerId" required>
            <option value="">Select owner...</option>
            ${ownerOptions}
          </select>
        </label>
        <label class="form-field">
          <span class="form-label">Due Date <span class="form-required">*</span></span>
          <input type="date" name="dueDate" class="form-input" data-field="dueDate"
                 value="${action.dueDate}" required />
        </label>
      </div>

      <div class="form-row">
        <label class="form-field form-field--full">
          <span class="form-label">Talking Points</span>
          <textarea name="talkingPoints" class="form-textarea" data-field="talkingPoints"
                    rows="4" placeholder="Key points to cover during the interaction...">${escapeHtml(talkingPointsDisplay)}</textarea>
        </label>
      </div>

      <div class="form-row">
        <label class="form-field form-field--full">
          <span class="form-label">Message Angle</span>
          <textarea name="messageAngle" class="form-textarea" data-field="messageAngle"
                    rows="3" placeholder="How should this conversation be framed?">${escapeHtml(action.messageAngle)}</textarea>
        </label>
      </div>

      <div class="form-row">
        <label class="form-field form-field--full">
          <span class="form-label">Success Criteria</span>
          <textarea name="successCriteria" class="form-textarea" data-field="successCriteria"
                    rows="3" placeholder="How will we know this action was successful?">${escapeHtml(action.successCriteria)}</textarea>
        </label>
      </div>

      ${showOutcome ? renderOutcomeSection(action, objectiveMetOptions) : ''}
    </div>`;
}

// ---------------------------------------------------------------------------
// Outcome section (shown for awaiting_logging / completed)
// ---------------------------------------------------------------------------

function renderOutcomeSection(action, objectiveMetOptions) {
  return `
    <div class="action-outcome-section">
      <h3 class="outcome-heading">Outcome</h3>

      <div class="form-row">
        <label class="form-field form-field--full">
          <span class="form-label">What happened</span>
          <textarea name="outcomeWhat" class="form-textarea" data-field="outcomeWhat"
                    rows="4" placeholder="Describe what happened during this interaction...">${escapeHtml(action.outcomeWhat)}</textarea>
        </label>
      </div>

      <div class="form-row">
        <label class="form-field form-field--full">
          <span class="form-label">What was learned</span>
          <textarea name="outcomeLearned" class="form-textarea" data-field="outcomeLearned"
                    rows="4" placeholder="Key takeaways and insights...">${escapeHtml(action.outcomeLearned)}</textarea>
        </label>
      </div>

      <div class="form-row">
        <label class="form-field">
          <span class="form-label">Objective met</span>
          <select name="objectiveMet" class="form-select" data-field="objectiveMet">
            <option value="">Select...</option>
            ${objectiveMetOptions}
          </select>
        </label>
      </div>

      <div class="form-row">
        <label class="form-field form-field--full">
          <span class="form-label">New information</span>
          <textarea name="outcomeNewInfo" class="form-textarea" data-field="outcomeNewInfo"
                    rows="3" placeholder="Any new information discovered...">${escapeHtml(action.outcomeNewInfo)}</textarea>
        </label>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Context sidebar (right side)
// ---------------------------------------------------------------------------

function renderContextSidebar(action) {
  const signal = findSignal(action.linkedSignalId);
  const inv = findInvestor(action.investorId);
  const openActions = actionsForInvestor(action.investorId).filter(
    (a) => a.state !== 'completed' && a.state !== 'cancelled',
  );
  const recentTimeline = timelineForInvestor(action.investorId).slice(0, 5);
  const state = stateForInvestor(action.investorId);

  let sections = '';

  // Linked signal summary card
  if (signal) {
    const urgencyClass = getUrgencyClass(signal.urgency);
    const evidence = signal.observedFacts || signal.description || '';
    sections += `
      <div class="sidebar-card sidebar-card--signal">
        <h4 class="sidebar-card__title">Linked Signal</h4>
        <div class="sidebar-signal-summary">
          <span class="ic-badge ${urgencyClass}">${escapeHtml((signal.urgency || '').charAt(0).toUpperCase() + (signal.urgency || '').slice(1))}</span>
          <span class="ic-badge ic-badge--type">${escapeHtml(formatTypeLabel(signal.type))}</span>
        </div>
        <p class="sidebar-signal-title">${escapeHtml(signal.title || '')}</p>
        ${evidence ? `
          <div class="sidebar-evidence">
            <h5 class="sidebar-evidence__title">Key Evidence</h5>
            <p class="sidebar-evidence__text">${escapeHtml(typeof evidence === 'string' ? evidence : JSON.stringify(evidence))}</p>
          </div>
        ` : ''}
      </div>`;
  }

  // Open actions for this investor
  if (openActions.length > 0) {
    const actionItems = openActions
      .map(
        (a) => `
        <li class="sidebar-action-item ${a.id === action.id ? 'sidebar-action-item--current' : ''}">
          <span class="sidebar-action-type">${formatTypeLabel(a.type)}</span>
          <span class="sidebar-action-objective">${escapeHtml(truncate(a.objective, 40))}</span>
          <span class="sidebar-action-due">${a.dueDate ? formatDate(a.dueDate) : '\u2014'}</span>
        </li>`,
      )
      .join('');
    sections += `
      <div class="sidebar-card sidebar-card--actions">
        <h4 class="sidebar-card__title">Open Actions for ${inv ? escapeHtml(truncate(inv.name, 25)) : 'Investor'}</h4>
        <ul class="sidebar-actions-list">${actionItems}</ul>
      </div>`;
  }

  // Recent timeline
  if (recentTimeline.length > 0) {
    const timelineItems = recentTimeline
      .map(
        (evt) => `
        <li class="sidebar-timeline-item">
          <span class="sidebar-timeline-date">${formatDate(evt.date)}</span>
          <span class="sidebar-timeline-title">${escapeHtml(truncate(evt.title || evt.type || '', 40))}</span>
        </li>`,
      )
      .join('');
    sections += `
      <div class="sidebar-card sidebar-card--timeline">
        <h4 class="sidebar-card__title">Recent Timeline</h4>
        <ul class="sidebar-timeline-list">${timelineItems}</ul>
      </div>`;
  }

  // Investor state summary
  if (state) {
    const params = [
      ...(state.observed || []),
      ...(state.inferred || []),
      ...(state.teamAssessed || []),
    ].slice(0, 6);
    if (params.length > 0) {
      const metricRows = params
        .map(
          (p) => `
          <div class="sidebar-metric">
            <span class="sidebar-metric__label">${escapeHtml(p.label || '')}</span>
            <span class="sidebar-metric__value">${escapeHtml(String(p.value != null ? p.value : '\u2014'))}</span>
            <span class="sidebar-metric__provenance badge badge--provenance">${escapeHtml(getProvenanceLabel(p.provenance || ''))}</span>
          </div>`,
        )
        .join('');
      sections += `
        <div class="sidebar-card sidebar-card--state">
          <h4 class="sidebar-card__title">Investor State Summary</h4>
          <div class="sidebar-metrics">${metricRows}</div>
        </div>`;
    }
  } else if (inv) {
    // Fallback: show basic investor info from the investors array
    sections += `
      <div class="sidebar-card sidebar-card--state">
        <h4 class="sidebar-card__title">Investor Summary</h4>
        <div class="sidebar-metrics">
          <div class="sidebar-metric">
            <span class="sidebar-metric__label">Holding</span>
            <span class="sidebar-metric__value">${inv.holdingPercent != null ? inv.holdingPercent + '%' : '\u2014'}</span>
          </div>
          <div class="sidebar-metric">
            <span class="sidebar-metric__label">Trend</span>
            <span class="sidebar-metric__value">${escapeHtml(inv.holdingTrend || '\u2014')}</span>
          </div>
          <div class="sidebar-metric">
            <span class="sidebar-metric__label">Priority Tier</span>
            <span class="sidebar-metric__value">${inv.priorityTier || '\u2014'}</span>
          </div>
          <div class="sidebar-metric">
            <span class="sidebar-metric__label">Engagement</span>
            <span class="sidebar-metric__value">${escapeHtml(inv.engagementStatus || '\u2014')}</span>
          </div>
        </div>
      </div>`;
  }

  if (!sections) {
    sections = '<p class="sidebar-empty">No contextual information available.</p>';
  }

  return `<aside class="action-context-sidebar">${sections}</aside>`;
}

// ---------------------------------------------------------------------------
// Preparation brief (collapsible)
// ---------------------------------------------------------------------------

function renderPreparationBrief(action) {
  const inv = findInvestor(action.investorId);
  const recentTimeline = timelineForInvestor(action.investorId).slice(0, 5);
  const state = stateForInvestor(action.investorId);

  // Recent interaction history with this contact
  let contactHistory = '';
  if (action.contactId && timelineEvents) {
    const contactEvents = timelineEvents
      .filter(
        (e) =>
          e.contactId === action.contactId &&
          ['call', 'meeting', 'email'].includes(e.type),
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    if (contactEvents.length > 0) {
      const items = contactEvents
        .map(
          (e) =>
            `<li class="prep-item">${formatDate(e.date)} - ${escapeHtml(e.title || e.type)} ${e.description ? ': ' + escapeHtml(truncate(e.description, 80)) : ''}</li>`,
        )
        .join('');
      contactHistory = `
        <div class="prep-section">
          <h5 class="prep-section__title">Recent Interaction History with Contact</h5>
          <ul class="prep-list">${items}</ul>
        </div>`;
    }
  }

  // Current investor state summary
  let stateSummary = '';
  if (state) {
    const allParams = [
      ...(state.observed || []),
      ...(state.inferred || []),
      ...(state.teamAssessed || []),
    ].slice(0, 8);
    if (allParams.length > 0) {
      const rows = allParams
        .map(
          (p) =>
            `<li class="prep-item"><strong>${escapeHtml(p.label || '')}:</strong> ${escapeHtml(String(p.value != null ? p.value : '\u2014'))} <em>(${escapeHtml(getProvenanceLabel(p.provenance || ''))})</em></li>`,
        )
        .join('');
      stateSummary = `
        <div class="prep-section">
          <h5 class="prep-section__title">Current Investor State</h5>
          <ul class="prep-list">${rows}</ul>
        </div>`;
    }
  }

  // Relevant recent timeline events
  let timelineSummary = '';
  if (recentTimeline.length > 0) {
    const items = recentTimeline
      .map(
        (e) =>
          `<li class="prep-item">${formatDate(e.date)} - ${escapeHtml(truncate(e.title || e.type || '', 80))}</li>`,
      )
      .join('');
    timelineSummary = `
      <div class="prep-section">
        <h5 class="prep-section__title">Recent Timeline Events</h5>
        <ul class="prep-list">${items}</ul>
      </div>`;
  }

  // Suggested talking points
  const signal = findSignal(action.linkedSignalId);
  let suggestedPoints = '';
  if (signal) {
    const points = [];
    if (signal.description) points.push(signal.description);
    if (signal.recommendedActions && signal.recommendedActions.length > 0) {
      signal.recommendedActions.forEach((ra) => {
        if (ra.talkingPoints) points.push(ra.talkingPoints);
      });
    }
    if (points.length > 0) {
      const items = points
        .map((p) => `<li class="prep-item">${escapeHtml(truncate(p, 120))}</li>`)
        .join('');
      suggestedPoints = `
        <div class="prep-section">
          <h5 class="prep-section__title">Suggested Talking Points</h5>
          <ul class="prep-list">${items}</ul>
        </div>`;
    }
  }

  const hasContent = contactHistory || stateSummary || timelineSummary || suggestedPoints;

  return `
    <details class="action-preparation-brief" ${hasContent ? '' : ''}>
      <summary class="prep-brief-toggle">
        <h3 class="prep-brief-heading">Preparation Brief</h3>
      </summary>
      <div class="prep-brief-body">
        ${hasContent
          ? `${contactHistory}${stateSummary}${timelineSummary}${suggestedPoints}`
          : '<p class="prep-empty">No preparation data available. Add investor and contact details to generate a brief.</p>'}
      </div>
    </details>`;
}

// ---------------------------------------------------------------------------
// Action buttons
// ---------------------------------------------------------------------------

function renderActionButtons(action, isNew) {
  const ns = nextState(action.state);
  const isCancelled = action.state === 'cancelled';
  const isCompleted = action.state === 'completed';

  let buttons = `
    <button type="button" class="btn btn-primary" data-action="save">
      ${isNew ? 'Create Action' : 'Save'}
    </button>`;

  if (!isNew && ns && !isCancelled && !isCompleted) {
    buttons += `
      <button type="button" class="btn btn-secondary" data-action="advance-state"
              data-next-state="${ns.key}">
        Mark as ${ns.label}
      </button>`;
  }

  if (!isNew && !isCancelled && !isCompleted) {
    buttons += `
      <div class="cancel-action-group">
        <button type="button" class="btn btn-danger" data-action="cancel">
          Cancel Action
        </button>
        <input type="text" class="form-input cancel-reason-input" data-field="cancelReason"
               placeholder="Reason for cancellation..."
               value="${escapeHtml(action.cancelReason)}" />
      </div>`;
  }

  return `<div class="action-buttons">${buttons}</div>`;
}

// ---------------------------------------------------------------------------
// Pre-fill from signal
// ---------------------------------------------------------------------------

function prefillFromSignal(action, signal) {
  if (!signal) return action;

  // Use the signal's primary recommended action if available
  const rec =
    signal.recommendedActions && signal.recommendedActions.length > 0
      ? signal.recommendedActions[0]
      : null;

  const prefilled = { ...action };

  // Pre-fill investor from the signal
  if (!prefilled.investorId) {
    prefilled.investorId =
      signal.investorId ||
      (signal.investorIds && signal.investorIds[0]) ||
      '';
  }

  // Pre-fill contact
  if (!prefilled.contactId && signal.contactId) {
    prefilled.contactId = signal.contactId;
  }

  // Pre-fill from recommended action
  if (rec) {
    if (!prefilled.objective && rec.objective) prefilled.objective = rec.objective;
    if (!prefilled.channel && rec.channel) prefilled.channel = rec.channel;
    if (!prefilled.dueDate && rec.dueDate) prefilled.dueDate = rec.dueDate;
    if (!prefilled.type && rec.type) prefilled.type = rec.type;
    if (!prefilled.talkingPoints && rec.talkingPoints) {
      prefilled.talkingPoints =
        Array.isArray(rec.talkingPoints)
          ? rec.talkingPoints.map((tp) => `- ${tp}`).join('\n')
          : rec.talkingPoints;
    }
    if (!prefilled.messageAngle && rec.messageAngle) {
      prefilled.messageAngle = rec.messageAngle;
    }
    if (!prefilled.successCriteria && rec.successCriteria) {
      prefilled.successCriteria = rec.successCriteria;
    }
  }

  // Fallback pre-fills from signal itself
  if (!prefilled.objective && signal.title) {
    prefilled.objective = `Follow up: ${signal.title}`;
  }
  if (!prefilled.dueDate) {
    // Default to 7 days from today
    const due = new Date(TODAY);
    due.setDate(due.getDate() + 7);
    prefilled.dueDate = due.toISOString().split('T')[0];
  }

  return prefilled;
}

// ---------------------------------------------------------------------------
// Event binding
// ---------------------------------------------------------------------------

function bindDetailEvents(container, action, isNew) {
  // Save button
  const saveBtn = container.querySelector('[data-action="save"]');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      // Gather form data
      const fields = container.querySelectorAll('[data-field]');
      const data = {};
      fields.forEach((f) => {
        data[f.dataset.field] = f.value;
      });

      // Validate required fields
      if (!data.objective || !data.objective.trim()) {
        showToast('Objective is required.', 'error');
        return;
      }
      if (!data.ownerId) {
        showToast('Owner is required.', 'error');
        return;
      }
      if (!data.dueDate) {
        showToast('Due date is required.', 'error');
        return;
      }

      // In a real app, this would persist. For the prototype, show a toast.
      showToast(isNew ? 'Action created successfully.' : 'Action saved successfully.', 'success');
    });
  }

  // Advance state button
  const advanceBtn = container.querySelector('[data-action="advance-state"]');
  if (advanceBtn) {
    advanceBtn.addEventListener('click', () => {
      const nextKey = advanceBtn.dataset.nextState;
      showToast(`Action moved to "${formatTypeLabel(nextKey)}".`, 'success');
      // In a real app, update the action state and re-render
    });
  }

  // Cancel button
  const cancelBtn = container.querySelector('[data-action="cancel"]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      const reasonInput = container.querySelector('[data-field="cancelReason"]');
      const reason = reasonInput ? reasonInput.value.trim() : '';
      if (!reason) {
        showToast('Please provide a reason for cancellation.', 'error');
        return;
      }
      showToast('Action cancelled.', 'info');
    });
  }

  // Investor change -> update contact dropdown
  const investorSelect = container.querySelector('[data-field="investorId"]');
  if (investorSelect) {
    investorSelect.addEventListener('change', () => {
      const newInvestorId = investorSelect.value;
      const contactSelect = container.querySelector('[data-field="contactId"]');
      if (contactSelect) {
        const invContacts = contactsForInvestor(newInvestorId);
        let options = '<option value="">Select contact...</option>';
        invContacts.forEach((c) => {
          options += `<option value="${c.id}">${escapeHtml(contactLabel(c))}</option>`;
        });
        if (invContacts.length === 0) {
          options += '<option value="" disabled>No contacts available</option>';
        }
        contactSelect.innerHTML = options;
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Main render
// ---------------------------------------------------------------------------

/**
 * Render the Action Detail / Form page into the provided container element.
 *
 * If actionId is 'new', renders an empty form. Checks URL params for
 * ?signal= to pre-fill from a signal's recommended action.
 * Otherwise, loads the existing action by ID.
 *
 * @param {HTMLElement} container - Target DOM element
 * @param {string}      actionId - Action ID or 'new'
 */
export function renderActionDetail(container, actionId) {
  const isNew = actionId === 'new';
  let action;
  let signalData = null;

  if (isNew) {
    // Check URL params for signal pre-fill
    const urlParams = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
    const signalId = urlParams.get('signal');

    action = {
      id: 'new',
      state: 'planned',
      type: '',
      investorId: '',
      contactId: '',
      objective: '',
      ownerId: '',
      dueDate: '',
      channel: '',
      linkedSignalId: signalId || '',
      talkingPoints: '',
      messageAngle: '',
      successCriteria: '',
      outcomeWhat: '',
      outcomeLearned: '',
      objectiveMet: '',
      outcomeNewInfo: '',
      cancelReason: '',
    };

    if (signalId) {
      signalData = findSignal(signalId);
      action = prefillFromSignal(action, signalData);
    }
  } else {
    action = findAction(actionId);
    if (!action) {
      container.innerHTML = `
        <div class="action-detail-error">
          <h2>Action not found</h2>
          <p>No action with ID "${escapeHtml(actionId)}" was found.</p>
          <a href="#/actions" class="btn btn-secondary">Back to Actions Board</a>
        </div>`;
      return;
    }
    signalData = findSignal(action.linkedSignalId);
  }

  const pageTitle = isNew ? 'New Action' : `Action: ${escapeHtml(truncate(action.objective, 50))}`;

  const html = `
    <article class="action-detail" data-action-id="${escapeHtml(action.id)}">
      <header class="action-detail-header">
        <a href="#/actions" class="action-back-link">\u2190 Back to Actions Board</a>
        <h1 class="action-detail-title">${pageTitle}</h1>
      </header>

      ${renderLifecycleStepper(action.state)}

      <div class="action-detail-layout">
        <div class="action-detail-main">
          ${renderFormArea(action, signalData)}
        </div>
        ${renderContextSidebar(action)}
      </div>

      ${renderPreparationBrief(action)}

      ${renderActionButtons(action, isNew)}
    </article>`;

  renderTemplate(html, container);
  bindDetailEvents(container, action, isNew);
}
