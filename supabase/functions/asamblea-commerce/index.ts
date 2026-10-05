import { Hono } from "npm:hono@4.13.12"
import { cors } from "npm:hono@4.13.12/cors"
import { createClient } from "npm:@supabase/supabase-js@2.117.2"
const app = new Hono()
const env = (n: string) => {
  const v = Deno.env.get(n)
  if (!v) throw new Error(`Falta configurar ${n}`)
  return v
}
const db = () =>
  createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
app.use(
  "*",
  cors({
    origin: (origin) => (origin === Deno.env.get("SITE_URL") ? origin : ""),
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
)
app.onError((e, c) => {
  console.error(e.message)
  return c.json(
    {
      error: "No se pudo completar la operación. Revisá los logs del servidor.",
    },
    500,
  )
})
const check = (r: any) => {
  if (r.error) throw new Error(r.error.message)
  return r.data
}
async function admin(c: any) {
  const token = (c.req.header("Authorization") || "").replace(/^Bearer\s+/i, "")
  if (!token) return false
  const r = await db().auth.getUser(token)
  return !r.error && r.data.user?.app_metadata?.role === "admin"
}
const hash = async (s: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    ),
  )
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
const urlOk = (s: any) => !s || (/^https?:\/\//i.test(s) && s.length < 2000)
const prefix = "/asamblea-commerce"
app.get(`${prefix}/health`, (c) => c.json({ status: "ok" }))
app.get(`${prefix}/events`, async (c) =>
  c.json({
    items: check(
      await db()
        .from("aa_events")
        .select("*")
        .eq("status", "published")
        .order("start_at"),
    ),
  }),
)
app.get(`${prefix}/products`, async (c) =>
  c.json({
    items: check(
      await db()
        .from("aa_products")
        .select(
          "id,title,author,description,category,kind,price,stock,image_url,status",
        )
        .eq("status", "published")
        .order("title"),
    ),
  }),
)
app.get(`${prefix}/settings`, (c) =>
  c.json({
    shipping: Number(Deno.env.get("SHIPPING_ARS") || 0),
    shipping_enabled: Deno.env.get("SHIPPING_ENABLED") === "true",
  }),
)
app.get(`${prefix}/admin/:section`, async (c) => {
  if (!(await admin(c))) return c.json({ error: "Solo administradores." }, 403)
  const tables: any = {
    events: "aa_events",
    products: "aa_products",
    orders: "aa_orders",
  }
  const table = tables[c.req.param("section")]
  if (!table) return c.json({ error: "Sección inválida." }, 400)
  return c.json({
    items: check(
      await db()
        .from(table)
        .select("*")
        .order(table === "aa_orders" ? "created_at" : "title", {
          ascending: table !== "aa_orders",
        })
        .limit(500),
    ),
  })
})
app.post(`${prefix}/admin/save/:section`, async (c) => {
  if (!(await admin(c))) return c.json({ error: "Solo administradores." }, 403)
  const section = c.req.param("section"),
    b = await c.req.json(),
    id = b.id
  if (!["events", "products"].includes(section))
    return c.json({ error: "Sección inválida." }, 400)
  const keys =
    section === "events"
      ? [
          "title",
          "description",
          "category",
          "start_at",
          "end_at",
          "all_day",
          "place",
          "address",
          "online_url",
          "image_url",
          "status",
        ]
      : [
          "title",
          "author",
          "description",
          "category",
          "kind",
          "price",
          "stock",
          "image_url",
          "ebook_path",
          "status",
        ]
  const item: any = {}
  for (const k of keys) if (b[k] !== undefined) item[k] = b[k]
  if (
    !item.title?.trim() ||
    !["draft", "published"].includes(item.status) ||
    !urlOk(item.image_url) ||
    !urlOk(item.online_url)
  )
    return c.json({ error: "Revisá título, estado y enlaces." }, 400)
  if (
    section === "events" &&
    (!Number.isFinite(Date.parse(item.start_at)) ||
      (item.end_at && Date.parse(item.end_at) < Date.parse(item.start_at)))
  )
    return c.json({ error: "Fechas inválidas." }, 400)
  if (
    section === "products" &&
    (!["ebook", "physical"].includes(item.kind) ||
      !(Number(item.price) > 0) ||
      !Number.isInteger(Number(item.stock)) ||
      Number(item.stock) < 0)
  )
    return c.json({ error: "Precio o stock inválido." }, 400)
  if (item.ebook_path && !/^[a-f0-9-]+\.pdf$/i.test(item.ebook_path))
    return c.json({ error: "Archivo inválido." }, 400)
  const table = section === "events" ? "aa_events" : "aa_products"
  const query = id
    ? db().from(table).update(item).eq("id", id)
    : db().from(table).insert(item)
  return c.json({ item: check(await query.select().single()) })
})
app.post(`${prefix}/admin/delete/:section`, async (c) => {
  if (!(await admin(c))) return c.json({ error: "Solo administradores." }, 403)
  const section = c.req.param("section")
  if (!["events", "products"].includes(section))
    return c.json({ error: "Sección inválida." }, 400)
  const { id } = await c.req.json()
  const r = await db()
    .from(section === "events" ? "aa_events" : "aa_products")
    .delete()
    .eq("id", id)
  if (r.error)
    return c.json(
      { error: "No se puede eliminar. Si tiene pedidos, pasalo a borrador." },
      400,
    )
  return c.json({ ok: true })
})
app.post(`${prefix}/admin/fulfillment`, async (c) => {
  if (!(await admin(c))) return c.json({ error: "Solo administradores." }, 403)
  const { id, fulfillment } = await c.req.json()
  if (!["pending", "ready", "sent", "complete"].includes(fulfillment))
    return c.json({ error: "Estado inválido." }, 400)
  check(await db().from("aa_orders").update({ fulfillment }).eq("id", id))
  return c.json({ ok: true })
})
app.post(`${prefix}/admin/upload`, async (c) => {
  if (!(await admin(c))) return c.json({ error: "Solo administradores." }, 403)
  const path = `${crypto.randomUUID()}.pdf`
  return c.json({
    path,
    ...check(
      await db().storage.from("store-ebooks").createSignedUploadUrl(path),
    ),
  })
})
app.post(`${prefix}/checkout`, async (c) => {
  const b = await c.req.json(),
    qty = Number(b.quantity)
  if (
    !Number.isInteger(qty) ||
    qty < 1 ||
    qty > 10 ||
    typeof b.name !== "string" ||
    !b.name.trim() ||
    b.name.length > 150 ||
    typeof b.email !== "string" ||
    !/^\S+@\S+\.\S+$/.test(b.email) ||
    b.email.length > 254
  )
    return c.json({ error: "Revisá nombre, correo y cantidad." }, 400)
  const p = check(
    await db()
      .from("aa_products")
      .select("*")
      .eq("id", b.product_id)
      .eq("status", "published")
      .single(),
  )
  if (p.kind === "ebook" && qty !== 1)
    return c.json({ error: "Cada ebook se compra en una unidad." }, 400)
  if (p.kind === "physical" && p.stock < qty)
    return c.json({ error: "No hay stock suficiente." }, 409)
  const delivery = p.kind === "ebook" ? "digital" : b.delivery
  if (
    !(p.kind === "ebook"
      ? delivery === "digital"
      : ["pickup", "shipping"].includes(delivery)) ||
    (delivery === "shipping" &&
      (Deno.env.get("SHIPPING_ENABLED") !== "true" ||
        typeof b.address !== "string" ||
        b.address.trim().length < 10 ||
        b.address.length > 1000))
  )
    return c.json({ error: "Revisá la entrega y la dirección." }, 400)
  const shipping =
    delivery === "shipping" ? Number(Deno.env.get("SHIPPING_ARS") || 0) : 0
  if (!Number.isFinite(shipping) || shipping < 0)
    throw new Error("SHIPPING_ARS inválido")
  const token = crypto.randomUUID() + crypto.randomUUID(),
    price = Number(p.price),
    total = Math.round((price * qty + shipping) * 100) / 100
  const o = check(
    await db()
      .from("aa_orders")
      .insert({
        access_hash: await hash(token),
        buyer_name: b.name.trim(),
        buyer_email: b.email.toLowerCase(),
        delivery,
        address: delivery === "shipping" ? b.address : "",
        product_id: p.id,
        quantity: qty,
        product_title: p.title,
        kind: p.kind,
        ebook_path: p.ebook_path,
        unit_price: price,
        shipping,
        total,
      })
      .select("id")
      .single(),
  )
  const site = env("SITE_URL"),
    back = `${site}/tienda/pedido/${o.id}`
  const items = [
    {
      id: p.id,
      title: p.title,
      quantity: qty,
      currency_id: "ARS",
      unit_price: price,
    },
  ]
  if (shipping)
    items.push({
      id: "shipping",
      title: "Envío",
      quantity: 1,
      currency_id: "ARS",
      unit_price: shipping,
    })
  const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("MP_ACCESS_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items,
      payer: { email: b.email, name: b.name },
      external_reference: o.id,
      back_urls: { success: back, pending: back, failure: back },
      auto_return: "approved",
      notification_url: `${env("SUPABASE_URL")}/functions/v1/asamblea-commerce/webhook`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60000).toISOString(),
    }),
  })
  if (!r.ok) {
    check(
      await db()
        .from("aa_orders")
        .update({ status: "checkout_error" })
        .eq("id", o.id),
    )
    return c.json(
      {
        error:
          "Mercado Pago no pudo iniciar el pago. Revisá las credenciales del servidor.",
      },
      502,
    )
  }
  const pref = await r.json()
  check(
    await db()
      .from("aa_orders")
      .update({ preference_id: pref.id })
      .eq("id", o.id),
  )
  return c.json({ order_id: o.id, token, url: pref.init_point })
})
async function applyPayment(id: string) {
  const r = await fetch(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${env("MP_ACCESS_TOKEN")}` } },
  )
  if (!r.ok) throw new Error("No se pudo consultar pago")
  const p = await r.json()
  if (!p.external_reference) return
  const order = check(
    await db()
      .from("aa_orders")
      .select("*")
      .eq("id", p.external_reference)
      .maybeSingle(),
  )
  if (!order) return
  if (
    p.currency_id !== "ARS" ||
    Math.round(Number(p.transaction_amount) * 100) !==
      Math.round(Number(order.total) * 100) ||
    String(p.collector_id) !== env("MP_COLLECTOR_ID") ||
    p.live_mode !== (env("MP_LIVE_MODE") === "true")
  )
    throw new Error("Pago no coincide con pedido")
  // Bind the fetched payment to the preference, not just to a caller-provided reference.
  if (!p.order?.id) throw new Error("Pago sin orden de Mercado Pago")
  const mr = await fetch(
    `https://api.mercadopago.com/merchant_orders/${encodeURIComponent(p.order.id)}`,
    { headers: { Authorization: `Bearer ${env("MP_ACCESS_TOKEN")}` } },
  )
  if (!mr.ok) throw new Error("Orden MP no disponible")
  const mo = await mr.json()
  if (String(mo.preference_id) !== String(order.preference_id))
    throw new Error("Preferencia no coincide")
  check(
    await db().rpc("aa_apply_payment", {
      p_order: order.id,
      p_payment: String(p.id),
      p_status: p.status,
    }),
  )
}
app.post(`${prefix}/admin/reconcile`, async (c) => {
  if (!(await admin(c))) return c.json({ error: "Solo administradores." }, 403)
  const { id } = await c.req.json()
  const o = check(
    await db().from("aa_orders").select("payment_id").eq("id", id).single(),
  )
  if (!o.payment_id)
    return c.json(
      { error: "Todavía no se recibió un pago para reconciliar." },
      400,
    )
  await applyPayment(o.payment_id)
  return c.json({ ok: true })
})
app.post(`${prefix}/webhook`, async (c) => {
  const id = c.req.query("data.id"),
    requestId = c.req.header("x-request-id"),
    parts = Object.fromEntries(
      (c.req.header("x-signature") || "")
        .split(",")
        .map((p) => p.trim().split("=")),
    ),
    { ts, v1 } = parts
  if (!id || !requestId || !ts || !v1 || !/^\d+$/.test(id))
    return c.json({ error: "Firma ausente." }, 401)
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env("MP_WEBHOOK_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  )
  const bytes = v1.match(/.{2}/g)
  if (!/^[0-9a-f]{64}$/i.test(v1) || !bytes)
    return c.json({ error: "Firma inválida." }, 401)
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    new Uint8Array(bytes.map((x: string) => parseInt(x, 16))),
    new TextEncoder().encode(
      `id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`,
    ),
  )
  if (!ok) return c.json({ error: "Firma inválida." }, 401)
  const b = await c.req.json()
  if (b.type === "payment") await applyPayment(id)
  return c.json({ ok: true })
})
async function owned(b: any) {
  const o = check(
    await db().from("aa_orders").select("*").eq("id", b.order_id).maybeSingle(),
  )
  return o &&
    typeof b.token === "string" &&
    o.access_hash === (await hash(b.token))
    ? o
    : null
}
app.post(`${prefix}/order`, async (c) => {
  const b = await c.req.json()
  let o = await owned(b)
  if (!o)
    return c.json({ error: "Pedido no disponible en este navegador." }, 403)
  if (b.payment_id && /^\d+$/.test(String(b.payment_id))) {
    const r = await fetch(
      `https://api.mercadopago.com/v1/payments/${b.payment_id}`,
      { headers: { Authorization: `Bearer ${env("MP_ACCESS_TOKEN")}` } },
    )
    if (r.ok) {
      const p = await r.json()
      if (p.external_reference === o.id) await applyPayment(String(p.id))
    }
    o = await owned(b)
  }
  return c.json({
    order: {
      id: o.id,
      status: o.status,
      product_title: o.product_title,
      quantity: o.quantity,
      total: o.total,
      delivery: o.delivery,
      fulfillment: o.fulfillment,
      kind: o.kind,
    },
  })
})
app.post(`${prefix}/download`, async (c) => {
  const b = await c.req.json(),
    o = await owned(b)
  if (!o || o.status !== "approved" || o.kind !== "ebook")
    return c.json({ error: "La descarga requiere un pago aprobado." }, 403)
  return c.json(
    check(
      await db()
        .storage.from("store-ebooks")
        .createSignedUrl(o.ebook_path, 60, { download: true }),
    ),
  )
})
export default app
if (import.meta.main) Deno.serve(app.fetch)
