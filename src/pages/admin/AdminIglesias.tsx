import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CHURCHES, type Church } from '../../data/content';
import { createContent, deleteContent, getContent, updateContent } from '../../lib/contentApi';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type FormData = Omit<Church, 'id'>;

const EMPTY_FORM: FormData = {
  name: '',
  pastor: '',
  address: '',
  schedules: '',
  lat: undefined,
  lng: undefined,
};

interface GeoResult {
  display_name: string;
  lat: string;
  lon: string;
}

// Leaflet map click handler component
function ClickToPlace({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPlace(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function AdminIglesias() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Geocoding state
  const [geoQuery, setGeoQuery] = useState('');
  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [coordsConfirmed, setCoordsConfirmed] = useState(false);
  const [addressChanged, setAddressChanged] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getContent('churches')
      .then((items) => { if (active) setChurches(items.length > 0 ? items : CHURCHES); })
      .catch(() => { if (active) setChurches(CHURCHES); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = churches.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.pastor.toLowerCase().includes(q);
  });

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setGeoQuery('');
    setGeoResults([]);
    setGeoError('');
    setCoordsConfirmed(false);
    setAddressChanged(false);
    setShowModal(true);
  }

  function openEdit(c: Church) {
    setForm({ name: c.name, pastor: c.pastor, address: c.address, schedules: c.schedules, lat: c.lat, lng: c.lng });
    setEditingId(c.id);
    setGeoQuery(c.address);
    setGeoResults([]);
    setGeoError('');
    setCoordsConfirmed(c.lat != null && c.lng != null);
    setAddressChanged(false);
    setShowModal(true);
  }

  async function searchGeo() {
    if (!geoQuery.trim()) return;
    setGeoLoading(true);
    setGeoError('');
    setGeoResults([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(geoQuery)}&format=json&addressdetails=0&limit=5&countrycodes=ar`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
      if (!res.ok) throw new Error('Error al consultar el geocodificador.');
      const data: GeoResult[] = await res.json();
      if (data.length === 0) {
        setGeoError('No se encontraron resultados. Ajustá la búsqueda o colocá el marcador manualmente en el mapa.');
      } else {
        setGeoResults(data);
      }
    } catch (e: any) {
      setGeoError(e.message ?? 'Error de red al geocodificar.');
    } finally {
      setGeoLoading(false);
    }
  }

  function selectGeoResult(r: GeoResult) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setForm((f) => ({ ...f, lat, lng }));
    setGeoResults([]);
    setCoordsConfirmed(true);
    setAddressChanged(false);
  }

  function placeManually(lat: number, lng: number) {
    setForm((f) => ({ ...f, lat, lng }));
    setCoordsConfirmed(true);
    setAddressChanged(false);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const current = churches.find((c) => c.id === editingId);
        if (!current) return;
        const updated = await updateContent('churches', editingId, { ...current, ...form });
        setChurches((prev) => prev.map((c) => c.id === editingId ? updated : c));
      } else {
        const created = await createContent('churches', form);
        setChurches((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo guardar la iglesia.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError('');
    try {
      await deleteContent('churches', id);
      setChurches((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo eliminar la iglesia.');
    }
  }

  const mapCenter: [number, number] =
    form.lat != null && form.lng != null ? [form.lat, form.lng] : [-34.6, -58.38];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-800 text-navy">Iglesias</h1>
          <p className="text-muted text-[13px]">{churches.length} iglesias registradas</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[13px] font-600 hover:bg-brand-dark transition-colors"
        >
          + Nueva iglesia
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}

      {/* Search */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 max-w-sm">
          <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar iglesias..."
            className="text-[13px] outline-none flex-1 bg-transparent"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-2 py-10 bg-white rounded-xl border border-border justify-center">
          <div className="w-5 h-5 border-2 border-brand/25 border-t-brand rounded-full animate-spin" />
          <span className="text-muted text-[13px]">Cargando...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-4 py-3 text-left font-600 text-muted">Iglesia</th>
                  <th className="px-4 py-3 text-left font-600 text-muted hidden md:table-cell">Dirección</th>
                  <th className="px-4 py-3 text-left font-600 text-muted hidden lg:table-cell">Horarios</th>
                  <th className="px-4 py-3 text-left font-600 text-muted">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-600 text-navy">{c.name}</p>
                      <p className="text-muted text-[11px]">{c.pastor}</p>
                      {c.lat == null && (
                        <span className="text-[10px] text-orange-500 font-500">Sin coordenadas</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell max-w-xs">
                      <p className="line-clamp-1">{c.address}</p>
                    </td>
                    <td className="px-4 py-3 text-muted hidden lg:table-cell">
                      <p className="line-clamp-1 text-[12px]">{c.schedules}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="px-3 py-1.5 rounded-lg bg-surface border border-border text-[12px] font-500 hover:bg-navy hover:text-white hover:border-navy transition-all"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(c.id)}
                          className="py-1.5 px-2.5 rounded-lg text-[12px] text-red-400 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted">
                {churches.length === 0 ? 'No hay iglesias. Creá la primera.' : 'No se encontraron iglesias.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-700 text-navy text-[16px]">{editingId ? 'Editar iglesia' : 'Nueva iglesia'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-navy text-xl">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Basic fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-600 text-text mb-1">Nombre *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="Nombre de la iglesia"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-600 text-text mb-1">Pastor</label>
                  <input
                    value={form.pastor}
                    onChange={(e) => setForm({ ...form, pastor: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="Ps. Nombre Apellido"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-600 text-text mb-1">Horarios de cultos</label>
                  <input
                    value={form.schedules}
                    onChange={(e) => setForm({ ...form, schedules: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="Domingos 10:00 hs y 18:00 hs"
                  />
                </div>
              </div>

              {/* Address + geocoding */}
              <div>
                <label className="block text-[12px] font-600 text-text mb-1">Dirección completa</label>
                <div className="flex gap-2">
                  <input
                    value={form.address}
                    onChange={(e) => {
                      setForm({ ...form, address: e.target.value });
                      setGeoQuery(e.target.value);
                      if (coordsConfirmed) setAddressChanged(true);
                    }}
                    className="flex-1 px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand"
                    placeholder="Calle 123, Ciudad, Provincia"
                  />
                </div>

                {addressChanged && (
                  <p className="text-[11px] text-orange-600 font-500 mt-1">
                    La dirección cambió. Buscá de nuevo para confirmar la ubicación.
                  </p>
                )}

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => { setGeoQuery(form.address); searchGeo(); }}
                    disabled={geoLoading || !form.address.trim()}
                    className="px-3 py-2 rounded-lg bg-navy text-white text-[12px] font-600 hover:bg-navy-mid transition-colors disabled:opacity-50"
                  >
                    {geoLoading ? 'Buscando...' : 'Buscar dirección'}
                  </button>
                  {form.lat != null && (
                    <span className="flex items-center gap-1 text-[12px] text-green-600 font-500">
                      ✓ {coordsConfirmed ? 'Ubicación confirmada' : 'Con coordenadas'}
                      {' '}({form.lat.toFixed(4)}, {form.lng!.toFixed(4)})
                    </span>
                  )}
                </div>

                {geoError && (
                  <p className="text-[12px] text-red-600 mt-2">{geoError}</p>
                )}

                {geoResults.length > 1 && (
                  <div className="mt-2 border border-border rounded-lg overflow-hidden">
                    <p className="text-[11px] font-600 text-muted px-3 py-2 bg-surface border-b border-border">
                      Seleccioná la ubicación correcta:
                    </p>
                    {geoResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => selectGeoResult(r)}
                        className="w-full text-left px-3 py-2.5 text-[12px] text-navy hover:bg-surface border-b border-border last:border-0 transition-colors"
                      >
                        {r.display_name}
                      </button>
                    ))}
                  </div>
                )}

                {geoResults.length === 1 && (
                  <div className="mt-2 border border-green-200 bg-green-50 rounded-lg px-3 py-2.5 flex items-start justify-between gap-3">
                    <p className="text-[12px] text-green-800">{geoResults[0].display_name}</p>
                    <button
                      onClick={() => selectGeoResult(geoResults[0])}
                      className="shrink-0 px-3 py-1 rounded-lg bg-green-600 text-white text-[11px] font-600 hover:bg-green-700"
                    >
                      Confirmar
                    </button>
                  </div>
                )}
              </div>

              {/* Map preview */}
              <div>
                <p className="text-[12px] font-600 text-text mb-1">
                  Vista previa del marcador
                  <span className="text-muted font-400 ml-1">— clic en el mapa para ajustar manualmente</span>
                </p>
                <div className="rounded-xl overflow-hidden border border-border h-48">
                  <MapContainer
                    key={`${form.lat}-${form.lng}`}
                    center={mapCenter}
                    zoom={form.lat != null ? 14 : 5}
                    className="w-full h-full"
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_48of_1_564fab30d72eba6cc0e6a5f5"
                    />
                    <ClickToPlace onPlace={placeManually} />
                    {form.lat != null && form.lng != null && (
                      <Marker
                        position={[form.lat, form.lng]}
                        draggable
                        eventHandlers={{
                          dragend: (e) => {
                            const latlng = (e.target as L.Marker).getLatLng();
                            setForm((f) => ({ ...f, lat: latlng.lat, lng: latlng.lng }));
                            setCoordsConfirmed(true);
                          },
                        }}
                      />
                    )}
                  </MapContainer>
                </div>
                <p className="text-[11px] text-muted mt-1">
                  También podés arrastrar el marcador para afinar la posición.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-[13px] font-500 hover:bg-surface">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-brand text-white text-[13px] font-600 hover:bg-brand-dark disabled:opacity-60"
              >
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear iglesia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-2xl mb-3">🗑️</p>
            <h3 className="font-700 text-navy mb-2">¿Eliminar iglesia?</h3>
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
