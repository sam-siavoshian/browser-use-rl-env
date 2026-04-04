import { useState } from 'react';

interface TaskInputProps {
  onRun: (task: string) => void;
  isRunning: boolean;
  onStop?: () => void;
  compact?: boolean;
}

export function TaskInput({ onRun, isRunning, onStop, compact }: TaskInputProps) {
  const [task, setTask] = useState('Search for "best coffee shops in SF" on Google');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRunning) { onStop?.(); return; }
    if (!task.trim()) return;
    onRun(task.trim());
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-xl">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          disabled={isRunning}
          className="flex-1 h-8 px-3 bg-transparent border border-border rounded-lg text-[13px] text-text placeholder-text-muted focus:outline-none focus:border-lime/30 transition-colors disabled:opacity-30"
        />
        <button
          type="submit"
          className={`h-8 px-4 rounded-lg text-[12px] font-medium tracking-wide transition-all ${
            isRunning
              ? 'bg-elevated text-text-dim hover:bg-border'
              : 'bg-lime text-bg hover:brightness-110'
          }`}
        >
          {isRunning ? 'Stop' : 'Launch'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[480px]">
      <div className="relative group">
        {/* Subtle glow behind input on hover */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-lime/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="What should the browser agent do?"
          disabled={isRunning}
          className="relative w-full h-[52px] pl-5 pr-[140px] bg-surface border border-border rounded-2xl text-[14px] text-text placeholder-text-muted focus:outline-none focus:border-lime/25 transition-all disabled:opacity-30"
        />
        <button
          type="submit"
          disabled={!task.trim() && !isRunning}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-10 px-5 rounded-xl font-medium text-[13px] tracking-wide transition-all bg-lime text-bg hover:brightness-110 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Launch race
        </button>
      </div>
    </form>
  );
}
