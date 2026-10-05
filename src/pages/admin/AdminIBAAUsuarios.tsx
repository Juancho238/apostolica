import { useEffect, useState } from "react"
import {
  adminGetStudents,
  adminGetYears,
  LEVELS,
  type Student,
  type Enrollment,
  type AcademicYear,
  type Level,
} from "../../lib/campus"
import { supabase } from "../../lib/supabase"

type StudentWithEnrollments = Student & { enrollments: Enrollment[] }

export default function AdminIBAAUsuarios() {
  const [students, setStudents] = useState<StudentWithEnrollments[]>([])
  const [years, setYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Invite panel
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteFirst, setInviteFirst] = useState("")
  const [inviteLast, setInviteLast] = useState("")
  const [inviteLevel, setInviteLevel] = useState<Level>("Nivel I")
  const [inviteYear, setInviteYear] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState<{
    type: "ok" | "err"
    text: string
  } | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [s, y] = await Promise.all([adminGetStudents(), adminGetYears()])
      setStudents(s)
      setYears(y)
      if (!inviteYear && y.length > 0)
        setInviteYear(y.find((yr) => yr.is_current)?.id ?? y[0].id)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setInviteMsg(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error("Sin sesión de administrador.")

      const projectId = "hxdpdtgamxigobobgzaf"
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-12c44cf4/admin/ibaa/invite-student`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: inviteEmail,
            first_name: inviteFirst,
            last_name: inviteLast,
            level: inviteLevel,
            academic_year_id: inviteYear,
            redirect_to: `${window.location.origin}/campus/activar`,
          }),
        },
      )
      const contentType = res.headers.get("content-type") ?? ""
      if (!contentType.includes("application/json")) {
        const text = await res.text()
        throw new Error(
          `HTTP ${res.status} — La ruta /admin/ibaa/invite-student no está desplegada o la Edge Function devolvió texto plano. Desplegá el código indicado abajo. Respuesta: ${text.slice(0, 150)}`,
        )
      }
      const json = await res.json()
      if (!res.ok)
        throw new Error(json.error ?? json.message ?? `Error ${res.status}`)
      setInviteMsg({
        type: "ok",
        text: `Invitación enviada a ${inviteEmail}. El alumno recibirá un correo para activar su cuenta.`,
      })
      setInviteEmail("")
      setInviteFirst("")
      setInviteLast("")
      await load()
    } catch (e: any) {
      setInviteMsg({ type: "err", text: e.message })
    } finally {
      setInviting(false)
    }
  }

  async function toggleStudentStatus(student: StudentWithEnrollments) {
    const newStatus = student.status === "active" ? "inactive" : "active"
    const { error } = await supabase
      .from("ibaa_students")
      .update({ status: newStatus })
      .eq("id", student.id)
    if (error) {
      alert(error.message)
      return
    }
    await load()
  }

  const currentYear = years.find((y) => y.is_current)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-800 text-navy">IBAA – Usuarios</h1>
        <p className="text-muted text-[13px] mt-1">
          Gestioná alumnos y sus inscripciones.
        </p>
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="text-navy font-800 text-[15px] mb-4">Invitar alumno</h2>
        <p className="text-muted text-[12px] mb-4 leading-relaxed">
          El alumno recibirá un correo de invitación para activar su cuenta. La
          contraseña no se almacena en ninguna tabla propia.
          <br />
          <strong>Nota:</strong> esta función requiere que el endpoint{" "}
          <code>/admin/ibaa/invite-student</code> esté desplegado en la Edge
          Function.
        </p>
        <form onSubmit={handleInvite} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-600 text-text mb-1">
              Nombre
            </label>
            <input
              value={inviteFirst}
              onChange={(e) => setInviteFirst(e.target.value)}
              required
              className="input"
              placeholder="Juan"
            />
          </div>
          <div>
            <label className="block text-[12px] font-600 text-text mb-1">
              Apellido
            </label>
            <input
              value={inviteLast}
              onChange={(e) => setInviteLast(e.target.value)}
              required
              className="input"
              placeholder="Pérez"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[12px] font-600 text-text mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="input"
              placeholder="alumno@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-[12px] font-600 text-text mb-1">
              Nivel
            </label>
            <select
              value={inviteLevel}
              onChange={(e) => setInviteLevel(e.target.value as Level)}
              className="input"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-600 text-text mb-1">
              Año lectivo
            </label>
            <select
              value={inviteYear}
              onChange={(e) => setInviteYear(e.target.value)}
              className="input"
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.year}
                  {y.is_current ? " (actual)" : ""}
                </option>
              ))}
            </select>
          </div>
          {inviteMsg && (
            <div
              className={`sm:col-span-2 rounded-xl px-4 py-3 text-[13px] ${
                inviteMsg.type === "ok"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {inviteMsg.text}
            </div>
          )}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={inviting || !inviteYear}
              title={
                !inviteYear
                  ? "Primero creá un año lectivo en la base de datos."
                  : undefined
              }
              className="px-5 py-2.5 rounded-xl bg-brand text-white font-600 text-[13px] hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviting ? "Enviando invitación..." : "Enviar invitación"}
            </button>
            {!inviteYear && years.length === 0 && !loading && (
              <p className="text-[12px] text-orange-600 mt-1">
                No hay años lectivos registrados. Aplicá el SQL indicado abajo
                para crear uno.
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Students list */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-navy font-800 text-[15px]">
            Alumnos registrados {currentYear ? `— ${currentYear.year}` : ""}
          </h2>
        </div>
        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-brand/25 border-t-brand rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="p-6 text-red-600 text-[13px]">{error}</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-muted text-[13px]">
            No hay alumnos registrados aún.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {students.map((s) => {
              const currentEnrollment = currentYear
                ? s.enrollments.find(
                    (e) => e.academic_year_id === currentYear.id,
                  )
                : null
              return (
                <div
                  key={s.id}
                  className="px-6 py-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 font-700 text-navy text-[13px]">
                      {s.first_name[0]}
                      {s.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-600 text-navy text-[14px]">
                        {s.first_name} {s.last_name}
                      </p>
                      <p className="text-muted text-[12px] truncate">
                        {s.email}
                      </p>
                      {currentEnrollment && (
                        <span className="inline-block mt-0.5 text-[11px] font-600 text-brand">
                          {currentEnrollment.level}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-700 ${
                        s.status === "active"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      {s.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                    <button
                      onClick={() => toggleStudentStatus(s)}
                      className="px-3 py-1.5 rounded-lg border border-border text-[12px] font-500 text-muted hover:bg-surface transition-colors"
                    >
                      {s.status === "active" ? "Deshabilitar" : "Habilitar"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
