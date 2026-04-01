import { useState, useMemo } from "react";
import { BarChart3, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  investors,
  signals,
  actions,
  timelineEvents,
  owners,
} from "../data/mock-data";

// ── Collapsible Report Section ──────────────────────────
function ReportCard({ title, subtitle, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {open ? (
          <ChevronDown size={18} className="text-slate-400" />
        ) : (
          <ChevronRight size={18} className="text-slate-400" />
        )}
      </button>
      {open && <div className="mt-4 space-y-4">{children}</div>}
    </Card>
  );
}

function MetricRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-600">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold",
          highlight ? "text-primary-600" : "text-slate-900"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 pt-2">
      {children}
    </h3>
  );
}

function MiniTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-left text-xs font-medium text-slate-400"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReportsPage() {
  // ── Computed data ───────────────────────────────────────
  const engagement = useMemo(() => {
    const allEvents = timelineEvents;
    const totalInteractions = allEvents.length;
    const byType = {};
    const byTeam = {};
    allEvents.forEach((e) => {
      byType[e.type] = (byType[e.type] || 0) + 1;
    });

    // Derive "team" from owner mapping
    const investorOwners = {};
    investors.forEach((inv) => {
      investorOwners[inv.id] = inv.relationshipOwner;
    });
    allEvents.forEach((e) => {
      const owner = investorOwners[e.investorId] || "Unassigned";
      byTeam[owner] = (byTeam[owner] || 0) + 1;
    });

    // Coverage gaps: investors with 0 or 1 interactions
    const interactionCounts = {};
    allEvents.forEach((e) => {
      interactionCounts[e.investorId] = (interactionCounts[e.investorId] || 0) + 1;
    });
    const coverageGaps = investors.filter(
      (inv) => (interactionCounts[inv.id] || 0) <= 1
    );

    return { totalInteractions, byType, byTeam, coverageGaps };
  }, []);

  const ownership = useMemo(() => {
    const totalHolding = investors.reduce((s, i) => s + i.holdingPct, 0);
    const byType = {};
    investors.forEach((inv) => {
      const t = inv.type;
      byType[t] = (byType[t] || 0) + inv.holdingPct;
    });

    const top5 = [...investors]
      .sort((a, b) => b.holdingPct - a.holdingPct)
      .slice(0, 5);
    const concentration = top5.reduce((s, i) => s + i.holdingPct, 0);

    const changes = investors
      .map((inv) => {
        const h = inv.holdingHistory;
        const change = h[h.length - 1] - h[0];
        return { name: inv.name, change };
      })
      .filter((c) => Math.abs(c.change) > 0.1)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    return { totalHolding, byType, top5, concentration, changes };
  }, []);

  const effectiveness = useMemo(() => {
    const totalSignals = signals.length;
    const openSignals = signals.filter(
      (s) => s.state !== "resolved" && s.state !== "dismissed"
    ).length;
    const actioned = signals.filter(
      (s) => s.state === "action_created" || s.state === "confirmed"
    ).length;
    const conversionRate =
      totalSignals > 0
        ? Math.round((actioned / totalSignals) * 100)
        : 0;

    const completedActions = actions.filter((a) => a.state === "completed").length;
    const totalActions = actions.length;

    const workload = {};
    actions.forEach((a) => {
      if (a.state !== "completed") {
        workload[a.owner] = (workload[a.owner] || 0) + 1;
      }
    });

    return {
      totalSignals,
      openSignals,
      actioned,
      conversionRate,
      completedActions,
      totalActions,
      workload,
    };
  }, []);

  const governance = useMemo(() => {
    const govSignals = signals.filter(
      (s) => s.type === "governance_management"
    );

    const sensitiveInvestors = investors.filter((inv) => {
      return (
        inv.type === "sovereign" ||
        inv.type === "pension" ||
        signals.some(
          (s) =>
            s.investorId === inv.id && s.type === "governance_management"
        )
      );
    });

    const topics = {};
    govSignals.forEach((s) => {
      const topic = s.headline.includes("proxy")
        ? "Proxy Voting"
        : s.headline.includes("diversity") || s.headline.includes("board")
        ? "Board Diversity"
        : s.headline.includes("climate") || s.headline.includes("ESG")
        ? "Climate & ESG"
        : "General Governance";
      topics[topic] = (topics[topic] || 0) + 1;
    });

    const engagementStatus = {
      engaged: sensitiveInvestors.filter(
        (i) => i.engagementMomentum === "positive"
      ).length,
      neutral: sensitiveInvestors.filter(
        (i) => i.engagementMomentum === "neutral"
      ).length,
      atRisk: sensitiveInvestors.filter(
        (i) => i.engagementMomentum === "negative"
      ).length,
    };

    const votingRiskCount = govSignals.filter(
      (s) => s.urgency === "high" || s.urgency === "medium"
    ).length;

    return { govSignals, sensitiveInvestors, topics, engagementStatus, votingRiskCount };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Reports</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Comprehensive analytics across engagement, ownership, effectiveness,
          and governance
        </p>
      </div>

      {/* ── Engagement Report ──────────────────────────── */}
      <ReportCard
        title="Engagement Report"
        subtitle="Interaction analytics and coverage analysis"
        defaultOpen={true}
      >
        <MetricRow
          label="Total interactions (timeline events)"
          value={engagement.totalInteractions}
        />

        <SectionHeading>By Type</SectionHeading>
        {Object.entries(engagement.byType).map(([type, count]) => (
          <MetricRow key={type} label={type} value={count} />
        ))}

        <SectionHeading>By Team Member</SectionHeading>
        {Object.entries(engagement.byTeam).map(([name, count]) => (
          <MetricRow key={name} label={name} value={count} />
        ))}

        <SectionHeading>Coverage Gaps</SectionHeading>
        {engagement.coverageGaps.length > 0 ? (
          <MiniTable
            columns={["Investor", "Type", "Holding", "Interactions"]}
            rows={engagement.coverageGaps.map((inv) => [
              inv.name,
              inv.type,
              `${inv.holdingPct}%`,
              String(
                timelineEvents.filter((e) => e.investorId === inv.id).length
              ),
            ])}
          />
        ) : (
          <p className="text-sm text-slate-500">No coverage gaps detected.</p>
        )}
      </ReportCard>

      {/* ── Ownership Report ───────────────────────────── */}
      <ReportCard
        title="Ownership Report"
        subtitle="Shareholder structure and concentration analysis"
      >
        <MetricRow
          label="Total tracked ownership"
          value={`${ownership.totalHolding.toFixed(1)}%`}
        />

        <SectionHeading>Ownership Structure</SectionHeading>
        <MiniTable
          columns={["Investor", "Type", "Holding %", "Trend"]}
          rows={[...investors]
            .sort((a, b) => b.holdingPct - a.holdingPct)
            .map((inv) => [
              inv.name,
              inv.type,
              `${inv.holdingPct}%`,
              inv.holdingTrend === "up"
                ? "+Increasing"
                : inv.holdingTrend === "down"
                ? "-Decreasing"
                : "Stable",
            ])}
        />

        <SectionHeading>By Type</SectionHeading>
        {Object.entries(ownership.byType).map(([type, pct]) => (
          <MetricRow key={type} label={type} value={`${pct.toFixed(1)}%`} />
        ))}

        <MetricRow
          label="Top-5 concentration"
          value={`${ownership.concentration.toFixed(1)}%`}
          highlight
        />

        <SectionHeading>Notable Changes (6-month)</SectionHeading>
        {ownership.changes.length > 0 ? (
          ownership.changes.map((c) => (
            <MetricRow
              key={c.name}
              label={c.name}
              value={`${c.change > 0 ? "+" : ""}${c.change.toFixed(1)}%`}
            />
          ))
        ) : (
          <p className="text-sm text-slate-500">No significant changes.</p>
        )}
      </ReportCard>

      {/* ── Effectiveness Report ───────────────────────── */}
      <ReportCard
        title="Effectiveness Report"
        subtitle="Signal conversion, action outcomes, and team workload"
      >
        <MetricRow label="Total signals" value={effectiveness.totalSignals} />
        <MetricRow label="Open signals" value={effectiveness.openSignals} />
        <MetricRow
          label="Actioned signals"
          value={effectiveness.actioned}
        />
        <MetricRow
          label="Signal conversion rate"
          value={`${effectiveness.conversionRate}%`}
          highlight
        />

        <SectionHeading>Action Outcomes</SectionHeading>
        <MetricRow
          label="Completed actions"
          value={`${effectiveness.completedActions} / ${effectiveness.totalActions}`}
        />

        <SectionHeading>Team Workload (Open Actions)</SectionHeading>
        {Object.entries(effectiveness.workload).map(([name, count]) => (
          <div key={name} className="flex items-center gap-3 py-1.5">
            <span className="text-sm text-slate-600 w-28">{name}</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-2 rounded-full",
                  count >= 4 ? "bg-red-500" : count >= 2 ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{
                  width: `${Math.min(100, (count / 5) * 100)}%`,
                }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700 w-6 text-right">
              {count}
            </span>
          </div>
        ))}
      </ReportCard>

      {/* ── Governance Report ──────────────────────────── */}
      <ReportCard
        title="Governance Report"
        subtitle="Governance-sensitive investors and voting risk analysis"
      >
        <SectionHeading>Sensitive Investors</SectionHeading>
        <MiniTable
          columns={["Investor", "Type", "Holding", "Momentum"]}
          rows={governance.sensitiveInvestors.map((inv) => [
            inv.name,
            inv.type,
            `${inv.holdingPct}%`,
            inv.engagementMomentum,
          ])}
        />

        <SectionHeading>Governance Topics</SectionHeading>
        {Object.entries(governance.topics).map(([topic, count]) => (
          <MetricRow key={topic} label={topic} value={`${count} signal${count !== 1 ? "s" : ""}`} />
        ))}

        <SectionHeading>Engagement Status</SectionHeading>
        <div className="flex gap-4">
          <div className="flex-1 rounded-lg bg-emerald-50 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-emerald-700">
              {governance.engagementStatus.engaged}
            </p>
            <p className="text-[11px] text-emerald-600">Engaged</p>
          </div>
          <div className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-slate-700">
              {governance.engagementStatus.neutral}
            </p>
            <p className="text-[11px] text-slate-500">Neutral</p>
          </div>
          <div className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-red-700">
              {governance.engagementStatus.atRisk}
            </p>
            <p className="text-[11px] text-red-600">At Risk</p>
          </div>
        </div>

        <MetricRow
          label="Signals with voting risk"
          value={governance.votingRiskCount}
          highlight
        />
      </ReportCard>
    </div>
  );
}
