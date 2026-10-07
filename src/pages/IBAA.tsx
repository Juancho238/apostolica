import Reveal from '../components/Reveal';
import GraduatesTable from '../components/GraduatesTable';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LEVELS = [
  {
    icon: '📖',
    title: 'Nivel I',
    subtitle: 'Fundamentos de la fe cristiana.',
    desc: 'Una base sólida en la Palabra de Dios para tu vida cotidiana.',
    image: 'https://images.unsplash.com/photo-1593485589800-579b43749b15?w=400&h=280&fit=crop&auto=format',
  },
  {
    icon: '🌱',
    title: 'Nivel II',
    subtitle: 'Crecimiento y profundización.',
    desc: 'Herramientas para una vida cristiana firme y en crecimiento.',
    image: 'https://images.unsplash.com/photo-1497621122273-f5cfb6065c56?w=400&h=280&fit=crop&auto=format',
  },
  {
    icon: '🧭',
    title: 'Nivel III',
    subtitle: 'Preparación para el servicio.',
    desc: 'Formación para descubrir y desarrollar tu llamado.',
    image: 'https://images.unsplash.com/photo-1533000971552-6a962ff0b9f9?w=400&h=280&fit=crop&auto=format',
  },
  {
    icon: '👥',
    title: 'Teología Ministerial',
    subtitle: 'Formación para el liderazgo y el ministerio.',
    desc: 'Equipando siervos para la obra de Dios en la iglesia y en el mundo.',
    image: 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?w=400&h=280&fit=crop&auto=format',
  },
];

const CLASSES = [
  { title: 'Clase 1 – Introducción a la Biblia', duration: '45 min', status: 'done' },
  { title: 'Clase 2 – Hermenéutica', duration: '52 min', status: 'active' },
  { title: 'Clase 3 – El Antiguo Testamento', duration: '48 min', status: 'pending' },
  { title: 'Clase 4 – El Nuevo Testamento', duration: '50 min', status: 'pending' },
];

const TABS = ['Inicio IBAA', 'Campus Online', 'Sobre el IBAA', 'Niveles', 'Docentes', 'Egresados', 'Preguntas Frecuentes', 'Contacto'];

export default function IBAA({initialTab = 'Inicio IBAA'}: {initialTab?: string}) {
  const [active, setActive] = useState(initialTab);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <Reveal className="relative min-h-[300px] flex items-center bg-navy-dark overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1533000971552-6a962ff0b9f9?w=1600&h=600&fit=crop&auto=format"
          alt="Estudio bíblico"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 to-navy-dark/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-10 items-center w-full">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-navy font-800 text-lg">🎓</div>
              <h1 className="text-5xl font-800 text-white">IBAA</h1>
            </div>
            <p className="text-white/75 text-xl mb-2">Instituto Bíblico de la Asamblea Apostólica</p>
            <p className="text-white/60 text-[15px] mb-6 max-w-xl leading-relaxed">
              Formación bíblica, doctrina sólida y compromiso con la gran comisión.
            </p>
            <a href="/campus/login" className="inline-block px-6 py-3 rounded-full bg-brand text-white font-600 text-[14px] hover:bg-brand-dark transition-colors">
              Ingresar al campus →
            </a>
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-white/40 text-[12px] font-600 uppercase tracking-widest mb-2 italic">Capacitados hoy,</p>
            <p className="text-white/60 text-4xl font-700 italic leading-snug">para servir mañana.</p>
            <blockquote className="mt-4 text-white/40 text-[12px] italic max-w-xs ml-auto leading-relaxed">
              "Procura con diligencia presentarte a Dios aprobado, como obrero que no tiene de qué avergonzarse, que usa bien la palabra de verdad."<br/>
              <span className="font-600">2 Timoteo 2:15</span>
            </blockquote>
          </div>
        </div>
      </Reveal>

      {/* Sub-nav */}
      <Reveal className="bg-white border-b border-border sticky top-[70px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div role="tablist" aria-label="Secciones del IBAA" className="flex gap-2 overflow-x-auto text-[13px] font-600">
            {TABS.map((item, index) => (
              <button key={item} type="button" role="tab" id={`ibaa-tab-${index}`} aria-selected={active === item} aria-controls="ibaa-panel" tabIndex={active === item ? 0 : -1} onClick={() => setActive(item)}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
                else if (event.key === 'ArrowLeft') next = (index + TABS.length - 1) % TABS.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = TABS.length - 1;
                else return;
                event.preventDefault(); setActive(TABS[next]); document.getElementById(`ibaa-tab-${next}`)?.focus();
              }} className={`whitespace-nowrap px-4 py-4 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand ${active === item ? 'text-brand border-brand bg-surface' : 'text-muted border-transparent hover:text-navy'}`}>{item}</button>
            ))}
          </div>
        </div>
      </Reveal>

      <main id="ibaa-panel" role="tabpanel" aria-labelledby={`ibaa-tab-${TABS.indexOf(active)}`} tabIndex={0} className="flex-1">
      {active === 'Egresados' && <GraduatesTable />}
      {active === 'Inicio IBAA' && <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 py-14"><h2 className="text-3xl font-800 text-navy mb-4">Tu formación comienza aquí</h2><p className="text-muted max-w-2xl leading-relaxed">Conocé el Instituto Bíblico de la Asamblea Apostólica, explorá sus niveles de formación y accedé al campus con tu cuenta de alumno.</p><div className="grid md:grid-cols-3 gap-5 mt-8">{[
        ['Sobre el IBAA', 'Conocé el propósito de nuestra formación bíblica.'],
        ['Niveles', 'Nivel I, Nivel II, Nivel III y Teología Ministerial.'],
        ['Campus Online', 'Clases, materiales y tareas del nivel que estás cursando.'],
      ].map(([title, text]) => <button key={title} onClick={() => setActive(title)} className="p-6 text-left rounded-xl bg-surface border border-border hover:border-brand"><h3 className="font-700 text-navy text-lg mb-2">{title}</h3><p className="text-muted text-sm">{text}</p><span className="inline-block mt-4 text-brand">Conocer más →</span></button>)}</div></Reveal>}
      {active === 'Sobre el IBAA' && <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 py-14"><h2 className="text-3xl font-800 text-navy mb-4">Sobre el IBAA</h2><p className="max-w-3xl text-muted leading-relaxed">El Instituto Bíblico de la Asamblea Apostólica acompaña la formación de alumnos en el conocimiento de la Palabra de Dios, la vida cristiana y el servicio en la iglesia.</p><div className="grid md:grid-cols-3 gap-5 mt-8">{[
        ['Conocer la Palabra', 'Profundizar en el estudio de la Biblia y sus enseñanzas.'],
        ['Crecer en la fe', 'Relacionar el aprendizaje bíblico con la vida cotidiana.'],
        ['Prepararse para servir', 'Desarrollar herramientas para acompañar y servir a otros.'],
      ].map(([title, text]) => <article key={title} className="p-6 rounded-xl bg-surface border border-border"><h3 className="font-700 text-navy mb-3">{title}</h3><p className="text-muted text-sm leading-relaxed">{text}</p></article>)}</div></Reveal>}
      {active === 'Docentes' && <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 py-14"><h2 className="text-3xl font-800 text-navy mb-4">Docentes</h2><p className="text-muted mb-6">Consultá la información del profesor y los recursos de tus materias dentro del campus, según tu inscripción.</p><div className="p-8 rounded-xl bg-surface border border-border"><h3 className="font-700 text-navy mb-2">Equipo docente</h3><p className="text-muted text-sm">Todavía no se publicó el listado de docentes en esta sección.</p></div><Link to="/campus/login" className="inline-block mt-6 text-brand font-600">Ingresar al campus →</Link></Reveal>}
      {active === 'Preguntas Frecuentes' && <Reveal className="max-w-3xl mx-auto px-4 sm:px-6 py-14"><h2 className="text-3xl font-800 text-navy mb-6">Preguntas frecuentes</h2><div className="space-y-3">{[
        ['¿Cómo obtengo acceso al campus?', 'La administración crea tu cuenta y te envía una invitación por correo. No hay registro público de alumnos.'],
        ['¿Qué contenido puedo ver?', 'El contenido del nivel y año lectivo correspondientes a tu inscripción activa.'],
        ['¿Dónde encuentro los materiales?', 'Ingresá al campus y abrí la materia correspondiente para consultar sus módulos, clases y recursos.'],
        ['¿Cómo entrego una tarea?', 'Desde la clase correspondiente, utilizá la opción de entrega cuando haya una tarea habilitada.'],
        ['¿Qué hago si olvidé mi contraseña?', 'Utilizá la opción para restablecer tu contraseña en la pantalla de ingreso al campus.'],
        ['¿Cómo consulto por inscripción o aranceles?', 'Contactá a la institución para conocer las condiciones del año lectivo.'],
      ].map(([question, answer]) => <details key={question} className="p-5 rounded-xl border border-border"><summary className="font-600 text-navy cursor-pointer">{question}</summary><p className="text-muted text-sm mt-3 leading-relaxed">{answer}</p></details>)}</div></Reveal>}
      {active === 'Contacto' && <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 py-14"><h2 className="text-3xl font-800 text-navy mb-4">Contacto IBAA</h2><p className="text-muted max-w-2xl leading-relaxed">Consultá por inscripciones, niveles o acceso al campus. Incluí tu nombre y el motivo de tu consulta en el correo.</p><a href="mailto:ibaa@apostolica.com.ar?subject=Consulta%20IBAA" className="inline-block mt-6 px-6 py-3 rounded-full bg-brand text-white font-600 hover:bg-brand-dark">Escribir a ibaa@apostolica.com.ar →</a></Reveal>}
      {active === 'Campus Online' && <>
      {/* Campus Online */}
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid lg:grid-cols-2 gap-12 items-start w-full">
        <div>
          <h2 className="text-3xl font-800 text-navy mb-4">Campus Online</h2>
          <p className="text-muted leading-relaxed mb-6 text-[15px]">
            Accedé a todo el contenido del IBAA desde cualquier lugar. Estudiá a tu ritmo, mirá las grabaciones y profundizá en la Palabra.
          </p>
          <div className="space-y-4 mb-8">
            {[
              { icon: '🎬', title: 'Clases en video', desc: 'Accedé a todas las grabaciones.' },
              { icon: '📄', title: 'Material de estudio', desc: 'Descargá apuntes y recursos.' },
              { icon: '📊', title: 'Seguimiento académico', desc: 'Consultá tus materias y tareas.' },
              { icon: '👥', title: 'Comunidad', desc: 'Consultá la información de tus profesores.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-lg shrink-0">{f.icon}</div>
                <div>
                  <p className="font-600 text-navy text-[14px]">{f.title}</p>
                  <p className="text-muted text-[12px]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          {/* Mock video player */}
          <div className="relative rounded-2xl overflow-hidden bg-navy-dark mb-5 aspect-video">
            <img
              src="https://images.unsplash.com/photo-1522158637959-30385a09e0da?w=700&h=400&fit=crop&auto=format"
              alt="Clase online"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Link to="/campus/login" aria-label="Ingresar al campus para ver las clases" className="w-16 h-16 rounded-full bg-brand flex items-center justify-center shadow-lg hover:bg-brand-dark transition-colors">
                <svg className="w-7 h-7 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </Link>
            </div>
          </div>
<p className="text-muted text-xs mb-3">Vista ilustrativa. Ingresá al campus para consultar tus clases reales.</p>
          {/* Class list */}
          <div className="space-y-2">
            {CLASSES.map((cls) => (
              <div key={cls.title} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  cls.status === 'done' ? 'bg-green-100 text-green-600' :
                  cls.status === 'active' ? 'bg-brand text-white' : 'bg-surface text-muted'
                }`}>
                  {cls.status === 'done' ? '✓' : cls.status === 'active' ? '▶' : '○'}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-500 text-navy">{cls.title}</p>
                  <p className="text-[11px] text-muted">{cls.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      </>}
      {active === 'Niveles' && <>
      {/* Levels */}
      <Reveal className="bg-surface py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-800 text-navy mb-8 text-center">Carreras y Niveles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {LEVELS.map((level) => (
              <div key={level.title} className="bg-white rounded-xl overflow-hidden border border-border motion-card hover:shadow-md transition-all group">
                <div className="relative h-36 bg-navy overflow-hidden">
                  <img src={level.image} alt={level.title} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                    <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-xl shadow-lg">
                      {level.icon}
                    </div>
                  </div>
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-800 text-navy text-[15px]">{level.title}</h3>
                  <p className="text-brand text-[12px] font-600 mt-1">{level.subtitle}</p>
                  <p className="text-muted text-[12px] mt-2 leading-relaxed">{level.desc}</p>
                  <Link to="/ibaa" onClick={() => setActive('Contacto')} className="inline-block mt-4 px-4 py-2 rounded-full border border-border text-[12px] font-600 text-navy hover:bg-navy hover:text-white hover:border-navy transition-all">
                    Consultar inscripción →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      </>}
      </main>
      {/* Quote banner */}
      <Reveal className="py-14 bg-navy-dark relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1593485589800-579b43749b15?w=1600&h=400&fit=crop&auto=format"
          alt="Biblia"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <div style={{ fontFamily: 'Roboto', fontWeight: 800, lineHeight: 1.2, borderLeft: '4px solid #0a83f3', paddingLeft: '12px' }} className="pl-3">
              <h2 className="text-2xl sm:text-3xl font-800 text-white leading-snug">
                Una generación que conoce la Palabra,<br />
                <span className="font-800">hace la diferencia.</span>
              </h2>
            </div>
          </div>
          <div className="text-right text-white/40 text-[11px] tracking-widest font-600 uppercase hidden sm:block">
            <p>SABER</p>
            <p>CRECER</p>
            <p>SERVIR</p>
            <p>TRANSFORMAR</p>
          </div>
        </div>
      </Reveal>

      <Footer />
    </div>
  );
}
