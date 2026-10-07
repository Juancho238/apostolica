import Reveal from '../components/Reveal';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { RESOURCES } from '../data/content';
import { usePublicContent } from '../hooks/usePublicContent';

const TIPO_ICONS: Record<string, string> = {
  'Bosquejo': '📄',
  'Devocional': '🕯',
  'Guía de Célula': '👥',
  'Estudio Bíblico': '📖',
  'Multimedia': '🎞',
};

const TIPO_BG: Record<string, string> = {
  'Bosquejo': 'bg-blue-50',
  'Devocional': 'bg-purple-50',
  'Guía de Célula': 'bg-green-50',
  'Estudio Bíblico': 'bg-orange-50',
  'Multimedia': 'bg-pink-50',
};

export default function RecursoDetail() {
  const { id } = useParams<{ id: string }>();
  const resources = usePublicContent('resources', RESOURCES);
  const recurso = resources.find((r) => r.id === id);

  if (!recurso) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-navy text-xl font-700">Recurso no encontrado.</p>
          <Link to="/recursos" className="text-brand font-600 hover:underline">← Volver a recursos</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const hasMaterial = recurso.downloadUrl && recurso.downloadUrl !== '#' && recurso.downloadUrl.trim() !== '';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <Reveal className="relative min-h-[260px] flex items-end bg-navy-dark overflow-hidden">
        {recurso.image ? (
          <img
            src={recurso.image}
            alt={recurso.title}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/65 to-navy-dark/30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-10 pt-20 w-full">
          <Link to="/recursos" className="inline-flex items-center gap-1.5 text-white/50 text-[12px] font-600 hover:text-white transition-colors mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Recursos
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{TIPO_ICONS[recurso.type]}</span>
            <span className="px-3 py-1 rounded-full bg-brand/30 border border-brand/50 text-brand text-[11px] font-700 uppercase tracking-widest">
              {recurso.type}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-800 text-white leading-tight">{recurso.title}</h1>
        </div>
      </Reveal>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Main */}
          <div className="lg:col-span-2">
            <p className="text-[15px] text-gray-600 leading-relaxed mb-6">{recurso.description}</p>

            {recurso.content?.trim() && (
              <>
                <h2 className="text-lg font-800 text-navy mb-3 border-l-4 border-brand pl-4">Contenido</h2>
                <div className="bg-surface rounded-xl p-6 text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {recurso.content}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Tipo card */}
            <div className={`rounded-2xl p-6 flex flex-col items-center text-center gap-2 ${TIPO_BG[recurso.type] ?? 'bg-surface'}`}>
              <span className="text-4xl">{TIPO_ICONS[recurso.type]}</span>
              <p className="font-700 text-navy text-[15px]">{recurso.type}</p>
            </div>

            {/* Abrir material */}
            {hasMaterial && (
              <a
                href={recurso.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand text-white font-600 text-[14px] hover:bg-brand-dark transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Abrir material
              </a>
            )}

            <Link
              to="/recursos"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-navy font-600 text-[13px] hover:bg-surface transition-colors"
            >
              ← Ver más recursos
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
