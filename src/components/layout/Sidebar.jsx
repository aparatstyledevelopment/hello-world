import { NavLink } from 'react-router-dom'
import {
  Home,
  Bell,
  CheckSquare,
  Users,
  TrendingUp,
  UserCircle,
  BarChart3,
  GitCompare,
  Vote,
  Users2,
} from 'lucide-react'

const primaryNav = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/signals', label: 'Signals', icon: Bell, badge: 5 },
  { to: '/actions', label: 'Actions', icon: CheckSquare, badge: 12 },
  { to: '/investors', label: 'Investors', icon: Users },
  { to: '/market', label: 'Market', icon: TrendingUp },
]

const secondaryNav = [
  { to: '/personas', label: 'Personas', icon: UserCircle },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/benchmarking', label: 'Benchmarking', icon: GitCompare },
  { to: '/agm', label: 'AGM', icon: Vote },
  { to: '/collaboration', label: 'Collaboration', icon: Users2 },
]

function SidebarLink({ to, label, icon: Icon, badge }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'text-white bg-primary-600/20 font-medium'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`
      }
    >
      <Icon size={18} />
      <span className="flex-1">{label}</span>
      {badge != null && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="flex w-60 flex-col bg-slate-900 text-white">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-sm font-bold">
          IC
        </div>
        <span className="text-sm font-bold tracking-wide text-white">
          Investor Care OS
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {/* Primary */}
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-slate-700/50" />

        {/* Secondary */}
        <div className="space-y-0.5">
          {secondaryNav.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-slate-700/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-200">
            JD
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">
              Jane Doe
            </p>
            <p className="truncate text-xs text-slate-500">IR Manager</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
