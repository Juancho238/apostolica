import { useEffect, useState } from 'react';
import { RESOURCES, type Resource } from '../../data/content';
import { createContent, deleteContent, getContent, updateContent } from '../../lib/contentApi';

type ResourceType = Resource['type'];
const TYPES: ResourceType[] = ['Bosquejo', 'Devocional', 'Guía de Célula', 'Estudio Bíblico', 'Multimedia'];

const TYPE_ICONS: Record<string, string> = {
  'Bosquejo': '📄',
  'Devocional': '🕯',
  'Guía de Célula': '👥',
  'Estudio Bíblico': '📖',
  'Multimedia': '🎞',
};

const TYPE_COLORS: Record<string, string> = {
  'Bosquejo': 'bg-blue-50 text-blue-600',
  'Devocional': 'bg-purple-50 text-purple-600',
  'Guía de Célula': 'bg-green-50 text-green-600',
  'Estudio Bíblico': 'bg-orange-50 text-orange-600',
  'Multimedia': 'bg-pink-50 text-pink-600',
};

type FormData = Omit<Resource, 'id'>;

const EMPTY_FORM: FormData = {
  title: '',
  type: 'Bosquejo',
  description: '',
  downloadUrl: '',
  image: '',
  content: '',
};

export default function AdminRecursos() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('Todos');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getContent('resources')
      .then((items) => {
        if (active) setResources(items);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los recursos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = resources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === 'Todos' || r.type === activeType;
    return matchSearch && matchType;
  });

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (r: Resource) => {
    setForm({
      title: r.title,
      type: r.type,
      description: r.description,
      downloadUrl: r.downloadUrl ?? '',
      image: r.image ?? '',
      content: r.content ?? '',
    });
    setEditingId(r.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const current = resources.find((resource) => resource.id === editingId);
        if (!current) return;
        const updated = await updateContent('resources', editingId, { ...current, ...form });
        setResources((prev) => prev.map((resource) => resource.id === editingId ? updated : resource));
      } else {
        const created = await createContent('resources', form);
        setResources((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el recurso.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await deleteContent('resources', id);
      setResources((prev) => prev.filter((resource) => resource.id !== id));
      setDeleteConfirm(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el recurso.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-800 text-navy">Recursos</h1>
          <p className="text-muted text-[13px]">{resources.length} recursos disponibles</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[13px] font-600 hover:bg-brand-dark transition-colors"
        >
          + Nuevo recurso
        </button>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center py-14 bg-white rounded-xl border border-border">
          <div className="w-6 h-6 border-2 border-brand/25 border-t-brand rounded-full animate-spin" />
          <span className="ml-3 text-muted text-[13px]">Cargando recursos...</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {TYPES.map((type) => {
          const count = resources.filter((r) => r.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setActiveType(activeType === type ? 'Todos' : type)}
              className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
                activeType === type ? 'border-brand ring-2 ring-brand/20' : 'border-border'
              }`}
            >
              <span className="text-2xl">{TYPE_ICONS[type]}</span>
              <p className="font-700 text-navy text-xl mt-1">{count}</p>
              <p className="text-muted text-[11px] mt-0.5 leading-tight">{type}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar recursos..."
            className="text-[13px] outline-none flex-1 bg-transparent"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['Todos', ...TYPES].map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-500 transition-all ${
                activeType === type ? 'bg-navy text-white' : 'bg-surface border border-border text-text hover:bg-border'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="px-4 py-3 text-left font-600 text-muted">Recurso</th>
              <th className="px-4 py-3 text-left font-600 text-muted hidden sm:table-cell">Tipo</th>
              <th className="px-4 py-3 text-left font-600 text-muted hidden lg:table-cell">Descripción</th>
              <th className="px-4 py-3 text-left font-600 text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((resource) => (
              <tr key={resource.id} className="hover:bg-surface/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 ${TYPE_COLORS[resource.type] || 'bg-surface text-text'}`}>
                      {TYPE_ICONS[resource.type]}
                    </div>
                    <p className="font-600 text-navy line-clamp-1">{resource.title}</p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-600 ${TYPE_COLORS[resource.type] || 'bg-surface text-muted'}`}>
                    {resource.type}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <p className="text-muted line-clamp-1">{resource.description}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(resource)}
                      className="px-3 py-1.5 rounded-lg bg-surface border border-border text-[12px] font-500 hover:bg-navy hover:text-white hover:border-navy transition-all"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(resource.id)}
                      className="px-3 py-1.5 rounded-lg text-[12px] text-red-400 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-muted">
            {resources.length === 0 ? 'No hay recursos aún. Creá el primero.' : 'No se encontraron recursos.'}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-700 text-navy text-[16px]">{editingId ? 'Editar recurso' : 'Nuevo recurso'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-navy text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-[12px] font-600 text-text mb-1">Título *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                  placeholder="Nombre del recurso"
                />
              </div>
              <div>
                <label className="block text-[12px] font-600 text-text mb-1">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand bg-white"
                >
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-600 text-text mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand resize-none"
                  placeholder="Descripción breve del recurso..."
                />
              </div>
              <div>
                <label className="block text-[12px] font-600 text-text mb-1">Enlace al material <span className="text-muted font-400">(opcional)</span></label>
                <input
                  value={form.downloadUrl}
                  onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                  placeholder="https://drive.google.com/... o https://..."
                />
              </div>
              <div>
                <label className="block text-[12px] font-600 text-text mb-1">Imagen por URL <span className="text-muted font-400">(opcional)</span></label>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div>
                <label className="block text-[12px] font-600 text-text mb-1">Contenido <span className="text-muted font-400">(opcional)</span></label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand resize-y leading-relaxed"
                  placeholder="Contenido del recurso: pasaje bíblico, puntos, aplicación..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-[13px] font-500 hover:bg-surface">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-brand text-white text-[13px] font-600 hover:bg-brand-dark disabled:opacity-60">
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear recurso'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-2xl mb-3">🗑️</p>
            <h3 className="font-700 text-navy mb-2">¿Eliminar recurso?</h3>
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
