/**
 * Architecture — system flowchart with SVG wiring.
 * Uses a fixed 600px canvas centered in its container so coordinates are stable.
 */

import { DEFAULT_TASK } from './TaskInput';

const STROKE = 'rgba(120,120,120,0.45)';

export function Architecture() {
  // All coordinates assume a 600 x 420 canvas (extra room for padded nodes)
  const W = 600;
  const H = 420;
  const scale = 1.16;

  // Rocket / full-agent column bottoms (top 140 + height)
  const pillarBottom = 232;
  const handoffTop = 278;
  const handoffH = 68;
  const handoffBottom = handoffTop + handoffH;
  const resultRowTop = 362;

  return (
    <div className="w-full max-w-[780px] mx-auto">
      <p className="text-[12px] font-mono uppercase tracking-[0.22em] text-text-dim text-center mb-6">
        How it works
      </p>

      {/* Scaled canvas — reserves vertical space so layout doesn’t overlap the next section */}
      <div className="flex justify-center overflow-x-auto pb-2">
        <div
          className="relative shrink-0"
          style={{
            width: W * scale,
            height: H * scale,
          }}
        >
          <div
            className="absolute left-1/2 top-0 -translate-x-1/2"
            style={{
              width: W,
              height: H,
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
            }}
          >

          {/* ═══ SVG WIRES ═══ */}
          <svg className="absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ zIndex: 0 }}>
            {/* Task → diamond (task box bottom y=54, diamond top y=68) */}
            <line x1="300" y1="54" x2="300" y2="68" stroke={STROKE} strokeWidth="1.25" />

            {/* Diamond → YES left */}
            <line x1="255" y1="96" x2="150" y2="96" stroke={STROKE} strokeWidth="1.25" />
            <line x1="150" y1="96" x2="150" y2="140" stroke={STROKE} strokeWidth="1.25" />

            {/* Diamond → NO right */}
            <line x1="345" y1="96" x2="450" y2="96" stroke={STROKE} strokeWidth="1.25" />
            <line x1="450" y1="96" x2="450" y2="140" stroke={STROKE} strokeWidth="1.25" />

            {/* Rocket / full agent → merge (from pillar bottoms) */}
            <line x1="150" y1={pillarBottom} x2="150" y2="248" stroke={STROKE} strokeWidth="1.25" />
            <line x1="150" y1="248" x2="300" y2="248" stroke={STROKE} strokeWidth="1.25" />
            <line x1="300" y1="248" x2="300" y2={handoffTop} stroke={STROKE} strokeWidth="1.25" />

            {/* Full agent → merge */}
            <line x1="450" y1={pillarBottom} x2="450" y2="248" stroke={STROKE} strokeWidth="1.25" />
            <line x1="450" y1="248" x2="300" y2="248" stroke={STROKE} strokeWidth="1.25" />

            {/* Handoff → result */}
            <line x1="300" y1={handoffBottom} x2="300" y2={resultRowTop} stroke={STROKE} strokeWidth="1.25" />

            {/* Learning loop (dashed) */}
            <path
              d="M 220 388 L 46 388 L 46 96 L 90 96"
              stroke="rgba(251,191,36,0.45)"
              strokeWidth="1.25"
              strokeDasharray="5 4"
            />

            {/* Labels on wires */}
            <text x="178" y="89" fill="rgba(200,255,0,0.75)" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="600">YES</text>
            <text x="370" y="89" fill="rgba(255,120,120,0.7)" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="600">NO</text>
            <text x="14" y="242" fill="rgba(251,191,36,0.55)" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="500" transform="rotate(-90, 30, 235)">learn loop</text>
          </svg>

          {/* ═══ NODES ═══ */}

          {/* Task — single line + ellipsis; full string on hover */}
          <N left={210} top={6} w={180} h={48} align="stretch">
            <span className="text-[10px] font-mono text-text-dim shrink-0">user task</span>
            <p
              className="m-0 mt-1 w-full min-w-0 text-left text-[11px] text-text truncate"
              title={DEFAULT_TASK}
            >
              &quot;{DEFAULT_TASK}&quot;
            </p>
          </N>

          {/* Diamond */}
          <div className="absolute" style={{ left: 252, top: 68, zIndex: 1 }}>
            <div className="w-[96px] h-[52px] flex items-center justify-center"
              style={{
                background: '#111',
                border: '1px solid rgba(200,255,0,0.22)',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              }}
            >
              <span className="text-[10px] font-mono text-lime/85 text-center leading-tight">template<br />exists?</span>
            </div>
          </div>

          {/* Tech labels — above boxes so they never overlap titles */}
          <span className="absolute text-[9px] font-mono text-text-muted/80" style={{ left: 88, top: 114, zIndex: 3 }}>Playwright + CDP</span>
          <span className="absolute text-[9px] font-mono text-text-muted/80" style={{ left: 398, top: 114, zIndex: 3 }}>browser-use</span>

          {/* LEFT: Rocket */}
          <N left={66} top={140} w={168} h={92} border="rgba(200,255,0,0.2)">
            <span className="text-[10px] font-mono text-lime/75 tracking-widest font-semibold leading-tight">PLAYWRIGHT ROCKET</span>
            <span className="text-[11px] text-text-dim mt-1.5 leading-snug">Replays known steps via CDP</span>
            <span className="text-[10px] text-text-muted/90 mt-1 leading-snug">navigate, click, fill, press</span>
            <span className="text-[9px] font-mono text-lime/65 mt-2 whitespace-nowrap tabular-nums">~200ms/step · 0 LLM calls</span>
          </N>

          {/* RIGHT: Full Agent */}
          <N left={366} top={140} w={168} h={92} border="rgba(255,100,100,0.15)">
            <span className="text-[10px] font-mono text-red-400/75 tracking-widest font-semibold leading-tight">FULL AGENT</span>
            <span className="text-[11px] text-text-dim mt-1.5 leading-snug">No template. LLM every step.</span>
            <span className="text-[10px] text-text-muted/90 mt-1 leading-snug">reason, act, observe, repeat</span>
            <span className="text-[9px] font-mono text-red-400/60 mt-2 whitespace-nowrap tabular-nums">~3s/step · expensive</span>
          </N>

          {/* CENTER: Agent handoff */}
          <N left={200} top={handoffTop} w={200} h={handoffH} border="rgba(56,189,248,0.2)">
            <span className="text-[10px] font-mono text-sky/80 tracking-widest font-semibold leading-tight">AGENT HANDOFF</span>
            <span className="text-[11px] text-text-dim mt-1.5 leading-snug">Claude takes over at handoff point</span>
            <span className="text-[10px] text-text-muted/90 mt-1 leading-snug">Only dynamic steps (decisions)</span>
          </N>

          <span className="absolute text-[9px] font-mono text-text-muted/80" style={{ left: 248, top: handoffTop - 12, zIndex: 3 }}>Claude Sonnet 4.6</span>

          {/* Result + learn */}
          <div className="absolute flex items-center gap-2" style={{ left: 160, top: resultRowTop, zIndex: 1 }}>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border" style={{ background: '#0d0d0d', borderColor: '#2a2a2a' }}>
              <div className="w-2 h-2 rounded-full bg-lime" />
              <span className="text-[10px] text-text-dim">Result</span>
            </div>
            <svg width="18" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
              <path d="M1 5h12M10 1.5l3.5 3.5-3.5 3.5" stroke="rgba(251,191,36,0.45)" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border" style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.2)' }}>
              <div className="w-2 h-2 rounded-full bg-amber-400/70" />
              <span className="text-[10px] text-amber-400/85 font-mono">extract_template → supabase</span>
            </div>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function N({
  left, top, w, h, border, align = 'center', children,
}: {
  left: number; top: number; w: number; h: number;
  border?: string;
  /** stretch + left text for task row (truncate) */
  align?: 'center' | 'stretch';
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        align === 'stretch'
          ? 'absolute flex flex-col items-stretch justify-start text-left px-3 py-2 gap-0.5 overflow-hidden'
          : 'absolute flex flex-col items-center justify-start text-center px-3 py-2.5 gap-0.5 overflow-hidden'
      }
      style={{
        left, top, width: w, height: h,
        background: '#0e0e0e',
        border: `1px solid ${border || 'rgba(100,100,100,0.15)'}`,
        borderRadius: 8,
        zIndex: 2,
      }}
    >
      {children}
    </div>
  );
}
