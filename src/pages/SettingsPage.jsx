import { Settings, Bell, Database, Users, Shield, Globe } from 'lucide-react'

const sections = [
  { icon: Users, title: 'Team Configuration', desc: 'Manage team members, roles, and coverage assignments.' },
  { icon: Bell, title: 'Notification Preferences', desc: 'Configure signal alerts, email digests, and urgency thresholds.' },
  { icon: Database, title: 'Data Source Connections', desc: 'Euroclear, Finansinspektionen, Nasdaq Stockholm, fund reporting feeds.' },
  { icon: Shield, title: 'Confidence Calibration', desc: 'Adjust signal sensitivity, false-positive tolerance, and evidence weighting.' },
  { icon: Globe, title: 'Market Configuration', desc: 'Peer group definitions, sector benchmarks, and index compositions.' },
]

export function SettingsPage() {
  return (
    <div className="min-h-full p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Platform configuration and system preferences.</p>
      </div>

      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.title} className="flex items-start gap-4 rounded-lg border border-slate-200 p-5 transition-colors hover:bg-slate-50">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <s.icon size={18} className="text-slate-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
