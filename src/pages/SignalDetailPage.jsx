import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Clock,
  TrendingUp,
  Shield,
  FileText,
  Users,
  Radio,
  CheckCircle2,
  Eye,
  XCircle,
  ListChecks,
  Zap,
  MoreHorizontal,
  ExternalLink,
  BarChart3,
  Globe,
  Database,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { ConfidenceBadge } from "../components/ui/ConfidenceBadge";
import { ActionCard } from "../components/ui/ActionCard";
import { EmptyState } from "../components/ui/EmptyState";
import {
  signals,
  getSignal,
  getInvestor,
  getSignalsForInvestor,
  getActionsForInvestor,
  actions,
} from "../data/mock-data";

const TODAY = "2026-04-01";

// -- Helpers -------------------------------------------------------

const urgencyConfig = {
  high: { label: "HIGH URGENCY", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  medium: { label: "MEDIUM URGENCY", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  low: { label: "LOW URGENCY", icon: null, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
};

const typeLabels = {
  retention_risk: "TRADING",
  influence_opportunity: "FUND FLOW",
  governance_management: "GOVERNANCE",
  information_gap: "DISCLOSURES",
  relationship_maintenance: "RELATIONSHIP",
};

const sourceIcons = {
  "13F Filing Analysis": BarChart3,
  "Public Filing": FileText,
  "Holding Analysis": TrendingUp,
  "CRM Analysis": Database,
  "Direct Communication": Users,
  "LinkedIn Intelligence": Globe,
  "Public Report": ExternalLink,
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// -- Page -----------------------------------------------------------

export function SignalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const signal = getSignal(id);

  if (!signal) {
    return (
      <div className="p-6">
        <Card>
          <EmptyState
            icon={Radio}
            title="Signal not found"
            description={`No signal with ID "${id}" exists.`}
            action={{ label: "Back to signals", onClick: () => navigate("/signals") }}
          />
        </Card>
      </div>
    );
  }

  const investor = getInvestor(signal.investorId);
  const urg = urgencyConfig[signal.urgency];
  const signalActions = actions.filter((a) => a.signalId === signal.id);
  const relatedSignals = getSignalsForInvestor(signal.investorId).filter(
    (s) => s.id !== signal.id
  );
  const contact = investor?.contacts?.[0];
  const isHigh = signal.urgency === "high";

  // Contextual content
  const whyItMatters = signal.description;

  const likelyImpact =
    signal.urgency === "high"
      ? "High potential impact on shareholder base composition and investor relations strategy. Immediate attention recommended to prevent further deterioration of the relationship or position."
      : signal.urgency === "medium"
      ? "Moderate impact expected. Proactive engagement recommended to maintain relationship quality and capitalize on opportunities before the window closes."
      : "Low immediate impact. Monitor the situation and address within the standard engagement cadence. No urgent action required.";

  const recommendedAction =
    signalActions.length > 0
      ? signalActions[0].objective
      : signal.type === "retention_risk"
      ? "Schedule direct engagement with the investor to understand their concerns and present the updated investment thesis."
      : signal.type === "governance_management"
      ? "Review policy changes and prepare a compliance gap analysis. Proactively communicate alignment efforts."
      : signal.type === "influence_opportunity"
      ? "Prepare tailored materials highlighting strategic alignment and schedule a deepening engagement."
      : signal.type === "information_gap"
      ? "Update internal records and establish contact with newly assigned personnel."
      : "Maintain engagement cadence and leverage positive developments in upcoming communications.";

  const recommendedChannel = signalActions.length > 0 ? signalActions[0].channel : "Email";
  const recommendedTimeline = signalActions.length > 0 ? `By ${signalActions[0].dueDate}` : "Within 5 business days";

  // Build evidence source entries
  const SourceIcon = sourceIcons[signal.source] || FileText;

  // Build action cards data
  const actionCards = [];
  if (signalActions.length > 0) {
    signalActions.forEach((a, idx) => {
      actionCards.push({
        id: a.id,
        isPrimary: idx === 0,
        title: getInvestor(a.investorId)?.name ?? "Unknown",
        description: a.objective,
        channel: a.channel,
        timing: `Due ${a.dueDate}`,
      });
    });
  } else {
    actionCards.push({
      id: "rec-primary",
      isPrimary: true,
      title: investor?.name ?? "Unknown",
      description: recommendedAction,
      channel: recommendedChannel,
      timing: recommendedTimeline,
    });
  }
  // Pad to 3 if needed
  if (actionCards.length < 3 && signalActions.length > 0) {
    actionCards.push({
      id: "rec-secondary-1",
      isPrimary: false,
      title: "Follow-up Engagement",
      description: `Prepare follow-up materials for ${investor?.name ?? "investor"} based on initial response.`,
      channel: "Email",
      timing: "Within 10 business days",
    });
  }
  if (actionCards.length < 3) {
    actionCards.push({
      id: "rec-secondary-2",
      isPrimary: false,
      title: "Monitor & Report",
      description: `Track position changes and engagement metrics for ${investor?.name ?? "investor"} over next quarter.`,
      channel: "Internal",
      timing: "Ongoing",
    });
  }

  // Trend data
  const trendColor = {
    up: "text-emerald-600",
    down: "text-red-600",
    neutral: "text-slate-500",
  };
  const trendLabel = {
    up: "INCREASING",
    down: "DECREASING",
    neutral: "STABLE",
  };
  const trendPillBg = {
    up: "bg-emerald-50 border-emerald-200 text-emerald-700",
    down: "bg-red-50 border-red-200 text-red-700",
    neutral: "bg-slate-50 border-slate-200 text-slate-600",
  };

  return (
    <div className="p-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-900 mb-6"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* ── MAIN COLUMN ──────────────────────────────────────── */}
        <div className="min-w-0 flex-1 space-y-6">

          {/* 1. Badges row */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={signal.urgency} kind="urgency" />
            <Badge variant={signal.type} kind="type" />
            <ConfidenceBadge mode="percentage" level={signal.confidence} />
          </div>

          {/* 2. HUGE title */}
          <h1 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight">
            {signal.headline}
          </h1>

          {/* 3. Investor header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
              {investor?.name?.charAt(0) ?? "?"}
            </div>
            <span className="text-sm font-semibold text-slate-900">
              {investor?.name ?? "Unknown"}
            </span>
            <span className="text-sm text-slate-400">
              {investor?.type ?? "investor"} &middot; Tier {investor?.tier ?? "?"}
            </span>
          </div>

          {/* 4. Why this matters */}
          <div>
            <p className="text-sm font-semibold italic text-slate-800 mb-3">Why this matters</p>
            <div className="border-l-4 border-slate-200 pl-4">
              <p className="text-sm text-slate-600 leading-relaxed">{whyItMatters}</p>
            </div>
          </div>

          {/* 5. Likely impact */}
          <div className={cn(
            "rounded-lg border p-5",
            isHigh ? "border-red-200 bg-red-50/30" : "border-slate-200 bg-white"
          )}>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">
              LIKELY IMPACT
            </p>
            <p className={cn(
              "text-sm leading-relaxed",
              isHigh ? "text-red-900 font-medium" : "text-slate-700"
            )}>
              {likelyImpact}
            </p>
          </div>

          {/* 6. Recommended Actions -- 3-col grid */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-4">
              RECOMMENDED ACTIONS
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {actionCards.map((ac, idx) => (
                <ActionCard
                  key={ac.id}
                  isPrimary={ac.isPrimary}
                  title={ac.title}
                  description={ac.description}
                  channel={ac.channel}
                  timing={ac.timing}
                  icon={ac.isPrimary ? Zap : undefined}
                  onAction={() =>
                    navigate(
                      signalActions[idx]
                        ? `/actions/${signalActions[idx].id}`
                        : `/actions/new?signal=${signal.id}`
                    )
                  }
                />
              ))}
            </div>
          </section>

          {/* 7. Evidence sources */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">
              EVIDENCE SOURCES
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">
                <SourceIcon size={14} className="text-slate-400" />
                {signal.source}
              </span>
              {signal.parameters?.map((p, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                >
                  <span className="text-slate-400">{p.label}</span>
                  <span className="font-mono font-medium text-slate-700">{p.value}</span>
                </span>
              ))}
              <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">
                <Clock size={14} className="text-slate-400" />
                Detected {formatDate(signal.detectedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR (w-80) ───────────────────────────────────── */}
        <aside className="hidden w-80 flex-shrink-0 lg:block">
          <div className="sticky top-6 space-y-4">

            {/* Evidence section */}
            <Card>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">
                EVIDENCE
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <SourceIcon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{signal.source}</p>
                    <p className="text-[11px] text-slate-400">{formatDate(signal.detectedAt)}</p>
                  </div>
                </div>
                {signal.parameters?.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <BarChart3 size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{p.label}: {p.value}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{p.provenance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Triage Action CTA */}
            <button
              onClick={() => navigate(`/actions/new?signal=${signal.id}`)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-700 shadow-sm"
            >
              <Zap size={16} />
              Triage Action
            </button>

            {/* More button */}
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
              <MoreHorizontal size={16} />
              More
            </button>

            {/* Investor snapshot card */}
            {investor && (
              <Card>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">
                  INVESTOR SNAPSHOT
                </p>
                <p className="text-sm font-semibold text-slate-900">{investor.name}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    {investor.type}
                  </span>
                  <Badge variant={investor.tier} kind="tier" className="text-[9px] px-1.5 py-0" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">HOLDING</p>
                    <p className="mt-0.5 font-mono text-lg font-semibold text-slate-900">{investor.holdingPct}%</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">TRAJECTORY</p>
                    <p className="mt-1">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                          trendPillBg[investor.holdingTrend]
                        )}
                      >
                        {trendLabel[investor.holdingTrend]}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">MOMENTUM</p>
                    <p className="mt-0.5 text-sm capitalize text-slate-700">{investor.engagementMomentum}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">OWNER</p>
                    <p className="mt-0.5 text-sm text-slate-700">{investor.relationshipOwner}</p>
                  </div>
                </div>

                {investor.contacts && investor.contacts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-2">KEY CONTACTS</p>
                    <div className="space-y-1.5">
                      {investor.contacts.map((c) => (
                        <div key={c.id} className="text-xs text-slate-600">
                          <span className="font-medium text-slate-800">{c.name}</span>
                          {c.role && <span className="text-slate-400"> / {c.role}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Related signals */}
            {relatedSignals.length > 0 && (
              <Card>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">
                  RELATED SIGNALS
                </p>
                <div className="space-y-2">
                  {relatedSignals.map((s) => {
                    const sUrg = urgencyConfig[s.urgency];
                    return (
                      <button
                        key={s.id}
                        onClick={() => navigate(`/signals/${s.id}`)}
                        className="block w-full rounded-lg border border-slate-100 p-2.5 text-left transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={s.urgency} kind="urgency" className="text-[9px] px-1.5 py-0.5" />
                          <span className="text-[10px] text-slate-400">{typeLabels[s.type]}</span>
                        </div>
                        <p className="text-xs text-slate-700 line-clamp-2">{s.headline}</p>
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
