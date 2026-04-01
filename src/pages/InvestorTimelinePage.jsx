import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Video,
  FileText,
  Bell,
  Calendar,
  User,
  Clock,
  Filter,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import {
  getInvestor,
  getTimelineForInvestor,
  getSignalsForInvestor,
  getActionsForInvestor,
} from "../data/mock-data";

const timelineTypeIcons = {
  meeting: Video,
  email: Mail,
  call: Phone,
  filing: FileText,
  signal: Bell,
};

const timelineDotColors = {
  meeting: "bg-emerald-500",
  call: "bg-blue-500",
  email: "bg-slate-400",
  signal: "bg-amber-500",
  filing: "bg-violet-500",
};

const timelineBadgeStyles = {
  meeting: "bg-emerald-50 text-emerald-700",
  call: "bg-blue-50 text-blue-700",
  email: "bg-slate-100 text-slate-600",
  signal: "bg-amber-50 text-amber-700",
  filing: "bg-violet-50 text-violet-700",
};

const filterOptions = ["all", "meeting", "email", "call", "filing", "signal"];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupByMonth(events) {
  const groups = {};
  for (const evt of events) {
    const d = new Date(evt.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = { label, events: [] };
    groups[key].events.push(evt);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, v]) => v);
}

export function InvestorTimelinePage() {
  const { id } = useParams();
  const [filter, setFilter] = useState("all");

  const investor = getInvestor(id);

  if (!investor) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          icon={User}
          title="Investor not found"
          description="The investor you are looking for does not exist."
        />
      </div>
    );
  }

  const events = useMemo(() => getTimelineForInvestor(id), [id]);
  const signals = getSignalsForInvestor(id);
  const actions = getActionsForInvestor(id);

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  const openSignals = signals.filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  );
  const openActions = actions.filter((a) => a.state !== "completed");

  const typeCounts = useMemo(() => {
    const counts = {};
    for (const evt of events) {
      counts[evt.type] = (counts[evt.type] || 0) + 1;
    }
    return counts;
  }, [events]);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Back link */}
      <Link
        to={`/investors/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to {investor.name}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {investor.name} — Timeline
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Complete engagement history and activity log
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div>
            <span className="font-mono font-bold text-slate-900 text-lg">{events.length}</span>
            <span className="ml-1">events</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="font-mono font-bold text-amber-600 text-lg">{openSignals.length}</span>
            <span className="ml-1">signals</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="font-mono font-bold text-blue-600 text-lg">{openActions.length}</span>
            <span className="ml-1">actions</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterOptions.map((opt) => {
          const count = opt === "all" ? events.length : (typeCounts[opt] || 0);
          return (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === opt
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              {opt === "all" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)}
              <span className={cn(
                "font-mono text-[10px]",
                filter === opt ? "text-slate-300" : "text-slate-400"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events"
          description="No timeline events match your filter."
        />
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.label}>
              {/* Month header */}
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">{group.label}</h3>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] text-slate-400 font-mono">{group.events.length} events</span>
              </div>

              {/* Timeline entries */}
              <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-[5px] top-1.5 bottom-1.5 w-0.5 bg-slate-200" />

                <div className="space-y-2">
                  {group.events.map((evt) => {
                    const Icon = timelineTypeIcons[evt.type] || Bell;
                    return (
                      <div key={evt.id} className="relative">
                        {/* Dot */}
                        <div
                          className={cn(
                            "absolute -left-6 top-4 h-3 w-3 rounded-full ring-2 ring-white",
                            timelineDotColors[evt.type] || "bg-slate-400"
                          )}
                        />
                        {/* Content card */}
                        <div className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Icon size={14} className="text-slate-400" />
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                  timelineBadgeStyles[evt.type] || "bg-slate-100 text-slate-600"
                                )}
                              >
                                {evt.type}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">{formatDate(evt.date)}</span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{evt.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
