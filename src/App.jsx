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
import HayabusaDashboard from './pages/HayabusaDashboard'
import HayabusaPaymentForm from './pages/HayabusaPaymentForm'
import Profile from './pages/Profile'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PWAInstallPrompt from './components/PWAInstallPrompt'

function App() {
  return (
    <AuthProvider>
      <CacheProvider>
        <Router>
        <div className="min-h-screen bg-gray-50">
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
          
          <Routes>
            {/* Login sebagai halaman utama */}
            <Route path="/" element={<Login />} />
            
            {/* Hayabusa routes - Standalone without Layout */}
            <Route path="/hayabusa/dashboard" element={
              <ProtectedRoute>
                <HayabusaDashboard />
              </ProtectedRoute>
            } />
            <Route path="/hayabusa/payments/create" element={
              <ProtectedRoute>
                <HayabusaPaymentForm />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Dashboard dan protected routes with Layout */}
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
