import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BrainIcon, RocketIcon } from 'lucide-animated';
import { useRotatingTypewriter } from '../hooks/useRotatingTypewriter';
import { ExamplePillGrid } from './ExamplePillGrid';

/** Single-line empty state — tight row; grows when content needs it. */
const TASK_FIELD_MIN = 36;
/** Only extreme pastes hit this; example pills fit below ~95vh without inner scrollbar. */
const TASK_FIELD_ABS_MAX = 12000;

/** Short rotating prompts — keeps the field one line without resize. */
const PLACEHOLDER_PHRASES = [
  'Learn Amazon deals',
  'Dig into Wikipedia',
  'Read HN threads',
  'Scout GitHub repos',
  'Steal a recipe',
  'Compare prices fast',
] as const;

interface TaskInputProps {
  onRun: (task: string) => void;
  onLearn?: (task: string) => void;
  isRunning: boolean;
  onStop?: () => void;
  compact?: boolean;
}

/** Empty on load so the field stays compact; examples / typing fill it. */
export const DEFAULT_TASK = '';

export function TaskInput({ onRun, onLearn, isRunning, onStop, compact }: TaskInputProps) {
  const [task, setTask] = useState(DEFAULT_TASK);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  /** Pixel height; transitions smoothly when content changes (e.g. picking an example). */
  const [fieldHeight, setFieldHeight] = useState(TASK_FIELD_MIN);

  const showTypewriter = task === '' && !focused && !isRunning;
  const typewriterText = useRotatingTypewriter(showTypewriter, PLACEHOLDER_PHRASES);

  /**
   * Measure without `height: auto` on the live textarea — that overrides React’s
   * height for a frame and kills CSS/Motion height interpolation. Collapse to 0,
   * read scrollHeight, clear inline height; double rAF keeps the previous height
   * painted so A→B animates on the shell.
   */
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    // Empty / whitespace-only: snap back to compact shell immediately (no rAF delay).
    if (task.trim() === '') {
      el.style.removeProperty('height');
      setFieldHeight(TASK_FIELD_MIN);
      return;
    }

    const measure = () => {
      el.style.height = '0px';
      const natural = el.scrollHeight;
      el.style.removeProperty('height');
      const cap = Math.min(
        TASK_FIELD_ABS_MAX,
        Math.round(window.innerHeight * 0.95),
      );
      const next = Math.min(Math.max(natural, TASK_FIELD_MIN), cap);
      setFieldHeight(next);
    };

    let raf2: number | null = null;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(measure);
    });

    const onResize = () => measure();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 != null) cancelAnimationFrame(raf2);
      window.removeEventListener('resize', onResize);
    };
  }, [task]);

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
          placeholder="Learn something…"
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

  const insetShadow =
    'inset 0 5px 14px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.25), inset 0 -2px 6px rgba(255,255,255,0.02), 0 1px 0 rgba(255,255,255,0.03)';

  const shellTransition = {
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <div className="w-full max-w-[520px] flex flex-col items-stretch gap-5" data-task-input>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-lime/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <motion.div
            initial={false}
            animate={{ height: fieldHeight }}
            transition={shellTransition}
            className="relative flex flex-row items-stretch gap-0 w-full min-h-[36px] rounded-2xl border border-border bg-surface overflow-hidden focus-within:border-lime/25 transition-[border-color,box-shadow] duration-300 ease-out"
            style={{ boxShadow: insetShadow }}
          >
            <div className="relative flex flex-1 min-w-0 min-h-0 self-stretch flex-col">
              <textarea
                ref={textareaRef}
                value={task}
                title={task || 'Describe what you want to learn'}
                onChange={(e) => {
                  const v = e.target.value;
                  setTask(v);
                  if (v.trim() === '') {
                    e.target.style.removeProperty('height');
                    setFieldHeight(TASK_FIELD_MIN);
                  }
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder=""
                aria-label="What to learn in the browser"
                disabled={isRunning}
                rows={1}
                className="relative z-[1] box-border w-full min-h-0 min-w-0 flex-1 py-1.5 pl-5 pr-3 bg-transparent rounded-none text-[14px] text-text leading-snug focus:outline-none resize-none disabled:opacity-30 overflow-y-auto break-words caret-lime [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
              />
              {showTypewriter && (
                <div
                  className="pointer-events-none absolute inset-0 z-0 flex items-start pl-5 pr-3 pt-1.5 text-[14px] leading-snug text-text-muted/55"
                  aria-hidden
                >
                  <span>{typewriterText}</span>
                </div>
              )}
            </div>
            <div className="flex flex-row items-center gap-1.5 pr-1.5 pt-1.5 pb-1 shrink-0 self-start bg-surface">
              {onLearn && (
                <button
                  type="button"
                  onClick={handleLearn}
                  disabled={!task.trim() || isRunning}
                  className="group/learn h-9 pl-2.5 pr-3 rounded-lg font-medium text-[12px] bg-surface border border-border text-text-dim hover:border-amber-400/30 hover:text-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1.5 saas-btn"
                >
                  <BrainIcon
                    size={14}
                    className="shrink-0 text-amber-400/35 group-hover/learn:text-amber-400/55 transition-colors"
                    aria-hidden
                  />
                  Learn
                </button>
              )}
              <button
                type="submit"
                disabled={!task.trim() && !isRunning}
                className="group/race h-9 pl-3 pr-4 rounded-lg font-medium text-[12px] tracking-wide transition-all bg-lime text-bg hover:brightness-110 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1.5 saas-btn-primary"
              >
                <RocketIcon
                  size={14}
                  className="shrink-0 text-[#0a0a0a]/40 group-hover/race:text-[#0a0a0a]/55 transition-colors"
                  aria-hidden
                />
                Race
              </button>
            </div>
          </motion.div>
        </div>
      </form>

      <ExamplePillGrid onPick={(t) => setTask(t)} disabled={isRunning} animBaseMs={160} />
    </div>
  );
}
