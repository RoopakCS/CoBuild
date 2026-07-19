import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FolderOpen, UserCircle, SignOut, Plus, ListDashes, List, X } from '@phosphor-icons/react';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FolderOpen size={24} weight="duotone" /> },
    { name: 'My Projects', path: '/my-projects', icon: <ListDashes size={24} weight="duotone" /> },
    { name: 'Profile', path: '/profile', icon: <UserCircle size={24} weight="duotone" /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-green-500/30 selection:text-green-200">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500 text-slate-900 shadow-md shadow-green-500/20">
            <FolderOpen size={20} weight="bold" />
          </div>
          <span className="text-xl font-bold tracking-tighter">CoBuild</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/projects/new"
            className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold text-slate-900 transition-all hover:bg-green-400"
          >
            <Plus weight="bold" size={16} />
            New
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-4/5 max-w-xs border-r border-slate-800 bg-slate-900 p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500 text-slate-900 shadow-lg shadow-green-500/20">
                    <FolderOpen size={20} weight="bold" />
                  </div>
                  <span className="text-xl font-bold tracking-tighter">CoBuild</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'bg-slate-800 text-green-400 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-800">
              <Link
                to="/projects/new"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-green-400"
              >
                <Plus weight="bold" size={20} />
                New Project
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800/50 hover:text-slate-100"
              >
                <SignOut size={20} weight="duotone" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 lg:p-8 flex-col justify-between min-h-screen sticky top-0 h-screen">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-slate-900 shadow-lg shadow-green-500/20">
              <FolderOpen size={24} weight="bold" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">CoBuild</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-slate-800 text-green-400 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <Link
            to="/projects/new"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 mb-4 text-sm font-bold text-slate-900 transition-all hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5"
          >
            <Plus weight="bold" size={20} />
            New Project
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800/50 hover:text-slate-100"
          >
            <SignOut size={20} weight="duotone" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-6xl p-4 sm:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-800 bg-slate-900/95 px-2 py-2 backdrop-blur-xl">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              location.pathname === item.path
                ? 'text-green-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

