import { NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, RocketIcon } from 'lucide-animated';
import { DOCS_NAV } from '../../docs/constants';

interface DocsSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  onOpenSearch?: () => void;
}

export function DocsSidebar({ mobileOpen, onMobileClose, onOpenSearch }: DocsSidebarProps) {
  const navigate = useNavigate();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={`
          fixed md:sticky md:top-0 md:self-start z-[70] md:z-0
          top-0 left-0 h-full md:h-[calc(100vh-0px)] md:max-h-screen
          w-[min(288px,90vw)] md:w-[260px] shrink-0
          border-r border-border/90 bg-sidebar md:bg-sidebar/95 backdrop-blur-xl
          flex flex-col py-6 md:py-8 px-4 md:px-5
          transition-transform duration-300 ease-out
          md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="mb-6 pb-5 border-b border-sidebar-border">
          <button
            type="button"
            onClick={() => {
              navigate('/');
              onMobileClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-[13px] text-text-dim hover:text-text hover:bg-white/[0.05] transition-colors border border-transparent hover:border-border/60"
          >
            <span className="w-8 h-8 rounded-lg bg-lime/10 flex items-center justify-center shrink-0">
              <RocketIcon size={15} className="text-lime" />
            </span>
            <span className="flex flex-col min-w-0">
              <span className="font-medium text-text text-[13px]">Rocket</span>
              <span className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
                <HomeIcon size={12} className="opacity-70" />
                Back to app
              </span>
            </span>
          </button>
        </div>

        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-text-muted px-3 mb-4 md:hidden">Reference</p>
        <div className="hidden md:flex items-center justify-between gap-3 px-3 mb-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-text-muted">Reference</p>
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="text-[10px] font-mono text-lime/90 hover:text-lime px-3 py-2 rounded-lg hover:bg-lime/10 transition-colors"
            >
              Search
            </button>
          )}
        </div>
        <nav className="flex flex-col gap-1.5 flex-1">
          {DOCS_NAV.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `px-4 py-3.5 md:px-5 md:py-4 rounded-xl text-[13px] transition-all border border-transparent ${
                  isActive
                    ? 'bg-lime/[0.08] text-lime border-lime/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'text-text-dim hover:text-text hover:bg-white/[0.04]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="text-[10px] font-mono text-text-muted/70 px-3 pt-6 pb-1 mt-auto border-t border-sidebar-border">
          ⌘K search
        </p>
      </aside>
    </>
  );
}
