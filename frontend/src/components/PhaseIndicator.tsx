import type { Phase } from '../types';

interface PhaseIndicatorProps {
  phase: Phase;
}

const P: Record<Phase, { label: string; dot: string; text: string }> = {
  idle:     { label: 'Idle',       dot: '#555', text: 'text-text-muted' },
  rocket:   { label: 'Playwright', dot: '#c8ff00', text: 'text-lime' },
  agent:    { label: 'Agent',      dot: '#38bdf8', text: 'text-sky' },
  complete: { label: 'Done',       dot: '#c8ff00', text: 'text-lime' },
  error:    { label: 'Error',      dot: '#ff6b35', text: 'text-amber' },
  learning: { label: 'Learning',   dot: '#38bdf8', text: 'text-sky' },
};

export function PhaseIndicator({ phase }: PhaseIndicatorProps) {
  const c = P[phase];
  const live = phase === 'rocket' || phase === 'agent';

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono ${c.text}`}>
      <span
        className={`w-[5px] h-[5px] rounded-full ${live ? 'dot-pulse' : ''}`}
        style={{ background: c.dot }}
      />
      {c.label}
      {phase === 'agent' && (
        <span className="inline-flex gap-[2px] ml-0.5">
          <span className="w-[3px] h-[3px] rounded-full bg-sky thinking-dot" />
          <span className="w-[3px] h-[3px] rounded-full bg-sky thinking-dot thinking-dot-2" />
          <span className="w-[3px] h-[3px] rounded-full bg-sky thinking-dot thinking-dot-3" />
        </span>
      )}
    </span>
  );
}
