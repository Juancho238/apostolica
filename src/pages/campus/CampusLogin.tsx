import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type Mode = 'login' | 'recovery' | 'recovery-sent';

export default function CampusLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) {
        if (authErr.message.includes('Invalid login credentials') || authErr.message.includes('invalid_grant')) {
          setError('Correo o contraseña incorrectos.');
        } else if (authErr.message.includes('Email not confirmed')) {
          setError('Tu correo aún no fue confirmado. Revisá tu bandeja de entrada.');
        } else {
          setError(authErr.message);
        }
        return;
      }
      navigate('/campus');
    } finally {
      setLoading(false);
    }
  }

  async function handleRecovery(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: recErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/campus/restablecer-password`,
      });
      if (recErr) { setError(recErr.message); return; }
      setMode('recovery-sent');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-dark flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center gap-3">
        <Link to="/ibaa" className="text-white/50 text-[12px] hover:text-white transition-colors flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          IBAA
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand/20 border border-brand/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎓</span>
            </div>
            <h1 className="text-white text-2xl font-800">Campus IBAA</h1>
            <p className="text-white/50 text-[13px] mt-1">Instituto Bíblico de la Asamblea Apostólica</p>
          </div>

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[12px] font-600 text-white/70 mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 text-[14px] outline-none focus:border-brand focus:bg-white/15 transition-all"
                  placeholder="tu@correo.com"
                />
              </div>
              <div>
                <label className="block text-[12px] font-600 text-white/70 mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 text-[14px] outline-none focus:border-brand focus:bg-white/15 transition-all"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-3 text-red-300 text-[13px]">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand text-white font-600 text-[14px] hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {loading ? 'Ingresando...' : 'Ingresar al campus'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('recovery'); setError(''); }}
                className="w-full text-center text-white/40 text-[12px] hover:text-white/70 transition-colors"
              >
                Olvidé mi contraseña
              </button>
            </form>
          )}

          {mode === 'recovery' && (
            <form onSubmit={handleRecovery} className="space-y-4">
              <p className="text-white/60 text-[13px] text-center leading-relaxed">
                Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <div>
                <label className="block text-[12px] font-600 text-white/70 mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 text-[14px] outline-none focus:border-brand transition-all"
                  placeholder="tu@correo.com"
                />
              </div>
              {error && (
                <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-3 text-red-300 text-[13px]">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand text-white font-600 text-[14px] hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="w-full text-center text-white/40 text-[12px] hover:text-white/70 transition-colors"
              >
                Volver al inicio de sesión
              </button>
            </form>
          )}

          {mode === 'recovery-sent' && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto text-2xl">✉️</div>
              <p className="text-white font-600">Correo enviado</p>
              <p className="text-white/60 text-[13px] leading-relaxed">
                Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.
              </p>
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className="text-brand text-[13px] font-600 hover:underline"
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
