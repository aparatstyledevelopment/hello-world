import { useMemo } from "react";
import { cn } from "../lib/utils";
import { StatCard } from "../components/ui/StatCard";
import { investors } from "../data/mock-data";

// ── Peer benchmark data (inline mock) ───────────────────
const peers = [
  {
    name: "Peer A (ABC Corp)",
    ownershipOverlap: 72,
    engagementIntensity: 85,
    shareholderStability: 78,
    passivePct: 42,
    activePct: 38,
    sovereignPct: 12,
    otherPct: 8,
  },
  {
    name: "Peer B (XYZ Corp)",
    ownershipOverlap: 65,
    engagementIntensity: 62,
    shareholderStability: 70,
    passivePct: 48,
    activePct: 32,
    sovereignPct: 8,
    otherPct: 12,
  },
  {
    name: "Peer C (DEF Inc)",
    ownershipOverlap: 58,
    engagementIntensity: 45,
    shareholderStability: 82,
    passivePct: 55,
    activePct: 25,
    sovereignPct: 10,
    otherPct: 10,
  },
  {
    name: "Sector Median",
    ownershipOverlap: 60,
    engagementIntensity: 55,
    shareholderStability: 72,
    passivePct: 50,
    activePct: 30,
    sovereignPct: 10,
    otherPct: 10,
  },
];

function HorizontalBar({ label, value, maxValue = 100, isOurs = false }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span
        className={cn(
          "w-44 text-sm truncate",
          isOurs ? "font-semibold text-slate-900" : "text-slate-600"
        )}
      >
        {label}
        {isOurs && (
          <span className="ml-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
            YOU
          </span>
        )}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100">
        <div
          className={cn(
            "h-1.5 rounded-full transition-all",
            isOurs ? "bg-slate-900" : "bg-slate-300"
          )}
          style={{ width: `${(value / maxValue) * 100}%` }}
        />
      </div>
      <span
        className={cn(
          "w-10 text-right font-mono text-sm font-medium",
          isOurs ? "text-slate-900" : "text-slate-500"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function StackedBar({ label, segments, isOurs = false }) {
  const colors = ["bg-sky-400", "bg-violet-400", "bg-indigo-400", "bg-slate-300"];
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span
        className={cn(
          "w-44 text-sm truncate",
          isOurs ? "font-semibold text-slate-900" : "text-slate-600"
        )}
      >
        {label}
        {isOurs && (
          <span className="ml-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
            YOU
          </span>
        )}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 flex overflow-hidden">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={cn("h-1.5 first:rounded-l-full last:rounded-r-full", colors[i])}
            style={{ width: `${seg}%` }}
            title={`${seg}%`}
          />
        ))}
      </div>
      <span className="w-10 text-right font-mono text-xs text-slate-500">
        {segments[0]}%
      </span>
    </div>
  );
}

export function BenchmarkingPage() {
  // Derive "our" metrics from mock data
  const ourMetrics = useMemo(() => {
    const totalHolding = investors.reduce((s, i) => s + i.holdingPct, 0);
    const byType = { passive: 0, active: 0, sovereign: 0, pension: 0 };
    investors.forEach((inv) => {
      if (byType[inv.type] !== undefined) {
        byType[inv.type] += inv.holdingPct;
      }
    });

    const passivePct = Math.round((byType.passive / totalHolding) * 100);
    const activePct = Math.round((byType.active / totalHolding) * 100);
    const sovereignPct = Math.round((byType.sovereign / totalHolding) * 100);
    const otherPct = Math.round((byType.pension / totalHolding) * 100);

    const positiveCount = investors.filter(
      (i) => i.engagementMomentum === "positive"
    ).length;
    const engagementIntensity = Math.round(
      (positiveCount / investors.length) * 100
    );

    const stableCount = investors.filter(
      (i) => i.holdingTrend === "neutral" || i.holdingTrend === "up"
    ).length;
    const shareholderStability = Math.round(
      (stableCount / investors.length) * 100
    );

    return {
      name: "Our Company",
      ownershipOverlap: 100,
      engagementIntensity,
      shareholderStability,
      passivePct,
      activePct,
      sovereignPct,
      otherPct,
    };
  }, []);

  const allEntries = [{ ...ourMetrics, isOurs: true }, ...peers.map((p) => ({ ...p, isOurs: false }))];

  // Auto-generated insights
  const insights = useMemo(() => {
    const bullets = [];
    const sectorMedian = peers.find((p) => p.name === "Sector Median");

    if (sectorMedian) {
      if (ourMetrics.engagementIntensity > sectorMedian.engagementIntensity) {
        bullets.push({
          text: `Our engagement intensity (${ourMetrics.engagementIntensity}) is above the sector median (${sectorMedian.engagementIntensity}), indicating strong investor outreach relative to peers.`,
          status: "positive",
        });
      } else {
        bullets.push({
          text: `Our engagement intensity (${ourMetrics.engagementIntensity}) is below the sector median (${sectorMedian.engagementIntensity}). Consider increasing interaction frequency.`,
          status: "negative",
        });
      }

      if (ourMetrics.shareholderStability > sectorMedian.shareholderStability) {
        bullets.push({
          text: `Shareholder stability at ${ourMetrics.shareholderStability}% exceeds the sector median (${sectorMedian.shareholderStability}%), suggesting a loyal investor base.`,
          status: "positive",
        });
      } else {
        bullets.push({
          text: `Shareholder stability at ${ourMetrics.shareholderStability}% is below the sector median (${sectorMedian.shareholderStability}%). Retention efforts should be prioritized.`,
          status: "negative",
        });
      }

      if (ourMetrics.passivePct > sectorMedian.passivePct) {
        bullets.push({
          text: `Passive ownership concentration (${ourMetrics.passivePct}%) is higher than the sector median (${sectorMedian.passivePct}%). This reduces activist risk but limits engagement-driven influence.`,
          status: "neutral",
        });
      }
    }

    const highOverlap = peers.filter((p) => p.ownershipOverlap >= 70);
    if (highOverlap.length > 0) {
      bullets.push({
        text: `High ownership overlap (>70%) with ${highOverlap.map((p) => p.name).join(", ")} means shared investor preferences likely apply.`,
        status: "neutral",
      });
    }

    return bullets;
  }, [ourMetrics]);

  const insightDotColor = {
    positive: "bg-emerald-500",
    negative: "bg-red-500",
    neutral: "bg-amber-500",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Peer Benchmarking</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare your IR metrics against sector peers
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          value={`${ourMetrics.engagementIntensity}%`}
          label="Engagement intensity"
          trend={ourMetrics.engagementIntensity >= 55 ? "up" : "down"}
        />
        <StatCard
          value={`${ourMetrics.shareholderStability}%`}
          label="Shareholder stability"
          trend={ourMetrics.shareholderStability >= 72 ? "up" : "down"}
        />
        <StatCard
          value={peers.length}
          label="Peer companies"
        />
        <StatCard
          value={`${ourMetrics.passivePct}%`}
          label="Passive ownership"
        />
      </div>

      {/* Ownership Overlap Table */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
            Ownership Overlap
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Common institutional investors shared with peers
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Company
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Overlap %
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Engagement Intensity
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  Stability
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allEntries.map((entry) => (
                <tr
                  key={entry.name}
                  className={entry.isOurs ? "bg-slate-50" : ""}
                >
                  <td
                    className={cn(
                      "px-4 py-2.5",
                      entry.isOurs
                        ? "font-semibold text-slate-900"
                        : "text-slate-700"
                    )}
                  >
                    {entry.name}
                    {entry.isOurs && (
                      <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
                        YOU
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-700">
                    {entry.ownershipOverlap}%
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-700">
                    {entry.engagementIntensity}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-700">
                    {entry.shareholderStability}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engagement Intensity Bars */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
            Engagement Intensity
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Score reflecting interaction frequency and quality
          </p>
        </div>
        <div className="space-y-1">
          {allEntries
            .sort((a, b) => b.engagementIntensity - a.engagementIntensity)
            .map((entry) => (
              <HorizontalBar
                key={entry.name}
                label={entry.name}
                value={entry.engagementIntensity}
                isOurs={entry.isOurs}
              />
            ))}
        </div>
      </div>

      {/* Shareholder Stability Bars */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
            Shareholder Stability
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Percentage of shareholders with stable or growing positions
          </p>
        </div>
        <div className="space-y-1">
          {allEntries
            .sort((a, b) => b.shareholderStability - a.shareholderStability)
            .map((entry) => (
              <HorizontalBar
                key={entry.name}
                label={entry.name}
                value={entry.shareholderStability}
                isOurs={entry.isOurs}
              />
            ))}
        </div>
      </div>

      {/* Ownership Structure - Stacked Bars */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
            Ownership Structure
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Breakdown by investor type
          </p>
        </div>
        <div className="mb-3 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-400" /> Passive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-violet-400" /> Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-400" /> Sovereign
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" /> Other
          </span>
        </div>
        <div className="space-y-1">
          {allEntries.map((entry) => (
            <StackedBar
              key={entry.name}
              label={entry.name}
              segments={[
                entry.passivePct,
                entry.activePct,
                entry.sovereignPct,
                entry.otherPct,
              ]}
              isOurs={entry.isOurs}
            />
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
            Key Insights
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Auto-generated peer analysis
          </p>
        </div>
        <ul className="space-y-3">
          {insights.map((insight, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700">
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 rounded-full flex-shrink-0",
                  insightDotColor[insight.status]
                )}
              />
              <span className="leading-relaxed">{insight.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      <div className="rounded-lg bg-slate-800 text-white p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
          RECOMMENDATION
        </p>
        <p className="text-sm leading-relaxed">
          Focus engagement efforts on differentiating from peers with high ownership overlap.
          Your shareholder stability and engagement metrics should be monitored quarterly against
          sector benchmarks to track competitive positioning.
        </p>
      </div>
    </div>
  );
}
