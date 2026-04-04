import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Zap,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Shield,
  FileText,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { ConfidenceBadge } from "../components/ui/ConfidenceBadge";
import { EmptyState } from "../components/ui/EmptyState";
import {
  signals,
  actions,
  getInvestor,
  getContact,
} from "../data/mock-data";

const TODAY = "2026-04-04";

const urgencyOrder = { high: 0, medium: 1, low: 2 };

function relativeAge(dateStr) {
  const diffMs = new Date(TODAY) - new Date(dateStr);
  const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffD === 0) return "Today";
  if (diffD === 1) return "1d ago";
  return `${diffD}d ago`;
}

function daysUntil(dateStr) {
  const diffMs = new Date(dateStr) - new Date(TODAY);
  const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffD < 0) return `${Math.abs(diffD)}d overdue`;
  if (diffD === 0) return "Due today";
  if (diffD === 1) return "Due tomorrow";
  return `Due in ${diffD}d`;
}

const stateLabels = {
  new: "New",
  reviewing: "Reviewing",
  confirmed: "Confirmed",
  action_created: "Action Created",
  resolved: "Resolved",
  dismissed: "Dismissed",
  planned: "Planned",
  preparing: "Preparing",
  in_progress: "In Progress",
  completed: "Completed",
};

export function SignalsActionsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("signals");

  // Signals data
  const sortedSignals = useMemo(() => {
    return [...signals].sort((a, b) => {
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency])
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      return new Date(b.detectedAt) - new Date(a.detectedAt);
    });
  }, []);

  const activeSignalCount = signals.filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  ).length;

  // Actions data
  const sortedActions = useMemo(() => {
    return [...actions].sort((a, b) => {
      const aOrder = a.state === "completed" ? 1 : 0;
      const bOrder = b.state === "completed" ? 1 : 0;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, []);

  const activeActionCount = actions.filter((a) => a.state !== "completed").length;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
          Signals & Actions
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Intelligence signals and engagement actions across your investor base
        </p>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2">
          <Zap size={14} className="text-zinc-500" />
          <span className="text-xs font-medium text-zinc-500">Active Signals</span>
          <span className="font-mono text-sm font-bold text-zinc-900">{activeSignalCount}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2">
          <CheckSquare size={14} className="text-zinc-500" />
          <span className="text-xs font-medium text-zinc-500">Open Actions</span>
          <span className="font-mono text-sm font-bold text-zinc-900">{activeActionCount}</span>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 w-fit">
        <button
          onClick={() => setTab("signals")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors",
            tab === "signals"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          <Zap size={13} />
          Signals
          <span className="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600">
            {signals.length}
          </span>
        </button>
        <button
          onClick={() => setTab("actions")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors",
            tab === "actions"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          <CheckSquare size={13} />
          Actions
          <span className="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600">
            {actions.length}
          </span>
        </button>
      </div>

      {/* ── Signals Tab ──────────────────────────────────── */}
      {tab === "signals" && (
        <div className="space-y-2">
          {sortedSignals.length === 0 ? (
            <EmptyState icon={Zap} title="No signals" description="No intelligence signals detected." />
          ) : (
            sortedSignals.map((sig) => {
              const inv = getInvestor(sig.investorId);
              const isResolved = sig.state === "resolved" || sig.state === "dismissed";

              return (
                <button
                  key={sig.id}
                  onClick={() => navigate(`/signals/${sig.id}`)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border bg-white px-4 py-3.5 text-left transition-all hover:shadow-md hover:border-zinc-300",
                    isResolved ? "border-zinc-100 opacity-60" : "border-zinc-200/60 shadow-sm"
                  )}
                >
                  {/* Urgency dot */}
                  <div className={cn(
                    "h-2.5 w-2.5 rounded-full flex-shrink-0",
                    sig.urgency === "high" ? "bg-red-500" :
                    sig.urgency === "medium" ? "bg-zinc-400" : "bg-zinc-300"
                  )} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant={sig.type} kind="type" />
                      <span className="text-sm font-semibold text-zinc-900 truncate">
                        {sig.headline}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="font-medium text-zinc-600">{inv?.name ?? "Unknown"}</span>
                      <span>{sig.source}</span>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <ConfidenceBadge mode="label" level={sig.confidence} />
                    <div className="text-right">
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                        {relativeAge(sig.detectedAt)}
                      </p>
                      <p className="text-[10px] text-zinc-300 mt-0.5">
                        {stateLabels[sig.state] ?? sig.state}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* ── Actions Tab ──────────────────────────────────── */}
      {tab === "actions" && (
        <div className="space-y-2">
          {sortedActions.length === 0 ? (
            <EmptyState icon={CheckSquare} title="No actions" description="No engagement actions." />
          ) : (
            sortedActions.map((act) => {
              const inv = getInvestor(act.investorId);
              const contact = getContact(act.contactId);
              const isComplete = act.state === "completed";
              const isOverdue = !isComplete && new Date(act.dueDate) < new Date(TODAY);

              return (
                <button
                  key={act.id}
                  onClick={() => navigate(`/actions/${act.id}`)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border bg-white px-4 py-3.5 text-left transition-all hover:shadow-md hover:border-zinc-300",
                    isComplete ? "border-zinc-100 opacity-60" :
                    isOverdue ? "border-red-200 shadow-sm" : "border-zinc-200/60 shadow-sm"
                  )}
                >
                  {/* State indicator */}
                  <div className={cn(
                    "h-2.5 w-2.5 rounded-full flex-shrink-0",
                    isComplete ? "bg-emerald-400" :
                    act.state === "in_progress" ? "bg-zinc-900" :
                    act.state === "preparing" ? "bg-zinc-500" : "bg-zinc-300"
                  )} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant={act.type} kind="type" />
                      <span className="text-sm font-semibold text-zinc-900 truncate">
                        {act.objective}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="font-medium text-zinc-600">{inv?.name ?? "Unknown"}</span>
                      {contact && <span>{contact.name}</span>}
                      <span>{act.channel}</span>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      isComplete ? "bg-emerald-50 text-emerald-700" :
                      act.state === "in_progress" ? "bg-zinc-900 text-white" :
                      "bg-zinc-100 text-zinc-600"
                    )}>
                      {stateLabels[act.state] ?? act.state}
                    </span>
                    <div className="text-right min-w-[70px]">
                      <p className={cn(
                        "text-[10px] font-medium uppercase tracking-wider",
                        isOverdue ? "text-red-500" : "text-zinc-400"
                      )}>
                        {isComplete ? "Done" : daysUntil(act.dueDate)}
                      </p>
                      <p className="text-[10px] text-zinc-300 mt-0.5">{act.owner}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
