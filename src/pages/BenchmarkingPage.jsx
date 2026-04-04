import { useMemo } from "react";
import { cn } from "../lib/utils";
import { StatCard } from "../components/ui/StatCard";
import { Card } from "../components/ui/Card";
import { ActionCard } from "../components/ui/ActionCard";
import { HealthDots } from "../components/ui/HealthDots";
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

function HorizontalBar({ label, value, maxValue = 100, isOurs = false, status }) {
  const barColor = isOurs
    ? status === "above"
      ? "bg-zinc-900"
      : status === "below"
      ? "bg-red-500"
      : "bg-zinc-900"
    : "bg-zinc-300";
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span
        className={cn(
          "w-16 sm:w-28 md:w-44 text-xs sm:text-sm truncate",
          isOurs ? "font-semibold text-zinc-900" : "text-zinc-600"
        )}
      >
        {label}
        {isOurs && (
          <span className={cn(
            "ml-1.5 text-[10px] font-bold uppercase tracking-[0.1em]",
            status === "above" ? "text-zinc-700" : status === "below" ? "text-red-600" : "text-zinc-400"
          )}>
            YOU
          </span>
        )}
      </span>
      <div className="flex-1 h-2.5 rounded-full bg-zinc-100">
        <div
          className={cn(
            "h-2.5 rounded-full transition-all",
            barColor,
            isOurs && "ring-2 ring-offset-1",
            isOurs && status === "above" && "ring-zinc-300",
            isOurs && status === "below" && "ring-red-200"
          )}
          style={{ width: `${(value / maxValue) * 100}%` }}
        />
      </div>
      <span
        className={cn(
          "w-10 text-right font-mono text-sm font-medium",
          isOurs
            ? status === "below"
              ? "text-red-600 font-bold"
              : "text-zinc-900 font-bold"
            : "text-zinc-500"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function BenchmarkingPage({ embedded = false }) {
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

  const sectorMedian = peers.find((p) => p.name === "Sector Median");

  const allEntries = [{ ...ourMetrics, isOurs: true }, ...peers.map((p) => ({ ...p, isOurs: false }))];

  const engagementStatus = sectorMedian
    ? ourMetrics.engagementIntensity >= sectorMedian.engagementIntensity ? "above" : "below"
    : "neutral";
  const stabilityStatus = sectorMedian
    ? ourMetrics.shareholderStability >= sectorMedian.shareholderStability ? "above" : "below"
    : "neutral";

  const belowCount = [engagementStatus, stabilityStatus].filter((s) => s === "below").length;

  const insights = useMemo(() => {
    const negatives = [];
    const positives = [];
    const neutrals = [];

    if (sectorMedian) {
      if (ourMetrics.engagementIntensity > sectorMedian.engagementIntensity) {
        positives.push({
          text: `Our engagement intensity (${ourMetrics.engagementIntensity}) is above the sector median (${sectorMedian.engagementIntensity}), indicating strong investor outreach relative to peers.`,
          status: "positive",
        });
      } else {
        negatives.push({
          text: `Our engagement intensity (${ourMetrics.engagementIntensity}) is below the sector median (${sectorMedian.engagementIntensity}). Consider increasing interaction frequency.`,
          status: "negative",
        });
      }

      if (ourMetrics.shareholderStability > sectorMedian.shareholderStability) {
        positives.push({
          text: `Shareholder stability at ${ourMetrics.shareholderStability}% exceeds the sector median (${sectorMedian.shareholderStability}%), suggesting a loyal investor base.`,
          status: "positive",
        });
      } else {
        negatives.push({
          text: `Shareholder stability at ${ourMetrics.shareholderStability}% is below the sector median (${sectorMedian.shareholderStability}%). Retention efforts should be prioritized.`,
          status: "negative",
        });
      }

      if (ourMetrics.passivePct > sectorMedian.passivePct) {
        neutrals.push({
          text: `Passive ownership concentration (${ourMetrics.passivePct}%) is higher than the sector median (${sectorMedian.passivePct}%). This reduces activist risk but limits engagement-driven influence.`,
          status: "neutral",
        });
      }
    }

    const highOverlap = peers.filter((p) => p.ownershipOverlap >= 70);
    if (highOverlap.length > 0) {
      neutrals.push({
        text: `High ownership overlap (>70%) with ${highOverlap.map((p) => p.name).join(", ")} means shared investor preferences likely apply.`,
        status: "neutral",
      });
    }

    return [...negatives, ...neutrals, ...positives];
  }, [ourMetrics, sectorMedian]);

  const insightDotColor = {
    positive: "bg-zinc-900",
    negative: "bg-red-500",
    neutral: "bg-zinc-400",
  };

  return (
    <div className={embedded ? "space-y-5" : "p-4 md:p-6 space-y-5"}>
      {/* Header */}
      {!embedded && (
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-zinc-900">Peer Benchmarking</h1>
          <p className="mt-1 text-sm text-zinc-500">
            How you compare, where you excel, and where to improve
          </p>
        </div>
      )}

      {/* ── Dark Concentration-style Card ─────────────────── */}
      <div className="rounded-2xl bg-zinc-900 p-5 shadow-sm border border-zinc-200/60">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400">
          PEER POSITION INDEX
        </p>
        <div className="mt-3 flex items-baseline gap-4">
          <span className="font-mono text-3xl md:text-5xl font-bold text-white">
            {ourMetrics.engagementIntensity}%
          </span>
          <span className={cn(
            "text-sm font-medium",
            engagementStatus === "above" ? "text-zinc-300" : "text-red-400"
          )}>
            Engagement intensity
          </span>
        </div>
        <div className="mt-4 h-2.5 w-full rounded-full bg-zinc-700">
          <div
            className={cn(
              "h-2.5 rounded-full transition-all",
              engagementStatus === "above" ? "bg-white" : "bg-red-500"
            )}
            style={{ width: `${ourMetrics.engagementIntensity}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          {engagementStatus === "above" ? (
            <>
              <span className="font-mono font-semibold text-white">Above</span> sector median ({sectorMedian?.engagementIntensity}%) — strong relative positioning
            </>
          ) : (
            <>
              <span className="font-mono font-semibold text-red-400">Below</span> sector median ({sectorMedian?.engagementIntensity}%) — improvement opportunity identified
            </>
          )}
        </p>
      </div>

      {/* ── Summary Stats ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Engagement Intensity"
          value={`${ourMetrics.engagementIntensity}%`}
          annotation={`${engagementStatus === "above" ? "Above" : "Below"} sector median (${sectorMedian?.engagementIntensity}%)`}
          annotationColor={engagementStatus === "above" ? "gray" : "red"}
        />
        <StatCard
          label="Shareholder Stability"
          value={`${ourMetrics.shareholderStability}%`}
          annotation={`${stabilityStatus === "above" ? "Above" : "Below"} sector median (${sectorMedian?.shareholderStability}%)`}
          annotationColor={stabilityStatus === "above" ? "gray" : "red"}
        />
        <StatCard
          label="Areas to Improve"
          value={belowCount}
          annotation="Below sector average"
          annotationColor={belowCount > 0 ? "red" : "gray"}
        />
        <StatCard
          label="Peers Tracked"
          value={peers.length}
          annotation="Including sector median"
        />
      </div>

      {/* ── Two-column Comparison Table ───────────────────── */}
      <Card variant="section" accentColor="gray" title="Ownership Overlap" subtitle="Common institutional investors shared with peers">
        <div className="overflow-x-auto rounded-xl border border-zinc-200/60 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                {["COMPANY", "OVERLAP %", "ENGAGEMENT INTENSITY", "STABILITY"].map((col) => (
                  <th key={col} className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {allEntries.map((entry) => (
                <tr
                  key={entry.name}
                  className={cn(
                    entry.isOurs && "bg-zinc-900 text-white"
                  )}
                >
                  <td className={cn("px-4 py-2.5", entry.isOurs ? "font-bold text-white" : "text-zinc-700")}>
                    {entry.name}
                    {entry.isOurs && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400">
                        YOU
                      </span>
                    )}
                  </td>
                  <td className={cn("px-4 py-2.5 font-mono", entry.isOurs ? "text-zinc-300" : "text-zinc-700")}>
                    {entry.ownershipOverlap}%
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      "font-mono",
                      entry.isOurs
                        ? engagementStatus === "above"
                          ? "text-zinc-300 font-bold"
                          : "text-red-400 font-bold"
                        : "text-zinc-700"
                    )}>
                      {entry.engagementIntensity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      "font-mono",
                      entry.isOurs
                        ? stabilityStatus === "above"
                          ? "text-zinc-300 font-bold"
                          : "text-red-400 font-bold"
                        : "text-zinc-700"
                    )}>
                      {entry.shareholderStability}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Engagement Intensity + Shareholder Stability - Two Columns ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="section" accentColor="gray" title="Engagement Intensity" subtitle="Score reflecting interaction frequency and quality">
          <div className="space-y-1">
            {allEntries
              .sort((a, b) => b.engagementIntensity - a.engagementIntensity)
              .map((entry) => (
                <HorizontalBar
                  key={entry.name}
                  label={entry.name}
                  value={entry.engagementIntensity}
                  isOurs={entry.isOurs}
                  status={entry.isOurs ? engagementStatus : undefined}
                />
              ))}
          </div>
        </Card>

        <Card variant="section" accentColor="gray" title="Shareholder Stability" subtitle="Percentage of shareholders with stable or growing positions">
          <div className="space-y-1">
            {allEntries
              .sort((a, b) => b.shareholderStability - a.shareholderStability)
              .map((entry) => (
                <HorizontalBar
                  key={entry.name}
                  label={entry.name}
                  value={entry.shareholderStability}
                  isOurs={entry.isOurs}
                  status={entry.isOurs ? stabilityStatus : undefined}
                />
              ))}
          </div>
        </Card>
      </div>

      {/* ── Ownership Structure - Stacked Bars ────────────── */}
      <Card variant="section" accentColor="gray" title="Ownership Structure" subtitle="Breakdown by investor type">
        <div className="mb-3 flex gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-zinc-900" /> Passive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-zinc-500" /> Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-zinc-400" /> Sovereign
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-zinc-300" /> Other
          </span>
        </div>
        <div className="space-y-2">
          {allEntries.map((entry) => {
            const segments = [entry.passivePct, entry.activePct, entry.sovereignPct, entry.otherPct];
            const colors = ["bg-zinc-900", "bg-zinc-500", "bg-zinc-400", "bg-zinc-300"];
            return (
              <div key={entry.name} className="flex items-center gap-3 py-1.5">
                <span
                  className={cn(
                    "w-16 sm:w-28 md:w-44 text-xs sm:text-sm truncate",
                    entry.isOurs ? "font-semibold text-zinc-900" : "text-zinc-600"
                  )}
                >
                  {entry.name}
                  {entry.isOurs && (
                    <span className="ml-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">
                      YOU
                    </span>
                  )}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-zinc-100 flex overflow-hidden">
                  {segments.map((seg, i) => (
                    <div
                      key={i}
                      className={cn("h-2.5 first:rounded-l-full last:rounded-r-full", colors[i])}
                      style={{ width: `${seg}%` }}
                      title={`${seg}%`}
                    />
                  ))}
                </div>
                <span className="w-10 text-right font-mono text-xs text-zinc-500">
                  {segments[0]}%
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Key Insights (problems first) ─────────────────── */}
      <Card variant="section" accentColor="gray" title="Key Insights" subtitle="Auto-generated peer analysis (issues first)">
        <ul className="space-y-3">
          {insights.map((insight, i) => (
            <li
              key={i}
              className={cn(
                "flex gap-3 text-sm rounded-xl px-3 py-2.5",
                insight.status === "negative"
                  ? "bg-red-50 text-red-800 font-medium"
                  : insight.status === "positive"
                  ? "text-zinc-600"
                  : "text-zinc-600"
              )}
            >
              <span
                className={cn(
                  "mt-1.5 flex-shrink-0 rounded-full",
                  insightDotColor[insight.status],
                  insight.status === "negative" ? "h-3 w-3" : "h-2 w-2"
                )}
              />
              <span className="leading-relaxed">{insight.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* ── Recommendation ────────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900 text-white p-5 shadow-sm border border-zinc-200/60">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400 mb-2">
          RECOMMENDATION
        </p>
        <p className="text-sm leading-relaxed">
          {belowCount > 0 ? (
            <>
              <span className="font-bold text-red-400">{belowCount} metric{belowCount > 1 ? "s" : ""} below sector average.</span>{" "}
            </>
          ) : null}
          Focus engagement efforts on differentiating from peers with high ownership overlap.
          Your shareholder stability and engagement metrics should be monitored quarterly against
          sector benchmarks to track competitive positioning.
        </p>
      </div>
    </div>
  );
}
