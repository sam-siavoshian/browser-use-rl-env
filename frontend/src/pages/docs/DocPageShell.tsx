import type { ReactNode } from 'react';

const stagger = (ms: number) => ({ animationDelay: `${ms}ms` } as const);

export function DocPageShell({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -top-6 -right-8 w-[min(55vw,420px)] h-[min(55vw,420px)] rounded-full opacity-[0.12]"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(200,255,0,0.35) 0%, transparent 55%)',
        }}
      />
      <div
        className="pointer-events-none absolute top-24 left-0 w-px h-32 bg-gradient-to-b from-lime/40 via-lime/10 to-transparent -translate-x-4 hidden md:block"
        aria-hidden
      />
      <header className="mb-10 md:mb-12 anim-fade-up relative">
        {kicker && (
          <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-text-muted mb-3">{kicker}</p>
        )}
        <h1 className="text-[clamp(1.5rem,3.5vw,2rem)] font-serif italic text-text leading-tight">{title}</h1>
      </header>
      <div className="relative space-y-0">{children}</div>
    </div>
  );
}

export function DocSection({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <section className="mb-12 md:mb-16 last:mb-0 anim-fade-up" style={stagger(delay)}>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.22em] text-lime mb-4">{title}</h2>
      {children}
    </section>
  );
}
