import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo-asamblea.webp';

const NAV_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Blog', to: '/blog' },
  { label: 'Predicaciones', to: '/predicaciones' },
  { label: 'IBAA', to: '/ibaa' },
  { label: 'Tienda', to: '/tienda' },
  { label: 'Calendario', to: '/calendario' },
  { label: 'Contacto', to: '/#contacto' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#dde3ef] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-[70px] gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-15 flex items-center justify-center">
            <img src={logo} alt="Logo" className='w-10 h-10'/>
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-800 text-navy tracking-wide uppercase">Asamblea Apostólica</div>
            <div className="text-[10px] font-500 text-muted tracking-widest uppercase">en Argentina</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-md text-[13.5px] font-500 transition-colors ${
                isActive(link.to)
                  ? 'text-brand font-600'
                  : 'text-text hover:text-navy hover:bg-surface'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-3">
          <button className="hidden sm:flex items-center text-muted hover:text-navy transition-colors" aria-label="Buscar">
            <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M12.5 12.5L17 17" strokeLinecap="round" />
            </svg>
          </button>
          <Link
            to="/#donar"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-brand text-white text-[13px] font-600 hover:bg-brand-dark transition-colors"
          >
            Donar
          </Link>
          <button
            className="lg:hidden flex flex-col gap-1.5 p-1.5 rounded"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            <span className={`block w-5 h-0.5 bg-navy transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-navy transition-all ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-navy transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-white px-4 pb-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block py-2.5 text-[14px] font-500 border-b border-border last:border-0 ${
                isActive(link.to) ? 'text-brand' : 'text-text'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/#donar"
            onClick={() => setOpen(false)}
            className="mt-3 flex justify-center items-center py-2 rounded-full bg-brand text-white text-[14px] font-600"
          >
            Donar
          </Link>
        </div>
      )}
    </header>
  );
}
