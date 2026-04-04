import { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  investors as initialInvestors,
  signals as initialSignals,
  actions as initialActions,
  timelineEvents as initialTimeline,
  meetings as initialMeetings,
} from "./mock-data";

const DataContext = createContext(null);

// ── Deep clone helper ─────────────────────────────────────
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ── Provider ──────────────────────────────────────────────
export function DataProvider({ children }) {
  const [investors, setInvestors] = useState(() => clone(initialInvestors));
  const [signals, setSignals] = useState(() => clone(initialSignals));
  const [actions, setActions] = useState(() => clone(initialActions));
  const [timeline, setTimeline] = useState(() => clone(initialTimeline));
  const [meetings] = useState(() => clone(initialMeetings));
  const [captures, setCaptures] = useState([]);

  // ── Lookups ───────────────────────────────────────────
  const getInvestor = useCallback(
    (id) => investors.find((i) => i.id === id) || null,
    [investors]
  );

  const getContact = useCallback(
    (id) => {
      for (const inv of investors) {
        const c = inv.contacts.find((c) => c.id === id);
        if (c) return c;
      }
      return null;
    },
    [investors]
  );

  const getInvestorForContact = useCallback(
    (contactId) =>
      investors.find((inv) => inv.contacts.some((c) => c.id === contactId)) ||
      null,
    [investors]
  );

  const getSignal = useCallback(
    (id) => signals.find((s) => s.id === id) || null,
    [signals]
  );

  const getAction = useCallback(
    (id) => actions.find((a) => a.id === id) || null,
    [actions]
  );

  const getSignalsForInvestor = useCallback(
    (investorId) => signals.filter((s) => s.investorId === investorId),
    [signals]
  );

  const getActionsForInvestor = useCallback(
    (investorId) => actions.filter((a) => a.investorId === investorId),
    [actions]
  );

  const getTimelineForInvestor = useCallback(
    (investorId) =>
      timeline
        .filter((e) => e.investorId === investorId)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [timeline]
  );

  const getMeetingsForDate = useCallback(
    (dateStr) => meetings.filter((m) => m.date === dateStr),
    [meetings]
  );

  // ── Mutations ─────────────────────────────────────────

  const addTimelineEvent = useCallback((event) => {
    const id = `tl-cap-${Date.now()}`;
    const entry = { id, ...event };
    setTimeline((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const addAction = useCallback((action) => {
    const id = `act-cap-${Date.now()}`;
    const entry = { id, state: "planned", ...action };
    setActions((prev) => [...prev, entry]);
    return entry;
  }, []);

  const addSignal = useCallback((signal) => {
    const id = `sig-cap-${Date.now()}`;
    const entry = { id, state: "new", ...signal };
    setSignals((prev) => [...prev, entry]);
    return entry;
  }, []);

  const updateContactLastInteraction = useCallback((contactId, date) => {
    setInvestors((prev) =>
      prev.map((inv) => ({
        ...inv,
        contacts: inv.contacts.map((c) =>
          c.id === contactId ? { ...c, lastInteraction: date } : c
        ),
      }))
    );
  }, []);

  const updateInvestorSentiment = useCallback((investorId, sentiment) => {
    setInvestors((prev) =>
      prev.map((inv) => {
        if (inv.id !== investorId) return inv;
        const params = inv.stateParameters || [];
        const existing = params.findIndex((p) => p.label === "Sentiment");
        const newParam = {
          label: "Sentiment",
          value: sentiment,
          provenance: "team_assessed",
          freshness: "fresh",
        };
        const newParams =
          existing >= 0
            ? params.map((p, i) => (i === existing ? newParam : p))
            : [...params, newParam];
        return { ...inv, stateParameters: newParams };
      })
    );
  }, []);

  const addCapture = useCallback((capture) => {
    const id = `cap-${Date.now()}`;
    const entry = { id, capturedAt: new Date().toISOString(), ...capture };
    setCaptures((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const value = useMemo(
    () => ({
      // Data
      investors,
      signals,
      actions,
      timeline,
      meetings,
      captures,
      // Lookups
      getInvestor,
      getContact,
      getInvestorForContact,
      getSignal,
      getAction,
      getSignalsForInvestor,
      getActionsForInvestor,
      getTimelineForInvestor,
      getMeetingsForDate,
      // Mutations
      addTimelineEvent,
      addAction,
      addSignal,
      updateContactLastInteraction,
      updateInvestorSentiment,
      addCapture,
    }),
    [
      investors,
      signals,
      actions,
      timeline,
      meetings,
      captures,
      getInvestor,
      getContact,
      getInvestorForContact,
      getSignal,
      getAction,
      getSignalsForInvestor,
      getActionsForInvestor,
      getTimelineForInvestor,
      getMeetingsForDate,
      addTimelineEvent,
      addAction,
      addSignal,
      updateContactLastInteraction,
      updateInvestorSentiment,
      addCapture,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
