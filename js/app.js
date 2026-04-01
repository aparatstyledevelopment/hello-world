/**
 * Investor Care OS — Main Application
 * Single-page application with hash-based routing
 */

import { renderHome } from './components/home.js';
import { renderSignalsInbox } from './components/signals-inbox.js';
import { renderSignalDetail } from './components/signal-detail.js';
import { renderActionsBoard } from './components/actions-board.js';
import { renderActionDetail } from './components/action-detail.js';
import { renderInvestorProfile } from './components/investor-profile.js';
import { renderInvestorsList } from './components/investors-list.js';
import { renderMarketIntel } from './components/market-intel.js';
import { renderPersonas } from './components/personas.js';
import { renderReporting } from './components/reporting.js';
import { renderPeerBenchmarking } from './components/peer-benchmarking.js';
import { renderAGMIntelligence } from './components/agm-intelligence.js';
import { renderCollaboration } from './components/collaboration.js';
import { renderNav } from './components/nav.js';

const mainContent = document.getElementById('main-content');
const navContainer = document.getElementById('nav-sidebar');

function getHash() {
  return window.location.hash || '#/';
}

function parseRoute(hash) {
  const parts = hash.replace('#/', '').split('/');
  return { segments: parts, full: hash };
}

function route() {
  const hash = getHash();
  const { segments } = parseRoute(hash);

  // Clear main content
  mainContent.innerHTML = '';
  mainContent.scrollTop = 0;

  // Update nav active state
  renderNav(navContainer, hash);

  const section = segments[0] || '';

  switch (section) {
    case '':
      renderHome(mainContent);
      break;

    case 'signals':
      if (segments[1]) {
        renderSignalDetail(mainContent, segments[1]);
      } else {
        renderSignalsInbox(mainContent);
      }
      break;

    case 'actions':
      if (segments[1]) {
        renderActionDetail(mainContent, segments[1]);
      } else {
        renderActionsBoard(mainContent);
      }
      break;

    case 'investors':
      if (segments[1]) {
        renderInvestorProfile(mainContent, segments[1]);
      } else {
        renderInvestorsList(mainContent);
      }
      break;

    case 'market':
      renderMarketIntel(mainContent);
      break;

    case 'personas':
      renderPersonas(mainContent);
      break;

    case 'reports':
      renderReporting(mainContent);
      break;

    case 'benchmarking':
      renderPeerBenchmarking(mainContent);
      break;

    case 'agm':
      renderAGMIntelligence(mainContent);
      break;

    case 'collaboration':
      renderCollaboration(mainContent);
      break;

    case 'settings':
      renderPlaceholder(mainContent, 'Settings', 'Team configuration, notification preferences, data source connections, and system calibration.');
      break;

    default:
      render404(mainContent);
      break;
  }
}

function renderPlaceholder(container, title, description) {
  container.innerHTML = `
    <div class="ic-page">
      <div class="ic-page__header">
        <h1 class="ic-page__title">${title}</h1>
      </div>
      <div class="ic-placeholder">
        <div class="ic-placeholder__icon">🚧</div>
        <h2 class="ic-placeholder__title">${title}</h2>
        <p class="ic-placeholder__text">${description}</p>
      </div>
    </div>
  `;
}

function render404(container) {
  container.innerHTML = `
    <div class="ic-page">
      <div class="ic-placeholder">
        <div class="ic-placeholder__icon">🔍</div>
        <h2 class="ic-placeholder__title">Page not found</h2>
        <p class="ic-placeholder__text">The page you are looking for does not exist.</p>
        <a href="#/" class="ic-btn ic-btn--primary">Go to Home</a>
      </div>
    </div>
  `;
}

// Initialize
window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', route);

// If already loaded, route immediately
if (document.readyState !== 'loading') {
  route();
}
