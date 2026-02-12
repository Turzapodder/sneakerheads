
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import SSOCallback from './pages/SSOCallback';
import Dashboard from './pages/Dashboard';
import VerifyEmail from './pages/VerifyEmail';
import ProtectedRoute from './components/authentication/ProtectedRoute';
import AuthPageGuard from './components/authentication/AuthPageGuard';

function App() {
  return (
    <Router>
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
    </Router>
  )
}

export default App
