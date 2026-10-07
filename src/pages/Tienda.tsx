import Reveal from '../components/Reveal';
import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { commerce, Product, money, safeUrl } from "../lib/commerce"
export default function Tienda() {
  const [items, setItems] = useState<Product[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [search, setSearch] = useState(""),
    [kind, setKind] = useState("all"),
    [selected, setSelected] = useState<Product | null>(null),
    [busy, setBusy] = useState(false),
    [settings, setSettings] = useState({ shipping: 0, shipping_enabled: false })
  const [buyer, setBuyer] = useState({
    name: "",
    email: "",
    quantity: 1,
    delivery: "pickup",
    address: "",
  })
  useEffect(() => {
    Promise.all([commerce("/products"), commerce("/settings")])
      .then(([d, s]) => {
        setItems(d.items)
        setSettings(s)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])
  async function checkout(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setBusy(true)
    setError("")
    try {
      const d = await commerce("/checkout", {
        ...buyer,
        product_id: selected.id,
      })
      localStorage.setItem(`aa-order-${d.order_id}`, d.token)
      window.location.assign(d.url)
    } catch (e: any) {
      setError(e.message)
      setBusy(false)
    }
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Reveal className="bg-navy-dark text-white p-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-brand">Tienda online</p>
          <h1 className="text-4xl font-bold mt-2">
            Literatura cristiana para tu vida
          </h1>
          <p className="mt-4 text-white/70">
            Libros impresos y ebooks. Pagá con Mercado Pago.
          </p>
        </div>
      </Reveal>
      <main className="max-w-6xl mx-auto w-full p-6 flex-1">
        <div className="flex gap-3 mb-6">
          <input
            aria-label="Buscar libros"
            placeholder="Título, autor o tema"
            className="border rounded p-3 flex-1 min-w-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            aria-label="Formato"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="border rounded p-2"
          >
            <option value="all">Todos</option>
            <option value="physical">Impresos</option>
            <option value="ebook">Ebooks</option>
          </select>
        </div>
        {error && (
          <p role="alert" className="text-red-700 bg-red-50 p-3 mb-4 rounded">
            {error}
          </p>
        )}
        {loading && <p>Cargando libros…</p>}
        {!loading && !error && !items.length && (
          <p>Próximamente encontrarás nuestros libros aquí.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items
            .filter(
              (p) =>
                (kind === "all" || p.kind === kind) &&
                `${p.title} ${p.author} ${p.category}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
            )
            .map((p) => (
              <article
                className="border rounded-xl bg-white overflow-hidden flex flex-col"
                key={p.id}
              >
                <div className="aspect-[3/4] bg-navy text-white flex items-center justify-center p-5">
                  {safeUrl(p.image_url) ? (
                    <img
                      className="w-full h-full object-contain"
                      src={p.image_url}
                      alt={`Portada de ${p.title}`}
                    />
                  ) : (
                    <p className="text-xl text-center">{p.title}</p>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-brand text-sm">
                    {p.kind === "ebook" ? "Ebook PDF" : "Libro impreso"}
                  </span>
                  <h2 className="text-xl font-bold text-navy">{p.title}</h2>
                  <p className="text-muted">{p.author}</p>
                  <p className="font-bold my-3">{money(Number(p.price))}</p>
                  <button
                    disabled={p.kind === "physical" && p.stock === 0}
                    onClick={() => {
                      setSelected(p)
                      setBuyer({ ...buyer, quantity: 1, delivery: "pickup" })
                    }}
                    className="mt-auto bg-brand disabled:bg-gray-400 text-white rounded py-2"
                  >
                    {p.kind === "physical" && p.stock === 0
                      ? "Sin stock"
                      : "Ver y comprar"}
                  </button>
                </div>
              </article>
            ))}
        </div>
        {selected && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <form
              onSubmit={checkout}
              role="dialog"
              aria-modal="true"
              aria-label="Comprar libro"
              className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto"
            >
              <button
                type="button"
                disabled={busy}
                onClick={() => setSelected(null)}
                className="float-right"
              >
                Cerrar
              </button>
              <h2 className="font-bold text-2xl pr-12">{selected.title}</h2>
              <p className="whitespace-pre-wrap my-4">{selected.description}</p>
              {error && (
                <p className="text-red-700" role="alert">
                  {error}
                </p>
              )}
              {[
                ["name", "Nombre y apellido"],
                ["email", "Correo electrónico"],
              ].map(([k, l]) => (
                <label key={k} className="block my-3">
                  {l}
                  <input
                    required
                    type={k === "email" ? "email" : "text"}
                    value={(buyer as any)[k]}
                    onChange={(e) =>
                      setBuyer({ ...buyer, [k]: e.target.value })
                    }
                    className="border rounded p-2 w-full"
                  />
                </label>
              ))}
              {selected.kind === "physical" && (
                <>
                  <label className="block my-3">
                    Cantidad
                    <input
                      className="border rounded p-2 w-full"
                      type="number"
                      required
                      min={1}
                      max={Math.min(10, selected.stock)}
                      value={buyer.quantity}
                      onChange={(e) =>
                        setBuyer({ ...buyer, quantity: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className="block">
                    Entrega
                    <select
                      className="border rounded p-2 w-full"
                      value={buyer.delivery}
                      onChange={(e) =>
                        setBuyer({ ...buyer, delivery: e.target.value })
                      }
                    >
                      <option value="pickup">Retiro a coordinar</option>
                      {settings.shipping_enabled && (
                        <option value="shipping">
                          Envío ({money(settings.shipping)})
                        </option>
                      )}
                    </select>
                  </label>
                  {buyer.delivery === "shipping" && (
                    <label className="block my-3">
                      Dirección, localidad, provincia y código postal
                      <textarea
                        required
                        minLength={10}
                        className="border rounded p-2 w-full"
                        value={buyer.address}
                        onChange={(e) =>
                          setBuyer({ ...buyer, address: e.target.value })
                        }
                      />
                    </label>
                  )}
                </>
              )}
              <p className="font-bold my-4">
                Total:{" "}
                {money(
                  Number(selected.price) * buyer.quantity +
                    (selected.kind === "physical" &&
                    buyer.delivery === "shipping"
                      ? settings.shipping
                      : 0),
                )}
              </p>
              <p className="text-sm text-muted my-3">
                {selected.kind === "ebook"
                  ? "La descarga se habilita cuando se confirma el pago. Guardá el enlace de tu pedido."
                  : "El stock se confirma al acreditar el pago. Si se agota durante el pago, coordinaremos la entrega o devolución."}
              </p>
              <button
                disabled={busy}
                className="bg-brand text-white rounded p-3 w-full"
              >
                {busy ? "Abriendo pago…" : "Pagar con Mercado Pago"}
              </button>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
