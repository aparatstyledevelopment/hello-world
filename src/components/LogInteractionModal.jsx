import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { investors } from "../data/mock-data";

const interactionTypes = [
  "Meeting",
  "Call",
  "Email",
  "Roadshow",
  "Governance Engagement",
];

export function LogInteractionModal({ open, onClose }) {
  const [investorId, setInvestorId] = useState("");
  const [contactId, setContactId] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("2026-04-01");
  const [summary, setSummary] = useState("");
  const [takeaways, setTakeaways] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [followUpDesc, setFollowUpDesc] = useState("");

  const selectedInvestor = useMemo(
    () => investors.find((i) => i.id === investorId),
    [investorId]
  );

  const contacts = useMemo(
    () => selectedInvestor?.contacts ?? [],
    [selectedInvestor]
  );

  function handleSubmit(e) {
    e.preventDefault();
    alert("Interaction logged successfully.");
    resetAndClose();
  }

  function resetAndClose() {
    setInvestorId("");
    setContactId("");
    setType("");
    setDate("2026-04-01");
    setSummary("");
    setTakeaways("");
    setFollowUp(false);
    setFollowUpDesc("");
    onClose();
  }

  if (!open) return null;

  const inputClasses = "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-zinc-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-900">Log Interaction</h2>
          <button
            onClick={resetAndClose}
            className="rounded-xl p-1.5 text-zinc-300 hover:bg-zinc-50 hover:text-zinc-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-1.5">
              Investor
            </label>
            <select value={investorId} onChange={(e) => { setInvestorId(e.target.value); setContactId(""); }} className={inputClasses} required>
              <option value="">Select investor...</option>
              {investors.map((inv) => (<option key={inv.id} value={inv.id}>{inv.name}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-1.5">
              Contact
            </label>
            <select value={contactId} onChange={(e) => setContactId(e.target.value)} className={inputClasses} disabled={!investorId} required>
              <option value="">{investorId ? "Select contact..." : "Select an investor first"}</option>
              {contacts.map((c) => (<option key={c.id} value={c.id}>{c.name} — {c.role}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-1.5">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClasses} required>
              <option value="">Select type...</option>
              {interactionTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClasses} required />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-1.5">Summary</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className={inputClasses} placeholder="Brief summary of the interaction..." />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-1.5">Key Takeaways</label>
            <textarea value={takeaways} onChange={(e) => setTakeaways(e.target.value)} rows={2} className={inputClasses} placeholder="Key takeaways or insights..." />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400" />
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">Follow-up needed?</span>
            </label>
          </div>

          {followUp && (
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-1.5">Follow-up Description</label>
              <input type="text" value={followUpDesc} onChange={(e) => setFollowUpDesc(e.target.value)} className={inputClasses} placeholder="Describe the follow-up action..." />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button type="button" onClick={resetAndClose} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 transition-all">
              Log Interaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
