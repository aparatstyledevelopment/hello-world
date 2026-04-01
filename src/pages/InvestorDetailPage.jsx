import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Mail,
  Phone,
  Video,
  FileText,
  Bell,
  Calendar,
  User,
  MessageSquare,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Table } from "../components/ui/Table";
import { Sparkline } from "../components/ui/Sparkline";
import { StatCard } from "../components/ui/StatCard";
import { EmptyState } from "../components/ui/EmptyState";
import {
  getInvestor,
  getSignalsForInvestor,
  getActionsForInvestor,
  getTimelineForInvestor,
} from "../data/mock-data";

const TODAY = new Date("2026-04-01");

const typeLabels = {
  passive: "Passive",
  active: "Active",
  pension: "Pension",
  sovereign: "Sovereign",
};

const typeBadgeColors = {
  passive: "bg-sky-50 text-sky-700 ring-sky-600/20",
  active: "bg-violet-50 text-violet-700 ring-violet-600/20",
  pension: "bg-teal-50 text-teal-700 ring-teal-600/20",
  sovereign: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
};

const signalTypeLabels = {
  retention_risk: "Retention Risk",
  influence_opportunity: "Influence",
  governance_management: "Governance",
  information_gap: "Info Gap",
  relationship_maintenance: "Relationship",
};

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

const signalStateLabels = {
  new: "New",
  reviewing: "Reviewing",
  confirmed: "Confirmed",
  action_created: "Action Created",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const tabs = [
  { key: "timeline", label: "Timeline" },
  { key: "state", label: "State" },
  { key: "contacts", label: "Contacts" },
  { key: "signals", label: "Signals" },
  { key: "actions", label: "Actions" },
];

const timelineTypeIcons = {
  meeting: Video,
  email: Mail,
  call: Phone,
  filing: FileText,
  signal: Bell,
};

const timelineFilterOptions = ["all", "meeting", "email", "call", "filing", "signal"];

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = TODAY - new Date(dateStr);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: ArrowRight,
};

const trendColor = {
  up: "text-emerald-600",
  down: "text-red-600",
  neutral: "text-slate-400",
};

// ── Timeline Tab ──────────────────────────────────────────
function TimelineTab({ investorId }) {
  const [filter, setFilter] = useState("all");
  const events = useMemo(() => getTimelineForInvestor(investorId), [investorId]);

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {timelineFilterOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === opt
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            {opt === "all" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>

      {/* Vertical timeline */}
      {filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="No events" description="No timeline events match your filter." />
      ) : (
        <div className="relative ml-4">
          {/* Vertical line */}
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200" />

          <div className="space-y-4">
            {filtered.map((evt) => {
              const Icon = timelineTypeIcons[evt.type] || Bell;
              return (
                <div key={evt.id} className="relative flex items-start gap-4 pl-2">
                  {/* Icon circle */}
                  <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
                    <Icon size={12} className="text-slate-500" />
                  </div>
                  {/* Content */}
                  <div className="min-w-0 flex-1 pb-1">
                    <p className="text-xs text-slate-400">{evt.date}</p>
                    <p className="mt-0.5 text-sm text-slate-700">{evt.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── State Tab ─────────────────────────────────────────────
function StateTab({ investor }) {
  const params = investor.stateParameters || [];

  const byProvenance = {
    observed: params.filter((p) => p.provenance === "observed"),
    inferred: params.filter((p) => p.provenance === "inferred"),
    team_assessed: params.filter((p) => p.provenance === "team_assessed"),
  };

  const provenanceLabels = {
    observed: "Observed",
    inferred: "Inferred",
    team_assessed: "Team Assessed",
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {["observed", "inferred", "team_assessed"].map((prov) => (
        <div key={prov}>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {provenanceLabels[prov]}
          </h4>
          <div className="space-y-3">
            {byProvenance[prov].length === 0 ? (
              <p className="text-xs text-slate-400">No parameters</p>
            ) : (
              byProvenance[prov].map((param, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {param.label}
                    </span>
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        param.freshness === "fresh"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      )}
                      title={param.freshness}
                    />
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {param.value}
                  </p>
                  <Badge variant={param.provenance} className="mt-2 text-[10px]">
                    {provenanceLabels[param.provenance]}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Contacts Tab ──────────────────────────────────────────
function ContactsTab({ investor }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {investor.contacts.map((contact) => {
        const days = daysSince(contact.lastInteraction);
        return (
          <Card key={contact.id}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                {contact.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{contact.name}</p>
                <p className="text-xs text-slate-500">{contact.role}</p>
                <p className="mt-1 text-xs text-slate-400">{contact.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Calendar size={12} className="text-slate-400" />
                  <span
                    className={cn(
                      "text-xs",
                      days !== null && days > 30
                        ? "font-semibold text-red-600"
                        : "text-slate-500"
                    )}
                  >
                    {days !== null
                      ? `Last interaction ${days}d ago (${contact.lastInteraction})`
                      : "No interaction recorded"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Signals Tab ───────────────────────────────────────────
function SignalsTab({ investorId }) {
  const sigs = useMemo(() => getSignalsForInvestor(investorId), [investorId]);

  const columns = [
    { key: "state", label: "State" },
    { key: "type", label: "Type" },
    { key: "urgency", label: "Urgency" },
    { key: "headline", label: "Headline" },
    { key: "detectedAt", label: "Detected" },
  ];

  const renderCell = (row, col) => {
    switch (col.key) {
      case "state":
        return <Badge variant={row.state}>{signalStateLabels[row.state]}</Badge>;
      case "type":
        return <Badge variant={row.type}>{signalTypeLabels[row.type]}</Badge>;
      case "urgency":
        return <Badge variant={row.urgency}>{row.urgency}</Badge>;
      case "headline":
        return (
          <Link
            to={`/signals/${row.id}`}
            className="text-sm font-medium text-slate-700 hover:text-primary-600"
          >
            {row.headline}
          </Link>
        );
      case "detectedAt":
        return <span className="text-sm text-slate-500">{row.detectedAt}</span>;
      default:
        return row[col.key];
    }
  };

  if (sigs.length === 0) {
    return <EmptyState icon={Bell} title="No signals" description="No signals detected for this investor." />;
  }

  return <Table columns={columns} data={sigs} renderCell={renderCell} />;
}

// ── Actions Tab ───────────────────────────────────────────
function ActionsTab({ investorId }) {
  const acts = useMemo(() => getActionsForInvestor(investorId), [investorId]);

  const columns = [
    { key: "state", label: "State" },
    { key: "type", label: "Type" },
    { key: "objective", label: "Objective" },
    { key: "owner", label: "Owner" },
    { key: "dueDate", label: "Due Date" },
    { key: "channel", label: "Channel" },
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
        return <Badge variant={row.type}>{signalTypeLabels[row.type]}</Badge>;
      case "objective":
        return (
          <Link
            to={`/actions/${row.id}`}
            className="text-sm font-medium text-slate-700 hover:text-primary-600"
          >
            {row.objective.length > 60
              ? row.objective.slice(0, 60) + "..."
              : row.objective}
          </Link>
        );
      case "owner":
        return <span className="text-slate-600">{row.owner}</span>;
      case "dueDate": {
        const overdue = row.dueDate < "2026-04-01" && row.state !== "completed";
        return (
          <span
            className={cn(
              "text-sm",
              overdue ? "font-semibold text-red-600" : "text-slate-600"
            )}
          >
            {row.dueDate}
          </span>
        );
      }
      case "channel":
        return <span className="text-slate-500">{row.channel}</span>;
      default:
        return row[col.key];
    }
  };

  if (acts.length === 0) {
    return <EmptyState icon={FileText} title="No actions" description="No actions created for this investor." />;
  }

  return <Table columns={columns} data={acts} renderCell={renderCell} />;
}

// ── Main Page ─────────────────────────────────────────────
export function InvestorDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("timeline");

  const investor = getInvestor(id);

  if (!investor) {
    return (
      <div className="p-6">
        <EmptyState icon={User} title="Investor not found" description="The investor you are looking for does not exist." />
      </div>
    );
  }

  const signals = getSignalsForInvestor(id);
  const acts = getActionsForInvestor(id);
  const openSignals = signals.filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  );
  const openActions = acts.filter((a) => a.state !== "completed");
  const primaryContact = investor.contacts[0];

  const TrendIcon = trendIcon[investor.holdingTrend] || ArrowRight;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-400">
        <Link to="/investors" className="hover:text-slate-600">
          Investors
        </Link>
        <ChevronRight size={14} />
        <span className="text-slate-700">{investor.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{investor.name}</h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                typeBadgeColors[investor.type]
              )}
            >
              {typeLabels[investor.type]}
            </span>
            <Badge variant={String(investor.tier)}>Tier {investor.tier}</Badge>
          </div>

          <div className="mt-2 flex items-center gap-6 text-sm text-slate-500">
            {/* Holding + sparkline + trend */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                {investor.holdingPct}%
              </span>
              <Sparkline
                data={investor.holdingHistory}
                width={48}
                height={16}
                color={
                  investor.holdingTrend === "up"
                    ? "#10b981"
                    : investor.holdingTrend === "down"
                    ? "#ef4444"
                    : "#94a3b8"
                }
              />
              <TrendIcon
                size={14}
                className={trendColor[investor.holdingTrend]}
              />
            </div>

            {/* Primary contact */}
            {primaryContact && (
              <div className="flex items-center gap-1.5">
                <User size={14} />
                <span>{primaryContact.name}</span>
              </div>
            )}

            {/* Relationship owner */}
            <div className="flex items-center gap-1.5">
              <MessageSquare size={14} />
              <span>{investor.relationshipOwner}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          value={investor.holdingPct + "%"}
          label="Holding"
          trend={investor.holdingTrend}
        />
        <StatCard
          value={openSignals.length}
          label="Open Signals"
          trend={openSignals.length > 0 ? "up" : "neutral"}
        />
        <StatCard
          value={openActions.length}
          label="Open Actions"
          trend={openActions.length > 2 ? "up" : "neutral"}
        />
        <StatCard
          value={investor.contacts.length}
          label="Contacts"
          trend="neutral"
        />
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-slate-900" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "timeline" && <TimelineTab investorId={id} />}
        {activeTab === "state" && <StateTab investor={investor} />}
        {activeTab === "contacts" && <ContactsTab investor={investor} />}
        {activeTab === "signals" && <SignalsTab investorId={id} />}
        {activeTab === "actions" && <ActionsTab investorId={id} />}
      </div>
    </div>
  );
}
