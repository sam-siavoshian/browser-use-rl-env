import { useCallback, useEffect, useState } from 'react';
import { TaskInput } from './components/TaskInput';
import { BrowserEmbed } from './components/BrowserEmbed';
import { Timer } from './components/Timer';
import { StepTracker } from './components/StepTracker';
import { PhaseIndicator } from './components/PhaseIndicator';
import { ComparisonCard } from './components/ComparisonCard';
import { TemplateSearchCard } from './components/TemplateSearchCard';
import { Analogy } from './components/Analogy';
import { Architecture } from './components/Architecture';
import { LearningHistory } from './components/LearningHistory';
import { usePoller } from './hooks/usePoller';
import { useTimer } from './hooks/useTimer';
import { startCompare, startLearn, getTemplates } from './api';
import type { Template, Phase } from './types';

type View = 'idle' | 'learning' | 'racing' | 'results';

function pathToView(pathname: string): View {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/learn') return 'learning';
  if (p === '/race') return 'racing';
  if (p === '/results') return 'results';
  return 'idle';
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const view = useMemo(() => pathToView(location.pathname), [location.pathname]);

  const [learnStarting, setLearnStarting] = useState(false);
  const [raceStarting, setRaceStarting] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [baselineId, setBaselineId] = useState<string | null>(null);
  const [rocketId, setRocketId] = useState<string | null>(null);
  const [learnId, setLearnId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const { status: baseStatus } = usePoller(baselineId);
  const { status: rocketStatus } = usePoller(rocketId);
  const { status: learnStatus } = usePoller(learnId);
  const baseTimer = useTimer();
  const rocketTimer = useTimer();
  const learnTimer = useTimer();

  useEffect(() => { getTemplates().then(setTemplates).catch(() => {}); }, []);

  useEffect(() => {
    if (baseStatus?.status === 'complete' || baseStatus?.status === 'error') baseTimer.stop();
  }, [baseStatus?.status]);
  useEffect(() => {
    if (rocketStatus?.status === 'complete' || rocketStatus?.status === 'error') rocketTimer.stop();
  }, [rocketStatus?.status]);
  useEffect(() => {
    if (learnStatus?.status === 'complete' || learnStatus?.status === 'error') learnTimer.stop();
  }, [learnStatus?.status]);

  useEffect(() => {
    if (baseStatus?.status === 'complete' && rocketStatus?.status === 'complete') {
      const t = setTimeout(() => navigate('/results'), 600);
      return () => clearTimeout(t);
    }
  }, [baseStatus?.status, rocketStatus?.status, navigate]);

  /** Cold deep-links without an active session */
  useEffect(() => {
    if (view === 'learning' && !learnId && !learnStarting) {
      navigate('/', { replace: true });
    }
  }, [view, learnId, learnStarting, navigate]);

  useEffect(() => {
    if (view === 'racing' && !baselineId && !raceStarting) {
      navigate('/', { replace: true });
    }
  }, [view, baselineId, raceStarting, navigate]);

  /** Unknown paths → home */
  useEffect(() => {
    const p = location.pathname.replace(/\/+$/, '') || '/';
    const allowed = ['/', '/learn', '/race', '/results'];
    if (!allowed.includes(p)) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  // When Race is clicked, show the search card inline (don't change view)
  const [searchingTask, setSearchingTask] = useState<string | null>(null);

  const launch = useCallback((task: string) => {
    setCurrentTask(task);
    setSearchingTask(task);  // shows search card below input
  }, []);

  // Actually start the race (called from search card)
  const startRace = useCallback(async () => {
    const task = searchingTask || currentTask;
    setSearchingTask(null);
    setBaselineId(null);
    setRocketId(null);
    baseTimer.reset();
    rocketTimer.reset();
    setRaceStarting(true);
    navigate('/race');
    try {
      const { baseline_session_id, rocket_session_id } = await startCompare(task);
      setBaselineId(baseline_session_id);
      setRocketId(rocket_session_id);
      baseTimer.start();
      rocketTimer.start();
    } catch {
      navigate('/');
    } finally {
      setRaceStarting(false);
    }
  }, [searchingTask, currentTask, baseTimer, rocketTimer, navigate]);

  const learn = useCallback(async (task: string) => {
    setCurrentTask(task);
    setSearchingTask(null);
    setLearnId(null);
    learnTimer.reset();
    setLearnStarting(true);
    navigate('/learn');
    try {
      const sessionId = await startLearn(task);
      setLearnId(sessionId);
      learnTimer.start();
    } catch {
      navigate('/');
    } finally {
      setLearnStarting(false);
    }
  }, [learnTimer, navigate]);

  const reset = useCallback(() => {
    setSearchingTask(null);
    setBaselineId(null);
    setRocketId(null);
    setLearnId(null);
    baseTimer.reset();
    rocketTimer.reset();
    learnTimer.reset();
    navigate('/');
    getTemplates().then(setTemplates).catch(() => {});
  }, [baseTimer, rocketTimer, learnTimer, navigate]);

  const basePh: Phase = baseStatus?.phase ?? 'idle';
  const rocketPh: Phase = rocketStatus?.phase ?? 'idle';
  const learnPh: Phase = learnStatus?.phase ?? 'idle';
  const isRunning = view === 'racing' || view === 'learning';
  const liveSpeedup = baseTimer.elapsedMs > 2000 && rocketTimer.elapsedMs > 200
    ? baseTimer.elapsedMs / rocketTimer.elapsedMs : null;

  return (
    <div className={`h-screen min-h-0 flex flex-col relative ${view === 'idle' ? 'overflow-y-auto' : 'overflow-hidden'}`} style={{ background: '#0a0a0a' }}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(200,255,0,0.025) 0%, transparent 65%)' }} />
      </div>

      {/* ━━━ IDLE ━━━ */}
      {view === 'idle' && (
        <div className="flex-1 flex flex-col relative z-10">
          {/* Pixel trail — inside idle so it receives mouse events */}
          <PixelBackground />

          {/* Content — top inset so the hero is not flush with the viewport */}
          <div className="flex-1 flex flex-col items-center justify-start px-6 pt-16 sm:pt-20 pb-20 relative z-10">

            {/* Headline */}
            <div className="text-center mb-6">
              <h1 className="font-serif text-[60px] leading-[1.05] tracking-[-0.01em] text-text italic anim-fade-up">
                Make browser-use<br />agents fly.
              </h1>
              <p className="text-[14px] text-text-dim mt-8 max-w-[400px] mx-auto leading-[1.6] anim-fade-up" style={{ animationDelay: '80ms' }}>
                <strong className="text-amber-400">Learn</strong> a task, then <strong className="text-lime">Race</strong> to watch Playwright
                blast through the known steps while the agent handles the rest.
              </p>
            </div>

            {/* Input + search card dropdown */}
            <div className="w-full flex flex-col items-center mb-16 anim-fade-up" style={{ animationDelay: '140ms' }}>
              <TaskInput onRun={launch} onLearn={learn} isRunning={false} />

              {/* Search card — slides open below input when Race is clicked */}
              {searchingTask && (
                <div className="mt-3 w-full max-w-[520px]">
                  <TemplateSearchCard
                    task={searchingTask}
                    onRace={startRace}
                    onLearnInstead={() => learn(searchingTask)}
                    onDismiss={() => setSearchingTask(null)}
                  />
                </div>
              )}
            </div>

            {/* Compact analogy with animated speed bars */}
            <div className="mt-10 anim-fade-up" style={{ animationDelay: '200ms' }}>
              <Analogy />
            </div>

            {/* Architecture diagram */}
            <div className="mt-16 anim-fade-up" style={{ animationDelay: '260ms' }}>
              <Architecture />
            </div>

            {/* Template pills */}
            {templates.length > 0 && (
              <div className="mt-5 anim-fade-up" style={{ animationDelay: '300ms' }}>
                <LearningHistory templates={templates} onSelect={setSelectedTemplate} selectedId={selectedTemplate?.id} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ━━━ LEARNING ━━━ */}
      {view === 'learning' && (
        <div className="flex-1 flex flex-col min-h-0 relative z-10 anim-fade-in">
          <header className="flex-shrink-0 flex items-center gap-4 px-5 h-11 border-b border-border-subtle">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-[6px] h-[6px] rounded-full bg-amber-400 dot-pulse" />
              <span className="text-[13px] font-medium text-amber-400">Learning Mode</span>
            </div>
            <div className="flex-1 text-[12px] text-text-muted truncate font-mono min-w-0">{currentTask}</div>
            <Timer elapsedMs={learnTimer.elapsedMs} isComplete={learnStatus?.status === 'complete'} variant="baseline" />
          </header>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col items-center p-6 pb-10">
            <div className="w-full max-w-3xl">
              <div className="flex items-center gap-2.5 mb-3">
                <PhaseIndicator phase={learnPh} />
                <span className="text-[13px] text-text-dim">
                  {learnPh === 'agent' && 'Agent running the task...'}
                  {learnPh === 'learning' && 'Extracting template from trace...'}
                  {learnPh === 'complete' && 'Template learned!'}
                  {learnPh === 'error' && 'Learning failed'}
                  {learnPh === 'idle' && 'Starting...'}
                </span>
              </div>
              <BrowserEmbed liveUrl={learnStatus?.live_url ?? null} phase={learnPh === 'learning' ? 'agent' : learnPh} />
              <div className="mt-4">
                <StepTracker steps={learnStatus?.steps ?? []} phase={learnPh} currentStep={learnStatus?.current_step ?? ''} />
              </div>
              {learnStatus?.status === 'complete' && (
                <div className="mt-6 p-5 rounded-xl border border-lime/20 bg-lime/5 text-center anim-scale-up">
                  <div className="text-lime text-lg font-semibold mb-1">Template Learned!</div>
                  <p className="text-[13px] text-text-dim mb-4">
                    Now type a <strong>similar</strong> task and hit <strong className="text-lime">Race</strong> to see the speedup.
                  </p>
                  <button onClick={reset} className="px-6 py-2.5 bg-lime text-bg rounded-xl text-[13px] font-medium hover:brightness-110 transition-all">
                    Race with a similar task
                  </button>
                </div>
              )}
              {learnStatus?.status === 'error' && (
                <div className="mt-6 p-5 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
                  <div className="text-red-400 text-sm font-medium mb-2">Learning Failed</div>
                  <p className="text-[12px] text-text-muted mb-3">{learnStatus.error}</p>
                  <button onClick={reset} className="px-5 py-2 bg-surface border border-border rounded-xl text-[13px] text-text-dim hover:border-lime/30 transition-all">
                    Try again
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* ━━━ RACING ━━━ */}
      {view === 'racing' && (
        <div className="flex-1 flex flex-col min-h-0 relative z-10 anim-fade-in">
          <header className="flex-shrink-0 flex items-center gap-4 px-5 h-11 border-b border-border-subtle">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-[6px] h-[6px] rounded-full bg-lime" />
              <span className="text-[13px] font-medium text-text-dim">Rocket Booster</span>
            </div>
            <div className="flex-1">
              <TaskInput onRun={launch} isRunning={isRunning} onStop={reset} compact />
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-lime flex-shrink-0">
              <span className="w-[5px] h-[5px] rounded-full bg-lime dot-pulse" /> Live
            </span>
          </header>
          <div className="flex-1 grid grid-cols-[1fr_1px_1fr] overflow-hidden">
            {/* Left: Baseline */}
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
            {/* Divider */}
            <div className="bg-border-subtle relative">
              {liveSpeedup && liveSpeedup > 1.2 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 anim-scale-up">
                  <div className="glass border border-lime/15 rounded-full px-4 py-1.5 glow-breathe whitespace-nowrap">
                    <span className="font-mono text-sm font-bold text-lime">{liveSpeedup.toFixed(1)}x</span>
                  </div>
                </div>
              )}
            </div>
            {/* Right: Rocket */}
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
          <div className="flex items-center justify-between px-5 h-8 border-t border-border-subtle text-[11px] font-mono text-text-muted">
            <span className="truncate max-w-sm">{currentTask}</span>
            <span>{(baseStatus?.steps.length ?? 0) + (rocketStatus?.steps.length ?? 0)} steps</span>
          </div>
        </div>
      )}

      {/* ━━━ RESULTS ━━━ */}
      {view === 'results' && (!baseStatus || !rocketStatus) && (
        <Navigate to="/" replace />
      )}
      {view === 'results' && baseStatus && rocketStatus && (
        <ComparisonCard baselineDurationMs={baseStatus.duration_ms} rocketDurationMs={rocketStatus.duration_ms} onReset={reset} />
      )}
    </div>
  );
}

export default App;
