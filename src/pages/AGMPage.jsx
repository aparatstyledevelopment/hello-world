import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  Eye,
  Send,
  Vote,
} from "lucide-react";
import { cn } from "../lib/utils";
import { StatCard } from "../components/ui/StatCard";
import { Card } from "../components/ui/Card";
import { SentimentMeter } from "../components/ui/SentimentMeter";
import { Badge } from "../components/ui/Badge";
import { HealthDots } from "../components/ui/HealthDots";
import { investors, signals, actions, getSignalsForInvestor } from "../data/mock-data";

// ── AGM config ──────────────────────────────────────────
const AGM_DATE = "2026-05-03";
const DAYS_TO_AGM = 32;

// ── Process Roadmap phases ──────────────────────────────
const roadmapPhases = [
  {
    id: "phase-1",
    label: "Board Review & Proxy Drafting",
    date: "Jan 15 - Feb 28",
    status: "completed",
    description: "Board approved slate of directors, compensation committee finalized say-on-pay proposal.",
  },
  {
    id: "phase-2",
    label: "Investor Outreach & Engagement",
    date: "Mar 1 - Mar 31",
    status: "completed",
    description: "Pre-AGM engagement with top 10 shareholders completed. Key governance concerns identified and addressed.",
  },
  {
    id: "phase-3",
    label: "Proxy Statement Filing",
    date: "Apr 1 - Apr 10",
    status: "current",
    description: "Final proxy statement under legal review. Filing targeted for April 8. Distribution to begin April 10.",
    action: "View Draft",
  },
  {
    id: "phase-4",
    label: "Proxy Advisory Review",
    date: "Apr 10 - Apr 20",
    status: "future",
    description: "ISS and Glass Lewis review period. Prepare rebuttals if needed.",
  },
  {
    id: "phase-5",
    label: "Final Solicitation",
    date: "Apr 20 - May 2",
    status: "future",
    description: "Last round of targeted outreach to undecided or at-risk voters.",
  },
  {
    id: "phase-6",
    label: "AGM Day",
    date: "May 3",
    status: "future",
    description: "Annual General Meeting. All resolutions voted.",
  },
];

// ── Governance investors ────────────────────────────────
function getGovernanceInvestors() {
  return investors.filter((inv) => {
    if (inv.type === "sovereign" || inv.type === "pension") return true;
    return signals.some(
      (s) => s.investorId === inv.id && s.type === "governance_management"
    );
  });
}

function predictVoting(investor) {
  const govSignals = getSignalsForInvestor(investor.id).filter(
    (s) => s.type === "governance_management"
  );
  const hasGovConcern = govSignals.length > 0;

  const issAligned =
    investor.type === "passive"
      ? "Generally aligned"
      : investor.type === "sovereign" || investor.type === "pension"
      ? "Policy-driven"
      : "Case-by-case";

  let boardVote = "For";
  if (hasGovConcern && govSignals.some((s) => s.headline.includes("diversity") || s.headline.includes("board"))) {
    boardVote = "At risk";
  }

  let compVote = "For";
  if (hasGovConcern && govSignals.some((s) => s.headline.includes("proxy") || s.headline.includes("compensation"))) {
    compVote = "Against";
  } else if (investor.type === "sovereign" || investor.type === "pension") {
    compVote = "Scrutinize";
  }

  const relatedActions = actions.filter(
    (a) => a.investorId === investor.id && a.type === "governance_management"
  );
  const engagementStatus =
    relatedActions.some((a) => a.state === "completed" || a.state === "awaiting_logging")
      ? "Completed"
      : relatedActions.some((a) => a.state === "in_progress" || a.state === "preparing")
      ? "In progress"
      : relatedActions.length > 0
      ? "Planned"
      : "Not started";

  const sensitivity =
    investor.type === "sovereign" || investor.type === "pension"
      ? "high"
      : hasGovConcern
      ? "medium"
      : "low";

  return {
    ...investor,
    sensitivity,
    issAligned,
    boardVote,
    compVote,
    engagementStatus,
  };
}

// ── Governance issues ───────────────────────────────────
const governanceIssues = [
  {
    id: "gi-001",
    topic: "Board Composition & Diversity",
    risk: "medium",
    description:
      "Gender diversity at 25% vs 33% peer median. CalPERS has explicitly flagged board diversity expectations in their annual letter.",
    status: "Engagement in progress",
  },
  {
    id: "gi-002",
    topic: "Executive Compensation",
    risk: "low",
    description:
      "BlackRock's updated proxy guidelines include enhanced pay-for-performance alignment expectations. Current alignment improving but below top quartile.",
    status: "Gap analysis planned",
  },
  {
    id: "gi-003",
    topic: "Climate & Sustainability",
    risk: "low",
    description:
      "Norges Bank received positive mention on sustainability. EU CSRD requirements finalized. Our climate disclosure roadmap is in good standing.",
    status: "Disclosure roadmap shared",
  },
];

// ── Historical voting ───────────────────────────────────
const historicalVoting = [
  {
    year: 2023,
    boardElection: 94.2,
    compensation: 78.5,
    auditorRatification: 99.1,
    shareholderProposal: 32.1,
  },
  {
    year: 2024,
    boardElection: 92.8,
    compensation: 72.3,
    auditorRatification: 98.7,
    shareholderProposal: 38.4,
  },
  {
    year: 2025,
    boardElection: 91.5,
    compensation: 68.9,
    auditorRatification: 99.3,
    shareholderProposal: 41.2,
  },
];

const sensitivityPillColors = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const statusIcons = {
  Completed: CheckCircle2,
  "In progress": Clock,
  Planned: Calendar,
  "Not started": AlertTriangle,
};

const statusColors = {
  Completed: "text-emerald-600",
  "In progress": "text-blue-600",
  Planned: "text-amber-600",
  "Not started": "text-slate-400",
};

export function AGMPage() {
  const govInvestors = useMemo(() => getGovernanceInvestors(), []);
  const votingPredictions = useMemo(
    () => govInvestors.map(predictVoting),
    [govInvestors]
  );

  const engagementsCompleted = useMemo(
    () =>
      votingPredictions.filter(
        (v) => v.engagementStatus === "Completed"
      ).length,
    [votingPredictions]
  );

  const openGovSignals = useMemo(
    () =>
      signals.filter(
        (s) =>
          s.type === "governance_management" &&
          s.state !== "resolved" &&
          s.state !== "dismissed"
      ).length,
    []
  );

  // Voting power disparity mock
  const classAVotes = 82;
  const classBVotes = 18;

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AGM Intelligence</h1>
        <p className="mt-1 text-sm text-slate-500">
          Proxy season preparation and governance risk management
        </p>
      </div>

      {/* ── Dark Hero: Days to AGM ────────────────────────── */}
      <div className="rounded-lg bg-slate-900 p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
          DAYS UNTIL AGM
        </p>
        <div className="mt-3 flex items-baseline gap-4">
          <span className="font-mono text-6xl font-bold text-white">{DAYS_TO_AGM}</span>
          <span className="text-sm font-medium text-emerald-400">
            {AGM_DATE} &middot; Annual General Meeting
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">GOVERNANCE INVESTORS</p>
            <p className="font-mono text-xl font-bold text-white mt-1">{govInvestors.length}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">ENGAGEMENTS DONE</p>
            <p className="font-mono text-xl font-bold text-emerald-400 mt-1">{engagementsCompleted}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">OPEN SIGNALS</p>
            <p className="font-mono text-xl font-bold text-amber-400 mt-1">{openGovSignals}</p>
          </div>
        </div>
      </div>

      {/* ── Process Roadmap (Vertical Timeline) ──────────── */}
      <Card variant="section" accentColor="blue" title="Process Roadmap" subtitle="AGM preparation phases and milestones">
        <div className="relative ml-4">
          {roadmapPhases.map((phase, idx) => {
            const isCompleted = phase.status === "completed";
            const isCurrent = phase.status === "current";
            const isLast = idx === roadmapPhases.length - 1;

            return (
              <div key={phase.id} className="relative flex gap-5 pb-8">
                {/* Vertical connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-[15px] top-[30px] bottom-0 w-0.5",
                      isCompleted ? "bg-emerald-300" : isCurrent ? "bg-blue-300" : "bg-slate-200"
                    )}
                  />
                )}

                {/* Dot / icon */}
                <div className="relative z-10 flex-shrink-0">
                  {isCompleted ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <CheckCircle2 size={16} />
                    </div>
                  ) : isCurrent ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white ring-4 ring-blue-100 animate-pulse">
                      <Clock size={16} />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={cn(
                  "flex-1 min-w-0",
                  isCurrent && "rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4 -mt-1"
                )}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={cn(
                      "text-sm font-semibold",
                      isCompleted ? "text-slate-500" : isCurrent ? "text-blue-900" : "text-slate-700"
                    )}>
                      {phase.label}
                    </h3>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em]",
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : isCurrent
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    )}>
                      {isCompleted ? "COMPLETED" : isCurrent ? "CURRENT" : "UPCOMING"}
                    </span>
                    <span className="font-mono text-xs text-slate-400 ml-auto">{phase.date}</span>
                  </div>
                  <p className={cn(
                    "text-xs leading-relaxed mt-1.5",
                    isCurrent ? "text-blue-800" : "text-slate-500"
                  )}>
                    {phase.description}
                  </p>
                  {phase.action && (
                    <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-blue-700 transition-colors">
                      <Eye size={13} />
                      {phase.action}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Voting Power Disparity ────────────────────────── */}
      <Card variant="section" accentColor="violet" title="Voting Power Disparity" subtitle="Share class voting weight distribution">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">CLASS A (1 VOTE/SHARE)</span>
              <span className="font-mono text-sm font-bold text-slate-900">{classAVotes}%</span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100">
              <div
                className="h-4 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${classAVotes}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">CLASS B (10 VOTES/SHARE)</span>
              <span className="font-mono text-sm font-bold text-slate-900">{classBVotes}%</span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100">
              <div
                className="h-4 rounded-full bg-violet-500 transition-all"
                style={{ width: `${classBVotes}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="font-mono text-xs text-slate-600">
              Class B holders control disproportionate voting power. Monitor insider voting intentions closely for contested resolutions.
            </p>
          </div>
        </div>
      </Card>

      {/* ── Governance Issue Tracker with SentimentMeter ──── */}
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          GOVERNANCE ISSUE TRACKER
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {governanceIssues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  {issue.topic}
                </h3>
                <span className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em]",
                  sensitivityPillColors[issue.risk]
                )}>
                  {issue.risk}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {issue.description}
              </p>

              {/* SentimentMeter for risk level */}
              <SentimentMeter
                value={issue.risk}
                label="Risk Level"
              />

              <div className="border-t border-slate-100 pt-3 mt-5">
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  STATUS
                </span>
                <p className="text-xs font-medium text-slate-700 mt-0.5">
                  {issue.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Predicted Voting Table ────────────────────────── */}
      <Card variant="section" accentColor="red" title="Predicted Voting Outcomes" subtitle={`Projected voting behavior for ${AGM_DATE} AGM`}>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["INVESTOR", "HOLDING", "SENSITIVITY", "ISS ALIGNMENT", "BOARD VOTE", "COMP VOTE", "ENGAGEMENT"].map((col) => (
                  <th key={col} className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {votingPredictions.map((inv) => {
                const StatusIcon = statusIcons[inv.engagementStatus] || AlertTriangle;
                return (
                  <tr key={inv.id}>
                    <td className="px-4 py-2.5">
                      <Link
                        to={`/investors/${inv.id}`}
                        className="font-medium text-slate-900 hover:text-slate-600 hover:underline"
                      >
                        {inv.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">
                      {inv.holdingPct}%
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase",
                          sensitivityPillColors[inv.sensitivity]
                        )}
                      >
                        {inv.sensitivity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 text-xs">
                      {inv.issAligned}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            inv.boardVote === "For"
                              ? "bg-emerald-500"
                              : inv.boardVote === "At risk"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium",
                            inv.boardVote === "For"
                              ? "text-emerald-600"
                              : inv.boardVote === "At risk"
                              ? "text-amber-600"
                              : "text-red-600"
                          )}
                        >
                          {inv.boardVote}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            inv.compVote === "For"
                              ? "bg-emerald-500"
                              : inv.compVote === "Against"
                              ? "bg-red-500"
                              : "bg-amber-500"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium",
                            inv.compVote === "For"
                              ? "text-emerald-600"
                              : inv.compVote === "Against"
                              ? "text-red-600"
                              : "text-amber-600"
                          )}
                        >
                          {inv.compVote}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium",
                          statusColors[inv.engagementStatus]
                        )}
                      >
                        <StatusIcon size={13} />
                        {inv.engagementStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Historical Voting ─────────────────────────────── */}
      <Card variant="section" accentColor="slate" title="Historical Voting Results" subtitle="AGM voting outcomes 2023-2025">
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["YEAR", "BOARD ELECTION", "COMPENSATION", "AUDITOR RATIFICATION", "SHAREHOLDER PROPOSAL"].map((col) => (
                  <th key={col} className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historicalVoting.map((row) => (
                <tr key={row.year}>
                  <td className="px-4 py-2.5 font-semibold text-slate-900 font-mono">
                    {row.year}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", row.boardElection >= 90 ? "bg-emerald-500" : "bg-amber-500")} />
                      <span className="font-mono font-medium text-slate-700">{row.boardElection}%</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", row.compensation >= 75 ? "bg-emerald-500" : row.compensation >= 60 ? "bg-amber-500" : "bg-red-500")} />
                      <span className="font-mono font-medium text-slate-700">{row.compensation}%</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-mono font-medium text-slate-700">{row.auditorRatification}%</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", row.shareholderProposal >= 50 ? "bg-red-500" : "bg-slate-400")} />
                      <span className="font-mono font-medium text-slate-700">{row.shareholderProposal}%</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trend alert */}
        <div className="mt-4 rounded-lg bg-slate-900 text-white p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
            TREND ALERT
          </p>
          <p className="text-sm leading-relaxed">
            Compensation approval has declined from{" "}
            <span className="font-mono font-semibold text-emerald-400">78.5%</span> to{" "}
            <span className="font-mono font-semibold text-red-400">68.9%</span> over 3 years.
            Shareholder proposal support is trending upward (
            <span className="font-mono font-semibold">32.1%</span> to{" "}
            <span className="font-mono font-semibold">41.2%</span>),
            approaching the 50% threshold. Proactive engagement on compensation
            structure recommended.
          </p>
        </div>
      </Card>
    </div>
  );
}
