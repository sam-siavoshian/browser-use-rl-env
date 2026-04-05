import {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { CHAT_INPUT_MAX_HEIGHT_PX, PRIMARY_INPUT_MIN_HEIGHT_PX } from '../../ui/inputSizing';
import { useRotatingTypewriter } from '../../hooks/useRotatingTypewriter';

const CHAT_PLACEHOLDER_PHRASES = [
  'Ask Forged to inspect a site',
  'Research a topic in the browser',
  'Compare products across pages',
  'Summarize what happened in a flow',
  'Check a repo or docs page',
] as const;

export type ChatInputHandle = { focus: () => void };

interface ChatInputProps {
  onSubmit: (task: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Controlled: when both are set, value is owned by parent (e.g. pills insert text without submitting). */
  value?: string;
  onValueChange?: (v: string) => void;
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput(
  { onSubmit, disabled, placeholder, value: valueProp, onValueChange },
  ref,
) {
  const [internalValue, setInternalValue] = useState('');
  const controlled = valueProp !== undefined && onValueChange !== undefined;
  const value = controlled ? valueProp : internalValue;
  const setValue = useCallback(
    (v: string) => {
      if (controlled) onValueChange(v);
      else setInternalValue(v);
    },
    [controlled, onValueChange],
  );

  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const showTypewriter = value === '' && !focused && !disabled;
  const typewriterText = useRotatingTypewriter(showTypewriter, CHAT_PLACEHOLDER_PHRASES);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
  }));

  const syncHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(
      Math.max(el.scrollHeight, PRIMARY_INPUT_MIN_HEIGHT_PX),
      CHAT_INPUT_MAX_HEIGHT_PX,
    );
    el.style.height = `${next}px`;
  }, []);

  useLayoutEffect(() => {
    syncHeight();
  }, [value, syncHeight]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  }, [value, disabled, onSubmit, setValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <div className="w-full max-w-[680px]">
      {/* Outer glow ring on focus */}
      <div
        className="rounded-[20px] p-[1px] transition-all duration-300"
        style={{
          background: focused
            ? 'linear-gradient(135deg, rgba(200,255,0,0.15), rgba(200,255,0,0.03), rgba(200,255,0,0.08))'
            : 'rgba(255,255,255,0.04)',
          boxShadow: focused
            ? '0 0 30px rgba(200,255,0,0.06), 0 0 60px rgba(200,255,0,0.02)'
            : 'none',
        }}
      >
        <div
          className="relative flex items-end gap-3 rounded-[19px] px-5 py-3"
          style={{
            background: 'rgba(0,0,0,0.4)',
            boxShadow: `
              inset 0 8px 24px rgba(0,0,0,0.6),
              inset 0 2px 6px rgba(0,0,0,0.4),
              inset 0 -1px 3px rgba(255,255,255,0.02),
              0 1px 0 rgba(255,255,255,0.03)
            `,
          }}
        >
          <div className="relative flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={showTypewriter ? '' : (placeholder || 'Send a message...')}
              disabled={disabled}
              rows={1}
              className="w-full resize-none bg-transparent text-[15px] text-text placeholder-text-muted/60
                         focus:outline-none disabled:opacity-30 leading-[24px] py-[6px] px-0
                         min-h-[36px] overflow-y-auto"
              style={{
                fontFamily: 'var(--font-body)',
                maxHeight: CHAT_INPUT_MAX_HEIGHT_PX,
              }}
            />
            {showTypewriter && (
              <div
                className="pointer-events-none absolute inset-0 flex items-start py-[6px] text-[15px] leading-[24px] text-text-muted/60"
                aria-hidden
              >
                <span className="min-w-0 max-w-full truncate">{typewriterText || (placeholder || 'Send a message...')}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl
                       transition-all duration-200"
            style={{
              background: canSubmit ? 'var(--color-lime)' : 'rgba(255,255,255,0.04)',
              color: canSubmit ? '#09090b' : 'var(--color-text-muted)',
              boxShadow: canSubmit
                ? 'inset 0 -3px 8px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.25), 0 2px 12px rgba(200,255,0,0.2)'
                : 'inset 0 4px 8px rgba(0,0,0,0.3)',
              opacity: canSubmit ? 1 : 0.4,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});
