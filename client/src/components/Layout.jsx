import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;