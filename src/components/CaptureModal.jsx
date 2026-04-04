import { useState, useMemo, useEffect } from "react";
import {
  X,
  Plus,
  Mic,
  FileText,
  Phone,
  Mail,
  Camera,
  StickyNote,
  File,
  Sparkles,
  CheckCircle2,
  Users,
  User,
  Clock,
  MessageSquare,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useData } from "../data/store";

const sourceTypes = [
  { value: "meeting_notes", label: "Meeting Notes", icon: FileText },
  { value: "call_notes", label: "Call Notes", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "document", label: "Document", icon: File },
  { value: "voice_memo", label: "Voice Memo", icon: Mic },
  { value: "photo", label: "Photo", icon: Camera },
  { value: "quick_note", label: "Quick Note", icon: StickyNote },
];

const sourceToTimelineType = {
  meeting_notes: "meeting",
  call_notes: "call",
  email: "email",
  document: "filing",
  voice_memo: "call",
  photo: "meeting",
  quick_note: "email",
};

// ── Extraction engine ────────────────────────────────────
function extractEntities(content, investors, selectedInvestorId) {
  const lower = content.toLowerCase();
  const result = {
    investorId: selectedInvestorId || null,
    investor: null,
    contacts: [],
    sentiment: "neutral",
    topics: [],
    actionItems: [],
    keyPoints: [],
  };

  // ── Detect investor ─────────────────────────────────
  if (!result.investorId) {
    for (const inv of investors) {
      const names = [inv.name.toLowerCase()];
      // Also match partial names (e.g., "BlackRock", "Wellington", "Harris")
      const words = inv.name.split(" ");
      if (words.length > 1) {
        names.push(words[0].toLowerCase());
        // Add last word if it's a distinctive name
        if (words[words.length - 1].length > 3) {
          names.push(words[words.length - 1].toLowerCase());
        }
      }
      for (const name of names) {
        if (name.length > 3 && lower.includes(name)) {
          result.investorId = inv.id;
          break;
        }
      }
      if (result.investorId) break;
    }
  }

  // ── Get investor object ─────────────────────────────
  if (result.investorId) {
    result.investor = investors.find((i) => i.id === result.investorId) || null;
  }

  // ── Detect contacts ─────────────────────────────────
  for (const inv of investors) {
    for (const contact of inv.contacts) {
      const contactNames = [contact.name.toLowerCase()];
      const parts = contact.name.split(" ");
      if (parts.length >= 2) {
        contactNames.push(parts[parts.length - 1].toLowerCase()); // last name
        contactNames.push(parts[0].toLowerCase()); // first name
      }
      for (const name of contactNames) {
        if (name.length > 3 && lower.includes(name)) {
          if (!result.contacts.find((c) => c.id === contact.id)) {
            result.contacts.push({ ...contact, investorId: inv.id, investorName: inv.name });
          }
          // If we found a contact but no investor, use the contact's investor
          if (!result.investorId) {
            result.investorId = inv.id;
            result.investor = inv;
          }
          break;
        }
      }
    }
  }

  // ── Detect sentiment ────────────────────────────────
  const positiveWords = [
    "positive", "optimistic", "bullish", "encouraged", "pleased",
    "confident", "supportive", "good", "great", "excellent",
    "impressed", "happy", "strong", "growth", "opportunity",
    "constructive", "aligned", "favorable",
  ];
  const negativeWords = [
    "negative", "pessimistic", "bearish", "concerned", "worried",
    "disappointed", "frustrated", "reduce", "selling", "exit",
    "risk", "declining", "unhappy", "poor", "weak", "problem",
    "issue", "threat", "cautious", "dissatisfied",
  ];

  let posCount = 0;
  let negCount = 0;
  for (const word of positiveWords) {
    if (lower.includes(word)) posCount++;
  }
  for (const word of negativeWords) {
    if (lower.includes(word)) negCount++;
  }

  if (posCount > negCount + 1) result.sentiment = "positive";
  else if (negCount > posCount + 1) result.sentiment = "negative";
  else if (posCount > 0 && negCount > 0) result.sentiment = "mixed";
  else if (posCount > 0) result.sentiment = "positive";
  else if (negCount > 0) result.sentiment = "negative";

  // ── Extract topics ──────────────────────────────────
  const topicPatterns = [
    { pattern: /governance|board|director|proxy|voting/i, topic: "Governance" },
    { pattern: /esg|climate|sustainability|environmental|carbon/i, topic: "ESG & Climate" },
    { pattern: /compensation|pay|remuneration|salary/i, topic: "Compensation" },
    { pattern: /growth|revenue|earnings|margin|profit/i, topic: "Growth Strategy" },
    { pattern: /dividend|buyback|capital return|allocation/i, topic: "Capital Allocation" },
    { pattern: /retention|churn|exit|reduce|sell/i, topic: "Retention Risk" },
    { pattern: /valuation|multiple|price|target/i, topic: "Valuation" },
    { pattern: /strategy|roadmap|plan|vision/i, topic: "Strategy" },
    { pattern: /diversity|inclusion|dei/i, topic: "Diversity" },
    { pattern: /ai|artificial intelligence|technology|digital/i, topic: "Technology" },
  ];

  for (const { pattern, topic } of topicPatterns) {
    if (pattern.test(content)) {
      result.topics.push(topic);
    }
  }

  // ── Extract action items ────────────────────────────
  // Look for lines starting with - TODO, action:, follow up, schedule, send, etc.
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      /^[-•*]\s*(todo|action|follow[- ]?up|schedule|send|prepare|draft|arrange|set up|book|organize)/i.test(trimmed) ||
      /^(todo|action item|follow[- ]?up|next step)s?:/i.test(trimmed) ||
      /^[-•*]\s+\S/.test(trimmed) && /\b(need to|should|must|will|going to)\b/i.test(trimmed)
    ) {
      const cleaned = trimmed.replace(/^[-•*]\s*/, "").replace(/^(todo|action item|follow[- ]?up|next step)s?:\s*/i, "");
      if (cleaned.length > 5) {
        result.actionItems.push(cleaned);
      }
    }
  }

  // ── Extract key points ──────────────────────────────
  // Sentences with strong keywords
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 15);
  for (const sentence of sentences) {
    const s = sentence.trim();
    if (
      /\b(key takeaway|important|critical|notably|highlight|concern|decided|agreed|committed|announced)\b/i.test(s)
    ) {
      result.keyPoints.push(s.length > 120 ? s.slice(0, 120) + "..." : s);
    }
  }
  // If no key points found, take the first 1-2 meaningful sentences
  if (result.keyPoints.length === 0 && sentences.length > 0) {
    for (const s of sentences.slice(0, 2)) {
      const trimmed = s.trim();
      if (trimmed.length > 20) {
        result.keyPoints.push(trimmed.length > 120 ? trimmed.slice(0, 120) + "..." : trimmed);
      }
    }
  }

  return result;
}

// ── Sentiment display ─────────────────────────────────────
const sentimentConfig = {
  positive: { label: "Positive", color: "text-emerald-600", bg: "bg-emerald-50" },
  negative: { label: "Negative", color: "text-red-600", bg: "bg-red-50" },
  mixed: { label: "Mixed", color: "text-amber-600", bg: "bg-amber-50" },
  neutral: { label: "Neutral", color: "text-zinc-500", bg: "bg-zinc-100" },
};

const sentimentToValue = {
  positive: "Positive",
  negative: "Negative",
  mixed: "Mixed — needs attention",
  neutral: "Neutral",
};

// ── Component ─────────────────────────────────────────────
export function CaptureModal({ open, onClose }) {
  const data = useData();
  const [step, setStep] = useState("input"); // input | processing | review | done
  const [sourceType, setSourceType] = useState("quick_note");
  const [content, setContent] = useState("");
  const [investorId, setInvestorId] = useState("");
  const [date, setDate] = useState("2026-04-04");
  const [extracted, setExtracted] = useState(null);
  const [createAction, setCreateAction] = useState(false);
  const [actionObjective, setActionObjective] = useState("");

  function resetAndClose() {
    setStep("input");
    setSourceType("quick_note");
    setContent("");
    setInvestorId("");
    setDate("2026-04-04");
    setExtracted(null);
    setCreateAction(false);
    setActionObjective("");
    onClose();
  }

  function handleExtract(e) {
    e.preventDefault();
    setStep("processing");

    // Simulate processing delay for UX
    setTimeout(() => {
      const result = extractEntities(content, data.investors, investorId || null);
      setExtracted(result);

      // Pre-fill action objective if action items found
      if (result.actionItems.length > 0) {
        setCreateAction(true);
        setActionObjective(result.actionItems[0]);
      }

      setStep("review");
    }, 800);
  }

  function handleConfirm() {
    if (!extracted) return;

    const timelineType = sourceToTimelineType[sourceType] || "email";

    // Build a concise description from key points or first part of content
    const description =
      extracted.keyPoints.length > 0
        ? extracted.keyPoints[0]
        : content.length > 150
        ? content.slice(0, 150) + "..."
        : content;

    // 1. Add timeline event
    if (extracted.investorId) {
      data.addTimelineEvent({
        investorId: extracted.investorId,
        type: timelineType,
        date,
        description,
      });
    }

    // 2. Update contact last interaction dates
    for (const contact of extracted.contacts) {
      data.updateContactLastInteraction(contact.id, date);
    }

    // 3. Update investor sentiment if detected
    if (
      extracted.investorId &&
      extracted.sentiment !== "neutral"
    ) {
      data.updateInvestorSentiment(
        extracted.investorId,
        sentimentToValue[extracted.sentiment]
      );
    }

    // 4. Create action if requested
    if (createAction && actionObjective.trim() && extracted.investorId) {
      const contactId = extracted.contacts.length > 0 ? extracted.contacts[0].id : null;
      data.addAction({
        investorId: extracted.investorId,
        contactId,
        type: extracted.topics.includes("Retention Risk")
          ? "retention_risk"
          : extracted.topics.includes("Governance")
          ? "governance_management"
          : "relationship_maintenance",
        objective: actionObjective,
        owner: "Jane Doe",
        dueDate: new Date(new Date(date).getTime() + 7 * 86400000)
          .toISOString()
          .slice(0, 10),
        channel: sourceType === "email" ? "Email" : sourceType === "call_notes" ? "Phone" : "Video Call",
        talkingPoints: "",
        messageAngle: "",
        successCriteria: "",
        signalId: null,
        outcome: null,
      });
    }

    // 5. Save the capture record
    data.addCapture({
      sourceType,
      content,
      investorId: extracted.investorId,
      contacts: extracted.contacts.map((c) => c.id),
      sentiment: extracted.sentiment,
      topics: extracted.topics,
      actionItems: extracted.actionItems,
      date,
    });

    setStep("done");
    setTimeout(resetAndClose, 1800);
  }

  if (!open) return null;

  const inputClasses =
    "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl border border-zinc-200/60 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900">
              <Plus size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Capture</h2>
              {step === "review" && (
                <p className="text-[11px] text-zinc-400">Review extracted intelligence</p>
              )}
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="rounded-xl p-1.5 text-zinc-300 hover:bg-zinc-50 hover:text-zinc-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6 flex-1">
          {/* ── STEP: Processing ──────────────────────────── */}
          {step === "processing" && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
                <Loader2 size={24} className="text-zinc-900 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-zinc-900">Processing content...</p>
              <p className="mt-1.5 text-xs text-zinc-400">
                Extracting investors, contacts, sentiment, and action items
              </p>
            </div>
          )}

          {/* ── STEP: Done ────────────────────────────────── */}
          {step === "done" && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                <CheckCircle2 size={24} className="text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-zinc-900">Intelligence captured</p>
              <p className="mt-1.5 text-xs text-zinc-400">
                Timeline, contacts, and sentiment updated successfully
              </p>
              {createAction && actionObjective && (
                <p className="mt-2 text-xs text-emerald-600 font-medium">
                  + Action item created
                </p>
              )}
            </div>
          )}

          {/* ── STEP: Input ───────────────────────────────── */}
          {step === "input" && (
            <form onSubmit={handleExtract} className="space-y-4">
              {/* Source type chips */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-2">
                  Source Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {sourceTypes.map((st) => {
                    const Icon = st.icon;
                    const isActive = sourceType === st.value;
                    return (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => setSourceType(st.value)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        <Icon size={12} />
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-1.5">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className={inputClasses}
                  placeholder={"Paste meeting notes, call summary, or just type...\n\nTip: mention investor/contact names and the system will auto-detect them. Use bullet points for action items."}
                  required
                />
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-300">
                  <Sparkles size={10} />
                  Auto-extracts investors, contacts, action items, sentiment, and topics
                </p>
              </div>

              {/* Investor + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-1.5">
                    Investor <span className="text-zinc-300">(optional)</span>
                  </label>
                  <select
                    value={investorId}
                    onChange={(e) => setInvestorId(e.target.value)}
                    className={inputClasses}
                  >
                    <option value="">Auto-detect...</option>
                    {data.investors.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 transition-all"
                >
                  Extract & Review
                </button>
              </div>
            </form>
          )}

          {/* ── STEP: Review ──────────────────────────────── */}
          {step === "review" && extracted && (
            <div className="space-y-4">
              {/* Investor match */}
              <div className="rounded-xl border border-zinc-200/60 bg-zinc-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={14} className="text-zinc-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                    Investor Detected
                  </span>
                </div>
                {extracted.investor ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-[11px] font-bold text-white">
                      {extracted.investor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{extracted.investor.name}</p>
                      <p className="text-[11px] text-zinc-400">
                        {extracted.investor.type} &middot; Tier {extracted.investor.tier} &middot; {extracted.investor.holdingPct}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 italic">No investor detected — timeline event will not be created</p>
                )}
              </div>

              {/* Contacts */}
              {extracted.contacts.length > 0 && (
                <div className="rounded-xl border border-zinc-200/60 bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-zinc-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                      Contacts Detected ({extracted.contacts.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {extracted.contacts.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                        <span className="font-medium text-zinc-900">{c.name}</span>
                        <span className="text-zinc-400">&middot;</span>
                        <span className="text-zinc-500 text-xs">{c.role}</span>
                      </div>
                    ))}
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Last interaction date will be updated to {date}
                    </p>
                  </div>
                </div>
              )}

              {/* Sentiment */}
              <div className="rounded-xl border border-zinc-200/60 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-zinc-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                    Sentiment Analysis
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
                    sentimentConfig[extracted.sentiment].bg,
                    sentimentConfig[extracted.sentiment].color
                  )}>
                    {sentimentConfig[extracted.sentiment].label}
                  </span>
                  {extracted.investorId && extracted.sentiment !== "neutral" && (
                    <span className="text-[10px] text-zinc-400">
                      Will update investor sentiment
                    </span>
                  )}
                </div>
              </div>

              {/* Topics */}
              {extracted.topics.length > 0 && (
                <div className="rounded-xl border border-zinc-200/60 bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={14} className="text-zinc-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                      Topics Identified ({extracted.topics.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extracted.topics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key points */}
              {extracted.keyPoints.length > 0 && (
                <div className="rounded-xl border border-zinc-200/60 bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-zinc-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                      Key Points
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {extracted.keyPoints.map((point, i) => (
                      <p key={i} className="text-xs text-zinc-600 leading-relaxed">
                        &ldquo;{point}&rdquo;
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Action item toggle */}
              <div className={cn(
                "rounded-xl border p-4 transition-colors",
                createAction ? "border-zinc-900 bg-zinc-50" : "border-zinc-200/60 bg-white"
              )}>
                <button
                  type="button"
                  onClick={() => setCreateAction(!createAction)}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className={createAction ? "text-zinc-900" : "text-zinc-400"} />
                    <span className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.08em]",
                      createAction ? "text-zinc-900" : "text-zinc-400"
                    )}>
                      Create Follow-Up Action
                    </span>
                  </div>
                  <div className={cn(
                    "flex h-5 w-9 items-center rounded-full transition-colors p-0.5",
                    createAction ? "bg-zinc-900" : "bg-zinc-200"
                  )}>
                    <div className={cn(
                      "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                      createAction ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                </button>

                {createAction && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={actionObjective}
                      onChange={(e) => setActionObjective(e.target.value)}
                      placeholder="Action objective..."
                      className={cn(inputClasses, "text-xs")}
                    />
                    {extracted.actionItems.length > 1 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Other detected items:</p>
                        {extracted.actionItems.slice(1, 4).map((item, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActionObjective(item)}
                            className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-[11px] text-zinc-600 hover:bg-zinc-100 transition-colors"
                          >
                            <ChevronRight size={10} className="text-zinc-400 flex-shrink-0" />
                            <span className="truncate">{item}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Summary of what will happen */}
              <div className="rounded-xl bg-zinc-900 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-2">
                  CHANGES TO BE APPLIED
                </p>
                <ul className="space-y-1.5">
                  {extracted.investorId && (
                    <li className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                      Timeline event added for {extracted.investor?.name}
                    </li>
                  )}
                  {extracted.contacts.length > 0 && (
                    <li className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                      {extracted.contacts.length} contact{extracted.contacts.length !== 1 ? "s" : ""} last interaction updated
                    </li>
                  )}
                  {extracted.investorId && extracted.sentiment !== "neutral" && (
                    <li className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                      Investor sentiment updated to &ldquo;{sentimentConfig[extracted.sentiment].label}&rdquo;
                    </li>
                  )}
                  {createAction && actionObjective && (
                    <li className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                      Follow-up action created (due {new Date(new Date(date).getTime() + 7 * 86400000).toISOString().slice(0, 10)})
                    </li>
                  )}
                  {!extracted.investorId && extracted.contacts.length === 0 && (
                    <li className="flex items-center gap-2 text-xs text-zinc-400">
                      <Clock size={12} className="text-zinc-500 flex-shrink-0" />
                      No entities detected — capture will be stored as a note
                    </li>
                  )}
                </ul>
              </div>

              {/* Confirm / Back buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 transition-all"
                >
                  Confirm & Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
