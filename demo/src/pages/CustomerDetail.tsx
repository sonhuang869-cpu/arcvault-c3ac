import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone, Mail, ChevronLeft, Calendar, AlertTriangle,
  MessageSquare, PhoneCall, Users, TrendingUp, CreditCard,
  Clock, CheckCircle2, FileText,
} from 'lucide-react';
import { fetchCustomer, fetchContactHistory, fetchCustomerInvoices, logContactActivity } from '@/lib/api';
import { formatCurrency, formatDate, dsoColor, daysAgo } from '@/lib/utils';
import type { Customer, ContactActivity, Invoice } from '@/types';

const contactTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  call: { icon: PhoneCall, color: '#06B6D4', label: 'Call' },
  email: { icon: MessageSquare, color: '#3B82F6', label: 'Email' },
  meeting: { icon: Users, color: '#8B5CF6', label: 'Meeting' },
  promise_to_pay: { icon: Calendar, color: '#10B981', label: 'Promise to Pay' },
  dispute_filed: { icon: AlertTriangle, color: '#EF4444', label: 'Dispute Filed' },
  escalation: { icon: TrendingUp, color: '#EF4444', label: 'Escalation' },
  payment_received: { icon: CreditCard, color: '#10B981', label: 'Payment Received' },
  note: { icon: FileText, color: '#94A3B8', label: 'Note' },
};

function AgingBar({ aging }: { aging: Customer['aging'] }) {
  const total = aging.current + aging.days30 + aging.days60 + aging.days90 + aging.days90plus;
  if (total === 0) return null;
  const pct = (v: number) => ((v / total) * 100).toFixed(1) + '%';
  return (
    <div className="flex h-2 w-full rounded-full overflow-hidden gap-0.5">
      {aging.current > 0 && <div style={{ width: pct(aging.current), background: '#06B6D4', height: '100%' }} />}
      {aging.days30 > 0 && <div style={{ width: pct(aging.days30), background: '#3B82F6', height: '100%' }} />}
      {aging.days60 > 0 && <div style={{ width: pct(aging.days60), background: '#F59E0B', height: '100%' }} />}
      {aging.days90 > 0 && <div style={{ width: pct(aging.days90), background: '#EF4444', height: '100%' }} />}
      {aging.days90plus > 0 && <div style={{ width: pct(aging.days90plus), background: '#DC2626', height: '100%' }} />}
    </div>
  );
}

function StatusBadge({ status }: { status: Customer['status'] }) {
  const map: Record<string, string> = {
    current: 'badge-current', watch: 'badge-watch', collections: 'badge-collections', dispute: 'badge-dispute',
  };
  const labels: Record<string, string> = {
    current: 'Current', watch: 'Watch', collections: 'Collections', dispute: 'Dispute',
  };
  return <span className={`badge ${map[status]}`}>{labels[status]}</span>;
}

function InvStatusBadge({ status }: { status: Invoice['status'] }) {
  const map: Record<string, string> = {
    Open: 'badge-open', Partial: 'badge-partial', Paid: 'badge-paid', Disputed: 'badge-dispute', 'Written Off': 'badge-written',
  };
  return <span className={`badge ${map[status] ?? 'badge-open'}`}>{status}</span>;
}

type LogForm = {
  type: ContactActivity['type'];
  notes: string;
  outcome: string;
};

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [contacts, setContacts] = useState<ContactActivity[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [logOpen, setLogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<LogForm>({ type: 'call', notes: '', outcome: '' });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchCustomer(id), fetchContactHistory(id), fetchCustomerInvoices(id)]).then(
      ([c, contacts, invs]) => {
        setCustomer(c ?? null);
        setContacts(contacts);
        setInvoices(invs);
        setLoading(false);
      }
    );
  }, [id]);

  const handleLog = async () => {
    if (!id || !form.notes.trim()) return;
    setSubmitting(true);
    const activity = await logContactActivity({
      customerId: id,
      date: new Date().toISOString().split('T')[0],
      type: form.type,
      user: 'Veronica Jalife',
      notes: form.notes,
      outcome: form.outcome || undefined,
    });
    setContacts((prev) => [activity, ...prev]);
    setForm({ type: 'call', notes: '', outcome: '' });
    setLogOpen(false);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm animate-pulse" style={{ color: '#475569' }}>
        Loading account…
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex h-64 items-center justify-center text-sm" style={{ color: '#475569' }}>
        Account not found.
      </div>
    );
  }

  const totalAR = customer.aging.current + customer.aging.days30 + customer.aging.days60 + customer.aging.days90 + customer.aging.days90plus;
  const overdueAmt = customer.aging.days30 + customer.aging.days60 + customer.aging.days90 + customer.aging.days90plus;
  const util = Math.round((totalAR / customer.creditLimit) * 100);

  const agingRows = [
    { label: 'Current', value: customer.aging.current, color: '#06B6D4' },
    { label: '1–30 Days', value: customer.aging.days30, color: '#3B82F6' },
    { label: '31–60 Days', value: customer.aging.days60, color: '#F59E0B' },
    { label: '61–90 Days', value: customer.aging.days90, color: '#EF4444' },
    { label: '90+ Days', value: customer.aging.days90plus, color: '#DC2626' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: '#475569' }}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="ar-card p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold shrink-0"
            style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.2)' }}
          >
            {customer.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold" style={{ color: '#F1F5F9' }}>{customer.name}</h1>
              <StatusBadge status={customer.status} />
            </div>
            <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
              {customer.industry} · {customer.country}
            </p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm" style={{ color: '#475569' }}>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {customer.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {customer.email}
              </span>
              <span>Acct. Mgr: <span style={{ color: '#94A3B8' }}>{customer.accountManager}</span></span>
              <span>Collector: <span style={{ color: '#94A3B8' }}>{customer.collectorAssigned}</span></span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 shrink-0">
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest" style={{ color: '#475569' }}>Total AR</p>
              <p className="font-mono text-xl font-semibold mt-1" style={{ color: '#F1F5F9' }}>{formatCurrency(totalAR)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest" style={{ color: '#475569' }}>Overdue</p>
              <p className="font-mono text-xl font-semibold mt-1" style={{ color: overdueAmt > 0 ? '#EF4444' : '#10B981' }}>
                {formatCurrency(overdueAmt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest" style={{ color: '#475569' }}>DSO</p>
              <p className="font-mono text-xl font-semibold mt-1" style={{ color: dsoColor(customer.dso) }}>
                {customer.dso}d
              </p>
            </div>
          </div>
        </div>

        {/* Credit utilization */}
        <div className="mt-5 pt-5" style={{ borderTop: '1px solid #1E293B' }}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span style={{ color: '#475569' }}>Credit Utilization</span>
            <span className="font-mono font-semibold" style={{ color: util > 90 ? '#EF4444' : '#94A3B8' }}>
              {formatCurrency(totalAR)} / {formatCurrency(customer.creditLimit)} ({util}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: '#1E293B' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, util)}%`,
                background: util > 90 ? '#EF4444' : util > 70 ? '#F59E0B' : '#06B6D4',
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aging breakdown */}
        <div className="ar-card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#F1F5F9' }}>Aging Breakdown</h2>
          <AgingBar aging={customer.aging} />
          <div className="mt-4 space-y-2">
            {agingRows.map((r) => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: r.color }} />
                  <span style={{ color: '#94A3B8' }}>{r.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono" style={{ color: r.value > 0 ? '#F1F5F9' : '#334155' }}>
                    {formatCurrency(r.value)}
                  </span>
                  {totalAR > 0 && (
                    <span className="font-mono w-10 text-right" style={{ color: '#475569' }}>
                      {((r.value / totalAR) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs pt-2" style={{ borderTop: '1px solid #1E293B' }}>
              <span className="font-semibold" style={{ color: '#94A3B8' }}>Total AR</span>
              <span className="font-mono font-semibold" style={{ color: '#F1F5F9' }}>{formatCurrency(totalAR)}</span>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="ar-card lg:col-span-2">
          <div className="flex items-center justify-between p-4 pb-0">
            <h2 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Invoices</h2>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Invoice</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: '#475569' }}>No invoices found.</td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const daysOut = daysAgo(inv.dueDate);
                    return (
                      <tr key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs" style={{ color: '#06B6D4' }}>{inv.id}</span>
                        </td>
                        <td className="num px-4 py-3">{formatCurrency(inv.amount)}</td>
                        <td className="num px-4 py-3">
                          <span style={{ color: inv.paidAmount > 0 ? '#10B981' : '#475569' }}>
                            {formatCurrency(inv.paidAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span style={{ color: daysOut > 0 ? '#EF4444' : '#94A3B8' }}>
                            {formatDate(inv.dueDate)}
                            {daysOut > 0 && <span className="ml-1">({daysOut}d overdue)</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3"><InvStatusBadge status={inv.status} /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Contact Timeline */}
      <div className="ar-card">
        <div className="flex items-center justify-between p-5 pb-4" style={{ borderBottom: '1px solid #1E293B' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Contact History</h2>
          <button
            onClick={() => setLogOpen((v) => !v)}
            className="btn-primary text-xs"
          >
            + Log Activity
          </button>
        </div>

        {logOpen && (
          <div className="p-5" style={{ borderBottom: '1px solid #1E293B', background: 'rgba(6,182,212,0.03)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>Activity Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ContactActivity['type'] }))}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ background: '#0D1420', border: '1px solid #1E293B', color: '#F1F5F9' }}
                >
                  {Object.entries(contactTypeConfig).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>Notes *</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Describe the contact activity…"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ background: '#0D1420', border: '1px solid #1E293B', color: '#F1F5F9' }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>Outcome</label>
                <input
                  type="text"
                  value={form.outcome}
                  onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value }))}
                  placeholder="Outcome or next action…"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ background: '#0D1420', border: '1px solid #1E293B', color: '#F1F5F9' }}
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleLog}
                  disabled={submitting || !form.notes.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setLogOpen(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="p-5">
          {contacts.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: '#475569' }}>No contact history recorded.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: '#1E293B' }} />
              <div className="space-y-5 ml-10">
                {contacts.map((activity) => {
                  const cfg = contactTypeConfig[activity.type] ?? contactTypeConfig.note;
                  const Icon = cfg.icon;
                  return (
                    <div key={activity.id} className="relative">
                      <div
                        className="absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ background: '#0D1420', border: `2px solid ${cfg.color}` }}
                      >
                        <Icon className="h-3 w-3" style={{ color: cfg.color }} />
                      </div>
                      <div
                        className="rounded-lg p-4"
                        style={{ background: '#0D1420', border: '1px solid #1E293B' }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                            <span className="text-xs" style={{ color: '#475569' }}>by {activity.user}</span>
                          </div>
                          <span className="text-xs font-mono shrink-0" style={{ color: '#475569' }}>
                            {formatDate(activity.date)}
                          </span>
                        </div>
                        <p className="text-sm mt-2" style={{ color: '#94A3B8' }}>{activity.notes}</p>
                        {activity.outcome && (
                          <p className="text-xs mt-2 italic" style={{ color: '#475569' }}>
                            → {activity.outcome}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
