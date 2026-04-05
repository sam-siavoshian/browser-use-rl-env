import { EXAMPLE_TASKS } from '../data/exampleTasks';
import { ExampleBrandIcon } from './exampleBrandIcons';

type ExamplePillGridProps = {
  onPick: (task: string) => void;
  disabled?: boolean;
  /** Extra classes on outer wrapper */
  className?: string;
  /** Stagger base delay for entrance (ms) */
  animBaseMs?: number;
};

/**
 * Uniform 2-column grid of example task pills.
 */
export function ExamplePillGrid({ onPick, disabled, className = '', animBaseMs = 160 }: ExamplePillGridProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`} aria-label="Example tasks">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted text-center">
        Try something like...
      </p>

      <div className="grid grid-cols-2 gap-2 w-full max-w-[480px]">
        {EXAMPLE_TASKS.map((ex, i) => (
          <ExamplePill
            key={ex.id}
            id={ex.id}
            label={ex.label}
            task={ex.task}
            disabled={disabled}
            animDelayMs={animBaseMs + i * 50}
            onPick={onPick}
          />
        ))}
      </div>
    </div>
  );
}

function ExamplePill({
  id,
  label,
  task,
  disabled,
  animDelayMs,
  onPick,
}: {
  id: string;
  label: string;
  task: string;
  disabled?: boolean;
  animDelayMs: number;
  onPick: (task: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={task}
      onClick={() => onPick(task)}
      style={{
        animationDelay: `${animDelayMs}ms`,
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 0 rgba(255,255,255,0.03)',
      }}
      className="group/pill anim-fade-up flex w-full items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.025)] px-4 py-3 text-left text-[12px] font-medium text-text-dim leading-snug
        cursor-pointer transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:border-lime/30 hover:bg-lime/[0.06] hover:text-text hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.55),0_0_0_1px_rgba(200,255,0,0.06)]
        active:translate-y-0 active:scale-[0.98]
        disabled:pointer-events-none disabled:opacity-35"
    >
      <span className="relative z-10 mt-0.5 shrink-0 opacity-90 transition-opacity group-hover/pill:opacity-100">
        <ExampleBrandIcon id={id} />
      </span>
      <span className="relative z-10 min-w-0 flex-1">{label}</span>
    </button>
  );
}
