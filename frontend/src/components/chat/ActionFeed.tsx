import { useEffect, useRef } from 'react';
import { ActionCard } from './ActionCard';
import { AgentResultMarkdown } from './AgentResultMarkdown';
import { ShiningText } from '../ui/shining-text';
import type { Step } from '../../types';

interface ActionFeedProps {
  steps: Step[];
  isRunning: boolean;
  agentResult?: string | null;
  /** True once the agent's final text is available (learn flow may still save the template) */
  showAgentAnswer?: boolean;
}

export function ActionFeed({ steps, isRunning, agentResult, showAgentAnswer }: ActionFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps.length, agentResult, showAgentAnswer]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto py-3 overscroll-contain">
        {steps.length === 0 && isRunning && (
          <div
            className="flex items-center gap-3.5 px-6 py-4"
            style={{ animation: 'fade-in 0.3s ease both' }}
          >
            <div className="w-[7px] h-[7px] rounded-full bg-sky dot-pulse shrink-0" />
            <ShiningText text="Starting agent..." className="text-[12px]" />
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Vertical connector line */}
          {steps.length > 1 && (
            <div
              className="absolute left-[26px] top-6 bottom-6 w-px"
              style={{ background: 'linear-gradient(to bottom, var(--color-border), transparent)' }}
            />
          )}

          {steps.map((step, i) => (
            <ActionCard
              key={step.id}
              step={step}
              isLast={i === steps.length - 1}
              isRunning={isRunning}
            />
          ))}
        </div>

        {/* Thinking indicator — hide once the agent answer is visible */}
        {isRunning && steps.length > 0 && !showAgentAnswer && (
          <div className="flex items-center gap-3.5 px-6 py-3">
            <div className="w-[7px] h-[7px] rounded-full bg-sky dot-pulse shrink-0" />
            <ShiningText text="Thinking..." className="text-[12px]" />
          </div>
        )}

        {/* Agent result card — as soon as the backend sends result + agent_complete */}
        {agentResult && showAgentAnswer && (
          <div className="mx-4 mt-3 mb-2" style={{ animation: 'fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div
              className="rounded-2xl px-5 py-4"
              style={{
                background: 'rgba(200,255,0,0.03)',
                border: '1px solid rgba(200,255,0,0.1)',
                boxShadow: `
                  inset 0 4px 12px rgba(0,0,0,0.3),
                  inset 0 1px 3px rgba(0,0,0,0.2),
                  inset 0 -1px 3px rgba(200,255,0,0.02),
                  0 0 20px rgba(200,255,0,0.03)
                `,
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="var(--color-lime)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
                <span className="text-[11px] font-mono uppercase tracking-wider text-lime">
                  Result
                </span>
              </div>
              {/* Content — markdown: **bold**, *italic*, lists, blockquotes, code, tables, links */}
              <AgentResultMarkdown content={agentResult} />
            </div>
          </div>
        )}

        {/* Template extraction still running after the answer is shown */}
        {isRunning && showAgentAnswer && (
          <div className="flex items-center gap-3.5 px-6 py-2">
            <div className="w-[7px] h-[7px] rounded-full bg-lime/80 dot-pulse shrink-0" />
            <span className="text-[12px] text-text-muted">Saving template…</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
