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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-black">Log Interaction</h2>
          <button
            onClick={resetAndClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Investor */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-1">
              Investor
            </label>
            <select
              value={investorId}
              onChange={(e) => {
                setInvestorId(e.target.value);
                setContactId("");
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
              required
            >
              <option value="">Select investor...</option>
              {investors.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.name}
                </option>
              ))}
            </select>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-1">
              Contact
            </label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
              disabled={!investorId}
              required
            >
              <option value="">
                {investorId ? "Select contact..." : "Select an investor first"}
              </option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.role}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
              required
            >
              <option value="">Select type...</option>
              {interactionTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
              required
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-1">
              Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="Brief summary of the interaction..."
            />
          </div>

          {/* Key Takeaways */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-1">
              Key Takeaways
            </label>
            <textarea
              value={takeaways}
              onChange={(e) => setTakeaways(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="Key takeaways or insights..."
            />
          </div>

          {/* Follow-up */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={followUp}
                onChange={(e) => setFollowUp(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-gray-300"
              />
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400">
                Follow-up needed?
              </span>
            </label>
          </div>

          {followUp && (
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-1">
                Follow-up Description
              </label>
              <input
                type="text"
                value={followUpDesc}
                onChange={(e) => setFollowUpDesc(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
                placeholder="Describe the follow-up action..."
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetAndClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Log Interaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
