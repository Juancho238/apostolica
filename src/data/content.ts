export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorBio: string;
  date: string;
  readTime: number;
  image: string;
  tags: string[];
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  duration: string;
  views: number;
  image: string;
  category: string;
  mediaUrl?: string;
  content?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'Bosquejo' | 'Devocional' | 'Guía de Célula' | 'Estudio Bíblico' | 'Multimedia';
  description: string;
  downloadUrl: string;
  image?: string;
  content?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  type: 'Libro impreso' | 'Ebook (PDF)';
  category: string;
  coverColor: string;
  coverTextColor: string;
}

export const ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'liderar-como-jesus',
    title: 'Liderar como Jesús',
    excerpt: 'El verdadero liderazgo se sirve, no se impone. Jesús nos presentó un modelo completamente diferente al del mundo.',
    content: `En un mundo que exalta el poder, la influencia y el reconocimiento, Jesús nos presentó un modelo de liderazgo completamente diferente. Su vida nos muestra que liderar no se trata de imponer, sino de servir, de amar y de poner a otros primero.\n\nDesde el inicio de su ministerio, Jesús dejó claro que su liderazgo no venía de la ambición, sino del propósito del Padre. Aunque tenía todo el derecho de ser servido, Él eligió servir. Aunque tenía todo el poder, eligió humillarse. Aunque era el Hijo de Dios, eligió hacerse siervo.\n\n"Porque el Hijo del Hombre no vino para ser servido, sino para servir, y para dar su vida en rescate por muchos." — Marcos 10:45\n\nEl liderazgo de Jesús se caracterizó por la cercanía. Caminó con las personas, escuchó sus historias, sanó sus heridas y habló vida en sus momentos más oscuros. Nunca usó el miedo ni la manipulación para guiar, sino la verdad, la compasión y el ejemplo.\n\nHoy, la Iglesia necesita líderes que reflejen a Jesús: que sirvan con humildad, que inspiren con su vida y que guíen con integridad. Liderar como Jesús es decidir todos los días poner el Reino de Dios por encima de nuestros propios intereses, y entender que la mayor autoridad se ejerce de rodillas.\n\nQue este modelo de liderazgo no solo nos inspire, sino que también transforme nuestra manera de influir en nuestra familia, en nuestra iglesia, en nuestro trabajo y en cada esfera de nuestra vida.`,
    category: 'Liderazgo',
    author: 'Marcos Díaz',
    authorBio: 'Pastor, escritor y conferencista. Apasionado por ver vidas transformadas a través de la Palabra de Dios. Actualmente sirve en la Asamblea Apostólica en Argentina.',
    date: '28 Sep 2024',
    readTime: 8,
    image: 'https://images.unsplash.com/photo-1613492636024-9430710a84d4?w=900&h=600&fit=crop&auto=format',
    tags: ['Liderazgo', 'Servicio', 'Ejemplo', 'Vida Cristiana'],
  },
  {
    id: '2',
    slug: 'una-fe-que-se-mantiene',
    title: 'Una fe que se mantiene en medio de la prueba',
    excerpt: 'Las pruebas no son el final, sino parte del proceso. Descubrí cómo mantener tu fe firme cuando la vida se pone difícil.',
    content: `Las pruebas no son el final del camino, son parte del proceso. La fe genuina no se forma en la comodidad, sino en la adversidad. Cuando todo parece desmoronarse, es precisamente entonces cuando la fe tiene la oportunidad de demostrar su verdadera naturaleza.\n\nLa Biblia está llena de testimonios de hombres y mujeres que atravesaron momentos oscuros y salieron fortalecidos. Abraham esperó décadas por la promesa. José sufrió la traición de sus hermanos y años de prisión. Pablo fue azotado, encarcelado y naufragó, pero en todo ello declaró: "todo lo puedo en Cristo que me fortalece".\n\nMantenerse firme en la prueba requiere tres cosas fundamentales: primero, recordar las promesas de Dios; segundo, rodearse de una comunidad que ora y anima; y tercero, elegir cada día confiar aunque no se entienda.\n\nDios no promete ausencia de pruebas, promete su presencia en medio de ellas. "Cuando pases por las aguas, yo estaré contigo" — Isaías 43:2.\n\nHoy, si estás atravesando una temporada difícil, que sepas que no estás solo. La misma mano que separó el Mar Rojo está disponible para ti. No renuncies a tu fe: es en este momento donde más florece.`,
    category: 'Vida Cristiana',
    author: 'Ana Fernández',
    authorBio: 'Pastora asociada y consejera bíblica. Comprometida con el crecimiento espiritual de las familias en la iglesia local.',
    date: '12 Ago 2024',
    readTime: 6,
    image: 'https://images.unsplash.com/photo-1491485066275-97da4e681cb8?w=900&h=600&fit=crop&auto=format',
    tags: ['Fe', 'Pruebas', 'Fortaleza', 'Confianza'],
  },
  {
    id: '3',
    slug: 'dios-en-lo-secreto',
    title: 'Dios en lo secreto',
    excerpt: 'Un tiempo a solas con Dios transforma nuestra perspectiva y fortalece el corazón. Aprende a cultivar esa intimidad.',
    content: `Vivimos en un mundo que celebra la visibilidad. Las redes sociales nos invitan a mostrar todo, a estar siempre conectados, a ser vistos. Sin embargo, Jesús nos enseñó el valor de lo que se hace en lo secreto.\n\n"Mas tú, cuando ores, entra en tu aposento, y cerrada la puerta, ora a tu Padre que está en secreto; y tu Padre que ve en lo secreto te recompensará en público." — Mateo 6:6\n\nEl lugar secreto con Dios no es un ritual religioso, es un refugio. Es el espacio donde dejamos caer las máscaras y nos presentamos tal como somos: con nuestras dudas, nuestros temores, nuestras alegrías y nuestras necesidades.\n\nCultivár una vida de devoción privada requiere disciplina, pero sus frutos son profundos. Quienes se encuentran regularmente con Dios en lo secreto, salen fortalecidos para enfrentar lo público. Hay una paz que no se compra ni se finge, que solo se obtiene en la presencia de Dios.\n\nComienza con cinco minutos. Una Biblia, silencio, y un corazón dispuesto. Con el tiempo, ese momento se convertirá en el ancla de tu día.`,
    category: 'Devocionales',
    author: 'Roberto Sánchez',
    authorBio: 'Diácono y líder de grupos pequeños. Apasionado por la vida devocional y la formación espiritual de los creyentes.',
    date: '10 Ago 2024',
    readTime: 5,
    image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=900&h=600&fit=crop&auto=format',
    tags: ['Oración', 'Intimidad con Dios', 'Devoción'],
  },
  {
    id: '4',
    slug: 'vivir-con-proposito',
    title: 'Vivir con propósito',
    excerpt: 'Descubrí el plan que Dios tiene para tu vida y cómo caminar en él cada día con fe y determinación.',
    content: `Cada vida fue diseñada con un propósito. No existe el ser humano que Dios haya creado sin un plan específico y único. El problema es que muchos viven sin descubrirlo, atrapados en la rutina, el miedo o las expectativas de otros.\n\nEl propósito divino no se trata de alcanzar fama o riqueza. Se trata de hacer la voluntad de Dios en el lugar donde Él nos puso. A veces ese propósito se manifiesta siendo un padre presente, un trabajador íntegro, o un amigo fiel. No todo llamado está en un púlpito.\n\n"Porque somos hechura de Dios, creados en Cristo Jesús para buenas obras, las cuales Dios preparó de antemano para que anduviésemos en ellas." — Efesios 2:10\n\nVivir con propósito significa tomar decisiones alineadas con los valores del Reino. Significa decir no a lo que nos desvía y sí a lo que nos acerca al corazón de Dios. Significa levantarse cada día con la convicción de que lo que hacemos importa.\n\nSi hoy te sientes perdido o sin dirección, busca a Dios con un corazón abierto. Él es fiel para mostrarte el siguiente paso, aunque no todo el camino.`,
    category: 'Enseñanzas',
    author: 'Juan Martínez',
    authorBio: 'Pastor y conferencista internacional. Tiene una pasión por equipar a los creyentes para vivir su fe de manera práctica y transformadora.',
    date: '08 Ago 2024',
    readTime: 7,
    image: 'https://images.unsplash.com/photo-1597218601865-2a6ab194902e?w=900&h=600&fit=crop&auto=format',
    tags: ['Propósito', 'Llamado', 'Voluntad de Dios'],
  },
  {
    id: '5',
    slug: 'liderar-con-el-ejemplo',
    title: 'Liderar con el ejemplo',
    excerpt: 'El liderazgo cristiano comienza en la obediencia y se sostiene en el servicio. No en las palabras, sino en la vida.',
    content: `El apóstol Pablo escribió algo que pocos líderes se atreven a decir: "Sed imitadores de mí, así como yo de Cristo." Esta declaración revela una de las características más importantes del liderazgo genuino: la coherencia entre lo que se predica y lo que se vive.\n\nLiderar con el ejemplo no es perfección. Es transparencia. Es mostrar que también uno lucha, ora, y necesita de la gracia de Dios. Es ser auténtico en el proceso, no solo en el resultado.\n\nJesús no solo enseñó sobre el servicio: lavó los pies de sus discípulos. No solo habló de perdonar: perdonó desde la cruz. Su liderazgo era inseparable de su vida.\n\nHoy, en un mundo hambriento de autenticidad, el testimonio de un líder que vive lo que predica tiene un poder transformador incomparable. Las palabras convencen, el ejemplo arrastra.\n\nSi lideras una familia, un grupo, una iglesia o un equipo, que la coherencia sea tu marca. Que las personas a tu alrededor puedan decir: "Lo vi en él, lo vi en ella." Eso vale más que cualquier sermón.`,
    category: 'Liderazgo',
    author: 'Marcos Díaz',
    authorBio: 'Pastor, escritor y conferencista. Apasionado por ver vidas transformadas a través de la Palabra de Dios.',
    date: '05 Ago 2024',
    readTime: 6,
    image: 'https://images.unsplash.com/photo-1533000971552-6a962ff0b9f9?w=900&h=600&fit=crop&auto=format',
    tags: ['Liderazgo', 'Testimonio', 'Ejemplo', 'Coherencia'],
  },
  {
    id: '6',
    slug: 'pequeños-comienzos-grandes-propositos',
    title: 'Pequeños comienzos, grandes propósitos',
    excerpt: 'Dios también usa lo pequeño para hacer grandes cosas. No menosprecies el día de los comienzos humildes.',
    content: `"No menosprecies el día de los pequeños comienzos" — Zacarías 4:10. Esta frase, escrita hace miles de años, tiene una relevancia extraordinaria para nuestro tiempo. Vivimos en una cultura del éxito instantáneo y los resultados espectaculares, donde lo pequeño parece no tener lugar.\n\nSin embargo, la historia bíblica está llena de comienzos humildes que devinieron en grandes propósitos. David era el menor de sus hermanos. Gedeón pertenecía al clan más débil. Jesús nació en un pesebre en Belén. La semilla de mostaza es la más pequeña de todas las semillas, y sin embargo crece hasta ser un árbol donde las aves anidan.\n\nA veces, Dios nos pone en posiciones pequeñas no porque nos haya olvidado, sino porque nos está preparando. El carácter se forja en la fidelidad en lo poco. El que es fiel en lo mínimo será constituido sobre mucho.\n\nSi hoy sientes que tu vida no tiene el impacto que esperabas, no te desanimes. Sé fiel en el lugar donde Dios te puso. Ama bien a las personas cercanas. Ora. Sirve. Los pequeños comienzos en las manos de Dios se convierten en historias extraordinarias.`,
    category: 'Vida Cristiana',
    author: 'Silvia Gómez',
    authorBio: 'Escritora y conferencista. Dedicada a fortalecer la fe de las familias a través de la Palabra de Dios.',
    date: '01 Ago 2024',
    readTime: 5,
    image: 'https://images.unsplash.com/photo-1497621122273-f5cfb6065c56?w=900&h=600&fit=crop&auto=format',
    tags: ['Fe', 'Fidelidad', 'Proceso', 'Crecimiento'],
  },
  {
    id: '7',
    slug: 'juntos-en-la-mision',
    title: 'Juntos en la misión',
    excerpt: 'La iglesia es más fuerte cuando camina unida en el propósito de Dios. La misión no es individual, es comunitaria.',
    content: `Desde sus comienzos, la Iglesia fue diseñada para funcionar en comunidad. Jesús no envió a sus discípulos de uno en uno, los envió de dos en dos. El libro de Hechos muestra una comunidad que compartía, oraba y avanzaba junta. La misión era una, pero los obreros eran muchos.\n\nHoy, en un contexto donde el individualismo reina, la Iglesia tiene la oportunidad de demostrar al mundo que hay otra manera de vivir. Una manera donde nadie camina solo, donde las cargas se comparten, y donde la alegría de uno se convierte en la alegría de todos.\n\n"Además les digo que si dos de ustedes en la tierra se ponen de acuerdo sobre cualquier cosa que pidan, les será concedida por mi Padre que está en el cielo." — Mateo 18:19\n\nLa misión de Dios no cabe en el corazón de una sola persona. Necesita una red de obreros comprometidos, cada uno usando sus dones, sirviendo en su lugar, aportando desde su singularidad. Cuando la Iglesia se une en la misión, el poder de Dios se manifiesta de maneras extraordinarias.\n\n¿Estás conectado a una comunidad? ¿Estás contribuyendo con tus dones? El cuerpo de Cristo te necesita, y tú lo necesitas a él.`,
    category: 'Iglesia',
    author: 'Alberto Torres',
    authorBio: 'Pastor principal con más de 20 años de experiencia en el ministerio. Comprometido con el crecimiento de la iglesia local y las misiones globales.',
    date: '28 Jul 2024',
    readTime: 6,
    image: 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?w=900&h=600&fit=crop&auto=format',
    tags: ['Iglesia', 'Misión', 'Comunidad', 'Unidad'],
  },
  {
    id: '8',
    slug: 'la-palabra-que-transforma',
    title: 'La Palabra que transforma',
    excerpt: 'Un recorrido por pasajes clave que desafían y renuevan nuestra vida. La Biblia no es solo un libro, es vida.',
    content: `La Biblia no es solo un libro antiguo con buenas historias. Es la Palabra viva de Dios, activa y eficaz, capaz de transformar la vida de quienes la reciben con fe. A lo largo de la historia, millones de personas han encontrado en sus páginas sanidad, dirección, esperanza y salvación.\n\n"Porque la Palabra de Dios es viva y eficaz, y más cortante que toda espada de dos filos; y penetra hasta partir el alma y el espíritu, las coyunturas y los tuétanos, y discierne los pensamientos y las intenciones del corazón." — Hebreos 4:12\n\nAlgunos pasajes tienen un poder particular para hablar a momentos específicos de nuestra vida. El Salmo 23 nos recuerda que nunca estamos solos en los valles. Isaías 40 nos levanta cuando el cansancio es agotador. Juan 3:16 nos ancla en el amor incondicional del Padre.\n\nLeer la Biblia no es solo adquirir conocimiento. Es abrir el corazón al diálogo con el Creador. Es dejarse hablar, corregir, consolar y dirigir. Es alimentar el espíritu con lo que verdaderamente sustenta.\n\nTe invitamos a hacer de la lectura bíblica una práctica diaria. No importa el tiempo que tengas: incluso un capítulo, leído con atención y oración, puede cambiar el rumbo de tu día.`,
    category: 'Estudios Bíblicos',
    author: 'Carlos Gómez',
    authorBio: 'Teólogo y maestro bíblico. Dedicado a hacer la Palabra de Dios accesible y aplicable para la vida cotidiana.',
    date: '24 Jul 2024',
    readTime: 7,
    image: 'https://images.unsplash.com/photo-1593485589800-579b43749b15?w=900&h=600&fit=crop&auto=format',
    tags: ['Biblia', 'Estudio', 'Transformación', 'Palabra de Dios'],
  },
];

export const SERMONS: Sermon[] = [
  {
    id: '1',
    title: 'Un corazón rendido',
    preacher: 'Ps. Alberto Torres',
    date: '12 Ago 2024',
    duration: '48:12',
    views: 1200,
    image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&h=400&fit=crop&auto=format',
    category: 'Predicaciones',
  },
  {
    id: '2',
    title: 'Fe en medio de la prueba',
    preacher: 'Ps. Juan Martínez',
    date: '04 Ago 2024',
    duration: '36:45',
    views: 980,
    image: 'https://images.unsplash.com/photo-1597218601865-2a6ab194902e?w=600&h=400&fit=crop&auto=format',
    category: 'Enseñanzas',
  },
  {
    id: '3',
    title: 'La Palabra que transforma',
    preacher: 'Ps. Carlos Gómez',
    date: '28 Jul 2024',
    duration: '52:18',
    views: 1500,
    image: 'https://images.unsplash.com/photo-1593485589800-579b43749b15?w=600&h=400&fit=crop&auto=format',
    category: 'Estudios Bíblicos',
  },
  {
    id: '4',
    title: 'Liderazgo con propósito',
    preacher: 'Ps. Marcos Díaz',
    date: '21 Jul 2024',
    duration: '41:03',
    views: 870,
    image: 'https://images.unsplash.com/photo-1491485066275-97da4e681cb8?w=600&h=400&fit=crop&auto=format',
    category: 'Liderazgo',
  },
  {
    id: '5',
    title: 'La oración que mueve montañas',
    preacher: 'Ps. Alberto Torres',
    date: '14 Jul 2024',
    duration: '44:30',
    views: 1100,
    image: 'https://images.unsplash.com/photo-1570786032462-2efc3ca8fccd?w=600&h=400&fit=crop&auto=format',
    category: 'Devocionales',
  },
  {
    id: '6',
    title: 'Gracia suficiente',
    preacher: 'Ps. Ana Fernández',
    date: '07 Jul 2024',
    duration: '38:20',
    views: 760,
    image: 'https://images.unsplash.com/photo-1533000971552-6a962ff0b9f9?w=600&h=400&fit=crop&auto=format',
    category: 'Predicaciones',
  },
  {
    id: '7',
    title: 'Identidad en Cristo',
    preacher: 'Ps. Juan Martínez',
    date: '30 Jun 2024',
    duration: '55:10',
    views: 1350,
    image: 'https://images.unsplash.com/photo-1613492636024-9430710a84d4?w=600&h=400&fit=crop&auto=format',
    category: 'Enseñanzas',
  },
  {
    id: '8',
    title: 'El Espíritu Santo y nosotros',
    preacher: 'Ps. Marcos Díaz',
    date: '23 Jun 2024',
    duration: '49:55',
    views: 920,
    image: 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?w=600&h=400&fit=crop&auto=format',
    category: 'Doctrinal',
  },
];

export const RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Bosquejo: El llamado al servicio',
    type: 'Bosquejo',
    description: 'Esquema detallado para predicar sobre el servicio cristiano con referencias bíblicas y puntos de aplicación.',
    downloadUrl: '#',
  },
  {
    id: '2',
    title: 'Devocional: 30 días con el Salmo 23',
    type: 'Devocional',
    description: 'Un recorrido devocional de 30 días por el Salmo 23, con reflexiones y preguntas de aplicación.',
    downloadUrl: '#',
  },
  {
    id: '3',
    title: 'Guía de Célula: Fe y adversidad',
    type: 'Guía de Célula',
    description: 'Material completo para grupos pequeños sobre cómo mantener la fe en tiempos de prueba.',
    downloadUrl: '#',
  },
  {
    id: '4',
    title: 'Estudio Bíblico: Epístola a los Romanos',
    type: 'Estudio Bíblico',
    description: 'Estudio versículo a versículo del libro de Romanos, con notas teológicas y preguntas de reflexión.',
    downloadUrl: '#',
  },
  {
    id: '5',
    title: 'Presentación: Doctrina de la Salvación',
    type: 'Multimedia',
    description: 'Presentación en PowerPoint con imágenes y diagramas para enseñar sobre la doctrina de la salvación.',
    downloadUrl: '#',
  },
  {
    id: '6',
    title: 'Bosquejo: La familia según Dios',
    type: 'Bosquejo',
    description: 'Esquema de predicación sobre los fundamentos bíblicos de la familia cristiana.',
    downloadUrl: '#',
  },
  {
    id: 'ejemplo-bosquejo-1',
    title: 'La fe de los cuatro amigos',
    type: 'Bosquejo',
    description: 'Un bosquejo breve sobre la fe que nos mueve a ayudar a otros.',
    downloadUrl: '',
    content: `Pasaje: Marcos 2:1–12.

1. Una fe que actúa: los amigos llevan al paralítico hasta Jesús.
2. Una fe que persevera: frente al obstáculo, buscan otro camino.
3. Una fe que acompaña: ponen la necesidad de su amigo por delante.

Aplicación: Identificá a una persona que necesite apoyo y realizá una acción concreta esta semana.`,
  },
  {
    id: 'ejemplo-devocional-1',
    title: 'Sostenernos unos a otros',
    type: 'Devocional',
    description: 'Una reflexión sobre acompañar a quienes están cansados.',
    downloadUrl: '',
    content: `Pasaje: Éxodo 17:8–13.

Moisés también se cansó. Aarón y Hur lo acompañaron y sostuvieron sus brazos. Este pasaje nos recuerda que necesitamos apoyo y que también podemos brindarlo.

Aplicación: Acercate hoy a alguien que esté atravesando una dificultad.

Oración: Señor, ayudame a reconocer cuándo necesito apoyo y a acompañar con amor a los demás. Amén.`,
  },
];

export const BOOKS: Book[] = [
  {
    id: '1',
    title: 'Propósito en la Tormenta',
    author: 'Carlos Annacondia',
    price: 12900,
    type: 'Libro impreso',
    category: 'Vida Cristiana',
    coverColor: '#1a3468',
    coverTextColor: '#ffffff',
  },
  {
    id: '2',
    title: 'Fe para Cada Día',
    author: 'Patricia de Ortiz',
    price: 9900,
    type: 'Libro impreso',
    category: 'Devocionales',
    coverColor: '#2d6a4f',
    coverTextColor: '#ffffff',
  },
  {
    id: '3',
    title: 'Liderazgo con Valores',
    author: 'Equipo IBAA',
    price: 6900,
    type: 'Ebook (PDF)',
    category: 'Liderazgo',
    coverColor: '#112251',
    coverTextColor: '#e8f4f8',
  },
  {
    id: '4',
    title: 'La Oración que Transforma',
    author: 'Marcos Retamozo',
    price: 11900,
    type: 'Libro impreso',
    category: 'Oración',
    coverColor: '#6b2737',
    coverTextColor: '#ffffff',
  },
  {
    id: '5',
    title: 'Familias que Dejan Huella',
    author: 'Silvia de Gómez',
    price: 11900,
    type: 'Libro impreso',
    category: 'Familia',
    coverColor: '#7b4f12',
    coverTextColor: '#ffffff',
  },
  {
    id: '6',
    title: 'El Poder de la Palabra',
    author: 'Juan Martínez',
    price: 8900,
    type: 'Ebook (PDF)',
    category: 'Estudios Bíblicos',
    coverColor: '#1d3557',
    coverTextColor: '#a8dadc',
  },
];

export interface Church {
  id: string;
  name: string;
  pastor: string;
  address: string;
  schedules: string;
  lat?: number;
  lng?: number;
}

// Iglesia de demostración — datos no verificados, solo para prueba de la interfaz.
// Coordenadas: Plaza de Mayo, Buenos Aires (referencia pública).
export const CHURCHES: Church[] = [
  {
    id: 'demo-1',
    name: 'Iglesia de Demostración (Ejemplo)',
    pastor: 'Pastor Ejemplo',
    address: 'Plaza de Mayo, Buenos Aires, Argentina',
    schedules: 'Domingos 10:00 hs y 18:00 hs',
    lat: -34.6083,
    lng: -58.3712,
  },
];

export const CATEGORIES = ['Todos', 'Enseñanzas', 'Devocionales', 'Vida Cristiana', 'Iglesia', 'Familia', 'Liderazgo', 'Estudios Bíblicos'];
export const SERMON_CATEGORIES = ['Predicaciones', 'Enseñanzas', 'Devocionales', 'Estudios Bíblicos', 'Recursos', 'Series'];
