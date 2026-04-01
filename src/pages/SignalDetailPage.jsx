import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Clock,
  TrendingUp,
  Shield,
  FileText,
  Users,
  Radio,
  CheckCircle2,
  Eye,
  XCircle,
  ListChecks,
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  signals,
  getSignal,
  getInvestor,
  getSignalsForInvestor,
  getActionsForInvestor,
  getTimelineForInvestor,
  actions,
} from "../data/mock-data";

const TODAY = "2026-04-01";

// -- Helpers -------------------------------------------------------

const urgencyConfig = {
  high: { label: "HIGH URGENCY", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", bannerBg: "bg-red-600" },
  medium: { label: "MEDIUM URGENCY", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", bannerBg: "bg-amber-500" },
  low: { label: "LOW URGENCY", icon: null, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", bannerBg: "bg-slate-400" },
};

const typeLabels = {
  retention_risk: "TRADING",
  influence_opportunity: "FUND FLOW",
  governance_management: "GOVERNANCE",
  information_gap: "DISCLOSURES",
  relationship_maintenance: "RELATIONSHIP",
};

const typeIcons = {
  retention_risk: TrendingUp,
  influence_opportunity: TrendingUp,
  governance_management: Shield,
  information_gap: FileText,
  relationship_maintenance: Users,
};

const stateLabels = {
  new: "New",
  reviewing: "Reviewing",
  confirmed: "Confirmed",
  action_created: "Action Created",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const stateTransitions = {
  new: [
    { target: "reviewing", label: "Start Review", icon: Eye },
    { target: "dismissed", label: "Dismiss", icon: XCircle },
  ],
  reviewing: [
    { target: "confirmed", label: "Confirm", icon: CheckCircle2 },
    { target: "dismissed", label: "Dismiss", icon: XCircle },
  ],
  confirmed: [
    { target: "action_created", label: "Create Action", icon: ListChecks },
    { target: "resolved", label: "Resolve", icon: CheckCircle2 },
  ],
  action_created: [
    { target: "resolved", label: "Resolve", icon: CheckCircle2 },
  ],
  resolved: [],
  dismissed: [
    { target: "new", label: "Reopen", icon: Radio },
  ],
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function relativeAge(dateStr) {
  const diff = Math.floor(
    (new Date(TODAY) - new Date(dateStr)) / (1000 * 60 * 60 * 24)
  );
  if (diff <= 0) return "just now";
  if (diff === 1) return "1d ago";
  return `${diff}d ago`;
}

// -- Signal strength bars ------------------------------------------

function SignalStrength({ level }) {
  const bars = level === "high" ? 3 : level === "medium" ? 2 : 1;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "h-3 w-1 rounded-sm",
            i <= bars ? "bg-slate-700" : "bg-slate-200"
          )}
        />
      ))}
    </div>
  );
}

// -- Tier pill ------------------------------------------------------

function TierPill({ tier }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600 border border-slate-200">
      TIER {tier}
    </span>
  );
}

// -- Pressure Distribution sidebar ----------------------------------

function PressureDistribution() {
  const activeSignals = signals.filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  );
  const categories = Object.entries(typeLabels);
  const total = activeSignals.length || 1;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-4">
        SIGNAL PRESSURE DISTRIBUTION
      </p>
      <div className="space-y-3">
        {categories.map(([key, label]) => {
          const count = activeSignals.filter((s) => s.type === key).length;
          const pct = Math.round((count / total) * 100);
          const colors = {
            retention_risk: "bg-red-500",
            influence_opportunity: "bg-emerald-500",
            governance_management: "bg-blue-500",
            information_gap: "bg-amber-500",
            relationship_maintenance: "bg-violet-500",
          };
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-600">{label}</span>
                <span className="font-mono text-[11px] text-slate-400">{count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100">
                <div
                  className={cn("h-1.5 rounded-full transition-all", colors[key])}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Urgency breakdown */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          URGENCY BREAKDOWN
        </p>
        <div className="space-y-2">
          {["high", "medium", "low"].map((urg) => {
            const count = activeSignals.filter((s) => s.urgency === urg).length;
            const colors = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-slate-400" };
            return (
              <div key={urg} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", colors[urg])} />
                  <span className="text-[11px] font-medium text-slate-600 uppercase">{urg}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// -- Related Signals sidebar ----------------------------------------

function RelatedSignals({ signal, navigate }) {
  const related = getSignalsForInvestor(signal.investorId).filter(
    (s) => s.id !== signal.id
  );
  if (related.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
        RELATED SIGNALS
      </p>
      <div className="space-y-2">
        {related.map((s) => {
          const urg = urgencyConfig[s.urgency];
          return (
            <button
              key={s.id}
              onClick={() => navigate(`/signals/${s.id}`)}
              className="block w-full rounded-lg border border-slate-100 p-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide",
                    urg.bg, urg.border, urg.color, "border"
                  )}
                >
                  {urg.label.split(" ")[0]}
                </span>
                <span className="text-[10px] text-slate-400">{typeLabels[s.type]}</span>
              </div>
              <p className="text-xs text-slate-700 line-clamp-2">{s.headline}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// -- Investor card sidebar ------------------------------------------

function InvestorCard({ investor }) {
  if (!investor) return null;

  const trendColor = {
    up: "text-emerald-600",
    down: "text-red-600",
    neutral: "text-slate-500",
  };
  const trendLabel = {
    up: "INCREASING",
    down: "DECREASING",
    neutral: "STABLE",
  };
  const trendPillBg = {
    up: "bg-emerald-50 border-emerald-200 text-emerald-700",
    down: "bg-red-50 border-red-200 text-red-700",
    neutral: "bg-slate-50 border-slate-200 text-slate-600",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
        INVESTOR PROFILE
      </p>
      <p className="text-sm font-semibold text-slate-900">{investor.name}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {investor.type}
        </span>
        <TierPill tier={investor.tier} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">HOLDING</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-slate-900">{investor.holdingPct}%</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">TRAJECTORY</p>
          <p className="mt-1">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                trendPillBg[investor.holdingTrend]
              )}
            >
              {trendLabel[investor.holdingTrend]}
            </span>
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">MOMENTUM</p>
          <p className="mt-0.5 text-sm capitalize text-slate-700">{investor.engagementMomentum}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">OWNER</p>
          <p className="mt-0.5 text-sm text-slate-700">{investor.relationshipOwner}</p>
        </div>
      </div>

      {investor.contacts && investor.contacts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">KEY CONTACTS</p>
          <div className="space-y-1.5">
            {investor.contacts.map((c) => (
              <div key={c.id} className="text-xs text-slate-600">
                <span className="font-medium text-slate-800">{c.name}</span>
                {c.role && <span className="text-slate-400"> / {c.role}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -- Page -----------------------------------------------------------

export function SignalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const signal = getSignal(id);
  const [rawDataOpen, setRawDataOpen] = useState(false);

  if (!signal) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <Radio size={24} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-700">Signal not found</p>
          <p className="mt-1 text-sm text-slate-500">
            No signal with ID &ldquo;{id}&rdquo; exists.
          </p>
          <button
            onClick={() => navigate("/signals")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
          >
            Back to signals
          </button>
        </div>
      </div>
    );
  }

  const investor = getInvestor(signal.investorId);
  const urg = urgencyConfig[signal.urgency];
  const UrgIcon = urg.icon;
  const TypeIcon = typeIcons[signal.type] || Radio;
  const transitions = stateTransitions[signal.state] ?? [];
  const signalActions = actions.filter((a) => a.signalId === signal.id);
  const contact = investor?.contacts?.[0];
  const isHigh = signal.urgency === "high";

  // Contextual content
  const whyItMatters = signal.description;

  const personaContext = investor
    ? `${investor.name} is a ${investor.type} investor (Tier ${investor.tier}) currently holding ${investor.holdingPct}% of outstanding shares. Their engagement momentum is ${investor.engagementMomentum}. The relationship is managed by ${investor.relationshipOwner}${contact ? `, with ${contact.name} (${contact.role}) as the primary contact` : ""}.`
    : "No investor context available.";

  const likelyImpact =
    signal.urgency === "high"
      ? "High potential impact on shareholder base composition and investor relations strategy. Immediate attention recommended to prevent further deterioration of the relationship or position."
      : signal.urgency === "medium"
      ? "Moderate impact expected. Proactive engagement recommended to maintain relationship quality and capitalize on opportunities before the window closes."
      : "Low immediate impact. Monitor the situation and address within the standard engagement cadence. No urgent action required.";

  const recommendedAction =
    signalActions.length > 0
      ? signalActions[0].objective
      : signal.type === "retention_risk"
      ? "Schedule direct engagement with the investor to understand their concerns and present the updated investment thesis. Prepare tailored materials addressing likely objections."
      : signal.type === "governance_management"
      ? "Review policy changes and prepare a compliance gap analysis. Proactively communicate alignment efforts to demonstrate responsiveness."
      : signal.type === "influence_opportunity"
      ? "Prepare tailored materials highlighting strategic alignment and schedule a deepening engagement to build conviction."
      : signal.type === "information_gap"
      ? "Update internal records and establish contact with newly assigned personnel. Ensure continuity of relationship quality."
      : "Maintain engagement cadence and leverage positive developments in upcoming communications. Consider amplifying through investor materials.";

  const recommendedChannel = signalActions.length > 0 ? signalActions[0].channel : "Email";
  const recommendedTimeline = signalActions.length > 0 ? `By ${signalActions[0].dueDate}` : "Within 5 business days";

  return (
    <div className="p-6">
      {/* Back + state bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600">
            {stateLabels[signal.state]?.toUpperCase()}
          </span>
          {transitions.map((t) => (
            <button
              key={t.target}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                t.target === "dismissed"
                  ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  : "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
              )}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* HEADER: Signal title LARGE with urgency banner */}
      <div className={cn(
        "rounded-xl border overflow-hidden mb-8",
        isHigh ? "border-red-200" : "border-slate-200"
      )}>
        {/* Urgency banner */}
        <div className={cn(
          "px-6 py-3 flex items-center gap-2",
          urg.bannerBg
        )}>
          {UrgIcon && <UrgIcon size={14} className="text-white" />}
          <span className="text-xs font-bold tracking-widest text-white">
            {urg.label}
          </span>
          <span className="text-xs text-white/60 ml-2">
            {typeLabels[signal.type]} &middot; {relativeAge(signal.detectedAt)}
          </span>
          <div className="flex-1" />
          <SignalStrength level={signal.confidence} />
        </div>

        <div className="bg-white px-8 py-7">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">
            {signal.headline}
          </h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-slate-400">
            <span>Detected {formatDate(signal.detectedAt)} via {signal.source}</span>
            <span>&middot;</span>
            <TierPill tier={investor?.tier ?? 3} />
            <span className="font-medium text-slate-700">
              {investor?.name ?? "Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-6">
        {/* Main content - narrative flow: facts -> meaning -> action */}
        <div className="min-w-0 flex-1 space-y-6">

          {/* 1. WHAT HAPPENED (facts - slightly muted foundation) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-4">
              WHAT HAPPENED
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {signal.description}
            </p>
            {signal.parameters && signal.parameters.length > 0 && (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {signal.parameters.map((p, i) => (
                  <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">{p.label}</p>
                    <p className="font-mono text-sm font-semibold text-slate-800">{p.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. WHY IT MATTERS (interpretation - more prominent) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-4">
              WHY IT MATTERS
            </p>
            <p className="text-lg font-medium text-slate-800 leading-relaxed">
              {whyItMatters}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Confidence</span>
              <SignalStrength level={signal.confidence} />
              <span className="text-xs font-medium text-slate-500 capitalize">{signal.confidence}</span>
            </div>
          </div>

          {/* 3. PERSONA CONTEXT */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">
              PERSONA CONTEXT
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {personaContext}
            </p>
          </div>

          {/* 4. LIKELY IMPACT (builds urgency toward action) */}
          <div className={cn(
            "rounded-xl border p-6",
            isHigh ? "border-red-200 bg-red-50/30" : "border-slate-200 bg-white"
          )}>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">
              LIKELY IMPACT
            </p>
            <p className={cn(
              "text-base leading-relaxed",
              isHigh ? "text-red-900 font-medium" : "text-slate-700"
            )}>
              {likelyImpact}
            </p>
          </div>

          {/* 5. RECOMMENDED ACTION - THE CLIMAX - most visually prominent */}
          <div className="rounded-xl bg-slate-900 overflow-hidden shadow-lg">
            <div className="px-8 pt-8 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-4">
                RECOMMENDED ACTION
              </p>
              <p className="text-xl font-bold text-white leading-relaxed">
                {recommendedAction}
              </p>
            </div>

            <div className="px-8 py-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">CHANNEL</p>
                  <p className="text-sm font-medium text-slate-200">{recommendedChannel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">TIMELINE</p>
                  <p className="text-sm font-medium text-slate-200">{recommendedTimeline}</p>
                </div>
                {contact && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">CONTACT</p>
                    <p className="text-sm font-medium text-slate-200">{contact.name}</p>
                  </div>
                )}
                {signalActions.length > 0 && signalActions[0].messageAngle && (
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">MESSAGE ANGLE</p>
                    <p className="text-sm font-medium text-slate-200">{signalActions[0].messageAngle}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 pb-8 flex items-center gap-4">
              <button
                onClick={() => navigate(`/actions/new?signal=${signal.id}`)}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100 shadow-sm"
              >
                Execute <ArrowRight size={14} />
              </button>
              {signalActions.length > 0 && (
                <span className="text-xs text-slate-500">
                  {signalActions.length} action{signalActions.length !== 1 && "s"} already linked
                </span>
              )}
            </div>
          </div>

          {/* 6. RAW DATA - de-emphasized supporting evidence */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
            <button
              onClick={() => setRawDataOpen(!rawDataOpen)}
              className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-300 hover:text-slate-500 transition-colors w-full text-left"
            >
              {rawDataOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              RAW DATA / SOURCE TRAIL
            </button>
            {rawDataOpen && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
                <pre className="font-mono text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
{JSON.stringify(
  {
    id: signal.id,
    type: signal.type,
    urgency: signal.urgency,
    confidence: signal.confidence,
    source: signal.source,
    detectedAt: signal.detectedAt,
    state: signal.state,
    investorId: signal.investorId,
    parameters: signal.parameters,
    headline: signal.headline,
    description: signal.description,
  },
  null,
  2
)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="hidden w-72 flex-shrink-0 lg:block">
          <div className="sticky top-6 space-y-4">
            <InvestorCard investor={investor} />
            <PressureDistribution />
            <RelatedSignals signal={signal} navigate={navigate} />
          </div>
        </aside>
      </div>
    </div>
  );
}
