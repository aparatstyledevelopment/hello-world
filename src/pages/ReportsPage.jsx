import { useState, useMemo } from "react";
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
  primary: "#09090b",
  secondary: "#3f3f46",
  tertiary: "#71717a",
  success: "#a1a1aa",
  warning: "#d4d4d8",
  danger: "#ef4444",
  neutral: "#a1a1aa",
};

const PIE_COLORS = ["#09090b", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8"];
const FUNNEL_SHADES = ["#09090b", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-2xl bg-white shadow-lg border border-zinc-200 p-3">
      {label && <p className="text-xs font-medium text-zinc-500 mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || entry.fill }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

const reportCategories = [
  { key: "engagement", label: "Engagement" },
  { key: "signals", label: "Signal Intelligence" },
  { key: "ownership", label: "Ownership" },
  { key: "team", label: "Team Performance" },
];

// ── Main page ──────────────────────────────────────────────
export function ReportsPage() {
  const [activeCategory, setActiveCategory] = useState("engagement");

  // ── Computed data ──────────────────────────────────────
  const engagement = useMemo(() => {
    const totalInteractions = timelineEvents.length;
    const byType = {};
    timelineEvents.forEach((e) => { byType[e.type] = (byType[e.type] || 0) + 1; });

    const investorOwners = {};
    investors.forEach((inv) => { investorOwners[inv.id] = inv.relationshipOwner; });
    const byTeam = {};
    timelineEvents.forEach((e) => {
      const owner = investorOwners[e.investorId] || "Unassigned";
      byTeam[owner] = (byTeam[owner] || 0) + 1;
    });

    const interactionCounts = {};
    timelineEvents.forEach((e) => { interactionCounts[e.investorId] = (interactionCounts[e.investorId] || 0) + 1; });
    const coverageGaps = investors.filter((inv) => (interactionCounts[inv.id] || 0) <= 1);

    return { totalInteractions, byType, byTeam, coverageGaps };
  }, []);

  const effectiveness = useMemo(() => {
    const totalSignals = signals.length;
    const openSignals = signals.filter((s) => s.state !== "resolved" && s.state !== "dismissed").length;
    const actioned = signals.filter((s) => s.state === "action_created" || s.state === "confirmed").length;
    const conversionRate = totalSignals > 0 ? Math.round((actioned / totalSignals) * 100) : 0;
    const completedActions = actions.filter((a) => a.state === "completed").length;
    const totalActions = actions.length;

    const workload = {};
    actions.forEach((a) => {
      if (!workload[a.owner]) workload[a.owner] = { completed: 0, open: 0 };
      if (a.state === "completed") workload[a.owner].completed += 1;
      else workload[a.owner].open += 1;
    });

    return { totalSignals, openSignals, actioned, conversionRate, completedActions, totalActions, workload };
  }, []);

  const actionCompletionPct = effectiveness.totalActions > 0
    ? Math.round((effectiveness.completedActions / effectiveness.totalActions) * 100) : 0;

  // ── Chart data ─────────────────────────────────────────
  const engagementTrendData = [
    { month: "Oct", count: 45 }, { month: "Nov", count: 52 }, { month: "Dec", count: 38 },
    { month: "Jan", count: 61 }, { month: "Feb", count: 48 }, { month: "Mar", count: 55 },
  ];

  const interactionsByType = Object.entries(engagement.byType).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1), value: count,
  }));

  const funnelData = [
    { stage: "Generated", value: signals.length },
    { stage: "Reviewed", value: signals.filter((s) => s.state !== "new").length },
    { stage: "Confirmed", value: signals.filter((s) => s.state === "confirmed" || s.state === "action_created" || s.state === "resolved").length },
    { stage: "Actioned", value: signals.filter((s) => s.state === "action_created" || s.state === "resolved").length },
    { stage: "Resolved", value: signals.filter((s) => s.state === "resolved").length },
  ];

  const teamWorkloadData = Object.entries(effectiveness.workload).map(([name, data]) => ({
    name, Completed: data.completed, Open: data.open,
  }));

  const top3Investors = [...investors].sort((a, b) => b.holdingPct - a.holdingPct).slice(0, 3);
  const quarterLabels = ["Q2 '25", "Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26", "Q3 '26"];
  const ownershipTrendData = quarterLabels.map((quarter, i) => {
    const point = { quarter };
    top3Investors.forEach((inv) => { point[inv.name] = inv.holdingHistory[i]; });
    return point;
  });
  const ownershipLineColors = ["#09090b", "#3f3f46", "#71717a"];

  const tierCounts = { 1: 0, 2: 0, 3: 0 };
  timelineEvents.forEach((e) => {
    const inv = investors.find((i) => i.id === e.investorId);
    if (inv) tierCounts[inv.tier] = (tierCounts[inv.tier] || 0) + 1;
  });

  const confirmedSignals = signals.filter((s) => s.state === "confirmed" || s.state === "action_created" || s.state === "resolved").length;
  const signalAccuracyPct = signals.length > 0 ? Math.round((confirmedSignals / signals.length) * 100) : 0;

  // Narrative helpers
  const highUrgencySignals = signals.filter((s) => s.urgency === "high");
  const mostEngagedInvestor = [...investors].sort((a, b) => {
    const aCount = timelineEvents.filter((e) => e.investorId === a.id).length;
    const bCount = timelineEvents.filter((e) => e.investorId === b.id).length;
    return bCount - aCount;
  })[0];
  const mostEngagedCount = timelineEvents.filter((e) => e.investorId === mostEngagedInvestor?.id).length;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Reports & Analytics</h1>
        <p className="mt-0.5 text-sm text-zinc-400">
          Narrative intelligence across engagement, signals, ownership, and team performance
        </p>
      </div>

      {/* Category tabs */}
      <div className="border-b border-zinc-200">
        <div className="flex gap-6">
          {reportCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "relative pb-3 text-xs font-medium transition-colors rounded-xl",
                activeCategory === cat.key
                  ? "text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {cat.label}
              {activeCategory === cat.key && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-zinc-900" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── ENGAGEMENT REPORT ─────────────────────────────── */}
      {activeCategory === "engagement" && (
        <div className="space-y-5">
          {/* Narrative */}
          <div className="rounded-2xl bg-zinc-900 p-5 shadow-sm border border-zinc-200/60">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-2">ENGAGEMENT NARRATIVE</p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Over the past 6 months, the IR team logged <span className="font-bold text-white">{engagement.totalInteractions} interactions</span> across
              {" "}{investors.length} tracked investors. <span className="font-bold text-white">{mostEngagedInvestor?.name}</span> received the most
              attention with {mostEngagedCount} touchpoints.
              {engagement.coverageGaps.length > 0 && (
                <> However, <span className="font-bold text-zinc-300">{engagement.coverageGaps.length} investor{engagement.coverageGaps.length > 1 ? "s" : ""}</span> show
                coverage gaps with minimal recent engagement, representing a combined <span className="font-bold text-zinc-300">
                {engagement.coverageGaps.reduce((s, i) => s + i.holdingPct, 0).toFixed(1)}%</span> of tracked ownership.</>
              )}
            </p>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Total Interactions</p>
              <p className="mt-1 font-mono text-2xl font-bold text-zinc-900">{engagement.totalInteractions}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Most Active</p>
              <p className="mt-1 text-sm font-bold text-zinc-900">{mostEngagedInvestor?.name}</p>
              <p className="text-xs text-zinc-400">{mostEngagedCount} touchpoints</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Coverage Gaps</p>
              <p className={cn("mt-1 font-mono text-2xl font-bold", engagement.coverageGaps.length > 0 ? "text-red-600" : "text-zinc-900")}>{engagement.coverageGaps.length}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Avg per Investor</p>
              <p className="mt-1 font-mono text-2xl font-bold text-zinc-900">{(engagement.totalInteractions / investors.length).toFixed(1)}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-1">ENGAGEMENT TREND</p>
              <p className="text-xs text-zinc-400 mb-3">Monthly interaction volume — March saw a recovery from the December low, driven by year-end governance meetings and Q1 planning outreach.</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={engagementTrendData}>
                  <defs>
                    <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#09090b" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#09090b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Interactions" stroke="#09090b" strokeWidth={2.5} fill="url(#areaBlue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-1">INTERACTIONS BY TYPE</p>
              <p className="text-xs text-zinc-400 mb-3">Meetings and emails dominate the engagement mix. Signal-driven interactions are growing as the intelligence engine matures.</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={interactionsByType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {interactionsByType.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#3f3f46" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Coverage gaps detail */}
          {engagement.coverageGaps.length > 0 && (
            <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50 p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-700 mb-2">COVERAGE GAP DETAIL</p>
              <p className="text-xs text-zinc-500 mb-3">These investors have received minimal engagement and may require proactive outreach to prevent relationship decay.</p>
              <div className="space-y-2">
                {engagement.coverageGaps.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-2xl bg-white border border-zinc-200/60 px-4 py-2.5 shadow-sm">
                    <div>
                      <p className="text-sm font-medium text-zinc-800">{inv.name}</p>
                      <p className="text-xs text-zinc-400">{inv.type} &middot; Tier {inv.tier}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-zinc-900">{inv.holdingPct}%</p>
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 uppercase">Gap</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SIGNAL INTELLIGENCE REPORT ────────────────────── */}
      {activeCategory === "signals" && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-zinc-900 p-5 shadow-sm border border-zinc-200/60">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-2">SIGNAL INTELLIGENCE NARRATIVE</p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              The intelligence engine generated <span className="font-bold text-white">{signals.length} signals</span> this quarter,
              with a <span className="font-bold text-white">{signalAccuracyPct}% confirmation rate</span>.
              {highUrgencySignals.length > 0 && (
                <> <span className="font-bold text-red-400">{highUrgencySignals.length} high-urgency signal{highUrgencySignals.length > 1 ? "s" : ""}</span> flagged
                immediate retention risks, primarily around position reductions detected via 13F analysis.
                </>
              )}
              {" "}The conversion funnel shows {effectiveness.conversionRate}% of signals ultimately driving action — a strong indicator that
              the signal ranking algorithm is surfacing genuinely actionable intelligence.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Generated</p>
              <p className="mt-1 font-mono text-2xl font-bold text-zinc-900">{signals.length}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Accuracy</p>
              <p className="mt-1 font-mono text-2xl font-bold text-zinc-900">{signalAccuracyPct}%</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">High Urgency</p>
              <p className={cn("mt-1 font-mono text-2xl font-bold", highUrgencySignals.length > 0 ? "text-red-600" : "text-zinc-900")}>{highUrgencySignals.length}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Conversion</p>
              <p className="mt-1 font-mono text-2xl font-bold text-zinc-900">{effectiveness.conversionRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-1">CONVERSION FUNNEL</p>
              <p className="text-xs text-zinc-400 mb-3">Each stage represents progressive validation. The drop from Generated to Reviewed reflects automated filtering, while Confirmed to Actioned shows team prioritization.</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={funnelData} layout="vertical" barCategoryGap={8}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: "#3f3f46", fontSize: 12 }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Signals" radius={[0, 4, 4, 0]}>
                    {funnelData.map((_, i) => (<Cell key={i} fill={FUNNEL_SHADES[i]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-1">SIGNAL ACCURACY GAUGE</p>
              <p className="text-xs text-zinc-400 mb-3">{confirmedSignals} of {signals.length} signals were confirmed as actionable, demonstrating strong signal quality from the intelligence engine.</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={[{ name: "Accurate", value: signalAccuracyPct }, { name: "Remaining", value: 100 - signalAccuracyPct }]}
                    cx="50%" cy="70%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={90} paddingAngle={0} dataKey="value">
                    <Cell fill="#09090b" strokeWidth={0} />
                    <Cell fill="#f4f4f5" strokeWidth={0} />
                  </Pie>
                  <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold" fill="#09090b">{signalAccuracyPct}%</text>
                  <text x="50%" y="78%" textAnchor="middle" dominantBaseline="middle" className="text-xs" fill="#a1a1aa">confirmed</text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── OWNERSHIP REPORT ──────────────────────────────── */}
      {activeCategory === "ownership" && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-zinc-900 p-5 shadow-sm border border-zinc-200/60">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-2">OWNERSHIP NARRATIVE</p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              The tracked shareholder base comprises <span className="font-bold text-white">{investors.length} investors</span> holding
              a combined <span className="font-bold text-white">{investors.reduce((s, i) => s + i.holdingPct, 0).toFixed(1)}%</span> of outstanding shares.
              {" "}<span className="font-bold text-white">{top3Investors[0]?.name}</span> remains the largest holder
              at {top3Investors[0]?.holdingPct}%.
              {investors.filter((i) => i.holdingTrend === "down").length > 0 && (
                <> Notably, <span className="font-bold text-red-400">{investors.filter((i) => i.holdingTrend === "down").length} investors</span> show
                declining positions, representing a combined {investors.filter((i) => i.holdingTrend === "down").reduce((s, i) => s + i.holdingPct, 0).toFixed(1)}% at risk
                of further reduction.</>
              )}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Total Ownership</p>
              <p className="mt-1 font-mono text-2xl font-bold text-zinc-900">{investors.reduce((s, i) => s + i.holdingPct, 0).toFixed(1)}%</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Increasing</p>
              <p className="mt-1 font-mono text-2xl font-bold text-zinc-900">{investors.filter((i) => i.holdingTrend === "up").length}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Decreasing</p>
              <p className="mt-1 font-mono text-2xl font-bold text-red-600">{investors.filter((i) => i.holdingTrend === "down").length}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Tier 1 Share</p>
              <p className="mt-1 font-mono text-2xl font-bold text-zinc-900">
                {investors.filter((i) => i.tier === 1).reduce((s, i) => s + i.holdingPct, 0).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-1">OWNERSHIP TREND</p>
            <p className="text-xs text-zinc-400 mb-3">
              BlackRock continues its steady accumulation, while Vanguard's position has flattened after earlier reductions.
              Wellington's consistent buying signals growing conviction in the investment thesis.
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={ownershipTrendData}>
                <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} domain={["auto", "auto"]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                {top3Investors.map((inv, i) => (
                  <Line key={inv.id} type="monotone" dataKey={inv.name} stroke={ownershipLineColors[i]} strokeWidth={2.5}
                    dot={{ r: 3, fill: ownershipLineColors[i] }} activeDot={{ r: 5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Investor breakdown */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">INVESTOR POSITION DETAILS</p>
            </div>
            <div className="divide-y divide-zinc-100">
              {[...investors].sort((a, b) => b.holdingPct - a.holdingPct).map((inv) => (
                <div key={inv.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-600 flex-shrink-0">
                    {inv.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800">{inv.name}</p>
                    <p className="text-xs text-zinc-400">{inv.type} &middot; Tier {inv.tier}</p>
                  </div>
                  <div className="w-24">
                    <div className="h-1.5 rounded-full bg-zinc-100">
                      <div className="h-1.5 rounded-full bg-zinc-900" style={{ width: `${(inv.holdingPct / 10) * 100}%` }} />
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-zinc-900 w-14 text-right">{inv.holdingPct}%</span>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                    inv.holdingTrend === "up" ? "bg-zinc-100 text-zinc-700" :
                    inv.holdingTrend === "down" ? "bg-red-50 text-red-700" : "bg-zinc-100 text-zinc-600"
                  )}>
                    {inv.holdingTrend === "up" ? "\u2191" : inv.holdingTrend === "down" ? "\u2193" : "\u2192"} {inv.holdingTrend}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TEAM PERFORMANCE REPORT ───────────────────────── */}
      {activeCategory === "team" && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-zinc-900 p-5 shadow-sm border border-zinc-200/60">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-2">TEAM PERFORMANCE NARRATIVE</p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              The IR team has completed <span className="font-bold text-white">{effectiveness.completedActions} of {effectiveness.totalActions} actions</span> ({actionCompletionPct}%),
              with <span className="font-bold text-white">{effectiveness.openSignals} signals</span> still requiring attention.
              {Object.entries(effectiveness.workload).map(([name, data]) => (
                <span key={name}> <span className="font-bold text-white">{name}</span> carries {data.open} open action{data.open !== 1 ? "s" : ""}.</span>
              ))}
              {" "}Tier 1 investors received {tierCounts[1]} interactions, with Tier 2 at {tierCounts[2]} and Tier 3 at {tierCounts[3]} — the
              allocation broadly reflects strategic priority weighting.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Completion Rate</p>
              <p className="mt-1 font-mono text-2xl font-bold text-zinc-900">{actionCompletionPct}%</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Open Actions</p>
              <p className="mt-1 font-mono text-2xl font-bold text-zinc-900">{effectiveness.totalActions - effectiveness.completedActions}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Tier 1 Focus</p>
              <p className="mt-1 font-mono text-2xl font-bold text-zinc-900">{tierCounts[1]}</p>
              <p className="text-xs text-zinc-400">interactions</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">Overdue</p>
              <p className={cn("mt-1 font-mono text-2xl font-bold",
                actions.filter((a) => a.dueDate < "2026-04-01" && a.state !== "completed").length > 0 ? "text-red-600" : "text-zinc-900"
              )}>{actions.filter((a) => a.dueDate < "2026-04-01" && a.state !== "completed").length}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-1">TEAM WORKLOAD</p>
              <p className="text-xs text-zinc-400 mb-3">Distribution of completed vs. open actions per team member. Balance is key to preventing burnout and ensuring coverage.</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={teamWorkloadData} barCategoryGap="20%">
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Completed" fill="#09090b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Open" fill="#d4d4d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-1">ENGAGEMENT BY TIER</p>
              <p className="text-xs text-zinc-400 mb-3">Higher-tier investors should receive proportionally more attention. This chart shows whether engagement allocation matches strategic priority.</p>
              <div className="space-y-3 mt-4">
                {[1, 2, 3].map((tier) => {
                  const max = Math.max(tierCounts[1], tierCounts[2], tierCounts[3]) || 1;
                  const colors = { 1: "bg-zinc-900", 2: "bg-zinc-400", 3: "bg-zinc-300" };
                  return (
                    <div key={tier}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-zinc-600">Tier {tier}</span>
                        <span className="font-mono text-xs font-bold text-zinc-900">{tierCounts[tier]}</span>
                      </div>
                      <div className="h-3 rounded-full bg-zinc-100">
                        <div className={cn("h-3 rounded-full transition-all", colors[tier])} style={{ width: `${(tierCounts[tier] / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
