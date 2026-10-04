import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { SessionPage } from './pages/SessionPage';
import { WorkspaceDashboard } from './components/WorkspaceDashboard';

export function App() {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [activeView, setActiveView] = useState('home'); // 'home' | 'workspace'
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('patchbridge_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

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

  const handleLogin = () => {
    // Instant developer authentication
    const developerUser = {
      username: 'octocat',
      name: 'GitHub Developer',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4'
    };
    setUser(developerUser);
    localStorage.setItem('patchbridge_user', JSON.stringify(developerUser));
    setActiveView('workspace');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('patchbridge_user');
    setActiveView('home');
  };

  const handleStartSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    window.history.pushState({}, '', `/session/${sessionId}`);
  };

  const handleNavigateHome = () => {
    setCurrentSessionId(null);
    setActiveView('home');
    window.history.pushState({}, '', '/');
  };

  const handleOpenWorkspace = () => {
    setCurrentSessionId(null);
    setActiveView('workspace');
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-[#e8eaed] flex flex-col font-sans selection:bg-white/20 selection:text-white">
      <Navbar
        onNavigateHome={handleNavigateHome}
        user={user}
        onLogin={handleLogin}
        onOpenWorkspace={handleOpenWorkspace}
        activeView={activeView}
      />

      <main className="flex-1">
        {currentSessionId ? (
          <SessionPage sessionId={currentSessionId} onBack={handleNavigateHome} />
        ) : activeView === 'workspace' && user ? (
          <WorkspaceDashboard
            user={user}
            onLogout={handleLogout}
            onSelectSession={handleStartSession}
          />
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
