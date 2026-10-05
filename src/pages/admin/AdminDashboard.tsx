import { Link } from 'react-router-dom';
import { ARTICLES, SERMONS, RESOURCES } from '../../data/content';
import { usePublicContent } from '../../hooks/usePublicContent';

const recentActivity = [
  { action: 'Artículo publicado', subject: 'Liderar como Jesús', user: 'Admin', time: 'hace 2 horas', icon: '📝' },
  { action: 'Predicación subida', subject: 'Un corazón rendido', user: 'Admin', time: 'hace 5 horas', icon: '🎤' },
  { action: 'Nuevo suscriptor', subject: 'pablo@email.com', user: 'Sistema', time: 'hace 6 horas', icon: '✉️' },
  { action: 'Recurso agregado', subject: 'Bosquejo: El llamado al servicio', user: 'Admin', time: 'ayer', icon: '📁' },
  { action: 'Artículo publicado', subject: 'Fe en medio de la prueba', user: 'Admin', time: 'hace 2 días', icon: '📝' },
];

export default function AdminDashboard() {
  const articles = usePublicContent('articles', ARTICLES);
  const sermons = usePublicContent('sermons', SERMONS);
  const resources = usePublicContent('resources', RESOURCES);
  const stats = [
    { label: 'Artículos publicados', value: articles.length, icon: '📝', color: 'bg-brand/10 text-brand', to: '/admin/articulos' },
    { label: 'Predicaciones', value: sermons.length, icon: '🎤', color: 'bg-green-50 text-green-600', to: '/admin/predicaciones' },
    { label: 'Recursos', value: resources.length, icon: '📁', color: 'bg-orange-50 text-orange-500', to: '/admin/recursos' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-800 text-navy">Bienvenido al panel</h1>
        <p className="text-muted text-[13px] mt-0.5">Resumen general del contenido publicado.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-xl mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-800 text-navy">{stat.value.toLocaleString('es-AR')}</p>
            <p className="text-muted text-[12px] mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-700 text-navy text-[14px]">Actividad reciente</h2>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((item, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-base shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-500 text-navy truncate">
                    <span className="text-muted font-400">{item.action}:</span> {item.subject}
                  </p>
                  <p className="text-[11px] text-muted">{item.user} · {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-700 text-navy text-[14px]">Acciones rápidas</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Nuevo artículo', to: '/admin/articulos', icon: '📝', color: 'bg-brand text-white' },
              { label: 'Nueva predicación', to: '/admin/predicaciones', icon: '🎤', color: 'bg-navy text-white' },
              { label: 'Nuevo recurso', to: '/admin/recursos', icon: '📁', color: 'bg-surface text-navy border border-border' },
              { label: 'Ver suscriptores', to: '#', icon: '✉️', color: 'bg-surface text-navy border border-border' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-600 transition-all hover:opacity-90 ${action.color}`}
              >
                <span>{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Latest articles table */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-700 text-navy text-[14px]">Últimos artículos</h2>
          <Link to="/admin/articulos" className="text-brand text-[12px] font-600 hover:underline">Ver todos →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="px-5 py-3 text-left font-600 text-muted">Título</th>
                <th className="px-5 py-3 text-left font-600 text-muted hidden sm:table-cell">Categoría</th>
                <th className="px-5 py-3 text-left font-600 text-muted hidden md:table-cell">Autor</th>
                <th className="px-5 py-3 text-left font-600 text-muted hidden lg:table-cell">Fecha</th>
                <th className="px-5 py-3 text-left font-600 text-muted">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.slice(0, 5).map((article) => (
                <tr key={article.id} className="hover:bg-surface/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-500 text-navy line-clamp-1">{article.title}</p>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="px-2 py-0.5 bg-brand/10 text-brand text-[11px] font-600 rounded-full">{article.category}</span>
                  </td>
                  <td className="px-5 py-3 text-muted hidden md:table-cell">{article.author}</td>
                  <td className="px-5 py-3 text-muted hidden lg:table-cell">{article.date}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[11px] font-600 rounded-full">Publicado</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
