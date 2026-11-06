import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  X,
  Settings,
  Bell,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'AR Aging', exact: true },
  { to: '/collections', icon: Users, label: 'Collections', exact: false },
  { to: '/invoices', icon: FileText, label: 'Invoices', exact: false },
  { to: '/payments', icon: CreditCard, label: 'Payment Application', exact: false },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col transition-transform duration-200 ease-in-out',
          'md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: '#0D1420', borderRight: '1px solid #1E293B' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #1E293B' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
              style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}
            >
              <TrendingUp className="h-4 w-4" style={{ color: '#06B6D4' }} />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight" style={{ color: '#F1F5F9' }}>ARCVault</span>
              <span className="block text-[10px] font-medium leading-none mt-0.5" style={{ color: '#475569' }}>
                Accounts Receivable
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden rounded-md p-1"
            style={{ color: '#475569' }}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Period indicator */}
        <div className="mx-3 mt-3 mb-1 rounded-lg px-3 py-2" style={{ background: 'rgba(30,41,59,0.5)' }}>
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
            Reporting Period
          </span>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#94A3B8' }}>Nov 6, 2026</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#334155' }}>
            Workspace
          </p>
          {navItems.map(({ to, icon: Icon, label, exact }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={cn('sidebar-link', isActive && 'active')}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User area */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid #1E293B' }}>
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 cursor-pointer hover:bg-bg-elevated transition-colors">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0"
              style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.3)' }}
            >
              VJ
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold" style={{ color: '#CBD5E1' }}>Veronica Jalife</p>
              <p className="truncate text-[10px]" style={{ color: '#475569' }}>Revenue Assurance Dir.</p>
            </div>
            <Bell className="h-3.5 w-3.5 ml-auto shrink-0" style={{ color: '#475569' }} />
          </div>
          <NavLink
            to="/settings"
            className="sidebar-link mt-1"
            onClick={onClose}
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
