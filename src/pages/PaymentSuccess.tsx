import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase, isConfigured } from '../lib/supabase';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const commitmentId = searchParams.get('commitment_id');
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (commitmentId && isConfigured()) {
      supabase
        .from('commitments')
        .update({ status: 'active' })
        .eq('id', commitmentId)
        .eq('status', 'pending_payment')
        .then(() => setActivated(true));
    } else {
      setActivated(true);
    }
  }, [commitmentId]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center animate-fade-in" padding="lg">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-xl font-bold mb-2">Payment Confirmed</h1>
        <p className="text-text-muted mb-6">
          Your money is on the line. No going back now.
          <br />
          <span className="text-text-dim text-sm">
            (Well, you could go back if you achieve your goal. That's the whole point.)
          </span>
        </p>
        {commitmentId ? (
          <Link to={`/commitment/${commitmentId}`}>
            <Button>
              View Commitment
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <Link to="/dashboard">
            <Button>
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
        {!activated && (
          <div className="mt-4">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </Card>
    </div>
  );
}
