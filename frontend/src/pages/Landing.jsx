import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';

const Landing = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleConnect = () => {
    // Trigger OAuth flow
    login();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-primary)] px-4">
      <Logo />
      <h1 className="mt-8 text-4xl font-bold text-center text-[var(--color-primary)]">
        Your code, documented automatically
      </h1>
      <p className="mt-4 text-lg text-center max-w-2xl">
        Seamlessly generate comprehensive documentation for your repositories. Integrated with GitHub, powered by AI.
      </p>
      <button
        onClick={handleConnect}
        className="mt-8 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg shadow-glow text-lg font-medium"
      >
        Connect with GitHub
      </button>
      <section className="mt-16 w-full max-w-5xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 glass-card text-center">
            <h3 className="text-xl font-bold mb-2">Auto‑generate from code</h3>
            <p>AI reads your codebase and creates clean markdown docs.</p>
          </div>
          <div className="p-6 glass-card text-center">
            <h3 className="text-xl font-bold mb-2">Updates on every PR</h3>
            <p>Documentation stays up‑to‑date as you merge changes.</p>
          </div>
          <div className="p-6 glass-card text-center">
            <h3 className="text-xl font-bold mb-2">Supports JS/TS/Python</h3>
            <p>Works with JavaScript, TypeScript and Python projects.</p>
          </div>
        </div>
      </section>
      <section className="mt-12 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">How it works</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--color-surface)]">
              1
            </div>
            <p className="mt-2 text-center">Connect repo</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--color-surface)]">
              2
            </div>
            <p className="mt-2 text-center">AI reads code</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--color-surface)]">
              3
            </div>
            <p className="mt-2 text-center">Docs generated</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
