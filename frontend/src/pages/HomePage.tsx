import { useNavigate } from 'react-router-dom';
import { BrainIcon, ZapIcon, MessageCircleIcon } from 'lucide-animated';

/**
 * Root landing: choose where to go instead of dropping users into the chat learn flow.
 */
export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-0 px-6 relative overflow-hidden">
      <div
        className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[min(560px,90vw)] h-[420px] pointer-events-none z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(130, 165, 220, 0.06) 0%, rgba(90, 120, 180, 0.02) 45%, transparent 72%)',
        }}
      />

      <div className="flex flex-col items-center gap-10 max-w-[560px] w-full relative z-10">
        <div className="text-center" style={{ animation: 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <h1
            className="text-[44px] sm:text-[52px] leading-[1.05] tracking-[-0.03em] text-text"
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
          >
            What do you want to do!
          </h1>
          <p className="text-[14px] text-text-dim mt-4 max-w-[440px] mx-auto leading-[1.7]">
            Explore sites in the browser, capture RL playbooks, or race baseline vs Rocket.
          </p>
        </div>

        <div className="w-full grid gap-3 sm:grid-cols-1" style={{ animation: 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 80ms both' }}>
          <button
            type="button"
            onClick={() => navigate('/learn')}
            className="group flex items-start gap-4 w-full text-left rounded-2xl px-5 py-4 border border-border/80 bg-white/[0.02] hover:bg-white/[0.04] hover:border-lime/20 transition-all saas-card"
          >
            <div className="w-11 h-11 rounded-xl bg-lime/10 flex items-center justify-center shrink-0 border border-lime/10">
              <MessageCircleIcon size={22} className="text-lime" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="text-[15px] font-medium text-text">Explore in the browser</div>
              <p className="text-[12px] text-text-dim mt-1 leading-relaxed">
                Describe a flow or site—if we&apos;ve learned it before, we&apos;ll be fast.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/rl/learn')}
            className="group flex items-start gap-4 w-full text-left rounded-2xl px-5 py-4 border border-border/80 bg-white/[0.02] hover:bg-white/[0.04] hover:border-amber-400/20 transition-all saas-card"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0 border border-amber-400/10">
              <BrainIcon size={22} className="text-amber-400" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="text-[15px] font-medium text-text">Train a playbook (RL)</div>
              <p className="text-[12px] text-text-dim mt-1 leading-relaxed">
                Run the learning agent and capture steps as a reusable template.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/rl/race')}
            className="group flex items-start gap-4 w-full text-left rounded-2xl px-5 py-4 border border-border/80 bg-white/[0.02] hover:bg-white/[0.04] hover:border-sky/20 transition-all saas-card"
          >
            <div className="w-11 h-11 rounded-xl bg-sky/10 flex items-center justify-center shrink-0 border border-sky/15">
              <ZapIcon size={22} className="text-sky" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="text-[15px] font-medium text-text">Race baseline vs Rocket</div>
              <p className="text-[12px] text-text-dim mt-1 leading-relaxed">
                Compare vanilla agent speed against a template-matched run.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
