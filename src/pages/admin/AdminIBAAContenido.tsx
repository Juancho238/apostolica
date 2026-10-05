import { useEffect, useRef, useState } from 'react';
import {
  adminGetYears, adminGetSubjects, adminUpsertSubject, adminDeleteSubject,
  adminGetModules, adminUpsertModule, adminDeleteModule,
  adminGetLessons, adminUpsertLesson, adminDeleteLesson,
  adminGetResources, adminUpsertResource, adminDeleteResource, adminGetResourceUrl,
  adminGetAssignments, adminUpsertAssignment, adminDeleteAssignment,
  adminGetSubmissions, adminDeleteSubmission, adminGetFileUrl,
  LEVELS, RESOURCE_MAX_MB, RESOURCE_ALLOWED_EXT,
  type AcademicYear, type Level, type Subject, type Module, type Lesson, type CampusResource, type Assignment, type Submission, type Student,
} from '../../lib/campus';

// ─── Shared primitives ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'draft' | 'published' }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-700 ${status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
      {status === 'published' ? 'Publicado' : 'Borrador'}
    </span>
  );
}

function Spinner() { return <div className="w-5 h-5 border-2 border-brand/25 border-t-brand rounded-full animate-spin" />; }

function ErrMsg({ msg }: { msg: string }) {
  return msg ? <p className="text-red-600 text-[12px] rounded-lg bg-red-50 border border-red-100 px-3 py-2">{msg}</p> : null;
}

function OrderBtns({ onUp, onDown, disableUp, disableDown }: { onUp(): void; onDown(): void; disableUp: boolean; disableDown: boolean }) {
  return (
    <span className="flex flex-col gap-0.5">
      <button onClick={onUp} disabled={disableUp} className="p-0.5 text-muted hover:text-navy disabled:opacity-20">▲</button>
      <button onClick={onDown} disabled={disableDown} className="p-0.5 text-muted hover:text-navy disabled:opacity-20">▼</button>
    </span>
  );
}

async function swapOrder<T extends { id: string; sort_order: number }>(
  items: T[], i: number, j: number,
  upsertFn: (item: Partial<T>) => Promise<T>,
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
) {
  const a = items[i], b = items[j];
  await Promise.all([upsertFn({ id: a.id, sort_order: b.sort_order } as any), upsertFn({ id: b.id, sort_order: a.sort_order } as any)]);
  setItems((prev) => { const next = [...prev]; next[i] = { ...a, sort_order: b.sort_order }; next[j] = { ...b, sort_order: a.sort_order }; return next.sort((x, y) => x.sort_order - y.sort_order); });
}

// ─── Nav state ────────────────────────────────────────────────────────────────

type View = 'subjects' | 'subject-form' | 'modules' | 'module-form' | 'lessons' | 'lesson-form' | 'resources' | 'assignments';

interface NavState {
  view: View;
  subject: Subject | null;
  module: Module | null;
  lesson: Lesson | null;
  editId: string | null;
  resourceFor: { subjectId?: string; lessonId?: string; label: string } | null;
}

const INIT: NavState = { view: 'subjects', subject: null, module: null, lesson: null, editId: null, resourceFor: null };

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminIBAAContenido() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [yearId, setYearId] = useState('');
  const [level, setLevel] = useState<Level>('Nivel I');
  const [nav, setNav] = useState<NavState>(INIT);

  useEffect(() => {
    adminGetYears().then((ys) => {
      setYears(ys);
      const current = ys.find((y) => y.is_current) ?? ys[0];
      if (current) setYearId(current.id);
    });
  }, []);

  function goTo(view: View, patch: Partial<NavState> = {}) { setNav((n) => ({ ...n, view, editId: null, ...patch })); }

  const crumbs: { label: string; onClick: () => void }[] = [{ label: 'Materias', onClick: () => goTo('subjects', { subject: null, module: null, lesson: null }) }];
  if (nav.subject) crumbs.push({ label: nav.subject.name, onClick: () => goTo('modules', { module: null, lesson: null }) });
  if (nav.module) crumbs.push({ label: nav.module.title, onClick: () => goTo('lessons', { lesson: null }) });
  if (nav.lesson && nav.view === 'lesson-form') crumbs.push({ label: nav.lesson.title || 'Nueva clase', onClick: () => {} });
  if (nav.view === 'resources') crumbs.push({ label: `Recursos — ${nav.resourceFor?.label}`, onClick: () => {} });
  if (nav.view === 'assignments' && nav.subject) crumbs.push({ label: `Tareas — ${nav.subject.name}`, onClick: () => {} });

  const selectedYear = years.find((y) => y.id === yearId);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-800 text-navy">IBAA – Contenido</h1>
        <p className="text-muted text-[13px] mt-1">Administrá materias, módulos, clases y recursos del campus.</p>
      </div>

      {/* Year + Level selector */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-border rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-[12px] font-600 text-muted">Año:</label>
          <select value={yearId} onChange={(e) => { setYearId(e.target.value); goTo('subjects', { subject: null, module: null, lesson: null }); }} className="input py-1.5 w-auto pr-8">
            {years.map((y) => <option key={y.id} value={y.id}>{y.year}{y.is_current ? ' (actual)' : ''}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[12px] font-600 text-muted">Nivel:</label>
          <select value={level} onChange={(e) => { setLevel(e.target.value as Level); goTo('subjects', { subject: null, module: null, lesson: null }); }} className="input py-1.5 w-auto pr-8">
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        {selectedYear && <span className="ml-auto text-[11px] text-muted">{level} · {selectedYear.year}</span>}
      </div>

      {/* Breadcrumb */}
      {crumbs.length > 1 && (
        <nav className="flex items-center gap-1.5 text-[12px]">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-muted">/</span>}
              <button onClick={c.onClick} className={i < crumbs.length - 1 ? 'text-brand hover:underline font-500' : 'text-navy font-600 pointer-events-none'}>
                {c.label}
              </button>
            </span>
          ))}
        </nav>
      )}

      {/* Views */}
      {!yearId ? (
        <p className="text-muted text-[13px]">Cargando años lectivos…</p>
      ) : nav.view === 'subjects' ? (
        <SubjectList yearId={yearId} level={level} nav={nav} setNav={setNav} goTo={goTo} />
      ) : nav.view === 'subject-form' ? (
        <SubjectForm yearId={yearId} level={level} editId={nav.editId} onDone={() => goTo('subjects')} />
      ) : nav.view === 'modules' && nav.subject ? (
        <ModuleList subject={nav.subject} nav={nav} setNav={setNav} goTo={goTo} />
      ) : nav.view === 'module-form' && nav.subject ? (
        <ModuleForm subjectId={nav.subject.id} editId={nav.editId} onDone={() => goTo('modules')} />
      ) : nav.view === 'lessons' && nav.module ? (
        <LessonList module={nav.module} nav={nav} setNav={setNav} goTo={goTo} />
      ) : nav.view === 'lesson-form' && nav.module ? (
        <LessonForm moduleId={nav.module.id} editId={nav.editId} onDone={() => goTo('lessons')} />
      ) : nav.view === 'resources' && nav.resourceFor ? (
        <ResourceList filter={nav.resourceFor} onBack={() => nav.subject ? goTo(nav.lesson ? 'lesson-form' : 'modules') : goTo('subjects')} />
      ) : nav.view === 'assignments' && nav.subject ? (
        <AssignmentList subject={nav.subject} onBack={() => goTo('modules')} />
      ) : null}
    </div>
  );
}

// ─── SubjectList ──────────────────────────────────────────────────────────────

function SubjectList({ yearId, level, nav, setNav, goTo }: { yearId: string; level: Level; nav: NavState; setNav: any; goTo: any }) {
  const [items, setItems] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    try { setItems(await adminGetSubjects(yearId, level)); } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [yearId, level]);

  async function toggleStatus(s: Subject) {
    try { await adminUpsertSubject({ id: s.id, status: s.status === 'published' ? 'draft' : 'published' }); await load(); } catch (e: any) { setErr(e.message); }
  }
  async function del(s: Subject) {
    if (!confirm(`¿Eliminar "${s.name}"?`)) return;
    try { await adminDeleteSubject(s.id); await load(); } catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-800 text-navy text-[15px]">Materias</h2>
        <button onClick={() => goTo('subject-form')} className="btn-primary text-[12px] px-3 py-1.5">+ Nueva materia</button>
      </div>
      {loading ? <div className="p-8 flex justify-center"><Spinner /></div> : (
        <>
          <ErrMsg msg={err} />
          {items.length === 0 ? (
            <p className="p-6 text-muted text-[13px]">No hay materias para este nivel y año. Creá la primera.</p>
          ) : (
            <div className="divide-y divide-border">
              {items.map((s, i) => (
                <div key={s.id} className="px-6 py-4 flex items-center gap-3">
                  <OrderBtns disableUp={i === 0} disableDown={i === items.length - 1}
                    onUp={() => swapOrder(items, i, i - 1, (m) => adminUpsertSubject(m as any), setItems)}
                    onDown={() => swapOrder(items, i, i + 1, (m) => adminUpsertSubject(m as any), setItems)} />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => goTo('modules', { subject: s })}>
                    <p className="font-600 text-navy text-[14px] hover:text-brand transition-colors">{s.name}</p>
                    {s.professor_name && <p className="text-muted text-[12px]">Prof. {s.professor_name}</p>}
                  </div>
                  <StatusBadge status={s.status} />
                  <div className="flex items-center gap-1 shrink-0">
                    <Btn label="Recursos" small onClick={() => goTo('resources', { subject: s, resourceFor: { subjectId: s.id, label: s.name } })} />
                    <Btn label="Editar" small onClick={() => goTo('subject-form', { subject: s, editId: s.id })} />
                    <Btn label={s.status === 'published' ? 'Borrador' : 'Publicar'} small onClick={() => toggleStatus(s)} />
                    <Btn label="Eliminar" small danger onClick={() => del(s)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── SubjectForm ──────────────────────────────────────────────────────────────

function SubjectForm({ yearId, level, editId, onDone }: { yearId: string; level: Level; editId: string | null; onDone(): void }) {
  const [form, setForm] = useState({ name: '', description: '', temario: '', professor_name: '', professor_bio: '', professor_email: '', status: 'draft' as 'draft' | 'published' });
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!editId) return;
    adminGetSubjects(yearId, level).then((ss) => {
      const s = ss.find((x) => x.id === editId);
      if (s) setForm({ name: s.name, description: s.description ?? '', temario: s.temario ?? '', professor_name: s.professor_name ?? '', professor_bio: s.professor_bio ?? '', professor_email: s.professor_email ?? '', status: s.status });
      setLoading(false);
    });
  }, [editId]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      await adminUpsertSubject({
        ...(editId ? { id: editId } : {}),
        academic_year_id: yearId, level,
        name: form.name, description: form.description || null, temario: form.temario || null,
        professor_name: form.professor_name || null, professor_bio: form.professor_bio || null, professor_email: form.professor_email || null,
        status: form.status, sort_order: 0,
      });
      onDone();
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;

  return (
    <form onSubmit={save} className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
      <h2 className="font-800 text-navy text-[15px]">{editId ? 'Editar materia' : 'Nueva materia'}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="form-label">Nombre *</label>
          <input value={form.name} onChange={set('name')} required className="input" placeholder="Doctrina Bíblica" />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Descripción breve</label>
          <textarea value={form.description} onChange={set('description')} rows={2} className="input resize-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Temario</label>
          <textarea value={form.temario} onChange={set('temario')} rows={5} className="input resize-y" placeholder="Unidades, temas y bibliografía..." />
        </div>
        <div>
          <label className="form-label">Nombre del profesor</label>
          <input value={form.professor_name} onChange={set('professor_name')} className="input" />
        </div>
        <div>
          <label className="form-label">Correo del profesor</label>
          <input type="email" value={form.professor_email} onChange={set('professor_email')} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Presentación del profesor</label>
          <textarea value={form.professor_bio} onChange={set('professor_bio')} rows={3} className="input resize-none" />
        </div>
        <div>
          <label className="form-label">Estado</label>
          <select value={form.status} onChange={set('status')} className="input">
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>
      </div>
      <ErrMsg msg={err} />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" onClick={onDone} className="btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}

// ─── ModuleList ───────────────────────────────────────────────────────────────

function ModuleList({ subject, nav, setNav, goTo }: { subject: Subject; nav: NavState; setNav: any; goTo: any }) {
  const [items, setItems] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    try { setItems(await adminGetModules(subject.id)); } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [subject.id]);

  async function toggleStatus(m: Module) {
    try { await adminUpsertModule({ id: m.id, status: m.status === 'published' ? 'draft' : 'published' }); await load(); } catch (e: any) { setErr(e.message); }
  }
  async function del(m: Module) {
    if (!confirm(`¿Eliminar módulo "${m.title}"?`)) return;
    try { await adminDeleteModule(m.id); await load(); } catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-800 text-navy text-[15px]">Módulos</h2>
          <p className="text-muted text-[12px]">{subject.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => goTo('assignments', { subject })} className="btn-secondary text-[12px] px-3 py-1.5">📋 Tareas</button>
          <button onClick={() => goTo('subject-form', { editId: subject.id })} className="btn-secondary text-[12px] px-3 py-1.5">Editar materia</button>
          <button onClick={() => goTo('module-form')} className="btn-primary text-[12px] px-3 py-1.5">+ Nuevo módulo</button>
        </div>
      </div>
      {loading ? <div className="p-8 flex justify-center"><Spinner /></div> : (
        <>
          <ErrMsg msg={err} />
          {items.length === 0 ? <p className="p-6 text-muted text-[13px]">Sin módulos aún. Creá el primero.</p> : (
            <div className="divide-y divide-border">
              {items.map((m, i) => (
                <div key={m.id} className="px-6 py-4 flex items-center gap-3">
                  <OrderBtns disableUp={i === 0} disableDown={i === items.length - 1}
                    onUp={() => swapOrder(items, i, i - 1, (x) => adminUpsertModule(x as any), setItems)}
                    onDown={() => swapOrder(items, i, i + 1, (x) => adminUpsertModule(x as any), setItems)} />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => goTo('lessons', { module: m })}>
                    <p className="font-600 text-navy text-[14px] hover:text-brand transition-colors">{m.title}</p>
                    {m.description && <p className="text-muted text-[12px] truncate">{m.description}</p>}
                  </div>
                  <StatusBadge status={m.status} />
                  <div className="flex items-center gap-1 shrink-0">
                    <Btn label="Editar" small onClick={() => goTo('module-form', { module: m, editId: m.id })} />
                    <Btn label={m.status === 'published' ? 'Borrador' : 'Publicar'} small onClick={() => toggleStatus(m)} />
                    <Btn label="Eliminar" small danger onClick={() => del(m)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── ModuleForm ───────────────────────────────────────────────────────────────

function ModuleForm({ subjectId, editId, onDone }: { subjectId: string; editId: string | null; onDone(): void }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'draft' as 'draft' | 'published' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!editId) return;
    adminGetModules(subjectId).then((ms) => {
      const m = ms.find((x) => x.id === editId);
      if (m) setForm({ title: m.title, description: m.description ?? '', status: m.status });
    });
  }, [editId]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      await adminUpsertModule({ ...(editId ? { id: editId } : {}), subject_id: subjectId, title: form.title, description: form.description || null, status: form.status, sort_order: 0 });
      onDone();
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={save} className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
      <h2 className="font-800 text-navy text-[15px]">{editId ? 'Editar módulo' : 'Nuevo módulo'}</h2>
      <div>
        <label className="form-label">Título *</label>
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required className="input" />
      </div>
      <div>
        <label className="form-label">Descripción</label>
        <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="input resize-none" />
      </div>
      <div>
        <label className="form-label">Estado</label>
        <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} className="input">
          <option value="draft">Borrador</option><option value="published">Publicado</option>
        </select>
      </div>
      <ErrMsg msg={err} />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" onClick={onDone} className="btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}

// ─── LessonList ───────────────────────────────────────────────────────────────

function LessonList({ module, nav, setNav, goTo }: { module: Module; nav: NavState; setNav: any; goTo: any }) {
  const [items, setItems] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    try { setItems(await adminGetLessons(module.id)); } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [module.id]);

  async function toggleStatus(l: Lesson) {
    try { await adminUpsertLesson({ id: l.id, status: l.status === 'published' ? 'draft' : 'published' }); await load(); } catch (e: any) { setErr(e.message); }
  }
  async function del(l: Lesson) {
    if (!confirm(`¿Eliminar clase "${l.title}"?`)) return;
    try { await adminDeleteLesson(l.id); await load(); } catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-800 text-navy text-[15px]">Clases</h2>
          <p className="text-muted text-[12px]">{module.title}</p>
        </div>
        <button onClick={() => goTo('lesson-form')} className="btn-primary text-[12px] px-3 py-1.5">+ Nueva clase</button>
      </div>
      {loading ? <div className="p-8 flex justify-center"><Spinner /></div> : (
        <>
          <ErrMsg msg={err} />
          {items.length === 0 ? <p className="p-6 text-muted text-[13px]">Sin clases aún. Creá la primera.</p> : (
            <div className="divide-y divide-border">
              {items.map((l, i) => (
                <div key={l.id} className="px-6 py-4 flex items-center gap-3">
                  <OrderBtns disableUp={i === 0} disableDown={i === items.length - 1}
                    onUp={() => swapOrder(items, i, i - 1, (x) => adminUpsertLesson(x as any), setItems)}
                    onDown={() => swapOrder(items, i, i + 1, (x) => adminUpsertLesson(x as any), setItems)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-600 text-navy text-[14px]">{l.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {l.date && <span className="text-muted text-[11px]">📅 {l.date}</span>}
                      {l.youtube_url && <span className="text-muted text-[11px]">▶ Video</span>}
                    </div>
                  </div>
                  <StatusBadge status={l.status} />
                  <div className="flex items-center gap-1 shrink-0">
                    <Btn label="Recursos" small onClick={() => goTo('resources', { lesson: l, resourceFor: { lessonId: l.id, label: l.title } })} />
                    <Btn label="Editar" small onClick={() => goTo('lesson-form', { lesson: l, editId: l.id })} />
                    <Btn label={l.status === 'published' ? 'Borrador' : 'Publicar'} small onClick={() => toggleStatus(l)} />
                    <Btn label="Eliminar" small danger onClick={() => del(l)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── LessonForm ───────────────────────────────────────────────────────────────

function LessonForm({ moduleId, editId, onDone }: { moduleId: string; editId: string | null; onDone(): void }) {
  const [form, setForm] = useState({ title: '', date: '', content: '', youtube_url: '', status: 'draft' as 'draft' | 'published' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!editId) return;
    adminGetLessons(moduleId).then((ls) => {
      const l = ls.find((x) => x.id === editId);
      if (l) setForm({ title: l.title, date: l.date ?? '', content: l.content ?? '', youtube_url: l.youtube_url ?? '', status: l.status });
    });
  }, [editId]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      await adminUpsertLesson({ ...(editId ? { id: editId } : {}), module_id: moduleId, title: form.title, date: form.date || null, content: form.content || null, youtube_url: form.youtube_url || null, status: form.status, sort_order: 0 });
      onDone();
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // YouTube preview
  function ytId(url: string) { const m = url.match(/(?:[?&]v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/); return m?.[1] ?? null; }
  const preview = ytId(form.youtube_url);

  return (
    <form onSubmit={save} className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
      <h2 className="font-800 text-navy text-[15px]">{editId ? 'Editar clase' : 'Nueva clase'}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="form-label">Título *</label>
          <input value={form.title} onChange={set('title')} required className="input" />
        </div>
        <div>
          <label className="form-label">Fecha</label>
          <input type="date" value={form.date} onChange={set('date')} className="input" />
        </div>
        <div>
          <label className="form-label">Estado</label>
          <select value={form.status} onChange={set('status')} className="input">
            <option value="draft">Borrador</option><option value="published">Publicado</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">URL de grabación (YouTube) <span className="text-muted font-400">— opcional</span></label>
          <input value={form.youtube_url} onChange={set('youtube_url')} className="input" placeholder="https://youtu.be/..." />
          <p className="text-muted text-[11px] mt-1">Podés agregar o cambiar el video después de publicar la clase.</p>
        </div>
        {preview && (
          <div className="sm:col-span-2">
            <div className="aspect-video rounded-lg overflow-hidden border border-border">
              <iframe src={`https://www.youtube.com/embed/${preview}?origin=${encodeURIComponent(window.location.origin)}`} className="w-full h-full" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </div>
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="form-label">Contenido escrito <span className="text-muted font-400">— opcional</span></label>
          <textarea value={form.content} onChange={set('content')} rows={8} className="input resize-y" placeholder="Notas de clase, transcripción, desarrollo del tema…" />
        </div>
      </div>
      <ErrMsg msg={err} />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" onClick={onDone} className="btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}

// ─── ResourceList ─────────────────────────────────────────────────────────────

function ResourceList({ filter, onBack }: { filter: { subjectId?: string; lessonId?: string; label: string }; onBack(): void }) {
  const [items, setItems] = useState<CampusResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<CampusResource | null>(null);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    try { setItems(await adminGetResources(filter)); } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [filter.subjectId, filter.lessonId]);

  async function toggleStatus(r: CampusResource) {
    try { await adminUpsertResource({ id: r.id, status: r.status === 'published' ? 'draft' : 'published' }); await load(); } catch (e: any) { setErr(e.message); }
  }
  async function del(r: CampusResource) {
    if (!confirm(`¿Eliminar recurso "${r.title}"?`)) return;
    try { await adminDeleteResource(r); await load(); } catch (e: any) { setErr(e.message); }
  }
  async function openFile(r: CampusResource) {
    try { window.open(await adminGetResourceUrl(r.file_path!), '_blank'); } catch (e: any) { setErr(e.message); }
  }

  if (showForm || editItem) {
    return <ResourceForm filter={filter} editItem={editItem} onDone={() => { setShowForm(false); setEditItem(null); load(); }} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-800 text-navy text-[15px]">Recursos</h2>
          <p className="text-muted text-[12px]">{filter.label}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-[12px] px-3 py-1.5">+ Nuevo recurso</button>
      </div>
      {loading ? <div className="p-8 flex justify-center"><Spinner /></div> : (
        <>
          <ErrMsg msg={err} />
          {items.length === 0 ? <p className="p-6 text-muted text-[13px]">Sin recursos aún. Creá el primero.</p> : (
            <div className="divide-y divide-border">
              {items.map((r, i) => (
                <div key={r.id} className="px-6 py-4 flex items-center gap-3">
                  <OrderBtns disableUp={i === 0} disableDown={i === items.length - 1}
                    onUp={() => swapOrder(items, i, i - 1, (x) => adminUpsertResource(x as any), setItems)}
                    onDown={() => swapOrder(items, i, i + 1, (x) => adminUpsertResource(x as any), setItems)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-600 text-navy text-[14px]">{r.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {r.file_name && <span className="text-muted text-[11px]">📎 {r.file_name} {r.file_size ? `(${(r.file_size / 1024).toFixed(0)} KB)` : ''}</span>}
                      {r.external_url && <span className="text-muted text-[11px]">🔗 Enlace externo</span>}
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                  <div className="flex items-center gap-1 shrink-0">
                    {r.file_path && <Btn label="Ver archivo" small onClick={() => openFile(r)} />}
                    <Btn label="Editar" small onClick={() => setEditItem(r)} />
                    <Btn label={r.status === 'published' ? 'Borrador' : 'Publicar'} small onClick={() => toggleStatus(r)} />
                    <Btn label="Eliminar" small danger onClick={() => del(r)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── ResourceForm ─────────────────────────────────────────────────────────────

function ResourceForm({ filter, editItem, onDone }: { filter: { subjectId?: string; lessonId?: string }; editItem: CampusResource | null; onDone(): void }) {
  const [form, setForm] = useState({ title: '', description: '', external_url: '', status: 'draft' as 'draft' | 'published' });
  const [file, setFile] = useState<File | null>(null);
  const [fileErr, setFileErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editItem) setForm({ title: editItem.title, description: editItem.description ?? '', external_url: editItem.external_url ?? '', status: editItem.status });
  }, [editItem]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; setFileErr('');
    if (!f) { setFile(null); return; }
    if (f.size > RESOURCE_MAX_MB * 1024 * 1024) { setFileErr(`El archivo supera los ${RESOURCE_MAX_MB} MB.`); return; }
    setFile(f);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      const payload: Partial<CampusResource> = {
        ...(editItem ? { id: editItem.id } : {}),
        subject_id: filter.subjectId ?? null,
        lesson_id: filter.lessonId ?? null,
        title: form.title, description: form.description || null,
        external_url: form.external_url || null,
        status: form.status, sort_order: editItem?.sort_order ?? 0,
      };
      await adminUpsertResource(payload, file ?? undefined);
      onDone();
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={save} className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
      <h2 className="font-800 text-navy text-[15px]">{editItem ? 'Editar recurso' : 'Nuevo recurso'}</h2>
      <div>
        <label className="form-label">Título *</label>
        <input value={form.title} onChange={set('title')} required className="input" />
      </div>
      <div>
        <label className="form-label">Descripción <span className="text-muted font-400">— opcional</span></label>
        <textarea value={form.description} onChange={set('description')} rows={2} className="input resize-none" />
      </div>
      <div>
        <label className="form-label">Enlace externo <span className="text-muted font-400">— opcional</span></label>
        <input value={form.external_url} onChange={set('external_url')} className="input" placeholder="https://..." />
      </div>
      <div>
        <label className="form-label">Archivo <span className="text-muted font-400">— opcional, máx. {RESOURCE_MAX_MB} MB</span></label>
        <p className="text-[11px] text-muted mb-1.5">Aceptamos: {RESOURCE_ALLOWED_EXT}</p>
        {editItem?.file_name && <p className="text-[12px] text-muted mb-1.5">Archivo actual: {editItem.file_name}. Subí uno nuevo para reemplazarlo.</p>}
        <input ref={fileRef} type="file" accept={RESOURCE_ALLOWED_EXT} onChange={handleFile} className="block text-[13px] text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-600 file:bg-surface file:text-navy hover:file:bg-border cursor-pointer" />
        {fileErr && <p className="text-red-600 text-[12px] mt-1">{fileErr}</p>}
        {file && !fileErr && <p className="text-green-600 text-[12px] mt-1">📎 {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
      </div>
      <div>
        <label className="form-label">Estado</label>
        <select value={form.status} onChange={set('status')} className="input">
          <option value="draft">Borrador</option><option value="published">Publicado</option>
        </select>
      </div>
      <ErrMsg msg={err} />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" onClick={onDone} className="btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}

// ─── SubmissionPanel ──────────────────────────────────────────────────────────

function SubmissionPanel({ assignment }: { assignment: Assignment }) {
  const [subs, setSubs] = useState<(Submission & { student: Student })[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true); setErr('');
    try { setSubs(await adminGetSubmissions(assignment.id)); } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [assignment.id]);

  async function openFile(sub: Submission & { student: Student }) {
    try { window.open(await adminGetFileUrl(sub.file_path!), '_blank'); } catch (e: any) { setErr(e.message); }
  }

  async function del(sub: Submission & { student: Student }) {
    if (!confirm(`¿Eliminar la entrega de ${sub.student.first_name} ${sub.student.last_name}?`)) return;
    setDeleting(sub.id);
    try { await adminDeleteSubmission(sub.id, sub.file_path); await load(); } catch (e: any) { setErr(e.message); } finally { setDeleting(null); }
  }

  return (
    <div className="mx-6 mb-4 bg-surface rounded-xl border border-border">
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <p className="text-[12px] font-700 text-navy">Entregas ({subs.length})</p>
        <button onClick={load} className="text-[11px] text-muted hover:text-navy transition-colors">↻ Actualizar</button>
      </div>
      {loading ? (
        <div className="py-4 flex justify-center"><Spinner /></div>
      ) : (
        <>
          {err && <div className="px-4 py-2"><ErrMsg msg={err} /></div>}
          {subs.length === 0 ? (
            <p className="px-4 py-3 text-muted text-[12px]">Aún no hay entregas para esta tarea.</p>
          ) : (
            <div className="divide-y divide-border">
              {subs.map((sub) => (
                <div key={sub.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-600 text-navy text-[13px]">{sub.student.first_name} {sub.student.last_name}</p>
                    <p className="text-muted text-[11px]">{sub.student.email}</p>
                    <p className="text-muted text-[11px] mt-0.5">
                      {new Date(sub.submitted_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                      {sub.updated_at !== sub.submitted_at && ' (editada)'}
                    </p>
                    {sub.text_content && (
                      <p className="text-[12px] text-navy mt-1 bg-white border border-border rounded-lg px-3 py-2 max-h-24 overflow-y-auto whitespace-pre-wrap">{sub.text_content}</p>
                    )}
                    {sub.file_path && (
                      <button onClick={() => openFile(sub)} className="mt-1.5 text-[11px] text-brand hover:underline font-500">
                        📎 {sub.file_name ?? 'Ver archivo'}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => del(sub)}
                    disabled={deleting === sub.id}
                    className="shrink-0 mt-0.5 px-2.5 py-1 rounded-lg border border-red-200 text-red-600 text-[11px] font-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                  >
                    {deleting === sub.id ? '…' : 'Eliminar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── AssignmentList ───────────────────────────────────────────────────────────

function AssignmentList({ subject, onBack }: { subject: Subject; onBack(): void }) {
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Assignment | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    try { setItems(await adminGetAssignments(subject.id)); } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [subject.id]);

  async function del(a: Assignment) {
    if (!confirm(`¿Eliminar la tarea "${a.title}"?`)) return;
    try { await adminDeleteAssignment(a.id!); await load(); } catch (e: any) { setErr(e.message); }
  }

  if (showForm || editItem) {
    return <AssignmentForm subjectId={subject.id} editItem={editItem} onDone={() => { setShowForm(false); setEditItem(null); load(); }} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-800 text-navy text-[15px]">Tareas</h2>
          <p className="text-muted text-[12px]">{subject.name}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-[12px] px-3 py-1.5">+ Nueva tarea</button>
      </div>
      {loading ? <div className="p-8 flex justify-center"><Spinner /></div> : (
        <>
          {err && <div className="px-6 pt-3"><ErrMsg msg={err} /></div>}
          {items.length === 0 ? (
            <p className="p-6 text-muted text-[13px]">Sin tareas aún. Creá la primera con el botón de arriba.</p>
          ) : (
            <div className="divide-y divide-border">
              {items.map((a) => (
                <div key={a.id}>
                  <div className="px-6 py-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-600 text-navy text-[14px]">{a.title}</p>
                      {a.description && <p className="text-muted text-[13px] mt-0.5 line-clamp-2">{a.description}</p>}
                      {a.due_date && (
                        <p className={`text-[12px] mt-1 font-500 ${new Date(a.due_date) < new Date() ? 'text-red-500' : 'text-muted'}`}>
                          📅 Fecha de entrega: {a.due_date}
                        </p>
                      )}
                      {a.file_name && <p className="text-[11px] text-muted mt-0.5">📎 {a.file_name}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      <button
                        onClick={() => setExpandedId(expandedId === a.id ? null : a.id!)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-500 transition-colors ${expandedId === a.id ? 'bg-brand/10 border-brand/30 text-brand' : 'border-border text-muted hover:bg-surface hover:text-navy'}`}
                      >
                        {expandedId === a.id ? '▲ Ocultar' : '▼ Entregas'}
                      </button>
                      <Btn label="Editar" small onClick={() => setEditItem(a)} />
                      <Btn label="Eliminar" small danger onClick={() => del(a)} />
                    </div>
                  </div>
                  {expandedId === a.id && <SubmissionPanel assignment={a} />}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── AssignmentForm ───────────────────────────────────────────────────────────

function AssignmentForm({ subjectId, editItem, onDone }: { subjectId: string; editItem: Assignment | null; onDone(): void }) {
  const [form, setForm] = useState({ title: '', description: '', due_date: '' });
  const [file, setFile] = useState<File | null>(null);
  const [fileErr, setFileErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editItem) setForm({ title: editItem.title, description: editItem.description ?? '', due_date: editItem.due_date ?? '' });
  }, [editItem]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; setFileErr('');
    if (!f) { setFile(null); return; }
    if (f.size > RESOURCE_MAX_MB * 1024 * 1024) { setFileErr(`El archivo supera los ${RESOURCE_MAX_MB} MB.`); return; }
    setFile(f);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      await adminUpsertAssignment({
        ...(editItem ? { id: editItem.id } : {}),
        subject_id: subjectId,
        title: form.title,
        description: form.description || null,
        due_date: form.due_date || null,
      }, file ?? undefined);
      onDone();
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={save} className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
      <h2 className="font-800 text-navy text-[15px]">{editItem ? 'Editar tarea' : 'Nueva tarea'}</h2>
      <div>
        <label className="form-label">Título *</label>
        <input value={form.title} onChange={set('title')} required className="input" placeholder="Trabajo práctico 1" />
      </div>
      <div>
        <label className="form-label">Consigna <span className="text-muted font-400">— opcional</span></label>
        <textarea value={form.description} onChange={set('description')} rows={5} className="input resize-y" placeholder="Descripción detallada de lo que el alumno debe entregar…" />
      </div>
      <div className="max-w-xs">
        <label className="form-label">Fecha de entrega <span className="text-muted font-400">— opcional</span></label>
        <input type="date" value={form.due_date} onChange={set('due_date')} className="input" />
        <p className="text-muted text-[11px] mt-1">Sin fecha, la tarea no tiene vencimiento.</p>
      </div>
      <div>
        <label className="form-label">Documento adjunto <span className="text-muted font-400">— opcional, máx. {RESOURCE_MAX_MB} MB</span></label>
        <p className="text-[11px] text-muted mb-1.5">Aceptamos: {RESOURCE_ALLOWED_EXT}</p>
        {editItem?.file_name && (
          <p className="text-[12px] text-muted mb-1.5">Archivo actual: <span className="font-600 text-navy">{editItem.file_name}</span>. Subí uno nuevo para reemplazarlo.</p>
        )}
        <input ref={fileRef} type="file" accept={RESOURCE_ALLOWED_EXT} onChange={handleFile}
          className="block text-[13px] text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-600 file:bg-surface file:text-navy hover:file:bg-border cursor-pointer" />
        {fileErr && <p className="text-red-600 text-[12px] mt-1">{fileErr}</p>}
        {file && !fileErr && <p className="text-green-600 text-[12px] mt-1">📎 {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
      </div>
      <ErrMsg msg={err} />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar tarea'}</button>
        <button type="button" onClick={onDone} className="btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}

// ─── Utility button ───────────────────────────────────────────────────────────

function Btn({ label, onClick, small, danger }: { label: string; onClick(): void; small?: boolean; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`rounded-lg border font-500 transition-colors whitespace-nowrap ${small ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-[12px]'} ${danger ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-border text-muted hover:bg-surface hover:text-navy'}`}>
      {label}
    </button>
  );
}
