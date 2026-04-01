import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { StatCard } from "../components/ui/StatCard";
import { Card } from "../components/ui/Card";
import { Table } from "../components/ui/Table";
import { HealthDots } from "../components/ui/HealthDots";
import {
  investors,
  signals,
  actions,
  timelineEvents,
} from "../data/mock-data";

// ── Collapsible Report Section ──────────────────────────
function ReportSection({ title, subtitle, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn(
      "rounded-lg border border-slate-200 bg-white overflow-hidden",
      "border-l-4 border-l-blue-500"
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left px-6 py-5"
      >
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
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
      {open && <div className="border-t border-slate-100 px-6 py-5 space-y-5">{children}</div>}
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

    const investorOwners = {};
    investors.forEach((inv) => {
      investorOwners[inv.id] = inv.relationshipOwner;
    });
    allEvents.forEach((e) => {
      const owner = investorOwners[e.investorId] || "Unassigned";
      byTeam[owner] = (byTeam[owner] || 0) + 1;
    });

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

  const actionCompletionPct = effectiveness.totalActions > 0
    ? Math.round((effectiveness.completedActions / effectiveness.totalActions) * 100)
    : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Key metrics at a glance, then drill into any report for details
        </p>
      </div>

      {/* ── HERO METRICS (dark StatCards) ─────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          variant="dark"
          label="Signal Conversion Rate"
          value={`${effectiveness.conversionRate}%`}
          annotation={`${effectiveness.actioned} of ${effectiveness.totalSignals} signals actioned`}
        />
        <StatCard
          variant="dark"
          label="Coverage Gaps"
          value={engagement.coverageGaps.length}
          annotation={engagement.coverageGaps.length > 0 ? "Investors under-engaged" : "All investors covered"}
        />
        <StatCard
          variant="dark"
          label="Gov. At Risk"
          value={governance.engagementStatus.atRisk}
          annotation={`of ${governance.sensitiveInvestors.length} governance-sensitive`}
        />
        <StatCard
          variant="dark"
          label="Action Completion"
          value={`${actionCompletionPct}%`}
          annotation={`${effectiveness.completedActions} / ${effectiveness.totalActions} actions done`}
        />
      </div>

      {/* ── Engagement Report ──────────────────────────── */}
      <ReportSection
        title="Engagement Report"
        subtitle="Interaction analytics and coverage analysis"
        defaultOpen={true}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
          {[
            { label: "Total Interactions", value: engagement.totalInteractions },
            { label: "By Type Categories", value: Object.keys(engagement.byType).length },
            { label: "Team Members", value: Object.keys(engagement.byTeam).length },
            { label: "Coverage Gaps", value: engagement.coverageGaps.length },
          ].map((item) => (
            <div key={item.label} className="bg-white px-4 py-3 text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-bold font-mono text-slate-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <SectionHeading>Interactions by Type</SectionHeading>
        <MiniTable
          columns={["TYPE", "COUNT"]}
          rows={Object.entries(engagement.byType).map(([type, count]) => [
            type,
            String(count),
          ])}
        />

        <SectionHeading>Interactions by Team Member</SectionHeading>
        <MiniTable
          columns={["TEAM MEMBER", "INTERACTIONS"]}
          rows={Object.entries(engagement.byTeam).map(([name, count]) => [
            name,
            String(count),
          ])}
        />

        <SectionHeading>Coverage Gaps</SectionHeading>
        {engagement.coverageGaps.length > 0 ? (
          <MiniTable
            columns={["INVESTOR", "TYPE", "HOLDING", "INTERACTIONS"]}
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
      </ReportSection>

      {/* ── Ownership Report ───────────────────────────── */}
      <ReportSection
        title="Ownership Report"
        subtitle="Shareholder structure and concentration analysis"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
          {[
            { label: "Total Tracked", value: `${ownership.totalHolding.toFixed(1)}%` },
            { label: "Top-5 Concentration", value: `${ownership.concentration.toFixed(1)}%` },
            { label: "Investor Types", value: Object.keys(ownership.byType).length },
            { label: "Notable Changes", value: ownership.changes.length },
          ].map((item) => (
            <div key={item.label} className="bg-white px-4 py-3 text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-bold font-mono text-slate-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <SectionHeading>Ownership Structure</SectionHeading>
        <MiniTable
          columns={["INVESTOR", "TYPE", "HOLDING %", "TREND"]}
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
          columns={["INVESTOR TYPE", "HOLDING %"]}
          rows={Object.entries(ownership.byType).map(([type, pct]) => [
            type,
            `${pct.toFixed(1)}%`,
          ])}
        />

        <SectionHeading>Notable Changes (6-month)</SectionHeading>
        {ownership.changes.length > 0 ? (
          <MiniTable
            columns={["INVESTOR", "CHANGE"]}
            rows={ownership.changes.map((c) => [
              c.name,
              `${c.change > 0 ? "+" : ""}${c.change.toFixed(1)}%`,
            ])}
          />
        ) : (
          <p className="text-sm text-slate-500">No significant changes.</p>
        )}
      </ReportSection>

      {/* ── Effectiveness Report ───────────────────────── */}
      <ReportSection
        title="Effectiveness Report"
        subtitle="Signal conversion, action outcomes, and team workload"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
          {[
            { label: "Total Signals", value: effectiveness.totalSignals },
            { label: "Open Signals", value: effectiveness.openSignals },
            { label: "Actioned", value: effectiveness.actioned },
            { label: "Conversion Rate", value: `${effectiveness.conversionRate}%` },
          ].map((item) => (
            <div key={item.label} className="bg-white px-4 py-3 text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-bold font-mono text-slate-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <SectionHeading>Action Outcomes</SectionHeading>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Completed actions</span>
            <span className="font-mono text-sm font-semibold text-slate-900">
              {effectiveness.completedActions} / {effectiveness.totalActions}
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
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
      </ReportSection>

      {/* ── Governance Report ──────────────────────────── */}
      <ReportSection
        title="Governance Report"
        subtitle="Governance-sensitive investors and voting risk analysis"
      >
        <SectionHeading>Sensitive Investors</SectionHeading>
        <MiniTable
          columns={["INVESTOR", "TYPE", "HOLDING", "MOMENTUM"]}
          rows={governance.sensitiveInvestors.map((inv) => [
            inv.name,
            inv.type,
            `${inv.holdingPct}%`,
            inv.engagementMomentum,
          ])}
        />

        <SectionHeading>Governance Topics</SectionHeading>
        <MiniTable
          columns={["TOPIC", "SIGNALS"]}
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
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mt-1">ENGAGED</p>
          </div>
          <div className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-3 text-center">
            <p className="font-mono text-xl font-bold text-slate-600">
              {governance.engagementStatus.neutral}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mt-1">NEUTRAL</p>
          </div>
          <div className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-3 text-center">
            <p className="font-mono text-xl font-bold text-red-600">
              {governance.engagementStatus.atRisk}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mt-1">AT RISK</p>
          </div>
        </div>

        {/* Voting risk recommendation */}
        <div className="rounded-lg bg-slate-900 text-white p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
            VOTING RISK ASSESSMENT
          </p>
          <p className="text-sm leading-relaxed">
            <span className="font-mono font-semibold text-emerald-400">{governance.votingRiskCount}</span> governance signals
            with elevated voting risk identified. Prioritize pre-AGM engagement with at-risk investors.
          </p>
        </div>
      </ReportSection>
    </div>
  );
}
