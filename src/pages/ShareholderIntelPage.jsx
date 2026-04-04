import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Users,
  PieChart,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Sparkline } from "../components/ui/Sparkline";
import { StatCard } from "../components/ui/StatCard";
import {
  investors,
  topBuyers,
  topSellers,
} from "../data/mock-data";

export function ShareholderIntelPage() {
  const [sortBy, setSortBy] = useState("holdingPct");
  const [sortDir, setSortDir] = useState("desc");

  const totalOwnership = investors.reduce((sum, inv) => sum + inv.holdingPct, 0);
  const top5Share = investors
    .slice()
    .sort((a, b) => b.holdingPct - a.holdingPct)
    .slice(0, 5)
    .reduce((sum, inv) => sum + inv.holdingPct, 0);

  const byType = useMemo(() => {
    const counts = { passive: 0, active: 0, pension: 0, sovereign: 0 };
    const holdings = { passive: 0, active: 0, pension: 0, sovereign: 0 };
    for (const inv of investors) {
      counts[inv.type] = (counts[inv.type] || 0) + 1;
      holdings[inv.type] = (holdings[inv.type] || 0) + inv.holdingPct;
    }
    return { counts, holdings };
  }, []);

  const tierCounts = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0 };
    for (const inv of investors) c[inv.tier]++;
    return c;
  }, []);

  // Risk alerts
  const atRiskInvestors = investors.filter(
    (inv) => inv.holdingTrend === "down" && inv.engagementMomentum === "negative"
  );

  // Sortable table
  const sorted = useMemo(() => {
    return [...investors].sort((a, b) => {
      let va = a[sortBy];
      let vb = b[sortBy];
      if (typeof va === "string") {
        va = va.toLowerCase();
        vb = vb.toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortBy, sortDir]);

  function toggleSort(col) {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  }

  const sortArrow = (col) =>
    sortBy === col ? (sortDir === "asc" ? " \u2191" : " \u2193") : "";

  const typeLabels = { passive: "Passive", active: "Active", pension: "Pension", sovereign: "Sovereign" };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
          Shareholder Intelligence
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Ownership structure, composition, and movement analysis
        </p>
      </div>

      {/* ── Ownership Overview ───────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Concentration card (dark) */}
        <div className="rounded-2xl bg-zinc-900 p-5 w-full md:w-72 md:flex-shrink-0 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
            CONCENTRATION INDEX
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-3xl md:text-4xl font-bold text-white">
              {top5Share.toFixed(1)}%
            </span>
            <span className="text-xs text-zinc-400">Top-5 share</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-zinc-700">
            <div
              className="h-2 rounded-full bg-white transition-all"
              style={{ width: `${Math.min(top5Share * 2, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            <span className="font-mono font-semibold text-white">{totalOwnership.toFixed(1)}%</span>{" "}
            total tracked across {investors.length} investors
          </p>
        </div>

        {/* Summary stats */}
        <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="TOTAL INVESTORS" value={investors.length} />
          <StatCard label="TIER 1" value={tierCounts[1]} annotation={`${tierCounts[2]} T2, ${tierCounts[3]} T3`} annotationColor="slate" />
          <StatCard
            label="AT RISK"
            value={atRiskInvestors.length}
            annotation={atRiskInvestors.length > 0 ? "Declining + negative" : "None flagged"}
            annotationColor={atRiskInvestors.length > 0 ? "red" : "slate"}
          />
          <StatCard label="TRACKED OWNERSHIP" value={`${totalOwnership.toFixed(1)}%`} />
        </div>
      </div>

      {/* ── Ownership Composition ────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(typeLabels).map(([key, label]) => (
          <div key={key} className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-4 min-w-0 overflow-hidden">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400 truncate">
              {label}
            </p>
            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="font-mono text-xl md:text-2xl font-bold text-zinc-900">
                {byType.holdings[key]?.toFixed(1) ?? "0.0"}%
              </span>
              <span className="text-xs text-zinc-400">{byType.counts[key] ?? 0} investors</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Shareholder Movement Table ───────────────────── */}
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400 mb-3">
          Shareholder Base
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100">
                {[
                  { key: "name", label: "Investor" },
                  { key: "type", label: "Type" },
                  { key: "holdingPct", label: "Holding %" },
                  { key: "tier", label: "Tier" },
                  { key: "holdingTrend", label: "Trend" },
                  { key: "engagementMomentum", label: "Momentum" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="cursor-pointer select-none px-4 py-3 text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {col.label}{sortArrow(col.key)}
                  </th>
                ))}
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">
                  6Q Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((inv) => {
                const isRisk = inv.holdingTrend === "down" && inv.engagementMomentum === "negative";
                return (
                  <tr
                    key={inv.id}
                    className={cn(
                      "border-b border-zinc-50 transition-colors hover:bg-zinc-50",
                      isRisk && "bg-red-50/30"
                    )}
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/investors/${inv.id}`}
                        className="text-sm font-semibold text-zinc-900 hover:underline"
                      >
                        {inv.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                        {inv.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-zinc-900">
                      {inv.holdingPct}%
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={inv.tier} kind="tier" />
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        inv.holdingTrend === "up" ? "text-emerald-600" :
                        inv.holdingTrend === "down" ? "text-red-500" : "text-zinc-400"
                      )}>
                        {inv.holdingTrend === "up" && <TrendingUp size={12} />}
                        {inv.holdingTrend === "down" && <TrendingDown size={12} />}
                        {inv.holdingTrend === "up" ? "Increasing" :
                         inv.holdingTrend === "down" ? "Declining" : "Stable"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                        inv.engagementMomentum === "positive" ? "bg-zinc-100 text-zinc-700" :
                        inv.engagementMomentum === "negative" ? "bg-red-50 text-red-700" :
                        "bg-zinc-100 text-zinc-500"
                      )}>
                        {inv.engagementMomentum}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Sparkline
                        data={inv.holdingHistory}
                        width={80}
                        height={24}
                        color={
                          inv.holdingTrend === "up" ? "#059669" :
                          inv.holdingTrend === "down" ? "#dc2626" : "#9ca3af"
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Top Movers ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Buyers */}
        <Card variant="section" accentColor="zinc" title="Top Buyers (Q4)">
          <div className="space-y-2">
            {topBuyers.map((b) => (
              <div key={b.name} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-400" />
                  {b.id ? (
                    <Link to={`/investors/${b.id}`} className="text-sm font-medium text-zinc-800 hover:underline">
                      {b.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-zinc-800">{b.name}</span>
                  )}
                </div>
                <span className="font-mono text-sm font-bold text-zinc-900">{b.change}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Sellers */}
        <Card variant="section" accentColor="zinc" title="Top Sellers (Q4)">
          <div className="space-y-2">
            {topSellers.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-xl bg-red-50/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <TrendingDown size={14} className="text-red-400" />
                  {s.id ? (
                    <Link to={`/investors/${s.id}`} className="text-sm font-medium text-zinc-800 hover:underline">
                      {s.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-zinc-800">{s.name}</span>
                  )}
                </div>
                <span className="font-mono text-sm font-bold text-red-600">{s.change}</span>
              </div>
            ))}
          </div>
          <Link
            to="/market"
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            See full market context
            <ArrowRight size={12} />
          </Link>
        </Card>
      </div>

      {/* ── Risk Alerts ──────────────────────────────────── */}
      {atRiskInvestors.length > 0 && (
        <div>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400 mb-3">
            Risk Alerts
          </h2>
          <div className="space-y-2">
            {atRiskInvestors.map((inv) => (
              <Link
                key={inv.id}
                to={`/investors/${inv.id}`}
                className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/30 p-4 transition-colors hover:bg-red-50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle size={14} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">{inv.name}</p>
                  <p className="text-xs text-zinc-500">
                    Holding declining ({inv.holdingHistory[0]}% → {inv.holdingPct}%) with negative engagement momentum
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={inv.tier} kind="tier" />
                  <span className="font-mono text-sm font-bold text-red-600">{inv.holdingPct}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
