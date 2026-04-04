// ── Investors ──────────────────────────────────────────────
export const investors = [
  {
    id: "inv-001",
    name: "BlackRock Fund Advisors",
    type: "passive",
    holdingPct: 8.4,
    holdingHistory: [7.9, 8.0, 8.1, 8.2, 8.3, 8.4],
    holdingTrend: "up",
    tier: 1,
    engagementMomentum: "positive",
    contacts: [
      { id: "con-001", name: "Sarah Chen", role: "Portfolio Manager", email: "s.chen@blackrock.example", lastInteraction: "2026-03-20" },
      { id: "con-002", name: "Michael Torres", role: "Stewardship Analyst", email: "m.torres@blackrock.example", lastInteraction: "2026-02-10" },
    ],
    relationshipOwner: "Jane Doe",
    stateParameters: [
      { label: "Investment Thesis", value: "Index tracking, ESG tilt", provenance: "observed", freshness: "fresh" },
      { label: "Voting Policy", value: "ISS-aligned with exceptions", provenance: "observed", freshness: "fresh" },
      { label: "Engagement Priority", value: "Climate transition plan", provenance: "inferred", freshness: "stale" },
      { label: "Sentiment", value: "Neutral-positive", provenance: "team_assessed", freshness: "fresh" },
      { label: "Decision Timeline", value: "Quarterly review cycle", provenance: "inferred", freshness: "fresh" },
      { label: "Internal Champion", value: "Sarah Chen", provenance: "team_assessed", freshness: "fresh" },
    ],
  },
  {
    id: "inv-002",
    name: "Vanguard Group",
    type: "passive",
    holdingPct: 6.2,
    holdingHistory: [6.5, 6.4, 6.3, 6.2, 6.2, 6.2],
    holdingTrend: "down",
    tier: 1,
    engagementMomentum: "neutral",
    contacts: [
      { id: "con-003", name: "James Wright", role: "Investment Stewardship", email: "j.wright@vanguard.example", lastInteraction: "2026-03-15" },
    ],
    relationshipOwner: "Jane Doe",
    stateParameters: [
      { label: "Investment Thesis", value: "Broad index exposure", provenance: "observed", freshness: "fresh" },
      { label: "Voting Policy", value: "In-house guidelines", provenance: "observed", freshness: "fresh" },
      { label: "Sentiment", value: "Neutral", provenance: "team_assessed", freshness: "fresh" },
    ],
  },
  {
    id: "inv-003",
    name: "Wellington Management",
    type: "active",
    holdingPct: 4.1,
    holdingHistory: [3.5, 3.7, 3.8, 3.9, 4.0, 4.1],
    holdingTrend: "up",
    tier: 1,
    engagementMomentum: "positive",
    contacts: [
      { id: "con-004", name: "Emily Nakamura", role: "Senior Analyst", email: "e.nakamura@wellington.example", lastInteraction: "2026-03-28" },
      { id: "con-005", name: "David Park", role: "Portfolio Manager", email: "d.park@wellington.example", lastInteraction: "2026-01-15" },
    ],
    relationshipOwner: "John Smith",
    stateParameters: [
      { label: "Investment Thesis", value: "Growth at reasonable price", provenance: "inferred", freshness: "fresh" },
      { label: "Sentiment", value: "Positive", provenance: "team_assessed", freshness: "fresh" },
      { label: "Key Concern", value: "Capital allocation strategy", provenance: "observed", freshness: "fresh" },
    ],
  },
  {
    id: "inv-004",
    name: "Harris Associates",
    type: "active",
    holdingPct: 3.2,
    holdingHistory: [3.8, 3.6, 3.5, 3.4, 3.3, 3.2],
    holdingTrend: "down",
    tier: 2,
    engagementMomentum: "negative",
    contacts: [
      { id: "con-006", name: "Robert Kim", role: "Research Analyst", email: "r.kim@harris.example", lastInteraction: "2026-02-01" },
    ],
    relationshipOwner: "Jane Doe",
    stateParameters: [
      { label: "Investment Thesis", value: "Deep value, long-term", provenance: "observed", freshness: "stale" },
      { label: "Sentiment", value: "Cautious", provenance: "team_assessed", freshness: "fresh" },
    ],
  },
  {
    id: "inv-005",
    name: "CalPERS",
    type: "pension",
    holdingPct: 2.8,
    holdingHistory: [2.7, 2.7, 2.8, 2.8, 2.8, 2.8],
    holdingTrend: "neutral",
    tier: 2,
    engagementMomentum: "neutral",
    contacts: [
      { id: "con-007", name: "Lisa Patel", role: "Corporate Governance", email: "l.patel@calpers.example", lastInteraction: "2026-03-05" },
    ],
    relationshipOwner: "John Smith",
    stateParameters: [
      { label: "Voting Policy", value: "CalPERS governance principles", provenance: "observed", freshness: "fresh" },
      { label: "Engagement Priority", value: "Board diversity & climate", provenance: "observed", freshness: "fresh" },
    ],
  },
  {
    id: "inv-006",
    name: "Artisan Partners",
    type: "active",
    holdingPct: 1.5,
    holdingHistory: [1.8, 1.7, 1.6, 1.6, 1.5, 1.5],
    holdingTrend: "down",
    tier: 3,
    engagementMomentum: "negative",
    contacts: [
      { id: "con-008", name: "Anna Kowalski", role: "Analyst", email: "a.kowalski@artisan.example", lastInteraction: "2025-12-10" },
    ],
    relationshipOwner: "Jane Doe",
    stateParameters: [
      { label: "Sentiment", value: "Negative", provenance: "inferred", freshness: "stale" },
    ],
  },
  {
    id: "inv-007",
    name: "Norges Bank IM",
    type: "sovereign",
    holdingPct: 1.9,
    holdingHistory: [1.8, 1.8, 1.9, 1.9, 1.9, 1.9],
    holdingTrend: "neutral",
    tier: 2,
    engagementMomentum: "positive",
    contacts: [
      { id: "con-009", name: "Erik Hansen", role: "Responsible Investment", email: "e.hansen@nbim.example", lastInteraction: "2026-03-22" },
    ],
    relationshipOwner: "John Smith",
    stateParameters: [
      { label: "Engagement Priority", value: "Climate risk, human rights", provenance: "observed", freshness: "fresh" },
      { label: "Sentiment", value: "Constructive", provenance: "team_assessed", freshness: "fresh" },
    ],
  },
];

// ── Signals ───────────────────────────────────────────────
export const signals = [
  {
    id: "sig-001",
    investorId: "inv-004",
    type: "retention_risk",
    urgency: "high",
    state: "confirmed",
    headline: "Harris Associates reducing position — 3rd consecutive quarter of selling",
    description: "13F filings show Harris Associates has reduced its position from 3.8% to 3.2% over three quarters. Combined with the absence from recent roadshows, this indicates potential full exit.",
    confidence: "high",
    source: "13F Filing Analysis",
    detectedAt: "2026-03-15",
    parameters: [
      { label: "Selling pace", value: "~0.2% per quarter", provenance: "observed" },
      { label: "Exit probability", value: "60%", provenance: "inferred" },
    ],
  },
  {
    id: "sig-002",
    investorId: "inv-001",
    type: "governance_management",
    urgency: "medium",
    state: "reviewing",
    headline: "BlackRock updated proxy voting guidelines — new climate requirements",
    description: "BlackRock has published updated 2026 proxy voting guidelines with enhanced climate disclosure expectations. Our current reporting may not fully satisfy new requirements.",
    confidence: "high",
    source: "Public Filing",
    detectedAt: "2026-03-20",
    parameters: [
      { label: "Key requirement", value: "TCFD-aligned scenario analysis", provenance: "observed" },
    ],
  },
  {
    id: "sig-003",
    investorId: "inv-003",
    type: "influence_opportunity",
    urgency: "medium",
    state: "new",
    headline: "Wellington increasing position — potential to become top-3 holder",
    description: "Wellington has steadily increased their position over 6 months. Continued buying at current pace would make them a top-3 holder by mid-year.",
    confidence: "medium",
    source: "Holding Analysis",
    detectedAt: "2026-03-25",
    parameters: [
      { label: "Accumulation rate", value: "+0.1% per month", provenance: "observed" },
    ],
  },
  {
    id: "sig-004",
    investorId: "inv-006",
    type: "retention_risk",
    urgency: "high",
    state: "action_created",
    headline: "Artisan Partners — no engagement in 110+ days, holding declining",
    description: "Last contact with Artisan was December 10, 2025. Combined with a 0.3% holding decrease, this suggests disengagement.",
    confidence: "medium",
    source: "CRM Analysis",
    detectedAt: "2026-03-28",
    parameters: [
      { label: "Days since contact", value: "112", provenance: "observed" },
    ],
  },
  {
    id: "sig-005",
    investorId: "inv-005",
    type: "governance_management",
    urgency: "low",
    state: "new",
    headline: "CalPERS annual engagement letter — board diversity expectations",
    description: "CalPERS has sent their annual engagement expectations letter highlighting board diversity targets for 2026.",
    confidence: "high",
    source: "Direct Communication",
    detectedAt: "2026-03-30",
    parameters: [],
  },
  {
    id: "sig-006",
    investorId: "inv-002",
    type: "information_gap",
    urgency: "low",
    state: "resolved",
    headline: "Vanguard stewardship team restructure — new coverage analyst",
    description: "Vanguard has restructured their investment stewardship team. James Wright remains our primary contact but a new analyst has been assigned.",
    confidence: "medium",
    source: "LinkedIn Intelligence",
    detectedAt: "2026-03-10",
    parameters: [],
  },
  {
    id: "sig-007",
    investorId: "inv-007",
    type: "relationship_maintenance",
    urgency: "medium",
    state: "confirmed",
    headline: "Norges Bank annual responsible investment report — positive mention",
    description: "Our company received a positive mention in NBIM's latest responsible investment report regarding our sustainability commitments.",
    confidence: "high",
    source: "Public Report",
    detectedAt: "2026-03-22",
    parameters: [],
  },
];

// ── Actions ───────────────────────────────────────────────
export const actions = [
  {
    id: "act-001",
    investorId: "inv-004",
    contactId: "con-006",
    signalId: "sig-001",
    type: "retention_risk",
    state: "in_progress",
    objective: "Schedule urgent 1-on-1 meeting with Harris Associates to understand concerns and present updated investment thesis",
    owner: "Jane Doe",
    dueDate: "2026-04-05",
    channel: "Video Call",
    talkingPoints: "- Acknowledge observed position reduction\n- Present updated 3-year growth strategy\n- Discuss capital allocation improvements\n- Address any specific concerns",
    messageAngle: "Partnership-focused, forward-looking value creation narrative",
    successCriteria: "Meeting scheduled and completed; clear understanding of their investment thesis review timeline",
    outcome: null,
  },
  {
    id: "act-002",
    investorId: "inv-001",
    contactId: "con-001",
    signalId: "sig-002",
    type: "governance_management",
    state: "planned",
    objective: "Review BlackRock's updated proxy guidelines and prepare compliance gap analysis",
    owner: "John Smith",
    dueDate: "2026-04-15",
    channel: "Internal",
    talkingPoints: "- Map new requirements against current disclosures\n- Identify gaps in TCFD scenario analysis\n- Prepare remediation timeline",
    messageAngle: "Proactive compliance and leadership positioning",
    successCriteria: "Gap analysis document completed and shared with governance team",
    outcome: null,
  },
  {
    id: "act-003",
    investorId: "inv-003",
    contactId: "con-004",
    signalId: "sig-003",
    type: "influence_opportunity",
    state: "preparing",
    objective: "Prepare tailored investor pack for Wellington highlighting growth drivers aligned with their GARP strategy",
    owner: "Jane Doe",
    dueDate: "2026-04-10",
    channel: "Email",
    talkingPoints: "- Q1 earnings preview highlights\n- R&D pipeline update\n- Market expansion thesis\n- Management access offer",
    messageAngle: "Growth-at-reasonable-price thesis support with proprietary insights",
    successCriteria: "Investor pack sent and follow-up meeting requested",
    outcome: null,
  },
  {
    id: "act-004",
    investorId: "inv-006",
    contactId: "con-008",
    signalId: "sig-004",
    type: "retention_risk",
    state: "planned",
    objective: "Re-engage Artisan Partners with personalized outreach and roadshow invitation",
    owner: "Jane Doe",
    dueDate: "2026-04-08",
    channel: "Phone",
    talkingPoints: "- Reconnect after gap in communication\n- Share recent positive developments\n- Extend invitation to upcoming roadshow",
    messageAngle: "Warm re-engagement, no pressure",
    successCriteria: "Successful phone conversation; roadshow RSVP confirmed",
    outcome: null,
  },
  {
    id: "act-005",
    investorId: "inv-005",
    contactId: "con-007",
    signalId: "sig-005",
    type: "governance_management",
    state: "planned",
    objective: "Respond to CalPERS engagement letter with board diversity progress update",
    owner: "John Smith",
    dueDate: "2026-04-20",
    channel: "Letter",
    talkingPoints: "- Current board composition statistics\n- Diversity targets and progress\n- Planned governance enhancements",
    messageAngle: "Transparent progress reporting with forward commitments",
    successCriteria: "Response letter sent; positive acknowledgment received",
    outcome: null,
  },
  {
    id: "act-006",
    investorId: "inv-007",
    contactId: "con-009",
    signalId: "sig-007",
    type: "relationship_maintenance",
    state: "completed",
    objective: "Send thank-you note to Norges Bank referencing positive report mention and propose ESG deep-dive session",
    owner: "John Smith",
    dueDate: "2026-03-28",
    channel: "Email",
    talkingPoints: "- Express appreciation for recognition\n- Highlight ongoing sustainability initiatives\n- Propose H2 deep-dive meeting on net-zero transition plan",
    messageAngle: "Gratitude and deepening of ESG partnership",
    successCriteria: "Response received with meeting interest confirmed",
    outcome: "Email sent on 2026-03-27. Erik responded positively — deep-dive meeting tentatively scheduled for May.",
  },
  {
    id: "act-007",
    investorId: "inv-002",
    contactId: "con-003",
    signalId: "sig-006",
    type: "information_gap",
    state: "completed",
    objective: "Arrange introductory call with Vanguard's new coverage analyst",
    owner: "Jane Doe",
    dueDate: "2026-03-20",
    channel: "Video Call",
    talkingPoints: "- Company overview and investment highlights\n- IR contact information\n- Upcoming events calendar",
    messageAngle: "Welcome and relationship building",
    successCriteria: "Introductory call completed; new analyst added to distribution list",
    outcome: "Call completed 2026-03-19. New analyst Alex Rivera added to IR distribution. Good initial rapport established.",
  },
  {
    id: "act-008",
    investorId: "inv-001",
    contactId: "con-002",
    signalId: null,
    type: "relationship_maintenance",
    state: "in_progress",
    objective: "Quarterly ESG data package update for BlackRock stewardship team",
    owner: "John Smith",
    dueDate: "2026-03-31",
    channel: "Email",
    talkingPoints: "- Updated carbon emissions data\n- Supply chain audit results\n- Board skills matrix update",
    messageAngle: "Proactive transparency, data-driven engagement",
    successCriteria: "Package delivered and receipt confirmed",
    outcome: null,
  },
];

// ── Timeline events ───────────────────────────────────────
export const timelineEvents = [
  { id: "tl-001", investorId: "inv-001", type: "meeting", date: "2026-03-20", description: "Q1 stewardship meeting with Sarah Chen — discussed climate disclosure roadmap" },
  { id: "tl-002", investorId: "inv-001", type: "email", date: "2026-03-15", description: "Sent updated ESG data package to Michael Torres" },
  { id: "tl-003", investorId: "inv-001", type: "signal", date: "2026-03-20", description: "Signal detected: Updated proxy voting guidelines" },
  { id: "tl-004", investorId: "inv-002", type: "call", date: "2026-03-19", description: "Introductory call with new analyst Alex Rivera" },
  { id: "tl-005", investorId: "inv-002", type: "email", date: "2026-03-15", description: "Sent quarterly earnings preview to James Wright" },
  { id: "tl-006", investorId: "inv-003", type: "meeting", date: "2026-03-28", description: "Lunch meeting with Emily Nakamura — positive sentiment on growth outlook" },
  { id: "tl-007", investorId: "inv-003", type: "signal", date: "2026-03-25", description: "Signal detected: Wellington increasing position" },
  { id: "tl-008", investorId: "inv-004", type: "signal", date: "2026-03-15", description: "Signal detected: Harris Associates reducing position" },
  { id: "tl-009", investorId: "inv-004", type: "filing", date: "2026-03-01", description: "13F filing confirmed 3.2% holding — down from 3.4%" },
  { id: "tl-010", investorId: "inv-005", type: "email", date: "2026-03-30", description: "Received CalPERS annual engagement expectations letter" },
  { id: "tl-011", investorId: "inv-005", type: "meeting", date: "2026-03-05", description: "Governance discussion with Lisa Patel on board diversity" },
  { id: "tl-012", investorId: "inv-006", type: "signal", date: "2026-03-28", description: "Signal detected: No engagement in 110+ days" },
  { id: "tl-013", investorId: "inv-006", type: "meeting", date: "2025-12-10", description: "Last meeting with Anna Kowalski — discussed market conditions" },
  { id: "tl-014", investorId: "inv-007", type: "email", date: "2026-03-27", description: "Sent thank-you note to Erik Hansen re: positive report mention" },
  { id: "tl-015", investorId: "inv-007", type: "signal", date: "2026-03-22", description: "Signal detected: Positive mention in NBIM responsible investment report" },
];

// ── Owners ─────────────────────────────────────────────────
export const owners = ["Jane Doe", "John Smith"];

// ── Channels ───────────────────────────────────────────────
export const channels = ["Email", "Phone", "Video Call", "In-Person", "Letter", "Internal"];

// ── Action states (lifecycle) ──────────────────────────────
export const actionStates = [
  { key: "planned", label: "Planned" },
  { key: "preparing", label: "Preparing" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

// ── Meetings (for Today page) ─────────────────────────────
export const meetings = [
  {
    id: "mtg-001",
    investorId: "inv-004",
    contactId: "con-006",
    date: "2026-04-04",
    time: "10:00",
    channel: "Video Call",
    topic: "Retention discussion — address position reduction concerns",
  },
  {
    id: "mtg-002",
    investorId: "inv-003",
    contactId: "con-004",
    date: "2026-04-04",
    time: "14:30",
    channel: "In-Person",
    topic: "Growth strategy deep-dive and investor pack review",
  },
  {
    id: "mtg-003",
    investorId: "inv-001",
    contactId: "con-001",
    date: "2026-04-05",
    time: "09:00",
    channel: "Video Call",
    topic: "Q2 stewardship check-in and proxy guideline alignment",
  },
  {
    id: "mtg-004",
    investorId: "inv-007",
    contactId: "con-009",
    date: "2026-04-05",
    time: "16:00",
    channel: "Video Call",
    topic: "ESG deep-dive session planning",
  },
];

// ── Top movers (for Shareholder Intelligence) ─────────────
export const topBuyers = [
  { name: "BlackRock Fund Advisors", change: "+0.5%", id: "inv-001" },
  { name: "Wellington Management", change: "+0.6%", id: "inv-003" },
  { name: "Norges Bank IM", change: "+0.1%", id: "inv-007" },
  { name: "CalPERS", change: "+0.1%", id: "inv-005" },
  { name: "Vanguard Group", change: "+0.0%", id: "inv-002" },
];

export const topSellers = [
  { name: "Harris Associates", change: "-0.6%", id: "inv-004" },
  { name: "Artisan Partners", change: "-0.3%", id: "inv-006" },
  { name: "Vanguard Group", change: "-0.3%", id: "inv-002" },
  { name: "Hedge Fund Alpha", change: "-0.2%", id: null },
  { name: "Quant Capital", change: "-0.1%", id: null },
];

// ── Market context (for Today page) ──────────────────────
export const marketContextSummary = "Our stock closed at $142.30 yesterday, up 1.8% — outperforming the sector index by 0.6%. The rally was driven by positive analyst commentary following the AI infrastructure spending report from McKinsey, which projects 40% YoY growth through 2028. Among peers, XYZ Corp announced a $4.2B acquisition in AI infrastructure, which may shift investor perception of competitive positioning. Bond yields held steady at 4.12%, while active equity funds saw $8B in outflows for March — something to watch for our active holders like Wellington and Harris. BlackRock has increased sector-wide positions by 0.3% in Q1, suggesting a macro allocation shift rather than company-specific conviction.";

// ── Helper lookups ─────────────────────────────────────────
export function getInvestor(id) {
  return investors.find((i) => i.id === id);
}

export function getContact(id) {
  for (const inv of investors) {
    const c = inv.contacts.find((c) => c.id === id);
    if (c) return c;
  }
  return null;
}

export function getSignal(id) {
  return signals.find((s) => s.id === id);
}

export function getAction(id) {
  return actions.find((a) => a.id === id);
}

export function getSignalsForInvestor(investorId) {
  return signals.filter((s) => s.investorId === investorId);
}

export function getActionsForInvestor(investorId) {
  return actions.filter((a) => a.investorId === investorId);
}

export function getTimelineForInvestor(investorId) {
  return timelineEvents
    .filter((e) => e.investorId === investorId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getMeetingsForDate(dateStr) {
  return meetings.filter((m) => m.date === dateStr);
}
