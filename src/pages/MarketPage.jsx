import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  BarChart3,
  Globe,
  FileText,
  Radio,
  Newspaper,
  Shield,
} from "lucide-react";
import { cn } from "../lib/utils";
import { StatCard } from "../components/ui/StatCard";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ActionCard } from "../components/ui/ActionCard";
import { EmptyState } from "../components/ui/EmptyState";
import { HealthDots } from "../components/ui/HealthDots";
import { getInvestor } from "../data/mock-data";

// ── Market intelligence feed ───────────────────────────
const marketIntelligence = [
  {
    id: "mi-001",
    date: "2026-03-28",
    category: "Ownership",
    title: "BlackRock increases position in sector peers",
    description:
      "BlackRock has increased positions across the technology sector by an average of 0.3% in Q1, suggesting a sector-wide allocation shift rather than company-specific conviction.",
    relevance: "high",
    affectedInvestorIds: ["inv-001"],
    source: "13F Filing Analysis",
  },
  {
    id: "mi-002",
    date: "2026-03-26",
    category: "Peer",
    title: "Competitor XYZ announces major acquisition",
    description:
      "XYZ Corp has announced a $4.2B acquisition in the AI infrastructure space. This may impact investor perception of our competitive positioning.",
    relevance: "high",
    affectedInvestorIds: ["inv-003", "inv-004", "inv-006"],
    source: "News Wire",
  },
  {
    id: "mi-003",
    date: "2026-03-25",
    category: "Fund flows",
    title: "Active equity funds see $8B outflows in March",
    description:
      "Active equity funds experienced significant outflows in March, potentially pressuring holdings of our active investors.",
    relevance: "medium",
    affectedInvestorIds: ["inv-003", "inv-004", "inv-006"],
    source: "Fund Flow Tracker",
  },
  {
    id: "mi-004",
    date: "2026-03-24",
    category: "Regulatory",
    title: "SEC proposes new climate disclosure rules",
    description:
      "The SEC has proposed enhanced climate disclosure requirements effective 2027. Governance-focused investors will likely increase engagement on this topic.",
    relevance: "medium",
    affectedInvestorIds: ["inv-002", "inv-005", "inv-007"],
    source: "SEC Filing",
  },
  {
    id: "mi-005",
    date: "2026-03-22",
    category: "Media",
    title: "Analyst upgrades sector to Overweight",
    description:
      "Goldman Sachs has upgraded the technology hardware sector to Overweight, citing improving margins and AI tailwinds.",
    relevance: "medium",
    affectedInvestorIds: [],
    source: "Analyst Report",
  },
  {
    id: "mi-006",
    date: "2026-03-20",
    category: "Ownership",
    title: "Wellington trims multiple tech holdings",
    description:
      "Wellington Management has reduced positions in 5 technology companies. However, our holding has increased, suggesting differentiated conviction.",
    relevance: "high",
    affectedInvestorIds: ["inv-003"],
    source: "13F Filing Analysis",
  },
  {
    id: "mi-007",
    date: "2026-03-18",
    category: "Fund flows",
    title: "Passive index funds see record Q1 inflows",
    description:
      "Passive index funds attracted $45B in Q1 inflows, a quarterly record. This should support holdings from BlackRock and Vanguard.",
    relevance: "low",
    affectedInvestorIds: ["inv-001", "inv-002"],
    source: "Fund Flow Tracker",
  },
  {
    id: "mi-008",
    date: "2026-03-15",
    category: "Regulatory",
    title: "EU CSRD reporting requirements finalized",
    description:
      "The EU has finalized CSRD reporting requirements for fiscal year 2026. European investors will expect enhanced sustainability disclosures.",
    relevance: "medium",
    affectedInvestorIds: ["inv-007"],
    source: "Regulatory Update",
  },
  {
    id: "mi-009",
    date: "2026-03-12",
    category: "Peer",
    title: "Peer company ABC raises FY guidance",
    description:
      "ABC Corp raised full-year revenue guidance by 5%, setting higher expectations across the sector. Our investors may expect similar momentum.",
    relevance: "medium",
    affectedInvestorIds: ["inv-003"],
    source: "Earnings Report",
  },
  {
    id: "mi-010",
    date: "2026-03-10",
    category: "Media",
    title: "Industry report highlights AI infrastructure spend",
    description:
      "McKinsey report projects AI infrastructure spending to grow 40% YoY through 2028. Positive for our long-term positioning narrative.",
    relevance: "low",
    affectedInvestorIds: [],
    source: "Industry Report",
  },
];

const categories = ["All", "Ownership", "Peer", "Fund flows", "Regulatory", "Media"];

const categoryIcons = {
  Ownership: BarChart3,
  Peer: Globe,
  "Fund flows": TrendingUp,
  Regulatory: Shield,
  Media: Newspaper,
};

const categoryBadgeColors = {
  Ownership: "bg-blue-50 text-blue-700 border border-blue-200",
  Peer: "bg-violet-50 text-violet-700 border border-violet-200",
  "Fund flows": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Regulatory: "bg-amber-50 text-amber-700 border border-amber-200",
  Media: "bg-zinc-100 text-zinc-600 border border-zinc-200",
};

const priorityColors = {
  high: "bg-red-50 text-red-600 border border-red-200",
  medium: "bg-zinc-100 text-zinc-600 border border-zinc-200",
  low: "bg-zinc-50 text-zinc-400 border border-zinc-200",
};

// ── Top buyers / sellers for Q4 ────────────────────────
const topBuyers = [
  { name: "BlackRock Fund Advisors", change: "+0.5%", id: "inv-001" },
  { name: "Wellington Management", change: "+0.6%", id: "inv-003" },
  { name: "Norges Bank IM", change: "+0.1%", id: "inv-007" },
  { name: "CalPERS", change: "+0.1%", id: "inv-005" },
  { name: "Vanguard Group", change: "+0.0%", id: "inv-002" },
];

const topSellers = [
  { name: "Harris Associates", change: "-0.6%", id: "inv-004" },
  { name: "Artisan Partners", change: "-0.3%", id: "inv-006" },
  { name: "Vanguard Group", change: "-0.3%", id: "inv-002" },
  { name: "Hedge Fund Alpha", change: "-0.2%", id: null },
  { name: "Quant Capital", change: "-0.1%", id: null },
];

export function MarketPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    if (activeCategory === "All") return marketIntelligence;
    return marketIntelligence.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  const stats = useMemo(() => {
    const high = marketIntelligence.filter((m) => m.relevance === "high").length;
    const thisWeek = marketIntelligence.filter(
      (m) => new Date(m.date) >= new Date("2026-03-22")
    ).length;
    const uniqueInvestors = new Set(
      marketIntelligence.flatMap((m) => m.affectedInvestorIds)
    ).size;
    const withInvestors = marketIntelligence.filter(
      (m) => m.affectedInvestorIds.length > 0
    ).length;
    return { total: marketIntelligence.length, high, thisWeek, uniqueInvestors, withInvestors };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-zinc-900">Market Intelligence</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ownership shifts, peer activity, and market signals that matter to your investors
        </p>
      </div>

      {/* ── Concentration + Shareholder Base Row ─────────── */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Dark Concentration Index Card */}
        <div className="rounded-2xl bg-zinc-900 p-5 w-full md:w-80 md:flex-shrink-0 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
            CONCENTRATION INDEX
          </p>
          <div className="mt-3 flex items-baseline gap-4">
            <span className="font-mono text-3xl md:text-5xl font-bold text-white">42.8%</span>
            <span className="text-sm font-medium text-zinc-400">Top-5 holder share</span>
          </div>
          <div className="mt-4 h-2.5 w-full rounded-full bg-zinc-700">
            <div
              className="h-2.5 rounded-full bg-white transition-all"
              style={{ width: "42.8%" }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Shifted <span className="font-mono font-semibold text-white">+1.2%</span> vs. prior quarter
            — concentration tightening among top institutional holders
          </p>
        </div>

        {/* Shareholder Base Highlights */}
        <div className="flex-1 min-w-0">
        <Card variant="section" accentColor="zinc" title="Shareholder Base Highlights" subtitle="Largest movers in Q4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Top 5 Buyers */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-3">
              TOP 5 BUYERS (Q4)
            </p>
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
          </div>

          {/* Top 5 Sellers */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-3">
              TOP 5 SELLERS (Q4)
            </p>
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
          </div>
        </div>
      </Card>
        </div>
      </div>

      {/* ── Intelligence Feed ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Intelligence Feed</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Market events relevant to your shareholder base</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-colors",
                activeCategory === cat
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Intel Cards */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => {
              const CatIcon = categoryIcons[item.category] || FileText;
              const hasAffected = item.affectedInvestorIds.length > 0;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon circle */}
                    <div
                      className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                        item.relevance === "high"
                          ? "bg-red-50"
                          : "bg-zinc-100"
                      )}
                    >
                      <CatIcon
                        size={18}
                        className={cn(
                          item.relevance === "high"
                            ? "text-red-600"
                            : "text-zinc-500"
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold text-zinc-900">{item.title}</h3>
                        <span className={cn("inline-flex items-center rounded-xl px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em]", priorityColors[item.relevance])}>
                          {item.relevance}
                        </span>
                      </div>

                      <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                        {item.description}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
                        <span className={cn("inline-flex items-center rounded-xl px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] w-fit", categoryBadgeColors[item.category])}>
                          {item.category}
                        </span>

                        {hasAffected && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1.5 font-mono text-[10px] font-bold text-white">
                              {item.affectedInvestorIds.length}
                            </span>
                            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                              YOUR INVESTORS
                            </span>
                            {item.affectedInvestorIds.map((id) => {
                              const inv = getInvestor(id);
                              return inv ? (
                                <Link
                                  key={id}
                                  to={`/investors/${id}`}
                                  className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:underline"
                                >
                                  {inv.name}
                                </Link>
                              ) : null;
                            })}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-zinc-400 sm:ml-auto">
                          <ExternalLink size={11} />
                          <span>{item.source}</span>
                          <span className="text-zinc-300 mx-1">&middot;</span>
                          <span className="font-mono">{item.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No intelligence items"
            description="No market intelligence matching this filter."
          />
        )}
      </div>

      {/* ── Key Engagement Metrics ────────────────────────── */}
      <Card variant="section" accentColor="zinc" title="Key Engagement Metrics" subtitle="Aggregate activity indicators">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-left md:text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">HIGH RELEVANCE ITEMS</p>
            <p className="mt-1.5 font-mono text-2xl md:text-3xl font-bold text-red-600">{stats.high}</p>
            <p className="mt-0.5 text-xs text-zinc-500">Require attention</p>
          </div>
          <div className="text-left md:text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">INVESTORS AFFECTED</p>
            <p className="mt-1.5 font-mono text-2xl md:text-3xl font-bold text-zinc-900">{stats.uniqueInvestors}</p>
            <p className="mt-0.5 text-xs text-zinc-500">Across all items</p>
          </div>
          <div className="text-left md:text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">THIS WEEK</p>
            <p className="mt-1.5 font-mono text-2xl md:text-3xl font-bold text-zinc-900">{stats.thisWeek}</p>
            <p className="mt-0.5 text-xs text-zinc-500">New items</p>
          </div>
          <div className="text-left md:text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">AFFECTING YOUR BASE</p>
            <p className="mt-1.5 font-mono text-2xl md:text-3xl font-bold text-zinc-900">{stats.withInvestors}</p>
            <p className="mt-0.5 text-xs text-zinc-500">of {stats.total} total</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
