import { NavLink } from 'react-router-dom'
import {
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
  { to: '/signals', label: 'Signals', icon: Zap },
  { to: '/actions', label: 'Actions', icon: CheckSquare },
  { to: '/investors', label: 'Investors', icon: Users },
  { to: '/market', label: 'Market Intel', icon: TrendingUp },
]

const resourcesNav = [
  { to: '/personas', label: 'Personas', icon: UserCircle },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/benchmarking', label: 'Benchmarking', icon: GitCompare },
  { to: '/agm', label: 'AGM Intel', icon: Vote },
  { to: '/collaboration', label: 'Collaboration', icon: Users2 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function SectionLabel({ children }) {
  return (
    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
      {children}
    </p>
  )
}

function SidebarLink({ to, label, icon: Icon, badge, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all ${
          isActive
            ? 'bg-zinc-900 font-medium text-white shadow-sm'
            : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
        }`
      }
    >
      <Icon size={16} strokeWidth={1.8} />
      <span>{label}</span>
      {badge != null && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-100 px-1.5 text-[10px] font-semibold text-zinc-600">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-zinc-100 bg-white md:w-[220px]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-[12px] font-bold text-white shadow-sm">
          IR
        </div>
        <div>
          <span className="text-[14px] font-bold text-zinc-900">
            Intelligence
          </span>
          <p className="text-[10px] text-zinc-400">IR Platform</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pt-2">
        <div>
          <SectionLabel>Main Engine</SectionLabel>
          <div className="space-y-0.5">
            {mainEngineNav.map((item) => (
              <SidebarLink key={item.to} {...item} onClick={onNavigate} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Resources</SectionLabel>
          <div className="space-y-0.5">
            {resourcesNav.map((item) => (
              <SidebarLink key={item.to} {...item} onClick={onNavigate} />
            ))}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-zinc-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-[11px] font-bold text-zinc-600">
            JS
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-zinc-900">
              James Sterling
            </p>
            <p className="truncate text-[11px] text-zinc-400">Head of IR</p>
          </div>
          <button className="ml-auto rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-zinc-50 hover:text-zinc-500">
            <Settings size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
