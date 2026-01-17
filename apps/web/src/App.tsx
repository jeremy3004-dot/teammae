import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthGate } from './components/AuthGate';
import { UserMenu } from './components/UserMenu';
import { ProjectManager } from './components/ProjectManager';
import { Builder } from './pages/Builder';
import { Landing } from './pages/Landing';

function AuthenticatedApp() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TeamMAE.ai</h1>
              <p className="text-sm text-gray-600">AI-Powered App Builder</p>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  to="/builder"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/builder'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
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

  // Show landing page for /landing route (public, no auth required)
  if (location.pathname === '/landing') {
    return <Landing />;
  }

  // All other routes require authentication
  return (
    <AuthGate>
      <AuthenticatedApp />
    </AuthGate>
  );
}

export default App;
