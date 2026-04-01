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
  Eye,
  Send,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
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

const trajectoryStyles = {
  STABLE: "bg-slate-100 text-slate-700",
  INCREASING: "bg-emerald-50 text-emerald-700",
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
  meeting: "bg-violet-50 text-violet-700",
  email: "bg-sky-50 text-sky-700",
  call: "bg-teal-50 text-teal-700",
  filing: "bg-amber-50 text-amber-700",
  signal: "bg-slate-100 text-slate-600",
};

const tabConfig = [
  { key: "overview", label: "OVERVIEW", icon: BarChart3 },
  { key: "persona", label: "PERSONA & PEOPLE", icon: Users },
  { key: "engagement", label: "ENGAGEMENT & TIMELINE", icon: Activity },
];

// ── Overview Tab ─────────────────────────────────────────
function OverviewTab({ investor, signals }) {
  const conviction = deriveConviction(investor);
  const sentiment = deriveSentiment(investor);
  const freshness = deriveFreshness(investor);
  const engagement = deriveEngagement(investor);

  const totalInvestors = 7; // mock total
  const positionRank = investor.tier === 1 ? (investor.holdingPct >= 8 ? 1 : investor.holdingPct >= 6 ? 2 : 3) : investor.tier === 2 ? 5 : 7;
  const histChange = investor.holdingHistory.length >= 2
    ? (investor.holdingHistory[investor.holdingHistory.length - 1] - investor.holdingHistory[0]).toFixed(1)
    : "0.0";

  const votingPctParam = getStateParam(investor, "Voting Policy");
  const openSignals = signals.filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  );

  return (
    <div className="space-y-6">
      {/* STRUCTURAL SNAPSHOT */}
      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          STRUCTURAL SNAPSHOT
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
              VOTING %
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-slate-900">
              {investor.holdingPct}%
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
              CAPITAL %
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-slate-900">
              {investor.holdingPct}%
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
              POSITION RANK
            </p>
            <p className="mt-2 font-mono text-2xl font-bold text-slate-900">
              #{positionRank}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
              HIST. CHANGE
            </p>
            <p className={cn(
              "mt-2 font-mono text-2xl font-bold",
              Number(histChange) > 0 ? "text-emerald-600" : Number(histChange) < 0 ? "text-red-600" : "text-slate-900"
            )}>
              {Number(histChange) > 0 ? "+" : ""}{histChange}%
            </p>
          </div>
        </div>
      </div>

      {/* STATE & SENTIMENT */}
      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          STATE & SENTIMENT
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
              CONVICTION
            </p>
            {conviction === "High" ? (
              <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-slate-900 text-white">
                HIGH
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-500">
                {conviction.toUpperCase()}
              </span>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
              SENTIMENT
            </p>
            <span className={cn(
              "text-xs font-medium",
              sentiment === "Positive" ? "text-emerald-600" : sentiment === "Negative" ? "text-red-600" : "text-slate-500"
            )}>
              {sentiment.toUpperCase()}
            </span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
              FRESHNESS
            </p>
            {freshness === "Stale" ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                STALE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                RECENT
              </span>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
              ENGAGEMENT
            </p>
            <span className={cn(
              "text-xs font-medium",
              engagement === "High" ? "text-emerald-600" : engagement === "Low" ? "text-red-500" : "text-slate-500"
            )}>
              {engagement.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* RECENT SIGNALS */}
      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          RECENT SIGNALS
        </h3>
        {openSignals.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-400">No active signals for this investor.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {openSignals.map((sig) => (
              <Link
                key={sig.id}
                to={`/signals/${sig.id}`}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50">
                  <Bell size={12} className="text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{sig.headline}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
                      sig.urgency === "high" ? "bg-red-50 text-red-700" : sig.urgency === "medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {sig.urgency.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400">{sig.detectedAt}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* INTELLIGENCE ENGINE */}
      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          INTELLIGENCE ENGINE
        </h3>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <Zap size={12} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Key State Parameters</p>
              <div className="mt-3 space-y-2">
                {investor.stateParameters.map((param, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{param.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{param.value}</span>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          param.freshness === "fresh" ? "bg-emerald-500" : "bg-amber-500"
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
  const params = investor.stateParameters || [];

  const byProvenance = {
    observed: params.filter((p) => p.provenance === "observed"),
    inferred: params.filter((p) => p.provenance === "inferred"),
    team_assessed: params.filter((p) => p.provenance === "team_assessed"),
  };

  const provenanceLabels = {
    observed: "Observed",
    inferred: "Inferred",
    team_assessed: "Team Assessed",
  };

  return (
    <div className="space-y-6">
      {/* Contacts */}
      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          KEY CONTACTS
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {investor.contacts.map((contact) => {
            const days = daysSince(contact.lastInteraction);
            return (
              <div
                key={contact.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {contact.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{contact.name}</p>
                    <p className="text-xs text-slate-500">{contact.role}</p>
                    <p className="mt-1 text-xs text-slate-400">{contact.email}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      <span
                        className={cn(
                          "text-xs",
                          days !== null && days > 30
                            ? "font-semibold text-red-500"
                            : "text-slate-500"
                        )}
                      >
                        {days !== null
                          ? `${days}d ago`
                          : "No interaction"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* State Parameters by Provenance */}
      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          STATE PARAMETERS
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {["observed", "inferred", "team_assessed"].map((prov) => (
            <div key={prov}>
              <h4 className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                {provenanceLabels[prov]}
              </h4>
              <div className="space-y-2">
                {byProvenance[prov].length === 0 ? (
                  <p className="text-xs text-slate-400">No parameters</p>
                ) : (
                  byProvenance[prov].map((param, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                          {param.label}
                        </span>
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            param.freshness === "fresh"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          )}
                          title={param.freshness}
                        />
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {param.value}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
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

  // Narrative consistency: check for gaps
  const latestContact = investor.contacts.reduce((latest, c) => {
    if (!latest || c.lastInteraction > latest) return c.lastInteraction;
    return latest;
  }, null);
  const daysSinceContact = latestContact ? daysSince(latestContact) : null;
  const signals = getSignalsForInvestor(investorId);
  const openSignalCount = signals.filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  ).length;

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main Timeline */}
      <div className="col-span-2">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          INTERACTION TIMELINE
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
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              {opt === "all" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Calendar} title="No events" description="No timeline events match your filter." />
        ) : (
          <div className="relative ml-4">
            {/* Vertical line */}
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200" />

            <div className="space-y-0">
              {filtered.map((evt) => {
                const Icon = timelineTypeIcons[evt.type] || Bell;
                return (
                  <div key={evt.id} className="relative flex items-start gap-4 pl-2 pb-6">
                    {/* Dot */}
                    <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
                      <Icon size={12} className="text-slate-500" />
                    </div>
                    {/* Content */}
                    <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-700">{evt.date}</span>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                          timelineTypeBadge[evt.type] || "bg-slate-100 text-slate-600"
                        )}>
                          {evt.type.charAt(0).toUpperCase() + evt.type.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{evt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Narrative Consistency Monitor */}
      <div className="col-span-1">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          NARRATIVE CONSISTENCY MONITOR
        </h3>
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
              ENGAGEMENT FREQUENCY
            </p>
            <p className="font-mono text-lg font-bold text-slate-900">
              {events.length} events
            </p>
            <p className="text-xs text-slate-500 mt-1">Last 90 days</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
              DAYS SINCE CONTACT
            </p>
            <p className={cn(
              "font-mono text-lg font-bold",
              daysSinceContact && daysSinceContact > 30 ? "text-red-600" : "text-slate-900"
            )}>
              {daysSinceContact !== null ? `${daysSinceContact}d` : "N/A"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
              OPEN SIGNALS
            </p>
            <p className={cn(
              "font-mono text-lg font-bold",
              openSignalCount > 0 ? "text-amber-600" : "text-slate-900"
            )}>
              {openSignalCount}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
              RELATIONSHIP OWNER
            </p>
            <p className="text-sm font-medium text-slate-700">
              {investor.relationshipOwner}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
              MOMENTUM
            </p>
            <span className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              investor.engagementMomentum === "positive" ? "bg-emerald-50 text-emerald-700" :
              investor.engagementMomentum === "negative" ? "bg-red-50 text-red-700" :
              "bg-slate-100 text-slate-700"
            )}>
              {investor.engagementMomentum.toUpperCase()}
            </span>
          </div>
        </div>
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
      <div className="p-6">
        <EmptyState icon={User} title="Investor not found" description="The investor you are looking for does not exist." />
      </div>
    );
  }

  const signals = getSignalsForInvestor(id);
  const trajectory = deriveTrajectory(investor);
  const freshness = deriveFreshness(investor);
  const openSignals = signals.filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  );

  // Determine recommendation
  const needsReengagement = freshness === "Stale" || investor.engagementMomentum === "negative";
  const hasHighUrgencySignal = openSignals.some((s) => s.urgency === "high");

  return (
    <div className="p-6 space-y-6">
      {/* Back link */}
      <Link
        to="/investors"
        className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
      >
        <span>&larr;</span>
        <span>BACK TO INVESTORS</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{investor.name}</h1>
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full border px-2 py-0 text-xs font-semibold",
                investor.tier === 1
                  ? "border-slate-300 text-slate-700 bg-white"
                  : investor.tier === 2
                  ? "border-slate-300 text-slate-500 bg-white"
                  : "border-slate-200 text-slate-400 bg-white"
              )}
            >
              T{investor.tier}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <span>
              Ownership:{" "}
              <span className="font-mono font-medium text-slate-700">{investor.holdingPct}%</span>
            </span>
            <span className="text-slate-300">&middot;</span>
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
        <div className="flex items-center justify-between rounded-lg bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
              <AlertTriangle size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {hasHighUrgencySignal
                  ? "High-urgency signal detected. Immediate engagement recommended."
                  : "Engagement has gone stale. Re-engage to maintain relationship health."}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {hasHighUrgencySignal
                  ? `${openSignals.filter(s => s.urgency === "high").length} high-urgency signal(s) require attention`
                  : "Last meaningful contact was over 30 days ago"}
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-100">
            <Send size={14} />
            Draft Outreach
          </button>
        </div>
      )}

      {/* Tab navigation */}
      <div className="border-b border-slate-200">
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
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon size={14} />
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-slate-900" />
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
        {activeTab === "persona" && (
          <PersonaTab investor={investor} />
        )}
        {activeTab === "engagement" && (
          <EngagementTab investorId={id} investor={investor} />
        )}
      </div>
    </div>
  );
}
