import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo.jsx';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] px-4 py-8">
      <header className="max-w-5xl mx-auto flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-[var(--color-text-primary)] hover:opacity-90"
          aria-label="Back to home"
        >
          <Logo />
        </button>
        <div className="ml-auto text-sm text-[var(--color-text-muted)]">&nbsp;</div>
      </header>

      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Terms &amp; Privacy</h1>
        <p className="text-[var(--color-text-muted)] mb-6">Privacy policy for DocuAgent.</p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-[var(--color-primary)]">1. Introduction</h2>
          <p className="text-[var(--color-text-muted)]">DocuAgent is a developer tool that generates technical documentation from GitHub repositories. The service is provided as-is for personal and commercial use.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-[var(--color-primary)]">2. GitHub OAuth &amp; Permissions</h2>
          <p className="text-[var(--color-text-muted)]">We request the following GitHub OAuth scopes: <code>repo</code>, <code>user</code>.</p>
          <p className="text-[var(--color-text-muted)] mt-2">Why: to read your code files and (optionally) commit generated documentation back to your repository. We use GitHub's official OAuth flow — we never see your GitHub password.</p>
        </section>

        <section id="privacy" className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-[var(--color-primary)]">3. Data Storage</h2>
          <p className="text-[var(--color-text-muted)]">Session tokens are stored in memory only and are cleared when the server restarts.</p>
          <p className="text-[var(--color-text-muted)] mt-2">Your code: we read it temporarily to generate docs and never store it on our servers.</p>
          <p className="text-[var(--color-text-muted)] mt-2">Generated docs: when you choose to commit them, they are committed directly to <strong>your</strong> GitHub repository — we don't keep copies.</p>
          <p className="text-[var(--color-text-muted)] mt-4 italic">Honestly? We're running on a free tier Render instance. We don't have enough storage to keep our own projects running, let alone yours. Your code is yours — we read it, document it, and forget it.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-[var(--color-primary)]">4. What We Don't Do</h2>
          <ul className="list-disc list-inside text-[var(--color-text-muted)]">
            <li>We do not sell your data.</li>
            <li>We do not store your source code.</li>
            <li>We do not share your repo contents with third parties.</li>
            <li>We do not train AI models on your code.</li>
          </ul>
          <p className="text-[var(--color-text-muted)] mt-2">The AI model used is Groq (Llama 3.3) — your code is sent to Groq's API for processing. See Groq's privacy policy at <a className="text-[var(--color-primary)] underline" href="https://groq.com/privacy" target="_blank" rel="noreferrer">groq.com/privacy</a>.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-[var(--color-primary)]">5. Third Party Services</h2>
          <ul className="list-disc list-inside text-[var(--color-text-muted)]">
            <li><a className="text-[var(--color-primary)] underline" href="https://github.com/privacy" target="_blank" rel="noreferrer">GitHub API</a></li>
            <li><a className="text-[var(--color-primary)] underline" href="https://groq.com/privacy" target="_blank" rel="noreferrer">Groq AI API</a></li>
            <li><a className="text-[var(--color-primary)] underline" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Vercel hosting</a></li>
            <li><a className="text-[var(--color-primary)] underline" href="https://render.com/privacy" target="_blank" rel="noreferrer">Render hosting</a></li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-[var(--color-primary)]">6. API Keys &amp; Secrets</h2>
          <p className="text-[var(--color-text-muted)]">We never store your personal GitHub tokens beyond your active session. If you self-host, your `GROQ_API_KEY` stays in your environment only.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-[var(--color-primary)]">7. Disclaimer</h2>
          <p className="text-[var(--color-text-muted)]">Generated documentation is AI-produced and may contain errors — always review before publishing. We are not liable for incorrect documentation or data loss. This is a hackathon project — use in production at your own discretion (and respect 😄).</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-[var(--color-primary)]">8. Contact &amp; Open Source</h2>
          <p className="text-[var(--color-text-muted)]">This project is open source: <a className="text-[var(--color-primary)] underline" href="https://github.com/Arpit-Mahala1/DocuAgent" target="_blank" rel="noreferrer">GitHub repository</a>. Found a bug or privacy concern? Open an issue on GitHub.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-[var(--color-primary)]">9. Changes to Terms</h2>
          <p className="text-[var(--color-text-muted)]">We may update these terms — changes will be posted on this page. Last updated: May 2026.</p>
        </section>

        <div className="mt-8 text-sm text-[var(--color-text-muted)]">Return to <Link to="/">home</Link>.</div>
      </main>
    </div>
  );
};

export default Terms;
