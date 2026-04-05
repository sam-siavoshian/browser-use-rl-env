export function MethodBadge({ method }: { method: 'GET' | 'POST' | 'DELETE' }) {
  const cls =
    method === 'GET'
      ? 'bg-sky/10 text-sky border-sky/20'
      : method === 'DELETE'
        ? 'bg-red-400/10 text-red-400 border-red-400/20'
        : 'bg-lime/10 text-lime border-lime/20';
  return (
    <span className={`inline-flex font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md border ${cls}`}>
      {method}
    </span>
  );
}

export function EndpointRow({
  method,
  path,
  res,
  note,
}: {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  res: string;
  note: string;
}) {
  return (
    <div
      className="rounded-xl border border-border/80 bg-elevated/30 overflow-hidden"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
    >
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border/60 bg-black/20">
        <MethodBadge method={method} />
        <code className="font-mono text-[12px] md:text-[13px] text-text tracking-tight">{path}</code>
      </div>
      <div className="px-4 py-3 space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-text-muted">Response</p>
        <p className="font-mono text-[11px] md:text-[12px] text-sky/85 break-words leading-relaxed">{res}</p>
        <p className="text-[13px] text-text-dim leading-relaxed pt-1">{note}</p>
      </div>
    </div>
  );
}
