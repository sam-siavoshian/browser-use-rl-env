import { useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { DOC_SEARCH_INDEX } from '../../docs/searchIndex';

export function DocsCommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[min(18vh,160px)] px-4 pb-8 bg-black/65 backdrop-blur-md"
      role="presentation"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border/90 bg-elevated shadow-[0_24px_80px_rgba(0,0,0,0.55)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Search documentation"
      >
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-text-muted">
          <div className="border-b border-border/70 flex items-center gap-2 px-3">
            <span className="text-text-muted font-mono text-[11px] shrink-0">⌘K</span>
            <Command.Input
              placeholder="Search pages, endpoints…"
              className="flex-1 bg-transparent py-3.5 text-[14px] text-text outline-none placeholder:text-text-muted"
            />
          </div>
          <Command.List className="max-h-[min(52vh,360px)] overflow-y-auto py-2">
            <Command.Empty className="py-8 text-center text-[13px] text-text-muted">No results.</Command.Empty>
            <Command.Group heading="Documentation">
              {DOC_SEARCH_INDEX.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.title} ${item.keywords.join(' ')}`}
                  onSelect={() => {
                    navigate(item.path);
                    onOpenChange(false);
                  }}
                  className="cursor-pointer px-3 py-2.5 mx-1 rounded-lg text-[13px] text-text-dim data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-text aria-selected:bg-white/[0.06]"
                >
                  <span className="font-medium text-text">{item.title}</span>
                  <span className="block text-[11px] text-text-muted mt-0.5 font-mono truncate">{item.path}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
