import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  XCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  ListChecks,
  FileText,
  Users,
  Activity,
  Radio,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Sparkline } from "../components/ui/Sparkline";
import { ConfidenceBadge } from "../components/ui/ConfidenceBadge";
import { EmptyState } from "../components/ui/EmptyState";
import {
  getSignal,
  getInvestor,
  getSignalsForInvestor,
  getActionsForInvestor,
  getTimelineForInvestor,
  actions,
} from "../data/mock-data";

const TODAY = "2026-04-01";

// ── Helpers ──────────────────────────────────────────────────

const urgencyDotColor = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

const stateLabels = {
  new: "New",
  reviewing: "Reviewing",
  confirmed: "Confirmed",
  action_created: "Action Created",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const typeLabels = {
  retention_risk: "Retention Risk",
  influence_opportunity: "Influence Opportunity",
  governance_management: "Governance",
  information_gap: "Information Gap",
  relationship_maintenance: "Relationship",
};

const actionStateLabels = {
  planned: "Planned",
  preparing: "Preparing",
  in_progress: "In Progress",
  awaiting_logging: "Awaiting Logging",
  completed: "Completed",
};

const actionStateBadgeVariant = {
  planned: "new",
  preparing: "reviewing",
  in_progress: "confirmed",
  awaiting_logging: "action_created",
  completed: "resolved",
};

const typeStyles = {
  passive: "bg-slate-100 text-slate-700",
  active: "bg-blue-50 text-blue-700",
  pension: "bg-emerald-50 text-emerald-700",
  sovereign: "bg-violet-50 text-violet-700",
};

function relativeDate(dateStr) {
  const diff = Math.floor(
    (new Date(TODAY) - new Date(dateStr)) / (1000 * 60 * 60 * 24)
  );
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ── State Transition Buttons ─────────────────────────────────

const stateTransitions = {
  new: [
    { target: "reviewing", label: "Start Review", icon: Eye },
    { target: "dismissed", label: "Dismiss", icon: XCircle },
  ],
  reviewing: [
    { target: "confirmed", label: "Confirm", icon: CheckCircle2 },
    { target: "dismissed", label: "Dismiss", icon: XCircle },
  ],
  confirmed: [
    { target: "action_created", label: "Create Action", icon: ListChecks },
    { target: "resolved", label: "Resolve", icon: CheckCircle2 },
  ],
  action_created: [
    { target: "resolved", label: "Resolve", icon: CheckCircle2 },
  ],
  resolved: [],
  dismissed: [
    { target: "new", label: "Reopen", icon: Radio },
  ],
};

function ActionBar({ signal, navigate }) {
  const transitions = stateTransitions[signal.state] ?? [];

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="flex items-center gap-2">
        <Badge variant={signal.state}>{stateLabels[signal.state]}</Badge>
        {transitions.map((t) => (
          <button
            key={t.target}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              t.target === "dismissed"
                ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
                : "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
            )}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Summary Card ─────────────────────────────────────────────

function SummaryCard({ signal }) {
  return (
    <Card title="Summary">
      <p className="text-sm leading-relaxed text-slate-700">
        {signal.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant={signal.type}>{typeLabels[signal.type]}</Badge>
        <Badge variant={signal.urgency}>
          {signal.urgency.charAt(0).toUpperCase() + signal.urgency.slice(1)}{" "}
          urgency
        </Badge>
        <ConfidenceBadge level={signal.confidence} showLabel />
        <span className="ml-auto text-xs text-slate-400">
          Detected {formatDate(signal.detectedAt)} &middot; Source:{" "}
          {signal.source}
        </span>
      </div>
      {signal.parameters && signal.parameters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {signal.parameters.map((p, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5"
            >
              <span className="text-xs text-slate-400">{p.label}</span>
              <span className="ml-2 text-xs font-medium text-slate-700">
                {p.value}
              </span>
              {p.provenance && (
                <Badge
                  variant={p.provenance}
                  className="ml-2 text-[10px]"
                >
                  {p.provenance}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Observed Facts Card ──────────────────────────────────────

function ObservedFactsCard({ signal }) {
  const investor = getInvestor(signal.investorId);
  const timeline = getTimelineForInvestor(signal.investorId).slice(0, 5);

  // Use timeline events as observed facts since the data model doesn't have per-signal facts
  const facts = timeline.map((ev) => ({
    text: ev.description,
    timestamp: ev.date,
    source: ev.type.charAt(0).toUpperCase() + ev.type.slice(1),
  }));

  if (facts.length === 0) return null;

  return (
    <Card variant="fact" className="border-l-4 border-l-blue-400">
      <div className="mb-3 flex items-center gap-2">
        <FileText size={14} className="text-blue-500" />
        <h3 className="text-sm font-semibold text-slate-900">
          Observed facts
        </h3>
      </div>
      <div className="space-y-3">
        {facts.map((fact, i) => (
          <div
            key={i}
            className="rounded-lg border border-blue-100 bg-white/70 p-3"
          >
            <p className="text-sm text-slate-700">{fact.text}</p>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                {formatDate(fact.timestamp)}
              </span>
              <span>Source: {fact.source}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── System Interpretation Card ───────────────────────────────

function InterpretationCard({ signal }) {
  // Build interpretation from available data
  const confidenceDecomposition = [
    { factor: "Data quality", level: signal.confidence },
    {
      factor: "Pattern clarity",
      level: signal.confidence === "high" ? "high" : "medium",
    },
    { factor: "Causal inference", level: "medium" },
  ];

  return (
    <Card variant="inference" className="border-l-4 border-l-amber-400">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb size={14} className="text-amber-500" />
        <h3 className="text-sm font-semibold text-slate-900">
          System interpretation
        </h3>
      </div>

      <p className="text-sm leading-relaxed text-slate-700">
        {signal.description}
      </p>

      {/* Confidence bar */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-slate-500">
          Confidence decomposition
        </p>
        <div className="space-y-2">
          {confidenceDecomposition.map((item, i) => {
            const widths = { high: "w-full", medium: "w-2/3", low: "w-1/3" };
            const colors = {
              high: "bg-emerald-500",
              medium: "bg-amber-400",
              low: "bg-red-400",
            };
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-28 text-xs text-slate-500">
                  {item.factor}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      widths[item.level],
                      colors[item.level]
                    )}
                  />
                </div>
                <span className="w-14 text-right text-xs capitalize text-slate-400">
                  {item.level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Limiting factors */}
      <div className="mt-4">
        <p className="mb-1.5 text-xs font-medium text-slate-500">
          Limiting factors
        </p>
        <ul className="space-y-1">
          <li className="flex items-start gap-2 text-xs text-slate-600">
            <AlertTriangle
              size={12}
              className="mt-0.5 flex-shrink-0 text-amber-400"
            />
            Data freshness may vary; some sources lag by days or weeks
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-600">
            <AlertTriangle
              size={12}
              className="mt-0.5 flex-shrink-0 text-amber-400"
            />
            Correlation does not imply causation for inferred signals
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-600">
            <AlertTriangle
              size={12}
              className="mt-0.5 flex-shrink-0 text-amber-400"
            />
            Internal investor mandate changes cannot be directly confirmed
          </li>
        </ul>
      </div>
    </Card>
  );
}

// ── Alternative Explanations ─────────────────────────────────

function AlternativeExplanations({ signal }) {
  // Generate contextual alternatives based on signal type
  const alternativesByType = {
    retention_risk: [
      {
        explanation: "Routine portfolio rebalancing",
        reasoning:
          "The observed changes may be part of regular portfolio rebalancing rather than a fundamental reassessment of the investment thesis.",
      },
      {
        explanation: "Sector-wide rotation",
        reasoning:
          "Broader sector rotation could be driving the changes without company-specific implications.",
      },
    ],
    influence_opportunity: [
      {
        explanation: "Standard accumulation pattern",
        reasoning:
          "Position increases may reflect index rebalancing or fund flow mechanics rather than active conviction.",
      },
    ],
    governance_management: [
      {
        explanation: "Standard annual policy refresh",
        reasoning:
          "Governance policy updates often include incremental language changes that don't materially alter voting behavior.",
      },
    ],
    information_gap: [
      {
        explanation: "Routine organizational change",
        reasoning:
          "Team restructures are common and may not signal any change in the investor's stance toward our company.",
      },
    ],
    relationship_maintenance: [
      {
        explanation: "No action required",
        reasoning:
          "The relationship is in good standing and no proactive outreach is needed beyond standard cadence.",
      },
    ],
  };

  const alternatives = alternativesByType[signal.type] ?? [];

  if (alternatives.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare size={14} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900">
          Alternative explanations
        </h3>
      </div>
      <div className="space-y-3">
        {alternatives.map((alt, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-sm font-medium text-slate-800">
              {alt.explanation}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {alt.reasoning}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recommended Actions Card ─────────────────────────────────

function RecommendedActionsCard({ signal, navigate }) {
  const signalActions = actions.filter((a) => a.signalId === signal.id);
  const investor = getInvestor(signal.investorId);
  const contact = investor?.contacts?.[0];

  return (
    <Card variant="recommendation" className="border-l-4 border-l-emerald-400">
      <div className="mb-3 flex items-center gap-2">
        <ListChecks size={14} className="text-emerald-500" />
        <h3 className="text-sm font-semibold text-slate-900">
          Recommended actions
        </h3>
      </div>

      {/* Primary recommendation */}
      <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Primary action
            </span>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {signalActions.length > 0
                ? signalActions[0].objective
                : `Engage ${contact?.name ?? "primary contact"} to address this signal`}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-slate-400">Contact</span>
            <p className="text-sm text-slate-700">
              {contact?.name ?? "-"}
              {contact?.role && (
                <span className="text-slate-400"> &middot; {contact.role}</span>
              )}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Channel</span>
            <p className="text-sm text-slate-700">
              {signalActions.length > 0 ? signalActions[0].channel : "Email"}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Objective</span>
            <p className="text-sm text-slate-700">
              {signalActions.length > 0
                ? signalActions[0].objective
                : "Understand current stance and reinforce relationship"}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Timeframe</span>
            <p className="text-sm text-slate-700">
              {signalActions.length > 0
                ? `By ${signalActions[0].dueDate}`
                : "Within 5 business days"}
            </p>
          </div>
          <div className="col-span-2">
            <span className="text-xs text-slate-400">Message angle</span>
            <p className="text-sm text-slate-700">
              {signalActions.length > 0
                ? signalActions[0].messageAngle
                : "Proactive engagement demonstrating awareness and commitment"}
            </p>
          </div>
          <div className="col-span-2">
            <span className="text-xs text-slate-400">Success criteria</span>
            <p className="text-sm text-slate-700">
              {signalActions.length > 0
                ? signalActions[0].successCriteria
                : "Clear understanding of investor stance; next steps defined"}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() =>
              navigate(`/actions/new?signal=${signal.id}`)
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <ListChecks size={14} />
            Create action
          </button>

          {signalActions.length > 0 && (
            <span className="ml-3 text-xs text-slate-400">
              {signalActions.length} action{signalActions.length !== 1 && "s"}{" "}
              already linked
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

// ── Sidebar: Relationship Summary ────────────────────────────

function RelationshipSummary({ investor }) {
  if (!investor) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Relationship
      </h4>
      <p className="mt-2 text-sm font-semibold text-slate-900">
        {investor.name}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            typeStyles[investor.type] ?? "bg-slate-100 text-slate-700"
          )}
        >
          {investor.type}
        </span>
        <Badge variant={String(investor.tier)}>Tier {investor.tier}</Badge>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">Holding</span>
          <p className="text-lg font-semibold text-slate-900">
            {investor.holdingPct}%
          </p>
        </div>
        <Sparkline
          data={investor.holdingHistory}
          width={90}
          height={28}
          color={
            investor.holdingTrend === "up"
              ? "#22c55e"
              : investor.holdingTrend === "down"
              ? "#ef4444"
              : "#3b82f6"
          }
        />
      </div>
      {investor.engagementMomentum && (
        <div className="mt-2">
          <span className="text-xs text-slate-400">Momentum</span>
          <p className="text-sm capitalize text-slate-700">
            {investor.engagementMomentum}
          </p>
        </div>
      )}
      {investor.relationshipOwner && (
        <div className="mt-2">
          <span className="text-xs text-slate-400">Owner</span>
          <p className="text-sm text-slate-700">{investor.relationshipOwner}</p>
        </div>
      )}
    </div>
  );
}

// ── Sidebar: Recent Timeline ─────────────────────────────────

function RecentTimeline({ investorId }) {
  const events = getTimelineForInvestor(investorId).slice(0, 5);

  if (events.length === 0) return null;

  const typeIcons = {
    meeting: Users,
    email: MessageSquare,
    call: MessageSquare,
    signal: Radio,
    filing: FileText,
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Recent timeline
      </h4>
      <div className="mt-3 space-y-3">
        {events.map((ev) => {
          const Icon = typeIcons[ev.type] ?? Activity;
          return (
            <div key={ev.id} className="flex gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                <Icon size={12} className="text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-700 leading-relaxed">
                  {ev.description}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {relativeDate(ev.date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sidebar: Open Actions ────────────────────────────────────

function OpenActions({ investorId, navigate }) {
  const investorActions = getActionsForInvestor(investorId).filter(
    (a) => a.state !== "completed"
  );

  if (investorActions.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Open actions
      </h4>
      <div className="mt-3 space-y-2">
        {investorActions.map((a) => (
          <button
            key={a.id}
            onClick={() => navigate(`/actions/${a.id}`)}
            className="block w-full rounded-lg border border-slate-100 p-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <Badge variant={actionStateBadgeVariant[a.state]} className="text-[10px]">
                {actionStateLabels[a.state]}
              </Badge>
              <span className="text-xs text-slate-500">{a.dueDate}</span>
            </div>
            <p className="mt-1 text-xs text-slate-700 line-clamp-2">
              {a.objective}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Sidebar: Related Signals ─────────────────────────────────

function RelatedSignals({ signal, navigate }) {
  const related = getSignalsForInvestor(signal.investorId).filter(
    (s) => s.id !== signal.id
  );

  if (related.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Related signals
      </h4>
      <div className="mt-3 space-y-2">
        {related.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(`/signals/${s.id}`)}
            className="block w-full rounded-lg border border-slate-100 p-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  urgencyDotColor[s.urgency]
                )}
              />
              <Badge variant={s.type} className="text-[10px]">
                {typeLabels[s.type]}
              </Badge>
              <Badge variant={s.state} className="text-[10px]">
                {stateLabels[s.state]}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-700 line-clamp-2">
              {s.headline}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export function SignalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const signal = getSignal(id);

  if (!signal) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Radio}
          title="Signal not found"
          description={`No signal with ID "${id}" exists. It may have been removed.`}
          action={{ label: "Back to signals", onClick: () => navigate("/signals") }}
        />
      </div>
    );
  }

  const investor = getInvestor(signal.investorId);

  return (
    <div className="p-6">
      {/* Action bar */}
      <ActionBar signal={signal} navigate={navigate} />

      {/* Title */}
      <div className="mt-4 mb-6">
        <h1 className="text-lg font-bold text-slate-900">{signal.headline}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {investor?.name ?? "Unknown investor"} &middot; Detected{" "}
          {formatDate(signal.detectedAt)}
        </p>
      </div>

      {/* Main layout */}
      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-6">
          <SummaryCard signal={signal} />
          <ObservedFactsCard signal={signal} />
          <InterpretationCard signal={signal} />
          <AlternativeExplanations signal={signal} />
          <RecommendedActionsCard signal={signal} navigate={navigate} />
        </div>

        {/* Right sidebar */}
        <aside className="hidden w-80 flex-shrink-0 lg:block">
          <div className="sticky top-6 space-y-4">
            <RelationshipSummary investor={investor} />
            <RecentTimeline investorId={signal.investorId} />
            <OpenActions investorId={signal.investorId} navigate={navigate} />
            <RelatedSignals signal={signal} navigate={navigate} />
          </div>
        </aside>
      </div>
    </div>
  );
}
