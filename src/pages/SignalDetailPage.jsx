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
  high: { label: "HIGH", color: "text-terminal-red", bg: "bg-terminal-red/10", border: "border-terminal-red/30", dot: "bg-terminal-red" },
  medium: { label: "MEDIUM", color: "text-terminal-amber", bg: "bg-terminal-amber/10", border: "border-terminal-amber/20", dot: "bg-terminal-amber" },
  low: { label: "LOW", color: "text-terminal-text-dim", bg: "bg-terminal-surface-alt", border: "border-terminal-border", dot: "bg-terminal-text-dim" },
};

const typeLabels = {
  retention_risk: "TRADING",
  influence_opportunity: "FUND FLOW",
  governance_management: "GOVERNANCE",
  information_gap: "DISCLOSURES",
  relationship_maintenance: "RELATIONSHIP",
};

const typeColors = {
  retention_risk: "text-terminal-red",
  influence_opportunity: "text-terminal-cyan",
  governance_management: "text-terminal-amber",
  information_gap: "text-terminal-text",
  relationship_maintenance: "text-terminal-green",
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
    default: "border-terminal-border text-terminal-text-dim",
    amber: "border-terminal-amber/40 text-terminal-amber bg-terminal-amber/5",
    red: "border-terminal-red/40 text-terminal-red bg-terminal-red/5",
    cyan: "border-terminal-cyan/40 text-terminal-cyan bg-terminal-cyan/5",
    green: "border-terminal-green/40 text-terminal-green bg-terminal-green/5",
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase border font-mono",
      styles[variant] || styles.default,
      className
    )}>
      {children}
    </span>
  );
}

function TerminalSectionLabel({ children, className }) {
  return (
    <p className={cn("terminal-label mb-3", className)}>
      {children}
    </p>
  );
}

function TerminalDataRow({ label, value, accent = false, mono = true }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-terminal-border/50 last:border-b-0">
      <span className="text-[10px] tracking-[0.1em] uppercase text-terminal-text-dim font-mono">{label}</span>
      <span className={cn(
        "text-sm font-semibold",
        mono && "font-mono",
        accent ? "text-terminal-amber" : "text-terminal-text"
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
      <div className="terminal-page p-4 md:p-6">
        <div className="terminal-card p-8 text-center">
          <Radio size={32} className="text-terminal-text-dim mx-auto mb-4" />
          <p className="text-terminal-text font-mono text-sm mb-2">SIGNAL NOT FOUND</p>
          <p className="text-terminal-text-dim font-mono text-xs mb-4">No signal with ID "{id}" exists in the system.</p>
          <button
            onClick={() => navigate("/signals")}
            className="font-mono text-xs text-terminal-amber hover:text-terminal-amber-dim transition-colors uppercase tracking-wider"
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
    up: "text-terminal-green",
    down: "text-terminal-red",
    neutral: "text-terminal-text-dim",
  };

  const signalAge = Math.floor((new Date("2026-04-01") - new Date(signal.detectedAt)) / (1000 * 60 * 60 * 24));

  return (
    <div className="terminal-page">
      <div className="terminal-scanlines fixed inset-0 z-0" />
      <div className="relative z-10 p-4 md:p-6">

        {/* ── TOP BAR ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-terminal-text-dim transition-colors hover:text-terminal-amber uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div className="flex items-center gap-3 text-[10px] font-mono text-terminal-text-muted uppercase tracking-wider">
            <span>SIG/{signal.id}</span>
            <span className="text-terminal-border">|</span>
            <span>{formatDateCompact(signal.detectedAt)}</span>
            <span className="text-terminal-border">|</span>
            <span className="flex items-center gap-1">
              <span className={cn("inline-block w-1.5 h-1.5 rounded-full terminal-pulse", urg.dot)} />
              LIVE
            </span>
          </div>
        </div>

        {/* ── HEADER STRIP ──────────────────────────────────── */}
        <div className={cn(
          "terminal-card p-4 mb-4",
          isHigh && "terminal-glow-red border-terminal-red/20"
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
              <h1 className="text-xl md:text-2xl font-bold text-terminal-text leading-tight tracking-tight font-mono">
                {signal.headline}
              </h1>

              {/* Investor line */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center justify-center w-7 h-7 rounded bg-terminal-surface-alt border border-terminal-border text-[10px] font-bold text-terminal-amber font-mono">
                  {investor?.name?.charAt(0) ?? "?"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-terminal-text font-mono">
                    {investor?.name ?? "Unknown"}
                  </span>
                  <span className="text-[10px] text-terminal-text-dim font-mono uppercase tracking-wider">
                    {investor?.type ?? "investor"} · T{investor?.tier?.replace("T", "") ?? "?"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side quick stats */}
            <div className="hidden md:flex flex-col items-end gap-1 text-right">
              <div className="text-[10px] text-terminal-text-dim font-mono tracking-wider uppercase">Holding</div>
              <div className="text-2xl font-bold text-terminal-amber font-mono terminal-value">
                {investor?.holdingPct ?? "—"}%
              </div>
              <div className={cn(
                "text-[10px] font-mono font-semibold tracking-wider uppercase",
                trendColor[investor?.holdingTrend] ?? "text-terminal-text-dim"
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
                <div key={m.label} className="terminal-card p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <m.icon size={12} className="text-terminal-text-dim" />
                    <span className="text-[9px] font-mono font-semibold tracking-[0.15em] uppercase text-terminal-text-dim">{m.label}</span>
                  </div>
                  <p className="text-sm font-bold text-terminal-text font-mono terminal-value">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Analysis Panel */}
            <div className="terminal-card p-4">
              <TerminalSectionLabel>ANALYSIS</TerminalSectionLabel>
              <div className="space-y-4">
                {/* Why this matters */}
                <div>
                  <p className="text-[10px] font-mono font-semibold tracking-[0.12em] uppercase text-terminal-amber mb-2">
                    WHY THIS MATTERS
                  </p>
                  <p className="text-[13px] text-terminal-text leading-relaxed font-mono">
                    {whyItMatters}
                  </p>
                </div>

                <div className="terminal-divider" />

                {/* Likely impact */}
                <div>
                  <p className={cn(
                    "text-[10px] font-mono font-semibold tracking-[0.12em] uppercase mb-2",
                    isHigh ? "text-terminal-red" : "text-terminal-text-dim"
                  )}>
                    LIKELY IMPACT
                  </p>
                  <div className={cn(
                    "rounded px-3 py-2.5 border",
                    isHigh
                      ? "border-terminal-red/20 bg-terminal-red/5"
                      : "border-terminal-border bg-terminal-surface-alt"
                  )}>
                    <p className={cn(
                      "text-[13px] leading-relaxed font-mono",
                      isHigh ? "text-terminal-red" : "text-terminal-text"
                    )}>
                      {likelyImpact}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="terminal-card p-4">
              <TerminalSectionLabel>RECOMMENDED ACTIONS</TerminalSectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {actionCards.map((ac, idx) => (
                  <div
                    key={ac.id}
                    className={cn(
                      "rounded border p-4 flex flex-col",
                      ac.isPrimary
                        ? "border-terminal-amber/30 bg-terminal-amber/5 terminal-glow-amber"
                        : "border-terminal-border bg-terminal-surface-alt"
                    )}
                  >
                    {ac.isPrimary && (
                      <span className="self-start bg-terminal-amber text-black rounded text-[9px] tracking-[0.12em] uppercase font-bold px-2 py-0.5 mb-3 font-mono">
                        NEXT BEST ACTION
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-terminal-text font-mono">{ac.title}</h4>
                    <p className="text-[11px] text-terminal-text-dim mt-1.5 leading-relaxed font-mono">{ac.description}</p>

                    <div className="mt-3 pt-3 border-t border-terminal-border/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono tracking-[0.1em] text-terminal-text-muted uppercase">CHANNEL</span>
                        <span className="text-[11px] font-mono font-semibold text-terminal-text">{ac.channel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono tracking-[0.1em] text-terminal-text-muted uppercase">TIMING</span>
                        <span className="text-[11px] font-mono font-semibold text-terminal-text">{ac.timing}</span>
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
                          ? "bg-terminal-amber text-black hover:bg-terminal-amber-dim"
                          : "bg-terminal-surface border border-terminal-border text-terminal-text-dim hover:text-terminal-text hover:border-terminal-border-bright"
                      )}
                    >
                      CREATE ACTION
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence & Raw Data */}
            <div className="terminal-card p-4">
              <TerminalSectionLabel>EVIDENCE &amp; RAW DATA</TerminalSectionLabel>

              {/* Source & Detection row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="rounded border border-terminal-border bg-terminal-surface-alt p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <SourceIcon size={12} className="text-terminal-text-dim" />
                    <span className="text-[9px] font-mono font-semibold tracking-[0.15em] text-terminal-text-dim uppercase">SOURCE</span>
                  </div>
                  <p className="text-sm font-semibold text-terminal-text font-mono">{signal.source}</p>
                  <p className="text-[10px] text-terminal-text-muted font-mono mt-1">Detected {formatDate(signal.detectedAt)}</p>
                </div>
                <div className="rounded border border-terminal-border bg-terminal-surface-alt p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <BarChart3 size={12} className="text-terminal-text-dim" />
                    <span className="text-[9px] font-mono font-semibold tracking-[0.15em] text-terminal-text-dim uppercase">CONFIDENCE</span>
                  </div>
                  <p className="text-sm font-semibold text-terminal-text font-mono capitalize">{signal.confidence}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-terminal-border">
                    <div
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        signal.confidence === "high" ? "bg-terminal-green" : signal.confidence === "medium" ? "bg-terminal-amber" : "bg-terminal-red"
                      )}
                      style={{ width: `${confidencePct}%` }}
                    />
                  </div>
                </div>
                <div className="rounded border border-terminal-border bg-terminal-surface-alt p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock size={12} className="text-terminal-text-dim" />
                    <span className="text-[9px] font-mono font-semibold tracking-[0.15em] text-terminal-text-dim uppercase">SIGNAL AGE</span>
                  </div>
                  <p className="text-sm font-semibold text-terminal-text font-mono">{signalAge} days</p>
                  <p className="text-[10px] text-terminal-text-muted font-mono mt-1">Since first detection</p>
                </div>
              </div>

              {/* Parameters table */}
              {signal.parameters && signal.parameters.length > 0 && (
                <div className="rounded border border-terminal-border overflow-hidden">
                  <div className="px-3 py-2 bg-terminal-surface-alt border-b border-terminal-border">
                    <p className="text-[9px] font-mono font-bold tracking-[0.15em] text-terminal-text-dim uppercase">RAW DATA POINTS</p>
                  </div>
                  <div className="divide-y divide-terminal-border/50">
                    {signal.parameters.map((p, i) => (
                      <div key={i} className="px-3 py-2.5 flex items-center justify-between bg-terminal-surface hover:bg-terminal-surface-alt transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center w-6 h-6 rounded bg-terminal-surface-alt border border-terminal-border">
                            <BarChart3 size={11} className="text-terminal-text-dim" />
                          </div>
                          <div>
                            <p className="text-[12px] font-mono font-medium text-terminal-text">{p.label}</p>
                            <p className="text-[9px] font-mono text-terminal-text-muted uppercase tracking-wider">{p.provenance} data</p>
                          </div>
                        </div>
                        <span className="font-mono text-base font-bold text-terminal-amber bg-terminal-amber/5 border border-terminal-amber/20 px-2.5 py-1 rounded">
                          {p.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Holding trend chart for retention_risk */}
              {signal.type === "retention_risk" && investor?.holdingHistory && (
                <div className="mt-4 rounded border border-terminal-border bg-terminal-surface p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] font-mono font-bold tracking-[0.15em] text-terminal-text-dim uppercase">HOLDING TREND</p>
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
                            isLast ? "font-bold text-terminal-amber" : "text-terminal-text-muted"
                          )}>
                            {val}%
                          </span>
                          <div
                            className={cn(
                              "w-full rounded-sm terminal-bar",
                              isLast ? "bg-terminal-red terminal-bar-danger" : "bg-terminal-border-bright"
                            )}
                            style={{ height: `${barHeight}px` }}
                          />
                          <span className="text-[9px] font-mono text-terminal-text-muted">Q{i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Accumulation trend for influence_opportunity */}
              {signal.type === "influence_opportunity" && investor?.holdingHistory && (
                <div className="mt-4 rounded border border-terminal-border bg-terminal-surface p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] font-mono font-bold tracking-[0.15em] text-terminal-text-dim uppercase">ACCUMULATION TREND</p>
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
                            isLast ? "font-bold text-terminal-amber" : "text-terminal-text-muted"
                          )}>
                            {val}%
                          </span>
                          <div
                            className={cn(
                              "w-full rounded-sm terminal-bar",
                              isLast ? "bg-terminal-amber terminal-bar-active" : "bg-terminal-border-bright"
                            )}
                            style={{ height: `${barHeight}px` }}
                          />
                          <span className="text-[9px] font-mono text-terminal-text-muted">Q{i + 1}</span>
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
              <div className="terminal-card p-4">
                <TerminalSectionLabel>EVIDENCE</TerminalSectionLabel>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <SourceIcon size={13} className="text-terminal-amber mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] font-mono font-semibold text-terminal-text">{signal.source}</p>
                      <p className="text-[10px] font-mono text-terminal-text-muted">{formatDate(signal.detectedAt)}</p>
                    </div>
                  </div>
                  {signal.parameters?.map((p, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <BarChart3 size={13} className="text-terminal-text-dim mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-mono font-semibold text-terminal-text">
                          {p.label}: <span className="text-terminal-amber">{p.value}</span>
                        </p>
                        <p className="text-[10px] font-mono text-terminal-text-muted capitalize">{p.provenance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate(`/actions/new?signal=${signal.id}`)}
                className="w-full inline-flex items-center justify-center gap-2 rounded bg-terminal-amber px-5 py-3 text-[11px] font-mono font-bold text-black uppercase tracking-[0.12em] transition-all hover:bg-terminal-amber-dim shadow-[0_0_16px_rgba(255,149,0,0.15)]"
              >
                <Zap size={14} />
                Triage Action
              </button>

              <button className="w-full inline-flex items-center justify-center gap-2 rounded border border-terminal-border bg-terminal-surface px-5 py-2.5 text-[11px] font-mono font-medium text-terminal-text-dim uppercase tracking-[0.1em] transition-all hover:border-terminal-border-bright hover:text-terminal-text">
                <MoreHorizontal size={14} />
                More
              </button>

              {/* Investor Snapshot */}
              {investor && (
                <div className="terminal-card p-4">
                  <TerminalSectionLabel>INVESTOR SNAPSHOT</TerminalSectionLabel>
                  <p className="text-sm font-bold text-terminal-text font-mono">{investor.name}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-terminal-text-dim uppercase tracking-wider">
                      {investor.type}
                    </span>
                    <span className={cn(
                      "inline-flex items-center rounded px-1.5 py-0 text-[9px] font-mono font-bold tracking-wider border",
                      investor.tier === "T1" ? "border-terminal-amber/40 text-terminal-amber bg-terminal-amber/5"
                        : investor.tier === "T2" ? "border-terminal-border-bright text-terminal-text"
                        : "border-terminal-border text-terminal-text-dim"
                    )}>
                      {investor.tier}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] font-mono font-semibold tracking-[0.15em] text-terminal-text-dim uppercase">HOLDING</p>
                      <p className="mt-0.5 font-mono text-lg font-bold text-terminal-amber terminal-value">{investor.holdingPct}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono font-semibold tracking-[0.15em] text-terminal-text-dim uppercase">TRAJECTORY</p>
                      <p className="mt-1">
                        <TerminalBadge variant={investor.holdingTrend === "down" ? "red" : investor.holdingTrend === "up" ? "green" : "default"}>
                          {trendLabel[investor.holdingTrend]}
                        </TerminalBadge>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono font-semibold tracking-[0.15em] text-terminal-text-dim uppercase">MOMENTUM</p>
                      <p className="mt-0.5 text-[12px] font-mono capitalize text-terminal-text">{investor.engagementMomentum}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono font-semibold tracking-[0.15em] text-terminal-text-dim uppercase">OWNER</p>
                      <p className="mt-0.5 text-[12px] font-mono text-terminal-text">{investor.relationshipOwner}</p>
                    </div>
                  </div>

                  {investor.contacts && investor.contacts.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-terminal-border">
                      <p className="text-[9px] font-mono font-semibold tracking-[0.15em] text-terminal-text-dim uppercase mb-2">KEY CONTACTS</p>
                      <div className="space-y-1.5">
                        {investor.contacts.map((c) => (
                          <div key={c.id} className="text-[11px] font-mono text-terminal-text">
                            <span className="font-medium text-terminal-text">{c.name}</span>
                            {c.role && <span className="text-terminal-text-dim"> / {c.role}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Related Signals */}
              {relatedSignals.length > 0 && (
                <div className="terminal-card p-4">
                  <TerminalSectionLabel>RELATED SIGNALS</TerminalSectionLabel>
                  <div className="space-y-2">
                    {relatedSignals.map((s) => {
                      const sUrg = urgencyConfig[s.urgency];
                      return (
                        <button
                          key={s.id}
                          onClick={() => navigate(`/signals/${s.id}`)}
                          className="block w-full rounded border border-terminal-border p-2.5 text-left transition-all hover:border-terminal-border-bright hover:bg-terminal-surface-alt group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("inline-block w-1.5 h-1.5 rounded-full", sUrg.dot)} />
                            <span className="text-[9px] font-mono font-semibold tracking-[0.1em] uppercase text-terminal-text-dim">
                              {typeLabels[s.type]}
                            </span>
                            <ChevronRight size={10} className="ml-auto text-terminal-text-muted group-hover:text-terminal-amber transition-colors" />
                          </div>
                          <p className="text-[11px] font-mono text-terminal-text line-clamp-2">{s.headline}</p>
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
