import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  Clock,
  AlertCircle,
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

function isDueThisWeek(dateStr) {
  const due = new Date(dateStr);
  const today = new Date(TODAY);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  return due >= today && due <= endOfWeek;
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

// -- Stats Row ------------------------------------------------------

function StatsRow() {
  const newSignals = signals.filter(
    (s) => s.state === "new" || s.state === "reviewing"
  ).length;

  const activeActions = actions.filter(
    (a) =>
      a.state === "planned" ||
      a.state === "preparing" ||
      a.state === "in_progress"
  );
  const dueThisWeek = activeActions.filter((a) =>
    isDueThisWeek(a.dueDate)
  ).length;

  const awaitingLogging = actions.filter(
    (a) => a.state === "awaiting_logging"
  ).length;

  const activeInvestors = new Set(
    [...signals.filter((s) => s.state !== "resolved" && s.state !== "dismissed"),
     ...actions.filter((a) => a.state !== "completed")]
      .map((item) => item.investorId)
  ).size;

  const stats = [
    { label: "OPEN SIGNALS", value: newSignals },
    { label: "DUE THIS WEEK", value: dueThisWeek },
    { label: "AWAITING LOGGING", value: awaitingLogging },
    { label: "ACTIVE INVESTORS", value: activeInvestors },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
            {s.label}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-slate-900">
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// -- Signal Card (expandable) ---------------------------------------

function SignalCard({ signal, navigate }) {
  const [expanded, setExpanded] = useState(false);
  const inv = getInvestor(signal.investorId);
  const urg = urgencyConfig[signal.urgency];
  const UrgIcon = urg.icon;

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

        <span className="text-[11px] font-medium tracking-[0.1em] text-slate-400">
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
        <p className="mt-0.5 text-sm text-slate-500">{truncate(signal.description, 120)}</p>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 pl-11 space-y-4">
          {/* WHY IT MATTERS */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-1">
              WHY IT MATTERS
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {signal.description}
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

          {/* RECOMMENDED ACTION box */}
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
              RECOMMENDED ACTION
            </p>
            <p className="text-sm text-white">
              Review this signal and take appropriate action based on urgency and investor relationship.
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
        </div>
      )}
    </div>
  );
}

// -- Signals Intelligence Feed --------------------------------------

function SignalsFeedSection({ navigate }) {
  const triageSignals = signals
    .filter((s) => s.state !== "resolved" && s.state !== "dismissed")
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
    .slice(0, 5);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
          RANKED INTELLIGENCE FEED
        </p>
        <p className="text-[11px] text-slate-400">
          SHOWING {triageSignals.length} PRIORITIZED SIGNALS
        </p>
      </div>

      {triageSignals.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          All signals have been triaged. Nice work.
        </div>
      ) : (
        <div className="space-y-2">
          {triageSignals.map((s) => (
            <SignalCard key={s.id} signal={s} navigate={navigate} />
          ))}
        </div>
      )}
    </section>
  );
}

// -- Upcoming Actions Table -----------------------------------------

function UpcomingActionsSection({ navigate }) {
  const activeStates = ["planned", "preparing", "in_progress", "awaiting_logging"];
  const activeActions = actions
    .filter((a) => activeStates.includes(a.state))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const columns = [
    { key: "state", label: "STATUS" },
    { key: "type", label: "TYPE" },
    { key: "investor", label: "INVESTOR" },
    { key: "objective", label: "OBJECTIVE" },
    { key: "owner", label: "OWNER" },
    { key: "dueDate", label: "DUE DATE" },
    { key: "channel", label: "CHANNEL" },
  ];

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
          UPCOMING ACTIONS
        </p>
        <p className="text-[11px] text-slate-400">
          {activeActions.length} ACTIVE
        </p>
      </div>

      {activeActions.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No upcoming actions. Time to plan ahead.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeActions.map((row) => {
                const inv = getInvestor(row.investorId);
                return (
                  <tr
                    key={row.id}
                    onClick={() => navigate(`/actions/${row.id}`)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", actionStateDot[row.state])} />
                        <span className="text-xs font-medium text-slate-700">
                          {actionStateLabels[row.state]}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-medium tracking-[0.05em] text-slate-500">
                        {typeLabels[row.type] ?? row.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {inv?.name ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {truncate(row.objective, 50)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row.owner}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "font-mono text-xs",
                          isOverdue(row.dueDate) && row.state !== "completed"
                            ? "font-semibold text-red-600"
                            : "text-slate-600"
                        )}
                      >
                        {row.dueDate}
                        {isOverdue(row.dueDate) && row.state !== "completed" && (
                          <AlertCircle size={11} className="ml-1 inline text-red-500" />
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row.channel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// -- Page -----------------------------------------------------------

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">What to do next</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Your daily operating surface. Prioritized signals and actions for {TODAY}.
        </p>
      </div>

      <StatsRow />

      <SignalsFeedSection navigate={navigate} />

      <UpcomingActionsSection navigate={navigate} />
    </div>
  );
}
