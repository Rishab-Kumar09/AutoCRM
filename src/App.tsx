import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CreateTicket from "./pages/tickets/CreateTicket";
import Tickets from "./pages/tickets/Tickets";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<Layout><Index /></Layout>} />
        <Route path="/tickets" element={<Layout><Tickets /></Layout>} />
        <Route path="/tickets/create" element={<Layout><CreateTicket /></Layout>} />
        <Route path="/customers" element={<Layout><Customers /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />

        {/* Redirect to login if no match */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;