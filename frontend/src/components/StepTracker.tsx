import { useEffect, useMemo, useRef, useState } from 'react';
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

/** Human-readable labels for detail fields */
const DETAIL_LABELS: Record<string, string> = {
  thinking: 'Thinking',
  evaluation: 'Evaluation',
  memory: 'Memory',
  actions: 'Actions',
  url: 'URL',
  page_title: 'Page',
  domain: 'Domain',
  action_type: 'Type',
  pattern: 'Pattern',
  classification: 'Classification',
  total_steps: 'Total Steps',
  fixed_steps: 'Fixed (Playwright)',
  parameterized_steps: 'Parameterized',
  dynamic_steps: 'Dynamic (Agent)',
  handoff_index: 'Handoff At',
  template_id: 'Template ID',
  playwright_steps: 'Playwright Steps',
  agent_steps: 'Agent Steps',
  selector: 'Selector',
  parameter: 'Parameter',
  reasoning: 'Reasoning',
};

const HIDDEN_FIELDS = new Set(['mode', 'steps', 'handoff']);
const MULTILINE_FIELDS = new Set(['thinking', 'evaluation', 'memory', 'reasoning']);

function StepRow({ step, index, maxDuration }: { step: Step; index: number; maxDuration: number }) {
  const [expanded, setExpanded] = useState(false);
  const fast = step.type === 'playwright';
  const barWidth = (step.durationMs != null && maxDuration > 0)
    ? Math.max(4, (step.durationMs / maxDuration) * 100)
    : 0;

  const hasDetails = step.details && Object.keys(step.details).some(k => !HIDDEN_FIELDS.has(k));

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-[5px] px-1 text-[13px] leading-tight rounded-lg transition-colors ${
          hasDetails ? 'cursor-pointer hover:bg-white/[0.02]' : ''
        } ${fast ? 'anim-step-fast' : 'anim-step-slow'}`}
        style={fast ? { animationDelay: `${index * 25}ms` } : undefined}
        onClick={() => hasDetails && setExpanded(!expanded)}
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

        {/* Expand indicator */}
        {hasDetails && (
          <span className="text-[10px] text-text-muted/40 shrink-0">
            {expanded ? '▾' : '▸'}
          </span>
        )}

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

      {/* Expanded details */}
      {expanded && step.details && (
        <div className="ml-10 mr-2 mb-1 px-3 py-2 rounded-lg space-y-1.5"
             style={{ background: 'rgba(255,255,255,0.02)' }}>
          {Object.entries(step.details)
            .filter(([k]) => !HIDDEN_FIELDS.has(k))
            .map(([k, v]) => {
              const label = DETAIL_LABELS[k] || k;
              const isMultiline = MULTILINE_FIELDS.has(k);
              const value = typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v);

              return isMultiline ? (
                <div key={k} className="text-[11px]">
                  <span className="text-text-muted font-medium">{label}</span>
                  <p className="mt-0.5 text-text-dim/80 leading-relaxed whitespace-pre-wrap">
                    {value}
                  </p>
                </div>
              ) : (
                <div key={k} className="flex gap-2 text-[11px]">
                  <span className="text-text-muted shrink-0 font-medium">{label}</span>
                  <span className="text-text-dim truncate">{value}</span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
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
      {steps.map((step, i) => (
        <StepRow key={step.id} step={step} index={i} maxDuration={stats.maxDuration} />
      ))}

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
