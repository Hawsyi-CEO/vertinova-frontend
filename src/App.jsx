import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CacheProvider } from './context/CacheContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import TransactionGroups from './pages/TransactionGroups'
import TransactionGroupDetail from './pages/TransactionGroupDetail'
import Users from './pages/Users'
import Reports from './pages/Reports'
import Statistics from './pages/Statistics'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <CacheProvider>
        <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            {/* Login sebagai halaman utama */}
            <Route path="/" element={<Login />} />
            
            {/* Dashboard dan protected routes */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transaction-groups" element={<TransactionGroups />} />
              <Route path="/transaction-groups/:id" element={<TransactionGroupDetail />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/users" element={<Users />} />
            </Route>
          </Routes>
        </div>
      </Router>
      </CacheProvider>
    </AuthProvider>
  )
}

export default App
