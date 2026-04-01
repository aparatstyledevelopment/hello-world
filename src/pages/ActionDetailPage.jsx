import { useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Save,
  ChevronRight,
  X,
  ArrowRight,
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
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

// ── Lifecycle Stepper ─────────────────────────────────────
function LifecycleStepper({ currentState }) {
  const currentIdx = getStateIndex(currentState);

  return (
    <div className="flex items-center justify-between">
      {actionStates.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isCurrent
                    ? "border-primary-500 bg-primary-50 text-primary-600"
                    : "border-slate-200 bg-white text-slate-400"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} />
                ) : isCurrent ? (
                  <Circle size={16} fill="currentColor" />
                ) : (
                  <Circle size={16} />
                )}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-[11px] font-medium whitespace-nowrap",
                  isCompleted
                    ? "text-emerald-600"
                    : isCurrent
                    ? "text-primary-600"
                    : "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < actionStates.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1",
                  idx < currentIdx ? "bg-emerald-500" : "bg-slate-200"
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
  const timeline = investor ? getTimelineForInvestor(investor.id).slice(0, 5) : [];

  return (
    <div className="space-y-4">
      {/* Linked Signal */}
      {signal && (
        <Card title="Linked Signal">
          <Link
            to={`/signals/${signal.id}`}
            className="group block"
          >
            <div className="flex items-start gap-2">
              <Bell size={14} className="mt-0.5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800 group-hover:text-primary-600">
                  {signal.headline}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge variant={signal.urgency}>{signal.urgency}</Badge>
                  <Badge variant={signal.type} />
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
            <p className="text-xs text-slate-400">No other open actions</p>
          ) : (
            <ul className="space-y-2">
              {openActions.map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/actions/${a.id}`}
                    className="block rounded-lg border border-slate-100 p-2 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    <span className="font-medium">{a.objective.slice(0, 60)}...</span>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={a.type} className="text-[10px]" />
                      <span className="text-slate-400">{a.dueDate}</span>
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
          <ul className="space-y-2">
            {timeline.map((evt) => (
              <li key={evt.id} className="flex items-start gap-2 text-xs">
                <Clock size={12} className="mt-0.5 shrink-0 text-slate-400" />
                <div>
                  <span className="text-slate-400">{evt.date}</span>
                  <p className="text-slate-600">{evt.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Investor State Metrics */}
      {investor && (
        <Card title="Investor State">
          <div className="space-y-2">
            {investor.stateParameters.slice(0, 4).map((param, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{param.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-700">{param.value}</span>
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      param.freshness === "fresh" ? "bg-emerald-500" : "bg-amber-500"
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
  const preLinkedSignal = preLinkedSignalId ? getSignal(preLinkedSignalId) : null;

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

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-400">
        <Link to="/actions" className="hover:text-slate-600">
          Actions
        </Link>
        <ChevronRight size={14} />
        <span className="text-slate-700">
          {isNew ? "New Action" : existingAction?.objective?.slice(0, 40) + "..."}
        </span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">
          {isNew ? "Create Action" : "Edit Action"}
        </h1>
        {!isNew && (
          <Badge variant={stateBadgeVariantFor(form.state)}>
            {stateLabels[form.state]}
          </Badge>
        )}
      </div>

      {/* Lifecycle Stepper */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <LifecycleStepper currentState={form.state} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Form — 2/3 */}
        <div className="col-span-2 space-y-5">
          <Card>
            <div className="grid grid-cols-2 gap-4">
              {/* Investor */}
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Investor</span>
                <select
                  value={form.investorId}
                  onChange={handleChange("investorId")}
                  className={cn(
                    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500",
                    isPreFilled("investorId") && "bg-amber-50 border-amber-300"
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
                <span className="text-xs font-medium text-slate-600">Contact</span>
                <select
                  value={form.contactId}
                  onChange={handleChange("contactId")}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select contact...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.role}
                    </option>
                  ))}
                </select>
              </label>

              {/* Type */}
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Type</span>
                <select
                  value={form.type}
                  onChange={handleChange("type")}
                  className={cn(
                    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500",
                    isPreFilled("type") && "bg-amber-50 border-amber-300"
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
                <span className="text-xs font-medium text-slate-600">Owner</span>
                <select
                  value={form.owner}
                  onChange={handleChange("owner")}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                <span className="text-xs font-medium text-slate-600">Due Date</span>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange("dueDate")}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>

              {/* Channel */}
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Channel</span>
                <select
                  value={form.channel}
                  onChange={handleChange("channel")}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <span className="text-xs font-medium text-slate-600">Objective</span>
              <input
                type="text"
                value={form.objective}
                onChange={handleChange("objective")}
                placeholder="What is this action meant to achieve?"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>

            {/* Talking Points */}
            <label className="mt-4 block">
              <span className="text-xs font-medium text-slate-600">
                Talking Points
              </span>
              <textarea
                value={form.talkingPoints}
                onChange={handleChange("talkingPoints")}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>

            {/* Message Angle */}
            <label className="mt-4 block">
              <span className="text-xs font-medium text-slate-600">
                Message Angle
              </span>
              <textarea
                value={form.messageAngle}
                onChange={handleChange("messageAngle")}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>

            {/* Success Criteria */}
            <label className="mt-4 block">
              <span className="text-xs font-medium text-slate-600">
                Success Criteria
              </span>
              <textarea
                value={form.successCriteria}
                onChange={handleChange("successCriteria")}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>

            {/* Outcome — only for awaiting_logging / completed */}
            {showOutcome && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">
                    Outcome
                  </span>
                </div>
                <textarea
                  value={form.outcome}
                  onChange={handleChange("outcome")}
                  rows={3}
                  placeholder="Record the outcome of this action..."
                  className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            )}
          </Card>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              <Save size={14} />
              Save
            </button>

            {nextState && (
              <button
                onClick={handleStateTransition}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
              >
                <ArrowRight size={14} />
                Move to {nextState.label}
              </button>
            )}

            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <X size={14} />
              Cancel Action
            </button>
          </div>
        </div>

        {/* Sidebar — 1/3 */}
        <div className="col-span-1">
          <DetailSidebar action={existingAction} signal={signal} investor={investor} />
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
