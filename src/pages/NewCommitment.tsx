import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input, Textarea } from '../components/Input';
import { CloudLayer } from '../components/Clouds';
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
import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';

type Step = 'goal' | 'stakes' | 'deadline' | 'account' | 'contract' | 'pay';

function getSteps(loggedIn: boolean): Step[] {
  const base: Step[] = ['goal', 'stakes', 'deadline'];
  if (!loggedIn) base.push('account');
  base.push('contract', 'pay');
  return base;
}

const STEP_LABELS: Record<Step, string> = {
  goal: 'Goal',
  stakes: 'Stakes',
  deadline: 'Deadline',
  account: 'Account',
  contract: 'Contract',
  pay: 'Pay',
};

export function NewCommitment() {
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();
  const { createCommitment } = useCommitments();

  const steps = getSteps(!!user);

  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx];

  const [goal, setGoal] = useState('');
  const [amountCents, setAmountCents] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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
      case 'goal': return goal.trim().length >= 10;
      case 'stakes': return amountCents >= MIN_STAKE_CENTS && amountCents <= MAX_STAKE_CENTS;
      case 'deadline': return deadline && new Date(deadline) > new Date();
      case 'account': return false;
      case 'contract': return agreed;
      case 'pay': return true;
      default: return false;
    }
  };

  const next = () => { if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1); };
  const prev = () => { if (stepIdx > 0) setStepIdx(stepIdx - 1); };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (authMode === 'signup') {
      const { error: err } = await signUp(email, password);
      if (err) { setAuthError(err); setAuthLoading(false); return; }
    } else {
      const { error: err } = await signIn(email, password);
      if (err) { setAuthError(err); setAuthLoading(false); return; }
    }

    setAuthLoading(false);
    next();
  };

  const handlePayment = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const commitment = await createCommitment(
        goal.trim(),
        amountCents,
        new Date(deadline + 'T23:59:59Z').toISOString(),
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
        if (data?.url) { window.location.href = data.url; return; }
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
    <>
      <CloudLayer />
      <div className="lightning-flash" />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 relative z-10">
        {/* Back + progress */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={stepIdx === 0 ? () => navigate('/') : prev}
            className="flex items-center gap-1.5 text-text-dim hover:text-text-muted transition-colors cursor-pointer text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i <= stepIdx ? 'bg-accent w-6' : 'bg-border w-3'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] uppercase tracking-[0.15em] text-text-dim">
            {STEP_LABELS[step]}
          </span>
        </div>

        {/* ── GOAL ── */}
        {step === 'goal' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">What are you committing to?</h2>
              <p className="text-text-muted text-sm">
                Be specific and measurable. Something you can look at on the deadline and know yes or no.
              </p>
            </div>
            <Textarea
              placeholder='"Complete 20 LeetCode problems in 30 days"'
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-text-dim">
              {goal.trim().length < 10
                ? `${10 - goal.trim().length} more characters`
                : 'Good.'}
            </p>
          </div>
        )}

        {/* ── STAKES ── */}
        {step === 'stakes' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">How much?</h2>
              <p className="text-text-muted text-sm">Enough to sting. Not enough to ruin you.</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {STAKE_PRESETS.map((p) => (
                <button
                  key={p.cents}
                  onClick={() => { setAmountCents(p.cents); setCustomAmount(''); }}
                  className={`px-4 py-3 rounded-lg border text-center font-semibold transition-all cursor-pointer ${
                    amountCents === p.cents && !customAmount
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border hover:border-border-bright text-text-muted hover:text-text'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Input
              label="Custom ($)"
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                const c = Math.round(parseFloat(e.target.value || '0') * 100);
                if (c >= MIN_STAKE_CENTS && c <= MAX_STAKE_CENTS) setAmountCents(c);
              }}
              min={MIN_STAKE_CENTS / 100}
              max={MAX_STAKE_CENTS / 100}
              step="0.01"
            />

            <div className="bg-bg/60 backdrop-blur-sm rounded-lg p-4 space-y-1.5 text-sm border border-border/50">
              <div className="flex justify-between">
                <span className="text-text-dim">Stake</span>
                <span>{formatCents(amountCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Fee (0.5%)</span>
                <span className="text-text-dim">-{formatCents(platformFee)}</span>
              </div>
              <hr className="rule-ethereal" />
              <div className="flex justify-between font-medium">
                <span className="text-text-dim">If you succeed</span>
                <span className="text-accent">{formatCents(netRefund)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── DEADLINE ── */}
        {step === 'deadline' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">By when?</h2>
              <p className="text-text-muted text-sm">After this date, you verify whether you did it.</p>
            </div>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={minDate}
              max={maxDate}
            />
            {deadline && (
              <p className="text-sm text-text-muted">
                <span className="text-text font-medium">
                  {Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days.
                </span>
                {Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 3
                  ? ' Bold.'
                  : ''}
              </p>
            )}
          </div>
        )}

        {/* ── ACCOUNT (only if not logged in) ── */}
        {step === 'account' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                {authMode === 'signup' ? 'Create an account' : 'Sign in'}
              </h2>
              <p className="text-text-muted text-sm">
                So we know where to send the money back.
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder={authMode === 'signup' ? 'At least 6 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />

              {authError && (
                <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{authError}</p>
              )}

              <Button type="submit" className="w-full" loading={authLoading}>
                {authMode === 'signup' ? 'Create Account & Continue' : 'Sign In & Continue'}
              </Button>
            </form>

            <button
              className="text-sm text-text-dim hover:text-text-muted transition-colors cursor-pointer w-full text-center"
              onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setAuthError(''); }}
            >
              {authMode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        )}

        {/* ── CONTRACT ── */}
        {step === 'contract' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">The Contract</h2>
              <p className="text-text-muted text-sm">This is where it gets real.</p>
            </div>

            <Card padding="lg" className="bg-bg/60 backdrop-blur-sm">
              <div className="text-center mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-dim">Commitment Contract</p>
              </div>
              <div className="space-y-4 text-sm text-text-muted">
                <p>
                  I, <span className="text-text font-medium">{user?.email || email}</span>,
                  commit to:
                </p>
                <div className="bg-surface rounded-lg p-3">
                  <p className="text-text font-medium">{goal}</p>
                </div>
                <p>
                  I am staking <strong className="text-text">{formatCents(amountCents)}</strong> by{' '}
                  <strong className="text-text">
                    {deadline && new Date(deadline).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </strong>.
                </p>
                <p>
                  If I succeed: refund of <strong className="text-accent">{formatCents(netRefund)}</strong>.
                  If I fail: forfeited. Verification is honor-based.
                </p>
                <p className="text-xs text-text-dim italic">
                  This is a commitment contract, not a wager. Money I can afford to lose. Voluntary.
                </p>
              </div>
            </Card>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-accent cursor-pointer"
              />
              <span className="text-sm text-text-muted">
                I agree to this commitment contract.
              </span>
            </label>
          </div>
        )}

        {/* ── PAY ── */}
        {step === 'pay' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Time to pay</h2>
              <p className="text-text-muted text-sm">
                Succeed and it comes back. Fail and it doesn't.
              </p>
            </div>

            <div className="text-center py-8">
              <div className="text-5xl font-black glow-text">{formatCents(amountCents)}</div>
              <div className="text-text-dim text-sm mt-2">charged now</div>
            </div>

            {!isStripeConfigured() && (
              <div className="bg-warning/5 border border-warning/20 rounded-lg px-4 py-3">
                <p className="text-sm text-warning">
                  <strong>Demo:</strong> Stripe not configured. Commitment will be created without payment.
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button className="w-full" size="lg" loading={loading} onClick={handlePayment}>
              <CreditCard className="w-5 h-5" />
              {isStripeConfigured() ? `Pay ${formatCents(amountCents)}` : 'Create Commitment (Demo)'}
            </Button>

            <p className="text-xs text-text-dim text-center">
              Processed by Stripe. We never see your card.
            </p>
          </div>
        )}

        {/* ── NAV ── */}
        {step !== 'pay' && step !== 'account' && (
          <div className="mt-10 flex justify-end">
            <Button onClick={next} disabled={!canProceed()}>
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
