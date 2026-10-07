import Reveal from '../components/Reveal';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ARTICLES, CATEGORIES } from '../data/content';
import { usePublicContent } from '../hooks/usePublicContent';

const CATEGORY_ICONS: Record<string, string> = {
  Todos: '⊞',
  Enseñanzas: '📚',
  Devocionales: '🕯',
  'Vida Cristiana': '👤',
  Iglesia: '⛪',
  Familia: '🏠',
  Liderazgo: '📊',
  'Estudios Bíblicos': '📖',
};

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const articles = usePublicContent('articles', ARTICLES);

  const filtered = activeCategory === 'Todos'
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <Reveal className="relative min-h-[280px] flex items-center bg-navy-dark overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1593485589800-579b43749b15?w=1600&h=500&fit=crop&auto=format"
          alt="Biblia abierta"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 to-navy-dark/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="border-l-4 border-brand pl-5 mb-4">
            <h1 className="text-4xl sm:text-5xl font-800 text-white">Blog</h1>
            <p className="text-white/75 text-lg mt-2 max-w-xl leading-relaxed">
              Enseñanzas, reflexiones y recursos para una vida que transforma.
            </p>
          </div>
          <p className="text-white/45 text-[12px] font-600 uppercase tracking-widest mt-4">
            SABER &nbsp;|&nbsp; CRECER &nbsp;|&nbsp; SERVIR &nbsp;|&nbsp; TRANSFORMAR
          </p>
        </div>
      </Reveal>

      {/* Category tabs */}
      <Reveal className="bg-white border-b border-border sticky top-[70px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-500 whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-navy text-white font-600'
                    : 'text-text hover:bg-surface'
                }`}
              >
                <span className="text-[11px]">{CATEGORY_ICONS[cat]}</span>
                {cat}
              </button>
            ))}
            <button className="ml-auto p-2 text-muted hover:text-navy">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </Reveal>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Featured */}
        {featured && (
          <Link to={`/blog/${featured.slug}`} className="group grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow mb-12 bg-white">
            <div className="relative h-64 lg:h-auto bg-surface overflow-hidden">
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 bg-navy/80 text-white text-[10px] font-700 uppercase tracking-wide rounded-md flex items-center gap-1">
                  ⊞ Artículo Destacado
                </span>
              </div>
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <span className="text-[11px] font-700 uppercase tracking-widest text-brand mb-3">{featured.category}</span>
              <h2 className="text-2xl sm:text-3xl font-800 text-navy leading-snug mb-4 group-hover:text-brand transition-colors">{featured.title}</h2>
              <p className="text-muted leading-relaxed mb-6 text-[14px]">{featured.excerpt}</p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-full text-[13px] font-600 w-fit">
                Leer artículo →
              </span>
            </div>
          </Link>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-800 text-navy">Últimos artículos</h2>
              <span className="text-muted text-[13px]">{filtered.length} artículos</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {rest.map((article) => (
                <Link key={article.id} to={`/blog/${article.slug}`} className="group bg-white rounded-xl border border-border overflow-hidden motion-card hover:shadow-md transition-all">
                  <div className="relative h-44 bg-surface overflow-hidden">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-700 uppercase tracking-widest text-brand">{article.category}</span>
                      <span className="text-muted text-[11px]">{article.date}</span>
                    </div>
                    <h3 className="font-700 text-navy text-[15px] leading-snug mb-2 group-hover:text-brand transition-colors">{article.title}</h3>
                    <p className="text-muted text-[12px] leading-relaxed line-clamp-2">{article.excerpt}</p>
                    <span className="text-brand text-[12px] font-600 mt-3 inline-block">Leer más →</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted">No hay artículos en esta categoría aún.</div>
        )}
      </div>

      {/* Newsletter */}
      <Reveal className="py-12 bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
            <span className="text-2xl">✉️</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[11px] font-700 uppercase tracking-widest text-brand mb-0.5">Suscribite al blog</p>
            <h3 className="text-xl font-800 text-navy">Recibí nuevos artículos en tu correo</h3>
            <p className="text-muted text-[13px] mt-0.5">Sumate y recibí enseñanzas, devocionales y recursos directamente en tu email.</p>
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
