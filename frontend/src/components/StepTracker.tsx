import { useEffect, useMemo, useRef } from 'react';
import type { Step, Phase } from '../types';

interface StepTrackerProps {
  steps: Step[];
  phase: Phase;
  currentStep: string;
  /** Show the cumulative timing summary footer */
  showSummary?: boolean;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function StepTracker({ steps, phase, currentStep, showSummary = false }: StepTrackerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isActive =
    phase === 'rocket' || phase === 'agent' || phase === 'learning';
  const lastStepDescription = steps[steps.length - 1]?.description;
  const showCurrentStep = Boolean(
    isActive &&
    currentStep &&
    currentStep !== lastStepDescription,
  );

  const lastStepId = steps[steps.length - 1]?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [steps.length, lastStepId, currentStep, phase, showCurrentStep]);

  // Cumulative timing stats
  const stats = useMemo(() => {
    let pwTime = 0, pwCount = 0, llmTime = 0, llmCount = 0;
    let maxDuration = 0;
    for (const s of steps) {
      if (s.durationMs != null && s.durationMs > maxDuration) maxDuration = s.durationMs;
      if (s.type === 'playwright' && s.durationMs != null) {
        pwTime += s.durationMs;
        pwCount++;
      } else if (s.type === 'agent' && s.durationMs != null) {
        llmTime += s.durationMs;
        llmCount++;
      }
    }
    return { pwTime, pwCount, llmTime, llmCount, maxDuration };
  }, [steps]);

  if (steps.length === 0 && !isActive) return null;

  return (
    <div className="flex flex-col gap-0.5">
      {steps.map((step, i) => {
        const fast = step.type === 'playwright';
        // Bar width proportional to duration (relative to max step)
        const barWidth = (step.durationMs != null && stats.maxDuration > 0)
          ? Math.max(4, (step.durationMs / stats.maxDuration) * 100)
          : 0;

        return (
          <div
            key={step.id}
            className={`flex items-center gap-2 py-[5px] px-1 text-[13px] leading-tight rounded-lg transition-colors ${
              fast ? 'anim-step-fast' : 'anim-step-slow'
            }`}
            style={fast ? { animationDelay: `${i * 25}ms` } : undefined}
          >
            {/* Method badge */}
            <span className={`flex-shrink-0 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-[1px] rounded ${
              fast
                ? 'bg-lime/15 text-lime'
                : 'bg-amber-400/12 text-amber-400'
            }`}>
              {fast ? 'PW' : 'LLM'}
            </span>

            {/* Description */}
            <span className={`flex-1 truncate ${fast ? 'text-text' : 'text-text-dim'}`}>
              {step.description}
            </span>

            {/* Timing bar + duration */}
            {step.durationMs != null && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-16 h-[4px] rounded-full bg-surface/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      fast ? 'bg-lime/60' : 'bg-amber-400/50'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className={`font-mono text-[11px] tabular-nums w-14 text-right ${
                  fast ? 'text-lime/60' : 'text-amber-400/60'
                }`}>
                  {formatDuration(step.durationMs)}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {showCurrentStep && (
        <div className="flex items-center gap-2 py-[5px] px-1 text-[13px]">
          <span className={`flex-shrink-0 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-[1px] rounded ${
            phase === 'rocket'
              ? 'bg-lime/15 text-lime dot-pulse'
              : 'bg-amber-400/12 text-amber-400 dot-pulse'
          }`}>
            {phase === 'rocket' ? 'PW' : 'LLM'}
          </span>
          <span className={`flex-1 truncate ${
            phase === 'rocket' ? 'text-lime/80' : 'text-amber-400/80'
          }`}>
            {currentStep}
          </span>
        </div>
      )}

      {/* Cumulative timing summary */}
      {showSummary && (stats.pwCount > 0 || stats.llmCount > 0) && (
        <div className="mt-2 pt-2 border-t border-border-subtle flex flex-col gap-1">
          {stats.pwCount > 0 && (
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="bg-lime/15 text-lime px-1.5 py-[1px] rounded text-[9px] font-bold">PW</span>
              <span className="text-lime/50">
                {formatDuration(stats.pwTime)} ({stats.pwCount} step{stats.pwCount !== 1 ? 's' : ''})
              </span>
            </div>
          )}
          {stats.llmCount > 0 && (
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="bg-amber-400/12 text-amber-400 px-1.5 py-[1px] rounded text-[9px] font-bold">LLM</span>
              <span className="text-amber-400/50">
                {formatDuration(stats.llmTime)} ({stats.llmCount} step{stats.llmCount !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
      )}

      <div ref={bottomRef} className="h-0 w-full shrink-0" aria-hidden />
    </div>
  );
}
