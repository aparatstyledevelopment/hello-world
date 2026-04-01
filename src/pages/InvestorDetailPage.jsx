import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Mail,
  Phone,
  Video,
  FileText,
  Bell,
  Calendar,
  User,
  MessageSquare,
  AlertTriangle,
  BarChart3,
  Users,
  Clock,
  Activity,
  Zap,
  Send,
  Eye,
  TrendingUp,
  Shield,
  Hash,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { Sparkline } from "../components/ui/Sparkline";
import { ConfidenceBadge } from "../components/ui/ConfidenceBadge";
import { SentimentMeter } from "../components/ui/SentimentMeter";
import { HealthDots } from "../components/ui/HealthDots";
import { TimelineEntry } from "../components/ui/TimelineEntry";
import { EmptyState } from "../components/ui/EmptyState";
import {
  getInvestor,
  getSignalsForInvestor,
  getActionsForInvestor,
  getTimelineForInvestor,
} from "../data/mock-data";

const TODAY = new Date("2026-04-01");

// ── Helpers ──────────────────────────────────────────────
function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = TODAY - new Date(dateStr);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getStateParam(inv, label) {
  const p = inv.stateParameters?.find(
    (sp) => sp.label.toLowerCase() === label.toLowerCase()
  );
  return p || null;
}

function deriveConviction(inv) {
  if (inv.tier === 1 && inv.holdingPct > 5) return "High";
  if (inv.tier <= 2) return "Medium";
  return "Low";
}

function deriveSentiment(inv) {
  const p = getStateParam(inv, "Sentiment");
  if (!p) return "Neutral";
  const v = p.value.toLowerCase();
  if (v.includes("positive") || v.includes("constructive")) return "Positive";
  if (v.includes("negative") || v.includes("cautious")) return "Negative";
  return "Neutral";
}

function deriveFreshness(inv) {
  let latest = null;
  for (const c of inv.contacts) {
    if (!latest || c.lastInteraction > latest) latest = c.lastInteraction;
  }
  if (!latest) return "Stale";
  const days = Math.floor((TODAY - new Date(latest)) / (1000 * 60 * 60 * 24));
  return days > 30 ? "Stale" : "Recent";
}

function deriveEngagement(inv) {
  if (inv.engagementMomentum === "positive") return "High";
  if (inv.engagementMomentum === "negative") return "Low";
  return "Medium";
}

function deriveTrajectory(inv) {
  if (inv.holdingTrend === "up") return "INCREASING";
  if (inv.holdingTrend === "down") return "DECREASING";
  return "STABLE";
}

function deriveMarStatus(inv) {
  if (inv.holdingPct >= 5) return { label: "Notifiable", color: "amber" };
  if (inv.holdingPct >= 3) return { label: "Monitoring", color: "blue" };
  return { label: "Below threshold", color: "slate" };
}

function deriveIrSentiment(inv) {
  const sentiment = deriveSentiment(inv);
  if (sentiment === "Positive") return { score: 8, status: "Constructive", quality: 85, trust: 78 };
  if (sentiment === "Negative") return { score: 4, status: "Cautious", quality: 45, trust: 40 };
  return { score: 6, status: "Neutral", quality: 65, trust: 60 };
}

const trajectoryStyles = {
  STABLE: "bg-gray-100 text-gray-700",
  INCREASING: "bg-gray-100 text-gray-700",
  DECREASING: "bg-red-50 text-red-700",
};

const timelineTypeIcons = {
  meeting: Video,
  email: Mail,
  call: Phone,
  filing: FileText,
  signal: Bell,
};

const timelineTypeBadge = {
  meeting: "MEETING",
  email: "OUTREACH",
  call: "CALL",
  filing: "FILING",
  signal: "SIGNAL",
};

const tabConfig = [
  { key: "overview", label: "OVERVIEW", icon: BarChart3 },
  { key: "persona", label: "PERSONA & PEOPLE", icon: Users },
  { key: "engagement", label: "ENGAGEMENT & TIMELINE", icon: Activity },
];

// ── Overview Tab ─────────────────────────────────────────
const timelineDotColors = {
  meeting: "bg-black",
  call: "bg-gray-700",
  email: "bg-gray-400",
  signal: "bg-gray-400",
  filing: "bg-gray-600",
};

const timelineBadgeStyles = {
  meeting: "bg-gray-100 text-gray-700",
  call: "bg-gray-100 text-gray-700",
  email: "bg-gray-100 text-gray-600",
  signal: "bg-gray-100 text-gray-700",
  filing: "bg-gray-100 text-gray-700",
};

function OverviewTab({ investor, signals }) {
  const conviction = deriveConviction(investor);
  const sentiment = deriveSentiment(investor);
  const freshness = deriveFreshness(investor);
  const engagement = deriveEngagement(investor);
  const marStatus = deriveMarStatus(investor);
  const irSentiment = deriveIrSentiment(investor);

  const marketValue = (investor.holdingPct * 12.4).toFixed(1); // mock market cap multiplier
  const votingPower = investor.holdingPct;

  const openSignals = signals.filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  );

  const sentimentQuotes = {
    Positive: "Management team demonstrates strong strategic clarity and willingness to engage.",
    Negative: "Some concerns about capital allocation priorities and communication frequency.",
    Neutral: "Standard engagement pattern with no significant deviation from expectations.",
  };

  return (
    <div className="space-y-5">
      {/* STRUCTURAL SNAPSHOT + STATE & SENTIMENT - Two columns */}
      <div className="flex flex-col md:flex-row gap-4">
      <Card variant="section" accentColor="blue" title="Structural Snapshot" className="flex-1 min-w-0">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="TOTAL STAKE"
            value={`${investor.holdingPct}%`}
            annotation={
              investor.holdingTrend === "up"
                ? "+0.1% this quarter"
                : investor.holdingTrend === "down"
                ? "-0.2% this quarter"
                : "Unchanged"
            }
            annotationColor={
              investor.holdingTrend === "up"
                ? "emerald"
                : investor.holdingTrend === "down"
                ? "red"
                : "slate"
            }
          />
          <StatCard
            label="VOTING POWER"
            value={`${votingPower}%`}
            threshold="FI THRESHOLD: 10%"
          />
          <StatCard
            label="MARKET VALUE"
            value={`$${marketValue}B`}
            annotation="Based on current holdings"
            annotationColor="slate"
          />
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
              MAR STATUS
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  marStatus.color === "amber"
                    ? "bg-gray-400"
                    : marStatus.color === "blue"
                    ? "bg-gray-700"
                    : "bg-gray-400"
                )}
              />
              <span className="font-mono text-lg font-bold text-black">
                {marStatus.label}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* STATE & SENTIMENT - right column */}
      <div className="w-full md:w-[420px] flex-shrink-0">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-3">
          STATE & SENTIMENT
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Conviction */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
                CONVICTION
              </p>
              <Badge
                variant={
                  conviction === "High" ? "confirmed" : conviction === "Medium" ? "reviewing" : "new"
                }
                kind="state"
              >
                {conviction.toUpperCase()}
              </Badge>
            </div>
            <Sparkline
              data={investor.holdingHistory}
              width={200}
              height={32}
              color={conviction === "High" ? "#000000" : conviction === "Low" ? "#dc2626" : "#9ca3af"}
            />
          </div>

          {/* Sentiment */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
                SENTIMENT
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em]",
                  sentiment === "Positive"
                    ? "bg-gray-100 text-gray-700"
                    : sentiment === "Negative"
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {sentiment.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {getStateParam(investor, "Sentiment")?.value || "No sentiment data"}
            </p>
          </div>

          {/* Freshness */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
                FRESHNESS
              </p>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em]",
                  freshness === "Stale"
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    freshness === "Stale" ? "bg-red-500" : "bg-black"
                  )}
                />
                {freshness.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {freshness === "Stale"
                ? "Last contact over 30 days ago"
                : "Recent engagement within 30 days"}
            </p>
          </div>

          {/* Engagement */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
                ENGAGEMENT
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em]",
                  engagement === "High"
                    ? "bg-gray-100 text-gray-700"
                    : engagement === "Low"
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                {engagement.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Momentum: {investor.engagementMomentum}
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* IR Sentiment Card (dark) - two columns: score+bars left, quote right */}
      <Card variant="dark" title="IR Sentiment">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-4xl font-bold text-white">
                {irSentiment.score}/10
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em]",
                  irSentiment.score >= 7
                    ? "bg-black/20 text-gray-400"
                    : irSentiment.score >= 5
                    ? "bg-gray-400/20 text-gray-400"
                    : "bg-red-50 text-red-400"
                )}
              >
                {irSentiment.status}
              </span>
            </div>

            {/* Engagement quality bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase tracking-[0.1em] text-gray-400">
                  Engagement Quality
                </span>
                <span className="text-xs font-mono text-gray-300">
                  {irSentiment.quality}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-700">
                <div
                  className="h-2 rounded-full bg-black transition-all"
                  style={{ width: `${irSentiment.quality}%` }}
                />
              </div>
            </div>

            {/* Management trust bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase tracking-[0.1em] text-gray-400">
                  Management Trust
                </span>
                <span className="text-xs font-mono text-gray-300">
                  {irSentiment.trust}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-700">
                <div
                  className="h-2 rounded-full bg-gray-700 transition-all"
                  style={{ width: `${irSentiment.trust}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <p className="text-sm italic text-gray-400 leading-relaxed">
              &ldquo;{sentimentQuotes[sentiment]}&rdquo;
            </p>
          </div>
        </div>
      </Card>

      {/* RECENT SIGNALS */}
      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-3">
          RECENT SIGNALS
        </h3>
        {openSignals.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-400">No active signals for this investor.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {openSignals.map((sig) => (
              <Link
                key={sig.id}
                to={`/signals/${sig.id}`}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <Bell size={12} className="text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800">{sig.headline}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge variant={sig.urgency} kind="urgency" />
                    <span className="text-[11px] text-gray-400">{sig.detectedAt}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ENGAGEMENT TIMELINE */}
      {(() => {
        const timeline = getTimelineForInvestor(investor.id);
        return timeline.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
                ENGAGEMENT TIMELINE
              </h3>
              <Link
                to={`/investors/${investor.id}/timeline`}
                className="text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-800 transition-colors"
              >
                VIEW FULL TIMELINE &rarr;
              </Link>
            </div>
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute left-[5px] top-1.5 bottom-1.5 w-0.5 bg-gray-200" />

              <div className="space-y-2">
                {timeline.map((evt) => (
                  <div key={evt.id} className="relative">
                    {/* Dot */}
                    <div
                      className={cn(
                        "absolute -left-6 top-4 h-3 w-3 rounded-full ring-2 ring-white",
                        timelineDotColors[evt.type] || "bg-gray-400"
                      )}
                    />
                    {/* Content card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            timelineBadgeStyles[evt.type] || "bg-gray-100 text-gray-600"
                          )}
                        >
                          {evt.type}
                        </span>
                        <span className="text-xs text-gray-400">{evt.date}</span>
                      </div>
                      <p className="text-sm text-gray-700">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* INTELLIGENCE ENGINE */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
            INTELLIGENCE ENGINE
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
            <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100">
              <Zap size={12} className="text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Key State Parameters</p>
              <div className="mt-3 space-y-2">
                {investor.stateParameters.map((param, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{param.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{param.value}</span>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          param.freshness === "fresh" ? "bg-black" : "bg-gray-400"
                        )}
                        title={param.freshness}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Persona & People Tab ─────────────────────────────────
function PersonaTab({ investor }) {
  // Categorize contacts by role
  const portfolioManagers = investor.contacts.filter(
    (c) => c.role.toLowerCase().includes("portfolio") || c.role.toLowerCase().includes("manager")
  );
  const specialists = investor.contacts.filter(
    (c) =>
      c.role.toLowerCase().includes("analyst") ||
      c.role.toLowerCase().includes("stewardship") ||
      c.role.toLowerCase().includes("governance") ||
      c.role.toLowerCase().includes("investment") ||
      c.role.toLowerCase().includes("responsible")
  );
  // Catch any that didn't match either category
  const allCategorized = new Set([...portfolioManagers, ...specialists].map((c) => c.id));
  const other = investor.contacts.filter((c) => !allCategorized.has(c.id));

  function ContactCard({ contact }) {
    const days = daysSince(contact.lastInteraction);
    const isRecent = days !== null && days <= 30;
    const initials = contact.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-sm font-bold text-gray-600">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-black">{contact.name}</p>
            <p className="text-xs text-gray-500">{contact.role}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isRecent ? "bg-black" : "bg-gray-400"
                )}
              />
              <span
                className={cn(
                  "text-xs",
                  days !== null && days > 30
                    ? "font-semibold text-red-500"
                    : "text-gray-500"
                )}
              >
                {days !== null ? `${days}d ago` : "No interaction"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* CONTACT MAP */}
      <Card variant="section" accentColor="blue" title="Contact Map">
        <div className="space-y-6">
          {/* Portfolio Managers */}
          {portfolioManagers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
                  Portfolio Managers
                </h4>
                <Badge variant="portfolio_manager" kind="role" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {portfolioManagers.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            </div>
          )}

          {/* Strategic Specialists */}
          {specialists.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
                  Strategic Specialists
                </h4>
                <Badge variant="esg_specialist" kind="role" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {specialists.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            </div>
          )}

          {/* Other contacts */}
          {other.length > 0 && (
            <div>
              <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-3">
                Other Contacts
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {other.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            </div>
          )}

          {/* View all link */}
          <button className="text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-800 transition-colors">
            VIEW ALL CONTACTS &rarr;
          </button>
        </div>
      </Card>

      {/* Investor Persona - consolidated table */}
      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-3">
          INVESTOR PERSONA
        </h3>
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          {/* Provenance summary bar */}
          <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
            {["observed", "inferred", "team_assessed"].map((prov) => {
              const count = investor.stateParameters.filter((p) => p.provenance === prov).length;
              const colors = { observed: "bg-gray-700", inferred: "bg-amber-400", team_assessed: "bg-black" };
              const labels = { observed: "Observed", inferred: "Inferred", team_assessed: "Team Assessed" };
              return (
                <span key={prov} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={cn("h-2 w-2 rounded-full", colors[prov])} />
                  {labels[prov]}
                  <span className="font-mono font-bold text-gray-700">{count}</span>
                </span>
              );
            })}
          </div>

          {/* All parameters in a single table */}
          <div className="divide-y divide-gray-100">
            {investor.stateParameters.map((param, idx) => {
              const provColors = { observed: "bg-gray-700", inferred: "bg-amber-400", team_assessed: "bg-black" };
              const provLabels = { observed: "Observed", inferred: "Inferred", team_assessed: "Team" };
              return (
                <div key={idx} className="flex items-center gap-4 px-4 py-3">
                  <span className={cn("h-2 w-2 rounded-full flex-shrink-0", provColors[param.provenance])} title={param.provenance} />
                  <span className="text-sm text-gray-500 w-40 flex-shrink-0">{param.label}</span>
                  <span className="text-sm font-medium text-black flex-1">{param.value}</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">{provLabels[param.provenance]}</span>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full flex-shrink-0",
                      param.freshness === "fresh" ? "bg-black" : "bg-gray-400"
                    )}
                    title={param.freshness}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Engagement & Timeline Tab ────────────────────────────
function EngagementTab({ investorId, investor }) {
  const [filter, setFilter] = useState("all");
  const events = useMemo(() => getTimelineForInvestor(investorId), [investorId]);
  const filterOptions = ["all", "meeting", "email", "call", "filing", "signal"];

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  const latestContact = investor.contacts.reduce((latest, c) => {
    if (!latest || c.lastInteraction > latest) return c.lastInteraction;
    return latest;
  }, null);
  const daysSinceContact = latestContact ? daysSince(latestContact) : null;
  const signals = getSignalsForInvestor(investorId);
  const openSignalCount = signals.filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  ).length;

  // Derive activism risk level
  const activismRisk =
    investor.holdingTrend === "down" && investor.engagementMomentum === "negative"
      ? "high"
      : investor.holdingTrend === "down" || investor.engagementMomentum === "negative"
      ? "medium"
      : "low";

  // Key meeting themes from timeline
  const meetingThemes = events
    .filter((e) => e.type === "meeting")
    .flatMap((e) => {
      const themes = [];
      const desc = e.description.toLowerCase();
      if (desc.includes("climate") || desc.includes("esg")) themes.push("ESG");
      if (desc.includes("governance") || desc.includes("board") || desc.includes("diversity"))
        themes.push("GOVERNANCE");
      if (desc.includes("growth") || desc.includes("strategy") || desc.includes("outlook"))
        themes.push("GROWTH OUTLOOK");
      if (desc.includes("stewardship") || desc.includes("disclosure"))
        themes.push("STEWARDSHIP");
      if (themes.length === 0) themes.push("GENERAL");
      return themes;
    })
    .filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Main Timeline */}
      <div className="col-span-2">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-3">
          ENGAGEMENT HISTORY
        </h3>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === opt
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              {opt === "all" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events"
            description="No timeline events match your filter."
          />
        ) : (
          <div>
            {filtered.map((evt, idx) => {
              const Icon = timelineTypeIcons[evt.type] || Bell;
              return (
                <TimelineEntry
                  key={evt.id}
                  icon={Icon}
                  title={evt.description}
                  date={evt.date}
                  type={timelineTypeBadge[evt.type] || evt.type.toUpperCase()}
                  isLast={idx === filtered.length - 1}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="col-span-1 space-y-4">
        {/* Narrative Consistency Monitor */}
        <Card title="Narrative Consistency Monitor">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Engagement Frequency</span>
              <span className="font-mono font-bold text-black">{events.length} events</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Days Since Contact</span>
              <span
                className={cn(
                  "font-mono font-bold",
                  daysSinceContact && daysSinceContact > 30
                    ? "text-red-600"
                    : "text-black"
                )}
              >
                {daysSinceContact !== null ? `${daysSinceContact}d` : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Open Signals</span>
              <span
                className={cn(
                  "font-mono font-bold",
                  openSignalCount > 0 ? "text-gray-600" : "text-black"
                )}
              >
                {openSignalCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Relationship Owner</span>
              <span className="font-medium text-gray-700">
                {investor.relationshipOwner}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Momentum</span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                  investor.engagementMomentum === "positive"
                    ? "bg-gray-100 text-gray-700"
                    : investor.engagementMomentum === "negative"
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                {investor.engagementMomentum}
              </span>
            </div>
          </div>
        </Card>

        {/* Sentiment & Risk */}
        <Card title="Sentiment & Risk">
          <div className="space-y-5">
            <SentimentMeter
              value={activismRisk}
              label="Activism Risk"
              description={
                activismRisk === "high"
                  ? "Elevated risk due to declining position and negative momentum"
                  : activismRisk === "medium"
                  ? "Moderate indicators warrant monitoring"
                  : "No significant activism indicators"
              }
            />

            {/* Key Meeting Themes */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-2">
                KEY MEETING THEMES
              </p>
              <div className="flex flex-wrap gap-1.5">
                {meetingThemes.length > 0 ? (
                  meetingThemes.map((theme) => (
                    <span
                      key={theme}
                      className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600"
                    >
                      {theme}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No meetings recorded</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export function InvestorDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const investor = getInvestor(id);

  if (!investor) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          icon={User}
          title="Investor not found"
          description="The investor you are looking for does not exist."
        />
      </div>
    );
  }

  const signals = getSignalsForInvestor(id);
  const trajectory = deriveTrajectory(investor);
  const freshness = deriveFreshness(investor);
  const openSignals = signals.filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  );

  const needsReengagement =
    freshness === "Stale" || investor.engagementMomentum === "negative";
  const hasHighUrgencySignal = openSignals.some((s) => s.urgency === "high");

  // Recommendation text
  const recommendationText = hasHighUrgencySignal
    ? "High-urgency signal detected. Immediate engagement recommended."
    : "Engagement has gone stale. Re-engage to maintain relationship health.";

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Back link */}
      <Link
        to="/investors"
        className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
      >
        <span>&larr;</span>
        <span>BACK TO INVESTORS</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-black">{investor.name}</h1>
            <Badge variant={investor.tier} kind="tier" />
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <span>
              Ownership:{" "}
              <span className="font-mono font-medium text-gray-700">
                {investor.holdingPct}%
              </span>
            </span>
            <span className="text-gray-300">&middot;</span>
            <span>
              Trajectory:{" "}
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  trajectoryStyles[trajectory]
                )}
              >
                {trajectory}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Recommendation banner */}
      {(needsReengagement || hasHighUrgencySignal) && (
        <div className="flex items-center justify-between rounded-lg bg-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-400/20">
              <AlertTriangle size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{recommendationText}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {hasHighUrgencySignal
                  ? `${openSignals.filter((s) => s.urgency === "high").length} high-urgency signal(s) require attention`
                  : "Last meaningful contact was over 30 days ago"}
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-medium text-black shadow-sm transition-colors hover:bg-gray-100">
            <Send size={14} />
            Draft Outreach
          </button>
        </div>
      )}

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative flex items-center gap-2 pb-3 text-xs font-medium transition-colors",
                  activeTab === tab.key
                    ? "text-black"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Icon size={14} />
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-black" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab investor={investor} signals={signals} />
        )}
        {activeTab === "persona" && <PersonaTab investor={investor} />}
        {activeTab === "engagement" && (
          <EngagementTab investorId={id} investor={investor} />
        )}
      </div>
    </div>
  );
}
