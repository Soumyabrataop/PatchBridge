import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { SessionPage } from './pages/SessionPage';

export function App() {
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
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
    <div className="min-h-screen bg-[#0d0d0e] text-[#e8eaed] flex flex-col font-sans selection:bg-white/20 selection:text-white">
      <Navbar onNavigateHome={handleNavigateHome} />

      <main className="flex-1">
        {currentSessionId ? (
          <SessionPage sessionId={currentSessionId} onBack={handleNavigateHome} />
        ) : (
          <HomePage onStartSession={handleStartSession} />
        )}
      </main>

      <footer className="border-t border-white/[0.06] py-6 text-center font-mono text-[11px] text-white/30">
        PATCHBRIDGE // GEMMA 4 MULTIMODAL AGENT • OPEN-SOURCE APACHE-2.0
      </footer>
    </div>
  );
}

export default App;
