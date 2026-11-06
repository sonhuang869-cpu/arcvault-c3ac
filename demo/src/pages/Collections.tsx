import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, AlertTriangle, CheckCircle2, XCircle,
  Clock, Circle, ChevronRight, Calendar, DollarSign,
} from 'lucide-react';
import {
  fetchCollectionsQueue,
  fetchPromises,
  fetchDisputes,
  updatePromiseStatus,
  updateDisputeStatus,
} from '@/lib/api';
import { formatCurrency, formatDate, daysAgo, daysUntil } from '@/lib/utils';
import type { PromiseToPay, Dispute } from '@/types';

type QueueItem = {
  id: string;
  name: string;
  country: string;
  industry: string;
  status: string;
  riskLevel: string;
  collectorAssigned: string;
  lastContactDate?: string;
  aging: {
    current: number; days30: number; days60: number; days90: number; days90plus: number;
  };
  overdueTotal: number;
  priorityScore: number;
};

type Tab = 'queue' | 'promises' | 'disputes';

function PriorityDot({ score }: { score: number }) {
  const color = score > 100_000 ? '#EF4444' : score > 40_000 ? '#F59E0B' : '#06B6D4';
  return <span className="h-2 w-2 rounded-full shrink-0 inline-block" style={{ background: color }} />;
}

function PromiseStatusBadge({ status }: { status: PromiseToPay['status'] }) {
  const map: Record<string, string> = {
    Kept: 'badge-kept',
    Broken: 'badge-broken',
    Pending: 'badge-pending',
    Partial: 'badge-partial-p',
  };
  return <span className={`badge ${map[status] ?? 'badge-pending'}`}>{status}</span>;
}

function DisputeStatusBadge({ status }: { status: Dispute['status'] }) {
  const map: Record<string, string> = {
    Open: 'badge-open',
    'Under Review': 'badge-watch',
    Resolved: 'badge-paid',
    Withdrawn: 'badge-written',
  };
  return <span className={`badge ${map[status] ?? 'badge-open'}`}>{status}</span>;
}

export function Collections() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('queue');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [promises, setPromises] = useState<PromiseToPay[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCollectionsQueue(), fetchPromises(), fetchDisputes()]).then(
      ([q, p, d]) => {
        setQueue(q as QueueItem[]);
        setPromises(p);
        setDisputes(d);
        setLoading(false);
      }
    );
  }, []);

  const handlePromiseStatus = async (id: string, status: PromiseToPay['status']) => {
    await updatePromiseStatus(id, status);
    setPromises((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const handleDisputeStatus = async (id: string, status: Dispute['status']) => {
    await updateDisputeStatus(id, status);
    setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  const filteredQueue = filterStatus === 'all'
    ? queue
    : queue.filter((q) => q.status === filterStatus);

  const promiseSummary = {
    kept: promises.filter((p) => p.status === 'Kept').length,
    broken: promises.filter((p) => p.status === 'Broken').length,
    pending: promises.filter((p) => p.status === 'Pending').length,
    pendingAmt: promises.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.promisedAmount, 0),
  };

  const tabStyle = (t: Tab) =>
    t === tab
      ? 'border-b-2 pb-3 text-sm font-semibold transition-colors'
      : 'border-b-2 border-transparent pb-3 text-sm font-medium transition-colors';

  const tabColor = (t: Tab) =>
    t === tab ? { color: '#06B6D4', borderBottomColor: '#06B6D4' } : { color: '#475569' };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* KPI bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="kpi-tile">
          <span className="kpi-label">Queue Size</span>
          <span className="kpi-value">{queue.length}</span>
          <span className="text-xs" style={{ color: '#475569' }}>accounts needing outreach</span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Pending P2P</span>
          <span className="kpi-value" style={{ color: '#06B6D4' }}>
            {formatCurrency(promiseSummary.pendingAmt, true)}
          </span>
          <span className="text-xs" style={{ color: '#475569' }}>{promiseSummary.pending} promises outstanding</span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Promise Rate</span>
          <span className="kpi-value" style={{ color: '#10B981' }}>
            {promises.length > 0
              ? Math.round((promiseSummary.kept / (promiseSummary.kept + promiseSummary.broken)) * 100)
              : 0}%
          </span>
          <span className="text-xs" style={{ color: '#475569' }}>
            {promiseSummary.kept} kept / {promiseSummary.broken} broken
          </span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Open Disputes</span>
          <span className="kpi-value" style={{ color: '#EF4444' }}>
            {disputes.filter((d) => d.status !== 'Resolved' && d.status !== 'Withdrawn').length}
          </span>
          <span className="text-xs" style={{ color: '#475569' }}>
            {formatCurrency(disputes.filter(d => d.status !== 'Resolved').reduce((s, d) => s + d.amount, 0), true)} at risk
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="ar-card">
        <div className="flex gap-6 px-5 pt-4" style={{ borderBottom: '1px solid #1E293B' }}>
          <button className={tabStyle('queue')} style={tabColor('queue')} onClick={() => setTab('queue')}>
            <span className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Collections Queue
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4' }}>
                {queue.length}
              </span>
            </span>
          </button>
          <button className={tabStyle('promises')} style={tabColor('promises')} onClick={() => setTab('promises')}>
            <span className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Promises to Pay
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                {promises.length}
              </span>
            </span>
          </button>
          <button className={tabStyle('disputes')} style={tabColor('disputes')} onClick={() => setTab('disputes')}>
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              Disputes
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                {disputes.length}
              </span>
            </span>
          </button>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm animate-pulse" style={{ color: '#475569' }}>
            Loading…
          </div>
        ) : (
          <>
            {/* ── QUEUE TAB ── */}
            {tab === 'queue' && (
              <div>
                <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid #1E293B' }}>
                  <span className="text-xs" style={{ color: '#475569' }}>Filter by:</span>
                  {['all', 'watch', 'collections', 'dispute'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className="rounded-md px-3 py-1 text-xs font-medium transition-colors capitalize"
                      style={
                        filterStatus === s
                          ? { background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }
                          : { color: '#475569' }
                      }
                    >
                      {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                      {s !== 'all' && (
                        <span className="ml-1.5 font-mono">{queue.filter((q) => q.status === s).length}</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Priority</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Account</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Overdue Total</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>90+ Days</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>61–90 Days</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Collector</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Last Contact</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQueue.map((item) => {
                        const daysLast = item.lastContactDate ? daysAgo(item.lastContactDate) : 999;
                        return (
                          <tr
                            key={item.id}
                            onClick={() => navigate(`/customers/${item.id}`)}
                          >
                            <td className="px-4 py-3">
                              <PriorityDot score={item.priorityScore} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-sm" style={{ color: '#F1F5F9' }}>{item.name}</span>
                              </div>
                              <span className="text-[11px]" style={{ color: '#475569' }}>{item.country} · {item.industry}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge badge-${item.status}`}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </span>
                            </td>
                            <td className="num px-4 py-3">
                              <span className="num-negative">{formatCurrency(item.overdueTotal)}</span>
                            </td>
                            <td className="num px-4 py-3">
                              <span className={item.aging.days90plus > 0 ? 'num-negative' : 'num-muted'}>
                                {item.aging.days90plus > 0 ? formatCurrency(item.aging.days90plus) : '—'}
                              </span>
                            </td>
                            <td className="num px-4 py-3">
                              <span className={item.aging.days90 > 0 ? 'num-warn' : 'num-muted'}>
                                {item.aging.days90 > 0 ? formatCurrency(item.aging.days90) : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#94A3B8' }}>{item.collectorAssigned}</td>
                            <td className="px-4 py-3">
                              <span
                                className="text-xs"
                                style={{ color: daysLast > 14 ? '#EF4444' : daysLast > 7 ? '#F59E0B' : '#94A3B8' }}
                              >
                                {item.lastContactDate ? `${daysLast}d ago` : 'Never'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <ChevronRight className="h-4 w-4" style={{ color: '#334155' }} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── PROMISES TAB ── */}
            {tab === 'promises' && (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Account</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Promise Date</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Collector</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Notes</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promises.map((p) => {
                      const isUpcoming = p.status === 'Pending' && daysUntil(p.promisedDate) >= 0;
                      const isOverdue = p.status === 'Pending' && daysUntil(p.promisedDate) < 0;
                      return (
                        <tr key={p.id}>
                          <td className="px-4 py-3">
                            <button
                              className="text-sm font-medium text-left hover:underline"
                              style={{ color: '#06B6D4' }}
                              onClick={() => navigate(`/customers/${p.customerId}`)}
                            >
                              {p.customerName}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5" style={{ color: '#475569' }} />
                              <span className="text-sm font-mono" style={{ color: '#F1F5F9' }}>
                                {formatDate(p.promisedDate)}
                              </span>
                              {isUpcoming && (
                                <span className="text-[11px]" style={{ color: '#10B981' }}>
                                  in {daysUntil(p.promisedDate)}d
                                </span>
                              )}
                              {isOverdue && (
                                <span className="text-[11px]" style={{ color: '#EF4444' }}>
                                  {Math.abs(daysUntil(p.promisedDate))}d overdue
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="num px-4 py-3">
                            <span className="num-primary">{formatCurrency(p.promisedAmount)}</span>
                            {p.actualPaidAmount !== undefined && p.actualPaidAmount > 0 && (
                              <span className="block text-[11px]" style={{ color: '#10B981' }}>
                                Paid: {formatCurrency(p.actualPaidAmount)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3"><PromiseStatusBadge status={p.status} /></td>
                          <td className="px-4 py-3 text-xs" style={{ color: '#94A3B8' }}>{p.collectorName}</td>
                          <td className="px-4 py-3 text-xs max-w-xs truncate" style={{ color: '#475569' }} title={p.notes}>
                            {p.notes}
                          </td>
                          <td className="px-4 py-3">
                            {p.status === 'Pending' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handlePromiseStatus(p.id, 'Kept')}
                                  className="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
                                  Kept
                                </button>
                                <button
                                  onClick={() => handlePromiseStatus(p.id, 'Broken')}
                                  className="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                                >
                                  <XCircle className="h-3.5 w-3.5 inline mr-1" />
                                  Broken
                                </button>
                              </div>
                            )}
                            {p.status !== 'Pending' && (
                              <span className="text-xs" style={{ color: '#334155' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── DISPUTES TAB ── */}
            {tab === 'disputes' && (
              <div className="p-5 space-y-4">
                {disputes.map((d) => {
                  const daysLeft = daysUntil(d.resolutionTargetDate);
                  return (
                    <div
                      key={d.id}
                      className="rounded-xl p-5 space-y-3"
                      style={{ background: '#0D1420', border: '1px solid #1E293B' }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <button
                              className="font-semibold text-sm hover:underline"
                              style={{ color: '#06B6D4' }}
                              onClick={() => navigate(`/customers/${d.customerId}`)}
                            >
                              {d.customerName}
                            </button>
                            <DisputeStatusBadge status={d.status} />
                            <span className="text-xs font-mono" style={{ color: '#475569' }}>
                              {d.invoiceId}
                            </span>
                          </div>
                          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{d.reason}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono text-lg font-semibold" style={{ color: '#EF4444' }}>
                            {formatCurrency(d.amount)}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Disputed amount</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: '#475569' }}>
                        <span>Owner: <span style={{ color: '#94A3B8' }}>{d.owner}</span></span>
                        <span>Opened: <span style={{ color: '#94A3B8' }}>{formatDate(d.createdAt)}</span></span>
                        <span>
                          Resolution target:{' '}
                          <span style={{ color: daysLeft < 7 ? '#EF4444' : '#94A3B8' }}>
                            {formatDate(d.resolutionTargetDate)}
                            {daysLeft >= 0 ? ` (${daysLeft}d remaining)` : ` (${Math.abs(daysLeft)}d overdue)`}
                          </span>
                        </span>
                      </div>

                      <p className="text-xs" style={{ color: '#475569' }}>{d.notes}</p>

                      <div className="flex items-center gap-2">
                        {d.status !== 'Resolved' && d.status !== 'Withdrawn' && (
                          <>
                            <button
                              onClick={() => handleDisputeStatus(d.id, 'Under Review')}
                              disabled={d.status === 'Under Review'}
                              className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
                              style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}
                            >
                              Under Review
                            </button>
                            <button
                              onClick={() => handleDisputeStatus(d.id, 'Resolved')}
                              className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                              style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
                              Mark Resolved
                            </button>
                            <button
                              onClick={() => handleDisputeStatus(d.id, 'Withdrawn')}
                              className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                              style={{ background: 'rgba(100,116,139,0.1)', color: '#64748B' }}
                            >
                              Withdraw
                            </button>
                          </>
                        )}
                        <button
                          className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors ml-auto"
                          style={{ color: '#06B6D4' }}
                          onClick={() => navigate(`/invoices/${d.invoiceId}`)}
                        >
                          <FileText className="h-3.5 w-3.5 inline mr-1" />
                          View Invoice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
