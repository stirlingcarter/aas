import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input, Textarea } from '../components/Input';
import { useCommitments } from '../hooks/useCommitments';
import { useAuth } from '../hooks/useAuth';
import { isStripeConfigured } from '../lib/stripe';
import { isConfigured as isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  STAKE_PRESETS,
  MIN_STAKE_CENTS,
  MAX_STAKE_CENTS,
  formatCents,
  PLATFORM_FEE_RATE,
} from '../lib/constants';
import {
  ArrowLeft,
  ArrowRight,
  Target,
  DollarSign,
  Calendar,
  FileText,
  CreditCard,
  Check,
} from 'lucide-react';

const STEPS = ['Goal', 'Stakes', 'Deadline', 'Contract', 'Pay'] as const;
type Step = (typeof STEPS)[number];

const STEP_ICONS = { Goal: Target, Stakes: DollarSign, Deadline: Calendar, Contract: FileText, Pay: CreditCard };

export function NewCommitment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCommitment } = useCommitments();

  const [step, setStep] = useState<Step>('Goal');
  const [goal, setGoal] = useState('');
  const [amountCents, setAmountCents] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentStepIndex = STEPS.indexOf(step);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const canProceed = () => {
    switch (step) {
      case 'Goal':
        return goal.trim().length >= 10;
      case 'Stakes':
        return amountCents >= MIN_STAKE_CENTS && amountCents <= MAX_STAKE_CENTS;
      case 'Deadline':
        return deadline && new Date(deadline) > new Date();
      case 'Contract':
        return agreed;
      case 'Pay':
        return true;
      default:
        return false;
    }
  };

  const next = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const prev = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const handlePayment = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const commitment = await createCommitment(
        goal.trim(),
        amountCents,
        new Date(deadline + 'T23:59:59Z').toISOString()
      );

      if (!commitment) throw new Error('Failed to create commitment');

      if (isStripeConfigured() && isSupabaseConfigured()) {
        const { data, error: fnErr } = await supabase.functions.invoke('create-checkout', {
          body: {
            commitment_id: commitment.id,
            amount_cents: amountCents,
            goal_description: goal.trim(),
          },
        });

        if (fnErr) throw fnErr;

        if (data?.url) {
          window.location.href = data.url;
          return;
        }
      }

      navigate(`/commitment/${commitment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const platformFee = Math.round(amountCents * PLATFORM_FEE_RATE);
  const stripeFee = Math.round(amountCents * 0.029 + 30);
  const netRefund = amountCents - platformFee;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-text-muted hover:text-text transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <h1 className="text-2xl font-bold mb-2">New Commitment</h1>
      <p className="text-text-muted mb-8">Put something real on the line.</p>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = STEP_ICONS[s];
          const isActive = i === currentStepIndex;
          const isDone = i < currentStepIndex;
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && (
                <div className={`w-8 h-px ${isDone ? 'bg-accent' : 'bg-border'}`} />
              )}
              <button
                onClick={() => i < currentStepIndex && setStep(STEPS[i])}
                disabled={i > currentStepIndex}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  transition-colors cursor-pointer
                  ${isActive ? 'bg-accent text-bg' : isDone ? 'bg-accent/20 text-accent' : 'bg-surface text-text-dim'}
                `}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{s}</span>
              </button>
            </div>
          );
        })}
      </div>

      <Card padding="lg">
        {/* Step: Goal */}
        {step === 'Goal' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-semibold mb-1">What are you committing to?</h2>
              <p className="text-text-muted text-sm">
                Be specific. Measurable goals work best. "Get healthier" is an aspiration.
                "Run 3 times per week for 4 weeks" is a commitment.
              </p>
            </div>
            <Textarea
              label="Your commitment"
              placeholder='e.g., "Complete 20 LeetCode problems in 30 days" or "Write 1000 words every day for 2 weeks"'
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-text-dim">
              {goal.trim().length < 10
                ? `${10 - goal.trim().length} more characters needed`
                : 'Looks good.'}
            </p>
          </div>
        )}

        {/* Step: Stakes */}
        {step === 'Stakes' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-semibold mb-1">How much are you staking?</h2>
              <p className="text-text-muted text-sm">
                Pick an amount that would sting to lose. Not enough to ruin your week,
                but enough that you'll think twice about skipping leg day.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {STAKE_PRESETS.map((preset) => (
                <button
                  key={preset.cents}
                  onClick={() => { setAmountCents(preset.cents); setCustomAmount(''); }}
                  className={`
                    px-4 py-3 rounded-lg border text-center font-semibold
                    transition-all cursor-pointer
                    ${amountCents === preset.cents && !customAmount
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border hover:border-border-bright text-text-muted hover:text-text'}
                  `}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div>
              <Input
                label="Custom amount"
                type="number"
                placeholder="Enter amount in dollars"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  const cents = Math.round(parseFloat(e.target.value || '0') * 100);
                  if (cents >= MIN_STAKE_CENTS && cents <= MAX_STAKE_CENTS) {
                    setAmountCents(cents);
                  }
                }}
                min={MIN_STAKE_CENTS / 100}
                max={MAX_STAKE_CENTS / 100}
                step="0.01"
              />
            </div>

            <div className="bg-bg rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">You stake</span>
                <span className="font-medium">{formatCents(amountCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Platform fee (0.5%)</span>
                <span className="text-text-dim">-{formatCents(platformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Stripe processing (est.)</span>
                <span className="text-text-dim">-{formatCents(stripeFee)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-text-muted">If you succeed, you get back</span>
                <span className="font-semibold text-accent">{formatCents(netRefund)}</span>
              </div>
              <p className="text-xs text-text-dim pt-1">
                Stripe processing fee ({formatCents(stripeFee)}) is non-refundable. Net cost of success: {formatCents(amountCents - netRefund + stripeFee)}.
              </p>
            </div>
          </div>
        )}

        {/* Step: Deadline */}
        {step === 'Deadline' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-semibold mb-1">When's the deadline?</h2>
              <p className="text-text-muted text-sm">
                Your goal must be achieved by this date. After the deadline, you'll be asked
                to verify whether you followed through.
              </p>
            </div>
            <Input
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={minDate}
              max={maxDate}
            />
            {deadline && (
              <p className="text-sm text-text-muted">
                That's{' '}
                <span className="text-text font-medium">
                  {Math.ceil(
                    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </span>{' '}
                from now.
                {Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 3
                  ? " Bold move."
                  : ""}
              </p>
            )}
          </div>
        )}

        {/* Step: Contract */}
        {step === 'Contract' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-semibold mb-1">The Contract</h2>
              <p className="text-text-muted text-sm">
                Review your commitment. This is the part where it gets real.
              </p>
            </div>

            <div className="bg-bg rounded-lg p-6 space-y-4 border border-border">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg">COMMITMENT CONTRACT</h3>
                <p className="text-text-dim text-xs">Accountability as a Service</p>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-text-dim">I,</span>{' '}
                  <span className="font-medium">{user?.email || 'the undersigned'}</span>
                  <span className="text-text-dim">, hereby commit to the following:</span>
                </div>

                <div className="bg-surface rounded-lg p-3">
                  <p className="font-medium">{goal}</p>
                </div>

                <p className="text-text-muted">
                  I am staking <strong className="text-text">{formatCents(amountCents)}</strong> of my real,
                  actual money on the completion of this goal by{' '}
                  <strong className="text-text">{new Date(deadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
                </p>

                <p className="text-text-muted">
                  I understand that if I achieve my goal, I will receive a refund of{' '}
                  <strong className="text-accent">{formatCents(amountCents - platformFee)}</strong> (original
                  amount minus 0.5% platform fee). Stripe processing fees are non-refundable.
                </p>

                <p className="text-text-muted">
                  I understand that if I fail, my money will be forfeited. I further understand
                  that verification is based on an honor system and I commit to reporting
                  honestly.
                </p>

                <p className="text-text-dim text-xs italic mt-4">
                  This is a commitment contract, not a wager. The purpose is behavioral
                  motivation through loss aversion. By proceeding, I acknowledge this is
                  money I can afford to lose and I am participating voluntarily.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border accent-accent cursor-pointer"
              />
              <span className="text-sm text-text-muted">
                I have read and agree to this commitment contract. I understand that my payment
                will be collected immediately and refunded only upon verified goal completion.
              </span>
            </label>
          </div>
        )}

        {/* Step: Pay */}
        {step === 'Pay' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-semibold mb-1">Time to pay up</h2>
              <p className="text-text-muted text-sm">
                Your payment will be held until the deadline. Succeed and it comes back.
                Fail and... well. You know.
              </p>
            </div>

            <div className="bg-bg rounded-lg p-6 text-center border border-border">
              <div className="text-4xl font-bold mb-1">{formatCents(amountCents)}</div>
              <div className="text-text-dim text-sm">will be charged now</div>
            </div>

            {!isStripeConfigured() && (
              <Card className="border-warning/50" padding="sm">
                <p className="text-sm text-warning">
                  <strong>Demo Mode:</strong> Stripe is not configured. The commitment will be created
                  but no payment will be collected. Add VITE_STRIPE_PUBLISHABLE_KEY to .env.
                </p>
              </Card>
            )}

            {error && (
              <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button
              className="w-full"
              size="lg"
              loading={loading}
              onClick={handlePayment}
            >
              <CreditCard className="w-5 h-5" />
              {isStripeConfigured() ? `Pay ${formatCents(amountCents)}` : `Create Commitment (Demo)`}
            </Button>

            <p className="text-xs text-text-dim text-center">
              Payments processed securely by Stripe. We never see your card details.
            </p>
          </div>
        )}

        {/* Navigation */}
        {step !== 'Pay' && (
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button variant="ghost" onClick={prev} disabled={currentStepIndex === 0}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button onClick={next} disabled={!canProceed()}>
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
