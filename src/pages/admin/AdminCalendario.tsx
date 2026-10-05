import { useEffect, useState } from "react"
import { commerce, CalendarEvent, eventDate } from "../../lib/commerce"
const empty = {
  title: "",
  description: "",
  category: "Cultos",
  start_at: "",
  end_at: "",
  all_day: false,
  place: "",
  address: "",
  online_url: "",
  image_url: "",
  status: "draft",
}
function local(s: string | null) {
  if (!s) return ""
  return new Date(new Date(s).getTime() - 3 * 3600000)
    .toISOString()
    .slice(0, 16)
}
export default function AdminCalendario() {
  const [items, setItems] = useState<CalendarEvent[]>([]),
    [form, setForm] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true)
  async function reload() {
    try {
      setItems((await commerce("/admin/events")).items)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    reload()
  }, [])
  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const date = (s: string) =>
        new Date(`${s.length === 10 ? s + "T00:00" : s}:00-03:00`).toISOString()
      await commerce("/admin/save/events", {
        ...form,
        start_at: date(form.start_at),
        end_at: form.end_at ? date(form.end_at) : null,
      })
      setForm(null)
      await reload()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  function field(k: string, v: unknown) {
    setForm({ ...form, [k]: v })
  }
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-navy mb-2">Calendario</h1>
      <p className="text-muted mb-5">
        Horarios de Argentina. Los borradores no son públicos.
      </p>
      {error && (
        <p role="alert" className="bg-red-50 text-red-700 p-3 rounded mb-4">
          {error}
        </p>
      )}
      <button
        className="bg-brand text-white rounded px-4 py-2 mb-5"
        onClick={() => setForm({ ...empty })}
      >
        Nuevo evento
      </button>
      {form && (
        <form
          onSubmit={save}
          className="bg-white border rounded-xl p-5 grid sm:grid-cols-2 gap-4 mb-6"
        >
          {[
            ["title", "Título"],
            ["place", "Lugar"],
            ["address", "Dirección"],
            ["online_url", "Enlace online"],
            ["image_url", "Imagen (URL)"],
          ].map(([k, label]) => (
            <label key={k}>
              {label}
              <input
                className="block border rounded p-2 w-full"
                type={k.endsWith("url") ? "url" : "text"}
                required={k === "title"}
                value={form[k]}
                onChange={(e) => field(k, e.target.value)}
              />
            </label>
          ))}
          <label>
            Categoría
            <select
              className="block border rounded p-2 w-full"
              value={form.category}
              onChange={(e) => field("category", e.target.value)}
            >
              {["Cultos", "IBAA", "Congresos", "Otras actividades"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            Descripción
            <textarea
              className="block border rounded p-2 w-full"
              rows={4}
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
            />
          </label>
          <label className="sm:col-span-2">
            <input
              type="checkbox"
              checked={form.all_day}
              onChange={(e) =>
                setForm({
                  ...form,
                  all_day: e.target.checked,
                  start_at: form.start_at.slice(0, 10),
                  end_at: form.end_at.slice(0, 10),
                })
              }
            />{" "}
            Todo el día
          </label>
          {[
            ["start_at", "Inicio"],
            ["end_at", "Finalización (opcional)"],
          ].map(([k, label]) => (
            <label key={k}>
              {label}
              <input
                className="block border rounded p-2 w-full"
                required={k === "start_at"}
                type={form.all_day ? "date" : "datetime-local"}
                value={form[k]}
                onChange={(e) => field(k, e.target.value)}
              />
            </label>
          ))}
          <label>
            Estado
            <select
              className="block border rounded p-2"
              value={form.status}
              onChange={(e) => field("status", e.target.value)}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </label>
          <div className="flex gap-3 items-end">
            <button
              disabled={busy}
              className="bg-brand text-white rounded px-4 py-2"
            >
              {busy ? "Guardando…" : "Guardar"}
            </button>
            <button type="button" disabled={busy} onClick={() => setForm(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
      {loading && <p>Cargando…</p>}
      {!loading && !items.length && <p>No hay eventos cargados.</p>}
      {items.map((i) => (
        <article
          key={i.id}
          className="bg-white border rounded-xl p-4 mb-3 flex flex-wrap justify-between gap-3"
        >
          <div>
            <h2 className="font-bold">{i.title}</h2>
            <p>
              {eventDate(i)} ·{" "}
              {i.status === "published" ? "Publicado" : "Borrador"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                setForm({
                  ...i,
                  start_at: i.all_day
                    ? i.start_at.slice(0, 10)
                    : local(i.start_at),
                  end_at: i.all_day
                    ? i.end_at?.slice(0, 10) || ""
                    : local(i.end_at),
                })
              }
            >
              Editar
            </button>
            <button
              className="text-red-700"
              onClick={async () => {
                if (!confirm("¿Eliminar este evento?")) return
                try {
                  await commerce("/admin/delete/events", { id: i.id })
                  await reload()
                } catch (e: any) {
                  setError(e.message)
                }
              }}
            >
              Eliminar
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
