import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FolderOpen, UserCircle, SignOut, Plus, ListDashes } from '@phosphor-icons/react';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="flex min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-green-500/30 selection:text-green-200">
      <aside className="w-72 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
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

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-10 lg:p-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
