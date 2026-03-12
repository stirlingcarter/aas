import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import { Textarea } from '../components/Input';
import { useCommitments } from '../hooks/useCommitments';
import { REVIEW_STAGES, formatCents, formatDateTime } from '../lib/constants';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

function ReviewInProgress({ reviewCompletedAt }: { reviewCompletedAt: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const startedAt = useMemo(() => {
    const completedMs = new Date(reviewCompletedAt).getTime();
    const delayMs = completedMs - Date.now();
    const totalDuration = Math.max(delayMs + Date.now() - (Date.now() - 1000), 24 * 60 * 60 * 1000);
    return completedMs - totalDuration;
  }, [reviewCompletedAt]);

  const completedMs = new Date(reviewCompletedAt).getTime();
  const totalDuration = completedMs - startedAt;
  const elapsed = now - startedAt;
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  const stageIndex = Math.min(
    REVIEW_STAGES.length - 1,
    Math.floor((progress / 100) * REVIEW_STAGES.length)
  );

  const timeRemaining = Math.max(0, completedMs - now);
  const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-text-muted animate-pulse-subtle" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Review in Progress</h2>
        <p className="text-text-muted">
          Our accountability specialists are reviewing your claim.
        </p>
      </div>

      <Card padding="lg">
        <div className="space-y-6">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted">Review progress</span>
              <span className="font-mono text-text-dim">{Math.round(progress)}%</span>
            </div>
            <ProgressBar progress={progress} />
          </div>

          {/* Current stage */}
          <div className="space-y-3">
            {REVIEW_STAGES.map((stage, i) => {
              const isDone = i < stageIndex;
              const isCurrent = i === stageIndex;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isDone ? 'bg-accent/20' :
                    isCurrent ? 'bg-surface border border-accent' :
                    'bg-surface border border-border'
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse-subtle" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-border" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    isDone ? 'text-text-muted line-through' :
                    isCurrent ? 'text-text font-medium' :
                    'text-text-dim'
                  }`}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time remaining */}
          <div className="bg-bg rounded-lg p-4 text-center">
            <Clock className="w-5 h-5 text-text-dim mx-auto mb-2" />
            <p className="text-sm text-text-muted">
              Estimated time remaining:{' '}
              <span className="font-mono font-medium text-text">
                {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`}
              </span>
            </p>
            <p className="text-xs text-text-dim mt-1">
              Reviews typically take 24-72 hours. We appreciate your patience.
            </p>
          </div>
        </div>
      </Card>

      <p className="text-xs text-text-dim text-center italic">
        Our review process is rigorous, thorough, and entirely opaque by design.
        We believe transparency is overrated when it comes to accountability verification.
      </p>
    </div>
  );
}

export function Review() {
  const { id } = useParams<{ id: string }>();
  const { commitments, submitAppeal } = useCommitments();
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealLoading, setAppealLoading] = useState(false);
  const [appealError, setAppealError] = useState('');

  const commitment = commitments.find((c) => c.id === id);

  if (!commitment) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
        <h1 className="text-xl font-bold mb-4">Commitment not found</h1>
        <Link to="/dashboard"><Button variant="secondary">Dashboard</Button></Link>
      </div>
    );
  }

  const handleAppeal = async () => {
    if (!appealReason.trim()) {
      setAppealError('Please provide a reason for your appeal.');
      return;
    }
    setAppealLoading(true);
    setAppealError('');
    try {
      await submitAppeal(commitment.id, appealReason.trim());
      setAppealModalOpen(false);
      setAppealReason('');
    } catch (err) {
      setAppealError(err instanceof Error ? err.message : 'Failed to submit appeal');
    } finally {
      setAppealLoading(false);
    }
  };

  const refundAmount = formatCents(Math.round(commitment.amount_cents * 0.995));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to={`/commitment/${commitment.id}`}
        className="flex items-center gap-1 text-text-muted hover:text-text transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to commitment</span>
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge status={commitment.status} />
        </div>
        <h1 className="text-xl font-bold">{commitment.goal_description}</h1>
      </div>

      {/* Under Review */}
      {commitment.status === 'under_review' && commitment.review_completed_at && (
        <ReviewInProgress reviewCompletedAt={commitment.review_completed_at} />
      )}

      {/* Approved */}
      {commitment.status === 'approved' && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Goal Verified</h2>
            <p className="text-text-muted">
              Congratulations. You did the thing. We're genuinely impressed
              (and slightly surprised).
            </p>
          </div>

          <Card padding="lg" className="border-accent/30">
            <div className="text-center space-y-4">
              <div>
                <div className="text-3xl font-bold text-accent">{refundAmount}</div>
                <div className="text-sm text-text-muted">refunded to your original payment method</div>
              </div>
              <div className="bg-bg rounded-lg p-4 text-sm text-text-muted">
                <p>Original stake: {formatCents(commitment.amount_cents)}</p>
                <p>Platform fee (0.5%): -{formatCents(Math.round(commitment.amount_cents * 0.005))}</p>
                <p className="font-medium text-accent mt-1">Refund: {refundAmount}</p>
              </div>
              {commitment.verified_at && (
                <p className="text-xs text-text-dim">
                  Verified {formatDateTime(commitment.verified_at)}
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Denied */}
      {commitment.status === 'denied' && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-danger" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Claim Denied</h2>
            <p className="text-text-muted">
              Our review determined that your goal was not sufficiently achieved.
              Your stake of {formatCents(commitment.amount_cents)} has been forfeited.
            </p>
          </div>

          {!commitment.appeal && (
            <Card padding="lg" className="border-warning/30">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Think this is wrong?</h3>
                  <p className="text-text-muted text-sm mb-3">
                    You can file an appeal. Our senior accountability specialists will
                    review your case with the utmost care and attention.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setAppealModalOpen(true)}>
                    File an Appeal
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {commitment.appeal && (
            <Card padding="lg">
              <h3 className="font-semibold mb-3">Appeal Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Status</span>
                  <span className={commitment.appeal.status === 'approved' ? 'text-accent font-medium' : 'text-warning font-medium'}>
                    {commitment.appeal.status === 'approved' ? 'Approved' : 'Under Review'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Filed</span>
                  <span>{formatDateTime(commitment.appeal.submitted_at)}</span>
                </div>
                {commitment.appeal.resolved_at && commitment.appeal.status === 'pending' && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Expected resolution</span>
                    <span>{formatDateTime(commitment.appeal.resolved_at)}</span>
                  </div>
                )}
              </div>
              {commitment.appeal.status === 'approved' && (
                <div className="mt-4 bg-accent/10 rounded-lg p-3 text-sm text-accent">
                  Your appeal was approved. A refund of {refundAmount} has been processed.
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Appeal Modal */}
      <Modal open={appealModalOpen} onClose={() => setAppealModalOpen(false)} title="File an Appeal">
        <div className="space-y-4">
          <p className="text-text-muted text-sm">
            Explain why you believe your claim was incorrectly denied.
            Our senior accountability specialists will review your appeal within 24 hours.
          </p>
          <Textarea
            label="Reason for appeal"
            placeholder="I believe my claim was denied in error because..."
            value={appealReason}
            onChange={(e) => setAppealReason(e.target.value)}
            rows={4}
          />
          {appealError && (
            <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{appealError}</p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAppealModalOpen(false)}>Cancel</Button>
            <Button loading={appealLoading} onClick={handleAppeal}>Submit Appeal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
