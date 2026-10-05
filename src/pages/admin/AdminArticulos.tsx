import { useEffect, useState } from 'react';
import { CATEGORIES, type Article } from '../../data/content';
import { createContent, deleteContent, getContent, updateContent } from '../../lib/contentApi';

type FormData = Omit<Article, 'id' | 'slug' | 'authorBio' | 'tags'>;

const EMPTY_FORM: FormData = {
  title: '',
  excerpt: '',
  content: '',
  category: 'Enseñanzas',
  author: '',
  date: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
  readTime: 5,
  image: '',
};

export default function AdminArticulos() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getContent('articles')
      .then((items) => {
        if (active) setArticles(items);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los artículos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (article: Article) => {
    setForm({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      author: article.author,
      date: article.date,
      readTime: article.readTime,
      image: article.image,
    });
    setEditingId(article.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const current = articles.find((article) => article.id === editingId);
        if (!current) return;
        const updated = await updateContent('articles', editingId, { ...current, ...form });
        setArticles((prev) => prev.map((article) => article.id === editingId ? updated : article));
      } else {
        const created = await createContent('articles', {
          ...form,
          slug: form.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          authorBio: '',
          tags: [],
          image: form.image || 'https://images.unsplash.com/photo-1593485589800-579b43749b15?w=600&h=400&fit=crop&auto=format',
        });
        setArticles((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el artículo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await deleteContent('articles', id);
      setArticles((prev) => prev.filter((article) => article.id !== id));
      setDeleteConfirm(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el artículo.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-800 text-navy">Artículos</h1>
          <p className="text-muted text-[13px]">{articles.length} artículos en total</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[13px] font-600 hover:bg-brand-dark transition-colors"
        >
          + Nuevo artículo
        </button>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar artículos..."
            className="text-[13px] outline-none flex-1 bg-transparent"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-14 bg-white rounded-xl border border-border">
          <div className="w-6 h-6 border-2 border-brand/25 border-t-brand rounded-full animate-spin" />
          <span className="ml-3 text-muted text-[13px]">Cargando artículos...</span>
        </div>
      )}

      {/* Table */}
      {!loading && <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="px-4 py-3 text-left font-600 text-muted">Artículo</th>
                <th className="px-4 py-3 text-left font-600 text-muted hidden sm:table-cell">Categoría</th>
                <th className="px-4 py-3 text-left font-600 text-muted hidden md:table-cell">Autor</th>
                <th className="px-4 py-3 text-left font-600 text-muted hidden lg:table-cell">Fecha</th>
                <th className="px-4 py-3 text-left font-600 text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((article) => (
                <tr key={article.id} className="hover:bg-surface/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={article.image} alt={article.title} className="w-10 h-10 rounded-lg object-cover bg-surface shrink-0" />
                      <div className="min-w-0">
                        <p className="font-600 text-navy line-clamp-1">{article.title}</p>
                        <p className="text-muted text-[11px] line-clamp-1 mt-0.5">{article.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="px-2 py-0.5 bg-brand/10 text-brand text-[11px] font-600 rounded-full whitespace-nowrap">{article.category}</span>
                  </td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell whitespace-nowrap">{article.author}</td>
                  <td className="px-4 py-3 text-muted hidden lg:table-cell whitespace-nowrap">{article.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(article)}
                        className="px-3 py-1.5 rounded-lg bg-surface border border-border text-[12px] font-500 hover:bg-navy hover:text-white hover:border-navy transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(article.id)}
                        className="px-3 py-1.5 rounded-lg bg-surface border border-border text-[12px] font-500 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted">
              {articles.length === 0 ? 'No hay artículos aún. Creá el primero.' : 'No se encontraron artículos.'}
            </div>
          )}
        </div>
      </div>}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-700 text-navy text-[16px]">{editingId ? 'Editar artículo' : 'Nuevo artículo'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-navy transition-colors text-xl">✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-600 text-text mb-1">Título *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="Título del artículo"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-600 text-text mb-1">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand bg-white"
                  >
                    {CATEGORIES.slice(1).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-600 text-text mb-1">Autor</label>
                  <input
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="Nombre del autor"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-600 text-text mb-1">Fecha</label>
                  <input
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="01 Ene 2024"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-600 text-text mb-1">Tiempo de lectura (min)</label>
                  <input
                    type="number"
                    value={form.readTime}
                    onChange={(e) => setForm({ ...form, readTime: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    min="1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-600 text-text mb-1">URL de imagen</label>
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-600 text-text mb-1">Resumen</label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand resize-none"
                    placeholder="Resumen breve del artículo..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-600 text-text mb-1">Contenido</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand resize-none"
                    placeholder="Contenido completo del artículo..."
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-border text-[13px] font-500 hover:bg-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-brand text-white text-[13px] font-600 hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear artículo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-2xl mb-3">🗑️</p>
            <h3 className="font-700 text-navy mb-2">¿Eliminar artículo?</h3>
            <p className="text-muted text-[13px] mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg border border-border text-[13px] font-500 hover:bg-surface">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-[13px] font-600 hover:bg-red-600">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
