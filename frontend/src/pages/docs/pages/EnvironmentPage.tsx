import { DocPageShell, DocSection } from '../DocPageShell';

export function EnvironmentPage() {
  return (
    <DocPageShell kicker="Deployment" title="Server environment">
      <DocSection title="Secrets & config" delay={40}>
        <p className="text-[14px] text-text-dim leading-relaxed mb-4">
          These are <strong className="text-text font-medium">not</strong> passed from browser clients; the FastAPI process must be configured on the host:
        </p>
        <ul className="text-[13px] text-text-muted space-y-2 list-disc pl-5 marker:text-text-muted">
          <li><code className="font-mono text-[11px] text-sky/90">BROWSER_USE_API_KEY</code> — cloud browser + BaaS</li>
          <li><code className="font-mono text-[11px] text-sky/90">SUPABASE_URL</code>, <code className="font-mono text-[11px] text-sky/90">SUPABASE_SERVICE_ROLE_KEY</code> — templates / embeddings</li>
          <li>Additional keys for LLM / embeddings as used by <code className="font-mono text-[11px]">src/</code> modules</li>
        </ul>
      </DocSection>
      <DocSection title="CORS" delay={80}>
        <p className="text-[12px] text-text-muted leading-relaxed">
          CORS is open (<code className="font-mono">allow_origins=[&quot;*&quot;]</code>) in the current app—tighten for production deployments.
        </p>
      </DocSection>
    </DocPageShell>
  );
}
