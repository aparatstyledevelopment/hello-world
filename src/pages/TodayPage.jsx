import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  Video,
  Zap,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Shield,
  FileText,
} from "lucide-react";
import { useMemo } from "react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { useData } from "../data/store";

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
  const { signals, actions, investors, getInvestor, getContact, getTimelineForInvestor, getMeetingsForDate } = useData();

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
  }, [signals, actions]);

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

      {/* ── SECTION 1: Ownership Narrative ────────────────── */}
      {(() => {
        const totalInvestors = investors.length;
        const totalHolding = investors.reduce((s, i) => s + i.holdingPct, 0);
        const largest = [...investors].sort((a, b) => b.holdingPct - a.holdingPct)[0];
        const declining = investors.filter((i) => i.holdingTrend === "down");
        const decliningHolding = declining.reduce((s, i) => s + i.holdingPct, 0);

        return (
          <div className="rounded-2xl bg-zinc-900 p-5 shadow-sm">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400 mb-3">
              Ownership Narrative
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              The tracked shareholder base comprises{" "}
              <span className="font-bold text-white">{totalInvestors} investors</span>{" "}
              holding a combined{" "}
              <span className="font-bold text-white">{totalHolding.toFixed(1)}%</span>{" "}
              of outstanding shares.{" "}
              <span className="font-bold text-white">{largest.name}</span>{" "}
              remains the largest holder at {largest.holdingPct}%.{" "}
              {declining.length > 0 ? (
                <>
                  Notably,{" "}
                  <span className="font-bold text-red-400">{declining.length} investor{declining.length !== 1 ? "s" : ""}</span>{" "}
                  show declining positions, representing a combined {decliningHolding.toFixed(1)}% at risk of further reduction.
                </>
              ) : (
                "No investors currently show declining positions."
              )}
            </p>
          </div>
        );
      })()}

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
                className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200/60 bg-white shadow-sm px-4 py-2.5 text-left transition-all hover:shadow-md hover:border-zinc-300"
              >
                {/* Type indicator */}
                <div className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                  item.urgency === "high" ? "bg-red-50" : isSignal ? "bg-zinc-100" : "bg-zinc-50"
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
                  <p className="text-sm text-zinc-800 truncate">{item.summary}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider",
                      isSignal ? "text-zinc-400" : "text-zinc-400"
                    )}>
                      {isSignal ? "Signal" : "Action"}
                    </span>
                    <span className="text-zinc-200">&middot;</span>
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider",
                      item.urgency === "high" ? "text-red-500" : item.urgency === "medium" ? "text-zinc-500" : "text-zinc-400"
                    )}>
                      {item.urgency}
                    </span>
                    <span className="text-zinc-200">&middot;</span>
                    <span className="text-[11px] text-zinc-400 truncate">
                      {inv?.name ?? "Unknown"}
                    </span>
                  </div>
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
