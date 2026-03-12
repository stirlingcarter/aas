import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useCommitments } from '../hooks/useCommitments';
import { useCountdown } from '../hooks/useCountdown';
import { formatCents, formatDateTime, isPastDeadline } from '../lib/constants';
import { ArrowLeft, Clock, DollarSign, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';

function LiveCountdown({ deadline }: { deadline: string }) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(deadline);

  if (isPast) {
    return (
      <div className="text-center">
        <p className="text-warning font-semibold text-lg">Deadline has passed</p>
        <p className="text-text-muted text-sm">Time to verify your progress.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      {[
        { value: days, label: 'Days' },
        { value: hours, label: 'Hours' },
        { value: minutes, label: 'Min' },
        { value: seconds, label: 'Sec' },
      ].map(({ value, label }) => (
        <div key={label} className="text-center">
          <div className="text-3xl font-bold font-mono tabular-nums">{String(value).padStart(2, '0')}</div>
          <div className="text-xs text-text-dim uppercase tracking-wider">{label}</div>
        </div>
      ))}
    </div>
  );
}

export function CommitmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { commitments, loading } = useCommitments();

  const commitment = commitments.find((c) => c.id === id);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!commitment) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
        <h1 className="text-xl font-bold mb-4">Commitment not found</h1>
        <p className="text-text-muted mb-6">Maybe it was just a dream. Or maybe check the URL.</p>
        <Link to="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const pastDeadline = isPastDeadline(commitment.deadline);
  const showVerifyCTA =
    commitment.status === 'active' && pastDeadline;
  const showReview =
    commitment.status === 'under_review' ||
    commitment.status === 'approved' ||
    commitment.status === 'denied';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1 text-text-muted hover:text-text transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Dashboard</span>
      </button>

      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge status={showVerifyCTA ? 'pending_verification' : commitment.status} />
          </div>
          <h1 className="text-xl font-bold">{commitment.goal_description}</h1>
          <p className="text-text-dim text-sm mt-1">
            Created {formatDateTime(commitment.created_at)}
          </p>
        </div>

        {/* Countdown or Status */}
        {commitment.status === 'active' && (
          <Card padding="lg">
            <LiveCountdown deadline={commitment.deadline} />
          </Card>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card padding="sm">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">At Stake</span>
            </div>
            <div className="text-xl font-bold">{formatCents(commitment.amount_cents)}</div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Deadline</span>
            </div>
            <div className="text-xl font-bold">
              {new Date(commitment.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </Card>
        </div>

        {/* Verification CTA */}
        {showVerifyCTA && (
          <Card className="border-warning/50" padding="lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Deadline passed — time to verify</h3>
                <p className="text-text-muted text-sm mb-4">
                  Did you do the thing? Be honest. It's literally called an honor system.
                </p>
                <Link to={`/commitment/${commitment.id}/verify`}>
                  <Button>
                    <Target className="w-4 h-4" />
                    Verify My Progress
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Review Link */}
        {showReview && (
          <Card
            className={
              commitment.status === 'approved'
                ? 'border-accent/50'
                : commitment.status === 'denied'
                ? 'border-danger/50'
                : ''
            }
            padding="lg"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  commitment.status === 'approved'
                    ? 'bg-accent/10'
                    : commitment.status === 'denied'
                    ? 'bg-danger/10'
                    : 'bg-surface'
                }`}
              >
                <CheckCircle2
                  className={`w-5 h-5 ${
                    commitment.status === 'approved'
                      ? 'text-accent'
                      : commitment.status === 'denied'
                      ? 'text-danger'
                      : 'text-text-muted'
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">
                  {commitment.status === 'approved'
                    ? 'Goal verified — refund processed'
                    : commitment.status === 'denied'
                    ? 'Verification denied'
                    : 'Verification under review'}
                </h3>
                <p className="text-text-muted text-sm mb-4">
                  {commitment.status === 'approved'
                    ? `Congratulations! ${formatCents(Math.round(commitment.amount_cents * 0.995))} has been refunded.`
                    : commitment.status === 'denied'
                    ? 'Your claim was not approved. You may file an appeal.'
                    : 'Our accountability specialists are reviewing your claim.'}
                </p>
                <Link to={`/commitment/${commitment.id}/review`}>
                  <Button variant="secondary" size="sm">View Review Details</Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Verification Details */}
        {commitment.verification && (
          <Card padding="md">
            <h3 className="font-semibold mb-3">Your Verification</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Achievement</span>
                <span className="font-medium">{commitment.verification.achievement_pct}%</span>
              </div>
              <div>
                <span className="text-text-muted">Description</span>
                <p className="mt-1 text-text bg-bg rounded-lg p-3">
                  {commitment.verification.description}
                </p>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Submitted</span>
                <span>{formatDateTime(commitment.verification.submitted_at)}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Pending Payment */}
        {commitment.status === 'pending_payment' && (
          <Card className="border-warning/50" padding="lg">
            <div className="text-center">
              <DollarSign className="w-8 h-8 text-warning mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Payment pending</h3>
              <p className="text-text-muted text-sm">
                This commitment is waiting for payment to activate.
                Complete your payment to put your money on the line.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
