import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Radio, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/ui/Table";
import { ConfidenceBadge } from "../components/ui/ConfidenceBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { signals, investors, getInvestor } from "../data/mock-data";

const TODAY = "2026-04-01";

// ── Helpers ──────────────────────────────────────────────────

const urgencyOrder = { high: 0, medium: 1, low: 2 };

const urgencyDotColor = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

const stateLabels = {
  new: "New",
  reviewing: "Reviewing",
  confirmed: "Confirmed",
  action_created: "Action Created",
  resolved: "Resolved",
  dismissed: "Dismissed",
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
  if (diff === 1) return "1d ago";
  return `${diff}d ago`;
}

function truncate(str, len = 55) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "\u2026" : str;
}

// ── Filter options ───────────────────────────────────────────

const stateOptions = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "confirmed", label: "Confirmed" },
  { value: "action_created", label: "Action Created" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const urgencyOptions = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const typeOptions = [
  { value: "retention_risk", label: "Retention Risk" },
  { value: "influence_opportunity", label: "Influence" },
  { value: "governance_management", label: "Governance" },
  { value: "information_gap", label: "Info Gap" },
  { value: "relationship_maintenance", label: "Relationship" },
];

// ── Filter Bar ───────────────────────────────────────────────

function FilterBar({ filters, setFilters, totalCount, filteredCount }) {
  const investorOptions = investors.map((i) => ({
    value: i.id,
    label: i.name,
  }));

  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-slate-400" />

        <select
          value={filters.state}
          onChange={(e) =>
            setFilters((f) => ({ ...f, state: e.target.value }))
          }
          className={selectClass}
        >
          <option value="">All States</option>
          {stateOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filters.urgency}
          onChange={(e) =>
            setFilters((f) => ({ ...f, urgency: e.target.value }))
          }
          className={selectClass}
        >
          <option value="">All Urgency</option>
          {urgencyOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) =>
            setFilters((f) => ({ ...f, type: e.target.value }))
          }
          className={selectClass}
        >
          <option value="">All Types</option>
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filters.investor}
          onChange={(e) =>
            setFilters((f) => ({ ...f, investor: e.target.value }))
          }
          className={selectClass}
        >
          <option value="">All Investors</option>
          {investorOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-slate-500">
        {filteredCount === totalCount
          ? `${totalCount} signal${totalCount !== 1 ? "s" : ""}`
          : `${filteredCount} of ${totalCount} signals`}
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export function SignalsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    state: "",
    urgency: "",
    type: "",
    investor: "",
  });

  const filtered = signals
    .filter((s) => {
      if (filters.state && s.state !== filters.state) return false;
      if (filters.urgency && s.urgency !== filters.urgency) return false;
      if (filters.type && s.type !== filters.type) return false;
      if (filters.investor && s.investorId !== filters.investor) return false;
      return true;
    })
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  const columns = [
    { key: "urgency", label: "Urgency" },
    { key: "type", label: "Type" },
    { key: "investor", label: "Investor" },
    { key: "contact", label: "Contact" },
    { key: "summary", label: "Summary" },
    { key: "confidence", label: "Confidence" },
    { key: "age", label: "Age" },
    { key: "state", label: "State" },
    { key: "assignedTo", label: "Assigned" },
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
      case "summary":
        return (
          <span className="text-slate-600" title={row.description}>
            {truncate(row.description)}
          </span>
        );
      case "confidence":
        return <ConfidenceBadge level={row.confidence} showLabel />;
      case "age":
        return (
          <span className="whitespace-nowrap text-xs text-slate-500">
            {relativeAge(row.detectedAt)}
          </span>
        );
      case "state":
        return <Badge variant={row.state}>{stateLabels[row.state]}</Badge>;
      case "assignedTo":
        return (
          <span className="text-xs text-slate-500">
            {inv?.relationshipOwner ?? "-"}
          </span>
        );
      case "action":
        return (
          <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-blue-600 hover:text-blue-800">
            Review <ArrowRight size={12} />
          </span>
        );
      default:
        return row[col.key];
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Signals</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Intelligence inbox &mdash; review, triage, and act on investor signals
        </p>
      </div>

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        totalCount={signals.length}
        filteredCount={filtered.length}
      />

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No signals match"
          description="Try adjusting your filters to see more signals."
        />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          onRowClick={(row) => navigate(`/signals/${row.id}`)}
          renderCell={renderCell}
        />
      )}
    </div>
  );
}
