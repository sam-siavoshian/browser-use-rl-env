import { useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { MenuIcon, SearchIcon } from 'lucide-animated';
import { VALID_DOC_SLUGS } from '../../docs/constants';
import { DocsSidebar } from './DocsSidebar';
import { DocsCommandPalette } from '../../components/docs/DocsCommandPalette';
import { OverviewPage } from './pages/OverviewPage';
import { IntegrationPage } from './pages/IntegrationPage';
import { EndpointsPage } from './pages/EndpointsPage';
import { ModelsPage } from './pages/ModelsPage';
import { EnvironmentPage } from './pages/EnvironmentPage';

function docSlugFromPath(pathname: string): string | null {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/docs') return null;
  if (!p.startsWith('/docs/')) return 'overview';
  const slug = p.slice('/docs/'.length);
  if (!slug || slug.includes('/')) return 'invalid';
  return slug;
}

export function DocsLayout() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const slug = useMemo(() => docSlugFromPath(location.pathname), [location.pathname]);

  if (slug === null) {
    return <Navigate to="/docs/overview" replace />;
  }

  if (slug === 'invalid' || !VALID_DOC_SLUGS.has(slug)) {
    return <Navigate to="/docs/overview" replace />;
  }

  const page = (
    <div key={slug} className="anim-fade-up">
      {slug === 'overview' && <OverviewPage />}
      {slug === 'integration' && <IntegrationPage />}
      {slug === 'endpoints' && <EndpointsPage />}
      {slug === 'models' && <ModelsPage />}
      {slug === 'environment' && <EnvironmentPage />}
    </div>
  );

  return (
    <div className="flex flex-1 min-h-0 w-full min-w-0 relative z-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 100% 0%, rgba(200,255,0,0.25) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 0% 100%, rgba(56,189,248,0.12) 0%, transparent 45%)`,
        }}
        aria-hidden
      />
      <DocsSidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        <header className="md:hidden flex items-center justify-between gap-3 px-4 h-12 border-b border-border/60 bg-surface/40 backdrop-blur-sm shrink-0">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-text-dim hover:text-text hover:bg-white/[0.06] transition-colors"
            aria-label="Open documentation menu"
          >
            <MenuIcon size={18} />
          </button>
          <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-text-muted">API docs</span>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-text-dim hover:text-text hover:bg-white/[0.06] transition-colors"
            aria-label="Search documentation"
          >
            <SearchIcon size={18} />
          </button>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="max-w-3xl mx-auto px-5 md:px-10 pt-8 md:pt-12 pb-24 md:pb-28">{page}</div>
        </main>
      </div>

      <DocsCommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
