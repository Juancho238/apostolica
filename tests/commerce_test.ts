import app from "../supabase/functions/asamblea-commerce/index.ts"
function assert(value: boolean, message: string) {
  if (!value) throw new Error(message)
}
Deno.test("la administración no permite solicitudes anónimas", async () => {
  for (const path of ["/admin/events", "/admin/products", "/admin/orders"]) {
    const r = await app.request(`/asamblea-commerce${path}`)
    assert(r.status === 403, path)
  }
})
Deno.test("webhook sin firma no puede aprobar pedidos", async () => {
  const r = await app.request("/asamblea-commerce/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "payment", data: { id: "123" } }),
  })
  assert(r.status === 401, "Debe rechazar webhook sin firma")
})
Deno.test("checkout rechaza cantidades y correo inválidos antes de acceder a DB", async () => {
  for (const quantity of [-1, 0, 11, 1.5]) {
    const r = await app.request("/asamblea-commerce/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity,
        name: "Prueba",
        email: "prueba@example.com",
      }),
    })
    assert(r.status === 400, "Cantidad inválida")
  }
})
Deno.test("firma incorrecta se rechaza sin consultar Mercado Pago", async () => {
  Deno.env.set("MP_WEBHOOK_SECRET", "secret-test")
  const r = await app.request("/asamblea-commerce/webhook?data.id=123", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-request-id": "test",
      "x-signature": `ts=1,v1=${"0".repeat(64)}`,
    },
    body: JSON.stringify({ type: "payment" }),
  })
  assert(r.status === 401, "Debe rechazar firma falsa")
})

Deno.test("checkout calcula precio desde DB y no confía en precio del navegador", async () => {
  Deno.env.set("SUPABASE_URL", "https://test-project.supabase.co")
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-key")
  Deno.env.set("SITE_URL", "https://store.example.com")
  Deno.env.set("MP_ACCESS_TOKEN", "test-only")
  const previousFetch = globalThis.fetch
  let preference: any, inserted: any
  globalThis.fetch = async (input, init) => {
    const url = String(input)
    if (url.includes("/rest/v1/aa_products"))
      return Response.json({
        id: "book1",
        title: "Libro",
        price: 1500,
        kind: "ebook",
        ebook_path: "test.pdf",
        stock: 0,
      })
    if (url.includes("/rest/v1/aa_orders") && init?.method === "POST") {
      inserted = JSON.parse(String(init.body))
      return Response.json({ id: "order1" })
    }
    if (url.includes("/checkout/preferences")) {
      preference = JSON.parse(String(init?.body))
      return Response.json({
        id: "pref1",
        init_point: "https://www.mercadopago.com.ar/test",
      })
    }
    if (url.includes("/rest/v1/aa_orders") && init?.method === "PATCH")
      return new Response(null, { status: 204 })
    throw new Error("Solicitud externa inesperada: " + url)
  }
  try {
    const r = await app.request("/asamblea-commerce/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: "book1",
        name: "Comprador",
        email: "test@example.com",
        quantity: 1,
        price: 1,
        total: 1,
      }),
    })
    assert(r.status === 200, "Debe iniciar Checkout")
    assert(
      preference.items[0].unit_price === 1500,
      "El precio debe provenir de DB",
    )
    assert(
      inserted.total === 1500,
      "El pedido debe guardar el total del servidor",
    )
    const result = await r.json()
    assert(
      result.token !== inserted.access_hash,
      "El token no debe guardarse en texto plano",
    )
  } finally {
    globalThis.fetch = previousFetch
  }
})

Deno.test("no habilita descarga de ebook con pago pendiente", async () => {
  const original = globalThis.fetch
  const token = "token-de-prueba"
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  )
  const access_hash = Array.from(new Uint8Array(digest))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
  globalThis.fetch = async (input) => {
    if (String(input).includes("/rest/v1/aa_orders"))
      return Response.json({
        id: "order1",
        access_hash,
        status: "pending",
        kind: "ebook",
        ebook_path: "private.pdf",
      })
    throw new Error("No debe solicitar enlace de descarga")
  }
  try {
    const r = await app.request("/asamblea-commerce/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: "order1", token }),
    })
    assert(r.status === 403, "Un pago pendiente debe bloquear el archivo")
  } finally {
    globalThis.fetch = original
  }
})
