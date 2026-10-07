import Reveal from '../components/Reveal';
import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { commerce, CalendarEvent, eventDate, safeUrl } from "../lib/commerce"
import calendarHero from '../assets/images/calendarHero.webp';

export default function Calendario() {
  const [events, setEvents] = useState<CalendarEvent[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [category, setCategory] = useState("Todos"),
    [selected, setSelected] = useState<CalendarEvent | null>(null)
  const [month, setMonth] = useState(() => {
    const p = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
    }).formatToParts(new Date())
    return `${p.find((x) => x.type === "year")!.value}-${p.find((x) => x.type === "month")!.value}`
  })
  useEffect(() => {
    commerce("/events")
      .then((d) => setEvents(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])
  const filtered = events.filter(
    (e) =>
      (e.all_day
        ? e.start_at.slice(0, 7)
        : new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Argentina/Buenos_Aires",
            year: "numeric",
            month: "2-digit",
          })
            .formatToParts(new Date(e.start_at))
            .filter((p) => p.type === "year" || p.type === "month")
            .map((p) => p.value)
            .sort((a, b) => b.length - a.length)
            .join("-")) === month &&
      (category === "Todos" || e.category === category),
  )
  const [y, m] = month.split("-").map(Number),
    days = new Date(y, m, 0).getDate(),
    offset = (new Date(y, m - 1, 1).getDay() + 6) % 7
  const dayOf = (e: CalendarEvent) =>
    e.all_day
      ? Number(e.start_at.slice(8, 10))
      : Number(
          new Intl.DateTimeFormat("en", {
            timeZone: "America/Argentina/Buenos_Aires",
            day: "numeric",
          }).format(new Date(e.start_at)),
        )
  const monthLabel = new Intl.DateTimeFormat("es-AR", {
      month: "long",
      year: "numeric",
    }).format(new Date(y, m - 1, 1))
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Hero */}
      <Reveal className="relative min-h-[300px] flex items-center bg-navy-dark overflow-hidden">
        <img
          src={calendarHero}
          alt="Calendario"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 to-navy-dark/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-10 items-center w-full">
          <div>
            <div className="flex flex-col items-left gap-3 mb-4">
              <h4 className="font-800 text-white align-left">CALENDARIO</h4>
              <h1 className="text-5xl font-800 text-white">Unidos en la fé <br /> presentes en cada momento</h1>
            </div>
            <p className="text-white/75 text-xl mb-2">Cultos, encuentros y actividades de la Asamblea Apostólica</p>
            <div className="flex flex-wrap gap-3 mb-6" style={{ marginTop: '50px' }}>
          <input
            aria-label="Mes"
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            className="border rounded-lg p-2"
            style={{ maxWidth: '200px', color: '#000', backgroundColor: '#fff' }}
          />
          <select
            aria-label="Categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-lg p-2"
            style={{ maxWidth: '200px', color: '#000', backgroundColor: '#fff' }}
          >
            {["Todos", "Cultos", "IBAA", "Congresos", "Otras actividades"].map(
              (c) => (
                <option key={c}>{c}</option>
              ),
            )}
          </select>
          <button
            onClick={() => {
              const now = new Date()
              setMonth(
                new Intl.DateTimeFormat("sv", {
                  timeZone: "America/Argentina/Buenos_Aires",
                  year: "numeric",
                  month: "2-digit",
                }).format(now),
              )
            }}
            className="border rounded-lg px-4"
            style={{ maxWidth: '200px', color: '#000', backgroundColor: '#fff' }}
          >
            Hoy
          </button>
            </div> 
          </div>
        </div>
      </Reveal>
      <main className="max-w-6xl mx-auto w-full p-6 flex-1">
        <h2 className="text-2xl font-bold text-navy mb-6 capitalize">
          {monthLabel}
        </h2>
        
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        {loading && <p>Cargando actividades…</p>}
        <div className="hidden md:grid grid-cols-7 border rounded-xl overflow-hidden mb-8">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
            <div key={d} className="bg-navy text-white p-3">
              {d}
            </div>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <div key={`blank${i}`} className="bg-surface" />
          ))}
          {Array.from({ length: days }, (_, i) => (
            <div key={i} className="border p-2 min-h-28">
              <span className="text-muted">{i + 1}</span>
              {filtered
                .filter((e) => dayOf(e) === i + 1)
                .map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className="block text-left text-sm bg-brand/10 text-navy rounded p-1 mt-1 w-full"
                  >
                    {e.title}
                  </button>
                ))}
            </div>
          ))}
        </div>
        <h2 className="text-xl font-bold mb-4">Actividades del mes</h2>
        {!loading && !error && !filtered.length && (
          <p>No hay actividades publicadas para este mes.</p>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(e)}
              className="text-left border rounded-xl p-5 bg-white motion-card hover:shadow-md"
            >
              <span className="text-brand text-sm">{e.category}</span>
              <h3 className="font-bold text-navy text-lg">{e.title}</h3>
              <p>
                {eventDate(e)}
                {e.all_day ? " · Todo el día" : ""}
              </p>
              <p className="text-muted">{e.place}</p>
            </button>
          ))}
        </div>
        {selected && (
          <div
            className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <Reveal
              role="dialog"
              aria-modal="true"
              aria-label={selected.title}
              className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="float-right border rounded px-3"
                onClick={() => setSelected(null)}
              >
                Cerrar
              </button>
              <h2 className="text-xl font-bold mt-8">{selected.title}</h2>
              {safeUrl(selected.image_url) && (
                <img
                  src={selected.image_url}
                  alt=""
                  className="w-full rounded my-3"
                />
              )}
              <p className="my-2">{eventDate(selected)}</p>
              {selected.end_at && (
                <p>
                  Hasta: {eventDate({ ...selected, start_at: selected.end_at })}
                </p>
              )}
              <p className="whitespace-pre-wrap my-4">{selected.description}</p>
              <p>{selected.place}</p>
              <p>{selected.address}</p>
              {safeUrl(selected.online_url) && (
                <a
                  className="text-brand underline"
                  href={selected.online_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Acceder a la actividad online
                </a>
              )}
            </Reveal>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
