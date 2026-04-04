import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { TodayPage } from './pages/TodayPage'
import { SignalsActionsPage } from './pages/SignalsActionsPage'
import { SignalDetailPage } from './pages/SignalDetailPage'
import { ActionDetailPage } from './pages/ActionDetailPage'
import { InvestorsPage } from './pages/InvestorsPage'
import { InvestorDetailPage } from './pages/InvestorDetailPage'
import { ContactDetailPage } from './pages/ContactDetailPage'
import { InvestorTimelinePage } from './pages/InvestorTimelinePage'
import { ShareholderIntelPage } from './pages/ShareholderIntelPage'
import { MarketPage } from './pages/MarketPage'
import { ReportsPage } from './pages/ReportsPage'
import { CollaborationPage } from './pages/CollaborationPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/investors" element={<InvestorsPage />} />
          <Route path="/investors/:id" element={<InvestorDetailPage />} />
          <Route path="/contacts/:id" element={<ContactDetailPage />} />
          <Route path="/investors/:id/timeline" element={<InvestorTimelinePage />} />
          <Route path="/shareholders" element={<ShareholderIntelPage />} />
          <Route path="/signals-actions" element={<SignalsActionsPage />} />
          <Route path="/signals/:id" element={<SignalDetailPage />} />
          <Route path="/actions/:id" element={<ActionDetailPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/personas" element={<Navigate to="/investors?tab=personas" replace />} />
          <Route path="/agm" element={<Navigate to="/investors?tab=agm" replace />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/benchmarking" element={<Navigate to="/market?tab=benchmarking" replace />} />
          <Route path="/collaboration" element={<CollaborationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
