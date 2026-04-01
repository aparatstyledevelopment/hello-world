/**
 * Investor Care OS - Signal Detail Component
 *
 * Investigation surface for a single signal. Follows strict
 * Fact / Inference / Recommendation separation.
 */

import {
  signals,
  investors,
  contacts,
  teamMembers,
  investorStates as investorState,
  timelineEvents,
  actions,
} from '../data/mock-data.js';

import {
  formatDate,
  formatDateRelative,
  daysSince,
  formatPercent,
  formatTrend,
  truncate,
  escapeHtml,
  renderSparkline,
  renderConfidenceBar,
  renderTemplate,
  showToast,
} from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const URGENCY_COLORS = {
  critical: '#dc2626',
  high: '#dc2626',
  medium: '#f59e0b',
  low: '#10b981',
};

const URGENCY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const STATE_LABELS = {
  new: 'New',
  reviewing: 'Reviewing',
  confirmed: 'Confirmed',
  action_created: 'Action Created',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
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

/**
 * Valid state transitions. Each key lists the states reachable from it.
 */
const STATE_TRANSITIONS = {
  new: [
    { target: 'reviewing', label: 'Start review', style: 'primary' },
    { target: 'dismissed', label: 'Dismiss', style: 'danger' },
  ],
  reviewing: [
    { target: 'confirmed', label: 'Confirm', style: 'primary' },
    { target: 'dismissed', label: 'Dismiss', style: 'danger' },
  ],
  confirmed: [
    { target: 'action_created', label: 'Create action', style: 'primary' },
    { target: 'resolved', label: 'Resolve', style: 'secondary' },
  ],
  action_created: [
    { target: 'resolved', label: 'Resolve', style: 'secondary' },
  ],
  resolved: [],
  dismissed: [
    { target: 'new', label: 'Reopen', style: 'secondary' },
  ],
};

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

function findSignal(id) {
  return signals.find((s) => s.id === id) || null;
}

function findInvestor(id) {
  return investors.find((i) => i.id === id) || null;
}

function findContact(id) {
  return contacts.find((c) => c.id === id) || null;
}

function findTeamMember(id) {
  return teamMembers.find((t) => t.id === id) || null;
}

function personName(entity) {
  if (!entity) return 'Unknown';
  return entity.name || `${entity.firstName || ''} ${entity.lastName || ''}`.trim() || 'Unknown';
}

function signalTypeLabel(type) {
  return (
    SIGNAL_TYPE_LABELS[type] ||
    type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function getInvestorState(investorId) {
  if (!investorState) return null;
  if (Array.isArray(investorState)) {
    return investorState.find((s) => s.investorId === investorId) || null;
  }
  return investorState[investorId] || null;
}

function getInvestorTimeline(investorId) {
  if (!timelineEvents) return [];
  return timelineEvents
    .filter((e) => e.investorId === investorId)
    .sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
}

function getInvestorActions(investorId) {
  return actions.filter(
    (a) =>
      a.investorId === investorId &&
      a.state !== 'completed' &&
      a.state !== 'cancelled',
  );
}

function getRelatedSignals(signalId, investorId) {
  return signals.filter(
    (s) => s.id !== signalId && s.investorId === investorId,
  );
}

// ---------------------------------------------------------------------------
// Section 1 - Summary
// ---------------------------------------------------------------------------

function renderSummarySection(signal, investor, contact, owner) {
  const urgencyColor = URGENCY_COLORS[signal.urgency] || '#6b7280';
  const typeBadge = signalTypeLabel(signal.type);
  const investorLabel = investor ? escapeHtml(investor.name) : 'Unknown investor';
  const contactLabel = contact ? escapeHtml(personName(contact)) : '';
  const ownerLabel = owner ? escapeHtml(personName(owner)) : 'Unassigned';
  const created = signal.createdAt ? formatDate(signal.createdAt) : '';
  const age = signal.createdAt ? formatDateRelative(signal.createdAt) : '';

  const summaryText = signal.summary
    || signal.description
    || signal.title
    || 'No summary available.';

  return `
    <section class="sd-section sd-summary" aria-labelledby="sd-summary-heading">
      <h2 id="sd-summary-heading" class="sd-section__title">${escapeHtml(signal.title || 'Signal detail')}</h2>
      <p class="sd-summary__text">${escapeHtml(summaryText)}</p>
      <div class="sd-summary__meta">
        <span class="sd-badge sd-badge--urgency" style="background-color: ${urgencyColor}; color: #fff;">
          ${escapeHtml(URGENCY_LABELS[signal.urgency] || signal.urgency)}
        </span>
        <span class="sd-badge sd-badge--type">${escapeHtml(typeBadge)}</span>
        <span class="sd-badge sd-badge--state sd-state--${escapeHtml(signal.state)}">
          ${escapeHtml(STATE_LABELS[signal.state] || signal.state)}
        </span>
        <span class="sd-meta-item"><strong>Investor:</strong> ${investorLabel}</span>
        ${contactLabel ? `<span class="sd-meta-item"><strong>Contact:</strong> ${contactLabel}</span>` : ''}
        <span class="sd-meta-item"><strong>Owner:</strong> ${ownerLabel}</span>
        <span class="sd-meta-item"><strong>Created:</strong> ${escapeHtml(created)} (${escapeHtml(age)})</span>
      </div>
    </section>`;
}

// ---------------------------------------------------------------------------
// Section 2 - Observed facts
// ---------------------------------------------------------------------------

function renderFactCard(fact) {
  const timestamp = fact.timestamp || fact.date || '';
  const source = fact.source || fact.sourceAttribution || '';
  const baseline = fact.baselineComparison || fact.baseline || '';

  // If holding data points exist, render sparkline
  let sparkline = '';
  const dataPoints = fact.holdingData || fact.dataPoints || fact.values || null;
  if (dataPoints && Array.isArray(dataPoints) && dataPoints.length > 0) {
    sparkline = `<div class="sd-fact__sparkline">${renderSparkline(dataPoints, 120, 32)}</div>`;
  }

  return `
    <div class="sd-fact-card" style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
      <p class="sd-fact__text">${escapeHtml(fact.text || fact.description || '')}</p>
      <div class="sd-fact__meta">
        ${timestamp ? `<span class="sd-fact__timestamp">${escapeHtml(formatDate(timestamp))}</span>` : ''}
        ${source ? `<span class="sd-fact__source">Source: ${escapeHtml(source)}</span>` : ''}
        ${baseline ? `<span class="sd-fact__baseline">Baseline: ${escapeHtml(baseline)}</span>` : ''}
      </div>
      ${sparkline}
    </div>`;
}

function renderObservedFacts(signal) {
  const facts = signal.observedFacts || signal.facts || [];
  if (facts.length === 0) {
    return `
      <section class="sd-section sd-facts" aria-labelledby="sd-facts-heading">
        <h2 id="sd-facts-heading" class="sd-section__title">Observed facts</h2>
        <p class="sd-empty-state">No observed facts recorded.</p>
      </section>`;
  }

  const cards = facts.map(renderFactCard).join('');
  return `
    <section class="sd-section sd-facts" aria-labelledby="sd-facts-heading">
      <h2 id="sd-facts-heading" class="sd-section__title">Observed facts</h2>
      ${cards}
    </section>`;
}

// ---------------------------------------------------------------------------
// Section 3 - Baselines and comparisons
// ---------------------------------------------------------------------------

function renderBaselinesSection(signal, investorId) {
  const state = getInvestorState(investorId);
  const metrics = signal.baselineMetrics || signal.baselines || [];

  // Build rows from explicit metrics on the signal
  let rows = '';
  if (metrics.length > 0) {
    rows = metrics
      .map((m) => {
        return `
        <tr>
          <td class="sd-baselines__cell">${escapeHtml(m.metric || m.name || '')}</td>
          <td class="sd-baselines__cell">${escapeHtml(String(m.currentValue ?? m.current ?? '\u2014'))}</td>
          <td class="sd-baselines__cell">${escapeHtml(String(m.historicalNorm ?? m.investorNorm ?? '\u2014'))}</td>
          <td class="sd-baselines__cell">${escapeHtml(String(m.peerGroupNorm ?? m.peerNorm ?? '\u2014'))}</td>
        </tr>`;
      })
      .join('');
  } else if (state) {
    // Derive from investor state
    const holding = state.currentHolding ?? state.holding;
    const historicalHolding = state.historicalHolding ?? state.averageHolding ?? holding;
    const peerHolding = state.peerAverageHolding ?? state.peerGroupHolding ?? '\u2014';
    const engagement = state.engagementScore ?? state.engagement ?? '\u2014';
    const historicalEngagement = state.historicalEngagement ?? '\u2014';
    const peerEngagement = state.peerEngagement ?? '\u2014';

    rows = `
      <tr>
        <td class="sd-baselines__cell">Holding (%)</td>
        <td class="sd-baselines__cell">${holding != null ? formatPercent(holding) : '\u2014'}</td>
        <td class="sd-baselines__cell">${historicalHolding != null && historicalHolding !== '\u2014' ? formatPercent(historicalHolding) : '\u2014'}</td>
        <td class="sd-baselines__cell">${peerHolding !== '\u2014' ? formatPercent(peerHolding) : '\u2014'}</td>
      </tr>
      <tr>
        <td class="sd-baselines__cell">Engagement score</td>
        <td class="sd-baselines__cell">${engagement !== '\u2014' ? engagement : '\u2014'}</td>
        <td class="sd-baselines__cell">${historicalEngagement}</td>
        <td class="sd-baselines__cell">${peerEngagement}</td>
      </tr>`;
  }

  if (!rows) {
    return `
      <section class="sd-section sd-baselines" aria-labelledby="sd-baselines-heading">
        <h2 id="sd-baselines-heading" class="sd-section__title">Baselines and comparisons</h2>
        <p class="sd-empty-state">No baseline data available.</p>
      </section>`;
  }

  return `
    <section class="sd-section sd-baselines" aria-labelledby="sd-baselines-heading">
      <h2 id="sd-baselines-heading" class="sd-section__title">Baselines and comparisons</h2>
      <div class="sd-table-wrapper">
        <table class="sd-baselines__table">
          <thead>
            <tr>
              <th class="sd-baselines__th">Metric</th>
              <th class="sd-baselines__th">Current value</th>
              <th class="sd-baselines__th">Investor historical norm</th>
              <th class="sd-baselines__th">Peer group norm</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </section>`;
}

// ---------------------------------------------------------------------------
// Section 4 - System interpretation
// ---------------------------------------------------------------------------

function renderInterpretationSection(signal) {
  const interp = signal.interpretation || signal.systemInterpretation || null;
  if (!interp) {
    return `
      <section class="sd-section sd-interpretation" aria-labelledby="sd-interp-heading">
        <h2 id="sd-interp-heading" class="sd-section__title">System interpretation</h2>
        <p class="sd-empty-state">No system interpretation available.</p>
      </section>`;
  }

  const text = interp.text || interp.summary || interp.description || '';
  const confidence = interp.confidence || signal.confidence || 'medium';
  const confidencePercent =
    confidence === 'high' ? 85 : confidence === 'medium' ? 55 : 25;

  // Confidence decomposition
  const factors = interp.factors || interp.confidenceFactors || [];
  let factorsHtml = '';
  if (factors.length > 0) {
    factorsHtml = `
      <div class="sd-interp__factors">
        <h4 class="sd-interp__factors-title">Confidence decomposition</h4>
        ${factors
          .map((f) => {
            const weight = f.weight != null ? f.weight : f.score != null ? f.score : 0;
            const widthPct = Math.min(Math.max(weight, 0), 100);
            return `
            <div class="sd-interp__factor">
              <span class="sd-interp__factor-label">${escapeHtml(f.name || f.factor || '')}</span>
              <div class="sd-interp__factor-bar-bg">
                <div class="sd-interp__factor-bar" style="width: ${widthPct}%;"></div>
              </div>
              <span class="sd-interp__factor-weight">${weight}</span>
            </div>`;
          })
          .join('')}
      </div>`;
  }

  // Limiting factors
  const limitingFactors = interp.limitingFactors || interp.limitations || [];
  let limitingHtml = '';
  if (limitingFactors.length > 0) {
    limitingHtml = `
      <div class="sd-interp__limiting">
        <h4 class="sd-interp__limiting-title">Limiting factors</h4>
        <ul class="sd-interp__limiting-list">
          ${limitingFactors.map((lf) => `<li>${escapeHtml(typeof lf === 'string' ? lf : lf.text || lf.description || '')}</li>`).join('')}
        </ul>
      </div>`;
  }

  return `
    <section class="sd-section sd-interpretation" aria-labelledby="sd-interp-heading">
      <h2 id="sd-interp-heading" class="sd-section__title">System interpretation</h2>
      <div class="sd-interp-card" style="background-color: #fef9f0; border: 1px solid #fde68a; border-radius: 6px; padding: 16px;">
        <div class="sd-interp__label" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #92400e; margin-bottom: 8px;">System interpretation</div>
        <p class="sd-interp__text">${escapeHtml(text)}</p>
        <div class="sd-interp__confidence">
          <span class="sd-interp__confidence-label">Confidence: <strong>${escapeHtml(confidence)}</strong></span>
          <div class="sd-interp__confidence-bar-bg" style="background-color: #e5e7eb; border-radius: 4px; height: 8px; width: 200px; display: inline-block; vertical-align: middle; margin-left: 8px;">
            <div class="sd-interp__confidence-bar" style="background-color: ${confidence === 'high' ? '#10b981' : confidence === 'medium' ? '#f59e0b' : '#ef4444'}; height: 100%; border-radius: 4px; width: ${confidencePercent}%;"></div>
          </div>
        </div>
        ${factorsHtml}
        ${limitingHtml}
      </div>
    </section>`;
}

// ---------------------------------------------------------------------------
// Section 5 - Alternative explanations
// ---------------------------------------------------------------------------

function renderAlternativesSection(signal) {
  const alternatives = signal.alternativeExplanations || signal.alternatives || [];
  if (alternatives.length === 0) {
    return `
      <section class="sd-section sd-alternatives" aria-labelledby="sd-alt-heading">
        <h2 id="sd-alt-heading" class="sd-section__title">Alternative explanations</h2>
        <p class="sd-empty-state">No alternative explanations recorded.</p>
      </section>`;
  }

  const cards = alternatives
    .map((alt) => {
      const explanation = alt.explanation || alt.text || alt.description || '';
      const reasoning = alt.reasoning || alt.whyLower || alt.rationale || '';
      return `
      <div class="sd-alt-card" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
        <p class="sd-alt__explanation">${escapeHtml(explanation)}</p>
        ${reasoning ? `<p class="sd-alt__reasoning" style="color: #6b7280; font-size: 13px; margin-top: 4px;">Weighted lower because: ${escapeHtml(reasoning)}</p>` : ''}
      </div>`;
    })
    .join('');

  return `
    <section class="sd-section sd-alternatives" aria-labelledby="sd-alt-heading">
      <h2 id="sd-alt-heading" class="sd-section__title">Alternative explanations</h2>
      ${cards}
    </section>`;
}

// ---------------------------------------------------------------------------
// Section 6 - Recommended actions
// ---------------------------------------------------------------------------

function renderActionCard(rec, signalId, isPrimary) {
  const contact = rec.contactId ? findContact(rec.contactId) : null;
  const contactLabel = contact ? escapeHtml(personName(contact)) : (rec.contactName ? escapeHtml(rec.contactName) : '');
  const role = rec.contactRole || (contact && contact.role) || (contact && contact.title) || '';
  const channel = rec.channel || '';
  const objective = rec.objective || rec.description || '';
  const timeframe = rec.timeframe || rec.timing || '';
  const messageAngle = rec.messageAngle || rec.angle || '';
  const successCriteria = rec.successCriteria || rec.criteria || '';

  const bgColor = isPrimary ? '#f0fdf4' : '#f9fafb';
  const borderColor = isPrimary ? '#86efac' : '#e5e7eb';

  return `
    <div class="sd-action-card ${isPrimary ? 'sd-action-card--primary' : 'sd-action-card--secondary'}"
         style="background-color: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 6px; padding: ${isPrimary ? '16px' : '12px'}; margin-bottom: 8px;">
      ${isPrimary ? '<div class="sd-action-card__label" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #166534; font-weight: 600; margin-bottom: 8px;">Primary recommendation</div>' : ''}
      ${contactLabel ? `<div class="sd-action__contact"><strong>${contactLabel}</strong>${role ? ` <span style="color: #6b7280;">(${escapeHtml(role)})</span>` : ''}</div>` : ''}
      ${channel ? `<div class="sd-action__field"><span class="sd-action__field-label">Channel:</span> ${escapeHtml(channel)}</div>` : ''}
      ${objective ? `<div class="sd-action__field"><span class="sd-action__field-label">Objective:</span> ${escapeHtml(objective)}</div>` : ''}
      ${timeframe ? `<div class="sd-action__field"><span class="sd-action__field-label">Timeframe:</span> ${escapeHtml(timeframe)}</div>` : ''}
      ${messageAngle ? `<div class="sd-action__field"><span class="sd-action__field-label">Message angle:</span> ${escapeHtml(messageAngle)}</div>` : ''}
      ${successCriteria ? `<div class="sd-action__field"><span class="sd-action__field-label">Success criteria:</span> ${escapeHtml(successCriteria)}</div>` : ''}
      ${isPrimary ? `<button class="sd-btn sd-btn--primary sd-btn--create-action" data-create-action-for="${escapeHtml(signalId)}" type="button">Create action</button>` : ''}
    </div>`;
}

function renderRecommendedActions(signal) {
  const recs = signal.recommendedActions || signal.recommendations || [];
  if (recs.length === 0) {
    return `
      <section class="sd-section sd-recommendations" aria-labelledby="sd-recs-heading">
        <h2 id="sd-recs-heading" class="sd-section__title">Recommended actions</h2>
        <p class="sd-empty-state">No recommended actions.</p>
      </section>`;
  }

  const primary = recs[0];
  const secondary = recs.slice(1);

  const primaryCard = renderActionCard(primary, signal.id, true);
  const secondaryCards = secondary.map((r) => renderActionCard(r, signal.id, false)).join('');

  return `
    <section class="sd-section sd-recommendations" aria-labelledby="sd-recs-heading">
      <h2 id="sd-recs-heading" class="sd-section__title">Recommended actions</h2>
      ${primaryCard}
      ${secondaryCards}
    </section>`;
}

// ---------------------------------------------------------------------------
// Right sidebar - Context panel
// ---------------------------------------------------------------------------

function renderContextPanel(signal, investor, investorId) {
  const state = getInvestorState(investorId);
  const timeline = getInvestorTimeline(investorId).slice(0, 5);
  const openActions = getInvestorActions(investorId);
  const related = getRelatedSignals(signal.id, investorId);

  // Relationship summary
  let relationshipHtml = '<div class="sd-ctx__section"><h3 class="sd-ctx__heading">Relationship summary</h3>';
  if (investor) {
    const invType = investor.type || investor.investorType || '\u2014';
    const tier = investor.priorityTier || investor.tier || '\u2014';
    relationshipHtml += `
      <div class="sd-ctx__field"><span class="sd-ctx__label">Type:</span> ${escapeHtml(invType)}</div>
      <div class="sd-ctx__field"><span class="sd-ctx__label">Priority tier:</span> ${escapeHtml(String(tier))}</div>`;
  }
  if (state) {
    const holding = state.currentHolding ?? state.holding;
    const trend = state.trend || state.holdingTrend;
    if (holding != null) {
      relationshipHtml += `<div class="sd-ctx__field"><span class="sd-ctx__label">Holding:</span> ${formatPercent(holding)}</div>`;
    }
    if (trend) {
      relationshipHtml += `<div class="sd-ctx__field"><span class="sd-ctx__label">Trend:</span> ${escapeHtml(trend)} ${formatTrend(trend)}</div>`;
    }
    const holdingHistory = state.holdingHistory || state.holdingData || [];
    if (holdingHistory.length > 0) {
      const data = holdingHistory.map((h) => (typeof h === 'number' ? h : h.value || h.holding || 0));
      relationshipHtml += `<div class="sd-ctx__sparkline">${renderSparkline(data, 140, 32)}</div>`;
    }
  }
  relationshipHtml += '</div>';

  // Recent timeline
  let timelineHtml = '<div class="sd-ctx__section"><h3 class="sd-ctx__heading">Recent timeline</h3>';
  if (timeline.length > 0) {
    timelineHtml += '<ul class="sd-ctx__timeline">';
    timeline.forEach((evt) => {
      const evtDate = evt.date || evt.timestamp || '';
      const evtTitle = evt.title || evt.description || evt.type || '';
      timelineHtml += `
        <li class="sd-ctx__timeline-item">
          <span class="sd-ctx__timeline-date">${evtDate ? escapeHtml(formatDate(evtDate)) : ''}</span>
          <span class="sd-ctx__timeline-text">${escapeHtml(truncate(evtTitle, 50))}</span>
        </li>`;
    });
    timelineHtml += '</ul>';
  } else {
    timelineHtml += '<p class="sd-empty-state">No recent events.</p>';
  }
  timelineHtml += '</div>';

  // Open actions
  let actionsHtml = '<div class="sd-ctx__section"><h3 class="sd-ctx__heading">Open actions</h3>';
  if (openActions.length > 0) {
    actionsHtml += '<ul class="sd-ctx__actions">';
    openActions.forEach((a) => {
      const label = a.objective || a.type || 'Action';
      actionsHtml += `
        <li class="sd-ctx__action-item">
          <a href="#/actions/${escapeHtml(a.id)}" class="sd-ctx__action-link">${escapeHtml(truncate(label, 45))}</a>
          <span class="sd-ctx__action-state">${escapeHtml(a.state)}</span>
        </li>`;
    });
    actionsHtml += '</ul>';
  } else {
    actionsHtml += '<p class="sd-empty-state">No open actions.</p>';
  }
  actionsHtml += '</div>';

  // Related signals
  let relatedHtml = '<div class="sd-ctx__section"><h3 class="sd-ctx__heading">Related signals</h3>';
  if (related.length > 0) {
    relatedHtml += '<ul class="sd-ctx__related">';
    related.slice(0, 5).forEach((s) => {
      const urgencyColor = URGENCY_COLORS[s.urgency] || '#6b7280';
      relatedHtml += `
        <li class="sd-ctx__related-item">
          <span class="sd-ctx__related-urgency" style="color: ${urgencyColor};">\u25CF</span>
          <a href="#/signals/${escapeHtml(s.id)}" class="sd-ctx__related-link">${escapeHtml(truncate(s.title || s.type, 40))}</a>
        </li>`;
    });
    relatedHtml += '</ul>';
  } else {
    relatedHtml += '<p class="sd-empty-state">No related signals.</p>';
  }
  relatedHtml += '</div>';

  // Sensitivity notes from persona
  let sensitivityHtml = '';
  const persona = investor?.persona || investor?.sensitivityNotes || investor?.notes || null;
  if (persona) {
    const notes = typeof persona === 'string' ? persona : persona.sensitivityNotes || persona.notes || '';
    if (notes) {
      sensitivityHtml = `
        <div class="sd-ctx__section">
          <h3 class="sd-ctx__heading">Sensitivity notes</h3>
          <p class="sd-ctx__sensitivity">${escapeHtml(notes)}</p>
        </div>`;
    }
  }

  return `
    <aside class="sd-context-panel" style="width: 320px; min-width: 320px; flex-shrink: 0;">
      ${relationshipHtml}
      ${timelineHtml}
      ${actionsHtml}
      ${relatedHtml}
      ${sensitivityHtml}
    </aside>`;
}

// ---------------------------------------------------------------------------
// Action bar - state transitions
// ---------------------------------------------------------------------------

function renderActionBar(signal) {
  const transitions = STATE_TRANSITIONS[signal.state] || [];
  if (transitions.length === 0 && signal.state !== 'confirmed') {
    return `
      <div class="sd-action-bar">
        <span class="sd-action-bar__state">State: <strong>${escapeHtml(STATE_LABELS[signal.state] || signal.state)}</strong></span>
        <a href="#/signals" class="sd-btn sd-btn--secondary">Back to inbox</a>
      </div>`;
  }

  const buttons = transitions
    .map((t) => {
      const cls =
        t.style === 'primary'
          ? 'sd-btn--primary'
          : t.style === 'danger'
            ? 'sd-btn--danger'
            : 'sd-btn--secondary';
      return `<button class="sd-btn ${cls}" data-transition-to="${escapeHtml(t.target)}" type="button">${escapeHtml(t.label)}</button>`;
    })
    .join('');

  return `
    <div class="sd-action-bar">
      <span class="sd-action-bar__state">State: <strong>${escapeHtml(STATE_LABELS[signal.state] || signal.state)}</strong></span>
      <div class="sd-action-bar__buttons">
        ${buttons}
        <a href="#/signals" class="sd-btn sd-btn--secondary">Back to inbox</a>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Event delegation
// ---------------------------------------------------------------------------

function attachEvents(container, signal) {
  container.addEventListener('click', (event) => {
    const target = event.target;

    // State transition buttons
    const transitionBtn = target.closest('[data-transition-to]');
    if (transitionBtn) {
      event.preventDefault();
      const newState = transitionBtn.dataset.transitionTo;
      signal.state = newState;
      showToast(`Signal moved to "${STATE_LABELS[newState] || newState}"`, 'success');

      // If "Create action" transition, navigate to action creation
      if (newState === 'action_created') {
        window.location.hash = `#/actions/new?signal=${signal.id}`;
        return;
      }

      renderSignalDetail(container, signal.id);
      return;
    }

    // Create action from recommendation card
    const createActionBtn = target.closest('[data-create-action-for]');
    if (createActionBtn) {
      event.preventDefault();
      const signalId = createActionBtn.dataset.createActionFor;
      window.location.hash = `#/actions/new?signal=${signalId}`;
      return;
    }
  });
}

// ---------------------------------------------------------------------------
// Not found
// ---------------------------------------------------------------------------

function renderNotFound(container, signalId) {
  container.innerHTML = `
    <div class="sd-not-found" role="main">
      <h1>Signal not found</h1>
      <p>No signal with ID "${escapeHtml(signalId || '')}" was found.</p>
      <a href="#/signals" class="sd-btn sd-btn--secondary">Back to inbox</a>
    </div>`;
}

// ---------------------------------------------------------------------------
// Main render
// ---------------------------------------------------------------------------

/**
 * Render the Signal Detail page into the given container.
 *
 * @param {HTMLElement} container - DOM element to render into
 * @param {string}      signalId - The signal ID to display
 */
export function renderSignalDetail(container, signalId) {
  const signal = findSignal(signalId);
  if (!signal) {
    renderNotFound(container, signalId);
    return;
  }

  const investor = signal.investorId ? findInvestor(signal.investorId) : null;
  const contact = signal.contactId ? findContact(signal.contactId) : null;
  const owner = signal.ownerId ? findTeamMember(signal.ownerId) : null;

  const mainContent = `
    <div class="sd-main">
      ${renderSummarySection(signal, investor, contact, owner)}
      ${renderObservedFacts(signal)}
      ${renderBaselinesSection(signal, signal.investorId)}
      ${renderInterpretationSection(signal)}
      ${renderAlternativesSection(signal)}
      ${renderRecommendedActions(signal)}
    </div>`;

  const sidebar = renderContextPanel(signal, investor, signal.investorId);

  const html = `
    <div class="sd-detail" role="main">
      ${renderActionBar(signal)}
      <div class="sd-layout" style="display: flex; gap: 24px;">
        ${mainContent}
        ${sidebar}
      </div>
    </div>`;

  renderTemplate(html, container);
  attachEvents(container, signal);
}
