import { useState, useRef, useCallback } from 'react';

interface ChatInputProps {
  onSubmit: (task: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSubmit, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  return (
    <div className="w-full max-w-[720px]">
      <div className="saas-inset relative flex items-end gap-3 rounded-2xl p-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); handleInput(); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Describe a browser task...'}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-[14px] text-text placeholder-text-muted
                     focus:outline-none disabled:opacity-30 leading-relaxed py-1.5 px-1
                     min-h-[36px] max-h-[120px]"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="saas-btn-primary flex items-center gap-2 px-5 py-2 rounded-xl text-[13px]
                     font-medium whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
          Run task
        </button>
      </div>
    </div>
  );
}
