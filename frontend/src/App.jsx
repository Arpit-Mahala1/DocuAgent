import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DocsViewer from './pages/DocsViewer.jsx';
import { useContext, useEffect } from 'react';
import { AuthContext } from './context/AuthContext.jsx';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, fetchSession } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    if (t && t !== token) {
      // Store token locally and continue in the current frontend origin
      localStorage.setItem('token', t);
      fetchSession(t);
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, token, fetchSession, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/docs/:owner/:repo" element={<DocsViewer />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>

      <AppContent />
    </Router>
  );
}

export default App;
