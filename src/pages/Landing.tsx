import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { Button } from '../components/Button';
import { CloudLayer } from '../components/Clouds';
import { useAuth } from '../hooks/useAuth';

const SLIDE_COUNT = 6;

export function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const go = useCallback(
    (index: number) => {
      if (transitioning || index === current || index < 0 || index >= SLIDE_COUNT) return;
      setTransitioning(true);
      setCurrent(index);
      setTimeout(() => setTransitioning(false), 650);
    },
    [current, transitioning],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        go(current + 1);
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        go(current - 1);
      }
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) > 50) {
        go(delta > 0 ? current + 1 : current - 1);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 30) {
        e.preventDefault();
        go(e.deltaY > 0 ? current + 1 : current - 1);
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('wheel', onWheel);
    };
  }, [current, go]);

  const slideClass = (i: number) =>
    `slide ${i === current ? 'slide-active' : i < current ? 'slide-above' : 'slide-below'}`;

  return (
    <>
      <CloudLayer />
      <div className="lightning-flash" />
      <div className="lightning-flash-2" />

      <div className="slide-container">
        {/* ── 0: TITLE ── */}
        <div className={slideClass(0)}>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-medium mb-10 animate-fade-in">
              Accountability as a Service
            </p>
            <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[0.92] animate-fade-in stagger-1 glow-text-subtle">
              If it works,
              <br />
              <span className="glow-text text-accent">is it dumb?</span>
            </h1>
            <p className="mt-8 text-lg text-text-muted animate-fade-in stagger-2">
              Stake real money on your goals. Get it back when you follow through.
            </p>
            <div className="mt-14 animate-fade-in stagger-3">
              <button
                onClick={() => go(1)}
                className="inline-flex items-center gap-2 text-sm text-text-dim hover:text-text-muted transition-colors cursor-pointer"
              >
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          </div>
        </div>

        {/* ── 1: THE PREMISE ── */}
        <div className={slideClass(1)}>
          <div className="max-w-xl mx-auto relative z-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-medium mb-10">
              The Premise
            </p>
            <div className="space-y-6 text-xl sm:text-2xl text-text-muted leading-relaxed font-light">
              <p>
                You have goals.
                <br />
                <span className="text-text/60">You don't follow through.</span>
              </p>
              <p>
                You've tried apps. Habits. Willpower.
              </p>
              <p className="text-text font-normal">
                You haven't tried giving a website your money
                and only getting it back if you do the thing.
              </p>
            </div>
          </div>
        </div>

        {/* ── 2: HOW ── */}
        <div className={slideClass(2)}>
          <div className="max-w-lg mx-auto relative z-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-medium mb-12">
              How it works
            </p>
            <div className="space-y-10">
              {[
                ['01', 'Set a goal', 'Specific. Measurable. No ambiguity.'],
                ['02', 'Stake money', '$25 – $500. Enough to sting.'],
                ['03', 'Do the thing', 'No coach. No AI. Just you and stakes.'],
                ['04', 'Report back', 'Honor system. Then our opaque review.'],
              ].map(([num, title, body]) => (
                <div key={num} className="flex gap-6">
                  <span className="text-sm font-mono text-accent/40 pt-0.5 shrink-0">{num}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
                    <p className="text-text-muted text-sm">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3: THE SCIENCE ── */}
        <div className={slideClass(3)}>
          <div className="max-w-xl mx-auto text-center relative z-10">
            <blockquote className="text-2xl sm:text-4xl font-light text-text/80 leading-snug glow-text-subtle">
              "Losses loom larger
              <br />
              than gains."
            </blockquote>
            <p className="text-sm text-text-dim mt-6">
              Kahneman & Tversky, 1979
            </p>
            <hr className="rule-ethereal max-w-[200px] mx-auto my-10" />
            <p className="text-text-muted leading-relaxed max-w-md mx-auto">
              stickK has put <span className="text-text font-medium">$69 million</span> on the line
              across 644,000 commitment contracts. Users with financial stakes succeed
              at significantly higher rates. We just made it weirder.
            </p>
          </div>
        </div>

        {/* ── 4: THE FINE PRINT ── */}
        <div className={slideClass(4)}>
          <div className="max-w-md mx-auto relative z-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-text-dim font-medium mb-10">
              The fine print
            </p>
            <div className="space-y-6 text-sm text-text-muted">
              <p>
                <span className="text-text font-medium">If you succeed:</span> your money
                comes back, minus 0.5% for our trouble.
              </p>
              <p>
                <span className="text-text font-medium">If you fail:</span> the money stays
                with us. Think of it as a donation to the concept of accountability.
              </p>
              <p>
                <span className="text-text font-medium">Verification:</span> honor system.
                You self-report. Our review process is rigorous and completely opaque.
                There are no accountability specialists.
              </p>
              <p>
                <span className="text-text font-medium">Appeals:</span> always taken
                very seriously. The friction is the point.
              </p>
            </div>
          </div>
        </div>

        {/* ── 5: CTA ── */}
        <div className={slideClass(5)}>
          <div className="max-w-xl mx-auto text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] glow-text-subtle mb-6">
              You already know
              <br />
              what you need to do.
            </h2>
            <p className="text-text-muted text-base mb-12">
              The first step is the hardest. The second step is paying us.
            </p>
            <Button size="lg" onClick={() => navigate(user ? '/new' : '/new')}>
              Make a commitment
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-dim/40 mt-16">
              Doing what AI patently cannot: offering accountability.
            </p>
          </div>
        </div>
      </div>

      {/* ── NAV DOTS ── */}
      <div className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`nav-dot ${i === current ? 'nav-dot-active' : ''}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}
