import { useState, useEffect, useMemo, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Search, Bell, Plus, Menu, X, Users, Zap, User, TrendingDown, Shield, FileText, CheckSquare, Clock } from 'lucide-react'
import { CaptureModal } from '../CaptureModal'
import { investors, signals, actions, getInvestor } from '../../data/mock-data'

function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return { investors: [], signals: [], contacts: [] }
    const q = query.toLowerCase()

    const matchedInvestors = investors.filter(
      (inv) => inv.name.toLowerCase().includes(q) || inv.type.toLowerCase().includes(q)
    ).slice(0, 5)

    const matchedSignals = signals.filter(
      (s) => s.headline.toLowerCase().includes(q) || s.type.toLowerCase().includes(q)
    ).slice(0, 5)

    const matchedContacts = []
    for (const inv of investors) {
      for (const c of inv.contacts) {
        if (c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)) {
          matchedContacts.push({ ...c, investorName: inv.name, investorId: inv.id })
        }
      }
    }

    return { investors: matchedInvestors, signals: matchedSignals, contacts: matchedContacts.slice(0, 5) }
  }, [query])

  const hasResults = results.investors.length > 0 || results.signals.length > 0 || results.contacts.length > 0

  function handleSelect(path) {
    onClose()
    navigate(path)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[10vh] bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl border border-zinc-200/60 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
          <Search size={16} className="text-zinc-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search investors, signals, contacts..."
            className="flex-1 text-sm text-zinc-700 placeholder:text-zinc-400 outline-none bg-transparent"
          />
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-300 hover:text-zinc-500">
            <kbd className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">ESC</kbd>
          </button>
        </div>

        {query.length >= 2 && (
          <div className="max-h-80 overflow-y-auto p-2">
            {!hasResults && (
              <p className="px-3 py-6 text-center text-sm text-zinc-400">No results found</p>
            )}

            {results.investors.length > 0 && (
              <div className="mb-1">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Investors</p>
                {results.investors.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => handleSelect(`/investors/${inv.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-zinc-50 transition-colors"
                  >
                    <Users size={14} className="text-zinc-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{inv.name}</p>
                      <p className="text-[11px] text-zinc-400">{inv.type} &middot; {inv.holdingPct}%</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.signals.length > 0 && (
              <div className="mb-1">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Signals</p>
                {results.signals.map((sig) => (
                  <button
                    key={sig.id}
                    onClick={() => handleSelect(`/signals/${sig.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-zinc-50 transition-colors"
                  >
                    <Zap size={14} className="text-zinc-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{sig.headline}</p>
                      <p className="text-[11px] text-zinc-400">{sig.type.replace(/_/g, ' ')} &middot; {sig.urgency}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.contacts.length > 0 && (
              <div className="mb-1">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Contacts</p>
                {results.contacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(`/contacts/${c.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-zinc-50 transition-colors"
                  >
                    <User size={14} className="text-zinc-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{c.name}</p>
                      <p className="text-[11px] text-zinc-400">{c.role} &middot; {c.investorName}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {query.length < 2 && (
          <div className="px-3 py-6 text-center text-sm text-zinc-400">
            Type at least 2 characters to search
          </div>
        )}
      </div>
    </div>
  )
}

const TODAY = new Date('2026-04-04')

const notificationItems = (() => {
  const items = []

  // High-urgency unresolved signals
  for (const s of signals) {
    if (s.state !== 'resolved' && s.state !== 'dismissed' && s.urgency === 'high') {
      const inv = getInvestor(s.investorId)
      items.push({
        id: `sig-${s.id}`,
        type: 'signal',
        title: s.headline,
        subtitle: inv?.name || 'Unknown investor',
        urgency: s.urgency,
        date: s.detectedAt,
        route: `/signals/${s.id}`,
        read: false,
      })
    }
  }

  // Overdue or due-today actions
  for (const a of actions) {
    if (a.state === 'completed') continue
    const due = new Date(a.dueDate)
    if (due <= TODAY) {
      const inv = getInvestor(a.investorId)
      const isOverdue = due < TODAY
      items.push({
        id: `act-${a.id}`,
        type: 'action',
        title: a.objective.length > 70 ? a.objective.slice(0, 70) + '...' : a.objective,
        subtitle: `${inv?.name || 'Unknown'} — ${isOverdue ? 'Overdue' : 'Due today'}`,
        urgency: isOverdue ? 'high' : 'medium',
        date: a.dueDate,
        route: `/actions/${a.id}`,
        read: false,
      })
    }
  }

  // Medium-urgency signals
  for (const s of signals) {
    if (s.state !== 'resolved' && s.state !== 'dismissed' && s.urgency === 'medium') {
      const inv = getInvestor(s.investorId)
      items.push({
        id: `sig-${s.id}`,
        type: 'signal',
        title: s.headline,
        subtitle: inv?.name || 'Unknown investor',
        urgency: s.urgency,
        date: s.detectedAt,
        route: `/signals/${s.id}`,
        read: true,
      })
    }
  }

  return items.slice(0, 12)
})()

const unreadCount = notificationItems.filter((n) => !n.read).length

function NotificationsPanel({ open, onClose }) {
  const navigate = useNavigate()
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  const typeIcons = { signal: Zap, action: CheckSquare }

  return (
    <div ref={panelRef} className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-zinc-200/60 shadow-xl z-[80] overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-zinc-300 hover:text-zinc-500">
          <X size={16} />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notificationItems.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-400">No notifications</p>
        ) : (
          notificationItems.map((item) => {
            const Icon = typeIcons[item.type] || Bell
            return (
              <button
                key={item.id}
                onClick={() => { onClose(); navigate(item.route) }}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 border-b border-zinc-50 ${!item.read ? 'bg-zinc-50/50' : ''}`}
              >
                <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${item.urgency === 'high' ? 'bg-red-50' : 'bg-zinc-100'}`}>
                  <Icon size={13} className={item.urgency === 'high' ? 'text-red-500' : 'text-zinc-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] leading-snug truncate ${!item.read ? 'font-medium text-zinc-900' : 'text-zinc-700'}`}>
                    {item.title}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{item.subtitle}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <span className="text-[10px] text-zinc-400 font-mono">{item.date}</span>
                  {!item.read && <span className="h-2 w-2 rounded-full bg-red-500" />}
                </div>
              </button>
            )
          })
        )}
      </div>

      <div className="border-t border-zinc-100 px-4 py-2.5">
        <button
          onClick={() => { onClose(); navigate('/signals-actions') }}
          className="w-full text-center text-xs font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          View all signals & actions
        </button>
      </div>
    </div>
  )
}

function HeaderBar({ onMenuToggle, menuOpen, onLogInteraction, onSearchOpen }) {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-100 bg-white px-4 md:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="mr-3 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 md:hidden"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Search trigger */}
      <button
        onClick={onSearchOpen}
        className="relative hidden sm:flex sm:w-52 md:w-80 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-16 text-left transition-colors hover:border-zinc-300 hover:bg-white"
      >
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
        <span className="text-[13px] text-zinc-400">Search investors, signals, or notes...</span>
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          <kbd className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">⌘</kbd>
          <kbd className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">K</kbd>
        </div>
      </button>

      {/* Mobile search icon */}
      <button onClick={onSearchOpen} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 sm:hidden">
        <Search size={18} />
      </button>

      {/* Spacer on mobile */}
      <div className="flex-1 sm:hidden" />

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Live Engine Status */}
        <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 lg:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold tracking-wide text-zinc-600">LIVE ENGINE</span>
        </div>

        {/* Dot only on smaller screens */}
        <span className="relative flex h-2.5 w-2.5 lg:hidden">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600"
          >
            <Bell size={18} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* Capture CTA */}
        <button
          onClick={onLogInteraction}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md active:scale-[0.98]"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span className="hidden sm:inline">Capture</span>
        </button>
      </div>
    </header>
  )
}

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-50">
      {/* Sidebar - hidden on mobile, shown as overlay when menuOpen */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity md:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform md:static md:w-[220px] md:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden">
        <HeaderBar onMenuToggle={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} onLogInteraction={() => setLogModalOpen(true)} onSearchOpen={() => setSearchOpen(true)} />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-zinc-50/50">
          <Outlet />
        </main>
      </div>
      <CaptureModal open={logModalOpen} onClose={() => setLogModalOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
