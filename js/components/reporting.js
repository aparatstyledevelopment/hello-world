/**
 * Investor Care OS - Reporting Component
 *
 * Generates structured reports from timeline, state, and action data
 * for internal and external communication (Blueprint section 11.3).
 */

import {
  investors,
  contacts,
  investorStates,
  signals,
  actions,
  timelineEvents,
  teamMembers,
} from '../data/mock-data.js';

import {
  escapeHtml,
  formatDate,
  formatDateRelative,
  daysSince,
  formatPercent,
  renderSparkline,
  formatTrend,
} from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const expandedReports = {
  engagement: false,
  ownership: false,
  effectiveness: false,
  governance: false,
};

// ---------------------------------------------------------------------------
// Helper look-ups
// ---------------------------------------------------------------------------

function investorName(id) {
  const inv = investors.find((i) => i.id === id);
  return inv ? escapeHtml(inv.name) : 'Unknown';
}

function teamMemberName(id) {
  const tm = teamMembers.find((t) => t.id === id);
  return tm ? escapeHtml(tm.name) : 'Unknown';
}

function isWithinDays(dateStr, days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(dateStr).getTime() >= cutoff;
}

// ---------------------------------------------------------------------------
// 1. Investor Engagement Report
// ---------------------------------------------------------------------------

function generateEngagementReport() {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  // Interactions in last 30 days
  const recentInteractions = timelineEvents.filter(
    (e) => e.type.startsWith('interaction_') && new Date(e.date).getTime() >= thirtyDaysAgo
  );

  const totalInteractions = recentInteractions.length;

  // Breakdown by type
  const typeMap = { meeting: 0, call: 0, email: 0, roadshow: 0 };
  recentInteractions.forEach((e) => {
    const sub = e.type.replace('interaction_', '');
    if (typeMap[sub] !== undefined) typeMap[sub]++;
  });

  // By team member - derive from action ownerId or event contactId mapping
  const tmCounts = {};
  teamMembers.forEach((tm) => { tmCounts[tm.id] = 0; });
  // Map contacts to team members via actions, or count events that have a contactId
  recentInteractions.forEach((evt) => {
    // Try to find an action linked to this investor for team assignment
    const relatedAction = actions.find(
      (a) => a.investorId === evt.investorId || (a.investorIds && a.investorIds.includes(evt.investorId))
    );
    if (relatedAction && relatedAction.assigneeId && tmCounts[relatedAction.assigneeId] !== undefined) {
      tmCounts[relatedAction.assigneeId]++;
    } else if (relatedAction && relatedAction.ownerId && tmCounts[relatedAction.ownerId] !== undefined) {
      tmCounts[relatedAction.ownerId]++;
    } else {
      // Distribute to tm-1 as head of IR by default
      tmCounts['tm-1']++;
    }
  });

  // Top engaged investors
  const invInteractionCount = {};
  recentInteractions.forEach((e) => {
    if (e.investorId) {
      invInteractionCount[e.investorId] = (invInteractionCount[e.investorId] || 0) + 1;
    }
  });
  const topEngaged = Object.entries(invInteractionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Coverage gaps - investors with no interactions in last 30 days
  const interactedIds = new Set(recentInteractions.map((e) => e.investorId).filter(Boolean));
  const coverageGaps = investors.filter((inv) => !interactedIds.has(inv.id));

  // Signal response rate
  const totalSignals = signals.length;
  const actionedSignals = signals.filter(
    (s) => s.state === 'action_created' || s.state === 'resolved' || s.state === 'confirmed'
  ).length;
  const dismissedSignals = signals.filter((s) => s.state === 'dismissed').length;

  let html = '<div class="ic-report-content">';

  // Summary stats
  html += `
    <div class="ic-report-stats">
      <div class="ic-stat-box">
        <span class="ic-stat-value">${totalInteractions}</span>
        <span class="ic-stat-label">Total interactions (30 days)</span>
      </div>
      <div class="ic-stat-box">
        <span class="ic-stat-value">${actionedSignals}/${totalSignals}</span>
        <span class="ic-stat-label">Signals actioned</span>
      </div>
      <div class="ic-stat-box">
        <span class="ic-stat-value">${coverageGaps.length}</span>
        <span class="ic-stat-label">Coverage gaps</span>
      </div>
    </div>`;

  // Interactions by type
  html += `
    <h4 class="ic-report-section-title">Interactions by type</h4>
    <table class="ic-report-table">
      <thead><tr><th>Type</th><th>Count</th></tr></thead>
      <tbody>
        <tr><td>Meetings</td><td>${typeMap.meeting}</td></tr>
        <tr><td>Calls</td><td>${typeMap.call}</td></tr>
        <tr><td>Emails</td><td>${typeMap.email}</td></tr>
        <tr><td>Roadshows</td><td>${typeMap.roadshow}</td></tr>
      </tbody>
    </table>`;

  // By team member
  html += `
    <h4 class="ic-report-section-title">Interactions by team member</h4>
    <table class="ic-report-table">
      <thead><tr><th>Team member</th><th>Role</th><th>Interactions</th></tr></thead>
      <tbody>`;
  teamMembers.forEach((tm) => {
    html += `<tr><td>${escapeHtml(tm.name)}</td><td>${escapeHtml(tm.role)}</td><td>${tmCounts[tm.id]}</td></tr>`;
  });
  html += '</tbody></table>';

  // Top engaged investors
  html += `
    <h4 class="ic-report-section-title">Top engaged investors</h4>
    <table class="ic-report-table">
      <thead><tr><th>Investor</th><th>Interactions</th></tr></thead>
      <tbody>`;
  topEngaged.forEach(([id, count]) => {
    html += `<tr><td>${investorName(id)}</td><td>${count}</td></tr>`;
  });
  html += '</tbody></table>';

  // Coverage gaps
  html += `
    <h4 class="ic-report-section-title">Coverage gaps (no interactions in 30 days)</h4>`;
  if (coverageGaps.length === 0) {
    html += '<p class="ic-report-note">All investors have been contacted within the last 30 days.</p>';
  } else {
    html += `
      <table class="ic-report-table">
        <thead><tr><th>Investor</th><th>Days since last contact</th></tr></thead>
        <tbody>`;
    coverageGaps.forEach((inv) => {
      const days = daysSince(inv.lastInteraction);
      html += `<tr><td>${escapeHtml(inv.name)}</td><td>${days} days</td></tr>`;
    });
    html += '</tbody></table>';
  }

  // Signal response rate
  html += `
    <h4 class="ic-report-section-title">Signal response rate</h4>
    <table class="ic-report-table">
      <thead><tr><th>Status</th><th>Count</th></tr></thead>
      <tbody>
        <tr><td>Actioned (confirmed / action created / resolved)</td><td>${actionedSignals}</td></tr>
        <tr><td>Dismissed</td><td>${dismissedSignals}</td></tr>
        <tr><td>Pending (new / reviewing)</td><td>${totalSignals - actionedSignals - dismissedSignals}</td></tr>
        <tr><td><strong>Total signals</strong></td><td><strong>${totalSignals}</strong></td></tr>
      </tbody>
    </table>`;

  html += '</div>';
  return html;
}

// ---------------------------------------------------------------------------
// 2. Ownership Analysis Report
// ---------------------------------------------------------------------------

function generateOwnershipReport() {
  // Sort by holding %
  const sorted = [...investors].sort((a, b) => b.holdingPercent - a.holdingPercent);

  const totalOwnership = investors.reduce((sum, inv) => sum + inv.holdingPercent, 0);

  // Group by type
  const typeGroups = {};
  investors.forEach((inv) => {
    const label = inv.type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    typeGroups[label] = (typeGroups[label] || 0) + inv.holdingPercent;
  });

  // Concentration
  const top3Sum = sorted.slice(0, 3).reduce((s, i) => s + i.holdingPercent, 0);
  const top3Pct = ((top3Sum / totalOwnership) * 100).toFixed(1);

  // Changes this quarter
  const changers = investors.filter((i) => i.holdingTrend !== 'stable');

  // New positions
  const newPositions = investors.filter(
    (inv) => inv.holdingHistory && inv.holdingHistory.length > 0 && inv.holdingHistory[0] === 0
  );

  let html = '<div class="ic-report-content">';

  // Summary stats
  html += `
    <div class="ic-report-stats">
      <div class="ic-stat-box">
        <span class="ic-stat-value">${formatPercent(totalOwnership)}</span>
        <span class="ic-stat-label">Total tracked ownership</span>
      </div>
      <div class="ic-stat-box">
        <span class="ic-stat-value">${investors.length}</span>
        <span class="ic-stat-label">Tracked investors</span>
      </div>
      <div class="ic-stat-box">
        <span class="ic-stat-value">${top3Pct}%</span>
        <span class="ic-stat-label">Top 3 concentration</span>
      </div>
    </div>`;

  // Current ownership structure
  html += `
    <h4 class="ic-report-section-title">Current ownership structure</h4>
    <table class="ic-report-table">
      <thead><tr><th>Investor</th><th>Type</th><th>Holding %</th><th>Trend</th><th>Sparkline</th></tr></thead>
      <tbody>`;
  sorted.forEach((inv) => {
    const typeLabel = inv.type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const trendClass = inv.holdingTrend === 'increasing' ? 'ic-trend-up' : inv.holdingTrend === 'declining' ? 'ic-trend-down' : 'ic-trend-stable';
    html += `<tr>
      <td>${escapeHtml(inv.name)}</td>
      <td>${escapeHtml(typeLabel)}</td>
      <td>${formatPercent(inv.holdingPercent)}</td>
      <td class="${trendClass}">${formatTrend(inv.holdingTrend)}</td>
      <td>${renderSparkline(inv.holdingHistory, 80, 20)}</td>
    </tr>`;
  });
  html += '</tbody></table>';

  // Ownership by type
  html += `
    <h4 class="ic-report-section-title">Ownership by type</h4>
    <table class="ic-report-table">
      <thead><tr><th>Type</th><th>Holding %</th></tr></thead>
      <tbody>`;
  Object.entries(typeGroups)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, pct]) => {
      html += `<tr><td>${escapeHtml(type)}</td><td>${formatPercent(pct)}</td></tr>`;
    });
  html += `
        <tr class="ic-report-total-row"><td><strong>Total</strong></td><td><strong>${formatPercent(totalOwnership)}</strong></td></tr>
      </tbody>
    </table>`;

  // Concentration analysis
  html += `
    <h4 class="ic-report-section-title">Concentration analysis</h4>
    <p class="ic-report-note">Top 3 holders represent <strong>${top3Pct}%</strong> of tracked ownership:</p>
    <table class="ic-report-table">
      <thead><tr><th>Investor</th><th>Holding %</th></tr></thead>
      <tbody>`;
  sorted.slice(0, 3).forEach((inv) => {
    html += `<tr><td>${escapeHtml(inv.name)}</td><td>${formatPercent(inv.holdingPercent)}</td></tr>`;
  });
  html += '</tbody></table>';

  // Changes this quarter
  html += `
    <h4 class="ic-report-section-title">Changes this quarter</h4>`;
  if (changers.length === 0) {
    html += '<p class="ic-report-note">No ownership changes detected this quarter.</p>';
  } else {
    html += `
      <table class="ic-report-table">
        <thead><tr><th>Investor</th><th>Direction</th><th>From</th><th>To</th><th>Change</th></tr></thead>
        <tbody>`;
    changers.forEach((inv) => {
      const history = inv.holdingHistory;
      const from = history[0];
      const to = history[history.length - 1];
      const delta = to - from;
      const sign = delta >= 0 ? '+' : '';
      const trendClass = inv.holdingTrend === 'increasing' ? 'ic-trend-up' : 'ic-trend-down';
      html += `<tr>
        <td>${escapeHtml(inv.name)}</td>
        <td class="${trendClass}">${formatTrend(inv.holdingTrend)} ${escapeHtml(inv.holdingTrend)}</td>
        <td>${formatPercent(from)}</td>
        <td>${formatPercent(to)}</td>
        <td>${sign}${delta.toFixed(1)}pp</td>
      </tr>`;
    });
    html += '</tbody></table>';
  }

  // New positions
  html += `
    <h4 class="ic-report-section-title">New positions</h4>`;
  if (newPositions.length === 0) {
    html += '<p class="ic-report-note">No new positions detected.</p>';
  } else {
    html += `
      <table class="ic-report-table">
        <thead><tr><th>Investor</th><th>Current holding</th><th>Trend</th></tr></thead>
        <tbody>`;
    newPositions.forEach((inv) => {
      html += `<tr>
        <td>${escapeHtml(inv.name)}</td>
        <td>${formatPercent(inv.holdingPercent)}</td>
        <td>${renderSparkline(inv.holdingHistory, 80, 20)}</td>
      </tr>`;
    });
    html += '</tbody></table>';
  }

  html += '</div>';
  return html;
}

// ---------------------------------------------------------------------------
// 3. Signal & Action Effectiveness Report
// ---------------------------------------------------------------------------

function generateEffectivenessReport() {
  const totalSignalCount = signals.length;

  // Signals by type
  const sigByType = {};
  signals.forEach((s) => {
    const label = s.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    sigByType[label] = (sigByType[label] || 0) + 1;
  });

  // Signals by state
  const sigByState = {};
  signals.forEach((s) => {
    sigByState[s.state] = (sigByState[s.state] || 0) + 1;
  });

  // Signal-to-action conversion
  const signalsWithActions = signals.filter(
    (s) => s.state === 'action_created' || actions.some((a) => a.signalId === s.id || a.linkedSignalId === s.id)
  ).length;
  const conversionRate = totalSignalCount > 0 ? ((signalsWithActions / totalSignalCount) * 100).toFixed(1) : '0.0';

  // Actions completed
  const completedActions = actions.filter((a) => a.state === 'completed' || a.status === 'completed');

  // Actions by outcome
  const outcomeBreakdown = { yes: 0, no: 0, partially: 0 };
  completedActions.forEach((a) => {
    if (a.outcome && a.outcome.objectiveMet) {
      const met = a.outcome.objectiveMet.toLowerCase();
      if (outcomeBreakdown[met] !== undefined) outcomeBreakdown[met]++;
    }
  });

  // Average time from signal to action (for linked actions)
  let totalDaysSignalToAction = 0;
  let linkedCount = 0;
  actions.forEach((a) => {
    const sigId = a.signalId || a.linkedSignalId;
    if (sigId) {
      const sig = signals.find((s) => s.id === sigId);
      if (sig) {
        const sigDate = new Date(sig.createdAt).getTime();
        const actDate = new Date(a.createdAt).getTime();
        const diffDays = (actDate - sigDate) / (1000 * 60 * 60 * 24);
        totalDaysSignalToAction += Math.max(0, diffDays);
        linkedCount++;
      }
    }
  });
  const avgDays = linkedCount > 0 ? (totalDaysSignalToAction / linkedCount).toFixed(1) : 'N/A';

  // Team workload
  const teamWorkload = {};
  teamMembers.forEach((tm) => {
    teamWorkload[tm.id] = { name: tm.name, planned: 0, in_progress: 0, completed: 0, other: 0 };
  });
  actions.forEach((a) => {
    const assignee = a.assigneeId || a.ownerId;
    if (assignee && teamWorkload[assignee]) {
      if (a.state === 'planned' || a.state === 'preparing') teamWorkload[assignee].planned++;
      else if (a.state === 'in_progress') teamWorkload[assignee].in_progress++;
      else if (a.state === 'completed') teamWorkload[assignee].completed++;
      else teamWorkload[assignee].other++;
    }
  });

  let html = '<div class="ic-report-content">';

  // Summary stats
  html += `
    <div class="ic-report-stats">
      <div class="ic-stat-box">
        <span class="ic-stat-value">${totalSignalCount}</span>
        <span class="ic-stat-label">Total signals</span>
      </div>
      <div class="ic-stat-box">
        <span class="ic-stat-value">${conversionRate}%</span>
        <span class="ic-stat-label">Signal-to-action conversion</span>
      </div>
      <div class="ic-stat-box">
        <span class="ic-stat-value">${completedActions.length}</span>
        <span class="ic-stat-label">Actions completed</span>
      </div>
      <div class="ic-stat-box">
        <span class="ic-stat-value">${avgDays === 'N/A' ? avgDays : avgDays + ' days'}</span>
        <span class="ic-stat-label">Avg signal-to-action time</span>
      </div>
    </div>`;

  // Signals by type
  html += `
    <h4 class="ic-report-section-title">Signals by type</h4>
    <table class="ic-report-table">
      <thead><tr><th>Type</th><th>Count</th></tr></thead>
      <tbody>`;
  Object.entries(sigByType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      html += `<tr><td>${escapeHtml(type)}</td><td>${count}</td></tr>`;
    });
  html += '</tbody></table>';

  // Signals by state
  const stateLabels = {
    new: 'New',
    reviewing: 'Reviewing',
    confirmed: 'Confirmed',
    action_created: 'Action created',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
  };
  html += `
    <h4 class="ic-report-section-title">Signals by state</h4>
    <table class="ic-report-table">
      <thead><tr><th>State</th><th>Count</th></tr></thead>
      <tbody>`;
  Object.entries(stateLabels).forEach(([key, label]) => {
    html += `<tr><td>${label}</td><td>${sigByState[key] || 0}</td></tr>`;
  });
  html += '</tbody></table>';

  // Actions by outcome
  const hasOutcomes = completedActions.some((a) => a.outcome && a.outcome.objectiveMet);
  if (hasOutcomes) {
    html += `
      <h4 class="ic-report-section-title">Actions by outcome</h4>
      <table class="ic-report-table">
        <thead><tr><th>Objective met</th><th>Count</th></tr></thead>
        <tbody>
          <tr><td>Yes</td><td>${outcomeBreakdown.yes}</td></tr>
          <tr><td>No</td><td>${outcomeBreakdown.no}</td></tr>
          <tr><td>Partially</td><td>${outcomeBreakdown.partially}</td></tr>
        </tbody>
      </table>`;
  }

  // Team workload
  html += `
    <h4 class="ic-report-section-title">Team workload</h4>
    <table class="ic-report-table">
      <thead><tr><th>Team member</th><th>Planned</th><th>In progress</th><th>Completed</th><th>Other</th><th>Total</th></tr></thead>
      <tbody>`;
  Object.values(teamWorkload).forEach((tw) => {
    const total = tw.planned + tw.in_progress + tw.completed + tw.other;
    html += `<tr>
      <td>${escapeHtml(tw.name)}</td>
      <td>${tw.planned}</td>
      <td>${tw.in_progress}</td>
      <td>${tw.completed}</td>
      <td>${tw.other}</td>
      <td><strong>${total}</strong></td>
    </tr>`;
  });
  html += '</tbody></table>';

  html += '</div>';
  return html;
}

// ---------------------------------------------------------------------------
// 4. Governance Readiness Report
// ---------------------------------------------------------------------------

function generateGovernanceReport() {
  // Governance-sensitive investors (high level)
  const govSensitive = investorStates
    .filter((s) => s.governanceSensitivity && s.governanceSensitivity.level === 'high')
    .map((s) => {
      const inv = investors.find((i) => i.id === s.investorId);
      return { ...s, investor: inv };
    })
    .filter((s) => s.investor);

  // Key governance topics - aggregate frequency
  const topicCounts = {};
  investorStates.forEach((s) => {
    if (s.governanceSensitivity && s.governanceSensitivity.topics) {
      s.governanceSensitivity.topics.forEach((topic) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    }
  });

  // Pre-AGM engagement status for governance-sensitive investors
  const govEngagementStatus = govSensitive.map((gs) => {
    const govAction = actions.find(
      (a) =>
        a.type === 'governance_engagement' &&
        (a.investorId === gs.investorId ||
          (a.investorIds && a.investorIds.includes(gs.investorId)))
    );
    return {
      investor: gs.investor,
      action: govAction,
      state: govAction ? govAction.state : 'none',
    };
  });

  // Voting risk - high governance sensitivity AND (declining sentiment OR retention risk)
  const votingRisk = govSensitive.filter((gs) => {
    return (
      gs.sentiment.value === 'cautious' ||
      gs.sentiment.value === 'negative' ||
      gs.retentionRisk.level === 'high' ||
      gs.retentionRisk.level === 'medium'
    );
  });

  // Open governance-related signals
  const openGovSignals = signals.filter(
    (s) => s.type === 'governance_management' && s.state !== 'resolved' && s.state !== 'dismissed'
  );

  let html = '<div class="ic-report-content">';

  // Summary stats
  html += `
    <div class="ic-report-stats">
      <div class="ic-stat-box">
        <span class="ic-stat-value">${govSensitive.length}</span>
        <span class="ic-stat-label">Governance-sensitive investors</span>
      </div>
      <div class="ic-stat-box">
        <span class="ic-stat-value">${Object.keys(topicCounts).length}</span>
        <span class="ic-stat-label">Key governance topics</span>
      </div>
      <div class="ic-stat-box">
        <span class="ic-stat-value">${votingRisk.length}</span>
        <span class="ic-stat-label">Voting risk investors</span>
      </div>
    </div>`;

  // Governance-sensitive investors
  html += `
    <h4 class="ic-report-section-title">Governance-sensitive investors</h4>
    <table class="ic-report-table">
      <thead><tr><th>Investor</th><th>Holding %</th><th>Sensitivity topics</th></tr></thead>
      <tbody>`;
  govSensitive.forEach((gs) => {
    const topics = gs.governanceSensitivity.topics.map((t) => escapeHtml(t)).join(', ');
    html += `<tr>
      <td>${escapeHtml(gs.investor.name)}</td>
      <td>${formatPercent(gs.investor.holdingPercent)}</td>
      <td>${topics}</td>
    </tr>`;
  });
  html += '</tbody></table>';

  // Key governance topics
  html += `
    <h4 class="ic-report-section-title">Key governance topics</h4>
    <table class="ic-report-table">
      <thead><tr><th>Topic</th><th>Investors concerned</th></tr></thead>
      <tbody>`;
  Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([topic, count]) => {
      html += `<tr><td>${escapeHtml(topic)}</td><td>${count}</td></tr>`;
    });
  html += '</tbody></table>';

  // Pre-AGM engagement status
  html += `
    <h4 class="ic-report-section-title">Pre-AGM engagement status</h4>
    <table class="ic-report-table">
      <thead><tr><th>Investor</th><th>Governance action</th><th>State</th></tr></thead>
      <tbody>`;
  govEngagementStatus.forEach((item) => {
    const actionTitle = item.action ? escapeHtml(item.action.title) : 'No governance action';
    const stateLabel = item.state === 'none'
      ? '<span class="ic-badge ic-badge-warning">Not started</span>'
      : item.state === 'completed'
        ? '<span class="ic-badge ic-badge-success">Completed</span>'
        : `<span class="ic-badge ic-badge-info">${escapeHtml(item.state.replace(/_/g, ' '))}</span>`;
    html += `<tr>
      <td>${escapeHtml(item.investor.name)}</td>
      <td>${actionTitle}</td>
      <td>${stateLabel}</td>
    </tr>`;
  });
  html += '</tbody></table>';

  // Voting risk assessment
  html += `
    <h4 class="ic-report-section-title">Voting risk assessment</h4>`;
  if (votingRisk.length === 0) {
    html += '<p class="ic-report-note">No investors with combined governance sensitivity and risk indicators.</p>';
  } else {
    html += `
      <table class="ic-report-table">
        <thead><tr><th>Investor</th><th>Holding %</th><th>Sentiment</th><th>Retention risk</th><th>Concern</th></tr></thead>
        <tbody>`;
    votingRisk.forEach((gs) => {
      const concerns = [];
      if (gs.sentiment.value === 'cautious' || gs.sentiment.value === 'negative') {
        concerns.push('Declining sentiment');
      }
      if (gs.retentionRisk.level === 'high' || gs.retentionRisk.level === 'medium') {
        concerns.push('Retention risk');
      }
      html += `<tr>
        <td>${escapeHtml(gs.investor.name)}</td>
        <td>${formatPercent(gs.investor.holdingPercent)}</td>
        <td>${escapeHtml(gs.sentiment.value)}</td>
        <td>${escapeHtml(gs.retentionRisk.level)}</td>
        <td>${concerns.join(', ')}</td>
      </tr>`;
    });
    html += '</tbody></table>';
  }

  // Recommended pre-AGM actions (open governance signals)
  html += `
    <h4 class="ic-report-section-title">Recommended pre-AGM actions</h4>`;
  if (openGovSignals.length === 0) {
    html += '<p class="ic-report-note">All governance signals have been resolved.</p>';
  } else {
    html += `
      <table class="ic-report-table">
        <thead><tr><th>Signal</th><th>State</th><th>Urgency</th><th>Assigned to</th></tr></thead>
        <tbody>`;
    openGovSignals.forEach((s) => {
      const urgencyClass = s.urgency === 'high' ? 'ic-urgency-high' : s.urgency === 'medium' ? 'ic-urgency-medium' : 'ic-urgency-low';
      html += `<tr>
        <td>${escapeHtml(s.title)}</td>
        <td>${escapeHtml(s.state.replace(/_/g, ' '))}</td>
        <td><span class="${urgencyClass}">${escapeHtml(s.urgency)}</span></td>
        <td>${teamMemberName(s.assignedTo)}</td>
      </tr>`;
    });
    html += '</tbody></table>';
  }

  html += '</div>';
  return html;
}

// ---------------------------------------------------------------------------
// Report card definitions
// ---------------------------------------------------------------------------

const reportCards = [
  {
    key: 'engagement',
    icon: '\uD83D\uDCC5',
    title: 'Investor engagement report',
    generate: generateEngagementReport,
  },
  {
    key: 'ownership',
    icon: '\uD83D\uDCC8',
    title: 'Ownership analysis report',
    generate: generateOwnershipReport,
  },
  {
    key: 'effectiveness',
    icon: '\u26A1',
    title: 'Signal and action effectiveness',
    generate: generateEffectivenessReport,
  },
  {
    key: 'governance',
    icon: '\uD83C\uDFDB',
    title: 'Governance readiness report',
    generate: generateGovernanceReport,
  },
];

// ---------------------------------------------------------------------------
// Main render
// ---------------------------------------------------------------------------

export function renderReporting(container) {
  function render() {
    let html = `
      <div class="ic-reporting">
        <header class="ic-page-header">
          <h2 class="ic-page-title">Reports</h2>
          <p class="ic-page-subtitle">Structured reports generated from timeline, state, and action data</p>
        </header>
        <div class="ic-report-grid">`;

    reportCards.forEach((card) => {
      const isExpanded = expandedReports[card.key];
      html += `
        <div class="ic-card ic-report-card ${isExpanded ? 'ic-report-expanded' : ''}" data-report="${card.key}">
          <div class="ic-report-card-header" data-report-toggle="${card.key}">
            <div class="ic-report-card-title">
              <span class="ic-report-icon">${card.icon}</span>
              <h3>${escapeHtml(card.title)}</h3>
            </div>
            <button class="ic-btn ic-btn-generate" data-report-toggle="${card.key}">
              ${isExpanded ? 'Collapse' : 'Generate'}
            </button>
          </div>
          ${isExpanded ? '<div class="ic-report-body">' + card.generate() + '</div>' : ''}
        </div>`;
    });

    html += `
        </div>
      </div>`;

    container.innerHTML = html;
  }

  render();

  // Event delegation
  container.addEventListener('click', (e) => {
    const toggleTarget = e.target.closest('[data-report-toggle]');
    if (toggleTarget) {
      const key = toggleTarget.dataset.reportToggle;
      if (expandedReports[key] !== undefined) {
        expandedReports[key] = !expandedReports[key];
        render();
      }
    }
  });
}
