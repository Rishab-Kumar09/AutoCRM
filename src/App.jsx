import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Queue from './pages/agent/Queue'
import SubmitTicket from './pages/customer/SubmitTicket'
import Settings from './pages/Settings'

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
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit-ticket"
          element={
            <ProtectedRoute>
              <SubmitTicket />
            </ProtectedRoute>
          }
        />

        {/* Protected Agent Routes */}
        <Route
          path="/queue"
          element={
            <ProtectedRoute requiredRole="agent">
              <Queue />
            </ProtectedRoute>
          }
        />

        {/* Protected Settings Route */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App 