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
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Floating Glossy Top Navbar Container */}
      <div className="sticky top-3 sm:top-5 z-40 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
        <header className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-xl transition-all duration-300">
          
          {/* Left: Logo */}
          <div className="flex w-1/4 items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-extrabold tracking-tight text-slate-100 font-display">
                CoBuild
              </span>
            </Link>
          </div>

        {/* Middle: Centered Nav Links (Desktop) */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 border ${
                  isActive
                    ? 'bg-slate-800 text-brand-text border-brand-border/60 shadow-none'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex w-auto md:w-1/4 items-center justify-end gap-3">
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <button 
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all duration-200 hover:scale-105 active:scale-95" 
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={19} weight="bold" /> : <Moon size={19} weight="bold" />}
            </button>

            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all duration-200 hover:scale-105 active:scale-95" title="Notifications">
              <Bell size={19} weight="bold" />
            </button>
            
            <Link 
              to="/projects/new" 
              className="flex h-9 items-center gap-1.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all duration-300 shadow-none active:scale-95"
              title="Create Project"
            >
              <Plus size={16} weight="bold" />
              <span>Create</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3 border-l border-slate-800 pl-3">
            <Link
              to="/profile"
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 border hover:scale-105 shadow-none ${
                location.pathname.startsWith('/profile')
                  ? 'bg-slate-800 text-brand-text border-brand-border/60'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              title="Profile"
            >
              <UserCircle size={22} weight={location.pathname.startsWith('/profile') ? "fill" : "bold"} />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/60 text-slate-200 focus:outline-none backdrop-blur-md hover:border-brand-border/40 transition-colors"
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
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-bold transition-all border ${
                    location.pathname === item.path
                      ? 'bg-slate-800 text-brand-text border-brand-border/60 shadow-none'
                      : 'border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <Link
                to="/profile"
                className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-bold transition-all border ${
                  location.pathname.startsWith('/profile')
                    ? 'bg-slate-800 text-brand-text border-brand-border/60 shadow-none'
                    : 'border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                }`}
              >
                <UserCircle size={20} weight="duotone" />
                Profile
              </Link>
              <button
                onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800/40 hover:text-slate-100"
              >
                {theme === 'dark' ? <Sun size={20} weight="duotone" /> : <Moon size={20} weight="duotone" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </nav>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <Link
                to="/projects/new"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 text-sm font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95"
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

