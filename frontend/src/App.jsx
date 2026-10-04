import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { SessionPage } from './pages/SessionPage';

export function App() {
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    // Check initial path (e.g., /session/:id or #/session/:id)
    const checkPath = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      const pathMatch = pathname.match(/\/session\/([a-zA-Z0-9_-]+)/);
      const hashMatch = hash.match(/#\/session\/([a-zA-Z0-9_-]+)/);

      const matchedId = pathMatch?.[1] || hashMatch?.[1];
      if (matchedId) {
        setCurrentSessionId(matchedId);
      } else {
        setCurrentSessionId(null);
      }
    };

    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  const handleStartSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    window.history.pushState({}, '', `/session/${sessionId}`);
  };

  const handleNavigateHome = () => {
    setCurrentSessionId(null);
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onNavigateHome={handleNavigateHome} />

      <main className="flex-1">
        {currentSessionId ? (
          <SessionPage sessionId={currentSessionId} onBack={handleNavigateHome} />
        ) : (
          <HomePage onStartSession={handleStartSession} />
        )}
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>PatchBridge — Multimodal Open-Source Debugging Agent • Gemma 4 Track</p>
      </footer>
    </div>
  );
}

export default App;
