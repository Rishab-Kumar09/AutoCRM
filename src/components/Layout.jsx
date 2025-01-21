import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;