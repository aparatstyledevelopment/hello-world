import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Mail,
  Phone,
  Video,
  Calendar,
  Clock,
  User,
  Bell,
  FileText,
  BookOpen,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { TimelineEntry } from "../components/ui/TimelineEntry";
import {
  getContact,
  getInvestorForContact,
  getTimelineForInvestor,
  getSignalsForInvestor,
  getActionsForInvestor,
  actions,
} from "../data/mock-data";

const TODAY = new Date("2026-04-04");

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((TODAY - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

const timelineTypeIcons = {
  meeting: Video,
  email: Mail,
  call: Phone,
  filing: FileText,
  signal: Bell,
};

const timelineTypeBadge = {
  meeting: "MEETING",
  email: "OUTREACH",
  call: "CALL",
  filing: "FILING",
  signal: "SIGNAL",
};

export function ContactDetailPage() {
  const { id } = useParams();

  const contact = getContact(id);
  const investor = getInvestorForContact(id);

  if (!contact || !investor) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          icon={User}
          title="Contact not found"
          description="The contact you are looking for does not exist."
        />
      </div>
    );
  }

  const days = daysSince(contact.lastInteraction);
  const isStale = days !== null && days > 30;

  // Timeline events mentioning this contact
  const allTimeline = getTimelineForInvestor(investor.id);
  const contactNameParts = contact.name.toLowerCase().split(" ");
  const contactTimeline = allTimeline.filter((e) =>
    contactNameParts.some((part) => e.description.toLowerCase().includes(part))
  );
  const recentTimeline = contactTimeline.length > 0 ? contactTimeline : allTimeline.slice(0, 5);

  // Actions involving this contact
  const contactActions = actions.filter((a) => a.contactId === id);

  // Signals for the investor
  const investorSignals = getSignalsForInvestor(investor.id).filter(
    (s) => s.state !== "resolved" && s.state !== "dismissed"
  );

  // Meeting themes from timeline
  const themes = useMemo(() => {
    const found = new Set();
    for (const evt of contactTimeline) {
      const desc = evt.description.toLowerCase();
      if (desc.includes("climate") || desc.includes("esg")) found.add("ESG");
      if (desc.includes("governance") || desc.includes("board") || desc.includes("diversity")) found.add("Governance");
      if (desc.includes("growth") || desc.includes("strategy") || desc.includes("outlook")) found.add("Growth");
      if (desc.includes("stewardship") || desc.includes("disclosure")) found.add("Stewardship");
    }
    return [...found];
  }, [contactTimeline]);

  const initials = contact.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Back link */}
      <Link
        to={`/investors/${investor.id}`}
        className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <span>&larr;</span>
        <span>BACK TO {investor.name.toUpperCase()}</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-lg font-bold text-white">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900">{contact.name}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{contact.role}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Link
              to={`/investors/${investor.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-100 text-[9px] font-bold text-zinc-600">
                {investor.name.charAt(0)}
              </span>
              {investor.name}
            </Link>
            <Badge variant={investor.tier} kind="tier" />
            <span className={cn(
              "text-xs font-medium",
              isStale ? "text-red-500" : "text-zinc-400"
            )}>
              {days !== null ? `Last contact ${days}d ago` : "No interaction recorded"}
            </span>
          </div>
        </div>

        {/* Prepare button */}
        <Link
          to={`/investors/${investor.id}?prepare=true`}
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-900 hover:text-white hover:border-zinc-900 flex-shrink-0"
        >
          <BookOpen size={14} />
          Prepare for Meeting
        </Link>
      </div>

      {/* Contact info strip */}
      <div className="flex flex-wrap gap-3">
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-medium text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50"
        >
          <Mail size={14} />
          {contact.email}
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main column */}
        <div className="md:col-span-2 space-y-5">
          {/* Interaction History */}
          <div>
            <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400 mb-3">
              Interaction History
            </h2>
            {recentTimeline.length > 0 ? (
              <div>
                {recentTimeline.map((evt, idx) => {
                  const Icon = timelineTypeIcons[evt.type] || Bell;
                  return (
                    <TimelineEntry
                      key={evt.id}
                      icon={Icon}
                      title={evt.description}
                      date={evt.date}
                      type={timelineTypeBadge[evt.type] || evt.type.toUpperCase()}
                      isLast={idx === recentTimeline.length - 1}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-400">
                No interactions recorded with this contact.
              </div>
            )}
          </div>

          {/* Actions involving this contact */}
          {contactActions.length > 0 && (
            <div>
              <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400 mb-3">
                Actions
              </h2>
              <div className="space-y-2">
                {contactActions.map((act) => (
                  <Link
                    key={act.id}
                    to={`/actions/${act.id}`}
                    className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50"
                  >
                    <div className={cn(
                      "mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0",
                      act.state === "completed" ? "bg-emerald-400" :
                      act.state === "in_progress" ? "bg-zinc-900" : "bg-zinc-300"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 line-clamp-2">{act.objective}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={act.type} kind="type" />
                        <span className="text-xs text-zinc-400">{act.channel} &middot; Due {act.dueDate}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Relationship Summary */}
          <Card title="Relationship Summary">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Role</span>
                <span className="font-medium text-zinc-700">{contact.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Organization</span>
                <Link to={`/investors/${investor.id}`} className="font-medium text-zinc-700 hover:underline">
                  {investor.name}
                </Link>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Investor Type</span>
                <span className="font-medium text-zinc-700 capitalize">{investor.type}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Holding</span>
                <span className="font-mono font-bold text-zinc-700">{investor.holdingPct}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Trend</span>
                <span className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  investor.holdingTrend === "up" ? "text-emerald-600" :
                  investor.holdingTrend === "down" ? "text-red-500" : "text-zinc-400"
                )}>
                  {investor.holdingTrend === "up" && <TrendingUp size={12} />}
                  {investor.holdingTrend === "down" && <TrendingDown size={12} />}
                  {investor.holdingTrend === "up" ? "Increasing" :
                   investor.holdingTrend === "down" ? "Declining" : "Stable"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Relationship Owner</span>
                <span className="font-medium text-zinc-700">{investor.relationshipOwner}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Last Interaction</span>
                <span className={cn("font-medium", isStale ? "text-red-500" : "text-zinc-700")}>
                  {contact.lastInteraction || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Total Interactions</span>
                <span className="font-mono font-bold text-zinc-700">{recentTimeline.length}</span>
              </div>
            </div>
          </Card>

          {/* Discussion Themes */}
          {themes.length > 0 && (
            <Card title="Discussion Themes">
              <div className="flex flex-wrap gap-1.5">
                {themes.map((theme) => (
                  <span
                    key={theme}
                    className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Active Signals */}
          {investorSignals.length > 0 && (
            <Card title="Active Signals">
              <div className="space-y-2">
                {investorSignals.map((sig) => (
                  <Link
                    key={sig.id}
                    to={`/signals/${sig.id}`}
                    className="flex items-start gap-2 rounded-xl bg-zinc-50 p-2.5 transition-colors hover:bg-zinc-100"
                  >
                    <div className={cn(
                      "mt-1 h-2 w-2 rounded-full flex-shrink-0",
                      sig.urgency === "high" ? "bg-red-500" : "bg-zinc-400"
                    )} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-700 line-clamp-2">{sig.headline}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{sig.detectedAt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
