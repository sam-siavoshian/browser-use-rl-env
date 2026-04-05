import { DocPageShell, DocSection } from '../DocPageShell';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export function IntegrationPage() {
  return (
    <DocPageShell kicker="Integration" title="Base URL, polling, and requests">
      <DocSection title="Base URL" delay={40}>
        <div className="saas-inset-sm rounded-xl px-4 py-3 font-mono text-[13px] text-text-dim break-all border border-border">
          {API_BASE}
        </div>
        <p className="mt-3 text-[12px] text-text-muted leading-relaxed">
          Override with <code className="text-sky/90 font-mono text-[11px]">VITE_API_BASE</code> at build time. Paths in this reference are
          relative to this base (they include the <span className="font-mono">/api</span> prefix).
        </p>
      </DocSection>

      <DocSection title="Integration model" delay={80}>
        <ul className="space-y-3 text-[14px] text-text-dim leading-relaxed list-none pl-0">
          <li className="flex gap-3">
            <span className="font-mono text-lime/80 text-[12px] shrink-0 pt-0.5">1.</span>
            <span>
              <strong className="text-text font-medium">Start</strong> a run with a <code className="font-mono text-[12px] text-sky/90">POST</code> that returns{' '}
              <code className="font-mono text-[12px]">session_id</code> (or two IDs for compare) immediately.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-lime/80 text-[12px] shrink-0 pt-0.5">2.</span>
            <span>
              <strong className="text-text font-medium">Poll</strong>{' '}
              <code className="font-mono text-[12px] text-sky/90">GET …/status/&#123;session_id&#125;</code> about every{' '}
              <strong className="text-text">500ms</strong> until <code className="font-mono text-[12px]">complete</code> or{' '}
              <code className="font-mono text-[12px]">error</code>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-lime/80 text-[12px] shrink-0 pt-0.5">3.</span>
            <span>
              Completed sessions are pruned after roughly <strong className="text-text">5 minutes</strong>—do not rely on old session IDs forever.
            </span>
          </li>
        </ul>
      </DocSection>

      <DocSection title="Request body (task endpoints)" delay={120}>
        <p className="text-[14px] text-text-dim mb-4 leading-relaxed">
          All <code className="font-mono text-[12px]">POST</code> endpoints that accept a task use JSON:
        </p>
        <pre className="saas-inset-sm rounded-xl p-4 font-mono text-[12px] text-text-dim overflow-x-auto border border-border leading-relaxed">
{`{
  "task": "string"
}`}
        </pre>
        <p className="mt-3 text-[12px] text-text-muted">
          Constraints: <strong className="text-text-dim">3–2000</strong> characters.
        </p>
      </DocSection>
    </DocPageShell>
  );
}
