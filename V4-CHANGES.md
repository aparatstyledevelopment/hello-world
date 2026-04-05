# V4 Architecture Changes Summary

> All changes based on GitHub pull requests in `aparatstyledevelopment/hello-world`, April 2026.

## Pre-V4 Baseline (PR #1 — Apr 1, 2026)

The project started as **Investor Care OS** — an IR intelligence platform prototype built as a single HTML file with hash-based routing, 8 routes, and a full mock dataset. Features included signals triage, actions management (list + Kanban views), investor profiles with timelines, and a market intelligence feed.

## V4 Architecture Restructure (PRs #2–#3 — Apr 4, 2026)

The v4 restructure was a complete reimagining of the app's navigation and interaction model:

### New Pages
- **Today page** (`/today`) — new default landing with ownership narrative, market context, meeting prep, unified signal/action stream, and investor trend indicators
- **Shareholder Intelligence** (`/shareholders`) — new core navigation tab for shareholder analysis
- **Signals & Actions** (`/signals-actions`) — merged from previously separate Signals and Actions pages into a single unified tab

### Capture Modal Redesign
- Replaced the old "Log Interaction" modal with a simplified **NotebookLM-style Capture modal**
- Four main fields: source type, content, investor (optional), and date
- Source types: meeting notes, call notes, email, document, voice memo, photo, quick note
- Auto-extraction of contacts, action items, and key topics

### Navigation Restructure
- **New hierarchy**: Today > Investors > Shareholders > Signals & Actions
- Market Intel moved from main engine to Resources section
- Added "Prepare" concept to investor profile with enhanced coverage matrix

### Simplifications
- Action lifecycle reduced from 5 states to 4 (removed `awaiting_logging`)
- Simplified list views for signals and actions

### Mobile Responsiveness
- Fixed overflow, grids, stat cards, sidebars, and headings across all mobile screens

## Post-V4 Refinements (PRs #4–#12 — Apr 4, 2026)

### PR #5 — Contacts, Nav Consolidation, Signal Actions & Mobile Fixes
- Further navigation consolidation and mobile layout fixes

### PR #6 — Fix Horizontal Overflow on Mobile
- Resolved horizontal scroll issues on mobile viewports

### PR #7 — Fix Right Margin Overflow Globally
- Global fix for right-side margin overflow across all pages

### PR #8 — Mobile Spacing + Search & Notifications
- Added global search overlay (Cmd+K) with results for investors, signals, and contacts
- Added notifications panel to bell icon (high-urgency signals, overdue actions)
- Changed Capture button icon from Mic to Plus
- Reduced extra left spacing on Recharts charts
- Fixed select dropdown chevron spacing

### PR #9 — Functional Capture, Contacts Tab, Scrollbar & Search Fixes
*Largest post-v4 change (+1053/−266 lines, 8 files)*
- **Fully functional Capture feature**: extracts investors, contacts, sentiment, topics, and action items from free-text input; updates timeline, contact dates, investor sentiment; optionally creates follow-up actions
- **Reactive data store** via React Context so captured data appears live across TodayPage and Layout
- **Contacts tab** added to InvestorDetailPage
- Dark Ownership Narrative card replaces Market Context on Today page
- Compact signal/action stream items (removed bulky badge chips)
- Consistent action button heights
- Hidden scrollbars globally
- Search box forced to single line

### PR #10 — Clean URLs
- Switched from `HashRouter` to `BrowserRouter` (removed `/#/` prefix from all URLs)
- Added `historyApiFallback` for Vite preview server

### PR #11 — Fix Users Icon Import
- Fixed missing `Users` icon import in TodayPage that caused a crash on the root URL

### PR #12 — Scroll Position Management
- Scroll to top on forward navigation
- Restore saved scroll position on back/forward navigation

## Notes
- All v4 work occurred on **April 4, 2026** across 11 merged PRs
- No GitHub review comments were left on any of the PRs
- Zero open or closed issues exist in the repository
- The `package.json` version remains at `0.0.0`
