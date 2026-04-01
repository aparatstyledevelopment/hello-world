# Page Descriptions

## Investors Page (`/investors`)
The default landing page displays a Priority Coverage Matrix — a filterable table of all tracked investors showing their type (institutional, activist, passive, etc.), holding percentage, relationship health indicator, last touch date, and sensitivity level. It serves as the primary entry point for navigating to individual investor profiles.

## Investor Detail Page (`/investors/:id`)
A comprehensive investor profile split into two tabs. The **Overview** tab presents a structural snapshot (stake size, voting power, market value, MAR status), conviction and sentiment analysis, recent signals, engagement timeline, intelligence engine parameters, and key contacts. The **Engagement & Timeline** tab provides a full engagement history with timeline filtering, a narrative consistency monitor, and a sentiment and risk sidebar.

## Investor Timeline Page (`/investors/:id/timeline`)
A dedicated full-screen timeline view for a single investor, with engagement events grouped by month. Users can filter by interaction type — meetings, emails, calls, filings, and signals — to trace the complete history of the relationship with that investor.

## Signals Page (`/signals`)
The real-time Intelligence Desk surfaces active signals across five categories: retention risk, influence shifts, governance changes, information gaps, and relationship health. Each signal is displayed as an expandable card with severity indicators, and a pressure summary visualization provides an at-a-glance overview of the current signal landscape.

## Signal Detail Page (`/signals/:id`)
A deep-dive view into an individual signal, presenting the underlying evidence, likely impact assessment, recommended response actions, raw data parameters, and holding trend charts. This page gives analysts full context to evaluate and act on a specific piece of intelligence.

## Actions Page (`/actions`)
The engagement action management hub offers two views: a Kanban board with five phases (planned, preparing, in progress, awaiting logging, completed) and a traditional list view. Both views support filtering, allowing teams to track and manage all investor engagement activities from planning through completion.

## Action Detail Page (`/actions/:id` and `/actions/new`)
A form-based interface for creating or editing an engagement action. It includes investor selection, contact assignment, a visual phase timeline stepper to track progress through engagement stages, and an outcome logging section for recording results after completion.

## Market Page (`/market`)
The Market Intelligence feed aggregates external signals including ownership shifts, peer company activity, fund flows, regulatory changes, and media coverage. It features a concentration index, top buyers and sellers lists, and links to affected investors in the system, connecting market-level events to portfolio-level impact.

## Personas Page (`/personas`)
Displays investor behavioral archetypes — Active Accumulator, Silent Reducer, Passive Tracker, Governance Steward, and Cautious Trimmer. Each persona card shows aggregate engagement rates, risk scores, and key meeting themes, helping IR teams tailor their approach based on investor behavior patterns.

## Reports Page (`/reports`)
A multi-tab analytics dashboard with four sections: **Engagement** (interaction trend charts and coverage gap analysis), **Signal Intelligence** (conversion funnel and signal accuracy gauge), **Ownership** (trend lines for top investors and position breakdowns), and **Team Performance** (workload distribution and tier engagement allocation).

## Benchmarking Page (`/benchmarking`)
A peer comparison tool that presents a peer position index, ownership overlap table, and side-by-side metrics for engagement intensity and ownership stability. It includes an ownership structure breakdown and auto-generated key insights, enabling IR teams to understand how their shareholder base compares to peers.

## AGM Page (`/agm`)
The AGM Intelligence platform centers on annual general meeting preparation, featuring a days-to-AGM countdown, a six-phase process roadmap displayed as a vertical timeline, voting power disparity analysis (Class A vs. Class B shares), a governance issue tracker covering board composition, compensation, and sustainability topics, predicted voting outcomes, and historical voting results from 2023 to 2025.

## Collaboration Page (`/collaboration`)
A team coordination hub showing individual workload cards (active actions, open signals, health status), a priority coverage matrix table, an engagement history activity feed, handoff notes between team members, and collapsible signal queue sections per team member — all designed to keep IR teams aligned and ensure no investor falls through the cracks.

## Settings Page (`/settings`)
The configuration page provides controls for team setup, notification preferences, data source connections, confidence calibration parameters, and market configuration options, allowing administrators to tailor the platform's behavior and integrations to their organization's needs.

## Home Page (Dashboard)
An executive overview dashboard displaying key performance metrics, a hero signal card highlighting the most critical active signal, a live intelligence feed, top holders summary, recommended actions queue, and an ownership overview grid. It provides a single-screen summary of the IR team's current priorities and portfolio health.
