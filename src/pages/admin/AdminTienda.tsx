import { useEffect, useState } from "react"
import { commerce, money } from "../../lib/commerce"
import { supabase } from "../../lib/supabase"
const empty = {
  title: "",
  author: "",
  description: "",
  category: "",
  kind: "physical",
  price: "",
  stock: 0,
  image_url: "",
  ebook_path: "",
  status: "draft",
}
export default function AdminTienda() {
  const [products, setProducts] = useState<any[]>([]),
    [orders, setOrders] = useState<any[]>([]),
    [form, setForm] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState("products"),
    [loading, setLoading] = useState(true)
  async function reload() {
    try {
      const [p, o] = await Promise.all([
        commerce("/admin/products"),
        commerce("/admin/orders"),
      ])
      setProducts(p.items)
      setOrders(o.items)
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
      await commerce("/admin/save/products", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      })
      setForm(null)
      await reload()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function upload(file: File) {
    if (file.type !== "application/pdf" || file.size > 50 * 1024 * 1024) {
      setError("Elegí un PDF de hasta 50 MB.")
      return
    }
    setBusy(true)
    try {
      const d = await commerce("/admin/upload", {})
      const r = await supabase.storage
        .from("store-ebooks")
        .uploadToSignedUrl(d.path, d.token, file, {
          contentType: "application/pdf",
        })
      if (r.error) throw r.error
      setForm((f: any) => ({ ...f, ebook_path: d.path }))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-navy mb-5">Tienda</h1>
      <div className="flex gap-4 mb-5">
        <button
          className="border rounded p-2"
          onClick={() => setTab("products")}
        >
          Productos
        </button>
        <button className="border rounded p-2" onClick={() => setTab("orders")}>
          Pedidos
        </button>
      </div>
      {error && (
        <p role="alert" className="bg-red-50 text-red-700 p-3 mb-4">
          {error}
        </p>
      )}
      {loading && <p>Cargando…</p>}
      {tab === "products" ? (
        <>
          <button
            onClick={() => setForm({ ...empty })}
            className="bg-brand text-white rounded p-3 mb-5"
          >
            Nuevo libro
          </button>
          {form && (
            <form
              onSubmit={save}
              className="border bg-white rounded-xl p-5 grid sm:grid-cols-2 gap-4 mb-6"
            >
              {[
                ["title", "Título"],
                ["author", "Autor"],
                ["category", "Categoría"],
                ["image_url", "Portada (URL)"],
                ["price", "Precio en ARS"],
                ["stock", "Stock físico"],
              ].map(([k, l]) => (
                <label key={k}>
                  {l}
                  <input
                    className="block border rounded p-2 w-full"
                    required={k === "title" || k === "price"}
                    type={
                      k === "price" || k === "stock"
                        ? "number"
                        : k === "image_url"
                          ? "url"
                          : "text"
                    }
                    min={k === "price" ? 0.01 : 0}
                    step={k === "price" ? 0.01 : 1}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
                </label>
              ))}
              <label>
                Formato
                <select
                  className="block border rounded p-2 w-full"
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value })}
                >
                  <option value="physical">Libro físico</option>
                  <option value="ebook">Ebook PDF</option>
                </select>
              </label>
              <label>
                Estado
                <select
                  className="block border rounded p-2 w-full"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </select>
              </label>
              <label className="sm:col-span-2">
                Descripción
                <textarea
                  className="block border rounded p-2 w-full"
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              {form.kind === "ebook" && (
                <label className="sm:col-span-2">
                  Archivo PDF privado (máximo 50 MB)
                  <input
                    disabled={busy}
                    className="block my-2"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      e.target.files?.[0] && upload(e.target.files[0])
                    }
                  />
                  <span>
                    {form.ebook_path ? "PDF cargado" : "Falta cargar el PDF"}
                  </span>
                </label>
              )}
              <div className="flex gap-3">
                <button
                  disabled={busy}
                  className="bg-brand text-white rounded p-3"
                >
                  {busy ? "Procesando…" : "Guardar"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setForm(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
          {products.map((p) => (
            <article
              key={p.id}
              className="bg-white border rounded-xl p-4 mb-3 flex justify-between gap-4"
            >
              <div>
                <h2 className="font-bold">{p.title}</h2>
                <p>
                  {money(Number(p.price))} ·{" "}
                  {p.kind === "ebook" ? "Ebook" : `Stock: ${p.stock}`} ·{" "}
                  {p.status === "published" ? "Publicado" : "Borrador"}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setForm({ ...p })}>Editar</button>
                <button
                  className="text-red-700"
                  onClick={async () => {
                    if (
                      !confirm(
                        "¿Eliminar el producto? Los productos con pedidos deben pasarse a borrador.",
                      )
                    )
                      return
                    try {
                      await commerce("/admin/delete/products", { id: p.id })
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
          {!loading && !products.length && <p>No hay libros cargados.</p>}
        </>
      ) : (
        <>
          <p className="text-muted mb-4">
            Últimos 500 pedidos. El estado de pago lo confirma Mercado Pago.
            “paid_review” requiere coordinar entrega o devolución por falta de
            stock.
          </p>
          {orders.map((o) => (
            <article key={o.id} className="border bg-white rounded-xl p-4 mb-4">
              <h2 className="font-bold">
                {o.product_title} × {o.quantity} · {money(Number(o.total))}
              </h2>
              <p>
                {o.buyer_name} · {o.buyer_email}
              </p>
              <p>
                {o.delivery} {o.address}
              </p>
              <button
                className="text-brand underline my-2"
                onClick={async () => {
                  try {
                    await commerce("/admin/reconcile", { id: o.id })
                    await reload()
                  } catch (e: any) {
                    setError(e.message)
                  }
                }}
              >
                Consultar pago nuevamente
              </button>
              <p>
                Pago: {o.status} ·{" "}
                {new Date(o.created_at).toLocaleString("es-AR")}
              </p>
              {o.kind === "physical" && (
                <label>
                  Entrega{" "}
                  <select
                    className="border rounded p-2 mt-2"
                    value={o.fulfillment}
                    onChange={async (e) => {
                      try {
                        await commerce("/admin/fulfillment", {
                          id: o.id,
                          fulfillment: e.target.value,
                        })
                        await reload()
                      } catch (err: any) {
                        setError(err.message)
                      }
                    }}
                  >
                    {[
                      ["pending", "Pendiente"],
                      ["ready", "Listo"],
                      ["sent", "Enviado"],
                      ["complete", "Completado"],
                    ].map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </article>
          ))}
          {!loading && !orders.length && <p>No hay pedidos.</p>}
        </>
      )}
    </div>
  )
}
