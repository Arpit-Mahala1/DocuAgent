import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import TypedEffect from '../components/TypedEffect.jsx';

const Landing = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleConnect = () => {
    // Trigger OAuth flow
    login();
  };

  const handleTryDemo = () => {
    navigate('/demo');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[var(--color-bg)] text-[var(--color-text-primary)] px-4 py-6 page-transition">
      <div className="w-full max-w-5xl mx-auto flex justify-center">
        <Logo />
      </div>
      <h1 className="mt-6 text-4xl md:text-5xl font-bold text-center leading-tight">
        <span className="text-[var(--color-primary)]">
          <TypedEffect text="Your code," speed={50} startDelay={200} />
        </span>
        <br />
        <span className="text-white">
          <TypedEffect text="documented automatically" speed={50} startDelay={500} />
        </span>
      </h1>
      <p className="mt-3 text-base text-center max-w-2xl text-[var(--color-text-muted)] opacity-0 animate-fade-in" style={{ animationDelay: '1.5s', animationFillMode: 'forwards' }}>
        Seamlessly generate comprehensive documentation for your repositories. Integrated with GitHub, powered by AI.
      </p>
      
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center opacity-0 animate-fade-in" style={{ animationDelay: '2s', animationFillMode: 'forwards' }}>
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg shadow-glow text-base font-medium transition-all hover:shadow-lg hover:scale-105"
        >
          Connect with GitHub
        </button>
        <button
          onClick={handleTryDemo}
          className="px-4 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-lg text-base font-medium transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          🎪 Try Demo
        </button>
      </div>

      <section className="mt-7 w-full max-w-5xl opacity-0 animate-fade-in" style={{ animationDelay: '2.3s', animationFillMode: 'forwards' }}>
        <h2 className="text-2xl font-semibold mb-4 text-center">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 glass-card text-center hover:bg-[var(--color-surface-hover)] transition-all">
            <h3 className="text-lg font-bold mb-1">Auto‑generate from code</h3>
            <p className="text-[var(--color-text-muted)]">AI reads your codebase and creates clean markdown docs.</p>
          </div>
          <div className="p-4 glass-card text-center hover:bg-[var(--color-surface-hover)] transition-all">
            <h3 className="text-lg font-bold mb-1">Updates on every PR</h3>
            <p className="text-[var(--color-text-muted)]">Documentation stays up‑to‑date as you merge changes.</p>
          </div>
          <div className="p-4 glass-card text-center hover:bg-[var(--color-surface-hover)] transition-all">
            <h3 className="text-lg font-bold mb-1">Supports JS, TS, Python, Java, Go, Ruby, PHP and more.</h3>
            <p className="text-[var(--color-text-muted)]">Works with JavaScript, TypeScript, Python, Java, Go, Ruby, PHP and many other languages.</p>
          </div>
        </div>
      </section>
      <section className="mt-7 w-full max-w-4xl opacity-0 animate-fade-in" style={{ animationDelay: '2.6s', animationFillMode: 'forwards' }}>
        <h2 className="text-2xl font-semibold mb-4 text-center">How it works</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-surface)] font-bold text-[var(--color-primary)]">
              1
            </div>
            <p className="mt-1 text-center text-sm">Connect repo</p>
          </div>
          <div className="hidden md:block text-[var(--color-text-muted)]">→</div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-surface)] font-bold text-[var(--color-primary)]">
              2
            </div>
            <p className="mt-1 text-center text-sm">AI reads code</p>
          </div>
          <div className="hidden md:block text-[var(--color-text-muted)]">→</div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-surface)] font-bold text-[var(--color-primary)]">
              3
            </div>
            <p className="mt-1 text-center text-sm">Docs generated</p>
          </div>
        </div>
      </section>

      <footer className="w-full mt-8 py-4 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-sm text-[var(--color-text-muted)]">
            <Link to="/terms" className="text-[var(--color-primary)] hover:underline mr-4">Terms &amp; Conditions</Link>
            <Link to="/terms#privacy" className="text-[var(--color-primary)] hover:underline">Privacy Policy</Link>
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">© 2026 DocuAgent. Built for developers, by developers.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
