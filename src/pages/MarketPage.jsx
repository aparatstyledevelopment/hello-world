import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";
import { StatCard } from "../components/ui/StatCard";
import { EmptyState } from "../components/ui/EmptyState";
import { getInvestor } from "../data/mock-data";

// ── Market intelligence feed (inline mock) ──────────────
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

const categories = [
  "All",
  "Ownership",
  "Peer",
  "Fund flows",
  "Regulatory",
  "Media",
];

const categoryBadgeColors = {
  Ownership: "bg-blue-50 text-blue-700",
  Peer: "bg-violet-50 text-violet-700",
  "Fund flows": "bg-teal-50 text-teal-700",
  Regulatory: "bg-amber-50 text-amber-700",
  Media: "bg-slate-100 text-slate-600",
};

const relevanceDot = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

const relevanceLabel = {
  high: "text-red-600",
  medium: "text-amber-600",
  low: "text-slate-500",
};

export function MarketPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    if (activeCategory === "All") return marketIntelligence;
    return marketIntelligence.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  const stats = useMemo(() => {
    const high = marketIntelligence.filter(
      (m) => m.relevance === "high"
    ).length;
    const thisWeek = marketIntelligence.filter(
      (m) => new Date(m.date) >= new Date("2026-03-22")
    ).length;
    const uniqueInvestors = new Set(
      marketIntelligence.flatMap((m) => m.affectedInvestorIds)
    ).size;
    return { total: marketIntelligence.length, high, thisWeek, uniqueInvestors };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Market Intelligence
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Curated market events affecting your investor base
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard value={stats.total} label="Total items" />
        <StatCard value={stats.high} label="High relevance" trend="up" />
        <StatCard value={stats.thisWeek} label="This week" />
        <StatCard value={stats.uniqueInvestors} label="Investors affected" />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              activeCategory === cat
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommendation box */}
      <div className="rounded-lg bg-slate-800 text-white p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">
          INTELLIGENCE SUMMARY
        </p>
        <p className="text-sm leading-relaxed">
          {stats.high} high-relevance items detected this period affecting {stats.uniqueInvestors} investors.
          Ownership changes and peer activity dominate the feed. Prioritize engagement with affected holders.
        </p>
      </div>

      {/* Intelligence Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Date + Category Badge */}
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-slate-400">
                      {item.date}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                        categoryBadgeColors[item.category]
                      )}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Relevance + Affected Investors + Source */}
                  <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-slate-100">
                    {/* Relevance */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                        Relevance
                      </span>
                      <span className="flex items-center gap-1">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            relevanceDot[item.relevance]
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-semibold capitalize",
                            relevanceLabel[item.relevance]
                          )}
                        >
                          {item.relevance}
                        </span>
                      </span>
                    </div>

                    {/* Affected Investors */}
                    {item.affectedInvestorIds.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                          Affects
                        </span>
                        <span className="flex flex-wrap gap-1.5">
                          {item.affectedInvestorIds.map((id) => {
                            const inv = getInvestor(id);
                            return inv ? (
                              <Link
                                key={id}
                                to={`/investors/${id}`}
                                className="text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline"
                              >
                                {inv.name}
                              </Link>
                            ) : null;
                          })}
                        </span>
                      </div>
                    )}

                    {/* Source */}
                    <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                      <ExternalLink size={11} />
                      <span>{item.source}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="No intelligence items"
          description="No market intelligence matching this filter."
        />
      )}
    </div>
  );
}
