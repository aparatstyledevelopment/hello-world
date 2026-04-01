/**
 * Investor Care OS - Market Intelligence Feed
 *
 * Displays a filterable feed of market intelligence items including
 * ownership changes, peer developments, fund flows, regulatory updates,
 * and media narratives relevant to the IR team.
 */

import { marketIntelligence, investors } from '../data/mock-data.js';
import { formatDate, escapeHtml, renderTemplate } from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// Category configuration
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'ownership-change', label: 'Ownership changes' },
  { key: 'peer-development', label: 'Peer developments' },
  { key: 'fund-flow', label: 'Fund flows' },
  { key: 'regulatory', label: 'Regulatory' },
  { key: 'media-narrative', label: 'Media narratives' },
];

const CATEGORY_LABELS = {
  'ownership-change': 'Ownership Change',
  'peer-development': 'Peer Development',
  'fund-flow': 'Fund Flow',
  'regulatory': 'Regulatory',
  'media-narrative': 'Media Narrative',
};

// ---------------------------------------------------------------------------
// Quick stats helpers
// ---------------------------------------------------------------------------

function computeQuickStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const ownershipThisMonth = marketIntelligence.filter(
    (item) => item.category === 'ownership-change' && new Date(item.date) >= startOfMonth,
  ).length;

  const regulatoryThisWeek = marketIntelligence.filter(
    (item) => item.category === 'regulatory' && new Date(item.date) >= startOfWeek,
  ).length;

  const activeMediaNarratives = marketIntelligence.filter(
    (item) => item.category === 'media-narrative',
  ).length;

  return { ownershipThisMonth, regulatoryThisWeek, activeMediaNarratives };
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function renderAffectedInvestors(investorIds) {
  if (!investorIds || investorIds.length === 0) {
    return '<span class="mi-no-investors">None specifically</span>';
  }
  return investorIds
    .map((id) => {
      const inv = investors.find((i) => i.id === id);
      const name = inv ? escapeHtml(inv.name) : id;
      return `<a href="#/investors/${id}" class="mi-investor-link">${name}</a>`;
    })
    .join(', ');
}

function renderCategoryBadge(category) {
  const label = CATEGORY_LABELS[category] || category;
  const cssClass = `mi-badge mi-badge--${category}`;
  return `<span class="${cssClass}">${escapeHtml(label)}</span>`;
}

function renderFilterChips(activeCategory) {
  return CATEGORIES.map((cat) => {
    const activeClass = cat.key === activeCategory ? ' mi-chip--active' : '';
    return `<button class="mi-chip${activeClass}" data-category="${cat.key}">${escapeHtml(cat.label)}</button>`;
  }).join('\n');
}

function renderQuickStats(stats) {
  return `
    <div class="mi-quick-stats">
      <div class="mi-stat">
        <span class="mi-stat__value">${stats.ownershipThisMonth}</span>
        <span class="mi-stat__label">Ownership changes this month</span>
      </div>
      <div class="mi-stat">
        <span class="mi-stat__value">${stats.regulatoryThisWeek}</span>
        <span class="mi-stat__label">Regulatory filings this week</span>
      </div>
      <div class="mi-stat">
        <span class="mi-stat__value">${stats.activeMediaNarratives}</span>
        <span class="mi-stat__label">Active media narratives</span>
      </div>
    </div>
  `;
}

function renderCard(item) {
  return `
    <div class="mi-card" data-category="${item.category}">
      <div class="mi-card__header">
        <span class="mi-card__date">${formatDate(item.date)}</span>
        ${renderCategoryBadge(item.category)}
      </div>
      <h3 class="mi-card__title">${escapeHtml(item.title)}</h3>
      <p class="mi-card__description">${escapeHtml(item.description)}</p>
      <div class="mi-card__relevance">
        <strong>Relevance:</strong> ${escapeHtml(item.relevance)}
      </div>
      <div class="mi-card__meta">
        <span class="mi-card__investors">
          <strong>Affected investors:</strong> ${renderAffectedInvestors(item.affectedInvestorIds)}
        </span>
        <span class="mi-card__source"><strong>Source:</strong> ${escapeHtml(item.source)}</span>
      </div>
    </div>
  `;
}

function renderFeed(items) {
  if (items.length === 0) {
    return '<p class="mi-empty">No intelligence items match the selected filter.</p>';
  }
  return items.map(renderCard).join('\n');
}

// ---------------------------------------------------------------------------
// Main render function
// ---------------------------------------------------------------------------

/**
 * Render the Market Intelligence feed page into the given container.
 * @param {HTMLElement} container - Target DOM element
 */
export function renderMarketIntel(container) {
  let activeCategory = 'all';

  function getFilteredItems() {
    const sorted = [...marketIntelligence].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    if (activeCategory === 'all') return sorted;
    return sorted.filter((item) => item.category === activeCategory);
  }

  function render() {
    const stats = computeQuickStats();
    const items = getFilteredItems();

    const html = `
      <div class="mi-page">
        <div class="mi-header">
          <h1 class="mi-header__title">Market Intelligence</h1>
          <p class="mi-header__description">
            Curated feed of ownership changes, peer activity, fund flows,
            regulatory developments, and media narratives relevant to your
            investor base.
          </p>
        </div>

        ${renderQuickStats(stats)}

        <div class="mi-filters">
          ${renderFilterChips(activeCategory)}
        </div>

        <div class="mi-feed">
          ${renderFeed(items)}
        </div>
      </div>
    `;

    renderTemplate(html, container);

    // Attach filter chip click handlers
    container.querySelectorAll('.mi-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        activeCategory = chip.dataset.category;
        render();
      });
    });
  }

  render();
}
