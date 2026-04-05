import { useState } from 'react';
import type { Step } from '../../types';

/** Human-readable labels for agent reasoning fields */
const DETAIL_LABELS: Record<string, string> = {
  thinking: 'Thinking',
  evaluation: 'Evaluation',
  memory: 'Memory',
  actions: 'Actions',
  url: 'URL',
  page_title: 'Page',
  similarity: 'Similarity',
  domain: 'Domain',
  pattern: 'Pattern',
};

/** Fields that should be hidden from the expanded view (internal plumbing) */
const HIDDEN_FIELDS = new Set(['mode']);

/** Fields whose values can span multiple lines */
const MULTILINE_FIELDS = new Set(['thinking', 'evaluation', 'memory']);

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
              {step.details && Object.keys(step.details).some(k => !HIDDEN_FIELDS.has(k)) && (
                <span className="text-[10px] text-text-muted/50 ml-1.5 shrink-0">
                  {expanded ? '▾' : '▸'}
                </span>
              )}
            </div>

            {duration && (
              <span className="text-[10px] font-mono text-text-muted shrink-0 tabular-nums">
                {duration}
              </span>
            )}
          </div>

          {/* Expanded details — agent reasoning, actions, page state */}
          {expanded && step.details && (
            <div className="mt-2.5 space-y-2 pb-1">
              {Object.entries(step.details)
                .filter(([k]) => !HIDDEN_FIELDS.has(k))
                .map(([k, v]) => {
                  const label = DETAIL_LABELS[k] || k;
                  const isMultiline = MULTILINE_FIELDS.has(k);
                  const value = String(v);

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
      </div>
    </div>
  );
}
