import { type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Target, LogOut, LayoutDashboard, Plus } from 'lucide-react';
import { Button } from './Button';

export function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="grain-overlay" />
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Target className="w-6 h-6 text-accent group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-lg tracking-tight">
              AAS
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/new">
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    New Commitment
                  </Button>
                </Link>
                <button
                  onClick={async () => { await signOut(); navigate('/'); }}
                  className="p-2 rounded-lg hover:bg-surface transition-colors text-text-muted hover:text-text cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              !isLanding && (
                <Link to="/auth">
                  <Button size="sm">Sign In</Button>
                </Link>
              )
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-text-dim text-sm">
            <span className="font-medium text-text-muted">aas</span>
            {' '}&mdash; doing what AI patently cannot: offering accountability.
          </p>
          <p className="text-text-dim text-xs mt-2">
            &copy; {new Date().getFullYear()} Accountability as a Service. All commitments are binding (to your conscience).
          </p>
        </div>
      </footer>
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
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
