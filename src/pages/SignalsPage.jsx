import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  Clock,
  TrendingUp,
  Shield,
  FileText,
  Users,
  Radio,
} from "lucide-react";
import { cn } from "../lib/utils";
import { signals, investors, getInvestor } from "../data/mock-data";

const TODAY = "2026-04-01";

// -- Helpers -------------------------------------------------------

const urgencyOrder = { high: 0, medium: 1, low: 2 };

const urgencyConfig = {
  high: { label: "HIGH", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  medium: { label: "MEDIUM", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  low: { label: "LOW", icon: null, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
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

function relativeAge(dateStr) {
  const diff = Math.floor(
    (new Date(TODAY) - new Date(dateStr)) / (1000 * 60 * 60 * 24)
  );
  if (diff <= 0) return "just now";
  if (diff === 1) return "1d ago";
  return `${diff}d ago`;
}

function truncate(str, len = 120) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "\u2026" : str;
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

// -- Filter Pill ----------------------------------------------------

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide transition-colors",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
      )}
    >
      {label}
    </button>
  );
}

// -- Signal Card (expandable) ---------------------------------------

function SignalCard({ signal, navigate }) {
  const [expanded, setExpanded] = useState(false);
  const [rawDataOpen, setRawDataOpen] = useState(false);
  const inv = getInvestor(signal.investorId);
  const urg = urgencyConfig[signal.urgency];
  const UrgIcon = urg.icon;
  const TypeIcon = typeIcons[signal.type] || Radio;

  // Build contextual data
  const whyItMatters = signal.description;
  const personaContext = inv
    ? `${inv.name} is a ${inv.type} investor (Tier ${inv.tier}) with a ${inv.holdingPct}% holding. Engagement momentum is ${inv.engagementMomentum}. Relationship owner: ${inv.relationshipOwner}.`
    : "No investor context available.";

  const likelyImpact =
    signal.urgency === "high"
      ? "High potential impact on shareholder base composition and investor relations strategy."
      : signal.urgency === "medium"
      ? "Moderate impact expected. Proactive engagement recommended to maintain relationship quality."
      : "Low immediate impact. Monitor and address within standard engagement cadence.";

  const recommendedAction =
    signal.type === "retention_risk"
      ? "Schedule direct engagement with the investor to understand their concerns and present the updated investment thesis."
      : signal.type === "governance_management"
      ? "Review policy changes and prepare a compliance gap analysis. Proactively communicate alignment efforts."
      : signal.type === "influence_opportunity"
      ? "Prepare tailored materials highlighting strategic alignment and schedule an introductory deepening call."
      : signal.type === "information_gap"
      ? "Update internal records and establish contact with newly assigned personnel."
      : "Maintain engagement cadence and leverage positive developments in upcoming communications.";

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex-shrink-0 text-slate-400">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
            urg.bg, urg.border, urg.color, "border"
          )}
        >
          {UrgIcon && <UrgIcon size={10} />}
          {urg.label}
        </span>

        <span className="inline-flex items-center gap-1 text-[11px] font-medium tracking-[0.1em] text-slate-400">
          <TypeIcon size={11} />
          {typeLabels[signal.type]}
        </span>

        <span className="text-[11px] text-slate-400">
          {relativeAge(signal.detectedAt)}
        </span>

        <div className="flex-1" />

        <SignalStrength level={signal.confidence} />
        <TierPill tier={inv?.tier ?? 3} />
        <span className="text-sm font-medium text-slate-700">
          {inv?.name ?? "Unknown"}
        </span>
      </button>

      {/* Title + description */}
      <div className="px-4 pb-3 pl-11">
        <p className="text-sm font-semibold text-slate-900">{signal.headline}</p>
        <p className="mt-0.5 text-sm text-slate-500">{truncate(signal.description)}</p>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 pl-11 space-y-5">
          {/* WHY IT MATTERS */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-1.5">
              WHY IT MATTERS
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {whyItMatters}
            </p>
          </div>

          {/* PERSONA CONTEXT */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-1.5">
              PERSONA CONTEXT
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {personaContext}
            </p>
          </div>

          {/* LIKELY IMPACT */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-1.5">
              LIKELY IMPACT
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {likelyImpact}
            </p>
          </div>

          {/* Parameters */}
          {signal.parameters && signal.parameters.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {signal.parameters.map((p, i) => (
                <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
                  <span className="text-[11px] text-slate-400">{p.label}</span>
                  <span className="ml-2 font-mono text-xs font-medium text-slate-700">{p.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* RECOMMENDED ACTION (dark box) */}
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
              RECOMMENDED ACTION
            </p>
            <p className="text-sm text-white leading-relaxed">
              {recommendedAction}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/signals/${signal.id}`);
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Execute <ArrowRight size={12} />
            </button>
          </div>

          {/* RAW DATA collapsible */}
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRawDataOpen(!rawDataOpen);
              }}
              className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 hover:text-slate-600 transition-colors"
            >
              {rawDataOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              RAW DATA / SOURCE TRAIL
            </button>
            {rawDataOpen && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <pre className="font-mono text-xs text-slate-600 whitespace-pre-wrap">
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
  },
  null,
  2
)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// -- Pressure Distribution sidebar ----------------------------------

function PressureDistribution({ filteredSignals }) {
  const categories = Object.entries(typeLabels);
  const total = filteredSignals.length || 1;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-4">
        SIGNAL PRESSURE DISTRIBUTION
      </p>
      <div className="space-y-3">
        {categories.map(([key, label]) => {
          const count = filteredSignals.filter((s) => s.type === key).length;
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
            const count = filteredSignals.filter((s) => s.urgency === urg).length;
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

// -- Page -----------------------------------------------------------

export function SignalsPage() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Category filter options
  const categoryOptions = [
    { value: "all", label: "ALL" },
    { value: "retention_risk", label: "TRADING" },
    { value: "information_gap", label: "DISCLOSURES" },
    { value: "influence_opportunity", label: "FUND FLOW" },
    { value: "governance_management", label: "GOVERNANCE" },
    { value: "relationship_maintenance", label: "RELATIONSHIP" },
  ];

  // Priority filter options
  const priorityOptions = [
    { value: "all", label: "ALL SIGNALS" },
    { value: "urgent", label: "ONLY URGENT" },
    { value: "tier1", label: "ONLY TIER 1" },
  ];

  const filtered = signals
    .filter((s) => {
      // Category filter
      if (categoryFilter !== "all" && s.type !== categoryFilter) return false;
      // Priority filter
      if (priorityFilter === "urgent" && s.urgency !== "high") return false;
      if (priorityFilter === "tier1") {
        const inv = getInvestor(s.investorId);
        if (inv?.tier !== 1) return false;
      }
      return true;
    })
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Signals</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Real-time intelligence desk. Ranked interpretation over raw data.
        </p>
      </div>

      {/* Filter row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Category pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categoryOptions.map((opt) => (
            <FilterPill
              key={opt.value}
              label={opt.label}
              active={categoryFilter === opt.value}
              onClick={() => setCategoryFilter(opt.value)}
            />
          ))}
        </div>

        {/* Priority pills */}
        <div className="flex items-center gap-2">
          {priorityOptions.map((opt) => (
            <FilterPill
              key={opt.value}
              label={opt.label}
              active={priorityFilter === opt.value}
              onClick={() => setPriorityFilter(opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Main layout: feed + sidebar */}
      <div className="flex gap-6">
        {/* Feed */}
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
              RANKED INTELLIGENCE FEED
            </p>
            <p className="text-[11px] text-slate-400">
              SHOWING {filtered.length} PRIORITIZED SIGNALS
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
              <Radio size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-700">No signals match</p>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your filters to see more signals.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((s) => (
                <SignalCard key={s.id} signal={s} navigate={navigate} />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="hidden w-72 flex-shrink-0 lg:block">
          <div className="sticky top-6">
            <PressureDistribution filteredSignals={filtered} />
          </div>
        </aside>
      </div>
    </div>
  );
}
