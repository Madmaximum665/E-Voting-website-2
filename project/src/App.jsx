import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
// Import other pages as they are converted
import ElectionDetails from './pages/student/ElectionDetails.jsx';
import VotePage from './pages/student/VotePage.jsx';
import ResultsPage from './pages/student/ResultsPage.jsx';
import StudentElectionsPage from './pages/student/StudentElectionsPage.jsx';
import StudentGeneralResultsPage from './pages/student/StudentGeneralResultsPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageElections from './pages/admin/ManageElections';
import CreateElection from './pages/admin/CreateElection.jsx';
import EditElection from './pages/admin/EditElection.jsx';
import ManageCandidates from './pages/admin/ManageCandidates.jsx';
import ManageStudents from './pages/admin/ManageStudents.jsx';
import AdminResults from './pages/admin/AdminResults.jsx';
import NotFoundPage from './pages/NotFoundPage';

// Components
import DevTools from './components/DevTools';

function App() {
  const { user, initialize } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state on app load
  useEffect(() => {
    // Initialize auth state by checking for existing token
    initialize();
  }, [initialize]);

  // Handle authentication redirects
  useEffect(() => {
    // If user is not logged in and not on an auth page, redirect to login
    if (!user && !['/login', '/signup'].includes(location.pathname)) {
      navigate('/login', { replace: true });
    }
    // If user is logged in and on auth page, redirect to appropriate dashboard
    else if (user && ['/login', '/signup'].includes(location.pathname)) {
      const redirectPath = user.role === 'admin' ? '/admin' : '/';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, location.pathname]);

  // Show loading state while initializing
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/signup" element={<AuthLayout><SignupPage /></AuthLayout>} />
        
        {/* Student routes */}
        <Route path="/" element={<DashboardLayout><StudentDashboard /></DashboardLayout>} />
        <Route path="/dashboard" element={<DashboardLayout><StudentDashboard /></DashboardLayout>} />
        <Route path="/election/:id" element={<DashboardLayout><ElectionDetails /></DashboardLayout>} />
        <Route path="/vote/:id" element={<DashboardLayout><VotePage /></DashboardLayout>} />
        <Route path="/results/:id" element={<DashboardLayout><ResultsPage /></DashboardLayout>} />
        <Route path="/student/elections" element={<DashboardLayout><StudentElectionsPage /></DashboardLayout>} />
        <Route path="/student/results" element={<DashboardLayout><StudentGeneralResultsPage /></DashboardLayout>} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
        <Route path="/admin/elections" element={<DashboardLayout><ManageElections /></DashboardLayout>} />
        <Route path="/admin/elections/create" element={<DashboardLayout><CreateElection /></DashboardLayout>} />
        <Route path="/admin/elections/edit/:id" element={<DashboardLayout><EditElection /></DashboardLayout>} />
        <Route path="/admin/elections/view/:id" element={<DashboardLayout><ElectionDetails /></DashboardLayout>} />
        <Route path="/admin/candidates" element={<DashboardLayout><ManageCandidates /></DashboardLayout>} />
        <Route path="/admin/students" element={<DashboardLayout><ManageStudents /></DashboardLayout>} />
        <Route path="/admin/results" element={<DashboardLayout><AdminResults /></DashboardLayout>} />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      {/* DevTools for debugging - only visible in development */}
      <DevTools />
    </>
  );
}

export default App;