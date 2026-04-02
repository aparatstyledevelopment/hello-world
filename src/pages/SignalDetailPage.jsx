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
  Activity,
  Target,
  ChevronRight,
} from "lucide-react";
import { cn } from "../lib/utils";
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
  high: { label: "HIGH", color: "text-red-500", bg: "bg-red-50", border: "border-red-200/30", dot: "bg-red-500" },
  medium: { label: "MEDIUM", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200/20", dot: "bg-amber-500" },
  low: { label: "LOW", color: "text-zinc-400", bg: "bg-zinc-50", border: "border-zinc-200", dot: "bg-terminal-text-dim" },
};

const typeLabels = {
  retention_risk: "TRADING",
  influence_opportunity: "FUND FLOW",
  governance_management: "GOVERNANCE",
  information_gap: "DISCLOSURES",
  relationship_maintenance: "RELATIONSHIP",
};

const typeColors = {
  retention_risk: "text-red-500",
  influence_opportunity: "text-blue-500",
  governance_management: "text-amber-600",
  information_gap: "text-zinc-700",
  relationship_maintenance: "text-emerald-600",
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

function formatDateCompact(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
}

function getConfidencePct(level) {
  return level === "high" ? 92 : level === "medium" ? 65 : 35;
}

// -- Sub-components ------------------------------------------------

function TerminalBadge({ children, variant = "default", className }) {
  const styles = {
    default: "border-zinc-200 text-zinc-500 bg-zinc-50",
    amber: "border-amber-200 text-amber-700 bg-amber-50",
    red: "border-red-200 text-red-600 bg-red-50",
    cyan: "border-blue-200 text-blue-600 bg-blue-50",
    green: "border-emerald-200 text-emerald-700 bg-emerald-50",
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase border",
      styles[variant] || styles.default,
      className
    )}>
      {children}
    </span>
  );
}

function TerminalSectionLabel({ children, className }) {
  return (
    <p className={cn("text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-3", className)}>
      {children}
    </p>
  );
}

function TerminalDataRow({ label, value, accent = false, mono = true }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-200/50 last:border-b-0">
      <span className="text-[10px] tracking-[0.1em] uppercase text-zinc-400 font-mono">{label}</span>
      <span className={cn(
        "text-sm font-semibold",
        mono && "font-mono",
        accent ? "text-amber-600" : "text-zinc-700"
      )}>
        {value}
      </span>
    </div>
  );
}

// -- Page -----------------------------------------------------------

export function SignalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const signal = getSignal(id);

  if (!signal) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-8 text-center">
          <Radio size={32} className="text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-700 font-mono text-sm mb-2">SIGNAL NOT FOUND</p>
          <p className="text-zinc-400 font-mono text-xs mb-4">No signal with ID "{id}" exists in the system.</p>
          <button
            onClick={() => navigate("/signals")}
            className="font-mono text-xs text-amber-600 hover:text-amber-700 transition-colors uppercase tracking-wider"
          >
            &larr; Back to signals
          </button>
        </div>
      </div>
    );
  }

  const investor = getInvestor(signal.investorId);
  const urg = urgencyConfig[signal.urgency];
  const signalActions = actions.filter((a) => a.signalId === signal.id);
  const relatedSignals = getSignalsForInvestor(signal.investorId).filter(
    (s) => s.id !== signal.id
  );
  const isHigh = signal.urgency === "high";
  const confidencePct = getConfidencePct(signal.confidence);

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

  const trendLabel = {
    up: "INCREASING",
    down: "DECREASING",
    neutral: "STABLE",
  };
  const trendColor = {
    up: "text-emerald-600",
    down: "text-red-500",
    neutral: "text-zinc-400",
  };

  const signalAge = Math.floor((new Date("2026-04-01") - new Date(signal.detectedAt)) / (1000 * 60 * 60 * 24));

  return (
    <div className="p-4 md:p-6">
      <div>

        {/* ── TOP BAR ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-zinc-400 transition-colors hover:text-amber-700 uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-300 uppercase tracking-wider">
            <span>SIG/{signal.id}</span>
            <span className="text-terminal-border">|</span>
            <span>{formatDateCompact(signal.detectedAt)}</span>
            <span className="text-terminal-border">|</span>
            <span className="flex items-center gap-1">
              <span className={cn("inline-block w-1.5 h-1.5 rounded-full gentle-pulse", urg.dot)} />
              LIVE
            </span>
          </div>
        </div>

        {/* ── HEADER STRIP ──────────────────────────────────── */}
        <div className={cn(
          "rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-4 mb-4",
          isHigh && " border-red-200/20"
        )}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <TerminalBadge variant={isHigh ? "red" : signal.urgency === "medium" ? "amber" : "default"}>
                  <AlertTriangle size={10} />
                  {urg.label}
                </TerminalBadge>
                <TerminalBadge variant={signal.type === "retention_risk" ? "red" : signal.type === "influence_opportunity" ? "cyan" : "amber"}>
                  {typeLabels[signal.type]}
                </TerminalBadge>
                <TerminalBadge variant={signal.confidence === "high" ? "green" : signal.confidence === "medium" ? "amber" : "red"}>
                  <CheckCircle2 size={10} />
                  {confidencePct}%
                </TerminalBadge>
              </div>

              {/* Title */}
              <h1 className="text-xl md:text-2xl font-bold text-zinc-700 leading-tight tracking-tight font-mono">
                {signal.headline}
              </h1>

              {/* Investor line */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center justify-center w-7 h-7 rounded bg-zinc-50 border border-zinc-200 text-[10px] font-bold text-amber-600 font-mono">
                  {investor?.name?.charAt(0) ?? "?"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-700 font-mono">
                    {investor?.name ?? "Unknown"}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                    {investor?.type ?? "investor"} · T{investor?.tier ?? "?"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side quick stats */}
            <div className="hidden md:flex flex-col items-end gap-1 text-right">
              <div className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">Holding</div>
              <div className="text-2xl font-bold text-amber-600 font-mono font-mono">
                {investor?.holdingPct ?? "—"}%
              </div>
              <div className={cn(
                "text-[10px] font-mono font-semibold tracking-wider uppercase",
                trendColor[investor?.holdingTrend] ?? "text-zinc-400"
              )}>
                {trendLabel[investor?.holdingTrend] ?? "—"}
              </div>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ──────────────────────────────── */}
        <div className="flex gap-4">

          {/* ── MAIN COLUMN ──────────────────────────────────── */}
          <div className="min-w-0 flex-1 space-y-4">

            {/* Key Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "SOURCE", value: signal.source.split(" ").slice(0, 2).join(" "), icon: SourceIcon },
                { label: "CONFIDENCE", value: `${confidencePct}%`, icon: BarChart3 },
                { label: "SIGNAL AGE", value: `${signalAge}D`, icon: Clock },
                { label: "STATUS", value: signal.state?.toUpperCase() || "ACTIVE", icon: Activity },
              ].map((m) => (
                <div key={m.label} className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <m.icon size={12} className="text-zinc-400" />
                    <span className="text-[9px] font-mono font-semibold tracking-[0.15em] uppercase text-zinc-400">{m.label}</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-700 font-mono font-mono">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Analysis Panel */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-4">
              <TerminalSectionLabel>ANALYSIS</TerminalSectionLabel>
              <div className="space-y-4">
                {/* Why this matters */}
                <div>
                  <p className="text-[10px] font-mono font-semibold tracking-[0.12em] uppercase text-amber-600 mb-2">
                    WHY THIS MATTERS
                  </p>
                  <p className="text-[13px] text-zinc-700 leading-relaxed font-mono">
                    {whyItMatters}
                  </p>
                </div>

                <div className="border-t border-zinc-100" />

                {/* Likely impact */}
                <div>
                  <p className={cn(
                    "text-[10px] font-mono font-semibold tracking-[0.12em] uppercase mb-2",
                    isHigh ? "text-red-500" : "text-zinc-400"
                  )}>
                    LIKELY IMPACT
                  </p>
                  <div className={cn(
                    "rounded px-3 py-2.5 border",
                    isHigh
                      ? "border-red-200/20 bg-red-50"
                      : "border-zinc-200 bg-zinc-50"
                  )}>
                    <p className={cn(
                      "text-[13px] leading-relaxed font-mono",
                      isHigh ? "text-red-500" : "text-zinc-700"
                    )}>
                      {likelyImpact}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-4">
              <TerminalSectionLabel>RECOMMENDED ACTIONS</TerminalSectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {actionCards.map((ac, idx) => (
                  <div
                    key={ac.id}
                    className={cn(
                      "rounded border p-4 flex flex-col",
                      ac.isPrimary
                        ? "border-amber-200/30 bg-amber-50 "
                        : "border-zinc-200 bg-zinc-50"
                    )}
                  >
                    {ac.isPrimary && (
                      <span className="self-start bg-zinc-900 text-white rounded text-[9px] tracking-[0.12em] uppercase font-bold px-2 py-0.5 mb-3 font-mono">
                        NEXT BEST ACTION
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-zinc-700 font-mono">{ac.title}</h4>
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed font-mono">{ac.description}</p>

                    <div className="mt-3 pt-3 border-t border-zinc-200/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono tracking-[0.1em] text-zinc-300 uppercase">CHANNEL</span>
                        <span className="text-[11px] font-mono font-semibold text-zinc-700">{ac.channel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono tracking-[0.1em] text-zinc-300 uppercase">TIMING</span>
                        <span className="text-[11px] font-mono font-semibold text-zinc-700">{ac.timing}</span>
                      </div>
                    </div>

                    <div className="flex-1" />

                    <button
                      onClick={() =>
                        navigate(
                          signalActions[idx]
                            ? `/actions/${signalActions[idx].id}`
                            : `/actions/new?signal=${signal.id}`
                        )
                      }
                      className={cn(
                        "mt-3 w-full rounded px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.12em] transition-all",
                        ac.isPrimary
                          ? "bg-zinc-900 text-white hover:bg-zinc-800"
                          : "bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:border-zinc-300"
                      )}
                    >
                      CREATE ACTION
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence & Raw Data */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-4">
              <TerminalSectionLabel>EVIDENCE &amp; RAW DATA</TerminalSectionLabel>

              {/* Source & Detection row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <SourceIcon size={12} className="text-zinc-400" />
                    <span className="text-[9px] font-mono font-semibold tracking-[0.15em] text-zinc-400 uppercase">SOURCE</span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-700 font-mono">{signal.source}</p>
                  <p className="text-[10px] text-zinc-300 font-mono mt-1">Detected {formatDate(signal.detectedAt)}</p>
                </div>
                <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <BarChart3 size={12} className="text-zinc-400" />
                    <span className="text-[9px] font-mono font-semibold tracking-[0.15em] text-zinc-400 uppercase">CONFIDENCE</span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-700 font-mono capitalize">{signal.confidence}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-zinc-200">
                    <div
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        signal.confidence === "high" ? "bg-emerald-500" : signal.confidence === "medium" ? "bg-amber-500" : "bg-red-500"
                      )}
                      style={{ width: `${confidencePct}%` }}
                    />
                  </div>
                </div>
                <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock size={12} className="text-zinc-400" />
                    <span className="text-[9px] font-mono font-semibold tracking-[0.15em] text-zinc-400 uppercase">SIGNAL AGE</span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-700 font-mono">{signalAge} days</p>
                  <p className="text-[10px] text-zinc-300 font-mono mt-1">Since first detection</p>
                </div>
              </div>

              {/* Parameters table */}
              {signal.parameters && signal.parameters.length > 0 && (
                <div className="rounded border border-zinc-200 overflow-hidden">
                  <div className="px-3 py-2 bg-zinc-50 border-b border-zinc-200">
                    <p className="text-[9px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase">RAW DATA POINTS</p>
                  </div>
                  <div className="divide-y divide-terminal-border/50">
                    {signal.parameters.map((p, i) => (
                      <div key={i} className="px-3 py-2.5 flex items-center justify-between bg-white hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center w-6 h-6 rounded bg-zinc-50 border border-zinc-200">
                            <BarChart3 size={11} className="text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-[12px] font-mono font-medium text-zinc-700">{p.label}</p>
                            <p className="text-[9px] font-mono text-zinc-300 uppercase tracking-wider">{p.provenance} data</p>
                          </div>
                        </div>
                        <span className="font-mono text-base font-bold text-amber-600 bg-amber-50 border border-amber-200/20 px-2.5 py-1 rounded">
                          {p.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Holding trend chart for retention_risk */}
              {signal.type === "retention_risk" && investor?.holdingHistory && (
                <div className="mt-4 rounded border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase">HOLDING TREND</p>
                    <TerminalBadge variant={investor.holdingTrend === "down" ? "red" : investor.holdingTrend === "up" ? "green" : "default"}>
                      {investor.holdingTrend === "down" ? "DECLINING" : investor.holdingTrend === "up" ? "INCREASING" : "STABLE"}
                    </TerminalBadge>
                  </div>
                  <div className="flex items-end gap-2 pt-2">
                    {investor.holdingHistory.map((val, i) => {
                      const max = Math.max(...investor.holdingHistory);
                      const min = Math.min(...investor.holdingHistory) * 0.9;
                      const pct = ((val - min) / (max - min)) * 100;
                      const barHeight = Math.max(pct, 10) * 0.64;
                      const isLast = i === investor.holdingHistory.length - 1;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className={cn(
                            "text-[10px] font-mono",
                            isLast ? "font-bold text-amber-600" : "text-zinc-300"
                          )}>
                            {val}%
                          </span>
                          <div
                            className={cn(
                              "w-full rounded-sm terminal-bar",
                              isLast ? "bg-red-500 " : "bg-zinc-200"
                            )}
                            style={{ height: `${barHeight}px` }}
                          />
                          <span className="text-[9px] font-mono text-zinc-300">Q{i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Accumulation trend for influence_opportunity */}
              {signal.type === "influence_opportunity" && investor?.holdingHistory && (
                <div className="mt-4 rounded border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase">ACCUMULATION TREND</p>
                    <TerminalBadge variant="green">INCREASING</TerminalBadge>
                  </div>
                  <div className="flex items-end gap-2 pt-2">
                    {investor.holdingHistory.map((val, i) => {
                      const max = Math.max(...investor.holdingHistory) * 1.1;
                      const min = Math.min(...investor.holdingHistory) * 0.9;
                      const pct = ((val - min) / (max - min)) * 100;
                      const barHeight = Math.max(pct, 10) * 0.64;
                      const isLast = i === investor.holdingHistory.length - 1;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className={cn(
                            "text-[10px] font-mono",
                            isLast ? "font-bold text-amber-600" : "text-zinc-300"
                          )}>
                            {val}%
                          </span>
                          <div
                            className={cn(
                              "w-full rounded-sm terminal-bar",
                              isLast ? "bg-amber-500 " : "bg-zinc-200"
                            )}
                            style={{ height: `${barHeight}px` }}
                          />
                          <span className="text-[9px] font-mono text-zinc-300">Q{i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SIDEBAR ──────────────────────────────────────── */}
          <aside className="hidden w-full lg:w-80 flex-shrink-0 lg:block">
            <div className="sticky top-6 space-y-3">

              {/* Evidence Panel */}
              <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-4">
                <TerminalSectionLabel>EVIDENCE</TerminalSectionLabel>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <SourceIcon size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] font-mono font-semibold text-zinc-700">{signal.source}</p>
                      <p className="text-[10px] font-mono text-zinc-300">{formatDate(signal.detectedAt)}</p>
                    </div>
                  </div>
                  {signal.parameters?.map((p, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <BarChart3 size={13} className="text-zinc-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-mono font-semibold text-zinc-700">
                          {p.label}: <span className="text-amber-600">{p.value}</span>
                        </p>
                        <p className="text-[10px] font-mono text-zinc-300 capitalize">{p.provenance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate(`/actions/new?signal=${signal.id}`)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-[11px] font-medium text-white uppercase tracking-[0.08em] transition-all hover:bg-zinc-800 shadow-sm"
              >
                <Zap size={14} />
                Triage Action
              </button>

              <button className="w-full inline-flex items-center justify-center gap-2 rounded border border-zinc-200 bg-white px-5 py-2.5 text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-[0.1em] transition-all hover:border-zinc-300 hover:text-zinc-600">
                <MoreHorizontal size={14} />
                More
              </button>

              {/* Investor Snapshot */}
              {investor && (
                <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-4">
                  <TerminalSectionLabel>INVESTOR SNAPSHOT</TerminalSectionLabel>
                  <p className="text-sm font-bold text-zinc-700 font-mono">{investor.name}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      {investor.type}
                    </span>
                    <span className={cn(
                      "inline-flex items-center rounded px-1.5 py-0 text-[9px] font-mono font-bold tracking-wider border",
                      investor.tier === 1 || investor.tier === "T1" ? "border-amber-200/40 text-amber-600 bg-amber-50"
                        : investor.tier === 2 || investor.tier === "T2" ? "border-zinc-300 text-zinc-700"
                        : "border-zinc-200 text-zinc-400"
                    )}>
                      T{String(investor.tier).replace("T", "")}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] font-mono font-semibold tracking-[0.15em] text-zinc-400 uppercase">HOLDING</p>
                      <p className="mt-0.5 font-mono text-lg font-bold text-amber-600 font-mono">{investor.holdingPct}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono font-semibold tracking-[0.15em] text-zinc-400 uppercase">TRAJECTORY</p>
                      <p className="mt-1">
                        <TerminalBadge variant={investor.holdingTrend === "down" ? "red" : investor.holdingTrend === "up" ? "green" : "default"}>
                          {trendLabel[investor.holdingTrend]}
                        </TerminalBadge>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono font-semibold tracking-[0.15em] text-zinc-400 uppercase">MOMENTUM</p>
                      <p className="mt-0.5 text-[12px] font-mono capitalize text-zinc-700">{investor.engagementMomentum}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono font-semibold tracking-[0.15em] text-zinc-400 uppercase">OWNER</p>
                      <p className="mt-0.5 text-[12px] font-mono text-zinc-700">{investor.relationshipOwner}</p>
                    </div>
                  </div>

                  {investor.contacts && investor.contacts.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-zinc-200">
                      <p className="text-[9px] font-mono font-semibold tracking-[0.15em] text-zinc-400 uppercase mb-2">KEY CONTACTS</p>
                      <div className="space-y-1.5">
                        {investor.contacts.map((c) => (
                          <div key={c.id} className="text-[11px] font-mono text-zinc-700">
                            <span className="font-medium text-zinc-700">{c.name}</span>
                            {c.role && <span className="text-zinc-400"> / {c.role}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Related Signals */}
              {relatedSignals.length > 0 && (
                <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm p-4">
                  <TerminalSectionLabel>RELATED SIGNALS</TerminalSectionLabel>
                  <div className="space-y-2">
                    {relatedSignals.map((s) => {
                      const sUrg = urgencyConfig[s.urgency];
                      return (
                        <button
                          key={s.id}
                          onClick={() => navigate(`/signals/${s.id}`)}
                          className="block w-full rounded border border-zinc-200 p-2.5 text-left transition-all hover:border-zinc-300 hover:bg-zinc-50 group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("inline-block w-1.5 h-1.5 rounded-full", sUrg.dot)} />
                            <span className="text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-zinc-400">
                              {typeLabels[s.type]}
                            </span>
                            <ChevronRight size={10} className="ml-auto text-zinc-300 group-hover:text-amber-700 transition-colors" />
                          </div>
                          <p className="text-[11px] font-mono text-zinc-700 line-clamp-2">{s.headline}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
