interface TimerProps {
  elapsedMs: number;
  isComplete: boolean;
  variant: 'baseline' | 'rocket';
}

export function Timer({ elapsedMs, isComplete, variant }: TimerProps) {
  const seconds = elapsedMs / 1000;
  const formatted = seconds.toFixed(1);

  const color = isComplete
    ? variant === 'rocket' ? 'text-lime' : 'text-text-muted'
    : 'text-text';

  return (
    <span className={`font-mono tabular-nums font-medium text-xl ${color} transition-colors duration-500`}>
      {formatted}<span className="text-[11px] text-text-muted ml-0.5">s</span>
    </span>
  );
}
