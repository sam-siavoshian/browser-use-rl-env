import type { TemplateStep } from '../types';

interface TemplateVisualizerProps {
  steps: TemplateStep[];
  pattern: string;
  confidence: number;
}

const COLORS: Record<TemplateStep['type'], { bar: string; text: string }> = {
  fixed: { bar: 'bg-lime', text: 'text-lime' },
  parameterized: { bar: 'bg-sky', text: 'text-sky' },
  dynamic: { bar: 'bg-amber', text: 'text-amber' },
};

export function TemplateVisualizer({ steps, pattern, confidence }: TemplateVisualizerProps) {
  const handoffIdx = steps.findIndex((s) => s.handoff);

  return (
    <div className="anim-fade-up">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-sm font-body text-text-secondary">{pattern}</span>
        <span className={`font-mono text-xs font-semibold ${confidence >= 0.9 ? 'text-lime' : 'text-amber'}`}>
          {(confidence * 100).toFixed(0)}%
        </span>
      </div>

      <div className="space-y-px">
        {steps.map((step, i) => {
          const c = COLORS[step.type];
          return (
            <div key={step.id}>
              {i === handoffIdx && (
                <div className="flex items-center gap-3 my-2.5">
                  <div className="flex-1 h-px bg-gradient-to-r from-lime/20 to-sky/20" />
                  <span className="text-[9px] uppercase tracking-[0.2em] text-text-muted">handoff</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-sky/20 to-transparent" />
                </div>
              )}
              <div className="flex items-center gap-2 py-1.5 text-[13px]">
                <div className={`w-[3px] h-3 rounded-full ${c.bar}`} />
                <span className="text-text-secondary flex-1 truncate">{step.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-5 mt-4 pt-3 border-t border-border-subtle">
        {(['fixed', 'parameterized', 'dynamic'] as const).map((t) => (
          <span key={t} className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] ${COLORS[t].text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${COLORS[t].bar}`} />
            {t === 'parameterized' ? 'param' : t}
          </span>
        ))}
      </div>
    </div>
  );
}
