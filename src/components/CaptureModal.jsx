import { useState } from "react";
import { X, Plus, FileText, Phone, Mail, Camera, StickyNote, File, Sparkles } from "lucide-react";
import { investors } from "../data/mock-data";

const sourceTypes = [
  { value: "meeting_notes", label: "Meeting Notes", icon: FileText },
  { value: "call_notes", label: "Call Notes", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "document", label: "Document", icon: File },
  { value: "voice_memo", label: "Voice Memo", icon: Mic },
  { value: "photo", label: "Photo", icon: Camera },
  { value: "quick_note", label: "Quick Note", icon: StickyNote },
];

export function CaptureModal({ open, onClose }) {
  const [sourceType, setSourceType] = useState("quick_note");
  const [content, setContent] = useState("");
  const [investorId, setInvestorId] = useState("");
  const [date, setDate] = useState("2026-04-04");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      resetAndClose();
    }, 1500);
  }

  function resetAndClose() {
    setSourceType("quick_note");
    setContent("");
    setInvestorId("");
    setDate("2026-04-04");
    onClose();
  }

  if (!open) return null;

  const inputClasses =
    "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5";

  const selectedSource = sourceTypes.find((s) => s.value === sourceType);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-2xl bg-white p-6 shadow-xl border border-zinc-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900">
              <Plus size={14} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">Capture</h2>
          </div>
          <button
            onClick={resetAndClose}
            className="rounded-xl p-1.5 text-zinc-300 hover:bg-zinc-50 hover:text-zinc-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <Sparkles size={20} className="text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-zinc-900">Captured successfully</p>
            <p className="mt-1 text-xs text-zinc-400">
              Extracting contacts, action items, and key topics...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Content — main input */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400 mb-1.5">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className={inputClasses}
                placeholder="Paste notes, drop a link, or just type..."
                required
              />
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-300">
                <Sparkles size={10} />
                The system will automatically extract contacts, action items, sentiment, and key topics
              </p>
            </div>

            {/* Investor (optional) + Date row */}
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
                  {investors.map((inv) => (
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
                Capture
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
