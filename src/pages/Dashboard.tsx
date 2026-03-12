import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useCommitments } from '../hooks/useCommitments';
import { useCountdown } from '../hooks/useCountdown';
import { formatCents, isPastDeadline } from '../lib/constants';
import { Plus, Target, TrendingUp, DollarSign, Clock } from 'lucide-react';
import type { CommitmentWithVerification } from '../types';

function CountdownDisplay({ deadline }: { deadline: string }) {
  const { label, isPast } = useCountdown(deadline);

  if (isPast) {
    return <span className="text-warning font-mono text-sm">Deadline passed</span>;
  }

  return <span className="text-accent font-mono text-sm">{label}</span>;
}

function CommitmentCard({ commitment }: { commitment: CommitmentWithVerification }) {
  const pastDeadline = isPastDeadline(commitment.deadline);
  const needsVerification =
    commitment.status === 'active' && pastDeadline;

  return (
    <Link to={`/commitment/${commitment.id}`}>
      <Card hover className="group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge status={needsVerification ? 'pending_verification' : commitment.status} />
            </div>
            <p className="font-medium text-text group-hover:text-accent transition-colors truncate">
              {commitment.goal_description}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {formatCents(commitment.amount_cents)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {commitment.status === 'active' && !pastDeadline ? (
                  <CountdownDisplay deadline={commitment.deadline} />
                ) : (
                  new Date(commitment.deadline).toLocaleDateString()
                )}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold">{formatCents(commitment.amount_cents)}</div>
            <div className="text-xs text-text-dim">at stake</div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function Dashboard() {
  const { commitments, loading } = useCommitments();

  const active = commitments.filter(
    (c) => c.status === 'active' || c.status === 'pending_payment' || c.status === 'pending_verification'
  );
  const underReview = commitments.filter((c) => c.status === 'under_review');
  const completed = commitments.filter(
    (c) => c.status === 'approved' || c.status === 'denied' || c.status === 'expired' || c.status === 'failed'
  );

  const totalStaked = commitments.reduce((sum, c) => sum + c.amount_cents, 0);
  const successCount = commitments.filter((c) => c.status === 'approved').length;
  const finishedCount = completed.length;
  const successRate = finishedCount > 0 ? Math.round((successCount / finishedCount) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Your commitments, your conscience.</p>
        </div>
        <Link to="/new">
          <Button>
            <Plus className="w-4 h-4" />
            New Commitment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <Card padding="sm">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium">Active</span>
          </div>
          <div className="text-2xl font-bold">{active.length}</div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">Total Staked</span>
          </div>
          <div className="text-2xl font-bold">{formatCents(totalStaked)}</div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Success Rate</span>
          </div>
          <div className="text-2xl font-bold">{finishedCount > 0 ? `${successRate}%` : '--'}</div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">In Review</span>
          </div>
          <div className="text-2xl font-bold">{underReview.length}</div>
        </Card>
      </div>

      {/* Active Commitments */}
      {active.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Active Commitments</h2>
          <div className="space-y-3">
            {active.map((c) => (
              <CommitmentCard key={c.id} commitment={c} />
            ))}
          </div>
        </section>
      )}

      {/* Under Review */}
      {underReview.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Under Review</h2>
          <div className="space-y-3">
            {underReview.map((c) => (
              <CommitmentCard key={c.id} commitment={c} />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">History</h2>
          <div className="space-y-3">
            {completed.map((c) => (
              <CommitmentCard key={c.id} commitment={c} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {commitments.length === 0 && (
        <Card className="text-center py-16">
          <Target className="w-12 h-12 text-text-dim mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No commitments yet</h3>
          <p className="text-text-muted mb-6 max-w-md mx-auto">
            You haven't committed to anything. We'd say "that's okay" but the whole point
            of this service is that it's not.
          </p>
          <Link to="/new">
            <Button>
              <Plus className="w-4 h-4" />
              Make Your First Commitment
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
