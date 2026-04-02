import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Users,
  Inbox,
  CalendarDays,
  Radio,
  TrendingUp,
  Shield,
  FileText,
  Zap,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { ConfidenceBadge } from "../components/ui/ConfidenceBadge";
import { ActionCard } from "../components/ui/ActionCard";
import {
  signals,
  actions,
  investors,
  getInvestor,
} from "../data/mock-data";

const TODAY = "2026-04-01";

// -- Helpers -------------------------------------------------------

const urgencyOrder = { high: 0, medium: 1, low: 2 };

const urgencyChipStyle = {
  high: "bg-red-50 text-red-600 border border-red-200",
  medium: "bg-zinc-100 text-zinc-700 border border-zinc-200",
  low: "bg-zinc-100 text-zinc-700 border border-zinc-200",
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
  if (diffH < 24) return `${diffH}H AGO`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "1D AGO";
  return `${diffD}D AGO`;
}

function isDueWithinDays(dateStr, days) {
  const due = new Date(dateStr);
  const today = new Date(TODAY);
  const limit = new Date(today);
  limit.setDate(today.getDate() + days);
  return due >= today && due <= limit;
}

// -- Page -----------------------------------------------------------

export function HomePage() {
  const navigate = useNavigate();

  // Active signals (not resolved/dismissed)
  const activeSignals = signals
    .filter((s) => s.state !== "resolved" && s.state !== "dismissed")
    .sort((a, b) => {
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency])
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      return new Date(b.detectedAt) - new Date(a.detectedAt);
    });

  const heroSignal = activeSignals[0];
  const remainingSignals = activeSignals.slice(1);

  // Stats
  const newSignalCount = signals.filter(
    (s) => s.state === "new" || s.state === "reviewing" || s.state === "confirmed"
  ).length;

  const activeActions = actions.filter(
    (a) =>
      a.state === "planned" ||
      a.state === "preparing" ||
      a.state === "in_progress" ||
      a.state === "awaiting_logging"
  );

  const dueThisWeek = activeActions.filter((a) =>
    isDueWithinDays(a.dueDate, 7)
  ).length;

  const awaitingLogging = actions.filter(
    (a) => a.state === "awaiting_logging"
  ).length;

  const activeInvestorCount = new Set(
    [
      ...signals.filter((s) => s.state !== "resolved" && s.state !== "dismissed"),
      ...actions.filter((a) => a.state !== "completed"),
    ].map((item) => item.investorId)
  ).size;

  // Recommended actions (most urgent first)
  const recommendedActions = activeActions
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  // Top holders
  const topHolders = [...investors]
    .sort((a, b) => b.holdingPct - a.holdingPct)
    .slice(0, 3);
  const totalOwnership = investors.reduce((sum, inv) => sum + inv.holdingPct, 0);

  // Hero signal investor
  const heroInvestor = heroSignal ? getInvestor(heroSignal.investorId) : null;

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
          What changed overnight
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Situation, insight, and action for {TODAY}.
        </p>
      </div>

      {/* -- HERO SIGNAL ------------------------------------------------ */}
      {heroSignal && (
        <div
          className={cn(
            "rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden cursor-pointer transition-shadow hover:shadow-md hover:border-zinc-300"
          )}
          onClick={() => navigate(`/signals/${heroSignal.id}`)}
        >
          <div className="px-5 py-4">
            {/* Top row: icon + badges + confidence */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", urgencyChipStyle[heroSignal.urgency])}>
                  {heroSignal.urgency === "high" ? "HIGH URGENCY" : heroSignal.urgency === "medium" ? "MEDIUM" : "LOW"}
                </span>
                <Badge variant={heroSignal.type} kind="type" />
              </div>
              <ConfidenceBadge mode="label" level={heroSignal.confidence} />
            </div>

            {/* Headline -- visually 2x bigger */}
            <h2 className="text-xl font-bold text-zinc-900 leading-tight tracking-tight">
              {heroSignal.headline}
            </h2>

            {/* Description */}
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed max-w-2xl">
              {heroSignal.description}
            </p>

            {/* Investor + timestamp */}
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Influenced:</span>
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-600">
                  {heroInvestor?.name?.charAt(0) ?? "?"}
                </div>
                <span className="text-sm font-semibold text-zinc-900">
                  {heroInvestor?.name ?? "Unknown"}
                </span>
              </div>
              <span className="text-xs font-medium text-zinc-400 tracking-wider">
                DETECTED {relativeAge(heroSignal.detectedAt)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* -- KEY METRICS ROW -------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="NEW SIGNALS"
          value={newSignalCount}
          annotation={newSignalCount > 0 ? "ACTION NEEDED" : null}
          annotationColor="red"
        />
        <StatCard
          label="DUE THIS WEEK"
          value={dueThisWeek}
          annotation={dueThisWeek > 2 ? "HEAVY WEEK" : null}
          annotationColor="amber"
        />
        <StatCard
          label="AWAITING LOGGING"
          value={awaitingLogging}
          annotation={awaitingLogging > 0 ? "LOG OUTCOMES" : null}
          annotationColor="amber"
        />
        <StatCard
          label="ACTIVE INVESTORS"
          value={activeInvestorCount}
        />
      </div>

      {/* -- INTELLIGENCE FEED + TOP HOLDER STATUS ----------------------- */}
      <div className="flex flex-col md:flex-row gap-4">
      {remainingSignals.length > 0 && (
        <Card variant="section" accentColor="blue" className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-zinc-900 tracking-tight">Intelligence Feed</h3>
            <span className="inline-flex items-center bg-zinc-100 text-zinc-700 rounded-xl px-3 py-1 text-[11px] font-semibold tracking-wider">
              {remainingSignals.length} ACTIVE SIGNAL{remainingSignals.length !== 1 ? "S" : ""}
            </span>
          </div>

          <div className="space-y-3">
            {remainingSignals.map((signal) => {
              const inv = getInvestor(signal.investorId);
              const TypeIcon = typeIcons[signal.type] || Radio;

              return (
                <button
                  key={signal.id}
                  onClick={() => navigate(`/signals/${signal.id}`)}
                  className="flex w-full items-start gap-4 rounded-2xl border border-zinc-200/60 bg-white shadow-sm px-4 py-3.5 text-left transition-all hover:shadow-md hover:border-zinc-300"
                >
                  {/* Icon circle */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0",
                      signal.urgency === "high"
                        ? "bg-red-50"
                        : signal.urgency === "medium"
                        ? "bg-zinc-100"
                        : "bg-zinc-100"
                    )}
                  >
                    <TypeIcon
                      size={16}
                      className={cn(
                        signal.urgency === "high"
                          ? "text-red-500"
                          : signal.urgency === "medium"
                          ? "text-zinc-600"
                          : "text-zinc-500"
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={signal.type} kind="type" className="text-[9px] px-1.5 py-0.5" />
                      <span className="text-sm font-semibold text-zinc-900 truncate">
                        {signal.headline}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="font-medium text-zinc-600">{inv?.name ?? "Unknown"}</span>
                      <span>{relativeAge(signal.detectedAt)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Dark holder card - right side of feed */}
      <Card variant="dark" title="TOP HOLDER STATUS" className="w-72 flex-shrink-0 hidden md:block">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-mono text-3xl font-bold text-white">
            {totalOwnership.toFixed(1)}%
          </span>
          <span className="text-xs text-zinc-400">tracked</span>
        </div>

        <div className="space-y-2">
          {topHolders.map((holder) => {
            const trend = holder.holdingTrend;
            const trendColor =
              trend === "up"
                ? "text-emerald-500"
                : trend === "down"
                ? "text-red-400"
                : "text-zinc-500";
            const trendArrow =
              trend === "up" ? "\u2191" : trend === "down" ? "\u2193" : "\u2192";

            return (
              <div
                key={holder.id}
                className="flex items-center justify-between rounded-xl bg-zinc-800 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-700 text-[10px] font-bold text-zinc-300">
                    {holder.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{holder.name}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                      {holder.type} &middot; T{holder.tier}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-base font-bold text-white">
                    {holder.holdingPct}%
                  </span>
                  <span className={cn("text-sm font-bold", trendColor)}>
                    {trendArrow}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      </div>

      {/* -- RECOMMENDED ACTIONS ---------------------------------------- */}
      {recommendedActions.length > 0 && (
        <section>
          <div className="mb-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
              RECOMMENDED ACTIONS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedActions.map((action, idx) => {
              const inv = getInvestor(action.investorId);
              return (
                <ActionCard
                  key={action.id}
                  isPrimary={idx === 0}
                  title={inv?.name ?? "Unknown"}
                  description={action.objective}
                  channel={action.channel}
                  timing={`Due ${action.dueDate}`}
                  icon={idx === 0 ? Zap : undefined}
                  onAction={() => navigate(`/actions/${action.id}`)}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* -- OWNERSHIP OVERVIEW ----------------------------------------- */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Tracked</p>
          <p className="mt-1 font-mono text-lg font-bold text-zinc-900">{investors.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Ownership</p>
          <p className="mt-1 font-mono text-lg font-bold text-zinc-900">{totalOwnership.toFixed(1)}%</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Tier 1</p>
          <p className="mt-1 font-mono text-lg font-bold text-zinc-900">{investors.filter(i => i.tier === 1).length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Signals</p>
          <p className="mt-1 font-mono text-lg font-bold text-zinc-600">{newSignalCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Positive</p>
          <p className="mt-1 font-mono text-lg font-bold text-emerald-600">{investors.filter(i => i.engagementMomentum === "positive").length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Negative</p>
          <p className="mt-1 font-mono text-lg font-bold text-red-600">{investors.filter(i => i.engagementMomentum === "negative").length}</p>
        </div>
      </div>
    </div>
  );
}
