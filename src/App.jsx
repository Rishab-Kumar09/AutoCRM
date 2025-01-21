import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CompanyRegister from './pages/auth/CompanyRegister';

// Layout
import Layout from './components/Layout';

// Public Pages
import Home from './pages/public/Home';
import Companies from './pages/public/Companies';
import CompanySupport from './pages/public/CompanySupport';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import SubmitTicket from './pages/customer/SubmitTicket';
import ViewTickets from './pages/customer/ViewTickets';

// Agent Pages
import AgentDashboard from './pages/agent/Dashboard';
import TicketQueue from './pages/agent/TicketQueue';
import TicketDetails from './pages/agent/TicketDetails';

// Company Admin Pages
import CompanyDashboard from './pages/company/Dashboard';
import AgentManagement from './pages/company/AgentManagement';
import CompanySettings from './pages/company/Settings';

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/support/:companyId" element={<CompanySupport />} />
            
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/company/register" element={<CompanyRegister />} />
            
            {/* Customer Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="customer">
                  <Layout>
                    <CustomerDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit-ticket"
              element={
                <ProtectedRoute requiredRole="customer">
                  <Layout>
                    <SubmitTicket />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedRoute requiredRole="customer">
                  <Layout>
                    <ViewTickets />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Agent Routes */}
            <Route
              path="/agent/dashboard"
              element={
                <ProtectedRoute requiredRole="agent">
                  <Layout>
                    <AgentDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/queue"
              element={
                <ProtectedRoute requiredRole="agent">
                  <Layout>
                    <TicketQueue />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/ticket/:ticketId"
              element={
                <ProtectedRoute requiredRole="agent">
                  <Layout>
                    <TicketDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Company Admin Routes */}
            <Route
              path="/company/dashboard"
              element={
                <ProtectedRoute requiredRole="company_admin">
                  <Layout>
                    <CompanyDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/agents"
              element={
                <ProtectedRoute requiredRole="company_admin">
                  <Layout>
                    <AgentManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/settings"
              element={
                <ProtectedRoute requiredRole="company_admin">
                  <Layout>
                    <CompanySettings />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App; 