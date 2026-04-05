interface SessionStatsProps {
  elapsedMs: number;
  stepCount: number;
  modeUsed: 'rocket' | 'baseline_learn' | null;
  isComplete: boolean;
}

export function SessionStats({ elapsedMs, stepCount, modeUsed, isComplete }: SessionStatsProps) {
  const seconds = (elapsedMs / 1000).toFixed(1);

  return (
    <div className="flex items-center justify-between px-5 py-2.5 border-t border-border bg-surface/50">
      <div className="flex items-center gap-5 text-[12px] text-text-dim">
        <span className="font-mono">{seconds}s</span>
        <span>{stepCount} steps</span>
      </div>

      {modeUsed && (
        <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg
          ${modeUsed === 'rocket' ? 'bg-lime/10 text-lime' : 'bg-amber/10 text-amber'}`}>
          {modeUsed === 'rocket' ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8" />
              </svg>
              Rocket
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 6v4l3 3" />
              </svg>
              {isComplete ? 'Learned' : 'Learning'}
            </>
          )}
        </div>
      )}
    </div>
  );
}
