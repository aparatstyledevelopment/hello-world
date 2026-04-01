import { useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarClock,
  ClipboardCheck,
  Users,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/ui/StatCard";
import { Table } from "../components/ui/Table";
import { ConfidenceBadge } from "../components/ui/ConfidenceBadge";
import {
  signals,
  actions,
  investors,
  getInvestor,
} from "../data/mock-data";

const TODAY = "2026-04-01";

// ── Helpers ──────────────────────────────────────────────────

const urgencyOrder = { high: 0, medium: 1, low: 2 };

const urgencyDotColor = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

const urgencyBorderColor = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-emerald-500",
};

const stateLabels = {
  new: "New",
  reviewing: "Reviewing",
  confirmed: "Confirmed",
  action_created: "Action Created",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const actionStateLabels = {
  planned: "Planned",
  preparing: "Preparing",
  in_progress: "In Progress",
  awaiting_logging: "Awaiting Logging",
  completed: "Completed",
};

const actionStateDotColor = {
  planned: "bg-blue-500",
  preparing: "bg-amber-500",
  in_progress: "bg-emerald-500",
  awaiting_logging: "bg-purple-500",
  completed: "bg-slate-400",
};

const actionStateBadgeVariant = {
  planned: "new",
  preparing: "reviewing",
  in_progress: "confirmed",
  awaiting_logging: "action_created",
  completed: "resolved",
};

const typeLabels = {
  retention_risk: "Retention Risk",
  influence_opportunity: "Influence",
  governance_management: "Governance",
  information_gap: "Info Gap",
  relationship_maintenance: "Relationship",
};

function relativeAge(dateStr) {
  const diff = Math.floor(
    (new Date(TODAY) - new Date(dateStr)) / (1000 * 60 * 60 * 24)
  );
  if (diff <= 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff}d ago`;
}

function truncate(str, len = 50) {
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

// ── Stats ────────────────────────────────────────────────────

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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        value={newSignals}
        label="New signals"
        trend={newSignals > 2 ? "up" : "neutral"}
      />
      <StatCard
        value={dueThisWeek}
        label="Due this week"
        trend={dueThisWeek > 3 ? "up" : "neutral"}
      />
      <StatCard
        value={awaitingLogging}
        label="Awaiting logging"
        trend={awaitingLogging > 0 ? "up" : "neutral"}
      />
      <StatCard
        value={activeInvestors}
        label="Active investors"
        trend="neutral"
      />
    </div>
  );
}

// ── Signals Triage Table ─────────────────────────────────────

function SignalsTriageSection({ navigate }) {
  const triageSignals = signals
    .filter((s) => s.state === "new" || s.state === "reviewing")
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  const columns = [
    { key: "urgency", label: "Urgency" },
    { key: "type", label: "Type" },
    { key: "investor", label: "Investor" },
    { key: "contact", label: "Contact" },
    { key: "title", label: "Title" },
    { key: "confidence", label: "Confidence" },
    { key: "age", label: "Age" },
    { key: "state", label: "State" },
    { key: "action", label: "", className: "text-right" },
  ];

  const renderCell = (row, col) => {
    const inv = getInvestor(row.investorId);
    const contact = inv?.contacts?.[0];

    switch (col.key) {
      case "urgency":
        return (
          <span className="inline-flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                urgencyDotColor[row.urgency]
              )}
            />
            <Badge variant={row.urgency}>
              {row.urgency.charAt(0).toUpperCase() + row.urgency.slice(1)}
            </Badge>
          </span>
        );
      case "type":
        return <Badge variant={row.type}>{typeLabels[row.type]}</Badge>;
      case "investor":
        return (
          <span className="font-medium text-slate-900">
            {inv?.name ?? "Unknown"}
          </span>
        );
      case "contact":
        return (
          <span className="text-slate-500">{contact?.name ?? "-"}</span>
        );
      case "title":
        return (
          <span className="text-slate-700" title={row.headline}>
            {truncate(row.headline, 45)}
          </span>
        );
      case "confidence":
        return <ConfidenceBadge level={row.confidence} showLabel />;
      case "age":
        return (
          <span className="text-xs text-slate-500">
            {relativeAge(row.detectedAt)}
          </span>
        );
      case "state":
        return <Badge variant={row.state}>{stateLabels[row.state]}</Badge>;
      case "action":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800">
            Review <ArrowRight size={12} />
          </span>
        );
      default:
        return row[col.key];
    }
  };

  const tableData = triageSignals.map((s) => ({
    ...s,
    _borderClass: urgencyBorderColor[s.urgency],
  }));

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Activity size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-900">
          Signals requiring triage
        </h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {triageSignals.length}
        </span>
      </div>

      {triageSignals.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          All signals have been triaged. Nice work.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400",
                      col.className
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tableData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => navigate(`/signals/${row.id}`)}
                  className={cn(
                    "cursor-pointer border-l-4 transition-colors hover:bg-slate-50",
                    urgencyBorderColor[row.urgency]
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-slate-700",
                        col.className
                      )}
                    >
                      {renderCell(row, col)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ── Upcoming Actions Table ───────────────────────────────────

function UpcomingActionsSection({ navigate }) {
  const activeStates = ["planned", "preparing", "in_progress"];
  const activeActions = actions
    .filter((a) => activeStates.includes(a.state))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const awaitingActions = actions.filter(
    (a) => a.state === "awaiting_logging"
  );

  const columns = [
    { key: "state", label: "State" },
    { key: "type", label: "Type" },
    { key: "investor", label: "Investor" },
    { key: "contact", label: "Contact" },
    { key: "objective", label: "Objective" },
    { key: "owner", label: "Owner" },
    { key: "dueDate", label: "Due Date" },
    { key: "channel", label: "Channel" },
  ];

  const renderCell = (row, col) => {
    const inv = getInvestor(row.investorId);

    switch (col.key) {
      case "state":
        return (
          <span className="inline-flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                actionStateDotColor[row.state]
              )}
            />
            <Badge variant={actionStateBadgeVariant[row.state]}>
              {actionStateLabels[row.state]}
            </Badge>
          </span>
        );
      case "type":
        return <Badge variant={row.type}>{typeLabels[row.type]}</Badge>;
      case "investor":
        return (
          <span className="font-medium text-slate-900">
            {inv?.name ?? "Unknown"}
          </span>
        );
      case "contact":
        return (
          <span className="text-slate-500">
            {row.contactId
              ? (() => {
                  const contact = inv?.contacts?.find(
                    (c) => c.id === row.contactId
                  );
                  return contact?.name ?? "-";
                })()
              : "-"}
          </span>
        );
      case "objective":
        return (
          <span className="text-slate-600" title={row.objective}>
            {truncate(row.objective, 45)}
          </span>
        );
      case "owner":
        return <span className="text-slate-600">{row.owner}</span>;
      case "dueDate":
        return (
          <span
            className={cn(
              "text-sm",
              isOverdue(row.dueDate) && row.state !== "completed"
                ? "font-semibold text-red-600"
                : "text-slate-600"
            )}
          >
            {row.dueDate}
            {isOverdue(row.dueDate) && row.state !== "completed" && (
              <AlertCircle size={12} className="ml-1 inline text-red-500" />
            )}
          </span>
        );
      case "channel":
        return <span className="text-slate-500">{row.channel}</span>;
      default:
        return row[col.key];
    }
  };

  return (
    <section className="space-y-6">
      {/* Active actions */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <CalendarClock size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">
            Upcoming actions
          </h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {activeActions.length}
          </span>
        </div>

        {activeActions.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No upcoming actions. Time to plan ahead.
          </div>
        ) : (
          <Table
            columns={columns}
            data={activeActions}
            onRowClick={(row) => navigate(`/actions/${row.id}`)}
            renderCell={renderCell}
          />
        )}
      </div>

      {/* Awaiting outcome logging */}
      {awaitingActions.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">
              Awaiting outcome logging
            </h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {awaitingActions.length}
            </span>
          </div>

          <Table
            columns={columns}
            data={awaitingActions}
            onRowClick={(row) => navigate(`/actions/${row.id}`)}
            renderCell={renderCell}
          />
        </div>
      )}
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">What to do next</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Your daily operating surface &mdash; {TODAY}
        </p>
      </div>

      <StatsRow />

      <SignalsTriageSection navigate={navigate} />

      <UpcomingActionsSection navigate={navigate} />
    </div>
  );
}
