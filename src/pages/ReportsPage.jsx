import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import {
  investors,
  signals,
  actions,
  timelineEvents,
} from "../data/mock-data";

// ── Collapsible Report Section ──────────────────────────
function ReportCard({ title, subtitle, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left p-5"
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
      {open && <div className="border-t border-slate-100 p-5 space-y-4">{children}</div>}
    </div>
  );
}

function StatGrid({ items }) {
  return (
    <div className={cn("grid gap-px bg-slate-100 rounded-lg overflow-hidden border border-slate-200", items.length <= 4 ? `grid-cols-${items.length}` : "grid-cols-4")}>
      {items.map((item) => (
        <div key={item.label} className="bg-white px-4 py-3 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
            {item.label}
          </p>
          <p className={cn("mt-1 text-lg font-bold text-slate-900", item.mono !== false && "font-mono")}>
            {item.value}
          </p>
          {item.highlight && (
            <p className="text-[11px] text-emerald-600 font-medium">{item.highlight}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 pt-2">
      {children}
    </h3>
  );
}

function MiniTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={cn("px-3 py-2 text-slate-700", j > 0 && typeof cell === "string" && (cell.includes("%") || !isNaN(cell)) && "font-mono")}>
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

function MetricRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-600">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold font-mono",
          highlight ? "text-slate-900" : "text-slate-900"
        )}
      >
        {value}
      </span>
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
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
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
        <StatGrid
          items={[
            { label: "Total Interactions", value: engagement.totalInteractions },
            { label: "By Type Categories", value: Object.keys(engagement.byType).length },
            { label: "Team Members", value: Object.keys(engagement.byTeam).length },
            { label: "Coverage Gaps", value: engagement.coverageGaps.length },
          ]}
        />

        <SectionHeading>Interactions by Type</SectionHeading>
        <MiniTable
          columns={["Type", "Count"]}
          rows={Object.entries(engagement.byType).map(([type, count]) => [
            type,
            String(count),
          ])}
        />

        <SectionHeading>Interactions by Team Member</SectionHeading>
        <MiniTable
          columns={["Team Member", "Interactions"]}
          rows={Object.entries(engagement.byTeam).map(([name, count]) => [
            name,
            String(count),
          ])}
        />

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
        <StatGrid
          items={[
            { label: "Total Tracked", value: `${ownership.totalHolding.toFixed(1)}%` },
            { label: "Top-5 Concentration", value: `${ownership.concentration.toFixed(1)}%` },
            { label: "Investor Types", value: Object.keys(ownership.byType).length },
            { label: "Notable Changes", value: ownership.changes.length },
          ]}
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
        <MiniTable
          columns={["Investor Type", "Holding %"]}
          rows={Object.entries(ownership.byType).map(([type, pct]) => [
            type,
            `${pct.toFixed(1)}%`,
          ])}
        />

        <SectionHeading>Notable Changes (6-month)</SectionHeading>
        {ownership.changes.length > 0 ? (
          <MiniTable
            columns={["Investor", "Change"]}
            rows={ownership.changes.map((c) => [
              c.name,
              `${c.change > 0 ? "+" : ""}${c.change.toFixed(1)}%`,
            ])}
          />
        ) : (
          <p className="text-sm text-slate-500">No significant changes.</p>
        )}
      </ReportCard>

      {/* ── Effectiveness Report ───────────────────────── */}
      <ReportCard
        title="Effectiveness Report"
        subtitle="Signal conversion, action outcomes, and team workload"
      >
        <StatGrid
          items={[
            { label: "Total Signals", value: effectiveness.totalSignals },
            { label: "Open Signals", value: effectiveness.openSignals },
            { label: "Actioned", value: effectiveness.actioned },
            { label: "Conversion Rate", value: `${effectiveness.conversionRate}%`, highlight: "Signal to action" },
          ]}
        />

        <SectionHeading>Action Outcomes</SectionHeading>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Completed actions</span>
            <span className="font-mono text-sm font-semibold text-slate-900">
              {effectiveness.completedActions} / {effectiveness.totalActions}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${effectiveness.totalActions > 0 ? (effectiveness.completedActions / effectiveness.totalActions) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <SectionHeading>Team Workload (Open Actions)</SectionHeading>
        <div className="space-y-3">
          {Object.entries(effectiveness.workload).map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-sm text-slate-600 w-32 truncate">{name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    count >= 4 ? "bg-red-500" : count >= 2 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{
                    width: `${Math.min(100, (count / 5) * 100)}%`,
                  }}
                />
              </div>
              <span className="font-mono text-xs font-semibold text-slate-700 w-6 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
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
        <MiniTable
          columns={["Topic", "Signals"]}
          rows={Object.entries(governance.topics).map(([topic, count]) => [
            topic,
            `${count}`,
          ])}
        />

        <SectionHeading>Engagement Status</SectionHeading>
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-3 text-center">
            <p className="font-mono text-xl font-bold text-emerald-600">
              {governance.engagementStatus.engaged}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mt-1">Engaged</p>
          </div>
          <div className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-3 text-center">
            <p className="font-mono text-xl font-bold text-slate-600">
              {governance.engagementStatus.neutral}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mt-1">Neutral</p>
          </div>
          <div className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-3 text-center">
            <p className="font-mono text-xl font-bold text-red-600">
              {governance.engagementStatus.atRisk}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mt-1">At Risk</p>
          </div>
        </div>

        {/* Voting risk recommendation */}
        <div className="rounded-lg bg-slate-800 text-white p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-1">
            VOTING RISK ASSESSMENT
          </p>
          <p className="text-sm leading-relaxed">
            <span className="font-mono font-semibold">{governance.votingRiskCount}</span> governance signals
            with elevated voting risk identified. Prioritize pre-AGM engagement with at-risk investors.
          </p>
        </div>
      </ReportCard>
    </div>
  );
}
