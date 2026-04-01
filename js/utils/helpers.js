/**
 * Investor Care OS - Utility / Helpers Module
 *
 * Shared formatting, rendering and routing utilities used across the
 * Investor Care OS prototype for Swedish large-cap IR teams.
 */

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Format an ISO date string as "12 Jan 2025".
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Formatted date
 */
export function formatDate(isoString) {
  const d = new Date(isoString);
  const day = d.getDate();
  const month = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Return a human-readable relative time string such as "3 days ago" or
 * "2 months ago".
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Relative time description
 */
export function formatDateRelative(isoString) {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
}

/**
 * Return the number of whole days between now and the given date.
 * @param {string} isoString - ISO 8601 date string
 * @returns {number} Days elapsed (always >= 0)
 */
export function daysSince(isoString) {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Number / text formatting
// ---------------------------------------------------------------------------

/**
 * Format a numeric value as a percentage string with one decimal place.
 * @param {number} value - The value to format (e.g. 2.14 -> "2.1%")
 * @returns {string} Formatted percentage
 */
export function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

/**
 * Return an arrow character representing a trend direction.
 * @param {'increasing'|'declining'|'stable'} direction
 * @returns {string} Arrow character
 */
export function formatTrend(direction) {
  const arrows = {
    increasing: '\u2191', // ↑
    declining: '\u2193',  // ↓
    stable: '\u2192',     // →
  };
  return arrows[direction] || '\u2192';
}

/**
 * Format a holding change showing the from/to values and the delta in
 * percentage points.
 * @param {number} from - Starting percentage (e.g. 2.1)
 * @param {number} to   - Ending percentage (e.g. 1.8)
 * @returns {string} Formatted string like "2.1% \u2192 1.8% (\u22120.3pp)"
 */
export function formatHoldingChange(from, to) {
  const delta = to - from;
  const sign = delta >= 0 ? '+' : '\u2212'; // use proper minus sign
  const absDelta = Math.abs(delta).toFixed(1);
  return `${Number(from).toFixed(1)}% \u2192 ${Number(to).toFixed(1)}% (${sign}${absDelta}pp)`;
}

// ---------------------------------------------------------------------------
// CSS class / label mapping helpers
// ---------------------------------------------------------------------------

/**
 * Return a CSS class name appropriate for the given urgency level.
 * @param {'critical'|'high'|'medium'|'low'} urgency
 * @returns {string} CSS class name
 */
export function getUrgencyClass(urgency) {
  const map = {
    critical: 'urgency-critical',
    high: 'urgency-high',
    medium: 'urgency-medium',
    low: 'urgency-low',
  };
  return map[urgency] || 'urgency-default';
}

/**
 * Return a CSS class name for a lifecycle state.
 * @param {'new'|'monitoring'|'active'|'resolved'|'archived'} state
 * @returns {string} CSS class name
 */
export function getStateClass(state) {
  const map = {
    new: 'state-new',
    monitoring: 'state-monitoring',
    active: 'state-active',
    resolved: 'state-resolved',
    archived: 'state-archived',
  };
  return map[state] || 'state-default';
}

/**
 * Return a human-readable display label for a provenance type.
 * @param {'system-detected'|'analyst-flagged'|'user-created'|'api-ingested'} provenance
 * @returns {string} Display label
 */
export function getProvenanceLabel(provenance) {
  const map = {
    'system-detected': 'System Detected',
    'analyst-flagged': 'Analyst Flagged',
    'user-created': 'User Created',
    'api-ingested': 'API Ingested',
  };
  return map[provenance] || provenance;
}

// ---------------------------------------------------------------------------
// String utilities
// ---------------------------------------------------------------------------

/**
 * Truncate a string to the given maximum length, appending an ellipsis if
 * the text was shortened.
 * @param {string} text      - The input string
 * @param {number} maxLength - Maximum allowed length (including ellipsis)
 * @returns {string} Truncated string
 */
export function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '\u2026'; // …
}

/**
 * Escape HTML special characters to prevent XSS when inserting user content.
 * @param {string} str - Raw string
 * @returns {string} Escaped string safe for innerHTML
 */
export function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(str).replace(/[&<>"']/g, (ch) => map[ch]);
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/**
 * Render a simple SVG sparkline from an array of numeric data points.
 * @param {number[]} data   - Array of y-values
 * @param {number}   width  - SVG width in pixels
 * @param {number}   height - SVG height in pixels
 * @returns {string} SVG markup string
 */
export function renderSparkline(data, width, height) {
  if (!data || data.length === 0) return '';

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // avoid division by zero
  const padding = 2;
  const usableHeight = height - padding * 2;
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points = data
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = padding + usableHeight - ((v - min) / range) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return [
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="sparkline" xmlns="http://www.w3.org/2000/svg">`,
    `  <polyline fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" points="${points}" />`,
    `</svg>`,
  ].join('');
}

/**
 * Return an HTML string for a confidence bar indicator.
 * High = 3 filled segments, medium = 2, low = 1.
 * @param {'high'|'medium'|'low'} level - Confidence level
 * @returns {string} HTML string
 */
export function renderConfidenceBar(level) {
  const filled = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
  const segments = Array.from({ length: 3 }, (_, i) => {
    const cls = i < filled ? 'confidence-segment filled' : 'confidence-segment';
    return `<span class="${cls}"></span>`;
  }).join('');
  return `<span class="confidence-bar confidence-${level}" title="${level} confidence">${segments}</span>`;
}

/**
 * Safely set the innerHTML of a container element.
 * @param {string}      html      - HTML string to render
 * @param {HTMLElement}  container - Target DOM element
 */
export function renderTemplate(html, container) {
  if (container) {
    container.innerHTML = html;
  }
}

/**
 * Show a temporary toast notification that auto-dismisses after a short
 * delay.
 * @param {string} message           - Text to display
 * @param {'success'|'error'|'info'} [type='info'] - Visual style
 * @param {number} [duration=3000]   - Milliseconds before auto-dismiss
 */
export function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger entrance animation on next frame
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove());
    // Fallback removal in case transitionend doesn't fire
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

// ---------------------------------------------------------------------------
// Functional utilities
// ---------------------------------------------------------------------------

/**
 * Return a debounced version of the provided function that delays invocation
 * until after `delay` milliseconds have elapsed since the last call.
 * @param {Function} fn    - Function to debounce
 * @param {number}   delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

/**
 * Create a simple hash-based router.
 *
 * Patterns may contain named parameters prefixed with `:` (e.g.
 * `#/signals/:id`). The matching handler receives an object of extracted
 * params.
 *
 * @param {Object<string, Function>} routes - Map of pattern strings to
 *   handler functions. Each handler receives `(params)`.
 * @returns {{ navigate: (hash: string) => void, destroy: () => void }}
 *   Controller with a programmatic navigate method and a cleanup function.
 *
 * @example
 * const router = createRouter({
 *   '#/signals':      () => renderList(),
 *   '#/signals/:id':  ({ id }) => renderDetail(id),
 * });
 */
export function createRouter(routes) {
  // Pre-compile patterns into RegExp objects
  const compiled = Object.entries(routes).map(([pattern, handler]) => {
    const paramNames = [];
    const regexStr = pattern
      .replace(/[-/\\^$*+?.()|[\]{}]/g, (m) =>
        m === '/' || m === ':' ? m : `\\${m}`,
      )
      .replace(/:([A-Za-z_]\w*)/g, (_match, name) => {
        paramNames.push(name);
        return '([^/]+)';
      });
    // Replace unescaped slashes for regex
    const finalRegex = new RegExp(`^${regexStr.replace(/\//g, '\\/')}$`);
    return { regex: finalRegex, paramNames, handler };
  });

  function dispatch() {
    const hash = window.location.hash || '#/';
    for (const { regex, paramNames, handler } of compiled) {
      const match = hash.match(regex);
      if (match) {
        const params = {};
        paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]);
        });
        handler(params);
        return;
      }
    }
  }

  window.addEventListener('hashchange', dispatch);
  // Run once on initialisation
  dispatch();

  return {
    /** Programmatically navigate to a hash route. */
    navigate(hash) {
      window.location.hash = hash;
    },
    /** Remove the hashchange listener. */
    destroy() {
      window.removeEventListener('hashchange', dispatch);
    },
  };
}
