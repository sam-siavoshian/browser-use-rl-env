import { useState } from 'react';
import type { Template } from '../types';

interface TemplateLogsProps {
  templates: Template[];
}

function formatMs(ms: number | null | undefined): string {
  if (ms == null) return '--';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(iso: string): string {
  if (!iso) return '--';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

function confidenceColor(c: number): string {
  if (c >= 0.9) return 'text-lime';
  if (c >= 0.75) return 'text-amber-400';
  if (c >= 0.5) return 'text-sky-400';
  return 'text-red-400';
}

function confidenceBand(c: number): string {
  if (c >= 0.9) return 'Very High';
  if (c >= 0.75) return 'High';
  if (c >= 0.5) return 'Medium';
  return 'Low';
}

function TemplateLogCard({ template: t }: { template: Template }) {
  const [expanded, setExpanded] = useState(false);

  const totalRuns = (t.success_count ?? 0) + (t.failure_count ?? 0);
  const winRate = totalRuns > 0 ? ((t.success_count ?? 0) / totalRuns * 100) : 0;
  const fixedSteps = t.steps.filter(s => s.type === 'fixed').length;
  const paramSteps = t.steps.filter(s => s.type === 'parameterized').length;
  const dynamicSteps = t.steps.filter(s => s.type === 'dynamic').length;
  const handoffIdx = t.steps.findIndex(s => s.handoff);

  const speedup = (t.avg_baseline_duration_ms && t.avg_total_duration_ms && t.avg_total_duration_ms > 0)
    ? (t.avg_baseline_duration_ms / t.avg_total_duration_ms)
    : null;

  return (
    <div
      className="saas-card transition-all duration-200 cursor-pointer hover:border-border-subtle/60"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header row */}
      <div className="flex items-start gap-4 p-4">
        <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center shrink-0 border border-border">
          <img
            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(t.domain)}&sz=32`}
            alt=""
            width={18}
            height={18}
            className="rounded-sm"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13px] font-medium text-text truncate">{t.domain}</span>
            {t.action_type && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted">
                {t.action_type}
              </span>
            )}
            <span className="text-[10px] text-text-muted ml-auto shrink-0">
              {expanded ? '▾' : '▸'}
            </span>
          </div>
          <p className="text-[12px] text-text-dim truncate">{t.pattern}</p>

          {/* Compact stats row */}
          <div className="flex items-center gap-4 mt-2">
            <span className={`text-[11px] font-mono font-medium ${confidenceColor(t.confidence)}`}>
              {(t.confidence * 100).toFixed(0)}% {confidenceBand(t.confidence)}
            </span>
            <span className="text-[10px] text-text-muted">
              {totalRuns} run{totalRuns !== 1 ? 's' : ''}
              {totalRuns > 0 && ` · ${winRate.toFixed(0)}% success`}
            </span>
            {speedup && (
              <span className="text-[10px] font-mono text-lime">
                {speedup.toFixed(1)}x faster
              </span>
            )}
            <span className="text-[10px] text-text-muted ml-auto">{formatDate(t.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border px-4 pt-3 pb-4 space-y-4">
          {/* Step breakdown */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted mb-2">
              Step Breakdown
            </p>
            <div className="flex items-center gap-1.5 mb-2">
              {t.steps.map((step) => (
                <div
                  key={step.id}
                  className={`h-2 rounded-full ${
                    step.type === 'fixed' ? 'bg-lime/60' :
                    step.type === 'parameterized' ? 'bg-amber-400/60' :
                    'bg-sky-400/60'
                  }`}
                  style={{ width: `${Math.max(100 / t.steps.length, 8)}%` }}
                  title={`${step.type}: ${step.description}`}
                />
              ))}
            </div>
            <div className="flex gap-4 text-[10px] text-text-muted">
              <span><span className="inline-block w-2 h-2 rounded-full bg-lime/60 mr-1" />{fixedSteps} fixed</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400/60 mr-1" />{paramSteps} parameterized</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-sky-400/60 mr-1" />{dynamicSteps} dynamic</span>
              {handoffIdx >= 0 && (
                <span className="ml-auto">Handoff at step {handoffIdx}</span>
              )}
            </div>
          </div>

          {/* Performance metrics */}
          {(t.avg_rocket_duration_ms != null || t.avg_baseline_duration_ms != null) && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted mb-2">
                Performance
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-muted">Forged run</span>
                  <span className="text-text font-mono">{formatMs(t.avg_rocket_duration_ms)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Agent handoff</span>
                  <span className="text-text font-mono">{formatMs(t.avg_agent_duration_ms)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Total (forged)</span>
                  <span className="text-text font-mono">{formatMs(t.avg_total_duration_ms)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Baseline (vanilla)</span>
                  <span className="text-text font-mono">{formatMs(t.avg_baseline_duration_ms)}</span>
                </div>
              </div>
              {speedup && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full bg-lime/60"
                      style={{ width: `${Math.min(100, (1 / speedup) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-lime shrink-0">
                    {speedup.toFixed(1)}x speedup
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Confidence learning */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted mb-2">
              Confidence Learning
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        t.confidence >= 0.9 ? 'bg-lime/70' :
                        t.confidence >= 0.75 ? 'bg-amber-400/70' :
                        t.confidence >= 0.5 ? 'bg-sky-400/70' :
                        'bg-red-400/70'
                      }`}
                      style={{ width: `${t.confidence * 100}%` }}
                    />
                  </div>
                  <span className={`text-[12px] font-mono font-medium ${confidenceColor(t.confidence)}`}>
                    {(t.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex gap-4 text-[10px] text-text-muted">
                  <span className="text-lime">{t.success_count ?? 0} successes</span>
                  <span className="text-red-400">{t.failure_count ?? 0} failures</span>
                  <span>Started at 50% (initial)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Steps detail list */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted mb-2">
              Learned Steps
            </p>
            <div className="space-y-1">
              {t.steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 text-[11px]">
                  <span className="text-text-muted font-mono w-4 text-right shrink-0">{i}</span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      step.type === 'fixed' ? 'bg-lime/60' :
                      step.type === 'parameterized' ? 'bg-amber-400/60' :
                      'bg-sky-400/60'
                    }`}
                  />
                  <span className="text-text-dim truncate">{step.description}</span>
                  <span className="text-[9px] text-text-muted font-mono ml-auto shrink-0">{step.type}</span>
                  {step.handoff && (
                    <span className="text-[9px] text-amber-400 font-mono shrink-0">handoff</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TemplateLogs({ templates }: TemplateLogsProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="saas-inset-sm px-8 py-6 rounded-2xl inline-block">
          <p className="text-[13px] text-text-dim mb-1">No learning logs yet</p>
          <p className="text-[12px] text-text-muted">
            Teach the agent a task to see its learning progress here.
          </p>
        </div>
      </div>
    );
  }

  const totalRuns = templates.reduce((sum, t) => sum + (t.success_count ?? 0) + (t.failure_count ?? 0), 0);
  const totalSuccesses = templates.reduce((sum, t) => sum + (t.success_count ?? 0), 0);
  const avgConfidence = templates.reduce((sum, t) => sum + t.confidence, 0) / templates.length;

  return (
    <div className="space-y-6">
      {/* Aggregate stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Templates', value: String(templates.length), sub: 'skills learned' },
          { label: 'Total Runs', value: String(totalRuns), sub: totalRuns > 0 ? `${((totalSuccesses / totalRuns) * 100).toFixed(0)}% success` : 'no runs yet' },
          { label: 'Avg Confidence', value: `${(avgConfidence * 100).toFixed(0)}%`, sub: confidenceBand(avgConfidence) },
          {
            label: 'Avg Speedup',
            value: (() => {
              const withSpeedup = templates.filter(t => t.avg_baseline_duration_ms && t.avg_total_duration_ms && t.avg_total_duration_ms > 0);
              if (withSpeedup.length === 0) return '--';
              const avg = withSpeedup.reduce((sum, t) => sum + (t.avg_baseline_duration_ms! / t.avg_total_duration_ms!), 0) / withSpeedup.length;
              return `${avg.toFixed(1)}x`;
            })(),
            sub: 'vs baseline',
          },
        ].map((stat) => (
          <div key={stat.label} className="saas-inset-sm rounded-xl px-3 py-2.5 text-center">
            <p className="text-[18px] font-mono font-medium text-text">{stat.value}</p>
            <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-text-muted mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-text-dim mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Template cards */}
      <div className="space-y-2">
        {templates.map((t) => (
          <TemplateLogCard key={t.id} template={t} />
        ))}
      </div>
    </div>
  );
}
