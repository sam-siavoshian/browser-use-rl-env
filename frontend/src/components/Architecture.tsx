/**
 * Architecture — accurate system diagram showing:
 *   RACE flow: Task → 3-layer match → Forge (Playwright/CDP) → Agent Handoff → Result
 *   LEARN flow: Task → Full Agent → Trace Extraction Pipeline → pgvector Store
 */

import { useState } from 'react';

type Tab = 'race' | 'learn';

export function Architecture() {
  const [tab, setTab] = useState<Tab>('race');

  return (
    <div className="w-full max-w-[720px] mx-auto">
      <p className="text-[12px] font-mono uppercase tracking-[0.22em] text-text-dim text-center mb-5">
        How it works
      </p>

      {/* Tab switcher */}
      <div className="flex justify-center gap-1 mb-5">
        {(['race', 'learn'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-widest transition-all ${
              tab === t
                ? t === 'race' ? 'bg-lime/10 text-lime border border-lime/20' : 'bg-amber/10 text-amber border border-amber/20'
                : 'text-text-muted border border-transparent hover:text-text-dim'
            }`}
            style={{
              boxShadow: tab === t
                ? 'inset 0 3px 8px rgba(0,0,0,0.25), inset 0 -1px 3px rgba(255,255,255,0.03), 0 1px 0 rgba(255,255,255,0.03)'
                : 'none',
            }}
          >
            {t === 'race' ? 'Race Mode' : 'Learn Mode'}
          </button>
        ))}
      </div>

      {tab === 'race' ? <RaceDiagram /> : <LearnDiagram />}
    </div>
  );
}

/* ═══════════════════════════════════════════
   RACE MODE DIAGRAM
   Task → Template Search (3-layer) → Match?
     YES → Forge (Playwright/CDP) → Agent Handoff → Result
     NO  → Full Agent → Result
   ═══════════════════════════════════════════ */

function RaceDiagram() {
  const W = 660;
  const H = 520;
  const S = 'rgba(120,120,120,0.4)';
  const SL = 'rgba(200,255,0,0.35)';
  const SR = 'rgba(255,100,100,0.3)';

  return (
    <div className="flex justify-center overflow-x-auto pb-2">
      <div className="relative shrink-0" style={{ width: W, height: H }}>
        <svg className="absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ zIndex: 0 }}>
          {/* Task → Search */}
          <line x1="330" y1="42" x2="330" y2="62" stroke={S} strokeWidth="1.25" />

          {/* Search → Diamond */}
          <line x1="330" y1="126" x2="330" y2="148" stroke={S} strokeWidth="1.25" />

          {/* Diamond → YES (left) */}
          <line x1="285" y1="174" x2="170" y2="174" stroke={SL} strokeWidth="1.25" />
          <line x1="170" y1="174" x2="170" y2="204" stroke={SL} strokeWidth="1.25" />

          {/* Diamond → NO (right) */}
          <line x1="375" y1="174" x2="490" y2="174" stroke={SR} strokeWidth="1.25" />
          <line x1="490" y1="174" x2="490" y2="204" stroke={SR} strokeWidth="1.25" />

          {/* Forge → Handoff */}
          <line x1="170" y1="296" x2="170" y2="324" stroke={SL} strokeWidth="1.25" />

          {/* Handoff → Result (left path) */}
          <line x1="170" y1="414" x2="170" y2="434" stroke={S} strokeWidth="1.25" />
          <line x1="170" y1="434" x2="330" y2="434" stroke={S} strokeWidth="1.25" />
          <line x1="330" y1="434" x2="330" y2="450" stroke={S} strokeWidth="1.25" />

          {/* Full Agent → Result (right path) */}
          <line x1="490" y1="296" x2="490" y2="434" stroke={SR} strokeWidth="1.25" />
          <line x1="490" y1="434" x2="330" y2="434" stroke={S} strokeWidth="1.25" />

          {/* YES / NO labels */}
          <text x="200" y="167" fill="rgba(200,255,0,0.75)" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="600">MATCH</text>
          <text x="392" y="167" fill="rgba(255,120,120,0.7)" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="600">NO MATCH</text>

          {/* Speed annotations */}
          <text x="178" y="316" fill="rgba(200,255,0,0.5)" fontSize="9" fontFamily="ui-monospace, monospace">~200ms/step</text>
          <text x="498" y="316" fill="rgba(255,120,120,0.45)" fontSize="9" fontFamily="ui-monospace, monospace">~3s/step</text>

          {/* BaaS cloud label */}
          <rect x="52" y="200" width="556" height="220" rx="12" stroke="rgba(100,100,100,0.12)" strokeWidth="1" strokeDasharray="4 3" fill="none" />
          <text x="68" y="218" fill="rgba(100,100,100,0.35)" fontSize="9" fontFamily="ui-monospace, monospace">Cloud Browser (BaaS · CDP)</text>
        </svg>

        {/* ═══ NODES ═══ */}

        {/* User Task */}
        <N left={240} top={4} w={180} h={38}>
          <span className="text-[10px] font-mono text-text-dim">User Task</span>
          <span className="text-[10px] text-text-muted mt-0.5">&quot;Go to site, do X, return Y&quot;</span>
        </N>

        {/* Template Search — 3 layers */}
        <N left={190} top={62} w={280} h={64} border="rgba(200,255,0,0.12)">
          <span className="text-[10px] font-mono text-lime/70 tracking-widest font-semibold">TEMPLATE SEARCH</span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Pill color="lime">1. domain</Pill>
            <Arrow />
            <Pill color="lime">2. action type</Pill>
            <Arrow />
            <Pill color="lime">3. pgvector</Pill>
          </div>
          <span className="text-[9px] text-text-muted mt-1">cosine similarity on 3072-dim embeddings</span>
        </N>

        {/* Diamond */}
        <div className="absolute" style={{ left: 284, top: 148, zIndex: 2 }}>
          <div className="w-[92px] h-[50px] flex items-center justify-center"
            style={{
              background: '#0e0e10',
              border: '1px solid rgba(200,255,0,0.2)',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          >
            <span className="text-[9px] font-mono text-lime/80 text-center leading-tight">sim &gt; 0.5?</span>
          </div>
        </div>

        {/* LEFT: Forge Phase */}
        <N left={80} top={204} w={180} h={92} border="rgba(200,255,0,0.18)">
          <span className="text-[10px] font-mono text-lime/75 tracking-widest font-semibold">FORGED PATH</span>
          <span className="text-[10px] text-text-dim mt-1 leading-snug">Playwright replays fixed +<br/>parameterized steps via CDP</span>
          <div className="flex gap-1 mt-1.5">
            <MicroPill>navigate</MicroPill>
            <MicroPill>click</MicroPill>
            <MicroPill>fill</MicroPill>
            <MicroPill>press</MicroPill>
          </div>
        </N>

        {/* RIGHT: Full Agent */}
        <N left={400} top={204} w={180} h={92} border="rgba(255,100,100,0.15)">
          <span className="text-[10px] font-mono text-red-400/70 tracking-widest font-semibold">FULL AGENT</span>
          <span className="text-[10px] text-text-dim mt-1 leading-snug">No template available.<br/>LLM reasons every step.</span>
          <span className="text-[9px] text-text-muted mt-1.5">browser-use + Claude Sonnet</span>
        </N>

        {/* Agent Handoff */}
        <N left={80} top={324} w={180} h={90} border="rgba(56,189,248,0.18)">
          <span className="text-[10px] font-mono text-sky/75 tracking-widest font-semibold">AGENT HANDOFF</span>
          <span className="text-[10px] text-text-dim mt-1 leading-snug">Playwright disconnects CDP.<br/>Agent picks up same browser.</span>
          <span className="text-[9px] text-text-muted mt-1 leading-snug">Only handles dynamic steps</span>
          <span className="text-[9px] font-mono text-sky/55 mt-1">disconnect() not close()</span>
        </N>

        {/* Result */}
        <N left={270} top={450} w={120} h={34}>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-lime" />
            <span className="text-[10px] text-text-dim font-medium">Result</span>
          </div>
        </N>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LEARN MODE DIAGRAM
   Task → Full Agent → Trace Extraction Pipeline → Store
   ═══════════════════════════════════════════ */

function LearnDiagram() {
  const W = 660;
  const H = 480;
  const S = 'rgba(251,191,36,0.4)';

  return (
    <div className="flex justify-center overflow-x-auto pb-2">
      <div className="relative shrink-0" style={{ width: W, height: H }}>
        <svg className="absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ zIndex: 0 }}>
          {/* Task → Agent */}
          <line x1="330" y1="42" x2="330" y2="64" stroke={S} strokeWidth="1.25" />

          {/* Agent → Pipeline */}
          <line x1="330" y1="138" x2="330" y2="170" stroke={S} strokeWidth="1.25" />

          {/* Pipeline internal arrows */}
          <line x1="330" y1="228" x2="330" y2="244" stroke="rgba(251,191,36,0.25)" strokeWidth="1" />
          <line x1="330" y1="296" x2="330" y2="312" stroke="rgba(251,191,36,0.25)" strokeWidth="1" />
          <line x1="330" y1="364" x2="330" y2="380" stroke="rgba(251,191,36,0.25)" strokeWidth="1" />

          {/* Store → bottom */}
          <line x1="330" y1="432" x2="330" y2="448" stroke={S} strokeWidth="1.25" />

          {/* Pipeline bracket */}
          <rect x="150" y="166" width="360" height="270" rx="12" stroke="rgba(251,191,36,0.15)" strokeWidth="1" strokeDasharray="4 3" fill="none" />
          <text x="166" y="184" fill="rgba(251,191,36,0.4)" fontSize="9" fontFamily="ui-monospace, monospace">Template Extraction Pipeline</text>
        </svg>

        {/* ═══ NODES ═══ */}

        {/* User Task */}
        <N left={240} top={4} w={180} h={38}>
          <span className="text-[10px] font-mono text-text-dim">User Task</span>
          <span className="text-[10px] text-text-muted mt-0.5">New task, no template yet</span>
        </N>

        {/* Full Agent Run */}
        <N left={210} top={64} w={240} h={74} border="rgba(251,191,36,0.18)">
          <span className="text-[10px] font-mono text-amber/70 tracking-widest font-semibold">FULL AGENT RUN</span>
          <span className="text-[10px] text-text-dim mt-1 leading-snug">browser-use agent executes the<br/>entire task, recording every action</span>
          <span className="text-[9px] text-text-muted mt-1">AgentHistoryList → raw trace</span>
        </N>

        {/* Step 1: Simplify */}
        <N left={195} top={192} w={270} h={36} border="rgba(251,191,36,0.12)">
          <div className="flex items-center gap-2">
            <StepNum n={1} />
            <span className="text-[10px] text-text-dim"><strong className="text-text/80">Simplify</strong> — remove retries, dead-ends, noise</span>
          </div>
        </N>

        {/* Step 2: Analyze */}
        <N left={195} top={248} w={270} h={48} border="rgba(251,191,36,0.12)">
          <div className="flex items-center gap-2">
            <StepNum n={2} />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-dim"><strong className="text-text/80">LLM Classify</strong> — Claude labels each step</span>
              <div className="flex gap-1 mt-1">
                <MicroPill>FIXED</MicroPill>
                <MicroPill>PARAM</MicroPill>
                <MicroPill>DYNAMIC</MicroPill>
                <span className="text-[9px] text-text-muted ml-0.5">+ selectors</span>
              </div>
            </div>
          </div>
        </N>

        {/* Step 3: Generate */}
        <N left={195} top={316} w={270} h={48} border="rgba(251,191,36,0.12)">
          <div className="flex items-center gap-2">
            <StepNum n={3} />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-dim"><strong className="text-text/80">Generate</strong> — build template structure</span>
              <span className="text-[9px] text-text-muted mt-0.5">handoff_index, params, fallback selectors</span>
            </div>
          </div>
        </N>

        {/* Step 4: Validate */}
        <N left={195} top={384} w={270} h={48} border="rgba(251,191,36,0.12)">
          <div className="flex items-center gap-2">
            <StepNum n={4} />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-dim"><strong className="text-text/80">Validate</strong> — check actions, selectors, params</span>
              <span className="text-[9px] text-text-muted mt-0.5">block on ERROR, warn on WARNING</span>
            </div>
          </div>
        </N>

        {/* Store */}
        <N left={210} top={448} w={240} h={30} border="rgba(200,255,0,0.15)">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-lime/70" />
            <span className="text-[10px] font-mono text-lime/70">embed (3072-dim) → Supabase pgvector</span>
          </div>
        </N>
      </div>
    </div>
  );
}

/* ═══ Shared primitives ═══ */

function N({
  left, top, w, h, border, children,
}: {
  left: number; top: number; w: number; h: number;
  border?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute flex flex-col items-center justify-center text-center px-3 py-2 overflow-hidden"
      style={{
        left, top, width: w, height: h,
        background: '#0d0d0f',
        border: `1px solid ${border || 'rgba(100,100,100,0.15)'}`,
        borderRadius: 12,
        zIndex: 2,
        boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.3), inset 0 -1px 3px rgba(255,255,255,0.02), 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {children}
    </div>
  );
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  const c = color === 'lime' ? 'text-lime/70 bg-lime/8 border-lime/15' : 'text-amber/70 bg-amber/8 border-amber/15';
  return (
    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-md border ${c}`}>
      {children}
    </span>
  );
}

function MicroPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[8px] font-mono text-text-muted/70 bg-white/[0.03] px-1 py-px rounded">
      {children}
    </span>
  );
}

function Arrow() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="shrink-0">
      <path d="M1 4h6M5 1.5L7.5 4 5 6.5" stroke="rgba(200,255,0,0.35)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function StepNum({ n }: { n: number }) {
  return (
    <span
      className="shrink-0 w-[18px] h-[18px] rounded-md flex items-center justify-center text-[9px] font-mono font-bold text-amber/70"
      style={{
        background: 'rgba(251,191,36,0.08)',
        border: '1px solid rgba(251,191,36,0.15)',
      }}
    >
      {n}
    </span>
  );
}
