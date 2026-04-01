import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
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
  "Active accumulator": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Silent reducer": "bg-red-100 text-red-800 border-red-300",
  "Passive tracker": "bg-sky-50 text-sky-700 border-sky-200",
  "Governance steward": "bg-violet-100 text-violet-800 border-violet-300",
  "Cautious trimmer": "bg-amber-100 text-amber-800 border-amber-300",
};

const archetypeIcons = {
  "Active accumulator": "^",
  "Silent reducer": "!",
  "Passive tracker": "~",
  "Governance steward": "#",
  "Cautious trimmer": "v",
};

const typeLabels = {
  passive: "Passive",
  active: "Active",
  pension: "Pension",
  sovereign: "Sovereign",
};

// Card border and bg color based on archetype risk
function getCardStyle(archetype) {
  if (archetype === "Silent reducer") {
    return "border-red-300 bg-red-50/40 shadow-sm shadow-red-100";
  }
  if (archetype === "Cautious trimmer") {
    return "border-amber-300 bg-amber-50/30 shadow-sm shadow-amber-100";
  }
  if (archetype === "Active accumulator") {
    return "border-emerald-200 bg-emerald-50/20";
  }
  return "border-slate-200 bg-white";
}

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

function getHoldingPeriod(investor) {
  const trend = investor.holdingTrend;
  if (trend === "up") return "Growing (6+ months)";
  if (trend === "down") return "Reducing";
  return "Stable (12+ months)";
}

function getGovernancePattern(investor) {
  const govSignals = getSignalsForInvestor(investor.id).filter(
    (s) => s.type === "governance_management"
  );
  if (govSignals.length > 0) return "Active participant";
  if (investor.type === "sovereign" || investor.type === "pension")
    return "Policy-driven voter";
  return "Generally supportive";
}

function getCommunicationStyle(investor) {
  if (investor.contacts.length >= 2) return "Multi-touchpoint, proactive";
  if (investor.engagementMomentum === "positive") return "Responsive, open";
  if (investor.engagementMomentum === "negative") return "Minimal, reactive";
  return "Periodic, formal";
}

function getDecisionStructure(investor) {
  if (investor.type === "passive") return "Index committee / stewardship team";
  if (investor.type === "sovereign") return "Responsible investment unit";
  if (investor.type === "pension") return "Board & governance committee";
  return "PM-led with analyst input";
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

function getProvenanceBadges(investor) {
  const badges = [];
  const params = investor.stateParameters || [];
  const hasObserved = params.some((p) => p.provenance === "observed");
  const hasInferred = params.some((p) => p.provenance === "inferred");
  const hasTeam = params.some((p) => p.provenance === "team_assessed");
  if (hasObserved) badges.push("observed");
  if (hasInferred) badges.push("inferred");
  if (hasTeam) badges.push("team_assessed");
  return badges;
}

const provenanceLabels = {
  observed: "Observed",
  inferred: "Inferred",
  team_assessed: "Team Assessed",
};

// ── Behavioral indicator bar ────────────────────────────
function IndicatorBar({ label, value, color, isRisk = false }) {
  const isHighRisk = isRisk && value >= 60;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-[11px] font-medium uppercase tracking-[0.1em]",
          isHighRisk ? "text-red-600 font-bold" : "text-slate-400"
        )}>
          {label}
          {isHighRisk && (
            <span className="ml-1.5 inline-flex items-center rounded bg-red-100 px-1 py-0.5 text-[9px] font-bold uppercase text-red-700">
              ALERT
            </span>
          )}
        </span>
        <span className={cn(
          "font-mono font-medium",
          isHighRisk ? "text-lg text-red-600 font-bold" : "text-xs text-slate-700"
        )}>
          {value}%
        </span>
      </div>
      <div className={cn(
        "w-full rounded-full bg-slate-100",
        isHighRisk ? "h-3.5" : "h-1.5"
      )}>
        <div
          className={cn(
            "rounded-full transition-all",
            color,
            isHighRisk ? "h-3.5" : "h-1.5"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
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
        holdingPeriod: getHoldingPeriod(inv),
        governancePattern: getGovernancePattern(inv),
        communicationStyle: getCommunicationStyle(inv),
        decisionStructure: getDecisionStructure(inv),
        signalNote: getSignalNote(archetype),
        provenanceBadges: getProvenanceBadges(inv),
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
    // Sort: at-risk first, then growing, then stable
    return result.sort((a, b) => {
      const riskOrder = { "Silent reducer": 0, "Cautious trimmer": 1, "Governance steward": 2, "Passive tracker": 3, "Active accumulator": 4 };
      return (riskOrder[a.archetype] ?? 3) - (riskOrder[b.archetype] ?? 3);
    });
  }, [enriched, archetypeFilter, typeFilter]);

  // Summary counts
  const atRiskCount = enriched.filter(
    (i) => i.archetype === "Silent reducer" || i.archetype === "Cautious trimmer"
  ).length;
  const growingCount = enriched.filter(
    (i) => i.archetype === "Active accumulator"
  ).length;
  const avgRisk = enriched.length > 0
    ? Math.round(enriched.reduce((s, i) => s + i.scores.risk, 0) / enriched.length)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Investor Personas
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          How your investors behave, who's at risk, and how to engage each one
        </p>
      </div>

      {/* Hero persona summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-5 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-red-400">At Risk</p>
          <p className="mt-1 text-5xl font-mono font-bold text-red-600">{atRiskCount}</p>
          <p className="mt-1 text-xs text-red-500">Declining or reducing</p>
        </div>
        <div className="rounded-lg border border-red-100 bg-white p-5 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">Avg Risk Score</p>
          <p className={cn(
            "mt-1 text-4xl font-mono font-bold",
            avgRisk >= 50 ? "text-red-600" : avgRisk >= 35 ? "text-amber-600" : "text-emerald-600"
          )}>
            {avgRisk}%
          </p>
          <p className="mt-1 text-xs text-slate-500">Across all personas</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-emerald-400">Growing</p>
          <p className="mt-1 text-4xl font-mono font-bold text-emerald-600">{growingCount}</p>
          <p className="mt-1 text-xs text-emerald-500">Accumulating position</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">Total Personas</p>
          <p className="mt-1 text-3xl font-mono font-bold text-slate-700">{enriched.length}</p>
          <p className="mt-1 text-xs text-slate-400">Tracked investors</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
          Filters
        </span>
        <select
          value={archetypeFilter}
          onChange={(e) => setArchetypeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
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
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* Persona Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((inv) => {
            const isAtRisk = inv.archetype === "Silent reducer" || inv.archetype === "Cautious trimmer";
            const isGrowing = inv.archetype === "Active accumulator";

            return (
              <div
                key={inv.id}
                className={cn(
                  "flex flex-col rounded-lg border-2 p-5 transition-all",
                  getCardStyle(inv.archetype)
                )}
              >
                {/* Archetype Badge - visual anchor */}
                <div className="mb-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold tracking-tight",
                      archetypeColors[inv.archetype] ||
                        "bg-slate-100 text-slate-700 border-slate-200",
                      isAtRisk && "ring-2 ring-red-200"
                    )}
                  >
                    <span className="font-mono mr-1.5 text-xs opacity-60">
                      {archetypeIcons[inv.archetype]}
                    </span>
                    {inv.archetype}
                  </span>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <Link
                      to={`/investors/${inv.id}`}
                      className={cn(
                        "font-semibold hover:underline",
                        isAtRisk
                          ? "text-base text-red-900 hover:text-red-700"
                          : "text-sm text-slate-900 hover:text-slate-600"
                      )}
                    >
                      {inv.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">
                        {typeLabels[inv.type]}
                      </span>
                      <span className="text-slate-300">&middot;</span>
                      <span className="font-mono text-xs text-slate-500">
                        {inv.holdingPct}%
                      </span>
                    </div>
                  </div>
                  {/* Risk score badge */}
                  {inv.scores.risk >= 60 && (
                    <span className="inline-flex items-center rounded-lg bg-red-600 px-2 py-1 font-mono text-xs font-bold text-white">
                      {inv.scores.risk}% risk
                    </span>
                  )}
                </div>

                {/* Key Characteristics */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                    Key Characteristics
                  </h4>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <dt className="text-slate-400">Holding period</dt>
                      <dd className={cn(
                        "font-medium",
                        inv.holdingPeriod === "Reducing" ? "text-red-600 font-bold" : "text-slate-700"
                      )}>
                        {inv.holdingPeriod}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Governance</dt>
                      <dd className="font-medium text-slate-700">
                        {inv.governancePattern}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Communication</dt>
                      <dd className={cn(
                        "font-medium",
                        inv.communicationStyle.includes("Minimal") ? "text-red-600 font-bold" : "text-slate-700"
                      )}>
                        {inv.communicationStyle}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Decisions</dt>
                      <dd className="font-medium text-slate-700">
                        {inv.decisionStructure}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Behavioral Indicators */}
                <div className="space-y-2.5 mb-4">
                  <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                    Behavioral Indicators
                  </h4>
                  <IndicatorBar
                    label="Risk"
                    value={inv.scores.risk}
                    isRisk
                    color={
                      inv.scores.risk >= 60
                        ? "bg-red-500"
                        : inv.scores.risk >= 35
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }
                  />
                  <IndicatorBar
                    label="Engagement"
                    value={inv.scores.engagement}
                    color="bg-blue-500"
                  />
                  <IndicatorBar
                    label="Governance"
                    value={inv.scores.governance}
                    color="bg-violet-500"
                  />
                </div>

                {/* Signal Interpretation */}
                {inv.signalNote && (
                  <div className={cn(
                    "mb-4 rounded-lg p-3",
                    isAtRisk
                      ? "bg-red-100 border-2 border-red-200"
                      : isGrowing
                      ? "bg-emerald-50 border border-emerald-100"
                      : "bg-slate-50"
                  )}>
                    <p className={cn(
                      "font-mono text-xs leading-relaxed",
                      isAtRisk
                        ? "text-red-800 font-bold"
                        : "text-slate-600"
                    )}>
                      {inv.signalNote}
                    </p>
                  </div>
                )}

                {/* Provenance Badges */}
                {inv.provenanceBadges.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                    {inv.provenanceBadges.map((p) => (
                      <Badge key={p} variant={p}>
                        {provenanceLabels[p]}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={UserCircle}
          title="No personas found"
          description="Try adjusting your filters."
        />
      )}
    </div>
  );
}
