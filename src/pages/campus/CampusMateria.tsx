import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  getMyContext, getPublishedModules, getPublishedLessons,
  getPublishedSubjectResources, getPublishedLessonResources,
  getSubjectAssignments, getMySubmission, submitAssignment, getResourceSignedUrl,
  type Subject, type Module, type Lesson, type CampusResource, type Assignment, type Submission,
} from '../../lib/campus';

type Tab = 'contenido' | 'recursos' | 'tareas' | 'profesor';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png','image/webp'];
const ALLOWED_EXT = '.pdf, .doc, .docx, .jpg, .jpeg, .png, .webp';

function extractYouTubeId(url: string): string | null {
  const patterns = [/[?&]v=([a-zA-Z0-9_-]{11})/, /youtu\.be\/([a-zA-Z0-9_-]{11})/, /\/shorts\/([a-zA-Z0-9_-]{11})/, /\/embed\/([a-zA-Z0-9_-]{11})/];
  for (const re of patterns) { const m = url.match(re); if (m) return m[1]; }
  return null;
}

export default function CampusMateria() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('contenido');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [subjectResources, setSubjectResources] = useState<CampusResource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      const { student, enrollment, error: ctxErr } = await getMyContext();
      if (!active) return;
      if (ctxErr === 'Sin sesión.' || !student) { navigate('/campus/login'); return; }
      if (student.status === 'inactive' || !enrollment) { navigate('/campus'); return; }
      setStudentId(student.id);

      const { data: sub, error: subErr } = await supabase.from('ibaa_subjects').select('*').eq('id', subjectId).eq('status', 'published').maybeSingle();
      if (!active) return;
      if (subErr || !sub) { setError('Materia no encontrada o sin acceso.'); setLoading(false); return; }
      if (sub.level !== enrollment.level) { setError('No tenés acceso a esta materia.'); setLoading(false); return; }

      setSubject(sub);
      const [mods, sRes, asgn] = await Promise.all([
        getPublishedModules(subjectId!).catch(() => []),
        getPublishedSubjectResources(subjectId!).catch(() => []),
        getSubjectAssignments(subjectId!).catch(() => []),
      ]);
      if (active) { setModules(mods); setSubjectResources(sRes); setAssignments(asgn); setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [subjectId]);

  if (loading) return <div className="min-h-screen bg-[#f0f2f7] flex items-center justify-center"><div className="w-7 h-7 border-2 border-brand/25 border-t-brand rounded-full animate-spin" /></div>;
  if (error) return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col items-center justify-center gap-4">
      <p className="text-red-600">{error}</p>
      <Link to="/campus" className="text-brand font-600 hover:underline">← Volver al campus</Link>
    </div>
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: 'contenido', label: 'Contenido' },
    { id: 'recursos', label: `Recursos${subjectResources.length ? ` (${subjectResources.length})` : ''}` },
    { id: 'tareas', label: `Tareas (${assignments.length})` },
    { id: 'profesor', label: 'Profesor' },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col">
      <header className="bg-navy-dark px-6 py-4">
        <Link to="/campus" className="inline-flex items-center gap-1.5 text-white/50 text-[12px] hover:text-white transition-colors mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Mi campus
        </Link>
        <h1 className="text-white text-xl font-800">{subject?.name}</h1>
        {subject?.professor_name && <p className="text-white/50 text-[13px] mt-0.5">Prof. {subject.professor_name}</p>}
      </header>

      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-3 text-[13px] font-500 whitespace-nowrap border-b-2 transition-all ${tab === t.id ? 'border-brand text-brand font-600' : 'border-transparent text-muted hover:text-navy'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {tab === 'contenido' && (
          <ContenidoTab subject={subject!} modules={modules} />
        )}
        {tab === 'recursos' && (
          <RecursosTab subjectResources={subjectResources} />
        )}
        {tab === 'tareas' && (
          <TareasTab assignments={assignments} studentId={studentId} />
        )}
        {tab === 'profesor' && (
          <ProfesorTab subject={subject!} />
        )}
      </div>
    </div>
  );
}

// ─── ContenidoTab ─────────────────────────────────────────────────────────────

function ContenidoTab({ subject, modules }: { subject: Subject; modules: Module[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [loadingModule, setLoadingModule] = useState<Record<string, boolean>>({});
  const [lessonRes, setLessonRes] = useState<Record<string, CampusResource[]>>({});

  async function toggleModule(m: Module) {
    const next = !expanded[m.id];
    setExpanded((e) => ({ ...e, [m.id]: next }));
    if (next && !lessons[m.id]) {
      setLoadingModule((l) => ({ ...l, [m.id]: true }));
      const [ls] = await Promise.all([
        getPublishedLessons(m.id).catch(() => []),
      ]);
      setLessons((prev) => ({ ...prev, [m.id]: ls }));
      setLoadingModule((l) => ({ ...l, [m.id]: false }));
    }
  }

  async function loadLessonResources(lessonId: string) {
    if (lessonRes[lessonId] !== undefined) return;
    const rs = await getPublishedLessonResources(lessonId).catch(() => []);
    setLessonRes((prev) => ({ ...prev, [lessonId]: rs }));
  }

  return (
    <div className="space-y-4">
      {subject.temario && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-700 text-brand uppercase tracking-widest mb-2">Temario</p>
          <p className="text-gray-600 text-[13px] leading-relaxed whitespace-pre-line">{subject.temario}</p>
        </div>
      )}
      {modules.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-muted text-[14px] border border-border shadow-sm">Aún no hay contenido publicado para esta materia.</div>
      ) : modules.map((m) => (
        <div key={m.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <button onClick={() => toggleModule(m)} className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-surface/50 transition-colors">
            <span className={`text-muted transition-transform ${expanded[m.id] ? 'rotate-90' : ''}`}>▶</span>
            <div className="flex-1 min-w-0">
              <p className="font-700 text-navy text-[14px]">{m.title}</p>
              {m.description && <p className="text-muted text-[12px] mt-0.5">{m.description}</p>}
            </div>
          </button>
          {expanded[m.id] && (
            <div className="border-t border-border">
              {loadingModule[m.id] ? (
                <div className="p-6 flex justify-center"><div className="w-5 h-5 border-2 border-brand/25 border-t-brand rounded-full animate-spin" /></div>
              ) : (lessons[m.id] ?? []).length === 0 ? (
                <p className="p-5 text-muted text-[13px]">Sin clases publicadas en este módulo.</p>
              ) : (lessons[m.id] ?? []).map((l) => (
                <LessonCard key={l.id} lesson={l} lessonRes={lessonRes} onView={() => loadLessonResources(l.id)} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function LessonCard({ lesson, lessonRes, onView }: { lesson: Lesson; lessonRes: Record<string, CampusResource[]>; onView(): void }) {
  const [open, setOpen] = useState(false);
  const ytId = lesson.youtube_url ? extractYouTubeId(lesson.youtube_url) : null;

  function toggle() {
    if (!open) onView();
    setOpen(!open);
  }

  return (
    <div className="border-t border-border first:border-t-0">
      <button onClick={toggle} className="w-full px-6 py-3.5 flex items-center gap-3 text-left hover:bg-surface/30 transition-colors">
        <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] font-700 flex items-center justify-center shrink-0">▶</span>
        <div className="flex-1 min-w-0">
          <p className="font-600 text-navy text-[13px]">{lesson.title}</p>
          {lesson.date && <p className="text-muted text-[11px]">{lesson.date}</p>}
        </div>
        <span className={`text-muted text-[11px] transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="px-6 pb-5 space-y-3">
          {ytId && (
            <div className="aspect-video rounded-lg overflow-hidden border border-border">
              <iframe src={`https://www.youtube.com/embed/${ytId}?origin=${encodeURIComponent(window.location.origin)}`} title={lesson.title} className="w-full h-full" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </div>
          )}
          {lesson.content && <p className="text-gray-600 text-[13px] leading-relaxed whitespace-pre-line">{lesson.content}</p>}
          {(lessonRes[lesson.id] ?? []).length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-700 text-muted uppercase tracking-wide">Recursos de esta clase</p>
              {(lessonRes[lesson.id] ?? []).map((r) => <ResourceItem key={r.id} r={r} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RecursosTab ──────────────────────────────────────────────────────────────

function RecursosTab({ subjectResources }: { subjectResources: CampusResource[] }) {
  return (
    <div className="space-y-3">
      {subjectResources.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-muted text-[14px] border border-border shadow-sm">No hay recursos disponibles para esta materia.</div>
      ) : subjectResources.map((r) => <ResourceItem key={r.id} r={r} card />)}
    </div>
  );
}

function ResourceItem({ r, card }: { r: CampusResource; card?: boolean }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function download() {
    if (!r.file_path) return;
    setLoading(true); setErr('');
    try { const u = await getResourceSignedUrl(r.file_path); setUrl(u); window.open(u, '_blank'); } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }

  const inner = (
    <>
      <div className="flex-1 min-w-0">
        <p className="font-600 text-navy text-[13px]">{r.title}</p>
        {r.description && <p className="text-muted text-[12px] mt-0.5">{r.description}</p>}
        {err && <p className="text-red-500 text-[11px] mt-1">{err}</p>}
      </div>
      {r.file_path && (
        <button onClick={download} disabled={loading} className="shrink-0 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-[12px] font-600 hover:bg-brand/20 transition-colors disabled:opacity-60">
          {loading ? '…' : '↓ Descargar'}
        </button>
      )}
      {r.external_url && !r.file_path && (
        <a href={r.external_url} target="_blank" rel="noopener noreferrer" className="shrink-0 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-[12px] font-600 hover:bg-brand/20 transition-colors">
          Abrir →
        </a>
      )}
    </>
  );

  if (card) return <div className="bg-white rounded-xl border border-border shadow-sm p-4 flex items-center gap-3">{inner}</div>;
  return <div className="flex items-center gap-3 pl-2">{inner}</div>;
}

// ─── TareasTab ────────────────────────────────────────────────────────────────

function TareasTab({ assignments, studentId }: { assignments: Assignment[]; studentId: string }) {
  return (
    <div className="space-y-5">
      {assignments.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-muted text-[14px] border border-border shadow-sm">Aún no hay tareas asignadas.</div>
      ) : assignments.map((a) => <AssignmentCard key={a.id} assignment={a} studentId={studentId} />)}
    </div>
  );
}

function AssignmentFileDownload({ filePath, fileName }: { filePath: string; fileName: string | null }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function download() {
    setLoading(true); setErr('');
    try { window.open(await getResourceSignedUrl(filePath), '_blank'); } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <button onClick={download} disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-navy text-[12px] font-600 hover:bg-border transition-colors disabled:opacity-60">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 16v-8m0 8l-3-3m3 3l3-3M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {loading ? 'Descargando…' : fileName ?? 'Descargar documento'}
      </button>
      {err && <p className="text-red-500 text-[11px]">{err}</p>}
    </div>
  );
}

function AssignmentCard({ assignment, studentId }: { assignment: Assignment; studentId: string }) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const isPastDue = assignment.due_date ? new Date(assignment.due_date) < new Date() : false;

  useEffect(() => {
    getMySubmission(assignment.id).then((s) => { setSubmission(s); if (s?.text_content) setText(s.text_content); }).finally(() => setLoadingSub(false));
  }, [assignment.id]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; setFileError('');
    if (!f) { setFile(null); return; }
    if (f.size > MAX_FILE_SIZE) { setFileError('El archivo supera los 10 MB.'); setFile(null); return; }
    if (!ALLOWED_TYPES.includes(f.type)) { setFileError(`Tipo no permitido. Aceptamos: ${ALLOWED_EXT}`); setFile(null); return; }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !file) { setSubmitError('Agregá texto o un archivo antes de enviar.'); return; }
    setSubmitting(true); setSubmitError('');
    const { error } = await submitAssignment({ assignmentId: assignment.id, studentId, textContent: text, file: file ?? undefined });
    if (error) { setSubmitError(error); setSubmitting(false); return; }
    const updated = await getMySubmission(assignment.id);
    setSubmission(updated); setExpanded(false); setSubmitting(false);
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-700 text-navy text-[15px]">{assignment.title}</p>
            {assignment.due_date && <p className={`text-[12px] mt-0.5 font-500 ${isPastDue ? 'text-red-500' : 'text-muted'}`}>📅 Entrega: {assignment.due_date}{isPastDue ? ' (vencida)' : ''}</p>}
          </div>
          {loadingSub ? <div className="w-4 h-4 border-2 border-brand/25 border-t-brand rounded-full animate-spin shrink-0" /> : (
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-700 ${submission ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
              {submission ? 'Entregada' : 'Pendiente'}
            </span>
          )}
        </div>
        {assignment.description && <p className="text-muted text-[13px] mt-2 leading-relaxed">{assignment.description}</p>}
        {assignment.file_path && (
          <AssignmentFileDownload filePath={assignment.file_path} fileName={assignment.file_name} />
        )}
        {submission && (
          <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
            <p className="text-[12px] text-green-700 font-600">Entregado el {new Date(submission.updated_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            {submission.text_content && <p className="text-[12px] text-gray-600 mt-1 line-clamp-2">{submission.text_content}</p>}
            {submission.file_name && <p className="text-[12px] text-gray-500 mt-1">📎 {submission.file_name}</p>}
          </div>
        )}
        {!isPastDue && (
          <button onClick={() => setExpanded(!expanded)} className="mt-3 px-4 py-2 rounded-lg bg-brand/10 text-brand text-[12px] font-600 hover:bg-brand/20 transition-colors">
            {submission ? 'Reemplazar entrega' : 'Entregar tarea'}
          </button>
        )}
      </div>
      {expanded && !isPastDue && (
        <form onSubmit={handleSubmit} className="border-t border-border p-5 space-y-3 bg-surface/40">
          <div>
            <label className="block text-[12px] font-600 text-text mb-1">Texto de respuesta</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:border-brand resize-y bg-white" placeholder="Escribí tu respuesta aquí..." />
          </div>
          <div>
            <label className="block text-[12px] font-600 text-text mb-1">Archivo adjunto <span className="text-muted font-400">(opcional — máx. 10 MB)</span></label>
            <input ref={fileRef} type="file" accept={ALLOWED_EXT} onChange={handleFileChange} className="block text-[13px] text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-600 file:bg-surface file:text-navy hover:file:bg-border cursor-pointer" />
            {fileError && <p className="text-red-600 text-[12px] mt-1">{fileError}</p>}
            {file && !fileError && <p className="text-green-600 text-[12px] mt-1">📎 {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
          </div>
          {submitError && <p className="text-red-600 text-[13px]">{submitError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-brand text-white text-[13px] font-600 hover:bg-brand-dark transition-colors disabled:opacity-60">{submitting ? 'Enviando...' : 'Enviar entrega'}</button>
            <button type="button" onClick={() => { setExpanded(false); setSubmitError(''); }} className="px-4 py-2 rounded-lg border border-border text-[13px] font-500 hover:bg-surface transition-colors">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── ProfesorTab ──────────────────────────────────────────────────────────────

function ProfesorTab({ subject }: { subject: Subject }) {
  if (!subject.professor_name) return <div className="bg-white rounded-2xl p-10 text-center text-muted text-[14px] border border-border shadow-sm">Información del profesor no disponible.</div>;
  return (
    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm max-w-lg">
      <p className="text-brand text-[11px] font-700 uppercase tracking-widest mb-1">Docente</p>
      <h3 className="text-navy text-xl font-800 mb-3">{subject.professor_name}</h3>
      {subject.professor_bio && <p className="text-gray-600 text-[14px] leading-relaxed mb-4">{subject.professor_bio}</p>}
      {subject.professor_email && (
        <a href={`mailto:${subject.professor_email}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-navy text-[13px] font-600 hover:bg-navy hover:text-white transition-all">
          ✉️ {subject.professor_email}
        </a>
      )}
    </div>
  );
}
