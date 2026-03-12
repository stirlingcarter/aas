import { type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Target, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from './Button';

export function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';
  const isNew = location.pathname === '/new';
  const hideFooter = isLanding || isNew;

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="grain-overlay" />
      <header className="sticky top-0 z-40 border-b border-border/50 bg-bg/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Target className="w-5 h-5 text-accent group-hover:rotate-12 transition-transform" />
            <span className="font-bold tracking-tight text-sm uppercase tracking-widest text-text-muted">
              AAS
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <button
                  onClick={async () => { await signOut(); navigate('/'); }}
                  className="p-2 rounded-lg hover:bg-surface transition-colors text-text-dim hover:text-text-muted cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              !isLanding && !isNew && (
                <Link to="/new">
                  <Button size="sm" variant="ghost">Commit</Button>
                </Link>
              )
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {!hideFooter && (
        <footer className="border-t border-border/30 py-10 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-text-dim text-xs">
              aas &mdash; doing what AI patently cannot: offering accountability.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/new" replace />;
  }

  return <>{children}</>;
}
