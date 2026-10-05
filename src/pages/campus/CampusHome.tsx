import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getMyContext, getSubjectsByLevelYear, type Subject } from '../../lib/campus';

export default function CampusHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentName, setStudentName] = useState('');
  const [level, setLevel] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [inactive, setInactive] = useState(false);
  const [noEnrollment, setNoEnrollment] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const { student, year: yr, enrollment, error: ctxErr } = await getMyContext();
      if (!active) return;

      if (ctxErr === 'Sin sesión.') { navigate('/campus/login'); return; }
      if (!student || ctxErr) { setError(ctxErr ?? 'Error al cargar tu perfil.'); setLoading(false); return; }
      if (student.status === 'inactive') { setInactive(true); setLoading(false); return; }
      if (!enrollment || !yr) { setNoEnrollment(true); setLoading(false); return; }

      setStudentName(`${student.first_name} ${student.last_name}`);
      setLevel(enrollment.level);
      setYear(yr.year);

      const subs = await getSubjectsByLevelYear(enrollment.level, yr.id).catch(() => []);
      if (active) { setSubjects(subs); setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/campus/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-dark flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-brand/25 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col">
      {/* Header */}
      <header className="bg-navy-dark px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
            <span className="text-lg">🎓</span>
          </div>
          <div>
            <p className="text-white text-[13px] font-700">Campus IBAA</p>
            {!inactive && !noEnrollment && <p className="text-white/50 text-[11px]">{level} · {year}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {studentName && <span className="text-white/60 text-[12px] hidden sm:block">{studentName}</span>}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-[12px] font-500 hover:bg-white/20 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Inactive */}
        {inactive && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-4xl mb-3">🔒</div>
            <h2 className="text-navy text-xl font-800 mb-2">Cuenta deshabilitada</h2>
            <p className="text-muted text-[14px]">Tu cuenta de alumno está inactiva. Contactá a la administración del IBAA.</p>
          </div>
        )}

        {/* No enrollment */}
        {noEnrollment && !inactive && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-4xl mb-3">📋</div>
            <h2 className="text-navy text-xl font-800 mb-2">Sin inscripción activa</h2>
            <p className="text-muted text-[14px]">No tenés un nivel habilitado para este año lectivo. Contactá a la administración del IBAA.</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-600 text-[14px]">{error}</p>
          </div>
        )}

        {/* Campus content */}
        {!inactive && !noEnrollment && !error && (
          <>
            {/* Welcome */}
            <div className="bg-navy rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #1d6bca 0%, transparent 60%)' }} />
              <p className="text-white/60 text-[12px] font-600 uppercase tracking-widest mb-1 relative">Bienvenido/a</p>
              <h2 className="text-2xl font-800 relative">{studentName}</h2>
              <p className="text-white/70 text-[14px] mt-1 relative">{level} · Año lectivo {year}</p>
            </div>

            {/* Subjects */}
            <h3 className="text-navy font-800 text-lg mb-4">Tus materias</h3>

            {subjects.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-muted text-[14px] shadow-sm">
                Aún no hay materias cargadas para este nivel y año. Volvé pronto.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {subjects.map((s) => (
                  <Link
                    key={s.id}
                    to={`/campus/materia/${s.id}`}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group border border-border"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-700 text-navy text-[15px] group-hover:text-brand transition-colors leading-snug">{s.name}</p>
                        {s.professor_name && (
                          <p className="text-muted text-[12px] mt-1">Prof. {s.professor_name}</p>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-brand shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
