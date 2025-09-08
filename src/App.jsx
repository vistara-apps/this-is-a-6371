import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import CRMRecords from './pages/CRMRecords'
import LeadScoring from './pages/LeadScoring'
import FollowUpCadences from './pages/FollowUpCadences'
import DataHealth from './pages/DataHealth'
import Login from './pages/Login'
import { AppProvider } from './context/AppContext'
import { validateEnvironment } from './config/api'

function App() {
  // Validate environment variables on app start
  React.useEffect(() => {
    validateEnvironment()
  }, [])

  return (
    <AppProvider>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/*" element={
          <AppShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/crm-records" element={<CRMRecords />} />
              <Route path="/lead-scoring" element={<LeadScoring />} />
              <Route path="/follow-up-cadences" element={<FollowUpCadences />} />
              <Route path="/data-health" element={<DataHealth />} />
            </Routes>
          </AppShell>
        } />
      </Routes>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(220 15% 12%)',
            color: 'hsl(210 40% 98%)',
            border: '1px solid hsl(220 13% 18%)',
          },
          success: {
            iconTheme: {
              primary: 'hsl(142 76% 36%)',
              secondary: 'hsl(210 40% 98%)',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(0 84% 60%)',
              secondary: 'hsl(210 40% 98%)',
            },
          },
        }}
      />
    </AppProvider>
  )
}

export default App
