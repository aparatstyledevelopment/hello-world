import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  List,
  LayoutGrid,
  Filter,
  Plus,
  Link as LinkIcon,
  AlertCircle,
  Search,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/ui/Table";
import { EmptyState } from "../components/ui/EmptyState";
import {
  actions,
  investors,
  owners,
  actionStates,
  getInvestor,
  getContact,
} from "../data/mock-data";

const TODAY = "2026-04-01";

const stateLabels = {
  planned: "Planned",
  preparing: "Preparing",
  in_progress: "In Progress",
  awaiting_logging: "Awaiting Logging",
  completed: "Completed",
};

const stateBadgeVariants = {
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

function truncate(str, len = 50) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

function isOverdue(dateStr) {
  return dateStr < TODAY;
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ── Filter Bar ────────────────────────────────────────────
function FilterBar({ filters, setFilters }) {
  const investorOptions = investors.map((i) => ({ value: i.id, label: i.name }));
  const typeOptions = [
    { value: "retention_risk", label: "Retention Risk" },
    { value: "influence_opportunity", label: "Influence" },
    { value: "governance_management", label: "Governance" },
    { value: "information_gap", label: "Info Gap" },
    { value: "relationship_maintenance", label: "Relationship" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Filter size={14} className="text-slate-400" />

      <select
        value={filters.state}
        onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        <option value="">All States</option>
        {actionStates.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={filters.type}
        onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        <option value="">All Types</option>
        {typeOptions.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        value={filters.investor}
        onChange={(e) => setFilters((f) => ({ ...f, investor: e.target.value }))}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        <option value="">All Investors</option>
        {investorOptions.map((i) => (
          <option key={i.value} value={i.value}>
            {i.label}
          </option>
        ))}
      </select>

      <select
        value={filters.owner}
        onChange={(e) => setFilters((f) => ({ ...f, owner: e.target.value }))}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        <option value="">All Owners</option>
        {owners.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── List View ─────────────────────────────────────────────
function ListView({ filteredActions, navigate }) {
  const columns = [
    { key: "state", label: "State" },
    { key: "type", label: "Type" },
    { key: "investor", label: "Investor" },
    { key: "contact", label: "Contact" },
    { key: "objective", label: "Objective" },
    { key: "owner", label: "Owner" },
    { key: "dueDate", label: "Due Date" },
    { key: "channel", label: "Channel" },
    { key: "signal", label: "Signal", className: "text-center" },
  ];

  const renderCell = (row, col) => {
    switch (col.key) {
      case "state":
        return (
          <Badge variant={stateBadgeVariants[row.state]}>
            {stateLabels[row.state]}
          </Badge>
        );
      case "type":
        return <Badge variant={row.type}>{typeLabels[row.type]}</Badge>;
      case "investor": {
        const inv = getInvestor(row.investorId);
        return <span className="font-semibold text-slate-900">{inv?.name ?? "Unknown"}</span>;
      }
      case "contact": {
        const con = getContact(row.contactId);
        return <span className="text-slate-500 text-xs">{con?.name ?? "-"}</span>;
      }
      case "objective":
        return (
          <span className="text-sm text-slate-600" title={row.objective}>
            {truncate(row.objective)}
          </span>
        );
      case "owner":
        return <span className="text-xs text-slate-600">{row.owner}</span>;
      case "dueDate":
        return (
          <span
            className={cn(
              "font-mono text-xs",
              isOverdue(row.dueDate) && row.state !== "completed"
                ? "font-semibold text-red-600"
                : "text-slate-600"
            )}
          >
            {row.dueDate}
          </span>
        );
      case "channel":
        return <span className="text-xs text-slate-500">{row.channel}</span>;
      case "signal":
        return row.signalId ? (
          <LinkIcon size={14} className="mx-auto text-slate-500" />
        ) : (
          <span className="text-slate-300">-</span>
        );
      default:
        return row[col.key];
    }
  };

  if (filteredActions.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No actions found"
        description="Try adjusting your filters or create a new action."
      />
    );
  }

  return (
    <Table
      columns={columns}
      data={filteredActions}
      onRowClick={(row) => navigate(`/actions/${row.id}`)}
      renderCell={renderCell}
    />
  );
}

// ── Board View (Kanban) ───────────────────────────────────
function BoardView({ filteredActions, navigate }) {
  const stateColumns = actionStates.map((s) => ({
    ...s,
    items: filteredActions.filter((a) => a.state === s.key),
  }));

  return (
    <div className="grid grid-cols-5 gap-3">
      {stateColumns.map((col) => (
        <div key={col.key} className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-3">
          {/* Column header */}
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
              {col.label}
            </h3>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[11px] font-semibold text-slate-600">
              {col.items.length}
            </span>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-2">
            {col.items.map((action) => {
              const inv = getInvestor(action.investorId);
              return (
                <div
                  key={action.id}
                  onClick={() => navigate(`/actions/${action.id}`)}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300"
                >
                  <p className="text-xs font-semibold text-slate-800">
                    {inv?.name ?? "Unknown"}
                  </p>
                  <p
                    className="mt-1 text-xs text-slate-500 leading-relaxed"
                    title={action.objective}
                  >
                    {truncate(action.objective, 60)}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Owner initials */}
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                        {getInitials(action.owner)}
                      </div>
                      <span
                        className={cn(
                          "font-mono text-[10px]",
                          isOverdue(action.dueDate) && action.state !== "completed"
                            ? "font-semibold text-red-600"
                            : "text-slate-400"
                        )}
                      >
                        {action.dueDate}
                      </span>
                    </div>
                    <Badge variant={action.type} className="text-[10px]">
                      {typeLabels[action.type]}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export function ActionsPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("list");
  const [filters, setFilters] = useState({
    state: "",
    type: "",
    investor: "",
    owner: "",
  });

  const filteredActions = actions.filter((a) => {
    if (filters.state && a.state !== filters.state) return false;
    if (filters.type && a.type !== filters.type) return false;
    if (filters.investor && a.investorId !== filters.investor) return false;
    if (filters.owner && a.owner !== filters.owner) return false;
    return true;
  });

  const overdueCount = filteredActions.filter(
    (a) => isOverdue(a.dueDate) && a.state !== "completed"
  ).length;

  const inProgressCount = filteredActions.filter(
    (a) => a.state === "in_progress"
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Actions</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Engagement actions and outreach management
          </p>
          <div className="mt-3 flex items-center gap-6">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                TOTAL ACTIONS
              </span>
              <p className="font-mono text-lg font-bold text-slate-900">
                {filteredActions.length}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                IN PROGRESS
              </span>
              <p className="font-mono text-lg font-bold text-slate-900">
                {inProgressCount}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                OVERDUE
              </span>
              <p className={cn(
                "font-mono text-lg font-bold",
                overdueCount > 0 ? "text-red-600" : "text-slate-900"
              )}>
                {overdueCount}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "list"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List size={14} />
              List
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "board"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid size={14} />
              Board
            </button>
          </div>

          <button
            onClick={() => navigate("/actions/new")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            <Plus size={14} />
            New Action
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar filters={filters} setFilters={setFilters} />

      {/* Content */}
      {viewMode === "list" ? (
        <ListView filteredActions={filteredActions} navigate={navigate} />
      ) : (
        <BoardView filteredActions={filteredActions} navigate={navigate} />
      )}
    </div>
  );
}
