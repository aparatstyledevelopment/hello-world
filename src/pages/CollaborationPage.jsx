import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  ArrowRightLeft,
  Activity,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import {
  investors,
  signals,
  actions,
  timelineEvents,
  getSignalsForInvestor,
} from "../data/mock-data";

const TODAY = new Date("2026-04-01");

// ── Team members derived from owners + actions ──────────
const teamMembers = [
  {
    id: "tm-001",
    name: "Jane Doe",
    initials: "JD",
    role: "IR Manager",
    focus: "Passive investors & governance",
  },
  {
    id: "tm-002",
    name: "John Smith",
    initials: "JS",
    role: "Senior IR Analyst",
    focus: "Active investors & ESG engagement",
  },
];

// ── Handoff Notes ───────────────────────────────────────
const handoffNotes = [
  {
    id: "hn-001",
    from: "John Smith",
    fromInitials: "JS",
    to: "Jane Doe",
    toInitials: "JD",
    date: "2026-03-28",
    investor: "BlackRock Fund Advisors",
    note: "BlackRock stewardship team mentioned they are reviewing our board diversity metrics ahead of AGM. They specifically asked about our timeline for reaching 33% gender diversity. Please follow up with governance talking points before the April 15 deadline.",
  },
  {
    id: "hn-002",
    from: "Jane Doe",
    fromInitials: "JD",
    to: "John Smith",
    toInitials: "JS",
    date: "2026-03-27",
    investor: "Wellington Management",
    note: "Wellington's senior analyst Emily Nakamura expressed strong interest in our R&D pipeline during the lunch meeting. She's looking for more detail on market expansion plans. Good opportunity to deepen the relationship while they're accumulating.",
  },
];

// ── Activity Feed ───────────────────────────────────────
const activityFeed = [
  {
    id: "af-001",
    user: "Jane Doe",
    initials: "JD",
    text: "Completed introductory call with Vanguard's new analyst Alex Rivera",
    time: "2 hours ago",
  },
  {
    id: "af-002",
    user: "John Smith",
    initials: "JS",
    text: "Sent ESG data package to BlackRock stewardship team",
    time: "4 hours ago",
  },
  {
    id: "af-003",
    user: "Jane Doe",
    initials: "JD",
    text: "Preparing tailored investor pack for Wellington Management",
    time: "5 hours ago",
  },
  {
    id: "af-004",
    user: "John Smith",
    initials: "JS",
    text: "Responded to CalPERS engagement letter on board diversity",
    time: "Yesterday",
  },
  {
    id: "af-005",
    user: "Jane Doe",
    initials: "JD",
    text: "Scheduled urgent 1-on-1 with Harris Associates to address position reduction",
    time: "Yesterday",
  },
  {
    id: "af-006",
    user: "John Smith",
    initials: "JS",
    text: "Sent thank-you note to Norges Bank for positive report mention",
    time: "2 days ago",
  },
  {
    id: "af-007",
    user: "Jane Doe",
    initials: "JD",
    text: "Updated CRM with Wellington lunch meeting notes",
    time: "3 days ago",
  },
];

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = TODAY - new Date(dateStr);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getLastInteraction(investor) {
  let latest = null;
  for (const c of investor.contacts) {
    if (!latest || c.lastInteraction > latest) {
      latest = c.lastInteraction;
    }
  }
  return latest;
}

function WorkloadBar({ value, max = 5 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div
        className={cn(
          "h-1.5 rounded-full transition-all",
          pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-500" : "bg-emerald-500"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function CollapsibleSection({ title, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown size={16} className="text-slate-400" />
          ) : (
            <ChevronRight size={16} className="text-slate-400" />
          )}
          <span className="text-sm font-semibold text-slate-900">{title}</span>
        </div>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-semibold text-slate-600">
          {count}
        </span>
      </button>
      {open && <div className="border-t border-slate-100 px-5 py-4">{children}</div>}
    </div>
  );
}

export function CollaborationPage() {
  // ── Compute team workload ─────────────────────────────
  const teamData = useMemo(() => {
    return teamMembers.map((member) => {
      const activeActions = actions.filter(
        (a) => a.owner === member.name && a.state !== "completed"
      );
      const memberSignals = signals.filter((s) => {
        const inv = investors.find((i) => i.id === s.investorId);
        return inv && inv.relationshipOwner === member.name;
      });
      const openSignals = memberSignals.filter(
        (s) => s.state !== "resolved" && s.state !== "dismissed"
      );

      return {
        ...member,
        activeActions: activeActions.length,
        openSignals: openSignals.length,
        actionsList: activeActions,
        signalsList: openSignals,
      };
    });
  }, []);

  // ── Investor coverage map ─────────────────────────────
  const coverageMap = useMemo(() => {
    return investors.map((inv) => {
      const lastInteraction = getLastInteraction(inv);
      const days = daysSince(lastInteraction);
      const openActions = actions.filter(
        (a) => a.investorId === inv.id && a.state !== "completed"
      ).length;
      return {
        id: inv.id,
        name: inv.name,
        primaryOwner: inv.relationshipOwner,
        lastInteraction,
        daysSince: days,
        openItems: openActions,
      };
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Team Collaboration</h1>
        <p className="mt-1 text-sm text-slate-500">
          Coordinate investor engagement across the IR team
        </p>
      </div>

      {/* ── Team Workload Overview ──────────────────────── */}
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          Team Workload Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {teamData.map((member) => (
            <div
              key={member.id}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 flex-shrink-0">
                  {member.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {member.name}
                  </h3>
                  <p className="text-xs text-slate-500">{member.role}</p>

                  {/* Stats */}
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 px-3 py-2 text-center">
                      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                        Active Actions
                      </p>
                      <p className="font-mono text-lg font-bold text-slate-900 mt-0.5">
                        {member.activeActions}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 px-3 py-2 text-center">
                      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                        Open Signals
                      </p>
                      <p className="font-mono text-lg font-bold text-slate-900 mt-0.5">
                        {member.openSignals}
                      </p>
                    </div>
                  </div>

                  {/* Workload bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                        Workload
                      </span>
                      <span className="font-mono text-[11px] font-medium text-slate-600">
                        {member.activeActions}/5
                      </span>
                    </div>
                    <WorkloadBar value={member.activeActions} />
                  </div>

                  {/* Current focus */}
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">
                    <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                      Focus
                    </span>
                    <p className="font-mono text-xs text-slate-600 mt-0.5">
                      {member.focus}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Investor Coverage Map ──────────────────────── */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
            Investor Coverage Map
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Primary ownership and engagement recency
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Investor
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Primary Owner
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Last Interaction
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Open Items
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coverageMap.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/investors/${row.id}`}
                      className="font-medium text-slate-900 hover:text-slate-600 hover:underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {row.primaryOwner}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          row.daysSince !== null && row.daysSince > 30
                            ? "bg-red-500"
                            : row.daysSince !== null && row.daysSince > 14
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        )}
                      />
                      <span
                        className={cn(
                          "font-mono text-xs",
                          row.daysSince !== null && row.daysSince > 30
                            ? "font-semibold text-red-600"
                            : "text-slate-600"
                        )}
                      >
                        {row.daysSince !== null
                          ? `${row.daysSince}d ago`
                          : "-"}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {row.openItems > 0 ? (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 font-mono text-xs font-semibold text-amber-700">
                        {row.openItems}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-slate-300">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Signal Queue by Team Member ────────────────── */}
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          Signal Queue by Team Member
        </h2>
        <div className="space-y-3">
          {teamData.map((member) => (
            <CollapsibleSection
              key={member.id}
              title={member.name}
              count={member.openSignals}
              defaultOpen={member.openSignals > 0}
            >
              {member.signalsList.length > 0 ? (
                <div className="space-y-2">
                  {member.signalsList.map((sig) => (
                    <div
                      key={sig.id}
                      className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2.5"
                    >
                      <Badge variant={sig.urgency} className="mt-0.5 flex-shrink-0">
                        {sig.urgency}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">
                          {sig.headline}
                        </p>
                        <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                          {sig.detectedAt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No open signals assigned.
                </p>
              )}
            </CollapsibleSection>
          ))}
        </div>
      </div>

      {/* ── Handoff Notes ──────────────────────────────── */}
      <div>
        <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          <ArrowRightLeft size={14} className="text-slate-400" />
          Handoff Notes
        </h2>
        <div className="space-y-3">
          {handoffNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">
                  {note.fromInitials}
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {note.from}
                </span>
                <ArrowRightLeft size={12} className="text-slate-300" />
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">
                  {note.toInitials}
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {note.to}
                </span>
                <span className="font-mono text-xs text-slate-400 ml-auto">
                  {note.date}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Re:{" "}
                </span>
                <span className="text-xs font-medium text-slate-700">
                  {note.investor}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {note.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity Feed ──────────────────────────────── */}
      <div>
        <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          <Activity size={14} className="text-slate-400" />
          Activity Feed
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="space-y-0">
            {activityFeed.map((entry, idx) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-start gap-3 py-3",
                  idx < activityFeed.length - 1 && "border-b border-slate-100"
                )}
              >
                {/* Avatar */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700 flex-shrink-0">
                  {entry.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium text-slate-900">
                      {entry.user}
                    </span>{" "}
                    {entry.text}
                  </p>
                  <p className="font-mono text-xs text-slate-400 mt-0.5">{entry.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
