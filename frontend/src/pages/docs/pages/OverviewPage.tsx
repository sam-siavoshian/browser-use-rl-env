import { DocPageShell, DocSection } from '../DocPageShell';

export function OverviewPage() {
  return (
    <DocPageShell kicker="Forged API" title="Self-improving browser agents">
      <DocSection title="What this is" delay={40}>
        <p className="text-[15px] text-text-dim leading-relaxed max-w-[52ch]">
          The backend runs <strong className="text-text font-medium">browser-use</strong> agents against a cloud browser (CDP),
          learns <strong className="text-text font-medium">Playwright templates</strong> from traces, and replays fixed steps
          before handing off to the agent—so each successful run can make the next one faster.
        </p>
      </DocSection>
      <DocSection title="How it self-improves" delay={80}>
        <ul className="space-y-3 text-[14px] text-text-dim leading-relaxed list-none pl-0">
          <li className="flex gap-3">
            <span className="font-mono text-lime/80 text-[12px] shrink-0">Learn</span>
            <span>
              <code className="font-mono text-[12px] text-sky/90">POST /learn</code> — agent completes a task, a template is extracted from the trace and stored (e.g. Supabase).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-lime/80 text-[12px] shrink-0">Chat</span>
            <span>
              <code className="font-mono text-[12px] text-sky/90">POST /chat</code> — if embedding match is high enough, runs the forged path (Playwright + agent); otherwise full agent and{' '}
              <strong className="text-text font-medium">auto-learns</strong> a template (non-fatal on failure).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-lime/80 text-[12px] shrink-0">Race</span>
            <span>
              <code className="font-mono text-[12px] text-sky/90">POST /compare</code> — baseline vs Forged in parallel for benchmarking.
            </span>
          </li>
        </ul>
      </DocSection>
    </DocPageShell>
  );
}
