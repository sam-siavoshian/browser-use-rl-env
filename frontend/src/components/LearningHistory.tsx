import type { Template } from '../types';

interface LearningHistoryProps {
  templates: Template[];
  onSelect?: (template: Template) => void;
  selectedId?: string;
}

export function LearningHistory({ templates, onSelect, selectedId }: LearningHistoryProps) {
  if (templates.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">Learned patterns</p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect?.(t)}
            className={`inline-flex items-center gap-1.5 h-[26px] px-3 rounded-full border text-[11px] transition-all ${
              selectedId === t.id
                ? 'bg-lime-soft border-lime/20 text-text'
                : 'bg-transparent border-border text-text-dim hover:border-text-muted/40 hover:text-text'
            }`}
          >
            <span>{t.domain}</span>
            <span className={`font-mono text-[10px] ${t.confidence >= 0.9 ? 'text-lime' : 'text-amber'}`}>
              {(t.confidence * 100).toFixed(0)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
