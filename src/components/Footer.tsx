import { Link } from 'react-router-dom';
import logo from '../assets/images/logo-asamblea.webp';

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <img src={logo} alt="Logo" className='w-10 h-10'/>
            </div>
            <div>
              <div className="text-[12px] font-700 uppercase tracking-wide">Asamblea Apostólica</div>
              <div className="text-[10px] text-white/50 tracking-widest uppercase">en Argentina</div>
            </div>
          </div>
          <p className="text-white/60 text-[13px] leading-relaxed mb-4">
            Exaltar a Cristo, equipar a la Iglesia, evangelizar al mundo. Desde 1953 sirviendo a Argentina.
          </p>
          <div className="flex gap-3">
            {['facebook','instagram','youtube','spotify'].map((s) => (
              <a key={s} href="#" aria-label={s}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <SocialIcon name={s} />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-[12px] font-700 uppercase tracking-widest text-white/40 mb-4">Ministerios</h4>
          <ul className="space-y-2.5">
            {['Iglesias', 'IBAA', 'Obras Misioneras', 'Jóvenes', 'Niños', 'Familias'].map((item) => (
              <li key={item}>
                <a href="#" className="text-[13px] text-white/65 hover:text-white transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[12px] font-700 uppercase tracking-widest text-white/40 mb-4">Recursos</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Blog', to: '/blog' },
              { label: 'Predicaciones', to: '/predicaciones' },
              { label: 'Tienda', to: '/tienda' },
              { label: 'Estudios Bíblicos', to: '/blog' },
              { label: 'Devocionales', to: '/blog' },
            ].map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="text-[13px] text-white/65 hover:text-white transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[12px] font-700 uppercase tracking-widest text-white/40 mb-4">Contacto</h4>
          <ul className="space-y-2.5 mb-5">
            <li className="text-[13px] text-white/65">📧 contacto@apostolica.com.ar</li>
            <li className="text-[13px] text-white/65">📞 +54 11 4xxx-xxxx</li>
            <li className="text-[13px] text-white/65">📍 Buenos Aires, Argentina</li>
          </ul>
          <h4 className="text-[12px] font-700 uppercase tracking-widest text-white/40 mb-2">Acceso</h4>
          <Link to="/admin/login" className="text-[12px] text-white/40 hover:text-white/70 transition-colors underline underline-offset-2">
            Acceso Administración
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/40 text-[12px]">© 2026 Asamblea Apostólica en Argentina. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="text-white/40 text-[12px] hover:text-white/70 transition-colors">Privacidad</a>
            <a href="#" className="text-white/40 text-[12px] hover:text-white/70 transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
    instagram: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M21 7v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z',
    youtube: 'M22.54 6.42A2.78 2.78 0 0 0 20.6 4.46C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z',
    spotify: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm4.56 14.4a.63.63 0 0 1-.86.2 8.15 8.15 0 0 0-4.56-1.23 15.38 15.38 0 0 0-3.76.45.63.63 0 0 1-.31-1.22 17 17 0 0 1 4.07-.49 9.33 9.33 0 0 1 5.22 1.42.63.63 0 0 1 .2.87zm1.22-2.7a.79.79 0 0 1-1.08.26 10.16 10.16 0 0 0-5.68-1.56 14.46 14.46 0 0 0-4.17.6.79.79 0 0 1-.45-1.52A15.76 15.76 0 0 1 11 10.73a11.58 11.58 0 0 1 6.51 1.8.79.79 0 0 1 .27 1.18zm.1-2.8a.95.95 0 0 1-1.3.31A13.12 13.12 0 0 0 12 9.25a16.6 16.6 0 0 0-4.85.7.95.95 0 1 1-.55-1.82A18.5 18.5 0 0 1 12 7.35a15 15 0 0 1 7.57 2.19.95.95 0 0 1 .31 1.36z',
  };
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[name]} />
    </svg>
  );
}
