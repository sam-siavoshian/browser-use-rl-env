import { DocPageShell, DocSection } from '../DocPageShell';

export function ModelsPage() {
  return (
    <DocPageShell kicker="Types" title="Session & step payloads">
      <DocSection title="SessionStatus (poll payload)" delay={40}>
        <p className="text-[13px] text-text-dim mb-4 leading-relaxed">
          Returned by <code className="font-mono text-[12px]">GET /status/&#123;id&#125;</code> (unknown id returns a stub with{' '}
          <code className="font-mono text-[12px]">status: &quot;not_found&quot;</code>).
        </p>
        <ul className="text-[13px] text-text-dim space-y-2 font-mono text-[11px] leading-relaxed border border-border rounded-xl p-4 bg-surface/40">
          <li><span className="text-lime/90">session_id</span> string</li>
          <li><span className="text-lime/90">status</span> pending | running | complete | error | not_found</li>
          <li><span className="text-lime/90">phase</span> idle | rocket | agent | complete | error | learning</li>
          <li><span className="text-lime/90">current_step</span> string</li>
          <li><span className="text-lime/90">steps</span> StepInfo[]</li>
          <li><span className="text-lime/90">live_url</span> string | null (embedded browser view)</li>
          <li><span className="text-lime/90">duration_ms</span> number</li>
          <li><span className="text-lime/90">error</span> string | null</li>
          <li><span className="text-lime/90">completed_at</span> number | null</li>
          <li><span className="text-lime/90">mode_used</span> rocket | baseline_learn | null</li>
          <li><span className="text-lime/90">template_match</span> &#123; similarity, domain, task_pattern &#125; | null</li>
          <li><span className="text-lime/90">task</span> string | null</li>
          <li><span className="text-lime/90">result</span> string | null (agent final answer when populated)</li>
          <li><span className="text-lime/90">agent_complete</span> boolean (learn flow: agent done while template still extracting)</li>
          <li><span className="text-lime/90">agent_duration_ms</span> number | null</li>
        </ul>
      </DocSection>

      <DocSection title="StepInfo (each steps[] entry)" delay={80}>
        <ul className="text-[13px] text-text-dim space-y-2 font-mono text-[11px] leading-relaxed border border-border rounded-xl p-4 bg-surface/40">
          <li><span className="text-sky/90">id</span> string</li>
          <li><span className="text-sky/90">description</span> string</li>
          <li><span className="text-sky/90">type</span> &quot;playwright&quot; | &quot;agent&quot;</li>
          <li><span className="text-sky/90">timestamp</span> number (ms)</li>
          <li><span className="text-sky/90">durationMs</span> number | null</li>
          <li><span className="text-sky/90">action_type</span> string | null (e.g. navigate, click, template_match, agent_action)</li>
          <li><span className="text-sky/90">details</span> object | null</li>
        </ul>
      </DocSection>
    </DocPageShell>
  );
}
