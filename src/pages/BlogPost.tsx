import Reveal from '../components/Reveal';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ARTICLES } from '../data/content';
import { usePublicContent } from '../hooks/usePublicContent';

export default function BlogPost() {
  const { slug } = useParams();
  const articles = usePublicContent('articles', ARTICLES);
  const article = articles.find((a) => a.slug === slug);
  const related = articles.filter((a) => a.id !== article?.id).slice(0, 3);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl mb-4">📄</p>
            <h1 className="text-2xl font-700 text-navy mb-2">Artículo no encontrado</h1>
            <Link to="/blog" className="text-brand hover:underline">← Volver al blog</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const others = articles.filter((a) => a.id !== article.id).slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <Reveal className="relative min-h-[260px] flex items-end bg-navy-dark overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/70 to-navy-dark/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-10 pt-20">
          <nav className="flex items-center gap-2 text-white/50 text-[12px] mb-4">
            <Link to="/" className="hover:text-white/80">Inicio</Link>
            <span>›</span>
            <Link to="/blog" className="hover:text-white/80">Blog</Link>
            <span>›</span>
            <span className="text-white/75">{article.category}</span>
          </nav>
          <span className="inline-block px-2.5 py-1 bg-brand text-white text-[10px] font-700 uppercase tracking-widest rounded-md mb-3">
            {article.category}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-800 text-white leading-tight mb-3 max-w-3xl">
            {article.title}
          </h1>
          <p className="text-white/65 text-[15px] mb-5 max-w-2xl">{article.excerpt}</p>
          <div className="flex flex-wrap items-center gap-5 text-white/50 text-[12px]">
            <span className="flex items-center gap-1.5">📅 {article.date}</span>
            <span className="flex items-center gap-1.5">👤 Por {article.author}</span>
            <span className="flex items-center gap-1.5">⏱ {article.readTime} min de lectura</span>
          </div>
        </div>
      </Reveal>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-3 gap-10 w-full">
        {/* Main article */}
        <article className="lg:col-span-2">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-72 object-cover rounded-xl mb-8 bg-surface"
          />
          <div className="prose max-w-none">
            {article.content.split('\n\n').map((para, i) => {
              if (para.startsWith('"')) {
                return (
                  <blockquote key={i} className="border-l-4 border-brand bg-surface rounded-r-xl pl-6 pr-5 py-5 my-6">
                    <span className="text-xl mb-2 block">📖</span>
                    <p className="text-navy font-600 text-[15px] italic leading-relaxed">{para}</p>
                  </blockquote>
                );
              }
              return (
                <p key={i} className="text-text leading-relaxed text-[15px] mb-5">{para}</p>
              );
            })}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
            <span className="text-muted text-[12px] font-600 mr-1">Temas:</span>
            {article.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-surface rounded-full text-[12px] text-text border border-border">{tag}</span>
            ))}
          </div>

          {/* Share */}
          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border">
            <span className="text-muted text-[13px] font-600">Compartir artículo:</span>
            {['Facebook', 'X', 'WhatsApp', 'Telegram'].map((s) => (
              <button key={s} className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-[11px] font-700 text-navy hover:bg-navy hover:text-white transition-colors">
                {s[0]}
              </button>
            ))}
          </div>

          {/* Author */}
          <div className="mt-8 p-5 rounded-xl bg-surface border border-border flex gap-4 items-start">
            <div className="w-14 h-14 rounded-full bg-navy/20 flex items-center justify-center text-2xl shrink-0">👤</div>
            <div className="flex-1">
              <h4 className="font-700 text-navy text-[15px]">{article.author}</h4>
              <p className="text-muted text-[12px] mt-1 leading-relaxed">{article.authorBio}</p>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Categories */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="font-700 text-navy text-[14px] mb-4">Explorar artículos</h3>
            {['Todos', 'Enseñanzas', 'Devocionales', 'Vida Cristiana', 'Iglesia', 'Familia', 'Liderazgo'].map((cat) => (
              <Link
                key={cat}
                to={`/blog`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors mb-1 ${
                  cat === article.category ? 'bg-navy text-white font-600' : 'text-text hover:bg-surface'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* Recent */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="font-700 text-navy text-[14px] mb-4">Artículos recientes</h3>
            <div className="space-y-3">
              {others.map((a) => (
                <Link key={a.id} to={`/blog/${a.slug}`} className="flex gap-3 group">
                  <img src={a.image} alt={a.title} className="w-14 h-14 rounded-lg object-cover bg-surface shrink-0" />
                  <div>
                    <p className="text-[13px] font-600 text-navy leading-snug group-hover:text-brand transition-colors line-clamp-2">{a.title}</p>
                    <p className="text-muted text-[11px] mt-1">{a.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Verse */}
          <div className="bg-navy rounded-xl p-5 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
            <h3 className="font-700 text-white text-[13px] mb-3">Versículo destacado</h3>
            <p className="text-white/75 text-[13px] italic leading-relaxed mb-2">
              "Encomienda a Jehová tus obras, y tus pensamientos serán afirmados."
            </p>
            <p className="text-brand text-[12px] font-700">Proverbios 16:3</p>
            <img
              src="https://images.unsplash.com/photo-1497621122273-f5cfb6065c56?w=300&h=150&fit=crop&auto=format"
              alt="Biblia"
              className="w-full h-24 object-cover rounded-lg mt-4 opacity-60"
            />
          </div>
        </aside>
      </div>

      {/* Related */}
      <Reveal className="bg-white border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-800 text-navy">Artículos relacionados</h2>
            <Link to="/blog" className="text-brand text-[13px] font-600 hover:underline">Ver todos los artículos →</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {related.map((a) => (
              <Link key={a.id} to={`/blog/${a.slug}`} className="group">
                <div className="relative h-40 rounded-xl overflow-hidden mb-3 bg-surface">
                  <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <span className="text-[10px] font-700 uppercase tracking-widest text-brand">{a.category}</span>
                <h3 className="font-700 text-navy text-[14px] leading-snug mt-1 group-hover:text-brand transition-colors">{a.title}</h3>
                <p className="text-muted text-[12px] mt-1 line-clamp-2">{a.excerpt}</p>
                <span className="text-brand text-[12px] font-600 mt-2 inline-block">Leer más →</span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

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
