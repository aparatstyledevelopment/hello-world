import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Search, Bell, Plus, Menu, X } from 'lucide-react'
import { LogInteractionModal } from '../LogInteractionModal'

function HeaderBar({ onMenuToggle, menuOpen, onLogInteraction }) {
  return (
    <header className="flex h-[52px] items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="mr-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Search */}
      <div className="relative hidden w-80 sm:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search investors, signals, or notes..."
          className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-16 text-[13px] text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
        />
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">⌘</kbd>
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">K</kbd>
        </div>
      </div>

      {/* Mobile search icon */}
      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 sm:hidden">
        <Search size={18} />
      </button>

      {/* Spacer on mobile */}
      <div className="flex-1 sm:hidden" />

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Live Engine Status */}
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 lg:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[12px] font-semibold tracking-wide text-emerald-600">LIVE ENGINE</span>
        </div>

        {/* Green dot only on smaller screens */}
        <span className="relative flex h-2.5 w-2.5 lg:hidden">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>

        {/* Notification Bell */}
        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
          <Bell size={18} strokeWidth={1.5} />
        </button>

        {/* Log Interaction CTA */}
        <button
          onClick={onLogInteraction}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-[13px] font-medium text-white hover:bg-slate-800 md:px-4"
        >
          <Plus size={15} strokeWidth={2} />
          <span className="hidden sm:inline">Log Interaction</span>
        </button>
      </div>
    </header>
  )
}

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logModalOpen, setLogModalOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar - hidden on mobile, shown as overlay when menuOpen */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[240px] transform transition-transform md:static md:w-[200px] md:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderBar onMenuToggle={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} onLogInteraction={() => setLogModalOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
      <LogInteractionModal open={logModalOpen} onClose={() => setLogModalOpen(false)} />
    </div>
  )
}
