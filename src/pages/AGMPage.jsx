import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Vote,
  Calendar,
  Users,
  MessageSquare,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/ui/StatCard";
import { investors, signals, actions, getSignalsForInvestor } from "../data/mock-data";

const TODAY = new Date("2026-04-01");

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
  const momentum = investor.engagementMomentum;

  // ISS alignment heuristic
  const issAligned =
    investor.type === "passive"
      ? "Generally aligned"
      : investor.type === "sovereign" || investor.type === "pension"
      ? "Policy-driven"
      : "Case-by-case";

  // Board vote prediction
  let boardVote = "For";
  if (hasGovConcern && govSignals.some((s) => s.headline.includes("diversity") || s.headline.includes("board"))) {
    boardVote = "At risk";
  }

  // Compensation vote prediction
  let compVote = "For";
  if (hasGovConcern && govSignals.some((s) => s.headline.includes("proxy") || s.headline.includes("compensation"))) {
    compVote = "Against";
  } else if (investor.type === "sovereign" || investor.type === "pension") {
    compVote = "Scrutinize";
  }

  // Engagement status
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

const riskColors = {
  high: "bg-red-50 text-red-700 ring-red-600/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
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
        <h1 className="text-xl font-bold text-slate-900">AGM Intelligence</h1>
        <p className="mt-0.5 text-sm text-slate-500">
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
      <Card
        title="Predicted Voting Outcomes"
        subtitle={`Projected voting behavior for ${AGM_DATE} AGM`}
      >
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">
                  Investor
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">
                  Holding
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">
                  Sensitivity
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">
                  ISS Alignment
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">
                  Board Vote
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">
                  Compensation Vote
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">
                  Engagement
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {votingPredictions.map((inv) => {
                const StatusIcon =
                  statusIcons[inv.engagementStatus] || AlertTriangle;
                return (
                  <tr key={inv.id}>
                    <td className="px-4 py-2.5">
                      <Link
                        to={`/investors/${inv.id}`}
                        className="font-medium text-slate-900 hover:text-primary-600 hover:underline"
                      >
                        {inv.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {inv.holdingPct}%
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={inv.sensitivity}>
                        {inv.sensitivity}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {inv.issAligned}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          inv.boardVote === "For"
                            ? "text-emerald-600"
                            : inv.boardVote === "At risk"
                            ? "text-amber-600"
                            : "text-red-600"
                        )}
                      >
                        {inv.boardVote}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          inv.compVote === "For"
                            ? "text-emerald-600"
                            : inv.compVote === "Against"
                            ? "text-red-600"
                            : "text-amber-600"
                        )}
                      >
                        {inv.compVote}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium",
                          statusColors[inv.engagementStatus]
                        )}
                      >
                        <StatusIcon size={14} />
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

      {/* Governance Issue Tracker */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Governance Issue Tracker
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {governanceIssues.map((issue) => (
            <Card key={issue.id}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  {issue.topic}
                </h3>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize whitespace-nowrap",
                    riskColors[issue.risk]
                  )}
                >
                  {issue.risk} risk
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {issue.description}
              </p>
              <div className="border-t border-slate-100 pt-2">
                <span className="text-xs text-slate-500">
                  Status:{" "}
                  <span className="font-medium text-slate-700">
                    {issue.status}
                  </span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pre-AGM Engagement Plan */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
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
              <Card key={inv.id}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {inv.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <Link
                      to={`/investors/${inv.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-primary-600 hover:underline"
                    >
                      {inv.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {inv.type} &middot; {inv.holdingPct}%
                    </p>
                  </div>
                </div>

                {/* Key concerns */}
                {govSignals.length > 0 && (
                  <div className="mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Key Topics
                    </span>
                    <ul className="mt-1 space-y-1">
                      {govSignals.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-start gap-1.5 text-xs text-slate-600"
                        >
                          <AlertTriangle
                            size={12}
                            className="mt-0.5 flex-shrink-0 text-amber-500"
                          />
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
              </Card>
            );
          })}
        </div>
      </div>

      {/* Historical Voting */}
      <Card
        title="Historical Voting Results"
        subtitle="AGM voting outcomes 2023-2025"
      >
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">
                  Year
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">
                  Board Election
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">
                  Compensation
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">
                  Auditor Ratification
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">
                  Shareholder Proposal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historicalVoting.map((row) => (
                <tr key={row.year}>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">
                    {row.year}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "font-medium",
                        row.boardElection >= 90
                          ? "text-emerald-600"
                          : "text-amber-600"
                      )}
                    >
                      {row.boardElection}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "font-medium",
                        row.compensation >= 75
                          ? "text-emerald-600"
                          : row.compensation >= 60
                          ? "text-amber-600"
                          : "text-red-600"
                      )}
                    >
                      {row.compensation}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-emerald-600">
                      {row.auditorRatification}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "font-medium",
                        row.shareholderProposal >= 50
                          ? "text-red-600"
                          : "text-slate-600"
                      )}
                    >
                      {row.shareholderProposal}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trend note */}
        <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Trend alert:</span> Compensation
            approval has declined from 78.5% to 68.9% over 3 years.
            Shareholder proposal support is trending upward (32.1% to 41.2%),
            approaching the 50% threshold.
          </p>
        </div>
      </Card>
    </div>
  );
}
