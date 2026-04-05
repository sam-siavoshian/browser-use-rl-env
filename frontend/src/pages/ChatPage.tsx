import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatInput } from '../components/chat/ChatInput';
import { ActionFeed } from '../components/chat/ActionFeed';
import { SessionStats } from '../components/chat/SessionStats';
import { BrowserEmbed } from '../components/BrowserEmbed';
import { usePoller } from '../hooks/usePoller';
import { useTimer } from '../hooks/useTimer';
import { startChat } from '../api';
import { EXAMPLE_TASKS } from '../data/exampleTasks';
import type { Phase } from '../types';

export function ChatPage() {
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(urlSessionId || null);
  const { status } = usePoller(sessionId);
  const timer = useTimer();

  // Sync URL param to state
  useEffect(() => {
    if (urlSessionId && urlSessionId !== sessionId) {
      setSessionId(urlSessionId);
    }
  }, [urlSessionId]);

  // Stop timer on completion
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
  const phase = (status?.phase || 'idle') as Phase;
  const steps = status?.steps || [];
  const liveUrl = status?.live_url || null;
  const modeUsed = (status as any)?.mode_used || null;

  // IDLE STATE — no active session
  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <div className="flex flex-col items-center gap-8 max-w-[720px] w-full"
             style={{ animation: 'fade-up 0.55s ease both' }}>
          {/* Hero */}
          <h1 className="font-serif italic text-[42px] leading-tight text-center text-text tracking-tight">
            What should I do?
          </h1>
          <p className="text-[14px] text-text-dim text-center max-w-[480px] -mt-2">
            Describe a browser task. If I've seen it before, I'll be fast.
          </p>

          {/* Input */}
          <ChatInput onSubmit={handleSubmit} />

          {/* Example chips */}
          <div className="flex flex-wrap justify-center gap-2 -mt-2">
            {EXAMPLE_TASKS.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleSubmit(ex.task)}
                className="px-3 py-1.5 rounded-lg text-[12px] text-text-dim
                           border border-border hover:border-text-muted hover:text-text
                           transition-all bg-transparent"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SESSION STATE — active session
  return (
    <div className="flex flex-col h-full">
      {/* Main content: split panel */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Action feed */}
        <div className="w-[380px] shrink-0 border-r border-border flex flex-col bg-surface/30">
          <div className="px-4 py-3 border-b border-border-subtle">
            <p className="text-[12px] text-text-muted truncate">
              {status?.task || 'Running task...'}
            </p>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ActionFeed steps={steps} isRunning={isRunning} />
          </div>
        </div>

        {/* Right: Browser embed */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-3">
            <BrowserEmbed liveUrl={liveUrl} phase={phase} />
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
