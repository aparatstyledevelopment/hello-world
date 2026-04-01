import { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { cn } from "../lib/utils";
import {
  investors,
  signals,
  actions,
  timelineEvents,
} from "../data/mock-data";

// ── Color palette ──────────────────────────────────────────
const COLORS = {
  primary: "#3b82f6",
  secondary: "#6366f1",
  tertiary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  neutral: "#94a3b8",
};

const PIE_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.tertiary,
  COLORS.success,
  COLORS.warning,
];

const FUNNEL_SHADES = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

// ── Custom tooltip ─────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg bg-white shadow-lg border border-slate-200 p-3">
      {label && <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || entry.fill }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

// ── Chart card wrapper ─────────────────────────────────────
function ChartCard({ title, subtitle, children, className }) {
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white p-5", className)}>
      <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-1">
        {title}
      </h3>
      {subtitle && <p className="text-sm text-slate-500 mb-4">{subtitle}</p>}
      {children}
    </div>
  );
}

// ── Hero stat card ─────────────────────────────────────────
function HeroStat({ label, value, annotation }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold font-mono text-slate-900">{value}</p>
      {annotation && (
        <p className="mt-0.5 text-xs text-slate-500">{annotation}</p>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────
export function ReportsPage() {
  // ── Computed data ──────────────────────────────────────
  const engagement = useMemo(() => {
    const totalInteractions = timelineEvents.length;
    const byType = {};
    timelineEvents.forEach((e) => {
      byType[e.type] = (byType[e.type] || 0) + 1;
    });

    const investorOwners = {};
    investors.forEach((inv) => {
      investorOwners[inv.id] = inv.relationshipOwner;
    });
    const byTeam = {};
    timelineEvents.forEach((e) => {
      const owner = investorOwners[e.investorId] || "Unassigned";
      byTeam[owner] = (byTeam[owner] || 0) + 1;
    });

    const interactionCounts = {};
    timelineEvents.forEach((e) => {
      interactionCounts[e.investorId] = (interactionCounts[e.investorId] || 0) + 1;
    });
    const coverageGaps = investors.filter(
      (inv) => (interactionCounts[inv.id] || 0) <= 1
    );

    return { totalInteractions, byType, byTeam, coverageGaps };
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
      totalSignals > 0 ? Math.round((actioned / totalSignals) * 100) : 0;
    const completedActions = actions.filter((a) => a.state === "completed").length;
    const totalActions = actions.length;

    const workload = {};
    actions.forEach((a) => {
      const owner = a.owner;
      if (!workload[owner]) workload[owner] = { completed: 0, open: 0 };
      if (a.state === "completed") {
        workload[owner].completed += 1;
      } else {
        workload[owner].open += 1;
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

  const actionCompletionPct =
    effectiveness.totalActions > 0
      ? Math.round(
          (effectiveness.completedActions / effectiveness.totalActions) * 100
        )
      : 0;

  // ── Chart data ─────────────────────────────────────────

  // 1. Engagement trend (mock monthly data)
  const engagementTrendData = [
    { month: "Oct", count: 45 },
    { month: "Nov", count: 52 },
    { month: "Dec", count: 38 },
    { month: "Jan", count: 61 },
    { month: "Feb", count: 48 },
    { month: "Mar", count: 55 },
  ];

  // 2. Interactions by type (donut)
  const interactionsByType = Object.entries(engagement.byType).map(
    ([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    })
  );
  const totalInteractions = engagement.totalInteractions;

  // 3. Signal conversion funnel
  const funnelData = [
    { stage: "Generated", value: signals.length },
    {
      stage: "Reviewed",
      value: signals.filter(
        (s) => s.state !== "new"
      ).length,
    },
    {
      stage: "Confirmed",
      value: signals.filter(
        (s) => s.state === "confirmed" || s.state === "action_created" || s.state === "resolved"
      ).length,
    },
    {
      stage: "Actioned",
      value: signals.filter(
        (s) => s.state === "action_created" || s.state === "resolved"
      ).length,
    },
    {
      stage: "Resolved",
      value: signals.filter((s) => s.state === "resolved").length,
    },
  ];

  // 4. Team workload (grouped bars)
  const teamWorkloadData = Object.entries(effectiveness.workload).map(
    ([name, data]) => ({
      name,
      Completed: data.completed,
      Open: data.open,
    })
  );

  // 5. Ownership trend (top 3 investors over 6 quarters)
  const top3Investors = [...investors]
    .sort((a, b) => b.holdingPct - a.holdingPct)
    .slice(0, 3);
  const quarterLabels = ["Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26", "Q3 '26"];
  const ownershipTrendData = quarterLabels.map((quarter, i) => {
    const point = { quarter };
    top3Investors.forEach((inv) => {
      point[inv.name] = inv.holdingHistory[i];
    });
    return point;
  });
  const ownershipLineColors = [COLORS.primary, COLORS.secondary, COLORS.tertiary];

  // 6. Engagement by investor tier (radial bar)
  const tierCounts = { 1: 0, 2: 0, 3: 0 };
  timelineEvents.forEach((e) => {
    const inv = investors.find((i) => i.id === e.investorId);
    if (inv) tierCounts[inv.tier] = (tierCounts[inv.tier] || 0) + 1;
  });
  const tierRadialData = [
    { name: "Tier 3", value: tierCounts[3], fill: COLORS.tertiary },
    { name: "Tier 2", value: tierCounts[2], fill: COLORS.secondary },
    { name: "Tier 1", value: tierCounts[1], fill: COLORS.primary },
  ];

  // 7. Coverage gaps list
  const coverageGapInvestors = engagement.coverageGaps;

  // 8. Signal accuracy (confirmed + action_created + resolved / total)
  const confirmedSignals = signals.filter(
    (s) =>
      s.state === "confirmed" ||
      s.state === "action_created" ||
      s.state === "resolved"
  ).length;
  const signalAccuracyPct =
    signals.length > 0 ? Math.round((confirmedSignals / signals.length) * 100) : 0;
  const gaugeData = [
    { name: "Accuracy", value: signalAccuracyPct, fill: COLORS.success },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Reports &amp; Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Visual overview of engagement, ownership, signals, and team
          performance
        </p>
      </div>

      {/* ── Hero metrics row ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <HeroStat
          label="Total Interactions"
          value={engagement.totalInteractions}
          annotation="Last 6 months"
        />
        <HeroStat
          label="Signal Conversion"
          value={`${effectiveness.conversionRate}%`}
          annotation={`${effectiveness.actioned} of ${effectiveness.totalSignals} actioned`}
        />
        <HeroStat
          label="Action Completion"
          value={`${actionCompletionPct}%`}
          annotation={`${effectiveness.completedActions} / ${effectiveness.totalActions} done`}
        />
        <HeroStat
          label="Coverage Gaps"
          value={coverageGapInvestors.length}
          annotation={
            coverageGapInvestors.length > 0
              ? "Investors under-engaged"
              : "All investors covered"
          }
        />
      </div>

      {/* ── Chart grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Engagement Trend */}
        <ChartCard
          title="ENGAGEMENT TREND"
          subtitle="Monthly interaction count over last 6 months"
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={engagementTrendData}>
              <defs>
                <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Interactions"
                stroke={COLORS.primary}
                strokeWidth={2.5}
                fill="url(#areaBlue)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Interactions by Type (Donut) */}
        <ChartCard
          title="INTERACTIONS BY TYPE"
          subtitle="Breakdown of all engagement types"
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={interactionsByType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                animationDuration={1000}
              >
                {interactionsByType.map((_, i) => (
                  <Cell
                    key={i}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "#64748b" }}
              />
              {/* Center label */}
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold"
                fill="#0f172a"
              >
                {totalInteractions}
              </text>
              <text
                x="50%"
                y="56%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs"
                fill="#94a3b8"
              >
                Total
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Signal Conversion Funnel (horizontal bar) */}
        <ChartCard
          title="SIGNAL CONVERSION FUNNEL"
          subtitle="From detection through resolution"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelData} layout="vertical" barCategoryGap={8}>
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="stage"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                name="Signals"
                radius={[0, 4, 4, 0]}
                animationDuration={1000}
              >
                {funnelData.map((_, i) => (
                  <Cell key={i} fill={FUNNEL_SHADES[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Team Workload (grouped bar) */}
        <ChartCard
          title="TEAM WORKLOAD"
          subtitle="Completed vs open actions per team member"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={teamWorkloadData} barCategoryGap="20%">
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="Completed"
                fill={COLORS.success}
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
              <Bar
                dataKey="Open"
                fill={COLORS.warning}
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5. Ownership Trend (line chart) */}
        <ChartCard
          title="OWNERSHIP TREND"
          subtitle="Top 3 investors holding % over 6 quarters"
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ownershipTrendData}>
              <defs>
                {top3Investors.map((inv, i) => (
                  <linearGradient
                    key={inv.id}
                    id={`line-${inv.id}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor={ownershipLineColors[i]}
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="100%"
                      stopColor={ownershipLineColors[i]}
                      stopOpacity={1}
                    />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                dataKey="quarter"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                domain={["auto", "auto"]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              {top3Investors.map((inv, i) => (
                <Line
                  key={inv.id}
                  type="monotone"
                  dataKey={inv.name}
                  stroke={ownershipLineColors[i]}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: ownershipLineColors[i] }}
                  activeDot={{ r: 5 }}
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 6. Engagement by Investor Tier (radial bar) */}
        <ChartCard
          title="ENGAGEMENT BY INVESTOR TIER"
          subtitle="Interaction counts by tier classification"
        >
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="100%"
              data={tierRadialData}
              startAngle={180}
              endAngle={0}
              barSize={16}
            >
              <RadialBar
                background={{ fill: "#f1f5f9" }}
                dataKey="value"
                cornerRadius={8}
                animationDuration={1000}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 7. Coverage Gaps (stat card with list) */}
        <ChartCard
          title="COVERAGE GAPS"
          subtitle="Investors with minimal recent engagement"
        >
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0">
              <p className="text-5xl font-bold font-mono text-slate-900">
                {coverageGapInvestors.length}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                investors under-engaged
              </p>
            </div>
            <div className="flex-1 min-w-0">
              {coverageGapInvestors.length > 0 ? (
                <ul className="space-y-2">
                  {coverageGapInvestors.map((inv) => (
                    <li
                      key={inv.id}
                      className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {inv.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {inv.type} &middot; {inv.holdingPct}%
                        </p>
                      </div>
                      <span className="ml-2 flex-shrink-0 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 uppercase tracking-wider">
                        Gap
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 mt-4">
                  All investors have adequate engagement coverage.
                </p>
              )}
            </div>
          </div>
        </ChartCard>

        {/* 8. Signal Accuracy (half-donut gauge) */}
        <ChartCard
          title="SIGNAL ACCURACY"
          subtitle="Percentage of signals leading to confirmed actions"
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <defs>
                <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={COLORS.primary} stopOpacity={1} />
                </linearGradient>
              </defs>
              <Pie
                data={[
                  { name: "Accurate", value: signalAccuracyPct },
                  { name: "Remaining", value: 100 - signalAccuracyPct },
                ]}
                cx="50%"
                cy="70%"
                startAngle={180}
                endAngle={0}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={0}
                dataKey="value"
                animationDuration={1000}
              >
                <Cell fill="url(#gaugeGradient)" strokeWidth={0} />
                <Cell fill="#f1f5f9" strokeWidth={0} />
              </Pie>
              <text
                x="50%"
                y="65%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-3xl font-bold"
                fill="#0f172a"
              >
                {signalAccuracyPct}%
              </text>
              <text
                x="50%"
                y="78%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs"
                fill="#94a3b8"
              >
                {confirmedSignals} of {signals.length} signals confirmed
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
