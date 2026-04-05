import { useEffect, useState } from 'react';
import { XIcon } from 'lucide-animated';
import type { TemplateSearchResult } from '../api';
import { searchTemplate } from '../api';
import { LoadingPinwheel } from './LoadingPinwheel';

type SearchPhase = 'searching' | 'found' | 'not_found' | 'error';

interface TemplateSearchCardProps {
  task: string;
  onRace: () => void;
  onLearnInstead: () => void;
  onDismiss: () => void;
}

export function TemplateSearchCard({ task, onRace, onLearnInstead, onDismiss }: TemplateSearchCardProps) {
  const [phase, setPhase] = useState<SearchPhase>('searching');
  const [result, setResult] = useState<TemplateSearchResult | null>(null);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (phase !== 'searching') return;
    const id = setInterval(() => setDots(d => (d + 1) % 4), 400);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const r = await searchTemplate(task);
        if (cancelled) return;
        setResult(r);
        setPhase(r.found ? 'found' : 'not_found');
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();

    return () => { cancelled = true; };
  }, [task]);

  return (
    <div className="w-full max-w-[520px] anim-scale-up">
      <div
        className="saas-card overflow-hidden transition-all duration-500"
        style={{
          borderColor: phase === 'found' ? 'rgba(200,255,0,0.15)' :
                       phase === 'not_found' ? 'rgba(251,191,36,0.15)' :
                       undefined,
          background: phase === 'found' ? 'rgba(200,255,0,0.03)' :
                      phase === 'not_found' ? 'rgba(251,191,36,0.03)' :
                      undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-subtle/50">
          <div className="flex items-center gap-2">
            {phase === 'searching' && (
              <LoadingPinwheel active size={14} className="text-lime/50" />
            )}
            {phase === 'found' && (
              <div className="w-3 h-3 rounded-full bg-lime/80" />
            )}
            {phase === 'not_found' && (
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            )}
            {phase === 'error' && (
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
            )}
            <span className="text-[11px] font-mono text-text-muted tracking-widest uppercase">
              Template Search
            </span>
          </div>
          <button type="button" onClick={onDismiss} className="ml-auto text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-white/5" aria-label="Dismiss">
            <XIcon size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">

          {phase === 'searching' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-lime/60 bg-lime/5 px-1.5 py-0.5 rounded-md">tool_call</span>
                </div>
                <span className="text-[13px] text-text-dim">
                  query_template_db{'.'.repeat(dots)}
                </span>
              </div>
              <div className="font-mono text-[11px] text-text-muted saas-inset px-3 py-2.5">
                <span className="text-lime/40">{'>'}</span> Embedding task description{'.'.repeat(dots)}<br/>
                <span className="text-lime/40">{'>'}</span> Searching pgvector for cosine similarity{'.'.repeat(dots)}<br/>
                <span className="text-lime/40">{'>'}</span> Matching domain + action type{'.'.repeat(dots)}
              </div>
            </div>
          )}

          {phase === 'found' && result && (
            <div className="space-y-3 anim-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-lime bg-lime/10 px-1.5 py-0.5 rounded-md">match</span>
                <span className="text-[13px] text-lime font-medium">
                  Template found!
                </span>
              </div>

              <div className="font-mono text-[11px] saas-inset px-3 py-2.5 space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-muted">pattern</span>
                  <span className="text-text-dim">{result.task_pattern}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">similarity</span>
                  <span className="text-lime font-medium">{((result.similarity || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">domain</span>
                  <span className="text-text-dim">{result.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">rocket steps</span>
                  <span className="text-lime">{result.playwright_steps} Playwright + {(result.total_steps || 0) - (result.playwright_steps || 0)} agent</span>
                </div>
              </div>

              <button
                onClick={onRace}
                className="w-full h-11 rounded-xl font-medium text-[13px] tracking-wide bg-lime text-bg hover:brightness-110 active:scale-[0.98] transition-all saas-btn-primary"
              >
                Launch Race
              </button>
            </div>
          )}

          {phase === 'not_found' && (
            <div className="space-y-3 anim-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md">no_match</span>
                <span className="text-[13px] text-amber-400 font-medium">
                  No template found
                </span>
              </div>

              <p className="text-[12px] text-text-muted leading-relaxed">
                This task hasn't been learned yet. Run <strong className="text-amber-400">Learn</strong> first to teach the system, then race with a similar task.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={onLearnInstead}
                  className="flex-1 h-10 rounded-xl font-medium text-[13px] bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/15 transition-all saas-btn"
                >
                  Learn This Task
                </button>
                <button
                  onClick={onRace}
                  className="h-10 px-4 rounded-xl text-[12px] text-text-muted border border-border hover:border-border/80 transition-all saas-btn"
                >
                  Race anyway
                </button>
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="space-y-3 anim-fade-in">
              <p className="text-[12px] text-red-400">Search failed. You can still race (will use full agent).</p>
              <button
                onClick={onRace}
                className="w-full h-10 rounded-xl font-medium text-[13px] bg-surface border border-border text-text-dim hover:border-lime/20 transition-all saas-btn"
              >
                Race without template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
