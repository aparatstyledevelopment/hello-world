import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Search, Bell, Plus } from 'lucide-react'

function HeaderBar() {
  return (
    <header className="flex h-[52px] items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Search */}
      <div className="relative w-80">
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

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Live Engine Status */}
        <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[12px] font-semibold tracking-wide text-emerald-600">LIVE ENGINE</span>
        </div>

        {/* Notification Bell */}
        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
          <Bell size={18} strokeWidth={1.5} />
        </button>

        {/* Log Interaction CTA */}
        <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-slate-800">
          <Plus size={15} strokeWidth={2} />
          Log Interaction
        </button>
      </div>
    </header>
  )
}

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderBar />
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
