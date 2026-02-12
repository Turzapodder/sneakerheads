import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import AuthPageGuard from './features/auth/components/AuthPageGuard';

// Lazy loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const SSOCallback = lazy(() => import('./pages/SSOCallback'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/signin"
            element={
              <AuthPageGuard>
                <SignIn />
              </AuthPageGuard>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthPageGuard>
                <SignUp />
              </AuthPageGuard>
            }
          />
          <Route
            path="/verify-email"
            element={
              <AuthPageGuard>
                <VerifyEmail />
              </AuthPageGuard>
            }
          />
          <Route path="/sso-callback" element={<SSOCallback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
