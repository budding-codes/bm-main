import { Navigate, Route, Routes } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import BlogEditorPage from './pages/BlogEditorPage';
import BlogsPage from './pages/BlogsPage';
import LeadsPage from './pages/LeadsPage';
import MediaPage from './pages/MediaPage';

function AdminRoutes() {
  const { isAuthenticated, isBootstrapping } = useAdminAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-yellow-400">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="leads" replace />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="blogs" element={<BlogsPage />} />
        <Route path="blogs/new" element={<BlogEditorPage />} />
        <Route path="blogs/:id/edit" element={<BlogEditorPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="*" element={<Navigate to="leads" replace />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminRoutes />
    </AdminAuthProvider>
  );
}
