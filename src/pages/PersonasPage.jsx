import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { UserCircle, Filter } from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { investors, signals, getSignalsForInvestor } from "../data/mock-data";

// ── Archetype derivation ────────────────────────────────
function deriveArchetype(investor) {
  const trend = investor.holdingTrend;
  const type = investor.type;
  const momentum = investor.engagementMomentum;
  const govSignals = getSignalsForInvestor(investor.id).filter(
    (s) => s.type === "governance_management"
  );

  if (trend === "up" && (type === "active")) return "Active accumulator";
  if (trend === "down" && momentum === "negative") return "Silent reducer";
  if (type === "passive" && trend !== "down") return "Passive tracker";
  if (type === "sovereign" || type === "pension") return "Governance steward";
  if (trend === "down" && type === "active") return "Cautious trimmer";
  if (govSignals.length > 0) return "Governance steward";
  return "Passive tracker";
}

const archetypeColors = {
  "Active accumulator": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Silent reducer": "bg-red-50 text-red-700 ring-red-600/20",
  "Passive tracker": "bg-sky-50 text-sky-700 ring-sky-600/20",
  "Governance steward": "bg-violet-50 text-violet-700 ring-violet-600/20",
  "Cautious trimmer": "bg-amber-50 text-amber-700 ring-amber-600/20",
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
  const govSignals = allSignals.filter((s) => s.type === "governance_management");

  const engagementBase =
    investor.engagementMomentum === "positive"
      ? 75
      : investor.engagementMomentum === "neutral"
      ? 50
      : 25;
  const engagement = Math.min(100, engagementBase + investor.contacts.length * 10);

  const governance = Math.min(
    100,
    40 +
      govSignals.length * 20 +
      (investor.type === "sovereign" || investor.type === "pension" ? 20 : 0)
  );

  const riskBase =
    investor.holdingTrend === "down" ? 70 : investor.holdingTrend === "neutral" ? 35 : 15;
  const risk = Math.min(
    100,
    riskBase +
      allSignals.filter((s) => s.type === "retention_risk").length * 15
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
  if (investor.type === "sovereign" || investor.type === "pension") return "Policy-driven voter";
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

function IndicatorBar({ label, value, color }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-medium text-slate-700">{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div
          className={cn("h-1.5 rounded-full transition-all", color)}
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
    return result;
  }, [enriched, archetypeFilter, typeFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Investor Personas</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Behavioral archetypes derived from holding patterns, engagement data, and
          governance signals
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-slate-400" />
        <select
          value={archetypeFilter}
          onChange={(e) => setArchetypeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((inv) => (
            <Card key={inv.id} className="flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <Link
                    to={`/investors/${inv.id}`}
                    className="text-sm font-semibold text-slate-900 hover:text-primary-600 hover:underline"
                  >
                    {inv.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {typeLabels[inv.type]} &middot; {inv.holdingPct}%
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
                    archetypeColors[inv.archetype] ||
                      "bg-slate-100 text-slate-700 ring-slate-500/20"
                  )}
                >
                  {inv.archetype}
                </span>
              </div>

              {/* Key Characteristics */}
              <div className="space-y-2 mb-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Key Characteristics
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400">Holding period</span>
                    <p className="font-medium text-slate-700">
                      {inv.holdingPeriod}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Governance</span>
                    <p className="font-medium text-slate-700">
                      {inv.governancePattern}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Communication</span>
                    <p className="font-medium text-slate-700">
                      {inv.communicationStyle}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Decisions</span>
                    <p className="font-medium text-slate-700">
                      {inv.decisionStructure}
                    </p>
                  </div>
                </div>
              </div>

              {/* Behavioral Indicators */}
              <div className="space-y-2 mb-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Behavioral Indicators
                </h4>
                <div className="space-y-2">
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
                  <IndicatorBar
                    label="Risk"
                    value={inv.scores.risk}
                    color={
                      inv.scores.risk >= 60
                        ? "bg-red-500"
                        : inv.scores.risk >= 35
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }
                  />
                </div>
              </div>

              {/* Signal Interpretation */}
              {inv.signalNote && (
                <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {inv.signalNote}
                  </p>
                </div>
              )}

              {/* Provenance Badges */}
              {inv.provenanceBadges.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                  {inv.provenanceBadges.map((p) => (
                    <Badge key={p} variant={p}>
                      {provenanceLabels[p]}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
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
