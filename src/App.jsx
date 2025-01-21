import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Queue from './pages/agent/Queue'
import SubmitTicket from './pages/customer/SubmitTicket'
import Settings from './pages/Settings'
import Customers from './pages/Customers'
import Tickets from './pages/Tickets'

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Protected Customer Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit-ticket"
          element={
            <ProtectedRoute>
              <Layout>
                <SubmitTicket />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Agent Routes */}
        <Route
          path="/queue"
          element={
            <ProtectedRoute requiredRole="agent">
              <Layout>
                <Queue />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Settings Route */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Tickets Route */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <Layout>
                <Tickets />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Customers Route */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Layout>
                <Customers />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App 