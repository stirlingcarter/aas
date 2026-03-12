import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Ghost } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <Ghost className="w-16 h-16 text-text-dim mx-auto mb-6" />
        <h1 className="text-6xl font-black text-text-dim mb-4">404</h1>
        <p className="text-xl font-semibold mb-2">This page doesn't exist.</p>
        <p className="text-text-muted mb-8">Kind of like your gym routine.</p>
        <Link to="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
