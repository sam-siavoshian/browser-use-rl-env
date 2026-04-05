import { useEffect, useState } from 'react';

export function Analogy() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full max-w-[620px]">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#0e0e10',
          border: '1px solid rgba(35,35,40,1)',
          boxShadow: 'inset 0 5px 14px rgba(0,0,0,0.35), inset 0 2px 4px rgba(0,0,0,0.25), inset 0 -2px 6px rgba(255,255,255,0.02), 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {/* Framing */}
        <div className="px-5 pt-4 pb-3">
          <p className="text-[12px] text-text-dim leading-[1.6] text-center">
            When the path is known, replay beats rethink. A forged path executes in milliseconds
            what used to take a full LLM reasoning loop every time.
            <br />
            Run once. Record the template. Replay forever.
          </p>
        </div>

        <div className="h-px" style={{ background: '#1a1a1f' }} />

        {/* Side by side */}
        <div className="grid grid-cols-[1fr_1px_1fr]">
          <div className="p-4 text-center">
            <p className="text-[9px] font-mono text-text-muted uppercase tracking-[0.2em] mb-2">Without</p>
            <p className="font-serif italic text-[36px] leading-none text-text-muted tracking-tight">~40s</p>
            <p className="text-[11px] text-text-muted mt-2">Vanilla browser-use agent</p>
            <p className="text-[10px] text-text-muted/50 mt-0.5">LLM reasons through every click</p>
          </div>

          <div className="relative" style={{ background: '#1a1a1f' }}>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-mono text-text-muted px-1" style={{ background: '#0e0e10' }}>vs</span>
          </div>

          <div className="p-4 text-center">
            <p className="text-[9px] font-mono text-lime uppercase tracking-[0.2em] mb-2">Forged</p>
            <p className="font-serif italic text-[36px] leading-none text-lime tracking-tight">~8s</p>
            <p className="text-[11px] text-text mt-2">Agent + Forged</p>
            <p className="text-[10px] text-text-muted/50 mt-0.5">Playwright replays, agent finishes</p>
          </div>
        </div>

        <div className="h-px" style={{ background: '#1a1a1f' }} />

        {/* Animated race bars */}
        <div className="px-5 py-3.5 space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 text-right font-mono text-[10px] text-text-muted tabular-nums">40s</span>
            <div
              className="flex-1 h-2.5 rounded-lg overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.3)',
                boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.45), inset 0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              <div
                className="h-full rounded-lg origin-left"
                style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, rgba(255,107,53,0.25), rgba(255,107,53,0.05))',
                  transform: animate ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 3s cubic-bezier(0.1, 0, 0.3, 1)',
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-8 text-right font-mono text-[10px] text-lime font-medium tabular-nums">8s</span>
            <div
              className="flex-1 h-2.5 rounded-lg overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.3)',
                boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.45), inset 0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              <div
                className="h-full rounded-lg origin-left"
                style={{
                  width: '20%',
                  background: 'linear-gradient(90deg, rgba(200,255,0,0.5), rgba(200,255,0,0.12))',
                  transform: animate ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
                  boxShadow: animate ? '0 0 10px rgba(200,255,0,0.15)' : 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Punchline */}
        <div className="px-5 py-3 border-t text-center" style={{ borderColor: '#1a1a1f', background: 'rgba(200,255,0,0.015)' }}>
          <p className="text-[12px] text-text-dim">
            Same task. <span className="text-lime font-mono font-medium">5x faster.</span>{' '}
            You don&rsquo;t need a smarter model — you need{' '}
            <span className="text-lime italic font-serif">Forged.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
