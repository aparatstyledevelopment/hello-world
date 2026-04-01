/**
 * Investor Care OS - Actions Board Component
 *
 * CRM-style view of all actions across all investors.
 * Supports both a sortable list (table) view and a Kanban board view,
 * with filtering by state, action type, investor, owner, and due date range.
 */

import {
  actions,
  investors,
  contacts,
  teamMembers,
  signals,
} from '../data/mock-data.js';

import {
  formatDate,
  truncate,
  escapeHtml,
  renderTemplate,
  debounce,
} from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TODAY = '2026-04-01';
const TODAY_MS = new Date(TODAY).getTime();

const ACTION_STATES = [
  { key: 'planned', label: 'Planned', color: '#6b7280' },
  { key: 'preparing', label: 'Preparing', color: '#3b82f6' },
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { key: 'awaiting_logging', label: 'Awaiting Logging', color: '#8b5cf6' },
  { key: 'completed', label: 'Completed', color: '#10b981' },
  { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

const ACTION_TYPES = [
  'meeting',
  'call',
  'email',
  'follow_up',
  'internal_task',
  'roadshow_outreach',
  'governance_engagement',
];

// ---------------------------------------------------------------------------
// Internal state (closure variables for view mode and re-render)
// ---------------------------------------------------------------------------

let currentView = 'list'; // 'list' | 'board'
let sortColumn = 'dueDate';
let sortAsc = true;
let filters = {
  state: '',
  actionType: '',
  investorId: '',
  owner: '',
  dueDateFrom: '',
  dueDateTo: '',
};

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

function investorName(id) {
  const inv = investors.find((i) => i.id === id);
  return inv ? escapeHtml(inv.name) : 'Unknown';
}

function contactName(id) {
  if (!id) return '\u2014';
  const c = (contacts || []).find((ct) => ct.id === id);
  if (!c) return '\u2014';
  // Support both { name } and { firstName, lastName } shapes
  if (c.name) return escapeHtml(c.name);
  if (c.firstName) return escapeHtml(`${c.firstName} ${c.lastName || ''}`);
  return '\u2014';
}

function ownerName(id) {
  if (!id) return '\u2014';
  const m = teamMembers.find((t) => t.id === id);
  if (!m) return '\u2014';
  // Support both { name } and { firstName, lastName } shapes
  if (m.name) return escapeHtml(m.name);
  if (m.firstName) return escapeHtml(`${m.firstName} ${m.lastName || ''}`);
  return '\u2014';
}

function ownerInitials(id) {
  const m = teamMembers.find((t) => t.id === id);
  if (!m) return '??';
  if (m.initials) return m.initials;
  if (m.firstName) return `${m.firstName[0]}${(m.lastName || '?')[0]}`.toUpperCase();
  if (m.name) {
    const parts = m.name.split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return '??';
}

function signalLabel(id) {
  if (!id) return '\u2014';
  const s = signals.find((sig) => sig.id === id);
  return s ? escapeHtml(truncate(s.title || s.type, 30)) : '\u2014';
}

function stateInfo(key) {
  return ACTION_STATES.find((s) => s.key === key) || { label: key, color: '#9ca3af' };
}

function isOverdue(dueDateStr) {
  if (!dueDateStr) return false;
  return new Date(dueDateStr).getTime() < TODAY_MS;
}

function formatTypeLabel(type) {
  if (!type) return '\u2014';
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Normalise action objects so they work regardless of whether mock-data uses
 * the old schema (status/assigneeId/signalId) or the new one
 * (state/ownerId/linkedSignalId/contactId/etc).
 */
function normaliseAction(raw) {
  return {
    id: raw.id,
    state: raw.state || raw.status || 'planned',
    type: raw.type || 'internal_task',
    investorId: raw.investorId || (raw.investorIds && raw.investorIds[0]) || '',
    contactId: raw.contactId || '',
    objective: raw.objective || raw.title || raw.notes || '',
    ownerId: raw.ownerId || raw.assigneeId || '',
    dueDate: raw.dueDate || '',
    channel: raw.channel || '',
    linkedSignalId: raw.linkedSignalId || raw.signalId || '',
    // pass through everything else
    ...raw,
  };
}

// ---------------------------------------------------------------------------
// Filtering & sorting
// ---------------------------------------------------------------------------

function applyFilters(list) {
  return list.filter((a) => {
    if (filters.state && a.state !== filters.state) return false;
    if (filters.actionType && a.type !== filters.actionType) return false;
    if (filters.investorId && a.investorId !== filters.investorId) return false;
    if (filters.owner && a.ownerId !== filters.owner) return false;
    if (filters.dueDateFrom && a.dueDate < filters.dueDateFrom) return false;
    if (filters.dueDateTo && a.dueDate > filters.dueDateTo) return false;
    return true;
  });
}

function applySort(list) {
  const copy = [...list];
  copy.sort((a, b) => {
    let va, vb;
    switch (sortColumn) {
      case 'state':
        va = ACTION_STATES.findIndex((s) => s.key === a.state);
        vb = ACTION_STATES.findIndex((s) => s.key === b.state);
        break;
      case 'type':
        va = a.type || '';
        vb = b.type || '';
        break;
      case 'investor':
        va = investorName(a.investorId);
        vb = investorName(b.investorId);
        break;
      case 'contact':
        va = contactName(a.contactId);
        vb = contactName(b.contactId);
        break;
      case 'objective':
        va = a.objective || '';
        vb = b.objective || '';
        break;
      case 'owner':
        va = ownerName(a.ownerId);
        vb = ownerName(b.ownerId);
        break;
      case 'dueDate':
        va = a.dueDate || '';
        vb = b.dueDate || '';
        break;
      case 'channel':
        va = a.channel || '';
        vb = b.channel || '';
        break;
      case 'signal':
        va = a.linkedSignalId || '';
        vb = b.linkedSignalId || '';
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
// View toggle
// ---------------------------------------------------------------------------

function renderViewToggle() {
  return `
    <div class="actions-view-toggle">
      <button class="btn-toggle ${currentView === 'list' ? 'active' : ''}"
              data-view="list" type="button">List View</button>
      <button class="btn-toggle ${currentView === 'board' ? 'active' : ''}"
              data-view="board" type="button">Board View</button>
    </div>`;
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

function renderFilterBar() {
  const stateOptions = ACTION_STATES.map(
    (s) =>
      `<option value="${s.key}" ${filters.state === s.key ? 'selected' : ''}>${s.label}</option>`,
  ).join('');

  const typeOptions = ACTION_TYPES.map(
    (t) =>
      `<option value="${t}" ${filters.actionType === t ? 'selected' : ''}>${formatTypeLabel(t)}</option>`,
  ).join('');

  const investorOptions = investors
    .map(
      (inv) =>
        `<option value="${inv.id}" ${filters.investorId === inv.id ? 'selected' : ''}>${escapeHtml(inv.name)}</option>`,
    )
    .join('');

  const ownerOptions = teamMembers
    .map((m) => {
      const label = m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.id;
      return `<option value="${m.id}" ${filters.owner === m.id ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    })
    .join('');

  return `
    <div class="actions-filter-bar">
      <label class="filter-group">
        <span class="filter-label">State</span>
        <select data-filter="state">
          <option value="">All States</option>
          ${stateOptions}
        </select>
      </label>

      <label class="filter-group">
        <span class="filter-label">Action Type</span>
        <select data-filter="actionType">
          <option value="">All Types</option>
          ${typeOptions}
        </select>
      </label>

      <label class="filter-group">
        <span class="filter-label">Investor</span>
        <select data-filter="investorId">
          <option value="">All Investors</option>
          ${investorOptions}
        </select>
      </label>

      <label class="filter-group">
        <span class="filter-label">Owner</span>
        <select data-filter="owner">
          <option value="">All Owners</option>
          ${ownerOptions}
        </select>
      </label>

      <label class="filter-group">
        <span class="filter-label">Due From</span>
        <input type="date" data-filter="dueDateFrom" value="${filters.dueDateFrom}" />
      </label>

      <label class="filter-group">
        <span class="filter-label">Due To</span>
        <input type="date" data-filter="dueDateTo" value="${filters.dueDateTo}" />
      </label>
    </div>`;
}

// ---------------------------------------------------------------------------
// List view (table)
// ---------------------------------------------------------------------------

function sortIndicator(col) {
  if (sortColumn !== col) return '';
  return sortAsc ? ' \u25B2' : ' \u25BC';
}

function renderListView(data) {
  const sorted = applySort(data);

  const headerCols = [
    { key: 'state', label: 'State' },
    { key: 'type', label: 'Type' },
    { key: 'investor', label: 'Investor' },
    { key: 'contact', label: 'Contact' },
    { key: 'objective', label: 'Objective' },
    { key: 'owner', label: 'Owner' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'channel', label: 'Channel' },
    { key: 'signal', label: 'Linked Signal' },
  ];

  const thead = headerCols
    .map(
      (c) =>
        `<th class="sortable" data-sort="${c.key}">${c.label}${sortIndicator(c.key)}</th>`,
    )
    .join('');

  const rows = sorted
    .map((a) => {
      const si = stateInfo(a.state);
      const overdue = isOverdue(a.dueDate) && a.state !== 'completed' && a.state !== 'cancelled';
      const dueDateDisplay = a.dueDate ? formatDate(a.dueDate) : '\u2014';

      return `
      <tr class="action-row ${overdue ? 'overdue-row' : ''}" data-action-id="${a.id}">
        <td>
          <span class="state-badge" style="background-color:${si.color};color:#fff;">
            ${si.label}
          </span>
        </td>
        <td>${formatTypeLabel(a.type)}</td>
        <td>${investorName(a.investorId)}</td>
        <td>${contactName(a.contactId)}</td>
        <td title="${escapeHtml(a.objective || '')}">${escapeHtml(truncate(a.objective || '', 50))}</td>
        <td>${ownerName(a.ownerId)}</td>
        <td class="${overdue ? 'overdue-date' : ''}">${dueDateDisplay}</td>
        <td>${a.channel ? formatTypeLabel(a.channel) : '\u2014'}</td>
        <td>${signalLabel(a.linkedSignalId)}</td>
      </tr>`;
    })
    .join('');

  return `
    <div class="actions-list-view">
      <table class="actions-table">
        <thead><tr>${thead}</tr></thead>
        <tbody>${rows.length ? rows : '<tr><td colspan="9" class="empty-state">No actions match the current filters.</td></tr>'}</tbody>
      </table>
    </div>`;
}

// ---------------------------------------------------------------------------
// Board view (Kanban)
// ---------------------------------------------------------------------------

function renderBoardView(data) {
  // Board columns: the 5 lifecycle states (excluding cancelled)
  const boardStates = ACTION_STATES.filter((s) => s.key !== 'cancelled');

  // Group actions into columns
  const groups = {};
  boardStates.forEach((s) => {
    groups[s.key] = [];
  });
  data.forEach((a) => {
    if (groups[a.state]) {
      groups[a.state].push(a);
    }
  });

  const columns = boardStates
    .map((s) => {
      const items = groups[s.key] || [];
      const cards = items
        .map((a) => {
          const overdue =
            isOverdue(a.dueDate) && a.state !== 'completed' && a.state !== 'cancelled';
          const dueDateDisplay = a.dueDate ? formatDate(a.dueDate) : '\u2014';

          return `
          <div class="kanban-card ${overdue ? 'kanban-card-overdue' : ''}" data-action-id="${a.id}">
            <div class="kanban-card-header">
              <span class="kanban-card-investor">${investorName(a.investorId)}</span>
              <span class="kanban-card-avatar" title="${ownerName(a.ownerId)}">${ownerInitials(a.ownerId)}</span>
            </div>
            <div class="kanban-card-contact">${contactName(a.contactId)}</div>
            <div class="kanban-card-objective" title="${escapeHtml(a.objective || '')}">
              ${escapeHtml(truncate(a.objective || '', 60))}
            </div>
            <div class="kanban-card-footer">
              <span class="kanban-card-type-badge">${formatTypeLabel(a.type)}</span>
              <span class="kanban-card-due ${overdue ? 'overdue-date' : ''}">${dueDateDisplay}</span>
            </div>
          </div>`;
        })
        .join('');

      return `
        <div class="kanban-column" data-state="${s.key}">
          <div class="kanban-column-header" style="border-top: 3px solid ${s.color};">
            <span class="kanban-column-title">${s.label}</span>
            <span class="kanban-column-count">${items.length}</span>
          </div>
          <div class="kanban-column-body">
            ${cards || '<div class="kanban-empty">No actions</div>'}
          </div>
        </div>`;
    })
    .join('');

  return `<div class="actions-board-view">${columns}</div>`;
}

// ---------------------------------------------------------------------------
// Event binding
// ---------------------------------------------------------------------------

function bindEvents(container) {
  // View toggle
  container.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      renderActionsBoard(container);
    });
  });

  // Filters
  container.querySelectorAll('[data-filter]').forEach((el) => {
    el.addEventListener('change', () => {
      filters[el.dataset.filter] = el.value;
      renderActionsBoard(container);
    });
  });

  // Sortable columns
  container.querySelectorAll('.sortable').forEach((th) => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (sortColumn === col) {
        sortAsc = !sortAsc;
      } else {
        sortColumn = col;
        sortAsc = true;
      }
      renderActionsBoard(container);
    });
  });

  // Row / card click -> navigate to action detail
  container.querySelectorAll('[data-action-id]').forEach((el) => {
    el.addEventListener('click', () => {
      window.location.hash = `#/actions/${el.dataset.actionId}`;
    });
  });
}

// ---------------------------------------------------------------------------
// Main render
// ---------------------------------------------------------------------------

/**
 * Render the Actions Board into the provided container element.
 * Supports toggling between list and board (Kanban) views, filtering and
 * sorting.
 *
 * @param {HTMLElement} container - Target DOM element
 */
export function renderActionsBoard(container) {
  // Normalise all actions to a consistent shape
  const normalised = actions.map(normaliseAction);
  const filtered = applyFilters(normalised);

  const html = `
    <section class="actions-board">
      <div class="actions-board-toolbar">
        <h1 class="page-title">Actions Board</h1>
        ${renderViewToggle()}
      </div>
      ${renderFilterBar()}
      ${currentView === 'list' ? renderListView(filtered) : renderBoardView(filtered)}
    </section>`;

  renderTemplate(html, container);
  bindEvents(container);
}
