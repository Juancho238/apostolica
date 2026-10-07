import Reveal from '../components/Reveal';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SERMONS, SERMON_CATEGORIES } from '../data/content';
import { usePublicContent } from '../hooks/usePublicContent';

export default function Predicaciones() {
  const [activeCategory, setActiveCategory] = useState('Predicaciones');
  const [search, setSearch] = useState('');
  const sermons = usePublicContent('sermons', SERMONS);

  const filtered = sermons.filter((s) => {
    const matchCat = activeCategory === 'Predicaciones' || s.category === activeCategory;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.preacher.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <Reveal className="relative min-h-[260px] flex items-end bg-navy-dark overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1581548708095-7158f2e63857?w=1600&h=500&fit=crop&auto=format"
          alt="Micrófono"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 to-navy-dark/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-10 pt-20">
          <div className="border-l-4 border-brand pl-5 mb-4">
            <h1 className="text-4xl sm:text-5xl font-800 text-white">Predicaciones y Recursos</h1>
            <p className="text-white/75 text-lg mt-2">Mensajes que inspiran, enseñanzas que transforman.</p>
          </div>
          <p className="text-white/45 text-[12px] font-600 uppercase tracking-widest">
            SABER &nbsp;|&nbsp; CRECER &nbsp;|&nbsp; SERVIR &nbsp;|&nbsp; TRANSFORMAR
          </p>
        </div>
      </Reveal>

      {/* Filter bar */}
      <Reveal className="bg-white border-b border-border sticky top-[70px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {SERMON_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-500 whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-navy text-white font-600'
                    : 'text-text hover:bg-surface'
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 min-w-[200px] shrink-0">
              <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar mensajes..."
                className="text-[12px] outline-none w-full bg-transparent"
              />
            </div>
          </div>
        </div>
      </Reveal>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Latest sermons */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-800 text-navy">Últimas predicaciones</h2>
          <span className="text-muted text-[13px]">{filtered.length} mensajes</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {filtered.map((sermon) => (
            <Link key={sermon.id} to={`/predicaciones/${sermon.id}`} className="bg-white rounded-xl border border-border overflow-hidden motion-card hover:shadow-md transition-all group block">
              <div className="relative h-44 bg-surface overflow-hidden">
                <img
                  src={sermon.image}
                  alt={sermon.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <svg className="w-5 h-5 text-navy ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-white text-[11px] font-600">
                  {sermon.duration}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-700 text-navy text-[14px] leading-snug mb-1 group-hover:text-brand transition-colors">{sermon.title}</h3>
                <p className="text-muted text-[12px]">{sermon.preacher}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
                  <span>📅 {sermon.date}</span>
                  <span>👁 {sermon.views.toLocaleString('es-AR')}</span>
                </div>
                <div className="mt-3 w-full py-2 rounded-lg bg-surface border border-border text-[12px] font-600 text-navy group-hover:bg-navy group-hover:text-white group-hover:border-navy transition-all flex items-center justify-center gap-1.5">
                  Ver ahora →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted">No hay predicaciones en esta categoría.</div>
        )}

        {/* Resources */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-800 text-navy">Recursos para tu vida</h2>
          <Link to="/recursos" className="text-brand text-[13px] font-600 hover:underline">Ver todos los recursos →</Link>
        </div>
        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {[
            { icon: '📄', label: 'Bosquejos', desc: 'Esquemas para predicar y enseñar.' },
            { icon: '📋', label: 'Devocionales', desc: 'Reflexiones diarias para tu crecimiento.' },
            { icon: '👥', label: 'Guías de Células', desc: 'Material para líderes y grupos pequeños.' },
            { icon: '📖', label: 'Estudios Bíblicos', desc: 'Profundizá en la Palabra de manera práctica.' },
            { icon: '▶️', label: 'Multimedia', desc: 'Imágenes, presentaciones y más recursos.' },
          ].map((r) => (
            <Link key={r.label} to={`/recursos?tipo=${encodeURIComponent(r.label)}`} className="bg-white rounded-xl border border-border p-5 text-center flex flex-col items-center gap-2 motion-card hover:shadow-md hover:border-brand/30 transition-all">
              <span className="text-3xl">{r.icon}</span>
              <h4 className="font-700 text-navy text-[13px]">{r.label}</h4>
              <p className="text-muted text-[11px] leading-relaxed">{r.desc}</p>
              <span className="text-brand text-[12px] font-600 mt-auto">Explorar →</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <Reveal className="py-12 bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
            <span className="text-2xl">✉️</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[11px] font-700 uppercase tracking-widest text-brand mb-0.5">Recibí nuevos mensajes y recursos</p>
            <h3 className="text-xl font-800 text-navy">Suscribite y mantenete conectado</h3>
            <p className="text-muted text-[13px] mt-0.5">Recibí las últimas predicaciones, devocionales y recursos en tu correo.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 sm:w-60 px-4 py-2.5 rounded-full border border-border text-[13px] outline-none focus:border-brand"
            />
            <button className="px-5 py-2.5 rounded-full bg-brand text-white text-[13px] font-600 hover:bg-brand-dark transition-colors whitespace-nowrap">
              Suscribirme
            </button>
          </div>
        </div>
      </Reveal>

      <Footer />
    </div>
  );
}
