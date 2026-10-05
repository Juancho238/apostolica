import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type Stage = 'loading' | 'form' | 'done' | 'error';

function parseHashTokens(): { accessToken: string; refreshToken: string; type: string } | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const type = params.get('type') ?? '';
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken, type };
}

export default function CampusRestablecerPassword() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let settled = false;

    function markForm() {
      if (!settled) { settled = true; setStage('form'); }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        markForm();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markForm();
    });

    // Fallback manual para tipo recovery
    const tokens = parseHashTokens();
    if (tokens && tokens.type === 'recovery') {
      supabase.auth
        .setSession({ access_token: tokens.accessToken, refresh_token: tokens.refreshToken })
        .then(({ error }) => {
          if (!error) markForm();
        });
    }

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setErrorMsg(
          'El enlace de restablecimiento es inválido o ya expiró. ' +
          'Solicitá uno nuevo desde la pantalla de ingreso al campus.',
        );
        setStage('error');
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setSaveError('');
    if (password.length < 8) { setSaveError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (password !== confirm) { setSaveError('Las contraseñas no coinciden.'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setSaveError(error.message); setSaving(false); return; }
    setStage('done');
    setTimeout(() => navigate('/campus/login'), 2500);
  }

  return (
    <div className="min-h-screen bg-navy-dark flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand/20 border border-brand/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔑</span>
            </div>
            <h1 className="text-white text-2xl font-800">Campus IBAA</h1>
            <p className="text-white/50 text-[13px] mt-1">Restablecer contraseña</p>
          </div>

          {stage === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-7 h-7 border-2 border-brand/25 border-t-brand rounded-full animate-spin" />
              <p className="text-white/50 text-[13px]">Verificando enlace…</p>
            </div>
          )}

          {stage === 'error' && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/25 p-6 text-center space-y-3">
              <p className="text-3xl">⚠️</p>
              <p className="text-red-300 text-[13px] leading-relaxed">{errorMsg}</p>
              <button
                onClick={() => navigate('/campus/login')}
                className="text-brand text-[13px] font-600 hover:underline"
              >
                Volver al ingreso
              </button>
            </div>
          )}

          {stage === 'form' && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <p className="text-white/60 text-[13px] text-center leading-relaxed mb-2">
                Ingresá tu nueva contraseña para el campus.
              </p>
              <div>
                <label className="block text-[12px] font-600 text-white/70 mb-1.5">Nueva contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 text-[14px] outline-none focus:border-brand transition-all"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div>
                <label className="block text-[12px] font-600 text-white/70 mb-1.5">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 text-[14px] outline-none focus:border-brand transition-all"
                  placeholder="Repetí la contraseña"
                />
              </div>
              {saveError && (
                <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-3 text-red-300 text-[13px]">
                  {saveError}
                </div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-brand text-white font-600 text-[14px] hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {saving ? 'Guardando…' : 'Guardar nueva contraseña'}
              </button>
            </form>
          )}

          {stage === 'done' && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto text-2xl">✓</div>
              <p className="text-white font-600">Contraseña actualizada</p>
              <p className="text-white/60 text-[13px]">Redirigiendo al ingreso…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
