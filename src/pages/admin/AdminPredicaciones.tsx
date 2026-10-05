import { useEffect, useState } from 'react';
import { SERMONS, SERMON_CATEGORIES, type Sermon } from '../../data/content';
import { createContent, deleteContent, getContent, seedContent, updateContent } from '../../lib/contentApi';

type FormData = Omit<Sermon, 'id'>;

const EMPTY_FORM: FormData = {
  title: '',
  preacher: '',
  date: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
  duration: '00:00',
  views: 0,
  image: '',
  category: 'Predicaciones',
  mediaUrl: '',
  content: '',
};

export default function AdminPredicaciones() {
  const [sermons, setSermons] = useState<Sermon[]>(SERMONS);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    seedContent()
      .then(() => getContent('sermons'))
      .then((items) => {
        if (active) setSermons(items);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las predicaciones.');
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = sermons.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.preacher.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Todos' || s.category === activeCategory;
    return matchSearch && matchCat;
  });

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (sermon: Sermon) => {
    setForm({
      title: sermon.title,
      preacher: sermon.preacher,
      date: sermon.date,
      duration: sermon.duration,
      views: sermon.views,
      image: sermon.image,
      category: sermon.category,
      mediaUrl: sermon.mediaUrl ?? '',
      content: sermon.content ?? '',
    });
    setEditingId(sermon.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const current = sermons.find((sermon) => sermon.id === editingId);
        if (!current) return;
        const updated = await updateContent('sermons', editingId, { ...current, ...form });
        setSermons((prev) => prev.map((sermon) => sermon.id === editingId ? updated : sermon));
      } else {
        const created = await createContent('sermons', {
          ...form,
          image: form.image || 'https://images.unsplash.com/photo-1581548708095-7158f2e63857?w=600&h=400&fit=crop&auto=format',
        });
        setSermons((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la predicación.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await deleteContent('sermons', id);
      setSermons((prev) => prev.filter((sermon) => sermon.id !== id));
      setDeleteConfirm(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar la predicación.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-800 text-navy">Predicaciones</h1>
          <p className="text-muted text-[13px]">{sermons.length} predicaciones en total</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[13px] font-600 hover:bg-brand-dark transition-colors"
        >
          + Nueva predicación
        </button>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar predicaciones..."
            className="text-[13px] outline-none flex-1 bg-transparent"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['Todos', ...SERMON_CATEGORIES.slice(0, 4)].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-500 transition-all ${
                activeCategory === cat ? 'bg-navy text-white' : 'bg-surface border border-border text-text hover:bg-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((sermon) => (
          <div key={sermon.id} className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-all group">
            <div className="relative h-40 bg-surface overflow-hidden">
              <img src={sermon.image} alt={sermon.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-white text-[11px] font-600">
                {sermon.duration}
              </div>
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-navy/80 text-white text-[10px] font-600 rounded-md">
                {sermon.category}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-700 text-navy text-[13px] leading-snug">{sermon.title}</h3>
              <p className="text-muted text-[11px] mt-0.5">{sermon.preacher}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted">
                <span>{sermon.date}</span>
                <span>·</span>
                <span>👁 {sermon.views.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEdit(sermon)}
                  className="flex-1 py-1.5 rounded-lg bg-surface border border-border text-[12px] font-500 hover:bg-navy hover:text-white hover:border-navy transition-all"
                >
                  Editar
                </button>
                <button
                  onClick={() => setDeleteConfirm(sermon.id)}
                  className="py-1.5 px-3 rounded-lg bg-surface border border-border text-[12px] text-red-400 hover:bg-red-50 hover:border-red-200 transition-all"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted bg-white rounded-xl border border-border">No se encontraron predicaciones.</div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-700 text-navy text-[16px]">{editingId ? 'Editar predicación' : 'Nueva predicación'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-navy text-xl">✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-600 text-text mb-1">Título *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="Título de la predicación"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-600 text-text mb-1">Predicador</label>
                  <input
                    value={form.preacher}
                    onChange={(e) => setForm({ ...form, preacher: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="Ps. Nombre Apellido"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-600 text-text mb-1">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand bg-white"
                  >
                    {SERMON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-600 text-text mb-1">Fecha</label>
                  <input
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-600 text-text mb-1">Duración (mm:ss)</label>
                  <input
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="45:30"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-600 text-text mb-1">URL de imagen / thumbnail</label>
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-600 text-text mb-1">
                    Enlace de video / audio
                  </label>
                  <input
                    value={form.mediaUrl}
                    onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="https://youtube.com/watch?v=... o https://soundcloud.com/..."
                  />
                  <p className="text-muted text-[11px] mt-1">YouTube, Vimeo, SoundCloud, Google Drive, etc.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-600 text-text mb-1">
                    Contenido / Descripción
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand resize-y leading-relaxed"
                    placeholder="Escribe aquí la descripción, resumen, puntos clave o transcripción de la predicación..."
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-[13px] font-500 hover:bg-surface">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-brand text-white text-[13px] font-600 hover:bg-brand-dark disabled:opacity-60">
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear predicación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-2xl mb-3">🗑️</p>
            <h3 className="font-700 text-navy mb-2">¿Eliminar predicación?</h3>
            <p className="text-muted text-[13px] mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg border border-border text-[13px] font-500 hover:bg-surface">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-[13px] font-600 hover:bg-red-600">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
