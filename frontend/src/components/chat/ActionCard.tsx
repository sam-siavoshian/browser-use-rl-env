import { useState } from 'react';
import type { Step } from '../../types';

interface ActionCardProps {
  step: Step;
  isLast?: boolean;
  isRunning?: boolean;
}

export function ActionCard({ step, isLast, isRunning }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const actionType = step.action_type || 'agent_action';
  const isTemplateMatch = actionType === 'template_match';
  const isDone = actionType === 'done';
  const isLastAndRunning = isLast && isRunning;

  const duration = step.durationMs != null
    ? step.durationMs < 1000 ? `${Math.round(step.durationMs)}ms` : `${(step.durationMs / 1000).toFixed(1)}s`
    : null;

  // Color based on step type
  const accentColor = step.type === 'playwright' ? 'var(--color-lime)' : 'var(--color-sky)';
  const dotColor = isTemplateMatch
    ? (step.details?.mode === 'rocket' ? 'var(--color-lime)' : 'var(--color-amber)')
    : isDone ? 'var(--color-lime)' : accentColor;

  return (
    <div
      className="group relative cursor-pointer transition-all duration-150"
      onClick={() => step.details && setExpanded(!expanded)}
      style={{ animation: 'fade-up 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
    >
      <div className="flex items-start gap-3.5 px-4 py-3 rounded-xl mx-2
                       hover:bg-white/[0.02] transition-colors duration-150">
        {/* Timeline dot */}
        <div className="relative shrink-0 mt-1">
          <div
            className={`w-[7px] h-[7px] rounded-full ${isLastAndRunning ? 'dot-pulse' : ''}`}
            style={{ background: dotColor }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center min-w-0 flex-1">
              <span className="text-[13px] text-text/90 leading-snug truncate">
                {step.description.replace(/^Agent:\s*/, '')}
              </span>
            </div>

            {duration && (
              <span className="text-[10px] font-mono text-text-muted shrink-0 tabular-nums">
                {duration}
              </span>
            )}
          </div>

          {/* Expanded details */}
          {expanded && step.details && (
            <div className="mt-2.5 ml-[21px] space-y-1.5 pb-1">
              {Object.entries(step.details).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-[11px]">
                  <span className="text-text-muted shrink-0 font-mono">{k}</span>
                  <span className="text-text-dim truncate">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
