import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Search, Bell, Mic, Menu, X } from 'lucide-react'
import { CaptureModal } from '../CaptureModal'

function HeaderBar({ onMenuToggle, menuOpen, onLogInteraction }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-100 bg-white px-4 md:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="mr-3 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 md:hidden"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Search */}
      <div className="relative hidden sm:block sm:w-52 md:w-80">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
        <input
          type="text"
          placeholder="Search investors, signals, or notes..."
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-16 text-[13px] text-zinc-700 placeholder:text-zinc-400 transition-colors focus:border-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
        />
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          <kbd className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">⌘</kbd>
          <kbd className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">K</kbd>
        </div>
      </div>

      {/* Mobile search icon */}
      <button className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 sm:hidden">
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
        <button className="relative rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600">
          <Bell size={18} strokeWidth={1.5} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Capture CTA */}
        <button
          onClick={onLogInteraction}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md active:scale-[0.98]"
        >
          <Mic size={15} strokeWidth={2} />
          <span className="hidden sm:inline">Capture</span>
        </button>
      </div>
    </header>
  )
}

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logModalOpen, setLogModalOpen] = useState(false)

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

      <div className="flex flex-1 flex-col min-h-0">
        <HeaderBar onMenuToggle={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} onLogInteraction={() => setLogModalOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-zinc-50/50">
          <Outlet />
        </main>
      </div>
      <CaptureModal open={logModalOpen} onClose={() => setLogModalOpen(false)} />
    </div>
  )
}
