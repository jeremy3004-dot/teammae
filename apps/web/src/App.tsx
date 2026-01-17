import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthGate } from './components/AuthGate';
import { UserMenu } from './components/UserMenu';
import { ProjectManager } from './components/ProjectManager';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';
import { Landing } from './pages/Landing';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { About } from './pages/About';

function AuthenticatedApp() {
  const location = useLocation();

  // Builder page has its own layout
  if (location.pathname === '/builder') {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <header className="border-b border-[#2a2a3e] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2a2a3e] bg-[#12121a]">
                  <img
                    src="/images/mae-mascot.png"
                    alt="MAE"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center">
                          <span class="text-sm font-bold text-white font-mono">M</span>
                        </div>
                      `;
                    }}
                  />
                </div>
                <span className="font-mono text-lg font-bold text-[#f0f0f5] tracking-wider">MAE</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  to="/projects"
                  className="px-3 py-1.5 text-xs font-mono text-[#a0a0b0] hover:text-[#f0f0f5] hover:bg-[#1a1a24] rounded-lg transition-all"
                >
                  Projects
                </Link>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>
        <Builder />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-[#2a2a3e] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2a2a3e] bg-[#12121a]">
                <img
                  src="/images/mae-mascot.png"
                  alt="MAE"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center">
                        <span class="text-sm font-bold text-white font-mono">M</span>
                      </div>
                    `;
                  }}
                />
              </div>
              <div>
                <h1 className="font-mono text-lg font-bold text-[#f0f0f5] tracking-wider">MAE</h1>
                <p className="text-[10px] text-[#666] -mt-0.5">Master AI Engineer</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <nav className="flex gap-1">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                    location.pathname === '/'
                      ? 'bg-[#1a1a24] text-[#f0f0f5]'
                      : 'text-[#a0a0b0] hover:text-[#f0f0f5] hover:bg-[#1a1a24]'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/projects"
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                    location.pathname === '/projects'
                      ? 'bg-[#1a1a24] text-[#f0f0f5]'
                      : 'text-[#a0a0b0] hover:text-[#f0f0f5] hover:bg-[#1a1a24]'
                  }`}
                >
                  Projects
                </Link>
              </nav>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<ProjectManager />} />
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
