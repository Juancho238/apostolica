import Reveal from '../components/Reveal';
import { useParams, Link } from 'react-router-dom';
import type { Sermon } from '../data/content';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SERMONS } from '../data/content';
import { usePublicContent } from '../hooks/usePublicContent';

export default function PredicacionDetail() {
  const { id } = useParams<{ id: string }>();
  const sermons = usePublicContent('sermons', SERMONS);
  const sermon = sermons.find((s) => s.id === id);

  if (!sermon) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-navy text-xl font-700">Predicación no encontrada.</p>
          <Link to="/predicaciones" className="text-brand font-600 hover:underline">← Volver a predicaciones</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <Reveal className="relative min-h-[340px] flex items-end bg-navy-dark overflow-hidden">
        <img
          src={sermon.image}
          alt={sermon.title}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/60 to-navy-dark/25" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-10 pt-24 w-full">
          <Link to="/predicaciones" className="inline-flex items-center gap-1.5 text-white/60 text-[12px] font-600 hover:text-white transition-colors mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Predicaciones y Recursos
          </Link>
          <span className="inline-block px-3 py-1 rounded-full bg-brand/30 border border-brand/50 text-brand text-[11px] font-700 uppercase tracking-widest mb-3">
            {sermon.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-800 text-white leading-tight mb-3">{sermon.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/60 text-[13px]">
            <span className="font-600 text-white/80">{sermon.preacher}</span>
            <span>·</span>
            <span>📅 {sermon.date}</span>
            <span>·</span>
            <span>⏱ {sermon.duration}</span>
            <span>·</span>
            <span>👁 {sermon.views.toLocaleString('es-AR')} vistas</span>
          </div>
        </div>
      </Reveal>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">
        {/* Media player */}
        <MediaPlayer sermon={sermon} />

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-800 text-navy mb-3">Sobre este mensaje</h2>
            <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
              {sermon.content?.trim()
                ? sermon.content
                : `En este poderoso mensaje, ${sermon.preacher} nos comparte una enseñanza profunda directamente de la Palabra de Dios. Un mensaje que te inspirará, desafiará tu fe y te equipará para vivir el evangelio en tu vida diaria.`}
            </div>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-surface border border-border text-navy text-[12px] font-500">{sermon.category}</span>
              <span className="px-3 py-1 rounded-full bg-surface border border-border text-navy text-[12px] font-500">{sermon.preacher}</span>
              <span className="px-3 py-1 rounded-full bg-surface border border-border text-navy text-[12px] font-500">Predicaciones</span>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-navy rounded-2xl p-6 text-white">
              <h3 className="font-800 text-base mb-1">Comparte este mensaje</h3>
              <p className="text-white/60 text-[12px] mb-4 leading-relaxed">Bendice a alguien compartiendo esta predicación.</p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-white/15 text-white text-[12px] font-600 hover:bg-white/25 transition-colors">
                  WhatsApp
                </button>
                <button className="flex-1 py-2 rounded-lg bg-white/15 text-white text-[12px] font-600 hover:bg-white/25 transition-colors">
                  Copiar link
                </button>
              </div>
            </div>

            {/* More sermons */}
            <div>
              <h3 className="font-800 text-navy text-base mb-3">Más mensajes</h3>
              <div className="space-y-3">
                {SERMONS.filter((s) => s.id !== id).slice(0, 3).map((s) => (
                  <Link
                    key={s.id}
                    to={`/predicaciones/${s.id}`}
                    className="flex gap-3 items-start group hover:bg-surface rounded-xl p-2 -mx-2 transition-colors"
                  >
                    <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-surface">
                      <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-navy text-[13px] font-600 leading-snug group-hover:text-brand transition-colors line-clamp-2">{s.title}</p>
                      <p className="text-muted text-[11px] mt-0.5">{s.preacher}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  // Cubre: watch?v=, youtu.be/, shorts/, embed/, music.youtube
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function getEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'audio' | 'external'; src: string } | null {
  if (!url) return null;

  const ytId = extractYouTubeId(url);
  if (ytId) {
    // origin ayuda a evitar Error 153 en dominios con Referer bien definido
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const src = origin
      ? `https://www.youtube.com/embed/${ytId}?origin=${encodeURIComponent(origin)}`
      : `https://www.youtube.com/embed/${ytId}`;
    return { type: 'youtube', src };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: 'vimeo', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };

  if (/\.(mp3|ogg|wav|m4a)(\?|$)/i.test(url)) return { type: 'audio', src: url };

  return { type: 'external', src: url };
}

function MediaPlayer({ sermon }: { sermon: Sermon }) {
  const embed = sermon.mediaUrl ? getEmbedUrl(sermon.mediaUrl) : null;

  if (!embed) {
    return (
      <div className="rounded-2xl overflow-hidden bg-navy-dark aspect-video flex items-center justify-center mb-10 relative">
        <img src={sermon.image} alt={sermon.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <p className="text-white/60 text-[12px]">Próximamente disponible</p>
        </div>
      </div>
    );
  }

  if (embed.type === 'audio') {
    return (
      <div className="rounded-2xl overflow-hidden bg-navy p-6 mb-10 flex items-center gap-5">
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-navy-mid">
          <img src={sermon.image} alt={sermon.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-600 text-[14px] mb-3 truncate">{sermon.title}</p>
          <audio controls src={embed.src} className="w-full h-10 accent-brand" />
        </div>
      </div>
    );
  }

  if (embed.type === 'external') {
    return (
      <div className="rounded-2xl overflow-hidden bg-navy-dark aspect-video flex items-center justify-center mb-10 relative">
        <img src={sermon.image} alt={sermon.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative flex flex-col items-center gap-4">
          <a
            href={embed.src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand text-white text-[14px] font-600 hover:bg-brand-dark transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            Escuchar / Ver mensaje
          </a>
          <p className="text-white/50 text-[11px]">Se abrirá en una nueva pestaña</p>
        </div>
      </div>
    );
  }

  // YouTube or Vimeo iframe
  return (
    <div className="rounded-2xl overflow-hidden aspect-video mb-10 bg-navy-dark">
      <iframe
        src={embed.src}
        title={sermon.title}
        className="w-full h-full"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
