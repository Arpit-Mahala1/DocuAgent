import { useState, useEffect } from "react";
import {
  Github,
  Terminal,
  BookOpen,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  Code
} from "lucide-react";
import axios from "axios";

// Using backend URL from config or default
const BACKEND_URL = "http://localhost:3001";

function App() {
  const [token, setToken] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const [backendHealth, setBackendHealth] = useState("checking");

  // Read GitHub OAuth token from URL on callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      setToken(urlToken);
      // Clean query params from browser bar
      window.history.replaceState({}, document.title, window.location.pathname);
      addLog("Successfully authenticated with GitHub OAuth!");
    }

    // Check backend health
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/health`);
      if (res.data.status === "ok") {
        setBackendHealth("online");
      } else {
        setBackendHealth("degraded");
      }
    } catch (err) {
      setBackendHealth("offline");
    }
  };

  const addLog = (text) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${text}`]);
  };

  const handleConnectGitHub = () => {
    addLog("Redirecting to GitHub OAuth handshake...");
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  const handleGenerateDocs = async (e) => {
    e.preventDefault();
    if (!repoUrl) {
      setMessage("Please enter a GitHub repository URL");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");
    addLog(`Initiating document agent flow for ${repoUrl}...`);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/docs/generate`, {
        repoUrl,
        branch,
        accessToken: token || undefined
      });

      if (res.data.success) {
        setStatus("success");
        setMessage(res.data.message);
        addLog("Agent successfully spawned in the background.");
        addLog("Fetching structure, parsing ASTs, and crafting Markdown docs...");
      } else {
        setStatus("error");
        setMessage(res.data.error || "Failed to trigger documentation agent.");
        addLog(`Error: ${res.data.error}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      const errMsg = err.response?.data?.error || "Cannot connect to DocuAgent server.";
      setMessage(errMsg);
      addLog(`Failed to communicate with agent service: ${errMsg}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg glow-btn">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-300">
                DocuAgent
              </h1>
              <p className="text-xs text-slate-500 font-medium">Hackathon Edition</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Health Badge */}
            <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${
                backendHealth === "online" ? "bg-emerald-500" : backendHealth === "checking" ? "bg-amber-500 animate-pulse" : "bg-rose-500"
              }`} />
              <span className="text-slate-400 capitalize">Server: {backendHealth}</span>
            </div>

            <a
              href="https://github."
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            >
              <Github className="w-5 h-5 text-slate-400 hover:text-white" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Forms & Actions */}
        <section className="lg:col-span-7 space-y-8">
          
          {/* Welcome Card */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none" />
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider">
              AI-Driven Documentation
            </span>
            <h2 className="text-3xl font-bold mt-4 tracking-tight text-white glow-text">
              Auto-generate Technical Documentation
            </h2>
            <p className="text-slate-400 mt-2 leading-relaxed">
              Connect your GitHub repository and let DocuAgent inspect your codebase architectures, code styles, and dependencies to compile premium READMEs and TECHNICAL_DOCS automatically.
            </p>
          </div>

          {/* GitHub OAuth Setup Card */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Github className="w-5 h-5 text-indigo-400" />
              <span>1. Secure GitHub Access</span>
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Required to read files and commit docs back to your repository.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-slate-900/40 rounded-xl border border-slate-900">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${token ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {token ? "GitHub Connected" : "No active session"}
                  </div>
                  <div className="text-xs text-slate-500 truncate max-w-xs">
                    {token ? `Access Token: ${token.substring(0, 10)}...` : "Authenticate to allow repository write back"}
                  </div>
                </div>
              </div>

              <button
                onClick={handleConnectGitHub}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center space-x-2 transition-all ${
                  token 
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200" 
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg glow-btn"
                }`}
              >
                <Github className="w-4 h-4" />
                <span>{token ? "Reconnect Account" : "Connect GitHub"}</span>
              </button>
            </div>
          </div>

          {/* Docs Generator Card */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <span>2. Trigger Documentation Agent</span>
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Specify your repository details and start the analysis.
            </p>

            <form onSubmit={handleGenerateDocs} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                    <Github className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-medium placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Active Branch
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-medium transition-colors"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 disabled:opacity-50"
                  >
                    {status === "loading" ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Agent Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>Run DocuAgent</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {message && (
              <div className={`mt-6 p-4 rounded-xl flex items-start space-x-3 text-sm ${
                status === "success" 
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
              }`}>
                {status === "success" ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span>{message}</span>
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Logs & Explorer */}
        <section className="lg:col-span-5 space-y-8">
          
          {/* Agent Console / Terminal */}
          <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[320px]">
            <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-900/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Agent Agentic Stream
                </span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
            </div>

            <div className="flex-1 p-5 font-mono text-xs overflow-y-auto space-y-2.5 bg-slate-950 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">Console idle. Trigger an agent run to view trace output...</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-indigo-400">&gt; </span>
                    <span className="text-slate-300">{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Docs Explorer Mock */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-base font-semibold flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Generated Artifacts</span>
            </h3>
            
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-slate-900/40 border border-slate-900/80 rounded-xl flex items-center justify-between text-xs hover:border-slate-800 transition-colors">
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-300">TECHNICAL_DOCS.md</span>
                </div>
                <span className="text-indigo-400 font-medium">Pending Run</span>
              </div>
              
              <div className="p-3 bg-slate-900/40 border border-slate-900/80 rounded-xl flex items-center justify-between text-xs hover:border-slate-800 transition-colors">
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-300">README.md</span>
                </div>
                <span className="text-indigo-400 font-medium">Pending Run</span>
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          <div>© 2026 DocuAgent. Built with Agentic SDK + Anthropic Claude.</div>
          <div className="flex items-center space-x-4">
            <a href="https://github.com" className="hover:text-indigo-400 transition-colors">Docs</a>
            <a href="https://github.com" className="hover:text-indigo-400 transition-colors">Developer Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
