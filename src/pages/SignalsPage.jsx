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
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { ConfidenceBadge } from "../components/ui/ConfidenceBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { signals, getInvestor } from "../data/mock-data";

const TODAY = "2026-04-01";

// -- Helpers -------------------------------------------------------

const urgencyOrder = { high: 0, medium: 1, low: 2 };

const urgencyChipStyle = {
  high: "bg-red-50 text-red-700 border border-red-200",
  medium: "bg-gray-100 text-gray-600 border border-gray-200",
  low: "bg-gray-50 text-gray-400 border border-gray-100",
};

const typeLabels = {
  retention_risk: "RETENTION RISK",
  influence_opportunity: "INFLUENCE",
  governance_management: "GOVERNANCE",
  information_gap: "INFO GAP",
  relationship_maintenance: "RELATIONSHIP",
};

const typeIcons = {
  retention_risk: TrendingUp,
  influence_opportunity: TrendingUp,
  governance_management: Shield,
  information_gap: FileText,
  relationship_maintenance: Users,
};

function relativeAge(dateStr) {
  const diffMs = new Date(TODAY) - new Date(dateStr);
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "1d ago";
  return `${diffD}d ago`;
}

function truncate(str, len = 140) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "\u2026" : str;
}

// -- Filter Pill ---------------------------------------------------

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide transition-colors",
        active
          ? "border-black bg-black text-white"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
      )}
    >
      {label}
    </button>
  );
}

// -- Signal Pressure Summary Bar -----------------------------------

function SignalPressureSummary({ filteredSignals }) {
  const highCount = filteredSignals.filter((s) => s.urgency === "high").length;
  const mediumCount = filteredSignals.filter((s) => s.urgency === "medium").length;
  const lowCount = filteredSignals.filter((s) => s.urgency === "low").length;
  const total = filteredSignals.length || 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 mb-6">
      <div className="flex items-center gap-4 mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
          SIGNAL PRESSURE
        </p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            <span className={cn("font-mono font-bold", highCount > 0 ? "text-red-600" : "text-gray-400")}>
              {highCount}
            </span>
            <span className="text-gray-400">High</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-gray-600" />
            <span className="font-mono font-bold text-gray-600">{mediumCount}</span>
            <span className="text-gray-400">Medium</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="font-mono font-bold text-gray-600">{lowCount}</span>
            <span className="text-gray-400">Low</span>
          </span>
        </div>
        <span className="text-[11px] font-mono font-semibold text-gray-400 ml-auto">
          {filteredSignals.length} TOTAL
        </span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-100">
        {highCount > 0 && (
          <div
            className="bg-red-600 transition-all"
            style={{ width: `${(highCount / total) * 100}%` }}
          />
        )}
        {mediumCount > 0 && (
          <div
            className="bg-gray-600 transition-all"
            style={{ width: `${(mediumCount / total) * 100}%` }}
          />
        )}
        {lowCount > 0 && (
          <div
            className="bg-gray-400 transition-all"
            style={{ width: `${(lowCount / total) * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}

// -- Expandable Signal Card ----------------------------------------

function SignalCard({ signal, navigate }) {
  const [expanded, setExpanded] = useState(false);
  const inv = getInvestor(signal.investorId);
  const TypeIcon = typeIcons[signal.type] || Radio;
  const isHigh = signal.urgency === "high";

  const whyItMatters = signal.description;

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
    <div
      className="rounded-lg border border-gray-200 transition-all overflow-hidden bg-white hover:border-gray-300"
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-start gap-4 text-left transition-colors",
          "px-5 py-4 hover:bg-gray-50/60"
        )}
      >
        {/* Icon circle */}
        <div
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 mt-0.5",
            isHigh ? "bg-red-100" : "bg-gray-100"
          )}
        >
          {isHigh ? (
            <AlertTriangle size={16} className="text-red-600" />
          ) : (
            <TypeIcon
              size={16}
              className="text-gray-600"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: badges + time + confidence */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide", urgencyChipStyle[signal.urgency])}>
              {signal.urgency === "high" ? "HIGH URGENCY" : signal.urgency === "medium" ? "MEDIUM" : "LOW"}
            </span>
            <Badge variant={signal.type} kind="type" className="text-[9px] px-1.5 py-0.5" />
            <span className="text-[11px] text-gray-400">{relativeAge(signal.detectedAt)}</span>
            <div className="flex-1" />
            <ConfidenceBadge mode="percentage" level={signal.confidence} className="text-[10px] px-2 py-0.5" />
            <span className="text-gray-300">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </div>

          {/* Headline */}
          <h3 className={cn(
            "text-black leading-snug",
            isHigh ? "text-base font-bold" : "text-sm font-semibold"
          )}>
            {signal.headline}
          </h3>

          {/* Description preview */}
          <p className={cn(
            "mt-1 leading-relaxed",
            isHigh ? "text-sm text-gray-600" : "text-xs text-gray-500"
          )}>
            {truncate(signal.description, isHigh ? 180 : 120)}
          </p>

          {/* Investor + timestamp */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-[8px] font-bold text-gray-600">
                {inv?.name?.charAt(0) ?? "?"}
              </div>
              <span className="text-xs font-medium text-gray-700">{inv?.name ?? "Unknown"}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className={cn(
          "border-t px-6 py-5 space-y-5",
          isHigh ? "border-red-100 bg-white" : "border-gray-100 bg-white"
        )}>
          {/* Why this matters */}
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
            <p className="text-sm font-semibold italic text-gray-700 mb-2">Why this matters</p>
            <p className="text-sm text-gray-600 leading-relaxed">{whyItMatters}</p>
          </div>

          {/* Recommended action */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2">
              RECOMMENDED ACTION
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{recommendedAction}</p>
          </div>

          {/* Evidence pills */}
          {signal.parameters && signal.parameters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {signal.parameters.map((p, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs"
                >
                  <span className="text-gray-400">{p.label}</span>
                  <span className="font-mono font-medium text-gray-700">{p.value}</span>
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/signals/${signal.id}`);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-gray-800"
          >
            View Full Signal <ArrowRight size={12} />
          </button>
        </div>
      )}
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
    { value: "retention_risk", label: "RETENTION RISK" },
    { value: "influence_opportunity", label: "INFLUENCE" },
    { value: "governance_management", label: "GOVERNANCE" },
    { value: "information_gap", label: "INFO GAP" },
    { value: "relationship_maintenance", label: "RELATIONSHIP" },
  ];

  // Priority filter options
  const priorityOptions = [
    { value: "all", label: "ALL" },
    { value: "urgent", label: "URGENT" },
    { value: "tier1", label: "TIER 1" },
  ];

  const activeSignals = signals.filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  );

  const filtered = activeSignals
    .filter((s) => {
      if (categoryFilter !== "all" && s.type !== categoryFilter) return false;
      if (priorityFilter === "urgent" && s.urgency !== "high") return false;
      if (priorityFilter === "tier1") {
        const inv = getInvestor(s.investorId);
        if (inv?.tier !== 1) return false;
      }
      return true;
    })
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return (
    <div className="p-4 md:p-6 ">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black tracking-tight">Signals</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Real-time intelligence desk. Ranked interpretation over raw data.
          </p>
        </div>
        <span className="inline-flex items-center bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wider">
          {activeSignals.length} ACTIVE SIGNAL{activeSignals.length !== 1 ? "S" : ""}
        </span>
      </div>

      {/* Category filter pills */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {categoryOptions.map((opt) => (
          <FilterPill
            key={opt.value}
            label={opt.label}
            active={categoryFilter === opt.value}
            onClick={() => setCategoryFilter(opt.value)}
          />
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {priorityOptions.map((opt) => (
          <FilterPill
            key={opt.value}
            label={opt.label}
            active={priorityFilter === opt.value}
            onClick={() => setPriorityFilter(opt.value)}
          />
        ))}
      </div>

      {/* Pressure summary bar */}
      <SignalPressureSummary filteredSignals={filtered} />

      {/* Signal feed */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
          RANKED INTELLIGENCE FEED
        </p>
        <p className="text-[11px] text-gray-400">
          SHOWING {filtered.length} PRIORITIZED SIGNAL{filtered.length !== 1 ? "S" : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Radio}
            title="No signals match"
            description="Try adjusting your filters to see more signals."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <SignalCard key={s.id} signal={s} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}
