import { useEffect, useRef } from 'react';
import { ActionCard } from './ActionCard';
import type { Step } from '../../types';

interface ActionFeedProps {
  steps: Step[];
  isRunning: boolean;
}

export function ActionFeed({ steps, isRunning }: ActionFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps.length]);

  if (steps.length === 0 && !isRunning) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {/* Timeline connector */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[26px] top-4 bottom-4 w-px bg-border-subtle" />

          {/* Cards */}
          <div className="relative space-y-1">
            {steps.map((step, i) => (
              <ActionCard
                key={step.id}
                step={step}
                isLast={i === steps.length - 1}
                isRunning={isRunning}
              />
            ))}
          </div>
        </div>

        {/* Running indicator */}
        {isRunning && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="shrink-0">
              <div className="w-2 h-2 rounded-full bg-sky animate-pulse" />
            </div>
            <span className="text-[12px] text-text-muted">Thinking...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
