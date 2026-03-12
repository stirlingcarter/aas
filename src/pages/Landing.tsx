import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import {
  Target,
  DollarSign,
  CheckCircle2,
  Clock,
  ChevronDown,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const STEPS = [
  {
    icon: Target,
    title: 'Set a goal',
    description: "Describe what you're going to do. Be specific. \"Get fit\" doesn't cut it. \"Run 3x per week for a month\" does.",
  },
  {
    icon: DollarSign,
    title: 'Stake real money',
    description: "Put $25 to $500 on the line. Enough that losing it would sting. Not enough to ruin you. You know the number.",
  },
  {
    icon: Clock,
    title: 'Actually do the thing',
    description: "We can't help you here. That's the point. No AI coach. No push notifications. Just the knowledge that your money is on the line.",
  },
  {
    icon: CheckCircle2,
    title: 'Get your money back',
    description: "Self-report your progress honestly. Our rigorous review process* will verify your claim. Money returned minus 0.5%.",
  },
];

const FAQS = [
  {
    q: "Wait, you just trust people to tell the truth?",
    a: "Yes. It's an honor system, like levels.fyi for salary data. We also run every claim through a review process that is extremely thorough and completely opaque. The friction alone keeps the honest people honest and the dishonest people annoyed.",
  },
  {
    q: "What happens to my money if I fail?",
    a: "It stays with us. We use it to fund our lavish operational costs (a Supabase free tier and a domain name). Think of it as a donation to the concept of accountability.",
  },
  {
    q: "What's the 0.5% fee?",
    a: "Our cut. On a $100 commitment, that's 50 cents. We think that's a fair price for the privilege of being held accountable by a website. Stripe also takes ~2.9% + $0.30 on the initial charge, which isn't refunded. Net cost on a $100 success: about $4.",
  },
  {
    q: "Is this legal?",
    a: "It's a commitment contract. stickK (founded by Yale economists) has been doing this since 2008 with $69 million on the line. We're doing the same thing but funnier.",
  },
  {
    q: 'What if your "review process" incorrectly denies my claim?',
    a: "You can appeal. Appeals are reviewed by our senior accountability specialists and are handled with the utmost care and attention. We take every appeal very seriously.",
  },
  {
    q: "Is this just stickK but worse?",
    a: "stickK is a beautiful product made by brilliant economists at Yale. We are a website that calls itself AAS. Draw your own conclusions. (But if it works, is it dumb?)",
  },
  {
    q: "Who is this for?",
    a: "Procrastinators with disposable income. People who own 12 productivity apps and still don't go to the gym. Side-project abandonoors. Resolution breakers. If you've ever set a goal on January 1st and forgotten it by January 3rd, welcome home.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-text group-hover:text-accent transition-colors pr-4">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}
      >
        <p className="text-text-muted leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export function Landing() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border text-sm text-text-muted mb-8 animate-fade-in">
              <Zap className="w-3.5 h-3.5 text-accent" />
              Doing what AI patently cannot
            </div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] animate-fade-in stagger-1">
              Accountability
              <br />
              <span className="text-accent">as a Service</span>
            </h1>

            <p className="mt-6 text-xl sm:text-2xl text-text-muted leading-relaxed animate-fade-in stagger-2">
              Put your money where your mouth is.{' '}
              <span className="text-text font-medium">Literally.</span>
            </p>

            <p className="mt-4 text-lg text-text-dim italic animate-fade-in stagger-3">
              If it works, is it dumb?
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in stagger-4">
              <Link to={user ? '/new' : '/auth'}>
                <Button size="lg">
                  Commit to Something
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="secondary" size="lg">
                  How It Works
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="border-y border-border bg-surface/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-accent">$0</div>
              <div className="text-sm text-text-muted mt-1">Total staked so far</div>
              <div className="text-xs text-text-dim mt-0.5">(we just launched, give us a minute)</div>
            </div>
            <div>
              <div className="text-3xl font-bold">0.5%</div>
              <div className="text-sm text-text-muted mt-1">Platform fee</div>
              <div className="text-xs text-text-dim mt-0.5">That's 50 cents on $100</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-warning">100%</div>
              <div className="text-sm text-text-muted mt-1">Honor system</div>
              <div className="text-xs text-text-dim mt-0.5">We trust you (mostly)</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Four steps to not being a flake
            </h2>
            <p className="mt-4 text-text-muted text-lg">
              Simple enough that you can't procrastinate on learning how it works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative bg-surface border border-border rounded-xl p-6 hover:border-border-bright transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-xs font-mono text-text-dim">STEP {i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-text-dim mt-8">
            *&quot;Rigorous review process&quot; may consist entirely of a timer and a progress bar.
          </p>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 border-t border-border bg-surface/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Loss aversion is real</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Behavioral economics says losing $50 hurts more than gaining $50 feels good.
                We didn't invent the science. We just put it on a website.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Skin in the game</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Free accountability apps have a 0% accountability rate (we made that up, but
                it feels right). When real money is involved, priorities shift.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-danger" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No coaching, no AI, no BS</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                We're not going to send you motivational quotes. We're not going to track your
                steps. We're just going to hold your money hostage until you do the thing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div>
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to put your money
            <br />
            where your mouth is?
          </h2>
          <p className="mt-4 text-text-muted text-lg">
            The first step is always the hardest. The second step is paying us.
          </p>
          <div className="mt-8">
            <Link to={user ? '/new' : '/auth'}>
              <Button size="lg">
                Make a Commitment
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
