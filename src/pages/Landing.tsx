import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const FAQS = [
  {
    q: "You just... trust people?",
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
    q: 'What if your "review process" incorrectly denies me?',
    a: "You can appeal. Appeals are reviewed by our senior accountability specialists and are handled with the utmost care and attention. We take every appeal very seriously.",
  },
  {
    q: "Is this just stickK but worse?",
    a: "stickK is a beautiful product made by brilliant economists at Yale. We are a website that calls itself AAS. Draw your own conclusions. (But if it works, is it dumb?)",
  },
  {
    q: "Who is this for?",
    a: "Procrastinators with disposable income. People who own 12 productivity apps and still don't go to the gym. Side-project abandoners. Resolution breakers. If you've ever set a goal on January 1st and forgotten it by January 3rd — welcome home.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50">
      <button
        className="w-full flex items-center justify-between py-6 text-left cursor-pointer group"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-baseline gap-4 pr-4">
          <span className="text-xs font-mono text-text-dim tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          <span className="font-medium text-text/90 group-hover:text-text transition-colors">{q}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-dim shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-out ${open ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="text-text-muted leading-relaxed pl-10">{a}</p>
      </div>
    </div>
  );
}

export function Landing() {
  const { user } = useAuth();

  return (
    <div className="relative">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Atmospheric background */}
        <div className="absolute inset-0">
          <div className="cloud cloud-1" style={{ top: '-10%', left: '-5%' }} />
          <div className="cloud cloud-2" style={{ top: '20%', right: '-10%' }} />
          <div className="cloud cloud-3" style={{ bottom: '-5%', left: '10%' }} />
          <div className="lightning-flash" />
          <div className="lightning-flash-2" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center py-20">
          <p className="text-[11px] uppercase tracking-dramatic text-text-dim font-medium mb-12 animate-fade-in">
            Accountability as a Service
          </p>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] animate-fade-in stagger-1 glow-text-subtle">
            If it works,
            <br />
            <span className="glow-text text-accent">is it dumb?</span>
          </h1>

          <p className="mt-10 text-lg sm:text-xl text-text-muted max-w-xl mx-auto leading-relaxed animate-fade-in stagger-2">
            Stake real money on your goals.
            <br className="hidden sm:block" />
            Get it back when you follow through.
          </p>

          <div className="mt-14 animate-fade-in stagger-3">
            <Link to={user ? '/new' : '/auth'}>
              <Button size="lg">
                Enter
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <p className="mt-20 text-[10px] uppercase tracking-dramatic text-text-dim/60 animate-fade-in stagger-4">
            Minus 0.5%. For our trouble.
          </p>
        </div>
      </section>

      {/* ═══ FOG TRANSITION ═══ */}
      <div className="fog-divider" />

      {/* ═══ THE PREMISE ═══ */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <div className="cloud cloud-2" style={{ top: '10%', left: '-15%', opacity: 0.5 }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-dramatic text-text-dim font-medium mb-8">The Premise</p>
          <div className="space-y-8 text-lg sm:text-xl text-text-muted leading-relaxed">
            <p>
              You have goals. You don't follow through.
              <br />
              <span className="text-text/70">This is not news to you.</span>
            </p>
            <p>
              You've tried apps. You've tried habits.
              <br />
              You've tried telling yourself <span className="italic">this time will be different.</span>
            </p>
            <p className="text-text">
              What you haven't tried is giving a website your money
              and only getting it back if you actually do the thing.
            </p>
          </div>
        </div>
      </section>

      <hr className="rule-ethereal max-w-md mx-auto" />

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="relative py-28 sm:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <div className="cloud cloud-3" style={{ bottom: '0', right: '-10%', opacity: 0.4 }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-dramatic text-text-dim font-medium mb-16">How it works</p>
          <div className="space-y-16">
            {[
              {
                num: '01',
                title: 'Set a goal',
                body: "Be specific. Measurable. Something you can look at in 30 days and know whether you did it or not.",
              },
              {
                num: '02',
                title: 'Stake real money',
                body: "$25 to $500. Enough that losing it would sting. Not enough to ruin you. You know the number.",
              },
              {
                num: '03',
                title: 'Do the thing',
                body: "No AI coach. No push notifications. No motivational quotes. Just you, your goal, and the quiet awareness that your money is being held hostage.",
              },
              {
                num: '04',
                title: 'Report back honestly',
                body: "Self-report your progress. Our opaque and extremely rigorous review process will take it from there.",
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-6 sm:gap-8">
                <span className="text-sm font-mono text-accent/50 pt-1 shrink-0">{step.num}</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-text mb-2">{step.title}</h3>
                  <p className="text-text-muted leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-dim/50 mt-16 pl-12 sm:pl-16 italic">
            * "Rigorous review process" may consist entirely of a timer and a progress bar.
          </p>
        </div>
      </section>

      <div className="fog-divider" />

      {/* ═══ THE SCIENCE ═══ */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <div className="cloud cloud-1" style={{ top: '5%', right: '-5%', opacity: 0.3 }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-dramatic text-text-dim font-medium mb-8">Why it works</p>

          <blockquote className="text-2xl sm:text-3xl font-light text-text/80 leading-snug mb-8 glow-text-subtle">
            "Losses loom larger than gains."
          </blockquote>
          <p className="text-sm text-text-dim mb-12">
            — Kahneman & Tversky, 1979. Prospect Theory.
          </p>

          <div className="space-y-6 text-text-muted leading-relaxed">
            <p>
              Loss aversion is one of the most replicated findings in behavioral economics.
              Losing $50 hurts roughly twice as much as gaining $50 feels good.
            </p>
            <p>
              stickK, the Yale-backed commitment contract platform, has put this to the test:
              <span className="text-text font-medium"> $69 million staked</span> across 644,000 commitments.
              Users with financial stakes succeed at significantly higher rates than those without.
            </p>
            <p className="text-text/70">
              We didn't invent the science. We just put it on a website and gave it an unfortunate acronym.
            </p>
          </div>
        </div>
      </section>

      <hr className="rule-ethereal max-w-md mx-auto" />

      {/* ═══ FAQ ═══ */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <div className="cloud cloud-2" style={{ top: '30%', left: '-10%', opacity: 0.3 }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-dramatic text-text-dim font-medium mb-12">Questions</p>
          <div>
            {FAQS.map((faq, i) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      <div className="fog-divider" />

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative py-36 sm:py-44 overflow-hidden">
        <div className="absolute inset-0">
          <div className="cloud cloud-1" style={{ top: '10%', left: '20%', opacity: 0.4 }} />
          <div className="cloud cloud-3" style={{ bottom: '10%', right: '10%', opacity: 0.3 }} />
          <div className="lightning-flash" />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] glow-text-subtle">
            You already know
            <br />
            what you need to do.
          </h2>
          <p className="mt-6 text-text-muted text-lg">
            The first step is the hardest. The second step is paying us.
          </p>
          <div className="mt-12">
            <Link to={user ? '/new' : '/auth'}>
              <Button size="lg">
                Make a commitment
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
