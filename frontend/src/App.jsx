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

  useEffect(() => {
    // Check for incoming GitHub OAuth callback redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth_success') === '1' && params.get('user')) {
      try {
        const decoded = JSON.parse(atob(decodeURIComponent(params.get('user'))));
        setUser(decoded);
        localStorage.setItem('patchbridge_user', JSON.stringify(decoded));
        setActiveView('workspace');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Failed to parse OAuth user payload:', e);
      }
    } else if (params.get('auth_error')) {
      console.warn('OAuth Error:', params.get('auth_error'));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Ensure active user token is synced to backend on mount
  useEffect(() => {
    if (user?.username && user?.accessToken) {
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          accessToken: user.accessToken
        })
      }).catch(console.warn);
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/github/url');
      const data = await res.json();
      if (data.configured && data.authUrl) {
        window.location.href = data.authUrl;
        return;
      }
    } catch (err) {
      console.warn('Could not query GitHub OAuth URL:', err);
    }

    // Fallback: Instant developer demo session if OAuth credentials are not yet entered in .env
    const developerUser = {
      username: 'octocat',
      name: 'GitHub Developer',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
      isDemoSession: true
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
    if (!user) {
      handleLogin();
    } else {
      setCurrentSessionId(null);
      setActiveView('workspace');
      window.history.pushState({}, '', '/');
    }
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
          <HomePage onOpenWorkspace={handleOpenWorkspace} />
        )}
      </main>

      <footer className="border-t border-white/[0.06] py-6 text-center font-mono text-[11px] text-white/30">
        PATCHBRIDGE // GEMMA 4 MULTIMODAL AGENT • OPEN-SOURCE APACHE-2.0
      </footer>
    </div>
  );
}

export default App;
