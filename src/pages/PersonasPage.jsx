import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { UserCircle, ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { SentimentMeter } from "../components/ui/SentimentMeter";
import { HealthDots } from "../components/ui/HealthDots";
import { EmptyState } from "../components/ui/EmptyState";
import { investors, getSignalsForInvestor } from "../data/mock-data";

// ── Archetype derivation ────────────────────────────────
function deriveArchetype(investor) {
  const trend = investor.holdingTrend;
  const type = investor.type;
  const momentum = investor.engagementMomentum;
  const govSignals = getSignalsForInvestor(investor.id).filter(
    (s) => s.type === "governance_management"
  );

  if (trend === "up" && type === "active") return "Active accumulator";
  if (trend === "down" && momentum === "negative") return "Silent reducer";
  if (type === "passive" && trend !== "down") return "Passive tracker";
  if (type === "sovereign" || type === "pension") return "Governance steward";
  if (trend === "down" && type === "active") return "Cautious trimmer";
  if (govSignals.length > 0) return "Governance steward";
  return "Passive tracker";
}

const archetypeColors = {
  "Active accumulator": "bg-gray-200 text-black border-gray-300",
  "Silent reducer": "bg-red-100 text-red-800 border-red-300",
  "Passive tracker": "bg-gray-100 text-gray-700 border-gray-200",
  "Governance steward": "bg-gray-200 text-gray-800 border-gray-300",
  "Cautious trimmer": "bg-gray-100 text-gray-700 border-gray-200",
};

const typeLabels = {
  passive: "Passive",
  active: "Active",
  pension: "Pension",
  sovereign: "Sovereign",
};

// ── Behavioral scores derived from data ─────────────────
function deriveScores(investor) {
  const allSignals = getSignalsForInvestor(investor.id);
  const govSignals = allSignals.filter(
    (s) => s.type === "governance_management"
  );

  const engagementBase =
    investor.engagementMomentum === "positive"
      ? 75
      : investor.engagementMomentum === "neutral"
      ? 50
      : 25;
  const engagement = Math.min(
    100,
    engagementBase + investor.contacts.length * 10
  );

  const governance = Math.min(
    100,
    40 +
      govSignals.length * 20 +
      (investor.type === "sovereign" || investor.type === "pension" ? 20 : 0)
  );

  const riskBase =
    investor.holdingTrend === "down"
      ? 70
      : investor.holdingTrend === "neutral"
      ? 35
      : 15;
  const risk = Math.min(
    100,
    riskBase + allSignals.filter((s) => s.type === "retention_risk").length * 15
  );

  return { engagement, governance, risk };
}

function getEngagementLabel(score) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function getEngagementBarColor(score) {
  if (score >= 70) return "bg-black";
  if (score >= 40) return "bg-gray-400";
  return "bg-red-500";
}

function getRiskLevel(score) {
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

function getLastContact(investor) {
  let latest = null;
  for (const c of investor.contacts) {
    if (!latest || c.lastInteraction > latest) {
      latest = c.lastInteraction;
    }
  }
  return latest;
}

function getMeetingThemes(investor) {
  const allSignals = getSignalsForInvestor(investor.id);
  const themes = [];
  if (allSignals.some((s) => s.type === "governance_management")) themes.push("Governance");
  if (allSignals.some((s) => s.type === "retention_risk")) themes.push("Retention");
  if (investor.stateParameters?.some((p) => p.label === "Engagement Priority"))
    themes.push("ESG");
  if (investor.type === "active") themes.push("Valuation");
  if (investor.holdingTrend === "up") themes.push("Growth thesis");
  if (investor.holdingTrend === "down") themes.push("Exit risk");
  return themes.slice(0, 4);
}

function getSignalNote(archetype) {
  switch (archetype) {
    case "Active accumulator":
      return "Increasing conviction signals long-term thesis alignment. Prioritize strategic engagement and management access.";
    case "Silent reducer":
      return "Declining position with low engagement is a strong exit indicator. Urgent re-engagement recommended.";
    case "Passive tracker":
      return "Index-driven holding with stewardship focus. Engage primarily on governance and proxy topics.";
    case "Governance steward":
      return "Governance-first engagement lens. Anticipate proactive outreach on board, compensation, and ESG topics.";
    case "Cautious trimmer":
      return "Position reduction may reflect specific concerns. Diagnose drivers before proposing retention strategy.";
    default:
      return "";
  }
}

export function PersonasPage() {
  const [archetypeFilter, setArchetypeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const enriched = useMemo(() => {
    return investors.map((inv) => {
      const archetype = deriveArchetype(inv);
      const scores = deriveScores(inv);
      return {
        ...inv,
        archetype,
        scores,
        signalNote: getSignalNote(archetype),
        meetingThemes: getMeetingThemes(inv),
        lastContact: getLastContact(inv),
      };
    });
  }, []);

  const archetypes = useMemo(
    () => [...new Set(enriched.map((e) => e.archetype))].sort(),
    [enriched]
  );

  const filtered = useMemo(() => {
    let result = enriched;
    if (archetypeFilter)
      result = result.filter((i) => i.archetype === archetypeFilter);
    if (typeFilter) result = result.filter((i) => i.type === typeFilter);
    return result.sort((a, b) => {
      const riskOrder = { "Silent reducer": 0, "Cautious trimmer": 1, "Governance steward": 2, "Passive tracker": 3, "Active accumulator": 4 };
      return (riskOrder[a.archetype] ?? 3) - (riskOrder[b.archetype] ?? 3);
    });
  }, [enriched, archetypeFilter, typeFilter]);

  // Group by section label
  const strategicSpecialists = filtered.filter(
    (i) => i.archetype === "Active accumulator" || i.archetype === "Governance steward"
  );
  const portfolioManagers = filtered.filter(
    (i) => i.archetype === "Passive tracker" || i.archetype === "Cautious trimmer" || i.archetype === "Silent reducer"
  );

  const atRiskCount = enriched.filter(
    (i) => i.archetype === "Silent reducer" || i.archetype === "Cautious trimmer"
  ).length;
  const growingCount = enriched.filter(
    (i) => i.archetype === "Active accumulator"
  ).length;
  const avgRisk = enriched.length > 0
    ? Math.round(enriched.reduce((s, i) => s + i.scores.risk, 0) / enriched.length)
    : 0;

  // ── Contact Card ──────────────────────────────────────
  function ContactCard({ inv }) {
    const isAtRisk = inv.archetype === "Silent reducer" || inv.archetype === "Cautious trimmer";
    const initials = inv.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2);

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col">
        {/* Top row: avatar + identity */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold",
              isAtRisk
                ? "bg-red-100 text-red-700"
                : inv.archetype === "Active accumulator"
                ? "bg-gray-200 text-gray-700"
                : "bg-gray-200 text-gray-700"
            )}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              to={`/investors/${inv.id}`}
              className="text-sm font-bold text-black hover:underline"
            >
              {inv.name}
            </Link>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em]",
                  archetypeColors[inv.archetype] || "bg-gray-100 text-gray-700 border-gray-200"
                )}
              >
                {inv.archetype}
              </span>
              <span className="text-xs text-gray-500">
                {typeLabels[inv.type]} &middot; <span className="font-mono">{inv.holdingPct}%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          {inv.signalNote}
        </p>

        {/* Engagement Rate metric bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
              ENGAGEMENT RATE
            </span>
            <span
              className={cn(
                "text-xs font-bold",
                inv.scores.engagement >= 70
                  ? "text-black"
                  : inv.scores.engagement >= 40
                  ? "text-gray-500"
                  : "text-red-600"
              )}
            >
              {getEngagementLabel(inv.scores.engagement)}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100">
            <div
              className={cn("h-1.5 rounded-full transition-all", getEngagementBarColor(inv.scores.engagement))}
              style={{ width: `${inv.scores.engagement}%` }}
            />
          </div>
        </div>

        {/* Risk bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className={cn(
              "text-[11px] font-medium uppercase tracking-[0.1em]",
              inv.scores.risk >= 60 ? "text-red-600 font-bold" : "text-gray-400"
            )}>
              RISK SCORE
              {inv.scores.risk >= 60 && (
                <span className="ml-1.5 inline-flex items-center rounded bg-red-100 px-1 py-0.5 text-[9px] font-bold uppercase text-red-700">
                  ALERT
                </span>
              )}
            </span>
            <span className={cn(
              "font-mono text-xs font-bold",
              inv.scores.risk >= 60 ? "text-red-600" : inv.scores.risk >= 35 ? "text-gray-500" : "text-black"
            )}>
              {inv.scores.risk}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all",
                inv.scores.risk >= 60
                  ? "bg-red-500"
                  : inv.scores.risk >= 35
                  ? "bg-gray-400"
                  : "bg-black"
              )}
              style={{ width: `${inv.scores.risk}%` }}
            />
          </div>
        </div>

        <div className="flex-1" />

        {/* Last call footer */}
        <div className="mt-auto border-t border-gray-100 pt-3 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
            LAST CALL: <span className="font-mono text-gray-600">{inv.lastContact || "N/A"}</span>
          </span>
          <Link
            to={`/investors/${inv.id}`}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Sentiment & Risk Card ─────────────────────────────
  function SentimentCard({ inv }) {
    const riskLevel = getRiskLevel(inv.scores.risk);

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-700">
            {inv.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          <div>
            <Link
              to={`/investors/${inv.id}`}
              className="text-sm font-bold text-black hover:underline"
            >
              {inv.name}
            </Link>
            <p className="text-xs text-gray-500">{typeLabels[inv.type]}</p>
          </div>
        </div>

        <SentimentMeter
          value={riskLevel}
          label="Risk Assessment"
          description={inv.signalNote}
        />

        {/* Key Meeting Themes as pills */}
        {inv.meetingThemes.length > 0 && (
          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-2">
              KEY MEETING THEMES
            </p>
            <div className="flex flex-wrap gap-1.5">
              {inv.meetingThemes.map((theme) => (
                <span
                  key={theme}
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.05em]",
                    theme === "Retention" || theme === "Exit risk"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  )}
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">
          Investor Personas
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          How your investors behave, who is at risk, and how to engage each one
        </p>
      </div>

      {/* Hero persona summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="At Risk"
          value={atRiskCount}
          annotation="Declining or reducing"
          annotationColor="red"
          variant="dark"
        />
        <StatCard
          label="Avg Risk Score"
          value={`${avgRisk}%`}
          annotation="Across all personas"
          annotationColor={avgRisk >= 50 ? "red" : "gray"}
        />
        <StatCard
          label="Growing"
          value={growingCount}
          annotation="Accumulating position"
          annotationColor="gray"
        />
        <StatCard
          label="Total Personas"
          value={enriched.length}
          annotation="Tracked investors"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
          Filters
        </span>
        <select
          value={archetypeFilter}
          onChange={(e) => setArchetypeFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="">All Archetypes</option>
          {archetypes.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserCircle}
          title="No personas found"
          description="Try adjusting your filters."
        />
      ) : (
        <>
          {/* ── Strategic Specialists ─────────────────────── */}
          {strategicSpecialists.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-base font-bold text-black">Strategic Specialists</h2>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 font-mono text-[10px] font-bold text-white">
                  {strategicSpecialists.length}
                </span>
              </div>
              <hr className="border-gray-200 mb-5" />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {strategicSpecialists.map((inv) => (
                  <ContactCard key={inv.id} inv={inv} />
                ))}
              </div>
            </div>
          )}

          {/* ── Portfolio Managers ─────────────────────────── */}
          {portfolioManagers.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-base font-bold text-black">Portfolio Managers</h2>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 font-mono text-[10px] font-bold text-white">
                  {portfolioManagers.length}
                </span>
              </div>
              <hr className="border-gray-200 mb-5" />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {portfolioManagers.map((inv) => (
                  <ContactCard key={inv.id} inv={inv} />
                ))}
              </div>
            </div>
          )}

          {/* ── Sentiment & Risk ──────────────────────────── */}
          <Card variant="section" accentColor="red" title="Sentiment & Risk" subtitle="Risk assessment and key meeting themes per investor">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map((inv) => (
                <SentimentCard key={inv.id} inv={inv} />
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, annotation, annotationColor = "gray", variant = "light" }) {
  const isDark = variant === "dark";
  const colorMap = {
    red: "text-red-600",
    gray: "text-gray-500",
  };

  return (
    <div
      className={cn(
        "rounded-lg p-5 text-center",
        isDark ? "bg-black" : "border border-gray-200 bg-white"
      )}
    >
      <p className={cn(
        "text-[11px] font-medium uppercase tracking-[0.1em]",
        isDark ? "text-gray-400" : "text-gray-400"
      )}>
        {label}
      </p>
      <p className={cn(
        "mt-1 font-mono text-4xl font-bold",
        isDark ? "text-white" : "text-black"
      )}>
        {value}
      </p>
      {annotation && (
        <p className={cn(
          "mt-1 text-xs font-medium",
          isDark ? "text-gray-400" : (colorMap[annotationColor] ?? colorMap.gray)
        )}>
          {annotation}
        </p>
      )}
    </div>
  );
}
