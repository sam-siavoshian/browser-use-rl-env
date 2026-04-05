import { CheckIcon } from 'lucide-animated';
import type { Phase } from '../types';
import { LoadingPinwheel } from './LoadingPinwheel';

interface BrowserEmbedProps {
  liveUrl: string | null;
  phase: Phase;
}

export function BrowserEmbed({ liveUrl, phase }: BrowserEmbedProps) {
  const active = phase === 'rocket' || phase === 'agent';
  const borderColor =
    phase === 'rocket' ? 'rgba(200,255,0,0.1)' :
    phase === 'agent' ? 'rgba(56,189,248,0.1)' :
    phase === 'complete' ? 'rgba(200,255,0,0.06)' :
    'rgba(35,35,40,1)';

  return (
    <div
      className="rounded-2xl overflow-hidden transition-colors duration-700"
      style={{
        background: '#080809',
        border: `1px solid ${borderColor}`,
        boxShadow: 'inset 0 6px 18px rgba(0,0,0,0.5), inset 0 2px 5px rgba(0,0,0,0.35), inset 0 -2px 6px rgba(255,255,255,0.02), 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3.5 h-8 border-b border-border-subtle" style={{ background: '#0d0d0f' }}>
        <span className="w-[7px] h-[7px] rounded-full" style={{ background: '#1e1e24' }} />
        <span className="w-[7px] h-[7px] rounded-full" style={{ background: '#1e1e24' }} />
        <span className="w-[7px] h-[7px] rounded-full" style={{ background: '#1e1e24' }} />
        {liveUrl && (
          <span className="ml-2 text-[10px] font-mono text-text-muted truncate">{liveUrl}</span>
        )}
      </div>

      <div className="aspect-[16/10] relative">
        {liveUrl ? (
          <iframe
            src={liveUrl}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allow="autoplay; clipboard-write"
            className="w-full h-full border-0"
            title="Browser view"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {active ? (
              <LoadingPinwheel
                active
                size={20}
                className={phase === 'rocket' ? 'text-lime/40' : 'text-sky/40'}
              />
            ) : phase === 'complete' ? (
              <CheckIcon size={16} className="text-lime/25" />
            ) : (
              <div className="w-5 h-px" style={{ background: '#1a1a1f' }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
