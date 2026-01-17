import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthGate } from './components/AuthGate';
import { UserMenu } from './components/UserMenu';
import { ProjectManager } from './components/ProjectManager';
import { Builder } from './pages/Builder';
import { Landing } from './pages/Landing';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { About } from './pages/About';

function AuthenticatedApp() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-[#2a2a3e] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-xl font-bold text-[#f0f0f5] tracking-wider uppercase">MAE</h1>
              <p className="text-xs text-[#a0a0b0]">Master AI Engineer</p>
            </div>
            <div className="flex items-center gap-6">
              <nav className="flex gap-2">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-medium uppercase tracking-wider transition-all ${
                    location.pathname === '/'
                      ? 'bg-white text-[#0a0a0f]'
                      : 'text-[#a0a0b0] hover:text-[#f0f0f5] hover:bg-[#1a1a24]'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  to="/builder"
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-medium uppercase tracking-wider transition-all ${
                    location.pathname === '/builder'
                      ? 'bg-white text-[#0a0a0f]'
                      : 'text-[#a0a0b0] hover:text-[#f0f0f5] hover:bg-[#1a1a24]'
                  }`}
                >
                  Builder
                </Link>
              </nav>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<ProjectManager />} />
        <Route path="/builder" element={<Builder />} />
      </Routes>
    </div>
  );
}

function App() {
  const location = useLocation();

  // Public marketing pages (no auth required)
  const publicPaths = ['/landing', '/features', '/pricing', '/about'];

  if (publicPaths.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
      </Routes>
    );
  }

  // All other routes require authentication
  return (
    <AuthGate>
      <AuthenticatedApp />
    </AuthGate>
  );
}

export default App;
