import { useEffect, useRef, useState } from 'react';

type Mode = 'type' | 'del';

/**
 * Cycles through short phrases with type + delete animation. Pauses when `active` is false.
 */
export function useRotatingTypewriter(
  active: boolean,
  phrases: readonly string[],
  opts?: { typeMs?: number; deleteMs?: number; holdMs?: number; betweenMs?: number; startDelayMs?: number },
) {
  const { typeMs = 52, deleteMs = 34, holdMs = 2200, betweenMs = 420, startDelayMs = 500 } = opts ?? {};
  const [text, setText] = useState('');
  const phraseIdxRef = useRef(0);
  const charRef = useRef(0);
  const modeRef = useRef<Mode>('type');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active || phrases.length === 0) {
      setText('');
      phraseIdxRef.current = 0;
      charRef.current = 0;
      modeRef.current = 'type';
      return;
    }

    phraseIdxRef.current = 0;
    charRef.current = 0;
    modeRef.current = 'type';
    let cancelled = false;

    const clear = () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const schedule = (fn: () => void, ms: number) => {
      clear();
      timeoutRef.current = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const tick = () => {
      if (cancelled) return;
      const p = phrases[phraseIdxRef.current % phrases.length];

      if (modeRef.current === 'type') {
        if (charRef.current < p.length) {
          charRef.current += 1;
          setText(p.slice(0, charRef.current));
          schedule(tick, typeMs);
        } else {
          schedule(() => {
            modeRef.current = 'del';
            tick();
          }, holdMs);
        }
      } else {
        if (charRef.current > 0) {
          charRef.current -= 1;
          setText(p.slice(0, charRef.current));
          schedule(tick, deleteMs);
        } else {
          phraseIdxRef.current += 1;
          modeRef.current = 'type';
          schedule(tick, betweenMs);
        }
      }
    };

    schedule(tick, startDelayMs);

    return () => {
      cancelled = true;
      clear();
    };
  }, [active, phrases, typeMs, deleteMs, holdMs, betweenMs, startDelayMs]);

  return text;
}
