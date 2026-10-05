import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../../lib/supabase"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    })
    if (authError) {
      setError("Correo o contraseña incorrectos.")
      setLoading(false)
      return
    }
    navigate("/admin/dashboard")
  }

  return (
    <div className="min-h-screen flex bg-navy-dark">
      {/* Left visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1613492636024-9430710a84d4?w=900&h=1200&fit=crop&auto=format"
          alt="Panel administrativo"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy/80 to-brand/30" />
        <div className="relative flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
                <path
                  d="M20 6 C14 6 10 12 10 18 C10 24 14 28 20 34 C26 28 30 24 30 18 C30 12 26 6 20 6Z"
                  fill="#f97316"
                />
                <path
                  d="M20 12 C17 12 15 15 15 18 C15 21 17 23 20 26 C23 23 25 21 25 18 C25 15 23 12 20 12Z"
                  fill="white"
                  fillOpacity="0.6"
                />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-700 uppercase tracking-wide">
                Asamblea Apostólica
              </p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">
                en Argentina
              </p>
            </div>
          </Link>
          <div>
            <h2 className="text-4xl font-800 mb-4 leading-snug">
              Panel de
              <br />
              Administración Emu
            </h2>
            <p className="text-white/60 text-[15px] leading-relaxed max-w-sm">
              Gestioná artículos, predicaciones y recursos de la plataforma
              desde un solo lugar.
            </p>
            <div className="flex gap-3 mt-8">
              {["Artículos", "Predicaciones", "Recursos", "Estadísticas"].map(
                (feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1.5 rounded-full bg-white/10 text-[11px] font-600 border border-white/15"
                  >
                    {feature}
                  </span>
                ),
              )}
            </div>
          </div>
          <p className="text-white/25 text-[12px]">
            © 2024 Asamblea Apostólica en Argentina
          </p>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white lg:max-w-[480px]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none">
                <path
                  d="M20 6 C14 6 10 12 10 18 C10 24 14 28 20 34 C26 28 30 24 30 18 C30 12 26 6 20 6Z"
                  fill="#f97316"
                />
              </svg>
            </div>
            <span className="text-navy font-700 text-[14px] uppercase tracking-wide">
              Admin AAArg
            </span>
          </div>

          <h1 className="text-2xl font-800 text-navy mb-1">Iniciar sesión</h1>
          <p className="text-muted text-[14px] mb-8">
            Accedé al panel de gestión de contenidos.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] font-600 text-text mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aaarg.org"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-border text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-600 text-text mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-border text-[14px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand text-white font-600 text-[14px] hover:bg-brand-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-surface rounded-xl border border-border">
            <p className="text-[12px] text-muted leading-relaxed">
              Usá una cuenta administradora creada en Supabase Auth para
              acceder.
            </p>
          </div>

          <p className="text-center mt-6">
            <Link to="/" className="text-brand text-[13px] hover:underline">
              ← Volver al sitio público
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
