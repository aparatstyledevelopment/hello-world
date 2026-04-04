import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Clock,
  Video,
  Users,
  MapPin,
  Zap,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import {
  signals,
  actions,
  investors,
  meetings,
  topBuyers,
  topSellers,
  marketContextSummary,
  getInvestor,
  getContact,
  getTimelineForInvestor,
  getMeetingsForDate,
} from "../data/mock-data";

const TODAY = "2026-04-04";
const TOMORROW = "2026-04-05";

const urgencyOrder = { high: 0, medium: 1, low: 2 };

const typeIcons = {
  retention_risk: TrendingDown,
  influence_opportunity: TrendingUp,
  governance_management: Shield,
  information_gap: FileText,
  relationship_maintenance: Users,
};

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

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(TODAY) - new Date(dateStr);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ── Page ──────────────────────────────────────────────────
export function TodayPage() {
  const navigate = useNavigate();
  const [marketExpanded, setMarketExpanded] = useState(false);

  const todayMeetings = getMeetingsForDate(TODAY);
  const tomorrowMeetings = getMeetingsForDate(TOMORROW);
  const allMeetings = [...todayMeetings, ...tomorrowMeetings];

  // Unified signal + action stream
  const stream = useMemo(() => {
    const activeSignals = signals
      .filter((s) => s.state !== "resolved" && s.state !== "dismissed")
      .map((s) => ({
        kind: "signal",
        id: s.id,
        urgency: s.urgency,
        type: s.type,
        investorId: s.investorId,
        summary: s.headline,
        owner: null,
        date: s.detectedAt,
        sortKey: urgencyOrder[s.urgency],
        route: `/signals/${s.id}`,
      }));

    const activeActions = actions
      .filter((a) => a.state !== "completed")
      .map((a) => ({
        kind: "action",
        id: a.id,
        urgency:
          new Date(a.dueDate) <= new Date(TODAY) ? "high" :
          new Date(a.dueDate) <= new Date(new Date(TODAY).getTime() + 3 * 86400000) ? "medium" : "low",
        type: a.type,
        investorId: a.investorId,
        contactId: a.contactId,
        summary: a.objective,
        owner: a.owner,
        date: a.dueDate,
        sortKey: 0,
        route: `/actions/${a.id}`,
      }));

    // Sort: high urgency first, then by date
    return [...activeSignals, ...activeActions].sort((a, b) => {
      const ua = urgencyOrder[a.urgency] ?? 2;
      const ub = urgencyOrder[b.urgency] ?? 2;
      if (ua !== ub) return ua - ub;
      return new Date(a.date) - new Date(b.date);
    });
  }, []);

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
          Today
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          {new Date(TODAY).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* ── SECTION 1: Market Context Summary ────────────── */}
      <Card variant="section" accentColor="blue">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400">
            Market Context
          </h2>
          <Link
            to="/market"
            className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            See full market context
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="text-sm text-zinc-600 leading-relaxed space-y-2">
          <p>
            Our stock closed at <span className="font-semibold text-zinc-900">$142.30</span> yesterday,{" "}
            <span className="font-semibold text-emerald-600">up 1.8%</span> — outperforming the sector index by 0.6%.
            The rally was driven by positive analyst commentary following the AI infrastructure spending report from McKinsey,
            which projects <span className="font-medium text-zinc-800">40% YoY growth through 2028</span>.
          </p>
          <p>
            Among peers, <span className="font-medium text-zinc-800">XYZ Corp announced a $4.2B acquisition</span> in AI infrastructure,
            which may shift investor perception of competitive positioning.
            Bond yields held steady at <span className="font-medium text-zinc-800">4.12%</span>, while active equity funds saw{" "}
            <span className="font-semibold text-red-500">$8B in outflows</span> for March — something to watch for our active holders
            like Wellington and Harris.
          </p>
          <p>
            BlackRock has <span className="font-medium text-zinc-800">increased sector-wide positions by 0.3%</span> in Q1,
            suggesting a macro allocation shift rather than company-specific conviction.
          </p>
        </div>

        {/* Expandable data points */}
        <button
          onClick={() => setMarketExpanded(!marketExpanded)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {marketExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {marketExpanded ? "Hide key data" : "Show key data"}
        </button>

        {marketExpanded && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Top Buyers */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400 mb-2">
                TOP BUYERS (Q4)
              </p>
              <div className="space-y-1.5">
                {topBuyers.slice(0, 3).map((b) => (
                  <div key={b.name} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={12} className="text-emerald-400" />
                      <span className="text-xs font-medium text-zinc-700">{b.name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-900">{b.change}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Sellers */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400 mb-2">
                TOP SELLERS (Q4)
              </p>
              <div className="space-y-1.5">
                {topSellers.slice(0, 3).map((s) => (
                  <div key={s.name} className="flex items-center justify-between rounded-xl bg-red-50/50 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <TrendingDown size={12} className="text-red-400" />
                      <span className="text-xs font-medium text-zinc-700">{s.name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-red-600">{s.change}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ── SECTION 2: Meeting Prep Cards ────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400">
            Meetings
          </h2>
          <span className="text-xs font-medium text-zinc-400">
            {todayMeetings.length} today &middot; {tomorrowMeetings.length} tomorrow
          </span>
        </div>

        {allMeetings.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 text-sm text-zinc-400">
            No meetings scheduled for today or tomorrow.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allMeetings.map((mtg) => {
              const inv = getInvestor(mtg.investorId);
              const contact = getContact(mtg.contactId);
              const timeline = getTimelineForInvestor(mtg.investorId);
              const lastEvent = timeline[0];
              const lastContactDays = contact ? daysSince(contact.lastInteraction) : null;
              const isToday = mtg.date === TODAY;

              return (
                <button
                  key={mtg.id}
                  onClick={() => navigate(`/investors/${mtg.investorId}`)}
                  className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-4 text-left transition-all hover:shadow-md hover:border-zinc-300"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold",
                        isToday ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
                      )}>
                        {inv?.name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{inv?.name ?? "Unknown"}</p>
                        <p className="text-[11px] text-zinc-400" onClick={(e) => { if (contact) { e.stopPropagation(); navigate(`/contacts/${contact.id}`); } }}>
                          <span className="hover:underline cursor-pointer">{contact?.name}</span> &middot; {contact?.role}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-zinc-700">{mtg.time}</p>
                      <p className={cn("text-[10px] font-medium uppercase tracking-wider", isToday ? "text-zinc-900" : "text-zinc-400")}>
                        {isToday ? "Today" : "Tomorrow"}
                      </p>
                    </div>
                  </div>

                  {/* Topic */}
                  <p className="text-xs text-zinc-600 mb-2">{mtg.topic}</p>

                  {/* Context strip */}
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      Last contact: {lastContactDays !== null ? `${lastContactDays}d ago` : "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video size={10} />
                      {mtg.channel}
                    </span>
                  </div>

                  {/* Last discussion */}
                  {lastEvent && (
                    <p className="mt-2 text-[11px] text-zinc-400 italic truncate">
                      Last: {lastEvent.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 3: Signals & Actions Stream ─────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400">
            Needs Attention
          </h2>
          <Link
            to="/signals-actions"
            className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            View all
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="space-y-2">
          {stream.slice(0, 8).map((item) => {
            const inv = getInvestor(item.investorId);
            const contact = item.contactId ? getContact(item.contactId) : null;
            const TypeIcon = typeIcons[item.type] || Zap;
            const isSignal = item.kind === "signal";

            return (
              <button
                key={`${item.kind}-${item.id}`}
                onClick={() => navigate(item.route)}
                className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200/60 bg-white shadow-sm px-4 py-3 text-left transition-all hover:shadow-md hover:border-zinc-300"
              >
                {/* Type indicator */}
                <div className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                  isSignal ? "bg-zinc-100" : "bg-zinc-50"
                )}>
                  {isSignal ? (
                    <TypeIcon size={14} className={cn(
                      item.urgency === "high" ? "text-red-500" : "text-zinc-500"
                    )} />
                  ) : (
                    <CheckSquare size={14} className="text-zinc-500" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn(
                      "inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                      isSignal ? "bg-zinc-100 text-zinc-600" : "bg-zinc-50 text-zinc-500"
                    )}>
                      {isSignal ? "Signal" : "Action"}
                    </span>
                    <Badge variant={item.urgency} kind="urgency" />
                    <span className="text-xs font-medium text-zinc-500 truncate">
                      {inv?.name ?? "Unknown"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-800 truncate">{item.summary}</p>
                </div>

                {/* Right side */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                    {isSignal ? relativeAge(item.date) : daysUntil(item.date)}
                  </p>
                  {item.owner && (
                    <p className="text-[10px] text-zinc-300 mt-0.5">{item.owner}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
