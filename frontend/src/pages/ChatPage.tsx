import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatInput } from '../components/chat/ChatInput';
import { ActionFeed } from '../components/chat/ActionFeed';
import { SessionStats } from '../components/chat/SessionStats';
import { ShiningText } from '../components/ui/shining-text';
import { PixelBackground } from '../components/PixelBackground';
import { BrowserEmbed } from '../components/BrowserEmbed';
import { usePoller } from '../hooks/usePoller';
import { useTimer } from '../hooks/useTimer';
import { ExamplePillGrid } from '../components/ExamplePillGrid';
import { startChat } from '../api';
import type { Phase } from '../types';

export function ChatPage() {
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(urlSessionId || null);
  const { status } = usePoller(sessionId);
  const timer = useTimer();
  const idleHomeRef = useRef<HTMLDivElement>(null);
  const idleContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (urlSessionId && urlSessionId !== sessionId) {
      setSessionId(urlSessionId);
    }
  }, [urlSessionId]);

  useEffect(() => {
    if (status?.status === 'complete' || status?.status === 'error') {
      timer.stop();
    }
  }, [status?.status]);

  const handleSubmit = useCallback(async (task: string) => {
    try {
      const sid = await startChat(task);
      setSessionId(sid);
      timer.reset();
      timer.start();
      navigate(`/chat/${sid}`, { replace: false });
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  }, [navigate, timer]);

  const isRunning = status?.status === 'running' || status?.status === 'pending';
  const isComplete = status?.status === 'complete';
  const phase = (status?.phase || 'idle') as Phase;
  const steps = status?.steps || [];
  const liveUrl = status?.live_url || null;
  const modeUsed = (status as any)?.mode_used || null;
  const agentResult = (status as any)?.result || null;

  // ═══ IDLE STATE ═══
  if (!sessionId) {
    return (
      <div
        ref={idleHomeRef}
        className="flex flex-col items-center justify-center h-full min-h-0 px-6 relative overflow-hidden"
      >
        <PixelBackground
          interactionRootRef={idleHomeRef}
          contentExclusionRef={idleContentRef}
        />

        {/* Subtle radial glow behind the heading — cool moon, not lime wash */}
        <div
          className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[min(560px,90vw)] h-[420px] pointer-events-none z-[1]"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(130, 165, 220, 0.045) 0%, rgba(90, 120, 180, 0.02) 45%, transparent 72%)',
          }}
        />

        <div
          ref={idleContentRef}
          className="flex flex-col items-center gap-6 max-w-[680px] w-full relative z-10 pointer-events-none"
        >
          {/* Heading */}
          <div className="text-center" style={{ animation: 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
            <h1
              className="text-[48px] sm:text-[56px] leading-[1.05] tracking-[-0.03em] text-text"
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
            >
              What do you want to learn?
            </h1>
            <p className="text-[14px] text-text-dim mt-4 max-w-[440px] mx-auto leading-[1.7]">
              Describe a flow or site to explore in the browser. If I&apos;ve learned it before, I&apos;ll be fast.
            </p>
          </div>

          {/* Input */}
          <div
            className="w-full pointer-events-auto"
            style={{ animation: 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 80ms both' }}
          >
            <ChatInput onSubmit={handleSubmit} />
          </div>

          <div className="w-full max-w-[580px] mx-auto pointer-events-auto" style={{ animation: 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 160ms both' }}>
            <ExamplePillGrid onPick={(task) => void handleSubmit(task)} animBaseMs={180} />
          </div>

          {/* Keyboard hint */}
          <p className="text-[11px] text-text-muted/40 mt-2"
             style={{ animation: 'fade-in 0.4s ease 300ms both' }}>
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono">Enter</kbd> to run
          </p>
        </div>
      </div>
    );
  }

  // ═══ SESSION STATE ═══
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Action feed */}
        <div
          className="w-[400px] shrink-0 flex flex-col min-h-0 overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.15)',
            borderRight: '1px solid var(--color-border)',
          }}
        >
          {/* Task header */}
          <div className="px-5 py-3.5 border-b border-border-subtle flex items-center gap-3">
            {isRunning && (
              <div className="w-2 h-2 rounded-full bg-lime dot-pulse shrink-0" />
            )}
            {!isRunning && status?.status === 'complete' && (
              <div className="w-2 h-2 rounded-full bg-lime shrink-0" />
            )}
            {!isRunning && status?.status === 'error' && (
              <div className="w-2 h-2 rounded-full bg-amber shrink-0" />
            )}
            <div className="text-[13px] truncate flex-1">
              {status?.task
                ? <span className="text-text">{status.task}</span>
                : <ShiningText text="Running task..." className="text-[13px]" />
              }
            </div>
            {modeUsed && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md shrink-0 ${
                modeUsed === 'rocket' ? 'bg-lime/10 text-lime' : 'bg-amber/10 text-amber'
              }`}>
                {modeUsed === 'rocket' ? 'ROCKET' : 'LEARNING'}
              </span>
            )}
          </div>

          {/* Feed */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ActionFeed steps={steps} isRunning={isRunning} agentResult={agentResult} isComplete={isComplete} />
          </div>
        </div>

        {/* Right: Browser embed — fills column; no page-level scroll */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-bg overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 p-3">
            <BrowserEmbed liveUrl={liveUrl} phase={phase} fillHeight />
          </div>
        </div>
      </div>

      {/* Bottom: Session stats */}
      <SessionStats
        elapsedMs={timer.elapsedMs}
        stepCount={steps.length}
        modeUsed={modeUsed}
        isComplete={status?.status === 'complete'}
      />
    </div>
  );
}
