import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DocsViewer from './pages/DocsViewer.jsx';
import { useContext, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from './context/AuthContext.jsx';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authenticated, authLoading, fetchSession, sessionResolved } = useContext(AuthContext);
  const handlingCallback = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');

    // ── Case 1: OAuth callback — token in URL ─────────────────────────────────
    if (t && t !== 'undefined') {
      if (handlingCallback.current) return;
      handlingCallback.current = true;
      window.history.replaceState({}, '', location.pathname);

      fetchSession(t).then((valid) => {
        if (valid) {
          navigate('/dashboard', { replace: true });
        } else {
          toast.error('Authentication failed. Please try connecting again.');
          navigate('/', { replace: true });
        }
        handlingCallback.current = false;
      });
      return;
    }

    // ── Case 2: Still loading — do nothing, wait for auth to finish ───────────
    // This is the critical guard: if authLoading is true, a fetchSession call
    // is already in flight. Never redirect while we're mid-check.
    if (authLoading || handlingCallback.current) return;

    // ── Case 3: Session resolved and confirmed not authenticated ──────────────
    const publicRoutes = ['/', '/demo'];
    if (sessionResolved && !authenticated) {
      if (!publicRoutes.includes(location.pathname)) {
      navigate('/', { replace: true });
      }
    }
  }, [location.search, location.pathname, authenticated, authLoading, sessionResolved]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/docs/:owner/:repo" element={<DocsViewer />} />
      <Route path="/demo" element={<DocsViewer isDemoMode={true} />} />
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
