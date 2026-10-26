import { useEffect, useState } from 'react';
import { Clapperboard, LayoutDashboard, LogOut, Radio } from 'lucide-react'; //icon
import { setSession, setUnauthorizedHandler } from './api.js';
import { Button } from '@/components/ui/button';
import { ToastProvider } from './components/Toast.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import AuthPage from './pages/AuthPage.jsx';
import PipelinePage from './pages/PipelinePage.jsx';
import ChannelsPage from './pages/ChannelsPage.jsx';

const storedUser = () => {
  try { return JSON.parse(localStorage.getItem('ccp_user')); } catch { return null; }
};

const initialTheme = () =>
  localStorage.getItem('ccp_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export default function App() {
  const [user, setUser] = useState(storedUser);
  const [view, setView] = useState('pipeline');
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => { setUnauthorizedHandler(() => setUser(null)); }, []);
  useEffect(() => {
    // class "dark" untuk shadcn, data-bs-theme untuk Bootstrap
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('ccp_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const logout = () => { setSession(null); setUser(null); };

  return (
    <ToastProvider theme={theme}>
      {!user ? (
        <AuthPage onAuth={setUser} theme={theme} onToggleTheme={toggleTheme} />
      ) : (
        <>
          <nav className="navbar border-bottom bg-body px-3 py-2">
            <div className="container-fluid gap-3">
              <div className="d-flex align-items-center gap-3">
                <span className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-5 m-0">
                  <Clapperboard size={22} /> Alur Konten
                </span>
                <div className="d-flex gap-1">
                  <Button size="sm" variant={view === 'pipeline' ? 'secondary' : 'ghost'} onClick={() => setView('pipeline')}><LayoutDashboard /> Pipeline</Button>
                  <Button size="sm" variant={view === 'channels' ? 'secondary' : 'ghost'} onClick={() => setView('channels')}><Radio /> Channel</Button>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small d-none d-sm-inline">{user.name} ({user.role})</span>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
                <Button size="sm" variant="outline" onClick={logout}><LogOut /> Keluar</Button>
              </div>
            </div>
          </nav>
          <main className="container-fluid px-3 px-lg-4 py-4">
            {view === 'pipeline' ? <PipelinePage /> : <ChannelsPage />}
          </main>
        </>
      )}
    </ToastProvider>
  );
}
