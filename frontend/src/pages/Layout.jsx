import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FolderOpen, UserCircle, SignOut, Plus, ListDashes, List, X, MagnifyingGlass, Bell } from '@phosphor-icons/react';

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
    { name: 'Dashboard', path: '/', icon: <FolderOpen size={18} weight="duotone" /> },
    { name: 'My Projects', path: '/my-projects', icon: <ListDashes size={18} weight="duotone" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-green-500/30 selection:text-green-200">
      {/* Modern Top Navbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 backdrop-blur-xl">
        
        {/* Left: Logo */}
        <div className="flex w-1/4 items-center">
          <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-105">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-500 text-slate-900 shadow-md shadow-green-500/20">
              <FolderOpen size={18} weight="bold" />
            </div>
            <span className="hidden sm:block text-xl font-bold tracking-tighter">CoBuild</span>
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
                className={`flex items-center gap-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'text-green-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex w-auto md:w-1/4 items-center justify-end gap-5">
          {/* Desktop Actions */}
          <Link
            to="/projects/new"
            className="hidden md:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Create Project
          </Link>

          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <button className="hover:text-slate-200 transition-colors">
              <MagnifyingGlass size={20} weight="bold" />
            </button>
            <button className="hover:text-slate-200 transition-colors">
              <Bell size={20} weight="bold" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4 border-l border-slate-800 pl-4">
            <Link
              to="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
              title="Profile"
            >
              <UserCircle size={20} weight="fill" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <SignOut size={20} weight="duotone" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex mt-[60px] sm:mt-[68px]">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-full max-w-sm border-b border-slate-800 bg-slate-900 p-4 flex flex-col shadow-2xl h-auto self-start rounded-b-2xl">
            <nav className="space-y-2 mb-6">
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
              <Link
                to="/profile"
                className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  location.pathname === '/profile'
                    ? 'bg-slate-800 text-green-400 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                <UserCircle size={20} weight="duotone" />
                Profile
              </Link>
            </nav>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <Link
                to="/projects/new"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-green-400"
              >
                <Plus weight="bold" size={20} />
                Create Project
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800/50 hover:text-red-400"
              >
                <SignOut size={20} weight="duotone" />
                Sign out
              </button>
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

