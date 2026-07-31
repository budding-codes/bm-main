import { NavLink, Outlet } from 'react-router-dom';
import { FileText, Images, LogOut, Newspaper, Users } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';

const navItems = [
  { to: '/admin/leads', label: 'Leads', icon: Users },
  { to: '/admin/blogs', label: 'Blogs', icon: Newspaper },
  { to: '/admin/media', label: 'Media', icon: Images }
];

export default function AdminLayout() {
  const { email, logout } = useAdminAuth();

  return (
    <div className="flex min-h-screen bg-black text-white">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#0d0d0d] md:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-2 text-yellow-400">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-[0.22em]">BM CMS</span>
          </div>
          <p className="mt-2 truncate text-xs text-white/40">{email || 'Admin'}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-yellow-400 text-black'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:hidden">
          <div>
            <p className="text-sm font-bold text-yellow-400">BM CMS</p>
            <p className="text-xs text-white/40">{email || 'Admin'}</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-yellow-400"
          >
            Logout
          </button>
        </header>

        <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-4 py-3 md:hidden">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
