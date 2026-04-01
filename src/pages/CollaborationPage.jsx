import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  ArrowRightLeft,
  Activity,
  Mail,
  Phone,
  Video,
  MessageSquare,
  FileText,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { TimelineEntry } from "../components/ui/TimelineEntry";
import { HealthDots } from "../components/ui/HealthDots";
import {
  investors,
  signals,
  actions,
} from "../data/mock-data";

const TODAY = new Date("2026-04-01");

// ── Team members ────────────────────────────────────────
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
    icon: Phone,
  },
  {
    id: "af-002",
    user: "John Smith",
    initials: "JS",
    text: "Sent ESG data package to BlackRock stewardship team",
    time: "4 hours ago",
    icon: Mail,
  },
  {
    id: "af-003",
    user: "Jane Doe",
    initials: "JD",
    text: "Preparing tailored investor pack for Wellington Management",
    time: "5 hours ago",
    icon: FileText,
  },
  {
    id: "af-004",
    user: "John Smith",
    initials: "JS",
    text: "Responded to CalPERS engagement letter on board diversity",
    time: "Yesterday",
    icon: Mail,
  },
  {
    id: "af-005",
    user: "Jane Doe",
    initials: "JD",
    text: "Scheduled urgent 1-on-1 with Harris Associates to address position reduction",
    time: "Yesterday",
    icon: Video,
  },
  {
    id: "af-006",
    user: "John Smith",
    initials: "JS",
    text: "Sent thank-you note to Norges Bank for positive report mention",
    time: "2 days ago",
    icon: MessageSquare,
  },
  {
    id: "af-007",
    user: "Jane Doe",
    initials: "JD",
    text: "Updated CRM with Wellington lunch meeting notes",
    time: "3 days ago",
    icon: FileText,
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

      // Derive health dots from workload
      const workloadLevel = activeActions.length >= 4 ? "weak" : activeActions.length >= 2 ? "moderate" : "strong";
      const signalLevel = openSignals.length >= 3 ? "weak" : openSignals.length >= 1 ? "moderate" : "strong";

      return {
        ...member,
        activeActions: activeActions.length,
        openSignals: openSignals.length,
        actionsList: activeActions,
        signalsList: openSignals,
        healthDots: [workloadLevel, signalLevel, "strong"],
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
      const openSigs = signals.filter(
        (s) => s.investorId === inv.id && s.state !== "resolved" && s.state !== "dismissed"
      ).length;

      // Health: based on recency and open items
      const recencyHealth = days !== null && days > 30 ? "weak" : days !== null && days > 14 ? "moderate" : "strong";
      const itemHealth = openActions >= 3 ? "weak" : openActions >= 1 ? "moderate" : "strong";

      return {
        id: inv.id,
        name: inv.name,
        type: inv.type,
        holdingPct: inv.holdingPct,
        primaryOwner: inv.relationshipOwner,
        lastInteraction,
        daysSince: days,
        openItems: openActions,
        openSignals: openSigs,
        healthDots: [recencyHealth, itemHealth],
      };
    });
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Team Collaboration</h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Coordinate investor engagement across the IR team
        </p>
      </div>

      {/* Dark hero narrative */}
      <div className="rounded-lg bg-slate-900 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">COLLABORATION NARRATIVE</p>
        <p className="text-sm text-slate-300 leading-relaxed">
          The IR team of <span className="font-bold text-white">{teamData.length} members</span> is managing
          {" "}<span className="font-bold text-white">{teamData.reduce((s, m) => s + m.activeActions, 0)} active actions</span> and
          {" "}<span className="font-bold text-white">{teamData.reduce((s, m) => s + m.openSignals, 0)} open signals</span> across
          {" "}{investors.length} tracked investors.
          {teamData.some((m) => m.activeActions >= 4) && (
            <> <span className="font-bold text-amber-400">{teamData.filter((m) => m.activeActions >= 4).map((m) => m.name).join(", ")}</span> {teamData.filter((m) => m.activeActions >= 4).length > 1 ? "are" : "is"} approaching
            workload capacity and may require rebalancing.</>
          )}
        </p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">Team Members</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900">{teamData.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">Active Actions</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900">{teamData.reduce((s, m) => s + m.activeActions, 0)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">Open Signals</p>
          <p className={cn("mt-1 font-mono text-2xl font-bold", teamData.reduce((s, m) => s + m.openSignals, 0) > 0 ? "text-amber-600" : "text-slate-900")}>{teamData.reduce((s, m) => s + m.openSignals, 0)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">Handoff Notes</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900">{handoffNotes.length}</p>
        </div>
      </div>

      {/* ── Team Cards (Strategic Specialists style) ──────── */}
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-4">TEAM WORKLOAD OVERVIEW</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {teamData.map((member) => (
            <div
              key={member.id}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-200 text-sm font-bold text-slate-700 flex-shrink-0">
                  {member.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      {member.name}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em]">
                      {member.role}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">{member.focus}</p>

                  {/* Metric bars */}
                  <div className="space-y-3 mb-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                          ACTIVE ACTIONS
                        </span>
                        <span className="font-mono text-[11px] font-medium text-slate-600">
                          {member.activeActions}/5
                        </span>
                      </div>
                      <WorkloadBar value={member.activeActions} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                          OPEN SIGNALS
                        </span>
                        <span className="font-mono text-[11px] font-medium text-slate-600">
                          {member.openSignals}
                        </span>
                      </div>
                      <WorkloadBar value={member.openSignals} max={4} />
                    </div>
                  </div>

                  {/* Health dots */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                      STATUS
                    </span>
                    <HealthDots values={member.healthDots} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Priority Coverage Matrix ─────────────────────── */}
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1">PRIORITY COVERAGE MATRIX</h2>
        <p className="text-xs text-slate-400 mb-4">Primary ownership, engagement recency, and open work items</p>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["INVESTOR", "TYPE", "HOLDING", "OWNER", "LAST CONTACT", "OPEN ITEMS", "HEALTH"].map((col) => (
                  <th key={col} className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coverageMap.map((row) => (
                <tr key={row.id} className={cn(
                  row.daysSince !== null && row.daysSince > 30 && "bg-red-50/40"
                )}>
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/investors/${row.id}`}
                      className="font-medium text-slate-900 hover:text-slate-600 hover:underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-700">
                    {row.holdingPct}%
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {row.primaryOwner}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
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
                            ? "font-bold text-red-600"
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
                  <td className="px-4 py-2.5">
                    <HealthDots values={row.healthDots} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Engagement History (TimelineEntry) ────────────── */}
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1">ENGAGEMENT HISTORY</h2>
        <p className="text-xs text-slate-400 mb-4">Recent team activity feed</p>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          {activityFeed.map((entry, idx) => (
            <TimelineEntry
              key={entry.id}
              icon={entry.icon}
              title={entry.user}
              date={entry.time}
              description={entry.text}
              isLast={idx === activityFeed.length - 1}
            />
          ))}
        </div>
      </div>

      {/* ── Handoff Notes (Log & Actions style) ──────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ArrowRightLeft size={14} className="text-slate-400" />
          <h2 className="text-base font-bold text-slate-900">Log & Actions</h2>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 font-mono text-[10px] font-bold text-white">
            {handoffNotes.length}
          </span>
        </div>
        <hr className="border-slate-200 mb-5" />

        <div className="space-y-3">
          {handoffNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              {/* Header row */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-[10px] font-bold text-slate-700">
                  {note.fromInitials}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {note.from}
                </span>
                <ArrowRightLeft size={12} className="text-slate-300" />
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-[10px] font-bold text-slate-700">
                  {note.toInitials}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {note.to}
                </span>
                <span className="font-mono text-xs text-slate-400 ml-auto">
                  {note.date}
                </span>
              </div>

              {/* Investor reference */}
              <div className="mb-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  RE:{" "}
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {note.investor}
                </span>
              </div>

              {/* Note body */}
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {note.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Signal Queue by Team Member ────────────────── */}
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          SIGNAL QUEUE BY TEAM MEMBER
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
