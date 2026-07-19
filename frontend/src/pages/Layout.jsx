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
    { name: 'Dashboard', path: '/', icon: <FolderOpen size={20} /> },
    { name: 'My Projects', path: '/my-projects', icon: <ListDashes size={20} /> },
    { name: 'Profile', path: '/profile', icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200">
      <aside className="w-64 border-r border-zinc-200 bg-white p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white">
              <FolderOpen weight="bold" />
            </div>
            <span className="text-lg font-medium tracking-tight">CoBuild</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
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
            className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-3 py-2 mb-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            <Plus weight="bold" />
            New Project
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <SignOut size={20} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
