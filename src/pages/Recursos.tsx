import Reveal from '../components/Reveal';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { RESOURCES, type Resource } from '../data/content';
import { usePublicContent } from '../hooks/usePublicContent';

const TIPOS: Resource['type'][] = ['Bosquejo', 'Devocional', 'Guía de Célula', 'Estudio Bíblico', 'Multimedia'];

const TIPO_ICONS: Record<string, string> = {
  'Bosquejo': '📄',
  'Devocional': '🕯',
  'Guía de Célula': '👥',
  'Estudio Bíblico': '📖',
  'Multimedia': '🎞',
};

const TIPO_COLORS: Record<string, string> = {
  'Bosquejo': 'bg-blue-50 text-blue-700 border-blue-100',
  'Devocional': 'bg-purple-50 text-purple-700 border-purple-100',
  'Guía de Célula': 'bg-green-50 text-green-700 border-green-100',
  'Estudio Bíblico': 'bg-orange-50 text-orange-700 border-orange-100',
  'Multimedia': 'bg-pink-50 text-pink-700 border-pink-100',
};

// Mapa del parámetro URL al tipo real
const PARAM_TO_TIPO: Record<string, Resource['type']> = {
  'Bosquejos': 'Bosquejo',
  'Devocionales': 'Devocional',
  'Guías de Células': 'Guía de Célula',
  'Estudios Bíblicos': 'Estudio Bíblico',
  'Multimedia': 'Multimedia',
};

export default function Recursos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tipoParam = searchParams.get('tipo');
  const activeTipo: Resource['type'] | 'Todos' = tipoParam && PARAM_TO_TIPO[tipoParam]
    ? PARAM_TO_TIPO[tipoParam]
    : 'Todos';

  const [search, setSearch] = useState('');
  const resources = usePublicContent('resources', RESOURCES);

  const filtered = resources.filter((r) => {
    const matchTipo = activeTipo === 'Todos' || r.type === activeTipo;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchTipo && matchSearch;
  });

  function setFiltro(tipo: Resource['type'] | 'Todos') {
    if (tipo === 'Todos') {
      setSearchParams({});
    } else {
      const param = Object.entries(PARAM_TO_TIPO).find(([, v]) => v === tipo)?.[0] ?? tipo;
      setSearchParams({ tipo: param });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <Reveal className="relative min-h-[220px] flex items-end bg-navy-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 to-navy-dark/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-8 pt-16 w-full">
          <Link to="/predicaciones" className="inline-flex items-center gap-1.5 text-white/50 text-[12px] font-600 hover:text-white transition-colors mb-3">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Predicaciones y Recursos
          </Link>
          <h1 className="text-3xl sm:text-4xl font-800 text-white mb-1">Recursos</h1>
          <p className="text-white/60 text-[14px]">Material bíblico para crecer, servir y enseñar.</p>
        </div>
      </Reveal>

      {/* Filter bar */}
      <Reveal className="bg-white border-b border-border sticky top-[70px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            <button
              onClick={() => setFiltro('Todos')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-500 whitespace-nowrap transition-all ${
                activeTipo === 'Todos' ? 'bg-navy text-white font-600' : 'text-text hover:bg-surface'
              }`}
            >
              Todos
            </button>
            {TIPOS.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-500 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTipo === tipo ? 'bg-navy text-white font-600' : 'text-text hover:bg-surface'
                }`}
              >
                <span>{TIPO_ICONS[tipo]}</span>
                {tipo}s
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 min-w-[180px] shrink-0">
              <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="text-[12px] outline-none w-full bg-transparent"
              />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted">
            {activeTipo !== 'Todos'
              ? `Todavía no hay recursos en esta categoría.`
              : 'No se encontraron recursos.'}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => (
              <Link
                key={r.id}
                to={`/recursos/${r.id}`}
                className="group bg-white rounded-xl border border-border overflow-hidden motion-card hover:shadow-md transition-all flex flex-col"
              >
                {r.image ? (
                  <div className="h-40 overflow-hidden bg-surface">
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                ) : (
                  <div className={`h-28 flex items-center justify-center text-5xl ${TIPO_COLORS[r.type]?.split(' ')[0] ?? 'bg-surface'}`}>
                    {TIPO_ICONS[r.type]}
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <span className={`self-start px-2.5 py-0.5 rounded-full text-[11px] font-700 border mb-2 ${TIPO_COLORS[r.type] ?? 'bg-surface text-muted border-border'}`}>
                    {r.type}
                  </span>
                  <h3 className="font-700 text-navy text-[15px] leading-snug mb-1.5 group-hover:text-brand transition-colors">
                    {r.title}
                  </h3>
                  <p className="text-muted text-[13px] leading-relaxed line-clamp-2 flex-1">{r.description}</p>
                  <span className="text-brand text-[12px] font-600 mt-3 inline-block">Ver recurso →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
