import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, RefreshCw } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { resetDemoData } from '@/lib/api';

const pageTitles: Record<string, string> = {
  '/': 'AR Aging Dashboard',
  '/collections': 'Collections',
  '/invoices': 'Invoices',
  '/payments': 'Payment Application',
  '/customers': 'Account Detail',
  '/settings': 'Settings',
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const location = useLocation();

  const title =
    Object.entries(pageTitles).find(([path]) =>
      path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
    )?.[1] ?? 'ARCVault';

  const handleReset = () => {
    setResetting(true);
    resetDemoData();
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0F1A' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex h-12 items-center justify-between px-4 shrink-0"
          style={{ background: '#0D1420', borderBottom: '1px solid #1E293B' }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden rounded-md p-1.5 transition-colors"
              style={{ color: '#475569' }}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{title}</h1>
              <p className="hidden sm:block text-[11px]" style={{ color: '#475569' }}>
                Despegar Group · Revenue Assurance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="hidden md:inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Live
            </span>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{ color: '#475569', background: 'transparent' }}
              title="Reset demo data to initial state"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
