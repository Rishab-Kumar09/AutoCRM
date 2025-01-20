import { Home, Inbox, Settings, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Inbox, label: "Tickets", path: "/tickets" },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="sidebar">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">AutoCRM</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${
                location.pathname === item.path ? "sidebar-link-active" : ""
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;