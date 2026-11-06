import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Send, CheckCircle2, FileX } from 'lucide-react';
import { fetchInvoices, markInvoicePaid, writeOffInvoice, sendReminder } from '@/lib/api';
import { formatCurrency, formatDate, daysAgo } from '@/lib/utils';
import type { Invoice } from '@/types';

type SortKey = 'id' | 'customerName' | 'amount' | 'balance' | 'dueDate' | 'status';
type SortDir = 'asc' | 'desc';

const STATUS_OPTIONS = ['All', 'Open', 'Partial', 'Paid', 'Disputed', 'Written Off'];

function InvStatusBadge({ status }: { status: Invoice['status'] }) {
  const map: Record<string, string> = {
    Open: 'badge-open',
    Partial: 'badge-partial',
    Paid: 'badge-paid',
    Disputed: 'badge-dispute',
    'Written Off': 'badge-written',
  };
  return <span className={`badge ${map[status] ?? 'badge-open'}`}>{status}</span>;
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium animate-slide-in"
      style={{ background: '#111827', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}
    >
      <CheckCircle2 className="h-4 w-4" />
      {message}
    </div>
  );
}

const PAGE_SIZE = 15;

export function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchInvoices().then((data) => {
      setInvoices(data);
      setLoading(false);
    });
  }, []);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      else { setSortKey(key); setSortDir('desc'); }
    },
    [sortKey]
  );

  const filtered = invoices
    .filter((inv) => {
      if (statusFilter !== 'All' && inv.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          inv.id.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      if (sortKey === 'id') { aVal = a.id; bVal = b.id; }
      else if (sortKey === 'customerName') { aVal = a.customerName; bVal = b.customerName; }
      else if (sortKey === 'amount') { aVal = a.amount; bVal = b.amount; }
      else if (sortKey === 'balance') { aVal = a.amount - a.paidAmount; bVal = b.amount - b.paidAmount; }
      else if (sortKey === 'dueDate') { aVal = a.dueDate; bVal = b.dueDate; }
      else if (sortKey === 'status') { aVal = a.status; bVal = b.status; }
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const total = filtered.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((i) => i.id)));
  };

  const handleBulkReminder = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    await Promise.all([...selected].map((id) => sendReminder(id)));
    setBulkLoading(false);
    setSelected(new Set());
    setToast(`Reminder sent to ${selected.size} customer${selected.size > 1 ? 's' : ''}.`);
  };

  const handleBulkPaid = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    await Promise.all([...selected].map((id) => markInvoicePaid(id)));
    const updated = await fetchInvoices();
    setInvoices(updated);
    setBulkLoading(false);
    setSelected(new Set());
    setToast(`${selected.size} invoice${selected.size > 1 ? 's' : ''} marked as Paid.`);
  };

  const handleWriteOff = async (id: string) => {
    await writeOffInvoice(id);
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status: 'Written Off' } : inv));
    setToast('Invoice written off.');
  };

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronDown className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  }

  function Th({ k, label, right }: { k: SortKey; label: string; right?: boolean }) {
    return (
      <th
        className={`px-4 py-3 text-xs font-semibold uppercase tracking-widest cursor-pointer select-none ${right ? 'text-right' : 'text-left'}`}
        style={{ color: sortKey === k ? '#06B6D4' : '#475569' }}
        onClick={() => handleSort(k)}
      >
        <span className={`inline-flex items-center gap-1 ${right ? 'flex-row-reverse' : ''}`}>
          {label}
          <SortIcon k={k} />
        </span>
      </th>
    );
  }

  const summaryOpen = invoices.filter((i) => i.status === 'Open').reduce((s, i) => s + i.amount - i.paidAmount, 0);
  const summaryPartial = invoices.filter((i) => i.status === 'Partial').reduce((s, i) => s + i.amount - i.paidAmount, 0);
  const summaryDisputed = invoices.filter((i) => i.status === 'Disputed').reduce((s, i) => s + i.amount - i.paidAmount, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="kpi-tile">
          <span className="kpi-label">Total Invoices</span>
          <span className="kpi-value">{invoices.length}</span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Open Balance</span>
          <span className="kpi-value num-negative">{formatCurrency(summaryOpen + summaryPartial, true)}</span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Disputed</span>
          <span className="kpi-value" style={{ color: '#EF4444' }}>{formatCurrency(summaryDisputed, true)}</span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Paid This Period</span>
          <span className="kpi-value" style={{ color: '#10B981' }}>
            {formatCurrency(invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0), true)}
          </span>
        </div>
      </div>

      {/* Table card */}
      <div className="ar-card">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4" style={{ borderBottom: '1px solid #1E293B' }}>
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#475569' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search invoice or customer…"
              className="w-full rounded-lg pl-9 pr-3 py-2 text-sm"
              style={{ background: '#0D1420', border: '1px solid #1E293B', color: '#F1F5F9' }}
            />
          </div>
          <div className="flex gap-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                style={
                  statusFilter === s
                    ? { background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }
                    : { color: '#475569' }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-2.5"
            style={{ background: 'rgba(6,182,212,0.05)', borderBottom: '1px solid #1E293B' }}
          >
            <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>
              {selected.size} selected
            </span>
            <button
              onClick={handleBulkReminder}
              disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
              style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4' }}
            >
              <Send className="h-3.5 w-3.5" />
              Send Reminder
            </button>
            <button
              onClick={handleBulkPaid}
              disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Apply Payment
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm animate-pulse" style={{ color: '#475569' }}>
            Loading invoices…
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selected.size === paged.length && paged.length > 0}
                        onChange={toggleAll}
                        className="rounded"
                        style={{ accentColor: '#06B6D4' }}
                      />
                    </th>
                    <Th k="id" label="Invoice #" />
                    <Th k="customerName" label="Customer" />
                    <Th k="amount" label="Amount" right />
                    <Th k="balance" label="Balance Due" right />
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
                      Issue Date
                    </th>
                    <Th k="dueDate" label="Due Date" />
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
                      Days Out
                    </th>
                    <Th k="status" label="Status" />
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-10 text-center text-sm" style={{ color: '#475569' }}>
                        No invoices match your filters.
                      </td>
                    </tr>
                  ) : (
                    paged.map((inv) => {
                      const balance = inv.amount - inv.paidAmount;
                      const daysOut = daysAgo(inv.dueDate);
                      return (
                        <tr
                          key={inv.id}
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                        >
                          <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); toggleSelect(inv.id); }}>
                            <input
                              type="checkbox"
                              checked={selected.has(inv.id)}
                              onChange={() => toggleSelect(inv.id)}
                              style={{ accentColor: '#06B6D4' }}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs" style={{ color: '#06B6D4' }}>{inv.id}</span>
                          </td>
                          <td className="name px-4 py-3">
                            <span style={{ color: '#F1F5F9' }}>{inv.customerName}</span>
                          </td>
                          <td className="num px-4 py-3">{formatCurrency(inv.amount)}</td>
                          <td className="num px-4 py-3">
                            <span className={balance > 0 ? (daysOut > 30 ? 'num-negative' : 'num-warn') : 'num-muted'}>
                              {formatCurrency(balance)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: '#94A3B8' }}>
                            {formatDate(inv.issueDate)}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span style={{ color: daysOut > 0 ? '#EF4444' : '#94A3B8' }}>
                              {formatDate(inv.dueDate)}
                            </span>
                          </td>
                          <td className="num px-4 py-3">
                            <span
                              className="font-mono text-xs"
                              style={{ color: daysOut > 90 ? '#DC2626' : daysOut > 60 ? '#EF4444' : daysOut > 30 ? '#F59E0B' : daysOut > 0 ? '#94A3B8' : '#10B981' }}
                            >
                              {daysOut > 0 ? `+${daysOut}d` : daysOut < 0 ? `${daysOut}d` : '0d'}
                            </span>
                          </td>
                          <td className="px-4 py-3"><InvStatusBadge status={inv.status} /></td>
                          <td className="px-4 py-3">
                            {(inv.status === 'Open' || inv.status === 'Partial') && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleWriteOff(inv.id); }}
                                className="rounded p-1 hover:opacity-80"
                                title="Write off"
                                style={{ color: '#475569' }}
                              >
                                <FileX className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #1E293B' }}>
                <span className="text-xs" style={{ color: '#475569' }}>
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-30"
                    style={{ color: '#475569' }}
                  >
                    Previous
                  </button>
                  <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>
                    {page} / {pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="rounded px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-30"
                    style={{ color: '#475569' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
