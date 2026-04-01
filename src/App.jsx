import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { SignalsPage } from './pages/SignalsPage'
import { SignalDetailPage } from './pages/SignalDetailPage'
import { ActionsPage } from './pages/ActionsPage'
import { ActionDetailPage } from './pages/ActionDetailPage'
import { InvestorsPage } from './pages/InvestorsPage'
import { InvestorDetailPage } from './pages/InvestorDetailPage'
import { MarketPage } from './pages/MarketPage'
import { PersonasPage } from './pages/PersonasPage'
import { ReportsPage } from './pages/ReportsPage'
import { BenchmarkingPage } from './pages/BenchmarkingPage'
import { AGMPage } from './pages/AGMPage'
import { CollaborationPage } from './pages/CollaborationPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/signals" element={<SignalsPage />} />
          <Route path="/signals/:id" element={<SignalDetailPage />} />
          <Route path="/actions" element={<ActionsPage />} />
          <Route path="/actions/:id" element={<ActionDetailPage />} />
          <Route path="/investors" element={<InvestorsPage />} />
          <Route path="/investors/:id" element={<InvestorDetailPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/personas" element={<PersonasPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/benchmarking" element={<BenchmarkingPage />} />
          <Route path="/agm" element={<AGMPage />} />
          <Route path="/collaboration" element={<CollaborationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
