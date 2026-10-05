import Egresados from './pages/Egresados';
import AdminEgresados from './pages/admin/AdminEgresados';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Predicaciones from './pages/Predicaciones';
import PredicacionDetail from './pages/PredicacionDetail';
import Iglesias from './pages/Iglesias';
import Recursos from './pages/Recursos';
import RecursoDetail from './pages/RecursoDetail';
import IBAA from './pages/IBAA';
import Tienda from './pages/Tienda';
import Calendario from './pages/Calendario';
import Pedido from './pages/Pedido';
import AdminCalendario from './pages/admin/AdminCalendario';
import AdminTienda from './pages/admin/AdminTienda';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminArticulos from './pages/admin/AdminArticulos';
import AdminPredicaciones from './pages/admin/AdminPredicaciones';
import AdminRecursos from './pages/admin/AdminRecursos';
import AdminIglesias from './pages/admin/AdminIglesias';
import AdminIBAAUsuarios from './pages/admin/AdminIBAAUsuarios';
import AdminIBAAContenido from './pages/admin/AdminIBAAContenido';
import CampusLogin from './pages/campus/CampusLogin';
import CampusHome from './pages/campus/CampusHome';
import CampusMateria from './pages/campus/CampusMateria';
import CampusActivar from './pages/campus/CampusActivar';
import CampusRestablecerPassword from './pages/campus/CampusRestablecerPassword';
import { AuthProvider, useAuth } from './auth/AuthContext';

function AdminGuard() {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-brand/25 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        {/* Public site */}
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/predicaciones" element={<Predicaciones />} />
        <Route path="/predicaciones/:id" element={<PredicacionDetail />} />
        <Route path="/iglesias" element={<Iglesias />} />
        <Route path="/recursos" element={<Recursos />} />
        <Route path="/recursos/:id" element={<RecursoDetail />} />
        <Route path="/ibaa" element={<IBAA />} />
        <Route path="/ibaa-2" element={<IBAA initialTab="Egresados" />} />
        <Route path="/ibaa/egresados" element={<Egresados />} />
        <Route path="/ibaa/:promotion" element={<Egresados />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/tienda/pedido/:id" element={<Pedido />} />

        {/* Campus */}
        <Route path="/campus/login" element={<CampusLogin />} />
        <Route path="/campus" element={<CampusHome />} />
        <Route path="/campus/materia/:subjectId" element={<CampusMateria />} />
        <Route path="/campus/activar" element={<CampusActivar />} />
        <Route path="/campus/restablecer-password" element={<CampusRestablecerPassword />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="calendario" element={<AdminCalendario />} />
            <Route path="tienda" element={<AdminTienda />} />
            <Route path="articulos" element={<AdminArticulos />} />
            <Route path="predicaciones" element={<AdminPredicaciones />} />
            <Route path="recursos" element={<AdminRecursos />} />
            <Route path="iglesias" element={<AdminIglesias />} />
            <Route path="ibaa-egresados" element={<AdminEgresados />} />
            <Route path="ibaa-usuarios" element={<AdminIBAAUsuarios />} />
            <Route path="ibaa-contenido" element={<AdminIBAAContenido />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
