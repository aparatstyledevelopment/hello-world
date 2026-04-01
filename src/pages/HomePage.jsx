import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  signals,
  actions,
  investors,
  getInvestor,
} from "../data/mock-data";

const TODAY = "2026-04-01";

// -- Helpers -------------------------------------------------------

const urgencyOrder = { high: 0, medium: 1, low: 2 };

const urgencyConfig = {
  high: { label: "HIGH", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-600", border: "border-red-500", leftBorder: "border-l-red-500" },
  medium: { label: "MEDIUM", icon: Clock, color: "text-amber-600", bg: "bg-amber-500", border: "border-amber-500", leftBorder: "border-l-amber-500" },
  low: { label: "LOW", icon: null, color: "text-slate-500", bg: "bg-slate-400", border: "border-slate-300", leftBorder: "border-l-slate-300" },
};

const typeLabels = {
  retention_risk: "TRADING",
  influence_opportunity: "FUND FLOW",
  governance_management: "GOVERNANCE",
  information_gap: "DISCLOSURES",
  relationship_maintenance: "RELATIONSHIP",
};

const actionStateLabels = {
  planned: "Planned",
  preparing: "Preparing",
  in_progress: "In Progress",
  awaiting_logging: "Awaiting Logging",
  completed: "Completed",
};

const actionStateDot = {
  planned: "bg-blue-500",
  preparing: "bg-amber-500",
  in_progress: "bg-emerald-500",
  awaiting_logging: "bg-purple-500",
  completed: "bg-slate-400",
};

function relativeAge(dateStr) {
  const diff = Math.floor(
    (new Date(TODAY) - new Date(dateStr)) / (1000 * 60 * 60 * 24)
  );
  if (diff <= 0) return "just now";
  if (diff === 1) return "1d ago";
  return `${diff}d ago`;
}

function truncate(str, len = 80) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "\u2026" : str;
}

function isOverdue(dateStr) {
  return dateStr < TODAY;
}

function isDueToday(dateStr) {
  return dateStr === TODAY;
}

function isDueWithinDays(dateStr, days) {
  const due = new Date(dateStr);
  const today = new Date(TODAY);
  const limit = new Date(today);
  limit.setDate(today.getDate() + days);
  return due >= today && due <= limit;
}

// -- Hero Signal Card -----------------------------------------------

function HeroSignalCard({ signal, navigate }) {
  const inv = getInvestor(signal.investorId);
  const urg = urgencyConfig[signal.urgency];
  const isHigh = signal.urgency === "high";

  return (
    <div
      className={cn(
        "rounded-xl border bg-white overflow-hidden shadow-sm",
        "border-l-[5px]",
        urg.leftBorder,
        isHigh ? "border-red-200" : "border-slate-200"
      )}
    >
      {/* Urgency banner for high urgency */}
      {isHigh && (
        <div className="bg-red-600 px-8 py-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-white" />
          <span className="text-xs font-bold tracking-widest text-white">
            HIGH URGENCY SIGNAL &mdash; REQUIRES IMMEDIATE ATTENTION
          </span>
        </div>
      )}

      <div className="px-8 py-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            {/* Type label */}
            <span className="text-[11px] font-medium tracking-[0.12em] text-slate-400">
              {typeLabels[signal.type]} &middot; {relativeAge(signal.detectedAt)}
            </span>

            {/* Headline - 2-3x more prominent */}
            <h2 className="mt-3 text-2xl font-bold text-slate-900 leading-tight tracking-tight">
              {signal.headline}
            </h2>

            {/* Summary */}
            <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-2xl">
              {signal.description}
            </p>

            {/* Investor - prominent */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-base font-semibold text-slate-900">
                {inv?.name ?? "Unknown"}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-600 border border-slate-200">
                TIER {inv?.tier ?? 3}
              </span>
              {inv?.holdingPct && (
                <span className="text-sm text-slate-400">
                  {inv.holdingPct}% holding
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-8">
          <button
            onClick={() => navigate(`/signals/${signal.id}`)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 shadow-sm"
          >
            Review now <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Stats Row with visual urgency ---------------------------------

function StatsRow() {
  const triageSignals = signals.filter(
    (s) => s.state === "new" || s.state === "reviewing" || s.state === "confirmed"
  );
  const newSignals = triageSignals.length;

  const activeActions = actions.filter(
    (a) =>
      a.state === "planned" ||
      a.state === "preparing" ||
      a.state === "in_progress" ||
      a.state === "awaiting_logging"
  );

  const overdueActions = activeActions.filter(
    (a) => isOverdue(a.dueDate) && a.state !== "completed"
  ).length;

  const dueThisWeek = activeActions.filter((a) =>
    isDueWithinDays(a.dueDate, 7)
  ).length;

  const activeInvestors = new Set(
    [...signals.filter((s) => s.state !== "resolved" && s.state !== "dismissed"),
     ...actions.filter((a) => a.state !== "completed")]
      .map((item) => item.investorId)
  ).size;

  const stats = [
    {
      label: "NEW SIGNALS",
      value: newSignals,
      color: newSignals > 0 ? "text-red-600" : "text-slate-900",
      dot: newSignals > 0 ? "bg-red-500" : null,
      ringColor: newSignals > 0 ? "ring-red-100 border-red-200" : "border-slate-200",
    },
    {
      label: "OVERDUE ACTIONS",
      value: overdueActions,
      color: overdueActions > 0 ? "text-red-600" : "text-slate-900",
      dot: overdueActions > 0 ? "bg-red-500" : null,
      ringColor: overdueActions > 0 ? "ring-red-100 border-red-200" : "border-slate-200",
    },
    {
      label: "DUE THIS WEEK",
      value: dueThisWeek,
      color: dueThisWeek > 2 ? "text-amber-600" : "text-slate-900",
      dot: null,
      ringColor: dueThisWeek > 2 ? "ring-amber-100 border-amber-200" : "border-slate-200",
    },
    {
      label: "ACTIVE INVESTORS",
      value: activeInvestors,
      color: "text-slate-900",
      dot: null,
      ringColor: "border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={cn(
            "rounded-xl border bg-white px-6 py-5",
            s.ringColor,
            s.dot ? "ring-2" : ""
          )}
        >
          <div className="flex items-center gap-2">
            {s.dot && (
              <span className={cn("h-2 w-2 rounded-full animate-pulse", s.dot)} />
            )}
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
              {s.label}
            </p>
          </div>
          <p className={cn("mt-2 font-mono text-4xl font-bold tracking-tight", s.color)}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// -- Signal Triage Card (compact, urgency differentiated) ----------

function TriageSignalCard({ signal, navigate }) {
  const inv = getInvestor(signal.investorId);
  const urg = urgencyConfig[signal.urgency];
  const UrgIcon = urg.icon;
  const isHigh = signal.urgency === "high";
  const isMedium = signal.urgency === "medium";

  return (
    <button
      onClick={() => navigate(`/signals/${signal.id}`)}
      className={cn(
        "block w-full rounded-lg border bg-white text-left transition-all hover:shadow-sm",
        "border-l-[4px]",
        urg.leftBorder,
        isHigh
          ? "border-red-200 py-5 px-6"
          : isMedium
          ? "border-amber-100 py-3.5 px-5"
          : "border-slate-200 py-3 px-4"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-semibold tracking-wide",
                isHigh
                  ? "bg-red-50 border border-red-200 text-red-600 text-[11px]"
                  : isMedium
                  ? "bg-amber-50 border border-amber-200 text-amber-600 text-[10px]"
                  : "bg-slate-50 border border-slate-200 text-slate-400 text-[10px]"
              )}
            >
              {UrgIcon && <UrgIcon size={isHigh ? 11 : 10} />}
              {urg.label}
            </span>
            <span className="text-[11px] font-medium tracking-[0.1em] text-slate-400">
              {typeLabels[signal.type]}
            </span>
            <span className="text-[11px] text-slate-300">
              {relativeAge(signal.detectedAt)}
            </span>
          </div>

          <p className={cn(
            "text-slate-900",
            isHigh ? "text-base font-bold" : isMedium ? "text-sm font-semibold" : "text-sm font-medium text-slate-700"
          )}>
            {signal.headline}
          </p>

          <p className={cn(
            "mt-1",
            isHigh ? "text-sm text-slate-600" : "text-xs text-slate-400"
          )}>
            {truncate(signal.description, isHigh ? 120 : 90)}
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2 pt-1">
          <span className={cn(
            "font-medium",
            isHigh ? "text-sm text-slate-800" : "text-xs text-slate-500"
          )}>
            {inv?.name ?? "Unknown"}
          </span>
          <ChevronRight size={14} className="text-slate-300" />
        </div>
      </div>
    </button>
  );
}

// -- Signals Triage Section ----------------------------------------

function SignalsTriageSection({ heroSignalId, navigate }) {
  const triageSignals = signals
    .filter(
      (s) =>
        s.state !== "resolved" &&
        s.state !== "dismissed" &&
        s.id !== heroSignalId
    )
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  if (triageSignals.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          SIGNALS REQUIRING TRIAGE
        </p>
        <p className="text-[11px] text-slate-400">
          {triageSignals.length} REMAINING
        </p>
      </div>

      <div className="space-y-2">
        {triageSignals.map((s) => (
          <TriageSignalCard key={s.id} signal={s} navigate={navigate} />
        ))}
      </div>
    </section>
  );
}

// -- Actions Due Soon Section --------------------------------------

function ActionsDueSoonSection({ navigate }) {
  const activeStates = ["planned", "preparing", "in_progress", "awaiting_logging"];
  const sevenDaysOut = new Date(TODAY);
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);
  const sevenDaysStr = sevenDaysOut.toISOString().split("T")[0];

  const relevantActions = actions
    .filter(
      (a) =>
        activeStates.includes(a.state) &&
        (isOverdue(a.dueDate) || a.dueDate <= sevenDaysStr)
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const overdueActions = relevantActions.filter((a) => isOverdue(a.dueDate));
  const todayActions = relevantActions.filter((a) => isDueToday(a.dueDate));
  const futureActions = relevantActions.filter(
    (a) => !isOverdue(a.dueDate) && !isDueToday(a.dueDate)
  );

  if (relevantActions.length === 0) return null;

  function ActionRow({ action, treatment }) {
    const inv = getInvestor(action.investorId);
    const isOverdueRow = treatment === "overdue";
    const isTodayRow = treatment === "today";

    return (
      <button
        onClick={() => navigate(`/actions/${action.id}`)}
        className={cn(
          "flex w-full items-center gap-4 rounded-lg border px-5 py-3.5 text-left transition-all hover:shadow-sm",
          isOverdueRow
            ? "bg-red-50 border-red-200 hover:bg-red-100/80"
            : isTodayRow
            ? "bg-amber-50/70 border-amber-200 hover:bg-amber-100/70"
            : "bg-white border-slate-200 hover:bg-slate-50"
        )}
      >
        <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", actionStateDot[action.state])} />

        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            isOverdueRow ? "text-red-900" : "text-slate-900"
          )}>
            {truncate(action.objective, 70)}
          </p>
          <p className={cn(
            "text-xs mt-0.5",
            isOverdueRow ? "text-red-600/70" : "text-slate-500"
          )}>
            {inv?.name ?? "Unknown"} &middot; {action.owner} &middot; {action.channel}
          </p>
        </div>

        <div className="flex-shrink-0 text-right">
          <p className={cn(
            "font-mono text-xs font-bold",
            isOverdueRow ? "text-red-600" : isTodayRow ? "text-amber-700" : "text-slate-500"
          )}>
            {action.dueDate}
          </p>
          {isOverdueRow && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 mt-0.5">
              <AlertCircle size={10} /> OVERDUE
            </span>
          )}
          {isTodayRow && (
            <span className="text-[10px] font-bold text-amber-700 mt-0.5">DUE TODAY</span>
          )}
        </div>
      </button>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          ACTIONS DUE SOON
        </p>
        <p className="text-[11px] text-slate-400">
          NEXT 7 DAYS
        </p>
      </div>

      <div className="space-y-2">
        {overdueActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 pl-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Overdue
            </p>
            {overdueActions.map((a) => (
              <ActionRow key={a.id} action={a} treatment="overdue" />
            ))}
          </div>
        )}

        {todayActions.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 pl-1">
              Due Today
            </p>
            {todayActions.map((a) => (
              <ActionRow key={a.id} action={a} treatment="today" />
            ))}
          </div>
        )}

        {futureActions.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">
              This Week
            </p>
            {futureActions.map((a) => (
              <ActionRow key={a.id} action={a} treatment="future" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// -- Page -----------------------------------------------------------

export function HomePage() {
  const navigate = useNavigate();

  // Find highest-urgency untriaged signal for hero card
  const heroSignal = signals
    .filter((s) => s.state !== "resolved" && s.state !== "dismissed")
    .sort((a, b) => {
      // Sort by urgency first, then by recency
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return new Date(b.detectedAt) - new Date(a.detectedAt);
    })[0];

  return (
    <div className="space-y-10 p-6 max-w-5xl">
      {/* Header - situation framing */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          What changed overnight
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Situation, insight, and action for {TODAY}.
        </p>
      </div>

      {/* HERO: Most important signal - 2-3x more prominent */}
      {heroSignal && (
        <HeroSignalCard signal={heroSignal} navigate={navigate} />
      )}

      {/* Key metrics - numbers that matter are LARGE */}
      <StatsRow />

      {/* Remaining signals - urgency differentiated */}
      <SignalsTriageSection heroSignalId={heroSignal?.id} navigate={navigate} />

      {/* Actions due soon - grouped by urgency */}
      <ActionsDueSoonSection navigate={navigate} />
    </div>
  );
}
