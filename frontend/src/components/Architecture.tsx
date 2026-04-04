/**
 * Architecture — technical breakdown of how Rocket Booster works.
 *
 * Shows the RL loop as a visual pipeline: task → memory check → rocket/agent → learn.
 * Designed for hackathon judges who want to see the real system, not marketing.
 */

export function Architecture() {
  return (
    <div className="w-full max-w-[640px]">
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-text-muted text-center mb-4">
        System Architecture
      </p>

      <div className="rounded-2xl border border-border overflow-hidden bg-surface">

        {/* ── Pipeline overview ── */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-lime" />
            <span className="text-[11px] font-mono text-text-muted tracking-wide">THE RL LOOP</span>
          </div>

          {/* Pipeline flow — horizontal with arrows */}
          <div className="flex items-stretch gap-0 text-center">
            {/* Task */}
            <div className="flex-1 rounded-l-lg border border-border px-2 py-3" style={{ background: '#0d0d0d' }}>
              <div className="text-[9px] font-mono text-text-muted mb-1">INPUT</div>
              <div className="text-[12px] text-text font-medium">Task</div>
              <div className="text-[9px] text-text-muted mt-0.5 italic">"Buy X on Amazon"</div>
            </div>

            <Arrow />

            {/* Memory check */}
            <div className="flex-1 border-y border-border px-2 py-3" style={{ background: 'rgba(200,255,0,0.02)' }}>
              <div className="text-[9px] font-mono text-lime/60 mb-1">QUERY</div>
              <div className="text-[12px] text-lime font-medium">pgvector</div>
              <div className="text-[9px] text-text-muted mt-0.5">cosine similarity</div>
            </div>

            <Arrow />

            {/* Execution */}
            <div className="flex-1 border-y border-border px-2 py-3" style={{ background: '#0d0d0d' }}>
              <div className="text-[9px] font-mono text-sky/60 mb-1">EXECUTE</div>
              <div className="text-[12px] text-text font-medium">Rocket + Agent</div>
              <div className="text-[9px] text-text-muted mt-0.5">Playwright → LLM</div>
            </div>

            <Arrow />

            {/* Learn */}
            <div className="flex-1 rounded-r-lg border border-border px-2 py-3" style={{ background: 'rgba(251,191,36,0.02)' }}>
              <div className="text-[9px] font-mono text-amber-400/60 mb-1">STORE</div>
              <div className="text-[12px] text-amber-400 font-medium">Template</div>
              <div className="text-[9px] text-text-muted mt-0.5">→ Supabase</div>
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* ── The two phases ── */}
        <div className="grid grid-cols-[1fr_1px_1fr]">

          {/* Rocket phase */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(200,255,0,0.08)' }}>
                <span className="text-[10px]">⚡</span>
              </div>
              <div>
                <div className="text-[12px] text-lime font-medium">Rocket Phase</div>
                <div className="text-[9px] font-mono text-text-muted">~200ms / step</div>
              </div>
            </div>

            <div className="space-y-1.5 ml-7">
              <Step label="Playwright" desc="connect_over_cdp()" color="lime" />
              <Step label="Execute" desc="navigate, click, fill, press" color="lime" />
              <Step label="Verify" desc="wait_for_selector at each step" color="lime" />
              <Step label="Disconnect" desc="browser.disconnect()" color="lime" />
            </div>

            <div className="mt-3 ml-7 px-2.5 py-1.5 rounded-md text-[10px] font-mono" style={{ background: 'rgba(200,255,0,0.04)', color: 'rgba(200,255,0,0.5)' }}>
              0 LLM calls. Pure automation.
            </div>
          </div>

          <div className="bg-border relative">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-mono text-text-muted px-1 py-0.5 rounded" style={{ background: '#111' }}>
              then
            </span>
          </div>

          {/* Agent phase */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.08)' }}>
                <span className="text-[10px]">🧠</span>
              </div>
              <div>
                <div className="text-[12px] text-sky font-medium">Agent Phase</div>
                <div className="text-[9px] font-mono text-text-muted">~3s / step</div>
              </div>
            </div>

            <div className="space-y-1.5 ml-7">
              <Step label="Handoff" desc="agent sees page state from Playwright" color="sky" />
              <Step label="Reason" desc="Claude Sonnet picks next action" color="sky" />
              <Step label="Act" desc="dynamic steps only (the hard part)" color="sky" />
              <Step label="Done" desc="result returned" color="sky" />
            </div>

            <div className="mt-3 ml-7 px-2.5 py-1.5 rounded-md text-[10px] font-mono" style={{ background: 'rgba(56,189,248,0.04)', color: 'rgba(56,189,248,0.5)' }}>
              LLM only where reasoning is needed.
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* ── Tech stack strip ── */}
        <div className="flex items-center justify-between px-5 py-3" style={{ background: 'rgba(200,255,0,0.01)' }}>
          <div className="flex items-center gap-4">
            {[
              { name: 'Browser Use', role: 'cloud browser' },
              { name: 'Playwright', role: 'rocket executor' },
              { name: 'Claude', role: 'agent brain' },
              { name: 'Supabase', role: 'pgvector memory' },
            ].map((t) => (
              <div key={t.name} className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-text-dim font-medium">{t.name}</span>
                <span className="text-[9px] text-text-muted font-mono">{t.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Key insight ── */}
        <div className="border-t border-border px-5 py-3 text-center" style={{ background: 'rgba(200,255,0,0.015)' }}>
          <p className="text-[12px] text-text-dim leading-relaxed">
            Most browser steps <span className="font-mono text-lime/70">don't need reasoning</span>.
            The rocket handles the deterministic 80%.
            The LLM handles the interesting 20%.
          </p>
        </div>
      </div>
    </div>
  );
}


function Arrow() {
  return (
    <div className="flex items-center -mx-px z-10">
      <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="shrink-0">
        <path d="M2 12h10M9 8l4 4-4 4" stroke="rgba(85,85,85,0.4)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}


function Step({ label, desc, color }: { label: string; desc: string; color: 'lime' | 'sky' }) {
  const dotColor = color === 'lime' ? 'rgba(200,255,0,0.3)' : 'rgba(56,189,248,0.3)';
  return (
    <div className="flex items-baseline gap-2">
      <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: dotColor }} />
      <span className="text-[10px] font-mono text-text-dim">{label}</span>
      <span className="text-[9px] text-text-muted">{desc}</span>
    </div>
  );
}
