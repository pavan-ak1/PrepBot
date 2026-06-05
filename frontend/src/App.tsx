import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from './services/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GenerateReport from './pages/GenerateReport';
import InterviewSession from './pages/InterviewSession';
import Results from './pages/Results';
import ReportDetails from './pages/ReportDetails';

function App(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };

    // Listen for storage changes (for multi-tab support)
    window.addEventListener('storage', checkAuth);
    
    // Custom event for login/logout within same tab
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/generate-report" element={isAuthenticated ? <GenerateReport /> : <Navigate to="/login" />} />
          <Route path="/report/:reportId" element={isAuthenticated ? <ReportDetails /> : <Navigate to="/login" />} />
          <Route path="/session/:reportId" element={isAuthenticated ? <InterviewSession /> : <Navigate to="/login" />} />
          <Route path="/results/:sessionId" element={isAuthenticated ? <Results /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
