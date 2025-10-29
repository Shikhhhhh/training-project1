import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Login from './pages/auth/Login.jsx';
import StudentDashboard from './pages/student/Dashboard.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import { ROUTES, ROLES } from './utils/constants.js';

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#A855F7',
          borderRadius: 8,
        },
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />

        <Route
          path={ROUTES.STUDENT_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><h1 className="text-4xl font-bold text-gray-800">404 Not Found</h1></div>} />
      </Routes>
    </ConfigProvider>
  );
}
