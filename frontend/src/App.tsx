import { useCallback, useEffect, useState } from 'react';
import { TaskInput } from './components/TaskInput';
import { BrowserEmbed } from './components/BrowserEmbed';
import { Timer } from './components/Timer';
import { StepTracker } from './components/StepTracker';
import { PhaseIndicator } from './components/PhaseIndicator';
import { ComparisonCard } from './components/ComparisonCard';
import { TemplateVisualizer } from './components/TemplateVisualizer';
import { LearningHistory } from './components/LearningHistory';
import { usePoller } from './hooks/usePoller';
import { useTimer } from './hooks/useTimer';
import { startCompare, getTemplates } from './api';
import type { Template, Phase } from './types';

type View = 'idle' | 'racing' | 'results';

function App() {
  const [view, setView] = useState<View>('idle');
  const [currentTask, setCurrentTask] = useState('');

  const [baselineId, setBaselineId] = useState<string | null>(null);
  const [rocketId, setRocketId] = useState<string | null>(null);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const { status: baseStatus } = usePoller(baselineId);
  const { status: rocketStatus } = usePoller(rocketId);

  const baseTimer = useTimer();
  const rocketTimer = useTimer();

  useEffect(() => { getTemplates().then(setTemplates).catch(() => {}); }, []);

  useEffect(() => {
    if (baseStatus?.status === 'complete' || baseStatus?.status === 'error') baseTimer.stop();
  }, [baseStatus?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (rocketStatus?.status === 'complete' || rocketStatus?.status === 'error') rocketTimer.stop();
  }, [rocketStatus?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (baseStatus?.status === 'complete' && rocketStatus?.status === 'complete') {
      setTimeout(() => setView('results'), 600);
    }
  }, [baseStatus?.status, rocketStatus?.status]);

  const launch = useCallback(async (task: string) => {
    setCurrentTask(task);
    setBaselineId(null);
    setRocketId(null);
    setSelectedTemplate(null);
    baseTimer.reset();
    rocketTimer.reset();
    setView('racing');

    try {
      const { baseline_session_id, rocket_session_id } = await startCompare(task);
      setBaselineId(baseline_session_id);
      setRocketId(rocket_session_id);
      baseTimer.start();
      rocketTimer.start();
    } catch {
      setView('idle');
    }
  }, [baseTimer, rocketTimer]);

  const reset = useCallback(() => {
    setBaselineId(null);
    setRocketId(null);
    baseTimer.reset();
    rocketTimer.reset();
    setView('idle');
  }, [baseTimer, rocketTimer]);

  const basePh: Phase = baseStatus?.phase ?? 'idle';
  const rocketPh: Phase = rocketStatus?.phase ?? 'idle';
  const isRunning = view === 'racing';

  const liveSpeedup =
    baseTimer.elapsedMs > 2000 && rocketTimer.elapsedMs > 200
      ? baseTimer.elapsedMs / rocketTimer.elapsedMs
      : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden relative" style={{ background: '#0a0a0a' }}>

      {/* Ambient top light */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(200,255,0,0.025) 0%, transparent 65%)' }}
        />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━ IDLE ━━━━━━━━━━━━━━━━━━ */}
      {view === 'idle' && (
        <div className="flex-1 flex flex-col relative z-10">
          {/* Top bar */}
          <header className="flex items-center justify-between px-8 h-12 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <div className="w-[6px] h-[6px] rounded-full bg-lime" />
              <span className="text-[13px] font-medium text-text-dim tracking-tight">Rocket Booster</span>
            </div>
            <span className="text-[11px] font-mono text-text-muted tracking-wide">DIMOND HACKS '26</span>
          </header>

          {/* Hero */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">

            <div className="text-center mb-8">
              <h1
                className="font-serif text-[76px] leading-[1.1] tracking-[-0.01em] text-text italic anim-fade-up"
              >
                 Make browser-use<br />agents fly.
              </h1>
              <p
                className="text-[15px] text-text-dim mt-4 max-w-[380px] mx-auto leading-[1.6] anim-fade-up"
                style={{ animationDelay: '80ms' }}
              >
                Learn browsing patterns. Replay known steps with
                Playwright at machine speed. Agent handles the rest.
              </p>
            </div>

            {/* Input */}
            <div className="w-full flex justify-center anim-fade-up" style={{ animationDelay: '150ms' }}>
              <TaskInput onRun={launch} isRunning={false} />
            </div>

            {/* Three pillars in cards */}
            <div
              className="grid grid-cols-3 gap-3 mt-10 w-full max-w-[520px] anim-fade-up"
              style={{ animationDelay: '220ms' }}
            >
              {[
                { n: '01', title: 'Record', body: 'Agent completes the task normally. 40 seconds of clicking around.' },
                { n: '02', title: 'Learn', body: 'Booster extracts the playbook and turns it into a Playwright script.' },
                { n: '03', title: 'Fly', body: 'Playwright replays in 2 seconds flat. Agent finishes the last mile.' },
              ].map((item) => (
                <div
                  key={item.n}
                  className="rounded-xl border border-border bg-surface p-4 text-left"
                >
                  <span className="text-[10px] font-mono text-text-muted">{item.n}</span>
                  <h3 className="text-[13px] font-semibold text-text mt-1.5 mb-1">{item.title}</h3>
                  <p className="text-[11px] text-text-muted leading-[1.5]">{item.body}</p>
                </div>
              ))}
            </div>

            {/* Template pills */}
            {templates.length > 0 && (
              <div className="mt-8 anim-fade-up" style={{ animationDelay: '300ms' }}>
                <LearningHistory templates={templates} onSelect={setSelectedTemplate} selectedId={selectedTemplate?.id} />
              </div>
            )}

            {selectedTemplate && (
              <div className="mt-5 w-full max-w-[440px]">
                <TemplateVisualizer steps={selectedTemplate.steps} pattern={selectedTemplate.pattern} confidence={selectedTemplate.confidence} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━ RACING ━━━━━━━━━━━━━━━━━━ */}
      {view === 'racing' && (
        <div className="flex-1 flex flex-col relative z-10 anim-fade-in">

          {/* Compact header */}
          <header className="flex items-center gap-4 px-5 h-11 border-b border-border-subtle">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-[6px] h-[6px] rounded-full bg-lime" />
              <span className="text-[13px] font-medium text-text-dim">Rocket Booster</span>
            </div>
            <div className="flex-1">
              <TaskInput onRun={launch} isRunning={isRunning} onStop={reset} compact />
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-lime flex-shrink-0">
              <span className="w-[5px] h-[5px] rounded-full bg-lime dot-pulse" />
              Live
            </span>
          </header>

          {/* Split race */}
          <div className="flex-1 grid grid-cols-[1fr_1px_1fr] overflow-hidden">

            {/* Left — Baseline */}
            <div className="flex flex-col p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] font-medium text-text-dim">Without Booster</span>
                  <PhaseIndicator phase={basePh} />
                </div>
                <Timer elapsedMs={baseTimer.elapsedMs} isComplete={baseStatus?.status === 'complete'} variant="baseline" />
              </div>
              <BrowserEmbed liveUrl={baseStatus?.live_url ?? null} phase={basePh} />
              <div className="mt-2.5 flex-1 overflow-y-auto">
                <StepTracker steps={baseStatus?.steps ?? []} phase={basePh} currentStep={baseStatus?.current_step ?? ''} />
              </div>
            </div>

            {/* Divider + live speedup */}
            <div className="bg-border-subtle relative">
              {liveSpeedup && liveSpeedup > 1.2 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 anim-scale-up">
                  <div className="glass border border-lime/15 rounded-full px-4 py-1.5 glow-breathe whitespace-nowrap">
                    <span className="font-mono text-sm font-bold text-lime">{liveSpeedup.toFixed(1)}x</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right — Rocket */}
            <div className="flex flex-col p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] font-medium text-lime">With Booster</span>
                  <PhaseIndicator phase={rocketPh} />
                </div>
                <Timer elapsedMs={rocketTimer.elapsedMs} isComplete={rocketStatus?.status === 'complete'} variant="rocket" />
              </div>
              <BrowserEmbed liveUrl={rocketStatus?.live_url ?? null} phase={rocketPh} />
              <div className="mt-2.5 flex-1 overflow-y-auto">
                <StepTracker steps={rocketStatus?.steps ?? []} phase={rocketPh} currentStep={rocketStatus?.current_step ?? ''} />
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-5 h-8 border-t border-border-subtle text-[11px] font-mono text-text-muted">
            <span className="truncate max-w-sm">{currentTask}</span>
            <span>{(baseStatus?.steps.length ?? 0) + (rocketStatus?.steps.length ?? 0)} steps</span>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━ RESULTS ━━━━━━━━━━━━━━━━━━ */}
      {view === 'results' && baseStatus && rocketStatus && (
        <ComparisonCard
          baselineDurationMs={baseStatus.duration_ms}
          rocketDurationMs={rocketStatus.duration_ms}
          onReset={reset}
        />
      )}
    </div>
  );
}

export default App;
