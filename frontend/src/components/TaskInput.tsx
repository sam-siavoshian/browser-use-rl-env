import { useState } from 'react';
import { BrainIcon, RocketIcon } from 'lucide-animated';
import { EXAMPLE_TASKS } from '../data/exampleTasks';

interface TaskInputProps {
  onRun: (task: string) => void;
  onLearn?: (task: string) => void;
  isRunning: boolean;
  onStop?: () => void;
  compact?: boolean;
}

export const DEFAULT_TASK =
  'Go to news.ycombinator.com, open the #1 story on the front page, and extract the top 3 comments from that post.';

export function TaskInput({ onRun, onLearn, isRunning, onStop, compact }: TaskInputProps) {
  const [task, setTask] = useState(DEFAULT_TASK);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRunning) { onStop?.(); return; }
    if (!task.trim()) return;
    onRun(task.trim());
  };

  const handleLearn = () => {
    if (!task.trim() || isRunning) return;
    onLearn?.(task.trim());
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-xl">
        <input
          type="text"
          value={task}
          title={task}
          onChange={(e) => setTask(e.target.value)}
          disabled={isRunning}
          className="min-w-0 flex-1 h-9 px-3.5 bg-transparent border border-border rounded-xl text-[13px] text-text placeholder-text-muted focus:outline-none focus:border-lime/30 transition-colors disabled:opacity-30 truncate saas-inset-sm"
        />
        <button
          type="submit"
          className={`h-9 px-4 rounded-xl text-[12px] font-medium tracking-wide transition-all ${
            isRunning
              ? 'bg-elevated text-text-dim hover:bg-border saas-btn'
              : 'bg-lime text-bg hover:brightness-110 saas-btn-primary'
          }`}
        >
          {isRunning ? 'Stop' : 'Launch'}
        </button>
      </form>
    );
  }

  return (
    <div className="w-full max-w-[520px] flex flex-col items-stretch gap-5">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-lime/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <input
            type="text"
            value={task}
            title={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Go to a site, do one thing, return structured data..."
            disabled={isRunning}
            className="relative w-full min-w-0 h-[54px] pl-5 pr-[252px] bg-surface border border-border rounded-2xl text-[14px] text-text placeholder-text-muted focus:outline-none focus:border-lime/25 transition-all disabled:opacity-30 truncate"
            style={{
              boxShadow: 'inset 0 5px 14px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.25), inset 0 -2px 6px rgba(255,255,255,0.02), 0 1px 0 rgba(255,255,255,0.03)',
            }}
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {onLearn && (
              <button
                type="button"
                onClick={handleLearn}
                disabled={!task.trim() || isRunning}
                className="group/learn h-10 pl-3 pr-4 rounded-xl font-medium text-[13px] bg-surface border border-border text-text-dim hover:border-amber-400/30 hover:text-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-2 saas-btn"
              >
                <BrainIcon
                  size={15}
                  className="shrink-0 text-amber-400/35 group-hover/learn:text-amber-400/55 transition-colors"
                  aria-hidden
                />
                Learn
              </button>
            )}
            <button
              type="submit"
              disabled={!task.trim() && !isRunning}
              className="group/race h-10 pl-3.5 pr-5 rounded-xl font-medium text-[13px] tracking-wide transition-all bg-lime text-bg hover:brightness-110 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-2 saas-btn-primary"
            >
              <RocketIcon
                size={15}
                className="shrink-0 text-[#0a0a0a]/40 group-hover/race:text-[#0a0a0a]/55 transition-colors"
                aria-hidden
              />
              Race
            </button>
          </div>
        </div>
      </form>

      {/* Example task chips */}
      <div className="flex flex-col items-center gap-3 px-1" aria-label="Example tasks">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted">
          Try an example
        </p>
        <div className="flex flex-wrap justify-center gap-2 max-w-[540px]">
          {EXAMPLE_TASKS.map((ex, i) => (
            <button
              key={ex.id}
              type="button"
              disabled={isRunning}
              onClick={() => setTask(ex.task)}
              className="group/chip relative px-3.5 py-2 rounded-xl border border-border bg-elevated/80 text-[12px] font-medium text-text-dim
                hover:text-text hover:border-lime/35 hover:bg-[#141414]
                active:scale-[0.97] transition-all duration-200 disabled:opacity-35 disabled:pointer-events-none
                anim-fade-up"
              style={{
                animationDelay: `${160 + i * 45}ms`,
                boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(0,0,0,0.2), inset 0 -1px 4px rgba(255,255,255,0.03), 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <span className="relative z-10">{ex.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
