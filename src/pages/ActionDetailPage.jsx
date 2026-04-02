import { useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Save,
  X,
  ArrowRight,
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  FileText,
  Target,
  MessageSquare,
  Mail,
  Phone,
  Video,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { ActionCard } from "../components/ui/ActionCard";
import { TimelineEntry } from "../components/ui/TimelineEntry";
import { EmptyState } from "../components/ui/EmptyState";
import {
  actions,
  investors,
  owners,
  channels,
  actionStates,
  getInvestor,
  getContact,
  getSignal,
  getActionsForInvestor,
  getTimelineForInvestor,
} from "../data/mock-data";

const typeOptions = [
  { value: "retention_risk", label: "Retention Risk" },
  { value: "influence_opportunity", label: "Influence Opportunity" },
  { value: "governance_management", label: "Governance" },
  { value: "information_gap", label: "Information Gap" },
  { value: "relationship_maintenance", label: "Relationship Maintenance" },
];

const stateLabels = {
  planned: "Planned",
  preparing: "Preparing",
  in_progress: "In Progress",
  awaiting_logging: "Awaiting Logging",
  completed: "Completed",
};

const phaseDescriptions = {
  planned: "Define objectives and identify target contacts",
  preparing: "Prepare materials, talking points, and message angle",
  in_progress: "Execute outreach and engagement activities",
  awaiting_logging: "Record outcomes and capture intelligence",
  completed: "Action closed. Outcomes logged and reviewed.",
};

function getNextState(current) {
  const idx = actionStates.findIndex((s) => s.key === current);
  if (idx >= 0 && idx < actionStates.length - 1) {
    return actionStates[idx + 1];
  }
  return null;
}

function getStateIndex(state) {
  return actionStates.findIndex((s) => s.key === state);
}

// ── Phase Timeline Stepper ───────────────────────────────
function PhaseTimeline({ currentState }) {
  const currentIdx = getStateIndex(currentState);

  return (
    <div className="grid grid-cols-5 gap-3">
      {actionStates.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFuture = idx > currentIdx;
        const phaseNum = String(idx + 1).padStart(2, "0");

        return (
          <div
            key={step.key}
            className={cn(
              "relative rounded-2xl border p-4 transition-all",
              isCompleted
                ? "border-zinc-400 bg-zinc-100/50"
                : isCurrent
                ? "border-zinc-900 bg-white shadow-sm ring-1 ring-zinc-900/10"
                : "border-zinc-200 bg-zinc-50/50"
            )}
          >
            {/* Phase number */}
            <div className="flex items-center justify-between mb-2">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.15em]",
                  isCompleted
                    ? "text-zinc-900"
                    : isCurrent
                    ? "text-zinc-900"
                    : "text-zinc-400"
                )}
              >
                PHASE {phaseNum}
              </span>
              {isCompleted && (
                <CheckCircle2
                  size={16}
                  className="text-zinc-900"
                />
              )}
              {isCurrent && (
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-900 animate-pulse" />
              )}
            </div>

            {/* Step label */}
            <p
              className={cn(
                "text-sm font-semibold",
                isCompleted
                  ? "text-zinc-900"
                  : isCurrent
                  ? "text-zinc-900"
                  : "text-zinc-400"
              )}
            >
              {step.label}
            </p>

            {/* Description */}
            <p
              className={cn(
                "mt-1 text-[11px] leading-relaxed",
                isCompleted
                  ? "text-zinc-700"
                  : isCurrent
                  ? "text-zinc-700"
                  : "text-zinc-400"
              )}
            >
              {phaseDescriptions[step.key]}
            </p>

            {/* Connector line */}
            {idx < actionStates.length - 1 && (
              <div
                className={cn(
                  "absolute right-0 top-1/2 h-0.5 w-3 translate-x-full -translate-y-1/2",
                  isCompleted ? "bg-zinc-900" : "bg-zinc-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────
function DetailSidebar({ action, signal, investor }) {
  const openActions = investor
    ? getActionsForInvestor(investor.id).filter(
        (a) => a.state !== "completed" && a.id !== action?.id
      )
    : [];
  const timeline = investor
    ? getTimelineForInvestor(investor.id).slice(0, 5)
    : [];

  return (
    <div className="space-y-4">
      {/* Linked Signal */}
      {signal && (
        <Card title="Linked Signal">
          <Link to={`/signals/${signal.id}`} className="group block">
            <div className="flex items-start gap-2">
              <Bell
                size={14}
                className="mt-0.5 text-zinc-400 shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900 group-hover:text-zinc-700">
                  {signal.headline}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge variant={signal.urgency} kind="urgency" />
                </div>
              </div>
            </div>
          </Link>
        </Card>
      )}

      {/* Open Actions for Investor */}
      {investor && (
        <Card title="Open Actions" subtitle={`${openActions.length} for ${investor.name}`}>
          {openActions.length === 0 ? (
            <p className="text-xs text-zinc-400">No other open actions</p>
          ) : (
            <ul className="space-y-2">
              {openActions.map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/actions/${a.id}`}
                    className="block rounded-2xl border border-zinc-100 p-2.5 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <span className="font-medium text-zinc-900">
                      {a.objective.slice(0, 60)}...
                    </span>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge variant={a.type} className="text-[10px]" />
                      <span className="font-mono text-zinc-400">
                        {a.dueDate}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Recent Timeline */}
      {investor && timeline.length > 0 && (
        <Card title="Recent Timeline">
          <div className="relative pl-5">
            <div className="absolute left-[4px] top-1.5 bottom-1.5 w-0.5 bg-zinc-200" />
            <div className="space-y-2">
              {timeline.map((evt) => {
                const typeIcons = { meeting: Video, email: Mail, call: Phone, filing: FileText, signal: Bell };
                const dotColors = { meeting: "bg-zinc-900", call: "bg-zinc-700", email: "bg-zinc-400", signal: "bg-zinc-700", filing: "bg-zinc-400" };
                const badgeStyles = { meeting: "bg-zinc-100 text-zinc-900", call: "bg-zinc-100 text-zinc-700", email: "bg-zinc-100 text-zinc-700", signal: "bg-zinc-100 text-zinc-700", filing: "bg-zinc-100 text-zinc-700" };
                const Icon = typeIcons[evt.type] || Clock;
                return (
                  <div key={evt.id} className="relative">
                    <div className={cn("absolute -left-5 top-3.5 h-2.5 w-2.5 rounded-full ring-2 ring-white", dotColors[evt.type] || "bg-zinc-400")} />
                    <div className="rounded-2xl border border-zinc-100 bg-white p-3 hover:border-zinc-200 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide", badgeStyles[evt.type] || "bg-zinc-100 text-zinc-700")}>
                          {evt.type}
                        </span>
                        <span className="text-[10px] text-zinc-400">{evt.date}</span>
                      </div>
                      <p className="text-xs text-zinc-700 leading-relaxed">{evt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Investor State Metrics */}
      {investor && (
        <Card title="Investor State">
          <div className="space-y-2.5">
            {investor.stateParameters.slice(0, 4).map((param, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-zinc-700">{param.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-zinc-700">
                    {param.value}
                  </span>
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      param.freshness === "fresh"
                        ? "bg-zinc-900"
                        : "bg-zinc-400"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export function ActionDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const preLinkedSignalId = searchParams.get("signal");
  const preLinkedSignal = preLinkedSignalId
    ? getSignal(preLinkedSignalId)
    : null;

  const existingAction = !isNew ? actions.find((a) => a.id === id) : null;

  const initialForm = useMemo(() => {
    if (existingAction) {
      return {
        investorId: existingAction.investorId,
        contactId: existingAction.contactId,
        type: existingAction.type,
        objective: existingAction.objective,
        owner: existingAction.owner,
        dueDate: existingAction.dueDate,
        channel: existingAction.channel,
        talkingPoints: existingAction.talkingPoints,
        messageAngle: existingAction.messageAngle,
        successCriteria: existingAction.successCriteria,
        outcome: existingAction.outcome || "",
        state: existingAction.state,
        signalId: existingAction.signalId,
      };
    }
    return {
      investorId: preLinkedSignal?.investorId || "",
      contactId: "",
      type: preLinkedSignal?.type || "",
      objective: "",
      owner: "",
      dueDate: "",
      channel: "",
      talkingPoints: "",
      messageAngle: "",
      successCriteria: "",
      outcome: "",
      state: "planned",
      signalId: preLinkedSignalId || null,
    };
  }, [existingAction, preLinkedSignal, preLinkedSignalId]);

  const [form, setForm] = useState(initialForm);

  const investor = form.investorId ? getInvestor(form.investorId) : null;
  const signal = form.signalId ? getSignal(form.signalId) : preLinkedSignal;
  const contacts = investor?.contacts || [];
  const nextState = getNextState(form.state);

  const isPreFilled = (field) => {
    if (!isNew || !preLinkedSignal) return false;
    if (field === "investorId" && preLinkedSignal.investorId) return true;
    if (field === "type" && preLinkedSignal.type) return true;
    return false;
  };

  const showOutcome =
    form.state === "awaiting_logging" || form.state === "completed";

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSave = () => {
    alert("Action saved (demo only)");
  };

  const handleStateTransition = () => {
    if (nextState) {
      setForm((f) => ({ ...f, state: nextState.key }));
    }
  };

  const handleCancel = () => {
    if (confirm("Cancel this action? This cannot be undone.")) {
      navigate("/actions");
    }
  };

  const inputClasses =
    "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400";

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Back link */}
      <Link
        to="/actions"
        className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <span>&larr;</span>
        <span>BACK TO ACTIONS</span>
      </Link>

      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">
          {isNew ? "Create Action" : "Edit Action"}
        </h1>
        {!isNew && (
          <Badge variant={stateBadgeVariantFor(form.state)}>
            {stateLabels[form.state]}
          </Badge>
        )}
      </div>

      {/* Phase Timeline Stepper */}
      <PhaseTimeline currentState={form.state} />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form -- 2/3 */}
        <div className="col-span-2 space-y-5">
          <Card>
            <div className="grid grid-cols-2 gap-4">
              {/* Investor */}
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                  Investor
                </span>
                <select
                  value={form.investorId}
                  onChange={handleChange("investorId")}
                  className={cn(
                    inputClasses,
                    isPreFilled("investorId") &&
                      "bg-zinc-100 border-zinc-400"
                  )}
                >
                  <option value="">Select investor...</option>
                  {investors.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name}
                    </option>
                  ))}
                </select>
              </label>

              {/* Contact */}
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                  Contact
                </span>
                <select
                  value={form.contactId}
                  onChange={handleChange("contactId")}
                  className={inputClasses}
                >
                  <option value="">Select contact...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} -- {c.role}
                    </option>
                  ))}
                </select>
              </label>

              {/* Type */}
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                  Type
                </span>
                <select
                  value={form.type}
                  onChange={handleChange("type")}
                  className={cn(
                    inputClasses,
                    isPreFilled("type") && "bg-zinc-100 border-zinc-400"
                  )}
                >
                  <option value="">Select type...</option>
                  {typeOptions.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Owner */}
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                  Owner
                </span>
                <select
                  value={form.owner}
                  onChange={handleChange("owner")}
                  className={inputClasses}
                >
                  <option value="">Select owner...</option>
                  {owners.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>

              {/* Due Date */}
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                  Due Date
                </span>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange("dueDate")}
                  className={inputClasses}
                />
              </label>

              {/* Channel */}
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                  Channel
                </span>
                <select
                  value={form.channel}
                  onChange={handleChange("channel")}
                  className={inputClasses}
                >
                  <option value="">Select channel...</option>
                  {channels.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Objective */}
            <label className="mt-4 block">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                Objective
              </span>
              <input
                type="text"
                value={form.objective}
                onChange={handleChange("objective")}
                placeholder="What is this action meant to achieve?"
                className={inputClasses}
              />
            </label>

            {/* Talking Points */}
            <label className="mt-4 block">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                Talking Points
              </span>
              <textarea
                value={form.talkingPoints}
                onChange={handleChange("talkingPoints")}
                rows={4}
                className={inputClasses}
              />
            </label>

            {/* Message Angle */}
            <label className="mt-4 block">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                Message Angle
              </span>
              <textarea
                value={form.messageAngle}
                onChange={handleChange("messageAngle")}
                rows={2}
                className={inputClasses}
              />
            </label>

            {/* Success Criteria */}
            <label className="mt-4 block">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                Success Criteria
              </span>
              <textarea
                value={form.successCriteria}
                onChange={handleChange("successCriteria")}
                rows={2}
                className={inputClasses}
              />
            </label>
          </Card>

          {/* Log & Actions Outcome Section */}
          {showOutcome && (
            <Card
              variant="section"
              accentColor="zinc"
              title="Log & Actions"
              subtitle="Record the outcome and any follow-up items"
            >
              <div className="space-y-4">
                {/* Outcome status indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Target size={14} className="text-zinc-400" />
                      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                        Objective Met
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {form.outcome ? "Yes" : "Pending"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare size={14} className="text-zinc-400" />
                      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                        Follow-Up
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {form.state === "completed" ? "Closed" : "Required"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={14} className="text-zinc-400" />
                      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                        Intelligence
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {form.outcome ? "Captured" : "Awaiting"}
                    </p>
                  </div>
                </div>

                {/* Outcome textarea */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-zinc-700" />
                    <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-700">
                      Outcome Notes
                    </span>
                  </div>
                  <textarea
                    value={form.outcome}
                    onChange={handleChange("outcome")}
                    rows={3}
                    placeholder="Record the outcome of this action..."
                    className="w-full rounded-xl border border-zinc-400 bg-white px-3 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-zinc-800"
            >
              <Save size={14} />
              Save
            </button>

            {nextState && (
              <button
                onClick={handleStateTransition}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
              >
                <ArrowRight size={14} />
                Move to {nextState.label}
              </button>
            )}

            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <X size={14} />
              Cancel Action
            </button>
          </div>
        </div>

        {/* Sidebar -- 1/3 */}
        <div className="col-span-1">
          <DetailSidebar
            action={existingAction}
            signal={signal}
            investor={investor}
          />
        </div>
      </div>
    </div>
  );
}

function stateBadgeVariantFor(state) {
  const map = {
    planned: "new",
    preparing: "reviewing",
    in_progress: "confirmed",
    awaiting_logging: "action_created",
    completed: "resolved",
  };
  return map[state] || "new";
}
