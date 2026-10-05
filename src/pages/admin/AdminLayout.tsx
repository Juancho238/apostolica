import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/AuthContext';

const NAV_ITEMS = [
  { icon: '⊞', label: 'Dashboard', to: '/admin/dashboard' },
  { icon: '📅', label: 'Calendario', to: '/admin/calendario' },
  { icon: '🛍️', label: 'Tienda', to: '/admin/tienda' },
  { icon: '📝', label: 'Artículos', to: '/admin/articulos' },
  { icon: '🎤', label: 'Predicaciones', to: '/admin/predicaciones' },
  { icon: '📁', label: 'Recursos', to: '/admin/recursos' },
  { icon: '⛪', label: 'Iglesias', to: '/admin/iglesias' },
  { icon: '📜', label: 'IBAA Egresados', to: '/admin/ibaa-egresados' },
  { icon: '🎓', label: 'IBAA Usuarios', to: '/admin/ibaa-usuarios' },
  { icon: '📚', label: 'IBAA Contenido', to: '/admin/ibaa-contenido' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const isActive = (to: string) => location.pathname.startsWith(to);

  return (
    <div className="min-h-screen flex bg-[#f0f2f7]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-navy-dark flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none">
              <path d="M20 6 C14 6 10 12 10 18 C10 24 14 28 20 34 C26 28 30 24 30 18 C30 12 26 6 20 6Z" fill="#f97316" />
            </svg>
          </div>
          <div>
            <p className="text-white text-[12px] font-700 uppercase tracking-wide">Admin Panel</p>
            <p className="text-white/40 text-[10px]">AAArgentina</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-500 transition-all ${
                isActive(item.to)
                  ? 'bg-brand text-white font-600'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <span>🌐</span>
            Ver sitio público
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] text-white/50 hover:text-red-400 hover:bg-red-900/20 transition-all"
          >
            <span>→</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-border px-4 sm:px-6 h-14 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface text-text"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-[14px] font-600 text-navy capitalize">
              {NAV_ITEMS.find((n) => isActive(n.to))?.label ?? 'Panel'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-[12px] font-700">A</div>
            <div className="hidden sm:block">
              <p className="text-[12px] font-600 text-navy">Administrador</p>
              <p className="text-[10px] text-muted">{session?.user.email}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
