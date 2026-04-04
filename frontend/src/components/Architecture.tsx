/**
 * Architecture — real system diagram with SVG wiring between nodes.
 * Not cards. An actual flowchart you'd draw on a whiteboard.
 */

export function Architecture() {
  return (
    <div className="w-full max-w-[660px]">
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-text-muted text-center mb-5">
        How it works
      </p>

      <div className="relative" style={{ height: 420 }}>

        {/* ════ SVG WIRING LAYER ════ */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {/* Task → diamond */}
          <Line x1="330" y1="44" x2="330" y2="88" />

          {/* Diamond → YES (left, to Rocket) */}
          <Line x1="280" y1="113" x2="140" y2="113" />
          <Line x1="140" y1="113" x2="140" y2="168" />

          {/* Diamond → NO (right, to Full Agent) */}
          <Line x1="380" y1="113" x2="520" y2="113" />
          <Line x1="520" y1="113" x2="520" y2="168" />

          {/* Rocket → merge point */}
          <Line x1="140" y1="246" x2="140" y2="278" />
          <Line x1="140" y1="278" x2="330" y2="278" />
          <Line x1="330" y1="278" x2="330" y2="298" />

          {/* Full Agent → merge point */}
          <Line x1="520" y1="246" x2="520" y2="278" />
          <Line x1="520" y1="278" x2="330" y2="278" />

          {/* Agent handoff → Result */}
          <Line x1="330" y1="366" x2="330" y2="390" />

          {/* Learning loop: result → back to Supabase */}
          <path
            d="M 258 405 L 58 405 L 58 113 L 108 113"
            fill="none"
            stroke="rgba(251,191,36,0.2)"
            strokeWidth="1"
            strokeDasharray="4 3"
          />

          {/* YES / NO labels */}
          <text x="195" y="106" fill="rgba(200,255,0,0.5)" fontSize="9" fontFamily="monospace">YES</text>
          <text x="425" y="106" fill="rgba(255,100,100,0.4)" fontSize="9" fontFamily="monospace">NO</text>

          {/* Loop label */}
          <text x="26" y="270" fill="rgba(251,191,36,0.3)" fontSize="8" fontFamily="monospace" transform="rotate(-90, 42, 265)">learn loop</text>
        </svg>

        {/* ════ NODE LAYER ════ */}

        {/* Task input */}
        <Node x={255} y={10} w={150} h={34}>
          <span className="text-[10px] font-mono text-text-muted">user task</span>
          <span className="text-[11px] text-text">&quot;Search for X on Amazon&quot;</span>
        </Node>

        {/* Decision diamond */}
        <div className="absolute" style={{ left: 280, top: 80, zIndex: 1 }}>
          <div
            className="w-[100px] h-[52px] flex items-center justify-center"
            style={{
              background: '#111',
              border: '1px solid rgba(200,255,0,0.15)',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          >
            <span className="text-[8px] font-mono text-lime/70 leading-tight text-center">template<br />exists?</span>
          </div>
        </div>

        {/* LEFT: Rocket Phase */}
        <Node x={60} y={168} w={160} h={78} border="rgba(200,255,0,0.12)">
          <span className="text-[9px] font-mono text-lime/50 tracking-wider">PLAYWRIGHT ROCKET</span>
          <span className="text-[10px] text-text-dim mt-1">Replays known steps via CDP</span>
          <span className="text-[9px] text-text-muted mt-0.5">navigate, click, fill, press</span>
          <span className="text-[9px] font-mono text-lime/40 mt-1">~200ms/step &middot; 0 LLM calls</span>
        </Node>

        {/* RIGHT: Full Agent (no template) */}
        <Node x={440} y={168} w={160} h={78} border="rgba(255,100,100,0.08)">
          <span className="text-[9px] font-mono text-red-400/40 tracking-wider">FULL AGENT</span>
          <span className="text-[10px] text-text-dim mt-1">No template. LLM every step.</span>
          <span className="text-[9px] text-text-muted mt-0.5">reason, act, observe, repeat</span>
          <span className="text-[9px] font-mono text-red-400/30 mt-1">~3s/step &middot; expensive</span>
        </Node>

        {/* CENTER: Agent handoff */}
        <Node x={230} y={298} w={200} h={68} border="rgba(56,189,248,0.12)">
          <span className="text-[9px] font-mono text-sky/50 tracking-wider">AGENT HANDOFF</span>
          <span className="text-[10px] text-text-dim mt-1">Claude takes over at the handoff point</span>
          <span className="text-[9px] text-text-muted mt-0.5">Only handles dynamic steps (decisions)</span>
        </Node>

        {/* Result + learn arrow */}
        <div className="absolute flex items-center gap-3" style={{ left: 196, top: 388, zIndex: 1 }}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ background: '#0d0d0d', borderColor: '#222' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-lime" />
            <span className="text-[10px] text-text-dim">Result</span>
          </div>
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
            <path d="M2 6h14M13 2l4 4-4 4" stroke="rgba(251,191,36,0.3)" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ background: 'rgba(251,191,36,0.03)', borderColor: 'rgba(251,191,36,0.15)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
            <span className="text-[10px] text-amber-400/70 font-mono">extract_template → supabase</span>
          </div>
        </div>

        {/* Floating tech labels near wires */}
        <Label x={88} y={152} text="Playwright + CDP" />
        <Label x={476} y={152} text="browser-use" />
        <Label x={282} y={286} text="Claude Sonnet 4.6" />
      </div>
    </div>
  );
}


function Node({
  x, y, w, h, border, children,
}: {
  x: number; y: number; w: number; h: number;
  border?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute flex flex-col items-center justify-center text-center px-3"
      style={{
        left: x, top: y, width: w, height: h,
        background: '#0e0e0e',
        border: `1px solid ${border || 'rgba(100,100,100,0.2)'}`,
        borderRadius: 8,
        zIndex: 1,
      }}
    >
      {children}
    </div>
  );
}

function Line({ x1, y1, x2, y2 }: { x1: string; y1: string; x2: string; y2: string }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="rgba(85,85,85,0.25)" strokeWidth="1"
    />
  );
}

function Label({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <div className="absolute text-[8px] font-mono text-text-muted/30" style={{ left: x, top: y, zIndex: 2 }}>
      {text}
    </div>
  );
}
