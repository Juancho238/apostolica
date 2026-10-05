import { supabase } from './supabase';

export type Level = 'Nivel I' | 'Nivel II' | 'Nivel III' | 'Teología Ministerial';
export const LEVELS: Level[] = ['Nivel I', 'Nivel II', 'Nivel III', 'Teología Ministerial'];

export interface AcademicYear { id: string; year: number; is_current: boolean; }
export interface Student { id: string; user_id: string; first_name: string; last_name: string; email: string; status: 'active' | 'inactive'; }
export interface Enrollment { id: string; student_id: string; academic_year_id: string; level: Level; status: 'active' | 'inactive'; }

export interface Subject {
  id: string; level: Level; academic_year_id: string; name: string;
  description: string | null; temario: string | null;
  professor_name: string | null; professor_bio: string | null; professor_email: string | null;
  sort_order: number; status: 'draft' | 'published';
}
export interface Module { id: string; subject_id: string; title: string; description: string | null; sort_order: number; status: 'draft' | 'published'; }
export interface Lesson { id: string; module_id: string; title: string; date: string | null; content: string | null; youtube_url: string | null; sort_order: number; status: 'draft' | 'published'; }
export interface CampusResource { id: string; subject_id: string | null; lesson_id: string | null; title: string; description: string | null; file_path: string | null; file_name: string | null; file_size: number | null; external_url: string | null; sort_order: number; status: 'draft' | 'published'; }

// Legacy interfaces kept for ibaa_assignments compatibility
export interface SyllabusItem { id: string; subject_id: string; title: string; description: string | null; material_url: string | null; sort_order: number; }
export interface Recording { id: string; subject_id: string; title: string; youtube_url: string; recorded_date: string | null; sort_order: number; }
export interface Assignment { id: string; subject_id: string; title: string; description: string | null; due_date: string | null; file_path: string | null; file_name: string | null; file_size: number | null; }
export interface Submission { id: string; assignment_id: string; student_id: string; text_content: string | null; file_path: string | null; file_name: string | null; file_size: number | null; submitted_at: string; updated_at: string; }

const RESOURCE_BUCKET = 'ibaa-resources';
export const RESOURCE_MAX_MB = 20;
export const RESOURCE_ALLOWED_EXT = '.pdf, .doc, .docx, .ppt, .pptx, .jpg, .jpeg, .png, .webp';
const RESOURCE_ALLOWED_TYPES = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','image/jpeg','image/png','image/webp'];

// ─── Student: auth context ────────────────────────────────────────────────────

export async function getMyContext(): Promise<{ student: Student | null; year: AcademicYear | null; enrollment: Enrollment | null; error?: string; }> {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { student: null, year: null, enrollment: null, error: 'Sin sesión.' };
  const { data: student, error: sErr } = await supabase.from('ibaa_students').select('*').eq('user_id', user.id).maybeSingle();
  if (sErr) return { student: null, year: null, enrollment: null, error: sErr.message };
  if (!student) return { student: null, year: null, enrollment: null, error: 'Sin perfil de alumno.' };
  const { data: year } = await supabase.from('ibaa_academic_years').select('*').eq('is_current', true).maybeSingle();
  if (!year) return { student, year: null, enrollment: null };
  const { data: enrollment } = await supabase.from('ibaa_enrollments').select('*').eq('student_id', student.id).eq('academic_year_id', year.id).eq('status', 'active').maybeSingle();
  return { student, year, enrollment: enrollment ?? null };
}

// ─── Student: content (published only, filtered by RLS) ──────────────────────

export async function getSubjectsByLevelYear(level: Level, yearId: string): Promise<Subject[]> {
  const { data, error } = await supabase.from('ibaa_subjects').select('*').eq('level', level).eq('academic_year_id', yearId).eq('status', 'published').order('sort_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPublishedModules(subjectId: string): Promise<Module[]> {
  const { data, error } = await supabase.from('ibaa_modules').select('*').eq('subject_id', subjectId).eq('status', 'published').order('sort_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPublishedLessons(moduleId: string): Promise<Lesson[]> {
  const { data, error } = await supabase.from('ibaa_lessons').select('*').eq('module_id', moduleId).eq('status', 'published').order('sort_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPublishedSubjectResources(subjectId: string): Promise<CampusResource[]> {
  const { data, error } = await supabase.from('ibaa_campus_resources').select('*').eq('subject_id', subjectId).is('lesson_id', null).eq('status', 'published').order('sort_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPublishedLessonResources(lessonId: string): Promise<CampusResource[]> {
  const { data, error } = await supabase.from('ibaa_campus_resources').select('*').eq('lesson_id', lessonId).eq('status', 'published').order('sort_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getResourceSignedUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from(RESOURCE_BUCKET).createSignedUrl(filePath, 3600);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

// ─── Student: assignments ─────────────────────────────────────────────────────

export async function getSubjectAssignments(subjectId: string): Promise<Assignment[]> {
  const { data, error } = await supabase.from('ibaa_assignments').select('*').eq('subject_id', subjectId).order('due_date');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMySubmission(assignmentId: string): Promise<Submission | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: student } = await supabase.from('ibaa_students').select('id').eq('user_id', user.id).maybeSingle();
  if (!student) return null;
  const { data } = await supabase.from('ibaa_submissions').select('*').eq('assignment_id', assignmentId).eq('student_id', student.id).maybeSingle();
  return data ?? null;
}

export async function submitAssignment(payload: { assignmentId: string; studentId: string; textContent?: string; file?: File; }): Promise<{ error?: string }> {
  let filePath: string | null = null, fileName: string | null = null, fileSize: number | null = null;
  if (payload.file) {
    const ext = payload.file.name.split('.').pop();
    const path = `${payload.assignmentId}/${payload.studentId}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('ibaa-submissions').upload(path, payload.file, { upsert: true });
    if (uploadErr) return { error: uploadErr.message };
    filePath = path; fileName = payload.file.name; fileSize = payload.file.size;
  }
  const { error } = await supabase.from('ibaa_submissions').upsert({
    assignment_id: payload.assignmentId, student_id: payload.studentId,
    text_content: payload.textContent ?? null, file_path: filePath, file_name: fileName, file_size: fileSize,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'assignment_id,student_id' });
  return { error: error?.message };
}

// ─── Admin: years & students ──────────────────────────────────────────────────

export async function adminGetStudents(): Promise<(Student & { enrollments: Enrollment[] })[]> {
  const { data, error } = await supabase.from('ibaa_students').select('*, ibaa_enrollments(*)').order('last_name');
  if (error) throw new Error(error.message);
  return (data ?? []).map((s: any) => ({ ...s, enrollments: s.ibaa_enrollments ?? [] }));
}

export async function adminGetYears(): Promise<AcademicYear[]> {
  const { data, error } = await supabase.from('ibaa_academic_years').select('*').order('year', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── Admin: subjects ──────────────────────────────────────────────────────────

export async function adminGetSubjects(yearId: string, level: Level): Promise<Subject[]> {
  const { data, error } = await supabase.from('ibaa_subjects').select('*').eq('academic_year_id', yearId).eq('level', level).order('sort_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpsertSubject(subject: Partial<Subject> & { id?: string }): Promise<Subject> {
  const { data, error } = await supabase.from('ibaa_subjects').upsert(subject).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteSubject(id: string): Promise<void> {
  const { count } = await supabase.from('ibaa_modules').select('id', { count: 'exact', head: true }).eq('subject_id', id);
  if (count && count > 0) throw new Error(`Esta materia tiene ${count} módulo(s). Eliminá los módulos primero.`);
  const { data, error } = await supabase.from('ibaa_subjects').delete().eq('id', id).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No se eliminó la materia. Verificá que tu sesión tenga rol administrador (cerrá sesión y volvé a ingresar).');
}

// ─── Admin: modules ───────────────────────────────────────────────────────────

export async function adminGetModules(subjectId: string): Promise<Module[]> {
  const { data, error } = await supabase.from('ibaa_modules').select('*').eq('subject_id', subjectId).order('sort_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpsertModule(m: Partial<Module> & { id?: string }): Promise<Module> {
  const { data, error } = await supabase.from('ibaa_modules').upsert(m).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteModule(id: string): Promise<void> {
  const { count } = await supabase.from('ibaa_lessons').select('id', { count: 'exact', head: true }).eq('module_id', id);
  if (count && count > 0) throw new Error(`Este módulo tiene ${count} clase(s). Eliminá las clases primero.`);
  const { data, error } = await supabase.from('ibaa_modules').delete().eq('id', id).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No se eliminó el módulo. Verificá que tu sesión tenga rol administrador (cerrá sesión y volvé a ingresar).');
}

// ─── Admin: lessons ───────────────────────────────────────────────────────────

export async function adminGetLessons(moduleId: string): Promise<Lesson[]> {
  const { data, error } = await supabase.from('ibaa_lessons').select('*').eq('module_id', moduleId).order('sort_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpsertLesson(l: Partial<Lesson> & { id?: string }): Promise<Lesson> {
  const { data, error } = await supabase.from('ibaa_lessons').upsert(l).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteLesson(id: string): Promise<void> {
  const { count } = await supabase.from('ibaa_campus_resources').select('id', { count: 'exact', head: true }).eq('lesson_id', id);
  if (count && count > 0) throw new Error(`Esta clase tiene ${count} recurso(s). Eliminá los recursos primero.`);
  const { data, error } = await supabase.from('ibaa_lessons').delete().eq('id', id).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No se eliminó la clase. Verificá que tu sesión tenga rol administrador (cerrá sesión y volvé a ingresar).');
}

// ─── Admin: resources ─────────────────────────────────────────────────────────

export async function adminGetResources(filter: { subjectId?: string; lessonId?: string }): Promise<CampusResource[]> {
  let q = supabase.from('ibaa_campus_resources').select('*');
  if (filter.subjectId) q = (q.eq('subject_id', filter.subjectId) as any).is('lesson_id', null);
  else if (filter.lessonId) q = q.eq('lesson_id', filter.lessonId);
  const { data, error } = await (q as any).order('sort_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpsertResource(r: Partial<CampusResource> & { id?: string }, file?: File): Promise<CampusResource> {
  if (file) {
    if (file.size > RESOURCE_MAX_MB * 1024 * 1024) throw new Error(`El archivo supera los ${RESOURCE_MAX_MB} MB.`);
    if (!RESOURCE_ALLOWED_TYPES.includes(file.type)) throw new Error('Tipo de archivo no permitido.');
    const ext = file.name.split('.').pop();
    const context = r.subject_id ?? r.lesson_id ?? 'misc';
    const path = `${context}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from(RESOURCE_BUCKET).upload(path, file, { upsert: false });
    if (uploadErr) throw new Error(uploadErr.message);
    r = { ...r, file_path: path, file_name: file.name, file_size: file.size };
  }
  const { data, error } = await supabase.from('ibaa_campus_resources').upsert(r).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteResource(r: CampusResource): Promise<void> {
  if (r.file_path) await supabase.storage.from(RESOURCE_BUCKET).remove([r.file_path]);
  const { data, error } = await supabase.from('ibaa_campus_resources').delete().eq('id', r.id).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No se eliminó el recurso. Verificá que tu sesión tenga rol administrador (cerrá sesión y volvé a ingresar).');
}

// ─── Admin: assignments ───────────────────────────────────────────────────────

export async function adminGetAssignments(subjectId: string): Promise<Assignment[]> {
  const { data, error } = await supabase.from('ibaa_assignments').select('*').eq('subject_id', subjectId).order('due_date', { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpsertAssignment(a: Partial<Assignment> & { id?: string }, file?: File): Promise<Assignment> {
  if (file) {
    if (file.size > RESOURCE_MAX_MB * 1024 * 1024) throw new Error(`El archivo supera los ${RESOURCE_MAX_MB} MB.`);
    const ext = file.name.split('.').pop();
    const path = `assignments/${a.subject_id ?? 'misc'}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('ibaa-resources').upload(path, file, { upsert: false });
    if (uploadErr) throw new Error(uploadErr.message);
    a = { ...a, file_path: path, file_name: file.name, file_size: file.size };
  }
  const { data, error } = await supabase.from('ibaa_assignments').upsert(a).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteAssignment(id: string): Promise<void> {
  const { count } = await supabase.from('ibaa_submissions').select('id', { count: 'exact', head: true }).eq('assignment_id', id);
  if (count && count > 0) throw new Error(`Esta tarea tiene ${count} entrega(s). Eliminá las entregas primero.`);
  const { data, error } = await supabase.from('ibaa_assignments').delete().eq('id', id).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No se eliminó la tarea. Verificá que tu sesión tenga rol administrador.');
}

export async function adminDeleteSubmission(id: string, filePath: string | null): Promise<void> {
  if (filePath) await supabase.storage.from('ibaa-submissions').remove([filePath]);
  const { data, error } = await supabase.from('ibaa_submissions').delete().eq('id', id).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No se eliminó la entrega. Verificá que tu sesión tenga rol administrador.');
}

export async function adminGetFileUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('ibaa-submissions').createSignedUrl(path, 300);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function adminGetResourceUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(RESOURCE_BUCKET).createSignedUrl(path, 3600);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function adminGetSubmissions(assignmentId: string): Promise<(Submission & { student: Student })[]> {
  const { data, error } = await supabase.from('ibaa_submissions').select('*, ibaa_students(first_name, last_name, email)').eq('assignment_id', assignmentId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((s: any) => ({ ...s, student: s.ibaa_students }));
}

// Legacy kept for backward compat
export async function getSubjectDetail(subjectId: string): Promise<{ syllabus: SyllabusItem[]; recordings: Recording[]; assignments: Assignment[]; }> {
  const [{ data: syllabus }, { data: recordings }, { data: assignments }] = await Promise.all([
    supabase.from('ibaa_syllabus_items').select('*').eq('subject_id', subjectId).order('sort_order'),
    supabase.from('ibaa_recordings').select('*').eq('subject_id', subjectId).order('sort_order'),
    supabase.from('ibaa_assignments').select('*').eq('subject_id', subjectId).order('due_date'),
  ]);
  return { syllabus: syllabus ?? [], recordings: recordings ?? [], assignments: assignments ?? [] };
}
