interface SessionStatsProps {
  elapsedMs: number;
  stepCount: number;
}

export function SessionStats({ elapsedMs, stepCount }: SessionStatsProps) {
  const seconds = (elapsedMs / 1000).toFixed(1);

  return (
    <div
      className="flex items-center justify-between px-5 h-10 shrink-0"
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'rgba(0,0,0,0.2)',
        boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-center gap-6 text-[11px] font-mono text-text-muted">
        <span>{seconds}s</span>
        <span>{stepCount} step{stepCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
