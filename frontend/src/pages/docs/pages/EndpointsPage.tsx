import { EndpointRow } from '../../../components/docs/EndpointBlocks';
import { DocPageShell, DocSection } from '../DocPageShell';

export function EndpointsPage() {
  return (
    <DocPageShell kicker="HTTP API" title="Endpoints">
      <DocSection title="All routes" delay={40}>
        <div className="space-y-6">
          <EndpointRow
            method="POST"
            path="/chat"
            res='{ "session_id": string }'
            note="Auto mode: high-confidence template match → Forged (Playwright + agent handoff); otherwise full agent then auto-learn template (best-effort)."
          />
          <EndpointRow
            method="GET"
            path="/chat/sessions"
            res="Array<{ session_id, task, status, mode_used, duration_ms }>"
            note="Recent chat sessions (newest first, capped server-side)."
          />
          <EndpointRow
            method="POST"
            path="/learn"
            res='{ "session_id": string }'
            note="Agent runs task → template extracted from trace → stored in Supabase."
          />
          <EndpointRow
            method="POST"
            path="/search-template"
            res='{ found: true, template_id, task_pattern, similarity, confidence, confidence_band, domain, action_type, playwright_steps, total_steps, needs_verification } | { found: false } | { found: false, error }'
            note="Embedding match only; does not start a browser. On exception, may return found: false with error string."
          />
          <EndpointRow
            method="POST"
            path="/compare"
            res='{ "baseline_session_id", "rocket_session_id" }'
            note="Starts baseline and Forged runs in parallel for the same task."
          />
          <EndpointRow
            method="POST"
            path="/run-baseline"
            res='{ "session_id": string }'
            note="Full browser-use agent only (no template / no forged path)."
          />
          <EndpointRow
            method="POST"
            path="/run-rocket"
            res='{ "session_id": string }'
            note="Requires a learned template; Playwright replay then agent handoff."
          />
          <EndpointRow
            method="GET"
            path="/status/{session_id}"
            res="SessionStatus"
            note="Poll for steps, live_url, phase, errors, result text, template_match metadata."
          />
          <EndpointRow
            method="GET"
            path="/templates"
            res="Template[]"
            note="Lists stored templates from Supabase (server-side limit/order)."
          />
          <EndpointRow
            method="DELETE"
            path="/templates/{template_id}"
            res='{ "deleted": template_id }'
            note="Removes a template row by id."
          />
          <EndpointRow
            method="GET"
            path="/health"
            res='{ "status", "version", "sessions_active" }'
            note="Lightweight readiness and active session count."
          />
        </div>
      </DocSection>
    </DocPageShell>
  );
}
