import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import type { Components } from 'react-markdown';

const components: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0 text-text/90">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
  em: ({ children }) => <em className="italic text-text/95">{children}</em>,
  del: ({ children }) => <del className="text-text-muted line-through">{children}</del>,
  ul: ({ children }) => (
    <ul className="list-disc pl-5 mb-3 space-y-1 marker:text-lime/50">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 mb-3 space-y-1 marker:text-text-muted">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed [&>p]:mb-0">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-lime/35 pl-3 my-2 text-text-muted/95 italic [&>p]:mb-2 [&>p:last-child]:mb-0">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-sky/90 hover:text-sky underline underline-offset-2 decoration-sky/40"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  h1: ({ children }) => (
    <h2 className="text-[15px] font-semibold text-text mt-4 mb-2 first:mt-0">{children}</h2>
  ),
  h2: ({ children }) => (
    <h3 className="text-[14px] font-semibold text-text mt-3 mb-1.5 first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="text-[13px] font-semibold text-text mt-2 mb-1 first:mt-0">{children}</h4>
  ),
  hr: () => <hr className="my-3 border-border-subtle" />,
  code: ({ className, children, ...props }) => {
    const isFenced = Boolean(className?.startsWith('language-'));
    if (isFenced) {
      return (
        <code className={`${className} text-[12px]`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="text-lime/90 bg-white/[0.06] px-1 py-0.5 rounded text-[12px] font-mono not-italic"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="rounded-lg bg-black/45 p-3 my-2 overflow-x-auto text-[12px] font-mono border border-border/50 leading-relaxed">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2 rounded-lg border border-border/40">
      <table className="min-w-full text-[12px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-white/[0.04]">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-border/50 px-2 py-1.5 text-left font-medium text-text">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/30 px-2 py-1.5 text-text-dim align-top">{children}</td>
  ),
  img: ({ src, alt }) => (
    <img
      src={src ?? ''}
      alt={alt ?? ''}
      className="max-w-full rounded-lg my-2 border border-border/30"
      loading="lazy"
    />
  ),
};

interface AgentResultMarkdownProps {
  content: string;
}

export function AgentResultMarkdown({ content }: AgentResultMarkdownProps) {
  return (
    <div className="text-[13px] leading-[1.7] break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
