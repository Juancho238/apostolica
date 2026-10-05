import { supabase } from "./supabase"
import { projectId, publicAnonKey } from "../../utils/supabase/info"
export const commerceUrl = `https://${projectId}.supabase.co/functions/v1/asamblea-commerce`
export async function commerce(path: string, body?: unknown) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const response = await fetch(`${commerceUrl}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: publicAnonKey,
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const text = await response.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(
      `Servidor HTTP ${response.status}. Revisá el despliegue de asamblea-commerce.`,
    )
  }
  if (!response.ok)
    throw new Error(data.error || "No se pudo completar la operación.")
  return data
}
export type CalendarEvent = {
  id: string
  title: string
  description: string
  category: string
  start_at: string
  end_at: string | null
  all_day: boolean
  place: string
  address: string
  online_url: string
  image_url: string
  status: string
}
export type Product = {
  id: string
  title: string
  author: string
  description: string
  category: string
  kind: "physical" | "ebook"
  price: number
  stock: number
  image_url: string
  status: string
}
export const money = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
    n,
  )
export const eventDate = (e: CalendarEvent) =>
  e.all_day
    ? e.start_at.slice(0, 10).split("-").reverse().join("/")
    : new Intl.DateTimeFormat("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(e.start_at))
export function safeUrl(value: string) {
  try {
    const u = new URL(value)
    return u.protocol === "https:" || u.protocol === "http:"
      ? u.href
      : undefined
  } catch {
    return undefined
  }
}
