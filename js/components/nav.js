/**
 * Investor Care OS - Sidebar Navigation Component
 *
 * Renders the main sidebar navigation with links, active state highlighting,
 * badge counts for signals and actions, and current user information.
 */

import { signals, actions, teamMembers } from '../data/mock-data.js';
import { renderTemplate } from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Navigation item definitions
// ---------------------------------------------------------------------------

const PRIMARY_NAV = [
  { icon: '\uD83C\uDFE0', label: 'Home', href: '#/' },
  { icon: '\uD83D\uDD14', label: 'Signals', href: '#/signals', badgeKey: 'signals' },
  { icon: '\uD83D\uDCCB', label: 'Actions', href: '#/actions', badgeKey: 'actions' },
  { icon: '\uD83D\uDC65', label: 'Investors', href: '#/investors' },
  { icon: '\uD83D\uDCCA', label: 'Market Intelligence', href: '#/market' },
];

const SECONDARY_NAV = [
  { icon: '\uD83C\uDFAD', label: 'Personas', href: '#/personas' },
  { icon: '\uD83D\uDCC8', label: 'Reports', href: '#/reports' },
  { icon: '\uD83D\uDCCA', label: 'Peer Benchmarking', href: '#/benchmarking' },
  { icon: '\uD83D\uDDF3\uFE0F', label: 'AGM Intelligence', href: '#/agm' },
  { icon: '\uD83D\uDC65', label: 'Collaboration', href: '#/collaboration' },
  { icon: '\u2699\uFE0F', label: 'Settings', href: '#/settings' },
];

// ---------------------------------------------------------------------------
// Badge count helpers
// ---------------------------------------------------------------------------

function getBadgeCounts() {
  const newSignals = signals.filter((s) => s.state === 'new').length;
  const actionsPending = actions.filter(
    (a) => a.status === 'pending' || a.status === 'in-progress',
  ).length;

  return {
    signals: newSignals,
    actions: actionsPending,
  };
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function isActive(href, activePath) {
  // Exact match for home, prefix match for others
  if (href === '#/') return activePath === '#/' || activePath === '' || activePath === '#';
  return activePath.startsWith(href);
}

function renderBadge(count) {
  if (!count || count <= 0) return '';
  return `<span class="nav-badge">${count}</span>`;
}

function renderNavItem(item, activePath, badges) {
  const activeClass = isActive(item.href, activePath) ? ' nav-item--active' : '';
  const badge = item.badgeKey ? renderBadge(badges[item.badgeKey]) : '';
  return `
    <a href="${item.href}" class="nav-item${activeClass}">
      <span class="nav-item__icon">${item.icon}</span>
      <span class="nav-item__label">${item.label}</span>
      ${badge}
    </a>
  `;
}

function renderCurrentUser() {
  const user = teamMembers[0];
  if (!user) return '';
  return `
    <div class="nav-user">
      <div class="nav-user__avatar">${user.initials}</div>
      <div class="nav-user__info">
        <span class="nav-user__name">${user.name}</span>
        <span class="nav-user__role">${user.role}</span>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Main render function
// ---------------------------------------------------------------------------

/**
 * Render the sidebar navigation into the given container.
 * @param {HTMLElement} container  - Target DOM element
 * @param {string}      activePath - Current hash path (e.g. "#/signals")
 */
export function renderNav(container, activePath) {
  const normalizedPath = activePath || window.location.hash || '#/';
  const badges = getBadgeCounts();

  const primaryItems = PRIMARY_NAV.map((item) =>
    renderNavItem(item, normalizedPath, badges),
  ).join('\n');

  const secondaryItems = SECONDARY_NAV.map((item) =>
    renderNavItem(item, normalizedPath, badges),
  ).join('\n');

  const html = `
    <nav class="sidebar-nav">
      <div class="nav-brand">
        <h1 class="nav-brand__title">Investor Care OS</h1>
      </div>

      <div class="nav-section nav-section--primary">
        ${primaryItems}
      </div>

      <hr class="nav-divider" />

      <div class="nav-section nav-section--secondary">
        ${secondaryItems}
      </div>

      <div class="nav-footer">
        ${renderCurrentUser()}
      </div>
    </nav>
  `;

  renderTemplate(html, container);
}
