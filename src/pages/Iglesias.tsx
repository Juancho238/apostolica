import Reveal from '../components/Reveal';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CHURCHES, type Church } from '../data/content';
import { getContent } from '../lib/contentApi';

// Fix default marker icons in Leaflet + Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const selectedIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'leaflet-marker-selected',
});

// Component that syncs map view to selected church or bounds
function MapController({ churches, selectedId }: { churches: Church[]; selectedId: string | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedId) {
      const ch = churches.find((c) => c.id === selectedId);
      if (ch?.lat != null && ch?.lng != null) {
        map.flyTo([ch.lat, ch.lng], 15, { duration: 0.8 });
      }
    } else {
      const withCoords = churches.filter((c) => c.lat != null && c.lng != null);
      if (withCoords.length === 0) return;
      if (withCoords.length === 1) {
        map.setView([withCoords[0].lat!, withCoords[0].lng!], 14);
      } else {
        const bounds = L.latLngBounds(withCoords.map((c) => [c.lat!, c.lng!]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [selectedId, churches]);

  return null;
}

export default function Iglesias() {
  const [churches, setChurches] = useState<Church[]>(CHURCHES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    let active = true;
    getContent('churches')
      .then((items) => {
        if (active && items.length > 0) setChurches(items);
      })
      .catch(() => {/* fallback to static */})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = churches.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.pastor.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  const withCoords = filtered.filter((c) => c.lat != null && c.lng != null);
  const defaultCenter: [number, number] = [-34.6, -58.38]; // Buenos Aires

  function selectChurch(id: string) {
    setSelectedId(id);
    // Open popup on the marker
    setTimeout(() => {
      const marker = markerRefs.current[id];
      if (marker) marker.openPopup();
    }, 900); // after flyTo animation
    // Scroll list item into view
    const el = document.getElementById(`iglesia-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const mapsLink = (c: Church) =>
    `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <Reveal className="relative min-h-[200px] flex items-end bg-navy-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 to-navy-dark/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-8 pt-16 w-full">
          <p className="text-brand text-[11px] font-700 uppercase tracking-widest mb-1">Argentina</p>
          <h1 className="text-3xl sm:text-4xl font-800 text-white mb-1">Nuestras Iglesias</h1>
          <p className="text-white/60 text-[14px]">Encontrá la iglesia más cercana a vos.</p>
        </div>
      </Reveal>

      {/* Search */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
            <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, pastor o dirección..."
              className="text-[13px] outline-none flex-1 bg-transparent"
            />
          </div>
          {search && (
            <button
              onClick={() => { setSearch(''); setSelectedId(null); }}
              className="text-brand text-[12px] font-600 hover:underline whitespace-nowrap"
            >
              Ver todas
            </button>
          )}
          <span className="text-muted text-[12px]">{filtered.length} iglesia{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-5 min-h-[520px]">

        {/* List */}
        <div ref={listRef} className="w-full lg:w-80 shrink-0 overflow-y-auto max-h-[520px] lg:max-h-none space-y-2 lg:pr-1">
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-muted text-[13px]">
              <div className="w-4 h-4 border-2 border-brand/25 border-t-brand rounded-full animate-spin" />
              Cargando iglesias...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-muted text-[13px]">
              {churches.length === 0 ? 'Aún no hay iglesias cargadas.' : 'No se encontraron iglesias.'}
            </div>
          ) : (
            filtered.map((c) => {
              const isSelected = selectedId === c.id;
              const hasCoords = c.lat != null && c.lng != null;
              return (
                <div
                  id={`iglesia-${c.id}`}
                  key={c.id}
                  onClick={() => hasCoords ? selectChurch(c.id) : setSelectedId(c.id)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand bg-brand/5 shadow-sm'
                      : 'border-border bg-white hover:shadow-sm hover:border-brand/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-700 text-navy text-[14px] leading-snug">{c.name}</p>
                      <p className="text-muted text-[12px] mt-0.5">👤 {c.pastor}</p>
                      <p className="text-muted text-[11px] mt-1 leading-snug">📍 {c.address}</p>
                      <p className="text-muted text-[11px] mt-1">🕐 {c.schedules}</p>
                    </div>
                    {!hasCoords && (
                      <span className="shrink-0 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-500">Sin ubicación</span>
                    )}
                  </div>
                  {isSelected && hasCoords && (
                    <a
                      href={mapsLink(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-flex items-center gap-1 text-brand text-[11px] font-600 hover:underline"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Cómo llegar
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Map */}
        <div className="flex-1 rounded-2xl overflow-hidden min-h-[340px] border border-border">
          <MapContainer
            center={defaultCenter}
            zoom={6}
            className="w-full h-full min-h-[340px]"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_48of_1_564fab30d72eba6cc0e6a5f5"
            />
            <MapController churches={withCoords} selectedId={selectedId} />
            {withCoords.map((c) => (
              <Marker
                key={c.id}
                position={[c.lat!, c.lng!]}
                icon={selectedId === c.id ? selectedIcon : new L.Icon.Default()}
                ref={(ref) => { if (ref) markerRefs.current[c.id] = ref; }}
                eventHandlers={{ click: () => setSelectedId(c.id) }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-700 text-navy text-[13px] mb-1">{c.name}</p>
                    <p className="text-[12px] text-gray-600 mb-0.5">👤 {c.pastor}</p>
                    <p className="text-[11px] text-gray-500 mb-0.5">📍 {c.address}</p>
                    <p className="text-[11px] text-gray-500 mb-2">🕐 {c.schedules}</p>
                    <a
                      href={mapsLink(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 font-600 hover:underline"
                    >
                      Cómo llegar →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <Footer />
    </div>
  );
}
