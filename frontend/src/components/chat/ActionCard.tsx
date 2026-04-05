import { useState } from 'react';
import type { Step } from '../../types';

const ACTION_ICONS: Record<string, string> = {
  navigate: 'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0M3.6 9h16.8M3.6 15h16.8M12 3a17 17 0 0 1 0 18M12 3a17 17 0 0 0 0 18',
  click: 'M9 9l5 12l1.8-5.2L21 14L9 9Z',
  fill: 'M17 10H3M21 6H3M21 14H3M17 18H3',
  press: 'M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3',
  extract: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M16 13H8M16 17H8M10 9H8',
  search_web: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
  scroll: 'M12 5v14M5 12l7-7 7 7',
  done: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3',
  template_match: 'M13 2L3 14h9l-1 8 10-12h-9l1-8',
  agent_action: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 6v4l3 3',
};

const ACTION_COLORS: Record<string, string> = {
  template_match: 'text-lime',
  navigate: 'text-sky',
  click: 'text-sky',
  fill: 'text-sky',
  extract: 'text-amber',
  search_web: 'text-amber',
  done: 'text-lime',
};

interface ActionCardProps {
  step: Step;
  isLast?: boolean;
  isRunning?: boolean;
}

export function ActionCard({ step, isLast, isRunning }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const actionType = step.action_type || 'agent_action';
  const iconPath = ACTION_ICONS[actionType] || ACTION_ICONS.agent_action;
  const iconColor = ACTION_COLORS[actionType] || 'text-text-dim';
  const isTemplateMatch = actionType === 'template_match';

  const duration = step.durationMs != null
    ? step.durationMs < 1000 ? `${Math.round(step.durationMs)}ms` : `${(step.durationMs / 1000).toFixed(1)}s`
    : null;

  return (
    <div
      className={`group relative flex gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all
        hover:bg-elevated/50
        ${isTemplateMatch ? 'bg-elevated/30 border border-border-subtle' : ''}
        ${isLast && isRunning ? 'animate-pulse' : ''}
      `}
      onClick={() => setExpanded(!expanded)}
      style={{ animation: 'fade-up 0.4s ease both' }}
    >
      {/* Icon */}
      <div className={`shrink-0 mt-0.5 ${iconColor}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={iconPath} />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-text leading-snug truncate">
            {step.description.replace(/^Agent:\s*/, '')}
          </span>
        </div>

        {/* Expanded details */}
        {expanded && step.details && (
          <div className="mt-2 space-y-1">
            {Object.entries(step.details).map(([k, v]) => (
              <div key={k} className="flex gap-2 text-[11px]">
                <span className="text-text-muted shrink-0">{k}:</span>
                <span className="text-text-dim truncate font-mono">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right side: duration + type badge */}
      <div className="flex items-center gap-2 shrink-0">
        {duration && (
          <span className="text-[11px] font-mono text-text-muted">{duration}</span>
        )}
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium
          ${step.type === 'playwright' ? 'bg-lime/10 text-lime' : 'bg-sky/10 text-sky'}`}>
          {step.type === 'playwright' ? 'PW' : 'AI'}
        </span>
      </div>
    </div>
  );
}
