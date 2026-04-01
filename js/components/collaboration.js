/**
 * Investor Care OS - Collaboration and Handoff Module
 *
 * Team workload overview, investor coverage map, signal queue visibility,
 * handoff notes, and activity feed for IR team coordination.
 */

import {
  investors,
  contacts,
  signals,
  actions,
  teamMembers,
  timelineEvents,
} from '../data/mock-data.js';

import {
  escapeHtml,
  formatDate,
  formatDateRelative,
  daysSince,
  truncate,
  getUrgencyClass,
  getStateClass,
} from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTeamMemberName(id) {
  const tm = teamMembers.find(t => t.id === id);
  return tm ? tm.name : 'Unassigned';
}

function getTeamMemberInitials(id) {
  const tm = teamMembers.find(t => t.id === id);
  return tm ? tm.initials : '??';
}

function getInvestorName(id) {
  const inv = investors.find(i => i.id === id);
  return inv ? inv.name : 'Unknown';
}

function getOwnerId(action) {
  return action.ownerId || action.assigneeId;
}

function isOpen(item) {
  const s = item.state || item.status;
  return s !== 'completed' && s !== 'cancelled' && s !== 'resolved' && s !== 'dismissed';
}

function urgencyOrder(u) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[u] || 4;
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

function renderWorkloadOverview() {
  const cards = teamMembers.map(tm => {
    const myActions = actions.filter(a => getOwnerId(a) === tm.id);
    const openActions = myActions.filter(isOpen);
    const mySignals = signals.filter(s => s.assignedTo === tm.id);
    const openSignals = mySignals.filter(isOpen);
    const totalOpen = openActions.length + openSignals.length;

    const coveredInvestorIds = new Set();
    myActions.forEach(a => {
      if (a.investorId) coveredInvestorIds.add(a.investorId);
      if (a.investorIds) a.investorIds.forEach(id => coveredInvestorIds.add(id));
    });

    const workloadLevel = totalOpen <= 2 ? 'low' : totalOpen <= 4 ? 'medium' : 'high';
    const workloadColor = { low: '#059669', medium: '#d97706', high: '#dc2626' }[workloadLevel];
    const barWidth = Math.min(100, totalOpen * 15);

    // Top urgent items
    const allItems = [
      ...openActions.map(a => ({ type: 'action', title: a.objective || a.title, due: a.dueDate, urgency: a.priority || 'medium' })),
      ...openSignals.map(s => ({ type: 'signal', title: s.title, due: s.createdAt, urgency: s.urgency || 'medium' })),
    ].sort((a, b) => urgencyOrder(a.urgency) - urgencyOrder(b.urgency)).slice(0, 3);

    const focusItems = allItems.map(item =>
      `<div style="font-size:12px;padding:4px 0;border-bottom:1px solid var(--color-border,#e2e8f0)">
        <span class="ic-badge ic-badge--urgency-${item.urgency === 'critical' ? 'high' : item.urgency}" style="margin-right:4px">${item.urgency}</span>
        ${escapeHtml(truncate(item.title, 50))}
        ${item.due ? `<span style="color:var(--color-text-secondary,#475569);margin-left:8px">${formatDate(item.due)}</span>` : ''}
      </div>`
    ).join('');

    const investorNames = [...coveredInvestorIds].map(id => getInvestorName(id)).join(', ');

    return `
      <div class="ic-card" style="margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div class="ic-sidebar__avatar" style="background:var(--color-primary,#1a56db);color:white;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px">${tm.initials}</div>
          <div style="flex:1">
            <div style="font-weight:600;font-size:14px">${escapeHtml(tm.name)}</div>
            <div style="font-size:12px;color:var(--color-text-secondary,#475569)">${escapeHtml(tm.role)}</div>
          </div>
          <div style="text-align:right">
            <span class="ic-badge ic-badge--urgency-${workloadLevel === 'high' ? 'high' : workloadLevel === 'medium' ? 'medium' : 'low'}">${workloadLevel} workload</span>
          </div>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:12px">
          <div><span style="font-weight:600">${openActions.length}</span> <span style="font-size:12px;color:var(--color-text-secondary,#475569)">open actions</span></div>
          <div><span style="font-weight:600">${openSignals.length}</span> <span style="font-size:12px;color:var(--color-text-secondary,#475569)">assigned signals</span></div>
        </div>
        <div style="margin-bottom:8px">
          <div style="font-size:11px;color:var(--color-text-secondary,#475569);margin-bottom:4px">Workload</div>
          <div style="background:#e2e8f0;border-radius:4px;height:8px;overflow:hidden">
            <div style="background:${workloadColor};height:100%;width:${barWidth}%;border-radius:4px;transition:width 0.3s"></div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--color-text-secondary,#475569);margin-bottom:8px">
          <strong>Investor coverage:</strong> ${investorNames || 'None assigned'}
        </div>
        ${allItems.length > 0 ? `<div><div style="font-size:11px;font-weight:600;color:var(--color-text-secondary,#475569);margin-bottom:4px">Current focus</div>${focusItems}</div>` : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="ic-section">
      <h2 class="ic-section__title">Team workload overview</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px">
        ${cards}
      </div>
    </div>
  `;
}

function renderCoverageMap() {
  const rows = investors.map(inv => {
    const invActions = actions.filter(a =>
      a.investorId === inv.id || (a.investorIds && a.investorIds.includes(inv.id))
    );
    const openItems = invActions.filter(isOpen).length +
      signals.filter(s => (s.investorId === inv.id || (s.investorIds && s.investorIds.includes(inv.id))) && isOpen(s)).length;

    // Primary owner: whoever has most actions
    const ownerCounts = {};
    invActions.forEach(a => {
      const oid = getOwnerId(a);
      if (oid) ownerCounts[oid] = (ownerCounts[oid] || 0) + 1;
    });
    const primaryOwnerId = Object.entries(ownerCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const primaryOwner = primaryOwnerId ? getTeamMemberName(primaryOwnerId) : null;

    // Last interaction by anyone
    const invEvents = timelineEvents.filter(e => e.investorId === inv.id && e.type && e.type.startsWith('interaction_'));
    const lastByAnyone = invEvents.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const uncovered = !primaryOwner;

    return `
      <tr class="${uncovered ? 'ic-table__row--urgency-high' : ''}" data-navigate="#/investors/${inv.id}" tabindex="0" role="link">
        <td><a href="#/investors/${inv.id}">${escapeHtml(inv.name)}</a></td>
        <td>${primaryOwner ? escapeHtml(primaryOwner) : '<span class="ic-badge ic-badge--urgency-high">Uncovered</span>'}</td>
        <td>${lastByAnyone ? formatDateRelative(lastByAnyone.date) : '<span style="color:var(--color-text-secondary)">No data</span>'}</td>
        <td>${openItems > 0 ? `<span class="ic-badge ic-badge--urgency-medium">${openItems}</span>` : '0'}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="ic-section">
      <h2 class="ic-section__title">Investor coverage map</h2>
      <table class="ic-table">
        <thead><tr><th>Investor</th><th>Primary coverage</th><th>Last interaction</th><th>Open items</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderSignalQueue() {
  const grouped = {};
  teamMembers.forEach(tm => { grouped[tm.id] = []; });
  grouped['unassigned'] = [];

  signals.filter(isOpen).forEach(s => {
    const key = s.assignedTo || 'unassigned';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  const sections = [...teamMembers.map(tm => ({ id: tm.id, name: tm.name, initials: tm.initials })),
    { id: 'unassigned', name: 'Unassigned', initials: '??' }
  ].map(group => {
    const sigs = grouped[group.id] || [];
    if (sigs.length === 0) return '';

    const rows = sigs.map(s => {
      const invName = s.investorId ? getInvestorName(s.investorId) : (s.investorIds && s.investorIds[0] ? getInvestorName(s.investorIds[0]) : 'General');
      return `
        <tr data-navigate="#/signals/${s.id}" tabindex="0" role="link" style="cursor:pointer">
          <td>${escapeHtml(truncate(s.title, 60))}</td>
          <td><span class="ic-badge ic-badge--urgency-${s.urgency === 'critical' ? 'high' : s.urgency}">${s.urgency}</span></td>
          <td><span class="ic-badge ic-badge--state-${s.state}">${s.state}</span></td>
          <td>${escapeHtml(invName)}</td>
          <td>${formatDateRelative(s.createdAt)}</td>
        </tr>
      `;
    }).join('');

    return `
      <details class="ic-collapsible ic-collapsible--open" open style="margin-bottom:8px">
        <summary class="ic-collapsible__header">
          ${escapeHtml(group.name)} <span class="ic-badge ic-badge--type" style="margin-left:8px">${sigs.length}</span>
        </summary>
        <div class="ic-collapsible__content" style="display:block;padding:0">
          <table class="ic-table" style="box-shadow:none">
            <thead><tr><th>Signal</th><th>Urgency</th><th>State</th><th>Investor</th><th>Age</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </details>
    `;
  }).filter(Boolean).join('');

  return `
    <div class="ic-section">
      <h2 class="ic-section__title">Signal queue by team member</h2>
      ${sections || '<p class="ic-card__text">No open signals.</p>'}
    </div>
  `;
}

function renderHandoffNotes() {
  const handoffs = [
    {
      date: '2026-03-15',
      from: 'tm-1',
      to: 'tm-2',
      investorId: 'inv-6',
      notes: 'Allianz Global Investors coverage transfer. Key context: sell-down is mandate-driven per Klaus Weber (confirmed via email 1 March). Monitor for stabilization at ~1.4%. See signal sig-2 for full analysis.',
      linkedSignals: ['sig-2'],
    },
    {
      date: '2026-03-01',
      from: 'tm-3',
      to: 'tm-1',
      investorId: 'inv-8',
      notes: 'Fidelity International (new investor). Rebecca Liu is primary contact, based in London. Introductory call completed 22 March. Site visit pending. High potential - part of new Nordic conviction strategy.',
      linkedSignals: ['sig-3'],
    },
  ];

  const noteCards = handoffs.map(h => `
    <div class="ic-card" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:12px;color:var(--color-text-secondary,#475569)">${formatDate(h.date)}</span>
        <span style="font-size:13px"><strong>${escapeHtml(getTeamMemberName(h.from))}</strong> → <strong>${escapeHtml(getTeamMemberName(h.to))}</strong></span>
      </div>
      <div style="font-weight:600;margin-bottom:4px">${escapeHtml(getInvestorName(h.investorId))}</div>
      <div style="font-size:13px;line-height:1.6">${escapeHtml(h.notes)}</div>
      ${h.linkedSignals.length > 0 ? `<div style="margin-top:8px">${h.linkedSignals.map(id => `<a href="#/signals/${id}" class="ic-badge ic-badge--type" style="text-decoration:none">Signal ${id}</a>`).join(' ')}</div>` : ''}
    </div>
  `).join('');

  return `
    <div class="ic-section">
      <h2 class="ic-section__title">Handoff notes</h2>
      ${noteCards}
      <button class="ic-btn ic-btn--secondary" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">Add handoff note</button>
      <div style="display:none;margin-top:12px" class="ic-card">
        <div class="ic-form">
          <div class="ic-field">
            <label class="ic-field__label">From</label>
            <select class="ic-field__select">${teamMembers.map(tm => `<option value="${tm.id}">${escapeHtml(tm.name)}</option>`).join('')}</select>
          </div>
          <div class="ic-field">
            <label class="ic-field__label">To</label>
            <select class="ic-field__select">${teamMembers.map(tm => `<option value="${tm.id}">${escapeHtml(tm.name)}</option>`).join('')}</select>
          </div>
          <div class="ic-field">
            <label class="ic-field__label">Investor</label>
            <select class="ic-field__select">${investors.map(inv => `<option value="${inv.id}">${escapeHtml(inv.name)}</option>`).join('')}</select>
          </div>
          <div class="ic-field">
            <label class="ic-field__label">Notes</label>
            <textarea class="ic-field__textarea" rows="3" placeholder="Key context for the coverage transition..."></textarea>
          </div>
          <button class="ic-btn ic-btn--primary ic-btn--sm">Save handoff note</button>
        </div>
      </div>
    </div>
  `;
}

function renderActivityFeed() {
  const activities = [
    { initials: 'AL', text: 'Anna started reviewing signal: BlackRock reducing position', time: '2026-03-30T10:00:00Z' },
    { initials: 'EJ', text: 'Erik completed action: Governance meeting with Swedbank Robur', time: '2026-03-28T17:00:00Z' },
    { initials: 'SB', text: 'Sofia assigned to signal: Peer restructuring impact', time: '2026-03-31T09:30:00Z' },
    { initials: 'AL', text: 'Anna created action: Welcome meeting with Fidelity team', time: '2026-03-27T12:00:00Z' },
    { initials: 'EJ', text: 'Erik started call preparation for Allianz retention strategy', time: '2026-03-29T15:30:00Z' },
    { initials: 'SB', text: 'Sofia updated market intelligence: Competitor restructuring', time: '2026-03-31T08:30:00Z' },
    { initials: 'AL', text: 'Anna scheduled pre-AGM engagement with AP4', time: '2026-03-26T17:00:00Z' },
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  const items = activities.map(a => `
    <div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--color-border,#e2e8f0)">
      <div style="background:var(--color-primary-light,#dbeafe);color:var(--color-primary,#1a56db);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0">${a.initials}</div>
      <div style="flex:1">
        <div style="font-size:13px">${escapeHtml(a.text)}</div>
        <div style="font-size:11px;color:var(--color-text-secondary,#475569)">${formatDateRelative(a.time)}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="ic-section">
      <h2 class="ic-section__title">Recent team activity</h2>
      <div class="ic-card">${items}</div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Main render
// ---------------------------------------------------------------------------

export function renderCollaboration(container) {
  container.innerHTML = `
    <div class="ic-page">
      <div class="ic-page__header">
        <div>
          <h1 class="ic-page__title">Team collaboration</h1>
          <p class="ic-page__subtitle">Team workload, coverage assignments, and handoff management</p>
        </div>
      </div>
      ${renderWorkloadOverview()}
      ${renderCoverageMap()}
      ${renderSignalQueue()}
      ${renderHandoffNotes()}
      ${renderActivityFeed()}
    </div>
  `;

  // Event delegation for navigation
  container.addEventListener('click', (e) => {
    const row = e.target.closest('[data-navigate]');
    if (row && !e.target.closest('a')) {
      window.location.hash = row.dataset.navigate;
    }
  });

  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const row = e.target.closest('[data-navigate]');
      if (row) {
        e.preventDefault();
        window.location.hash = row.dataset.navigate;
      }
    }
  });
}
