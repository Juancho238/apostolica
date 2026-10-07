import Reveal from '../components/Reveal';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ARTICLES, SERMONS } from '../data/content';
import imageHero from '@/assets/images/Hero-Home-1.webp';
import ibaa from '@/assets/images/Ibaa-principal.webp';
import nuestraHistoria from '@/assets/images/hero-1024x683.webp';

export default function Home() {
  const latestArticles = ARTICLES.slice(0, 3);
  const featuredSermon = SERMONS[0];
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <Reveal className="relative min-h-[520px] object-cover flex items-center overflow-hidden bg-navy-dark" style={{ backgroundImage: `url(${imageHero})`, backgroundSize: 'cover', backgroundPosition: 'center', paddingBottom: '50px' }}>
        <img
          src={imageHero}
          content-type="image/webp"
          alt="Persona en la cima de una montaña al atardecer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="relative max-w-9xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-10 items-center" >
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-800 text-white leading-tight mb-6" style={{ fontFamily: 'Roboto', fontSize: '3rem', fontWeight: 800, lineHeight: 1.2 }}>
              Exaltar a Cristo<br />
              Equipar a la Iglesia<br />
              Evangelizar al Mundo
            </h1>
            <p className="text-white/75 text-lg mb-3 max-w-lg leading-relaxed">
              "Y será predicado este evangelio del reino en todo el mundo, para testimonio a todas las naciones."
            </p>
            <p className="text-white/45 text-sm mb-8 italic">— Mateo 24:14</p>
            <div className="flex flex-wrap gap-3">
              <a href="#nuestra-iglesia" className="px-6 py-3 rounded-full bg-brand text-white font-600 hover:bg-brand-dark transition-colors text-[14px]">
                Conocé más
              </a>
              <Link to="/iglesias" className="px-6 py-3 rounded-full bg-white/10 border border-white/25 text-white font-600 hover:bg-white/20 transition-colors text-[14px]">
                Encontrá tu iglesia
              </Link>
            </div>
          </div>
          <div className="hidden lg:block text-right gap-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px',  paddingLeft: '50px', width: '200px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', borderLeft: '2px solid rgba(255, 255, 255, 0.3)', paddingLeft: '50px', width: '200px', marginLeft: 'auto', marginBottom: '20px' }}>
              <p className="text-white/100 text-5xl font-800 leading-none">UNA</p>
              <p className="text-white/100 text-5xl font-800 leading-none">IGLESIA</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', borderLeft: '2px solid rgba(255, 255, 255, 0.3)', paddingLeft: '50px', width: '200px', marginLeft: 'auto' }}>
              <p className="text-white/100 text-5xl font-800 leading-none">UNA</p>
              <p className="text-white/100 text-5xl font-800 leading-none">MISIÓN</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Quick links */}
      <Reveal className="bg-white border-b border-border py-8 -mt-1 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ minHeight: '150px', width: '90%', marginTop: '-100px', backgroundColor: 'rgb(255, 255, 255)', padding: '20px', borderRadius: '10px' }}  >
          {[
            { icon: '⛪', title: 'Iglesias', desc: 'Encontrá la más cercana', link: '/iglesias', cta: 'Buscar iglesia' },
            { icon: '🎓', title: 'IBAA', desc: 'Formación bíblica de calidad', link: '/ibaa', cta: 'Ir al campus' },
            { icon: '🤝', title: 'Obras', desc: 'Conocé nuestros proyectos', link: '/#obras', cta: 'Ver más' },
            { icon: '❤️', title: 'Involucrate', desc: 'Servir, orar y dar', link: '/#involucrate', cta: 'Sumate' },
          ].map((item) => (
            <div key={item.title} className="bg-surface rounded-xl p-5 flex flex-col gap-2 motion-card hover:shadow-md transition-shadow text-center" style={{ minHeight: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span className="text-2xl">{item.icon}</span>
              <h3 className="font-700 text-navy text-[15px]">{item.title}</h3>
              <p className="text-muted text-[12px] leading-relaxed">{item.desc}</p>
              <Link to={item.link} className="text-brand text-[12px] font-600 mt-auto hover:underline">
                {item.cta} →
              </Link>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Historia + imagen */}
      <Reveal className="py-16 max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center" id="nuestra-iglesia">
        <div>
          <h2 className="text-3xl sm:text-4xl text-navy mb-5 leading-tight text-[40px]" style={{ fontFamily: 'Roboto', fontWeight: 800, lineHeight: 1.2 }}>
            Una historia de fe,<br />una visión para hoy
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Desde 1953, la Asamblea Apostólica en Argentina ha sido parte de la gran obra de Dios, con más de 100 iglesias, Obras Nuevas y Campos Misioneros en todo el país.
          </p>
          <p className="text-muted leading-relaxed mb-6">
            Nuestra misión no ha cambiado: predicar el evangelio de Jesucristo, discipular naciones y hacer que cada creyente viva su fe de manera transformadora en su contexto.
          </p>
          <button
            onClick={() => setHistoryOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy text-white text-[13px] font-600 hover:bg-navy-mid transition-colors"
          >
            Nuestra historia →
          </button>
        </div>
        <div className="relative">
          <img
            src={nuestraHistoria}
            content-type="image/webp"
            alt="Asamblea de adoración"
            className="w-full rounded-2xl object-cover h-80"
          />
          <div className="absolute inset-0 rounded-2xl bg-navy/30 flex items-end p-6">
            <p className="text-white text-3xl font-700 italic">Sigamos<br />adelante</p>
          </div>
        </div>
      </Reveal>

      {/* Recursos */}
      <Reveal className="bg-surface py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-800 text-navy">Recursos para tu vida</h2>
              <p className="text-muted mt-1 text-[14px]">Mensajes, devocionales, estudios y más.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: '▶', label: 'Predicaciones', to: '/predicaciones' },
              { icon: '📖', label: 'Estudios Bíblicos', to: '/blog' },
              { icon: '📰', label: 'Noticias', to: '/blog' },
              { icon: '📅', label: 'Eventos', to: '/#eventos' },
            ].map((r) => (
              <Link key={r.label} to={r.to} className="bg-white rounded-xl p-5 flex flex-col items-center gap-3 motion-card hover:shadow-md transition-shadow">
                <span className="text-3xl">{r.icon}</span>
                <span className="font-600 text-navy text-[14px]">{r.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* IBAA Banner */}
      <Reveal className="py-14 max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <h2 className="text-2xl sm:text-3xl font-800 text-navy mb-2">Últimos artículos</h2>
          <p className="text-muted text-[14px] mb-6">Enseñanzas y reflexiones para crecer en la fe.</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {latestArticles.map((article) => (
              <Link key={article.id} to={`/blog/${article.slug}`} className="group bg-white rounded-xl overflow-hidden border border-border motion-card hover:shadow-md transition-all">
                <div className="relative overflow-hidden h-40 bg-surface">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-700 uppercase tracking-widest text-brand">{article.category}</span>
                  <h3 className="font-700 text-navy text-[14px] mt-1 leading-snug group-hover:text-brand transition-colors">{article.title}</h3>
                  <p className="text-muted text-[12px] mt-1.5 line-clamp-2">{article.excerpt}</p>
                  <span className="text-brand text-[12px] font-600 mt-2 inline-block">Leer más →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {/* IBAA promo */}
        <div className="bg-navy rounded-2xl p-7 text-white flex flex-col h-full" style={{ minHeight: '250px', display: 'flex', flexDirection: 'column', backgroundImage: `url(${ibaa})`, backgroundSize: 'cover', backgroundPosition: 'center', justifyContent: 'space-around', padding: '20px', borderRadius: '10px' }}>
          <div><h3 className="text-xl font-800" style={{ fontSize: '40px', fontFamily: 'Roboto', fontWeight: 900 }}>IBAA</h3>
          <p className="text-[23px] text-white/70 leading-relaxed font-500">Instituto Bíblico de la Asamblea Apostólica.</p>
          <p className="text-[13px] text-white/70 leading-relaxed font-500">Formación con propósito para una iglesia que transforma.</p>
          </div>
          <Link to="/ibaa" className="mt-2 inline-flex items-center gap-1 px-4 py-2 rounded-full bg-brand text-white text-[13px] font-600 w-fit hover:bg-brand-dark transition-colors">
            Ingresar al campus →
          </Link>
        </div>
      </Reveal>

      {/* Últimas noticias */}
      <Reveal className="bg-surface py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-800 text-navy">Noticias Destacadas</h2>
            <Link to="/blog" className="text-brand text-[13px] font-600 hover:underline">Ver todos →</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {ARTICLES.slice(5, 8).map((a) => (
              <Link key={a.id} to={`/blog/${a.slug}`} className="group">
                <div className="relative h-48 rounded-xl overflow-hidden mb-3 bg-surface">
                  <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-[11px] font-700 uppercase tracking-wide text-brand mb-1">{a.category}</p>
                <h3 className="font-700 text-navy text-[15px] leading-snug group-hover:text-brand transition-colors">{a.title}</h3>
                <p className="text-muted text-[12px] mt-1">{a.excerpt.slice(0, 70)}…</p>
                <span className="text-brand text-[12px] font-600 mt-1 inline-block">Leer más →</span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Historia Modal */}
      {historyOpen && <HistoryModal onClose={() => setHistoryOpen(false)} />}

      {/* Newsletter */}
      <NewsletterBanner />

      <Footer />
    </div>
  );
}

const BELIEFS = [
  { title: '1. La Iglesia', content: 'Creemos que la Iglesia de nuestro Señor Jesucristo es una, universal e indivisible, formada por todos los hombres, sin distinción de nacionalidad, idioma, color o costumbres, que hayan aceptado a nuestro Señor Jesucristo como su Salvador y hayan sido bautizados en el cuerpo por el Espíritu Santo (1 Corintios 12:13). Los vínculos que unen a los miembros de la Iglesia son el amor y la fe común y su estandarte o bandera es el Nombre de Jesucristo, ante cuyo emblema marcha gallardamente la Iglesia, imponente como ejércitos en orden (Cantares 6:10).' },
  { title: '2. Hay un Solo Dios', content: 'Creemos que hay un sólo Dios que se ha manifestado al mundo en distintas formas a través de las edades y que especialmente se ha revelado como Padre en la Creación del Universo, como Hijo en la Redención de la humanidad, y como Espíritu Santo derramándose en los corazones de los creyentes. \n\nEste Dios es el Creador de todo lo que existe, sea visible o invisible. Es eterno, Infinito en poder, Santo en su naturaleza, atributos y propósitos. El posee una Divinidad absoluta e indivisible; es Infinito en su Inmensidad, Inconcebible en su modo de ser e Indescriptible en su Esencia; conocido completamente sólo por sí mismo, porque una mente infinita solo se puede comprender por sí misma. No tiene cuerpo ni partes y por tanto está libre de todas las limitaciones. \n\nEl primer mandamiento de todos es: “Oye, Israel; el Señor nuestro Dios, el Señor uno es” (Marcos 12:29; Deuteronomio 6:4). “Para nosotros, sin embargo, sólo hay un Dios…” (1 Corintios 8:6).' },
  { title: '3. Jesus Cristo', content: 'Creemos que Jesucristo nació milagrosamente del vientre de la virgen María, por obra del Espíritu Santo y que al mismo tiempo es el único y verdadero Dios (Romanos 9:5; 1 Juan 5:20). El mismo Dios del Antiguo Testamento tomó forma humana (Isaías 60:1-3). “Y aquel Verbo fue hecho carne, y habitó entre nosotros…” (Juan 1:14). “E indiscutiblemente, grande es el misterio de la piedad: Dios fue manifestado en carne, justificado en el Espíritu, visto de los ángeles, predicado a los gentiles, creído en el mundo, recibido arriba en gloria” (1 Timoteo 3:16). \n\nCreemos que en Jesucristo se mezclaron en una forma perfecta e incomprensible los atributos divinos y la naturaleza humana. Se llama el Hijo del Hombre porque El nació de la Virgen Maria en cuyo vientre tomó forma de hombre, y adquirió así su naturaleza humana. Se llama el Hijo de Dios porque fue engendrado del Espíritu Santo y participó así de la naturaleza divina. Él era humano a través de Maria, en cuyo vientre tomó la forma de hombre. Él es divino por medio del Espíritu Santo quien engendró a Maria. Así, se llama el Hijo de Dios e Hijo del Hombre. \nPor tanto creemos que Jesucristo es Dios “Porque en él habita corporalmente toda la plenitud de la Deidad”, (Colosenses 2:9). Y creemos que la Biblia da a conocer todos sus atributos. Es Padre Eterno, a la vez es un niño que nos es nacido (Isaías 9:6). Es Creador de todo (Colosenses 1: 16, 17; Isaías 45:18). Es Omnipresente (Juan 3:13; Deuteronomio 4:39). Hacía maravillas como Dios Todopoderoso (Lucas 5:24-26; Salmos 86:10). Tiene potestad sobre el mar (Marcos 4:37-39; Salmos 107:29,30). Es el mismo siempre (Hebreos 13:8; Salmos 102:27).' },
  { title: '4. El Espíritu Santo', content: 'Creemos en el bautismo del Espíritu Santo, prometido por Dios en el Antiguo Testamento y derramado después de la glorificación del Señor Jesucristo, que es quien lo envía (Joel 2:28,29; Juan 7:37-39; 14:16-26; Hechos 2:1-4,16-18). \n\nCreemos, además que la demostración de que una persona ha sido bautizada con el Espíritu Santo, son las nuevas lenguas o idiomas en que el creyente puede hablar y que ésta señal es también para nuestro tiempo. \n\nCreemos también que el Espíritu Santo es potencia que permite testificar de Cristo (Hechos 1:8) y que sirve para la formación de un carácter cristiano más agradable a Dios (Galatas 5:22-25). El mismo Espíritu da dones a los hombres, que sirven para la edificación de la Iglesia (Romanos 12:6-8; 1 Corintios 12:1-12; Efesios 4:7-13). No aceptamos que haya en ningún hombre la facultad de impartir a otro algún don, pues “todas estas cosas las hace uno y el mismo Espíritu, repartiendo a cada uno en particular como él quiere.” (1 Corintios 12:11). “Pero a cada uno de nosotros fue dada la gracia conforme a la medida del don de Cristo” (Efesios 4:7). \n\nTodos los miembros de la Asamblea Apostólica de la Fe en Cristo Jesús deben buscar el Espíritu Santo y tratar de vivir constantemente en el Espíritu, como lo recomienda Romanos 8:5-16; Efesios 5:18; Colosenses 3:5.' },
  { title: '5. El Bautismo en Agua', content: 'Creemos en el bautismo en agua, por inmersión y en el Nombre de Jesucristo, el cual debe ser administrado por un ministro ordenado. El bautismo debe ser por inmersión, porque sólo así representa la muerte del hombre al pecado, que debe ser semejante a la muerte de Cristo (Romanos 6:1-5). Y en el Nombre de Jesucristo, porque ésta es la forma en que los apóstoles y ministros bautizaron en la edad primitiva de la Iglesia, según lo prueban las Sagradas Escrituras (Hechos 2:38; 8:16; 10:48; 19:6; 22:16).' },
  { title: '6. La Cena del Señor', content: 'Creemos en la práctica literal de la Cena del Señor que él mismo instituyó (Mateo 26:26-29; Marcos 14:22-25; Lucas 22:15-20; 1 Corintios 11:23-26). En esta ordenanza se debe usar pan sin levadura, que representa el cuerpo sin pecado de nuestro Señor Jesucristo, y vino sin fermentar, que representa la Sangre de Cristo, que consumó nuestra redención. El objeto de esta ceremonia es conmemorar la muerte de nuestro Señor Jesucristo y anunciar el día en que regresará al mundo y al mismo tiempo para dar testimonio de la comunión que existe entre los creyentes. Ninguna persona debe participar de este acto si no es miembro fiel de la Iglesia y está en plena comunión, pues al hacerlo sin cumplir estas condiciones, no podrá discernir el cuerpo del Señor (1 Corintios 10:15-17; 11:27,28; 2 Corintios 13:5). \n\nEl Señor, al terminar de tomar una cena con sus apóstoles celebró un acto que de momento los maravilló y que fue el lavatorio de pies. Al terminar este acto, el Maestro explicó a sus discípulos el significado de él, y les recomendó que se lavasen los pies los unos a los otros. La Iglesia practica este acto en combinación con la Cena del Señor o indistintamente como un acto de humildad y confraternidad cristiana (1 Timoteo 5:10).' },
  { title: '7. La Resurrección de Jesucristo', content: 'Creemos en la resurrección literal de nuestro Señor Jesucristo que se efectuó al tercer día de su muerte, como lo relatan los evangelistas (Mateo 27:60-64; Marcos 16:1- 20; Lucas 24: 1-12, 36-44; Juan 20:12-20). Esta resurrección había sido anunciada por los profetas (Isaías 53: 12) y es necesaria para nuestra esperanza y justificación (1 Corintios 15:20; Romanos 4:25).' },
  { title: '8. La Resurrección de Justos e Injustos', content: 'Creemos que habrá una resurrección literal de los muertos en el Señor, en la cual serán cubiertos con un cuerpo glorificado y espiritual, con el cual vivirán para siempre en la presencia del Señor (Juan 5:29; Hechos 24: 15; 1 Tesalonicenses 4:16; Job 19:25-27; Salmos 17:15; 1 Corintios 15:35-54). Los cristianos que estén en pie, en el momento en que el Señor recoja a su Iglesia serán igualmente transformados y así irán a estar con el Señor para siempre en gloria (1 Tesalonicenses 4:18; 1 Corintios 15: 51,52). \n\nCreemos también que habrá resurrección de injustos pero estos despertarán del sueño de la tumba sólo para ser juzgados y oír la dura sentencia que los hará herederos del fuego eterno (Mateo 25:26; Juan 5:29; Apocalipsis 20:12-15; Marcos 9:44; Daniel 12:2).' },
  { title: '9. El Recogimiento de la Iglesia y el Milenio', content: 'Creemos que la Iglesia, compuesta por los muertos en el Señor y los fieles que estén sobre la tierra en el momento del Rapto, será levantada para ir a encontrar a su Señor en los aires y participar en las Bodas del Cordero. Después vendrá con el Señor a la tierra para hacer el juicio de las naciones y reinar con Cristo mil años. Este período será precedido por la Gran Tribulación y la batalla del Armagedón, a la cual dará fin el Señor cuando descienda sobre el Monte de los Olivos con todos sus santos (1 Tesalonicenses 4:13-17; 1 Corintios 15:51-54; Filipenses 3:20,21; Isaías 65:17-25; Daniel 7:27; Miqueas 4:1-3; Zacarías 14:1-16; Mateo 5:5; Romanos 11:25- 27; Apocalipsis 20:1-5).' },
  { title: '10. El Juicio Final', content: 'Creemos que hay un juicio preparado en el cual participarán todos los hombres que hayan muerto sin Cristo y los que estén sobre la tierra en el tiempo de su verificación. Este juicio se efectuará al final del milenio y también se conoce con el nombre de Juicio del Trono Blanco. La Iglesia no será juzgada en esta ocasión, sino que ella misma intervendrá en el juicio que se haga a todos los hombres de acuerdo con lo que está escrito en los libros que Dios tiene preparados. \n\nAl terminarse este juicio, los cielos y la tierra que hoy existen serán renovados por fuego y los fieles habitarán en la Nueva Jerusalén. La dispensación cristiana habrá terminado y entonces Dios volverá a ser todas las cosas en todos (Daniel 7:8-10, 14, 18; 1 Corintios 6:2,3; Romanos 2; 16; 14; 1 Corintios 5:10; Apocalipsis 20:5-15; 21:1-6).' },
  { title: '11. La Sanidad Divina', content: 'Creemos que Dios tiene poder para sanar todas nuestras dolencias físicas, si así es su voluntad y que la Sanidad Divina es un resultado del sacrificio de Cristo; pues El llevó nuestras enfermedades y sufrió nuestros dolores (Isaías 53:4). La sanidad del cuerpo se efectúa por una combinación de la fe del creyente y del poder del Nombre de Jesucristo que se invoca sobre el enfermo. El Señor Jesucristo prometió que los que creyeran en su Nombre pondrían las manos sobre los enfermos y estos sanarían (Marcos 16:18). Los enfermos deben ser ungidos con aceite en el Nombre de Jesucristo por ministros ordenados para que el Señor cumpla sus promesas (Juan 14:13; Salmos 103:1- 4; Lucas 9:1-3; 1 Corintios 12:9; Santiago 5:14-16). \n\nCreemos que la Sanidad Divina se obtiene por la fe y que en caso de que algún hermano tenga necesidad de someterse a los cuidados y ministraciones de la ciencia médica, los demás no deben criticarlo, sino considerarse a sí mismos y guardarse de encontrar condenación con lo que ellos mismos aprueban (Romanos 14:22). Recomendamos que los miembros y ministros de nuestra Iglesia se abstengan de lanzar críticas indebidas a la ciencia médica, cuyos adelantos nadie puede negar y que se originan en la habilidad que Dios ha dado a los hombres para ir descubriendo los secretos del funcionamiento del organismo humano. Al mismo tiempo, los exhortamos a que no se opongan a las campañas de higiene, vacunación y limpieza que sean iniciadas por el gobierno, sino que, por lo contrario, colaboren decididamente en los lugares donde sea posible.' },
  { title: '12. La Santidad', content: 'Creemos que todos los miembros del cuerpo de Cristo deben ser santos, es decir, apartados de todo pecado y consagrados al servicio de Dios. Por esta razón deben abstenerse de toda clase de prácticas, diversiones e inmundicias de carne y de espíritu (Levítico 19:2; 2 Corintios 7:1; Efesios 5:26,27; 1 Tesalonicenses 4:3,4; 2 Timoteo 2:21; Hebreos 12:14; 1 Pedro 1:16). \n\nSin embargo en la práctica de la santidad, creemos que debe evitarse toda clase de extremismos, ascetismos y privaciones que tienen cierta reputación de sabiduría, en culto voluntario y humildad y en duro trato de la carne, la cual es sombra de lo por venir, mas el cuerpo es de Cristo (Colosenses 2: 17,23). En lo que respecta a alimentos, sabiendo que “todo lo que Dios creo es bueno, y nada es de desecharse, si se toma con acción de gracias” (1 Timoteo 4:4).' },
  { title: '13. El Matrimonio', content: 'Creemos que el matrimonio es sagrado, pues fue establecido desde el principio y es honroso en todos (Génesis 2:21-24; Mateo 19:1-5; Hebreos 13:4). Los matrimonios deben verificarse de acuerdo con las leyes de los países respectivos y luego solemnizarse en la Iglesia según la práctica aprobada. Las parejas que no hayan legalizado su unión y deseen bautizarse, deben cumplir primeramente con los requisitos de las leyes civiles. \n\nCreemos que el matrimonio es una unión que debe perdurar mientras viven los dos cónyuges. Al morir uno de ellos, el otro está libre para casarse y no peca si lo hace en el Señor (Romanos 7:1-3; 1 Corintios 7:39). \n\nCreemos además, que los matrimonios deben verificarse exclusivamente entre miembros fieles. Ningún ministro deberá casar a un miembro de la iglesia con una persona inconversa. Los miembros que estando en plena comunión se casaren con una persona inconversa, deberán ser juzgados por los pastores.' },  
  { title: '14. El Estado y la Iglesia', content: 'Creemos en la separación del Estado y la Iglesia y que ninguno debe intervenir en los asuntos del otro, pues aquí se cumple el precepto bíblico de dar lo que es de César a César y lo que es de Dios a Dios (Marcos 12:17). \n\n Los cristianos deben tomar participación en actividades cívicas de acuerdo con su capacidad e inclinaciones políticas, pero siempre reflejando sus ideas personales y no las de la Iglesia. La Asamblea Apostólica siempre es neutral y tiene cabida para los hombres de todos los credos políticos. Al mismo tiempo, todos los cristianos, deben obedecer a las autoridades civiles y todas las leyes y disposiciones que de ellas emanen, siempre que no contradigan sus principios religiosos o los obliguen a hacer cosas en contra de su conciencia (Romanos 13: 1- 7).' },
  { title: '15. Servicio Militar', content: 'La Asamblea Apostólica de la Fe en Cristo Jesús, reconoce al gobierno humano como de ordenación Divina (Romanos 13: 1-2) y al hacerlo así, exhorta a sus miembros a que afirmen su lealtad a su patria. Siendo discípulos del Señor Jesucristo, es deber de todo cristiano obedecer sus preceptos y mandamientos que enseñan como sigue: “No resistáis al que es malo” (Mateo 5:39). “Seguid la paz con todos” (Hebreos 12:14). También (Romanos 12:19; Mateo 26:52; Santiago 5:6; Apocalipsis 13:10).Por estas Escrituras, se cree y se interpreta que los seguidores de nuestro Señor Jesucristo no deben destruir propiedades ajenas o quitar vidas humanas. \n\nSe considera un pecado, que después de haber recibido el conocimiento de la verdad, haber sido hechos nuevas criaturas en Cristo Jesús, participar en acciones o actos diferentes a aquellos recomendados por la Divina Palabra de Dios (Hebreos 6:4-9; 10:26, 27). \n\nPar lo tanto, se aconseja a todos los miembros que de acuerdo al dictamen de su conciencia, sirvan libremente a su patria, en tiempo de paz o de guerra, y prestar servicio, no importando cuán duro o peligroso sea en todas las capacidades NO COMBATIENTES. La Doctrina enseña que se ore porque tengamos siempre hombres de Dios como gobernantes y orar por ellos para que tengan siempre la sabiduría Divina y para que como nación, seamos guardados fuera de la guerra, con honor y vivir en paz continuamente (1 Timoteo 2:1-3).' },
  { title: '16. Pecado de Muerte', content: 'Creemos, a la luz de la Palabra de Dios, que hay pecado de muerte y que si este es cometido en los términos que expresa la misma Biblia, se pierde el derecho a la salvación (Mateo 12:31,32; Romanos 6:23; Hebreos 10:20, 27; 1 Juan 5:16,17). Por tanto, recomendamos que todos los fieles se abstengan de dar oído a doctrinas en que se promete seguridad eterna al cristiano sin importar su conducta, y la idea de que “una vez salvo, siempre salvo,” pues la Biblia enseña que es posible ser reprobado y se necesita permanecer fiel hasta el fin (Romanos 2:6-10; 1 Corintios 9:26,27).' },
  { title: '17. Sistema Económico de la Iglesia', content: 'Creemos que el sistema que la Biblia enseña para la obtención de fondos necesarios para el cumplimiento de la obra es el de diezmos y ofrendas y que debe ser practicado por ministros y creyentes igualmente (Génesis 28:22; Malaquias 3:10; Mateo 23:23; Lucas 6:38; Hechos 11:27,30; 1 Corintios 9:3-14; 16:1,2; 2 Corintios 8:1-16; 9:6-12; 11:7-9; 1 Timoteo 5:17,18; 6:17-19; Gálatas 6:6-10; Filipenses 4:10-12,15-19; Hebreos 13:16).\n\n Sabiendo que la obra de Dios no tan sólo tiene aspecto espiritual, sino también material, creemos que es necesario reglamentar la manera en que se adquieran y distribuyan los fondos necesarios para responder a las necesidades materiales de la obra.' },
  { title: '18. El Cuerpo Ministerial', content: 'Creemos que el ministerio es un llamamiento de Dios y que el Espíritu Santo confiere a cada ministro la facultad de servir a la Iglesia en distintas capacidades y con distintos dones, cuyas manifestaciones son todas para edificación del Cuerpo de Cristo (Romanos 12:6-8; 1 Corintios 12:5-11; Efesios 4:11,12). \n\n Creemos también que, aunque el llamamiento al ministerio es de origen Divino, la Palabra de Dios contiene suficientes enseñanzas sobre los requisitos que debe llenar la persona que vaya a servir en el ministerio y que corresponde a los gobiernos eclesiásticos debidamente organizados examinar a los candidatos al ministerio y determinar cuándo son dignos de aprobación, y la tarea a que se deben dedicar (Hechos 1:23-26; 6:1-3; 1 Timoteo 3:1-lo; 4:14; 5:22; Tito 1:5-9). \n\nCreemos además, que el Espíritu Santo usa al ministro en distintas formas, según las necesidades de la obra de Dios y la capacidad y disposición personal del ministro. Nadie puede ser colocado en una posición más elevada que aquella a que se haga merecedor (1 Timoteo 3: 13; Romanos 12:3). \n\nCreemos que el obispado es el cargo más elevado en el ministerio y que a quienes lo ocupan, se les debe dar muestras especiales de consideración y respeto, sin menoscabo de los que ocupan posiciones de menor responsabilidad.' },
];

function HistoryModal({ onClose }: { onClose: () => void }) {
  const [openBelief, setOpenBelief] = useState<number | null>(null);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/65 backdrop-blur-sm overflow-y-auto py-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="bg-navy rounded-t-2xl px-8 pt-8 pb-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #1d6bca 0%, transparent 60%)' }} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors flex items-center justify-center text-lg leading-none"
          >
            ×
          </button>
          <p className="text-brand text-[11px] font-700 uppercase tracking-widest mb-2 relative">Nuestra Historia</p>
          <h2 className="text-white text-2xl sm:text-3xl font-800 leading-tight relative">
            Una historia de fe,<br />una visión para hoy
          </h2>
        </div>

        <div className="px-8 py-7">
          {/* History content */}
          <div className="space-y-4 text-[14px] text-gray-700 leading-relaxed mb-8">
            <p>
              La Asamblea Apostólica es una organización evangélica pentecostal cuyos fundamentos espirituales están basados en la autoridad plena de la Biblia y las enseñanzas de los Apóstoles y Profetas, siendo Jesucristo la piedra principal de la Iglesia (Efesios 2:20).
            </p>
            <p>
              En la actualidad la Asamblea Apostólica de Argentina forma parte de más de mil Iglesias en todo el mundo, teniendo presencia en cuatro de los cinco continentes del mundo: América, África, Asia y Europa.
            </p>
            <p>
              En las primeras décadas del siglo XIX inmigrantes rusos que ya estaban bautizados en el Nombre de Jesucristo emigraron hacia Argentina, Uruguay y Paraguay. En 1953 arribó el Misionero Leonardo Sepúlveda quien se encargó de organizar a este naciente grupo de hermanos que compartían la misma doctrina y así dar crecimiento a la Asamblea Apostólica en Argentina y Uruguay.
            </p>
            <p>
              A medida que pasaba el tiempo, la Iglesia seguía creciendo con paso firme y extendiéndose gracias al esfuerzo de hombres y mujeres de Dios, que con mucha dedicación, estuvieron dispuestos a pagar el precio para lograr la Iglesia que tenemos hoy y cuyo crecimiento sigue avanzando a pasos agigantados.
            </p>
            <p>
              La Asamblea Apostólica cuenta en la actualidad con cerca de 100 Iglesias en todo el país, incluyendo Obras Nuevas y Campos Misioneros y sigue firme con el propósito y la tarea de <strong className="text-navy">"Exaltar a Cristo, Equipar a la Iglesia y Evangelizar al Mundo"</strong>.
            </p>
          </div>

          {/* Beliefs accordion */}
          <div className="border-t border-gray-100 pt-6">
            <p className="text-brand text-[11px] font-700 uppercase tracking-widest mb-1">Doctrina</p>
            <h3 className="text-navy text-xl font-800 mb-4">¿En qué creemos?</h3>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {BELIEFS.map((b, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenBelief(openBelief === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface transition-colors"
                  >
                    <span className="font-600 text-navy text-[14px]">{b.title}</span>
                    <svg
                      className={`w-4 h-4 text-brand shrink-0 transition-transform duration-200 ${openBelief === i ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {openBelief === i && (
                    <div className="px-5 pb-4 text-[13px] text-gray-600 leading-relaxed whitespace-pre-line bg-surface/50">
                      {b.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full py-3 rounded-xl bg-navy text-white font-600 text-[14px] hover:bg-navy-mid transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function NewsletterBanner() {
  return (
    <Reveal className="py-12 bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
          <span className="text-2xl">✉️</span>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[11px] font-700 uppercase tracking-widest text-brand mb-0.5">Suscribite al blog</p>
          <h3 className="text-xl font-800 text-navy">Recibí nuevos artículos en tu correo</h3>
          <p className="text-muted text-[13px] mt-0.5">Sumate y recibí enseñanzas, devocionales y recursos directamente en tu email.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="email"
            placeholder="Tu correo electrónico"
            className="flex-1 sm:w-64 px-4 py-2.5 rounded-full border border-border text-[13px] outline-none focus:border-brand"
          />
          <button className="px-5 py-2.5 rounded-full bg-brand text-white text-[13px] font-600 hover:bg-brand-dark transition-colors whitespace-nowrap">
            Suscribirme
          </button>
        </div>
      </div>
    </Reveal>
  );
}
