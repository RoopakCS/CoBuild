import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { List, X } from '@phosphor-icons/react';

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Discover', path: '/discover' },
    { name: 'Hackathons', path: '/hackathons' },
    { name: 'My Projects', path: '/my-projects' },
    { name: 'Profile', path: '/profile' },
  ];



  return (
    <div className="flex flex-col min-h-screen bg-background text-primary font-sans">
      {/* Top Navbar */}
      <header className="bg-surface border-b border-border-subtle sticky top-0 z-50">
        <nav className="flex justify-between items-center w-full px-4 sm:px-6 max-w-[1200px] mx-auto h-16">
          
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary tracking-[-0.02em]">CoBuild</span>
            </Link>
            
            <div className="hidden md:flex gap-6 items-center">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`button-text transition-colors pb-1 border-b-2 ${
                      isActive
                        ? 'text-primary border-primary'
                        : 'text-text-muted hover:text-primary border-transparent'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            <Link
              to="/projects/new"
              className="btn-primary hidden sm:flex items-center justify-center px-4 py-2"
            >
              Create Project
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-md border border-border-subtle bg-surface-dim text-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex pt-16">
          <div
            className="fixed inset-0 bg-primary/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-50 w-full max-w-sm bg-surface border-r border-border-subtle p-6 flex flex-col h-full shadow-lg">
            

            <nav className="space-y-2 mb-8 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 body-md font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-surface-dim text-primary border border-border-subtle'
                      : 'text-text-muted hover:bg-surface-dim hover:text-primary border border-transparent'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="pt-6 border-t border-border-subtle">
              <Link
                to="/projects/new"
                className="btn-primary w-full flex items-center justify-center py-3"
              >
                Create Project
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-8 pt-8">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 w-full">
          <Outlet />
        </div>
      </main>


    </div>
  );
}
