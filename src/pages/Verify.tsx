import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Textarea } from '../components/Input';
import { useCommitments } from '../hooks/useCommitments';
import { formatCents } from '../lib/constants';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export function Verify() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { commitments, submitVerification } = useCommitments();

  const [achievementPct, setAchievementPct] = useState(100);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const commitment = commitments.find((c) => c.id === id);

  if (!commitment) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
        <h1 className="text-xl font-bold mb-4">Commitment not found</h1>
        <Link to="/dashboard"><Button variant="secondary">Dashboard</Button></Link>
      </div>
    );
  }

  if (commitment.verification) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Already verified</h1>
        <p className="text-text-muted mb-6">You've already submitted your verification for this commitment.</p>
        <Link to={`/commitment/${commitment.id}/review`}>
          <Button variant="secondary">View Review Status</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please describe what you accomplished.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await submitVerification(commitment.id, achievementPct, description.trim());
      navigate(`/commitment/${commitment.id}/review`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  const refundAmount = Math.round(commitment.amount_cents * 0.995);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-text-muted hover:text-text transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <h1 className="text-2xl font-bold mb-2">Verify Your Progress</h1>
      <p className="text-text-muted mb-8">
        Be honest. That's the whole deal.
      </p>

      <div className="space-y-6 animate-fade-in">
        {/* Commitment Reminder */}
        <Card padding="md" className="bg-bg">
          <p className="text-sm text-text-muted mb-1">Your commitment:</p>
          <p className="font-medium">{commitment.goal_description}</p>
          <p className="text-sm text-text-dim mt-2">
            {formatCents(commitment.amount_cents)} at stake
          </p>
        </Card>

        {/* Achievement Slider */}
        <Card padding="lg">
          <h3 className="font-semibold mb-1">How much of your goal did you achieve?</h3>
          <p className="text-text-muted text-sm mb-6">
            Like levels.fyi but for your life goals. Self-reported, honor system.
            We trust you. (Our review team will also trust you, eventually.)
          </p>

          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-5xl font-bold font-mono tabular-nums ${
                achievementPct >= 80 ? 'text-accent' :
                achievementPct >= 50 ? 'text-warning' :
                'text-danger'
              }`}>
                {achievementPct}%
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={achievementPct}
              onChange={(e) => setAchievementPct(Number(e.target.value))}
              className="w-full h-2 bg-surface rounded-full appearance-none cursor-pointer accent-accent"
            />

            <div className="flex justify-between text-xs text-text-dim">
              <span>0% — Didn't even try</span>
              <span>100% — Nailed it</span>
            </div>

            {/* Feedback based on percentage */}
            <div className={`rounded-lg p-3 text-sm flex items-center gap-2 ${
              achievementPct >= 80 ? 'bg-accent/10 text-accent' :
              achievementPct >= 50 ? 'bg-warning/10 text-warning' :
              'bg-danger/10 text-danger'
            }`}>
              {achievementPct >= 80 ? (
                <><CheckCircle2 className="w-4 h-4 shrink-0" /> Nice. Claims at 50%+ are eligible for a refund of {formatCents(refundAmount)}.</>
              ) : achievementPct >= 50 ? (
                <><AlertTriangle className="w-4 h-4 shrink-0" /> Halfway there. Claims at 50%+ are eligible for a refund.</>
              ) : (
                <><XCircle className="w-4 h-4 shrink-0" /> Claims below 50% will be denied. Your {formatCents(commitment.amount_cents)} will be forfeited.</>
              )}
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card padding="lg">
          <Textarea
            label="Describe what you accomplished"
            placeholder="Be specific. What did you do? What evidence do you have? Our accountability specialists are very thorough (they are not)."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </Card>

        {error && (
          <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Submit */}
        <div className="flex flex-col gap-3">
          <Button size="lg" className="w-full" loading={loading} onClick={handleSubmit}>
            Submit for Review
          </Button>
          <p className="text-xs text-text-dim text-center">
            Once submitted, your claim will undergo our rigorous and completely opaque review process.
          </p>
        </div>
      </div>
    </div>
  );
}
