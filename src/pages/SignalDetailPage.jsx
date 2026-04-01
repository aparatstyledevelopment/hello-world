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
  medium: { label: "MEDIUM URGENCY", icon: Clock, color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200" },
  low: { label: "LOW URGENCY", icon: null, color: "text-gray-400", bg: "bg-gray-50", border: "border-gray-100" },
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
      <div className="p-4 md:p-6">
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
    up: "text-gray-700",
    down: "text-red-600",
    neutral: "text-gray-400",
  };
  const trendLabel = {
    up: "INCREASING",
    down: "DECREASING",
    neutral: "STABLE",
  };
  const trendPillBg = {
    up: "bg-gray-100 border-gray-200 text-gray-700",
    down: "bg-red-50 border-red-200 text-red-700",
    neutral: "bg-gray-50 border-gray-200 text-gray-600",
  };

  return (
    <div className="p-4 md:p-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-black mb-6"
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
          <h1 className="text-3xl font-bold text-black leading-tight tracking-tight">
            {signal.headline}
          </h1>

          {/* 3. Investor header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
              {investor?.name?.charAt(0) ?? "?"}
            </div>
            <span className="text-sm font-semibold text-black">
              {investor?.name ?? "Unknown"}
            </span>
            <span className="text-sm text-gray-400">
              {investor?.type ?? "investor"} &middot; Tier {investor?.tier ?? "?"}
            </span>
          </div>

          {/* 4. Why this matters */}
          <div>
            <p className="text-sm font-semibold italic text-gray-700 mb-3">Why this matters</p>
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
              <p className="text-sm text-gray-600 leading-relaxed">{whyItMatters}</p>
            </div>
          </div>

          {/* 5. Likely impact */}
          <div className={cn(
            "rounded-lg border p-5",
            isHigh ? "border-red-200 bg-red-50/30" : "border-gray-200 bg-white"
          )}>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">
              LIKELY IMPACT
            </p>
            <p className={cn(
              "text-sm leading-relaxed",
              isHigh ? "text-red-900 font-medium" : "text-gray-700"
            )}>
              {likelyImpact}
            </p>
          </div>

          {/* 6. Recommended Actions -- 3-col grid */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-4">
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

          {/* 7. Evidence & Raw Data */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-4">
              EVIDENCE & RAW DATA
            </p>

            {/* Source & Detection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <SourceIcon size={16} className="text-gray-400" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">SOURCE</span>
                </div>
                <p className="text-sm font-semibold text-black">{signal.source}</p>
                <p className="text-xs text-gray-400 mt-1">Detected {formatDate(signal.detectedAt)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={16} className="text-gray-400" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">CONFIDENCE</span>
                </div>
                <p className="text-sm font-semibold text-black capitalize">{signal.confidence}</p>
                <div className="mt-2 h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full transition-all bg-black"
                    style={{ width: signal.confidence === "high" ? "90%" : signal.confidence === "medium" ? "60%" : "30%" }}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">SIGNAL AGE</span>
                </div>
                <p className="text-sm font-semibold text-black">
                  {Math.floor((new Date("2026-04-01") - new Date(signal.detectedAt)) / (1000 * 60 * 60 * 24))} days
                </p>
                <p className="text-xs text-gray-400 mt-1">Since first detection</p>
              </div>
            </div>

            {/* Parameters as detailed data cards */}
            {signal.parameters && signal.parameters.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">RAW DATA POINTS</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {signal.parameters.map((p, i) => (
                    <div key={i} className="px-4 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                          <BarChart3 size={14} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{p.label}</p>
                          <p className="text-[11px] text-gray-400 capitalize">{p.provenance} data</p>
                        </div>
                      </div>
                      <span className="font-mono text-base font-bold text-black bg-gray-50 px-3 py-1.5 rounded-lg">
                        {p.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Holding trend chart for retention_risk signals */}
            {signal.type === "retention_risk" && investor?.holdingHistory && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">HOLDING TREND</p>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                    investor.holdingTrend === "down" ? "bg-red-50 text-red-700" : investor.holdingTrend === "up" ? "bg-gray-100 text-gray-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {investor.holdingTrend === "down" ? "DECLINING" : investor.holdingTrend === "up" ? "INCREASING" : "STABLE"}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  {investor.holdingHistory.map((val, i) => {
                    const max = Math.max(...investor.holdingHistory);
                    const min = Math.min(...investor.holdingHistory) * 0.9;
                    const pct = ((val - min) / (max - min)) * 100;
                    const barHeight = Math.max(pct, 10) * 0.64;
                    const isLast = i === investor.holdingHistory.length - 1;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className={cn("text-[10px] font-mono", isLast ? "font-bold text-black" : "text-gray-400")}>
                          {val}%
                        </span>
                        <div
                          className={cn(
                            "w-full rounded-t transition-all",
                            isLast ? "bg-red-600" : "bg-gray-200"
                          )}
                          style={{ height: `${barHeight}px` }}
                        />
                        <span className="text-[9px] text-gray-400">Q{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Influence opportunity - accumulation chart */}
            {signal.type === "influence_opportunity" && investor?.holdingHistory && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">ACCUMULATION TREND</p>
                  <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-[10px] font-semibold uppercase">
                    INCREASING
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  {investor.holdingHistory.map((val, i) => {
                    const max = Math.max(...investor.holdingHistory) * 1.1;
                    const min = Math.min(...investor.holdingHistory) * 0.9;
                    const pct = ((val - min) / (max - min)) * 100;
                    const barHeight = Math.max(pct, 10) * 0.64;
                    const isLast = i === investor.holdingHistory.length - 1;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className={cn("text-[10px] font-mono", isLast ? "font-bold text-black" : "text-gray-400")}>
                          {val}%
                        </span>
                        <div
                          className={cn(
                            "w-full rounded-t transition-all",
                            isLast ? "bg-black" : "bg-gray-200"
                          )}
                          style={{ height: `${barHeight}px` }}
                        />
                        <span className="text-[9px] text-gray-400">Q{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR (w-full lg:w-80) ───────────────────────────────────── */}
        <aside className="hidden w-full lg:w-80 flex-shrink-0 lg:block">
          <div className="sticky top-6 space-y-4">

            {/* Evidence section */}
            <Card>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">
                EVIDENCE
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <SourceIcon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{signal.source}</p>
                    <p className="text-[11px] text-gray-400">{formatDate(signal.detectedAt)}</p>
                  </div>
                </div>
                {signal.parameters?.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <BarChart3 size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{p.label}: {p.value}</p>
                      <p className="text-[11px] text-gray-400 capitalize">{p.provenance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Triage Action CTA */}
            <button
              onClick={() => navigate(`/actions/new?signal=${signal.id}`)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 shadow-sm"
            >
              <Zap size={16} />
              Triage Action
            </button>

            {/* More button */}
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <MoreHorizontal size={16} />
              More
            </button>

            {/* Investor snapshot card */}
            {investor && (
              <Card>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">
                  INVESTOR SNAPSHOT
                </p>
                <p className="text-sm font-semibold text-black">{investor.name}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                    {investor.type}
                  </span>
                  <Badge variant={investor.tier} kind="tier" className="text-[9px] px-1.5 py-0" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">HOLDING</p>
                    <p className="mt-0.5 font-mono text-lg font-semibold text-black">{investor.holdingPct}%</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">TRAJECTORY</p>
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
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">MOMENTUM</p>
                    <p className="mt-0.5 text-sm capitalize text-gray-700">{investor.engagementMomentum}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">OWNER</p>
                    <p className="mt-0.5 text-sm text-gray-700">{investor.relationshipOwner}</p>
                  </div>
                </div>

                {investor.contacts && investor.contacts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-2">KEY CONTACTS</p>
                    <div className="space-y-1.5">
                      {investor.contacts.map((c) => (
                        <div key={c.id} className="text-xs text-gray-600">
                          <span className="font-medium text-gray-700">{c.name}</span>
                          {c.role && <span className="text-gray-400"> / {c.role}</span>}
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
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">
                  RELATED SIGNALS
                </p>
                <div className="space-y-2">
                  {relatedSignals.map((s) => {
                    const sUrg = urgencyConfig[s.urgency];
                    return (
                      <button
                        key={s.id}
                        onClick={() => navigate(`/signals/${s.id}`)}
                        className="block w-full rounded-lg border border-gray-100 p-2.5 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={s.urgency} kind="urgency" className="text-[9px] px-1.5 py-0.5" />
                          <span className="text-[10px] text-gray-400">{typeLabels[s.type]}</span>
                        </div>
                        <p className="text-xs text-gray-700 line-clamp-2">{s.headline}</p>
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
