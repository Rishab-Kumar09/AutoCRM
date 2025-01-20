import { Home, Ticket, Users, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h1>AutoCRM</h1>
        <nav>
          <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'sidebar-link-active' : ''}`}>
            <Home /> Dashboard
          </Link>
          <Link to="/tickets" className={`sidebar-link ${location.pathname === '/tickets' ? 'sidebar-link-active' : ''}`}>
            <Ticket /> Tickets
          </Link>
          <Link to="/customers" className={`sidebar-link ${location.pathname === '/customers' ? 'sidebar-link-active' : ''}`}>
            <Users /> Customers
          </Link>
          <Link to="/settings" className={`sidebar-link ${location.pathname === '/settings' ? 'sidebar-link-active' : ''}`}>
            <Settings /> Settings
          </Link>
        </nav>
      </aside>
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;