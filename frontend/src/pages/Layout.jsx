import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FolderOpen, UserCircle, SignOut, Plus, ListDashes, List, X, MagnifyingGlass, Bell, Sun, Moon } from '@phosphor-icons/react';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);



  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FolderOpen size={18} weight="duotone" /> },
    { name: 'My Projects', path: '/my-projects', icon: <ListDashes size={18} weight="duotone" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-green-500/30 selection:text-green-200">
      {/* Floating Glossy Top Navbar Container */}
      <div className="sticky top-4 sm:top-6 z-40 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <header className="flex items-center justify-between rounded-2xl border border-slate-700/30 bg-slate-800/40 px-4 sm:px-6 py-3 shadow-sm shadow-slate-900/10 backdrop-blur-xl">
          
          {/* Left: Logo */}
          <div className="flex w-1/4 items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold tracking-tighter text-slate-50">CoBuild</span>
            </Link>
          </div>

        {/* Middle: Centered Nav Links (Desktop) */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center text-sm font-medium transition-all ${
                  isActive
                    ? 'text-green-400 drop-shadow-[0_0_8px_rgba(25,245,140,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex w-auto md:w-1/4 items-center justify-end gap-5">
          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <button 
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="hover:text-slate-200 transition-colors" 
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} weight="bold" /> : <Moon size={20} weight="bold" />}
            </button>

            <button className="hover:text-slate-200 transition-colors" title="Notifications">
              <Bell size={20} weight="bold" />
            </button>
            <Link to="/projects/new" className="hover:text-slate-200 transition-colors" title="Create Project">
              <Plus size={20} weight="bold" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4 border-l border-slate-700/50 pl-4">
            <Link
              to="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors border border-green-500/30"
              title="Profile"
            >
              <UserCircle size={20} weight="fill" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-800/50 text-slate-200 focus:outline-none backdrop-blur-md"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </header>
    </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex pt-[88px] px-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-full max-w-sm border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl p-4 flex flex-col shadow-2xl h-auto self-start rounded-2xl mx-auto">
            <nav className="space-y-2 mb-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    location.pathname === item.path
                      ? 'bg-slate-700/50 text-green-400 shadow-sm border border-slate-600/50'
                      : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-100'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <Link
                to="/profile"
                className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  location.pathname === '/profile'
                    ? 'bg-slate-700/50 text-green-400 shadow-sm border border-slate-600/50'
                    : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-100'
                }`}
              >
                <UserCircle size={20} weight="duotone" />
                Profile
              </Link>
              <button
                onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-slate-700/30 hover:text-slate-100"
              >
                {theme === 'dark' ? <Sun size={20} weight="duotone" /> : <Moon size={20} weight="duotone" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </nav>

            <div className="space-y-3 pt-4 border-t border-slate-700/50">
              <Link
                to="/projects/new"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-green-400 shadow-[0_0_15px_rgba(25,245,140,0.3)]"
              >
                <Plus weight="bold" size={20} />
                Create Project
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-8 pt-6 sm:pt-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

