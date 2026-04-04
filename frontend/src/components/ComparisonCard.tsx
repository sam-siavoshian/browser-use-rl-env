import { useEffect, useState } from 'react';

interface ComparisonCardProps {
  baselineDurationMs: number;
  rocketDurationMs: number;
  onReset: () => void;
}

export function ComparisonCard({ baselineDurationMs, rocketDurationMs, onReset }: ComparisonCardProps) {
  const speedup = baselineDurationMs / rocketDurationMs;
  const timeSaved = (baselineDurationMs - rocketDurationMs) / 1000;
  const baselineSec = (baselineDurationMs / 1000).toFixed(1);
  const rocketSec = (rocketDurationMs / 1000).toFixed(1);
  const barRatio = rocketDurationMs / baselineDurationMs;

  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => setStage(2), 900),
      setTimeout(() => setStage(3), 1500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center anim-fade-in"
      style={{ background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(24px)' }}
    >
      <div className="w-full max-w-md mx-6">

        {/* The number — peak moment */}
        {stage >= 1 && (
          <div className="text-center mb-14 anim-number">
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-muted mb-5">
              Performance gain
            </p>
            <div className="font-serif italic text-[100px] leading-none tracking-tight text-gradient">
              {speedup.toFixed(1)}x
            </div>
          </div>
        )}

        {/* Bars — anchoring + contrast */}
        {stage >= 2 && (
          <div className="space-y-2 anim-fade-up">
            <div className="flex items-center gap-3">
              <span className="w-12 text-right font-mono text-[13px] text-text-muted tabular-nums">{baselineSec}s</span>
              <div className="flex-1 h-5 bg-surface rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg origin-left"
                  style={{ width: '100%', background: 'rgba(255,107,53,0.15)', animation: 'bar-grow 0.9s cubic-bezier(0.16,1,0.3,1) both' }}
                />
              </div>
              <span className="w-14 text-[11px] text-text-muted">Without</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-12 text-right font-mono text-[13px] text-lime font-medium tabular-nums">{rocketSec}s</span>
              <div className="flex-1 h-5 bg-surface rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg origin-left"
                  style={{
                    width: `${Math.max(barRatio * 100, 5)}%`,
                    background: 'rgba(200,255,0,0.2)',
                    animation: 'bar-grow 0.9s cubic-bezier(0.16,1,0.3,1) both',
                    animationDelay: '0.15s',
                  }}
                />
              </div>
              <span className="w-14 text-[11px] text-lime">Boosted</span>
            </div>
          </div>
        )}

        {/* Loss-aversion CTA */}
        {stage >= 3 && (
          <div className="mt-12 text-center anim-fade-up">
            <p className="text-text-dim text-[14px]">
              <span className="text-lime font-mono font-medium">{timeSaved.toFixed(1)}s</span>
              {' '}you&rsquo;ll never waste again.
            </p>
            <button
              onClick={onReset}
              className="mt-8 h-10 px-6 bg-surface border border-border rounded-xl text-[13px] text-text hover:bg-elevated hover:border-text-muted/30 transition-all"
            >
              Try another task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
