import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "../lib/utils";
import { StatCard } from "../components/ui/StatCard";
import { investors, signals, actions, getSignalsForInvestor } from "../data/mock-data";

// ── AGM config ──────────────────────────────────────────
const AGM_DATE = "2026-05-03";
const DAYS_TO_AGM = 32;

// ── Governance investors (sovereign, pension, or with gov signals) ──
function getGovernanceInvestors() {
  return investors.filter((inv) => {
    if (inv.type === "sovereign" || inv.type === "pension") return true;
    return signals.some(
      (s) => s.investorId === inv.id && s.type === "governance_management"
    );
  });
}

// ── Predicted voting ────────────────────────────────────
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

const riskDotColors = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AGM Intelligence</h1>
        <p className="mt-1 text-sm text-slate-500">
          Proxy season preparation and governance risk management
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard value={DAYS_TO_AGM} label="Days to AGM" trend="down" />
        <StatCard value={govInvestors.length} label="Governance investors" />
        <StatCard
          value={engagementsCompleted}
          label="Engagements completed"
          trend="up"
        />
        <StatCard value={openGovSignals} label="Open signals" />
      </div>

      {/* Predicted Voting Table */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
            Predicted Voting Outcomes
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Projected voting behavior for {AGM_DATE} AGM
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
                  Holding
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Sensitivity
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  ISS Alignment
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Board Vote
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Comp Vote
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Engagement
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {votingPredictions.map((inv) => {
                const StatusIcon =
                  statusIcons[inv.engagementStatus] || AlertTriangle;
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
                            "h-1.5 w-1.5 rounded-full",
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
                            "h-1.5 w-1.5 rounded-full",
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
      </div>

      {/* Governance Issue Tracker */}
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          Governance Issue Tracker
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
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      riskDotColors[issue.risk]
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium capitalize",
                      issue.risk === "high"
                        ? "text-red-600"
                        : issue.risk === "medium"
                        ? "text-amber-600"
                        : "text-emerald-600"
                    )}
                  >
                    {issue.risk} risk
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {issue.description}
              </p>
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Status
                </span>
                <p className="text-xs font-medium text-slate-700 mt-0.5">
                  {issue.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-AGM Engagement Plan */}
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-3">
          Pre-AGM Engagement Plan
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {votingPredictions.map((inv) => {
            const govSignals = getSignalsForInvestor(inv.id).filter(
              (s) => s.type === "governance_management"
            );
            const relatedActions = actions.filter(
              (a) =>
                a.investorId === inv.id &&
                (a.type === "governance_management" ||
                  a.type === "relationship_maintenance")
            );

            return (
              <div
                key={inv.id}
                className="rounded-lg border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                    {inv.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <Link
                      to={`/investors/${inv.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-slate-600 hover:underline"
                    >
                      {inv.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {inv.type} &middot;{" "}
                      <span className="font-mono">{inv.holdingPct}%</span>
                    </p>
                  </div>
                </div>

                {/* Key concerns */}
                {govSignals.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                      Key Topics
                    </span>
                    <ul className="mt-1.5 space-y-1.5">
                      {govSignals.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-start gap-1.5 text-xs text-slate-600"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                          {s.headline}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                {relatedActions.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {relatedActions.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5"
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full flex-shrink-0",
                            act.state === "completed"
                              ? "bg-emerald-500"
                              : act.state === "in_progress"
                              ? "bg-blue-500"
                              : "bg-slate-400"
                          )}
                        />
                        <span className="text-xs text-slate-600 truncate">
                          {act.objective}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {govSignals.length === 0 && relatedActions.length === 0 && (
                  <p className="text-xs text-slate-400 italic">
                    No specific governance concerns identified
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Voting */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
            Historical Voting Results
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            AGM voting outcomes 2023-2025
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Year
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Board Election
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Compensation
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Auditor Ratification
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Shareholder Proposal
                </th>
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
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          row.boardElection >= 90
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        )}
                      />
                      <span className="font-mono font-medium text-slate-700">
                        {row.boardElection}%
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          row.compensation >= 75
                            ? "bg-emerald-500"
                            : row.compensation >= 60
                            ? "bg-amber-500"
                            : "bg-red-500"
                        )}
                      />
                      <span className="font-mono font-medium text-slate-700">
                        {row.compensation}%
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="font-mono font-medium text-slate-700">
                        {row.auditorRatification}%
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          row.shareholderProposal >= 50
                            ? "bg-red-500"
                            : "bg-slate-400"
                        )}
                      />
                      <span className="font-mono font-medium text-slate-700">
                        {row.shareholderProposal}%
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trend alert recommendation */}
        <div className="mt-4 rounded-lg bg-slate-800 text-white p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-1">
            TREND ALERT
          </p>
          <p className="text-sm leading-relaxed">
            Compensation approval has declined from{" "}
            <span className="font-mono font-semibold">78.5%</span> to{" "}
            <span className="font-mono font-semibold">68.9%</span> over 3 years.
            Shareholder proposal support is trending upward (
            <span className="font-mono font-semibold">32.1%</span> to{" "}
            <span className="font-mono font-semibold">41.2%</span>),
            approaching the 50% threshold. Proactive engagement on compensation
            structure recommended.
          </p>
        </div>
      </div>
    </div>
  );
}
