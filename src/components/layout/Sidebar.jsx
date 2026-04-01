import { NavLink } from 'react-router-dom'
import {
  Home,
  Zap,
  CheckSquare,
  Users,
  TrendingUp,
  UserCircle,
  BarChart3,
  GitCompare,
  Vote,
  Users2,
  Settings,
} from 'lucide-react'

const mainEngineNav = [
  { to: '/investors', label: 'Investors', icon: Users },
  { to: '/signals', label: 'Signals', icon: Zap },
]

const resourcesNav = [
  { to: '/settings', label: 'Settings', icon: Settings },
]

function SectionLabel({ children }) {
  return (
    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
      {children}
    </p>
  )
}

function SidebarLink({ to, label, icon: Icon, badge, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors ${
          isActive
            ? 'bg-primary-600 font-medium text-white'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`
      }
    >
      <Icon size={16} strokeWidth={1.8} />
      <span>{label}</span>
      {badge != null && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-700 px-1.5 text-[10px] font-semibold text-slate-300">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="flex w-[200px] flex-col bg-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-[11px] font-bold text-white">
          I
        </div>
        <span className="text-[14px] font-bold text-white">
          Intelligence
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pt-4">
        <div>
          <SectionLabel>Main Engine</SectionLabel>
          <div className="space-y-0.5">
            {mainEngineNav.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Resources */}
      <div className="px-3 pb-2">
        <SectionLabel>Resources</SectionLabel>
        <div className="space-y-0.5">
          {resourcesNav.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </div>
      </div>

      {/* User */}
      <div className="border-t border-slate-700/30 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-[11px] font-bold text-white">
            JS
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-slate-200">
              James Sterling
            </p>
            <p className="truncate text-[11px] text-slate-500">Head of IR</p>
          </div>
          <button className="ml-auto text-slate-500 hover:text-slate-300">
            <Settings size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
