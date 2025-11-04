import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Login from './pages/auth/Login.jsx';
import StudentDashboard from './pages/student/Dashboard.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import { ROUTES, ROLES } from './utils/constants.js';
import AdminJobs from './pages/admin/Jobs.jsx';
import AdminSettings from './pages/admin/Settings.jsx';
import AdminStudents from './pages/admin/Students.jsx';
import { getUser } from './services/auth.js';

// Protected Route wrapper
// function ProtectedRoute({ children, allowedRoles }) {
//   const token = getToken();
//   const user = getUser();

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(user?.role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// }

// Role-based redirect after login
function RoleBasedRedirect() {
  const user = getUser();
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#7C3AED',
          borderRadius: 12,
          colorSuccess: '#10B981',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          colorInfo: '#06B6D4',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
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
         <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminStudents />
            </ProtectedRoute>
          }
        />
          <Route path="/unauthorized" element={<div className="p-12 text-center"><h1>Access Denied</h1></div>} />

        <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><h1 className="text-4xl font-bold text-gray-800">404 Not Found</h1></div>} />
      </Routes>
    </ConfigProvider>
  );
}
