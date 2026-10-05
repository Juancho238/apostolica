import { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { commerce, money } from "../lib/commerce"
export default function Pedido() {
  const { id } = useParams(),
    [params] = useSearchParams(),
    [order, setOrder] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false)
  const token = localStorage.getItem(`aa-order-${id}`)
  async function load() {
    setBusy(true)
    setError("")
    try {
      const d = await commerce("/order", {
        order_id: id,
        token,
        payment_id: params.get("payment_id") || params.get("collection_id"),
      })
      setOrder(d.order)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  useEffect(() => {
    load()
  }, [id])
  const labels: any = {
    pending: "Esperando confirmación del pago",
    approved: "Pago aprobado",
    in_process: "Pago en proceso",
    rejected: "Pago rechazado",
    cancelled: "Pago cancelado",
    refunded: "Pago devuelto",
    charged_back: "Pago revertido",
    paid_review: "Pago recibido: entrega pendiente de revisión",
    checkout_error: "No se inició el pago",
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-2xl mx-auto w-full p-6 flex-1">
        <h1 className="text-3xl font-bold mb-5">Tu pedido</h1>
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        {busy && <p>Consultando el pago…</p>}
        {order && (
          <div className="bg-surface border rounded-xl p-5">
            <h2 className="text-xl font-bold">{order.product_title}</h2>
            <p>
              Cantidad: {order.quantity} · {money(Number(order.total))}
            </p>
            <p className="font-bold my-4">
              {labels[order.status] || "Pendiente de revisión"}
            </p>
            {order.status === "approved" && order.kind === "ebook" && (
              <button
                className="bg-brand text-white rounded p-3"
                onClick={async () => {
                  try {
                    const d = await commerce("/download", {
                      order_id: id,
                      token,
                    })
                    window.location.assign(d.signedUrl)
                  } catch (e: any) {
                    setError(e.message)
                  }
                }}
              >
                Descargar ebook
              </button>
            )}
            {order.kind === "physical" && (
              <p>
                Entrega:{" "}
                {order.delivery === "pickup" ? "Retiro a coordinar" : "Envío"} ·{" "}
                {
                  ({
                    pending: "Pendiente",
                    ready: "Listo",
                    sent: "Enviado",
                    complete: "Completado",
                  } as any)[order.fulfillment]
                }
              </p>
            )}
            <p className="text-sm mt-5">
              Guardá esta página. El acceso al pedido se conserva en este
              navegador.
            </p>
          </div>
        )}
        <button
          disabled={busy}
          onClick={load}
          className="border rounded p-3 my-4"
        >
          Actualizar estado
        </button>
        <Link className="ml-4 text-brand" to="/tienda">
          Volver a la tienda
        </Link>
      </main>
      <Footer />
    </div>
  )
}
