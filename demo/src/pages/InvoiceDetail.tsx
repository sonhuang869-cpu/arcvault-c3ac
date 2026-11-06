import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, CheckCircle2, Send, Printer } from 'lucide-react';
import { fetchInvoice, markInvoicePaid, sendReminder } from '@/lib/api';
import { formatCurrency, formatDate, daysAgo } from '@/lib/utils';
import type { Invoice } from '@/types';

function InvStatusBadge({ status }: { status: Invoice['status'] }) {
  const map: Record<string, string> = {
    Open: 'badge-open', Partial: 'badge-partial', Paid: 'badge-paid',
    Disputed: 'badge-dispute', 'Written Off': 'badge-written',
  };
  return <span className={`badge ${map[status] ?? 'badge-open'}`}>{status}</span>;
}

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchInvoice(id).then((inv) => {
      setInvoice(inv ?? null);
      setLoading(false);
    });
  }, [id]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleMarkPaid = async () => {
    if (!invoice) return;
    await markInvoicePaid(invoice.id);
    setInvoice((prev) => prev ? { ...prev, paidAmount: prev.amount, status: 'Paid' } : null);
    showToast('Invoice marked as paid.');
  };

  const handleSendReminder = async () => {
    if (!invoice) return;
    await sendReminder(invoice.id);
    showToast('Reminder sent to customer.');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm animate-pulse" style={{ color: '#475569' }}>
        Loading invoice…
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm" style={{ color: '#475569' }}>Invoice not found.</p>
        <button onClick={() => navigate('/invoices')} className="btn-ghost text-sm">← Back to Invoices</button>
      </div>
    );
  }

  const balance = invoice.amount - invoice.paidAmount;
  const daysOut = daysAgo(invoice.dueDate);
  const lineTotal = invoice.lineItems.reduce((s, l) => s + l.total, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1000px]">
      {toastMsg && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium animate-slide-in"
          style={{ background: '#111827', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}
        >
          <CheckCircle2 className="h-4 w-4" />
          {toastMsg}
        </div>
      )}

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
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2" style={{ background: 'rgba(6,182,212,0.1)' }}>
                <FileText className="h-5 w-5" style={{ color: '#06B6D4' }} />
              </div>
              <div>
                <h1 className="text-lg font-bold font-mono" style={{ color: '#F1F5F9' }}>{invoice.id}</h1>
                <p className="text-sm" style={{ color: '#94A3B8' }}>{invoice.customerName}</p>
              </div>
              <InvStatusBadge status={invoice.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#475569' }}>Issue Date</p>
                <p style={{ color: '#F1F5F9' }}>{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#475569' }}>Due Date</p>
                <p style={{ color: daysOut > 0 ? '#EF4444' : '#F1F5F9' }}>
                  {formatDate(invoice.dueDate)}
                  {daysOut > 0 && <span className="ml-1 text-xs">({daysOut}d overdue)</span>}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#475569' }}>Invoice Total</p>
                <p className="font-mono font-semibold" style={{ color: '#F1F5F9' }}>{formatCurrency(invoice.amount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#475569' }}>Balance Due</p>
                <p className="font-mono font-semibold" style={{ color: balance > 0 ? '#EF4444' : '#10B981' }}>
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {invoice.status !== 'Paid' && invoice.status !== 'Written Off' && (
              <>
                <button onClick={handleMarkPaid} className="btn-primary text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Paid
                </button>
                <button onClick={handleSendReminder} className="btn-ghost text-xs">
                  <Send className="h-3.5 w-3.5" />
                  Send Reminder
                </button>
              </>
            )}
            <button
              onClick={() => navigate(`/customers/${invoice.customerId}`)}
              className="btn-ghost text-xs"
            >
              View Account
            </button>
          </div>
        </div>

        {invoice.notes && (
          <div
            className="mt-4 rounded-lg px-4 py-3 text-sm"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}
          >
            {invoice.notes}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line items */}
        <div className="ar-card lg:col-span-2">
          <h2 className="text-sm font-semibold px-5 py-4" style={{ color: '#F1F5F9', borderBottom: '1px solid #1E293B' }}>
            Line Items
          </h2>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Description</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Qty</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Unit Price</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, i) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: '#475569' }}>{i + 1}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: '#F1F5F9' }}>{item.description}</td>
                    <td className="num px-5 py-3 text-xs">{item.quantity}</td>
                    <td className="num px-5 py-3 text-xs">{formatCurrency(item.unitPrice)}</td>
                    <td className="num px-5 py-3">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid #1E293B' }}>
                  <td colSpan={4} className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
                    Subtotal
                  </td>
                  <td className="num px-5 py-3 font-semibold" style={{ color: '#F1F5F9' }}>{formatCurrency(lineTotal)}</td>
                </tr>
                {invoice.paidAmount > 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-2 text-right text-xs" style={{ color: '#475569' }}>
                      Paid
                    </td>
                    <td className="num px-5 py-2 text-xs" style={{ color: '#10B981' }}>
                      −{formatCurrency(invoice.paidAmount)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#94A3B8' }}>
                    Balance Due
                  </td>
                  <td className="num px-5 py-3 font-bold text-base" style={{ color: balance > 0 ? '#EF4444' : '#10B981' }}>
                    {formatCurrency(balance)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PDF preview simulation */}
          <div
            className="mx-5 mb-5 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors"
            style={{ background: 'rgba(6,182,212,0.04)', border: '1px dashed rgba(6,182,212,0.2)' }}
            onClick={() => alert('PDF preview: Opens in a new window in production.')}
          >
            <div className="flex items-center gap-3">
              <div className="rounded p-2" style={{ background: 'rgba(6,182,212,0.1)' }}>
                <Printer className="h-4 w-4" style={{ color: '#06B6D4' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>PDF Invoice</p>
                <p className="text-xs" style={{ color: '#475569' }}>{invoice.id}.pdf · 42 KB</p>
              </div>
            </div>
            <span className="text-xs" style={{ color: '#06B6D4' }}>Preview →</span>
          </div>
        </div>

        {/* Payment history */}
        <div className="ar-card">
          <h2 className="text-sm font-semibold px-5 py-4" style={{ color: '#F1F5F9', borderBottom: '1px solid #1E293B' }}>
            Payment History
          </h2>
          {invoice.paymentHistory.length === 0 ? (
            <p className="px-5 py-6 text-sm" style={{ color: '#475569' }}>No payments recorded.</p>
          ) : (
            <div className="p-5 space-y-3">
              {invoice.paymentHistory.map((pmt) => (
                <div
                  key={pmt.id}
                  className="rounded-lg p-3"
                  style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-mono font-semibold" style={{ color: '#10B981' }}>
                        {formatCurrency(pmt.amount)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{pmt.method}</p>
                    </div>
                    <span className="text-xs font-mono" style={{ color: '#475569' }}>
                      {formatDate(pmt.date)}
                    </span>
                  </div>
                  <p className="text-xs mt-2 font-mono" style={{ color: '#334155' }}>
                    Ref: {pmt.reference}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="px-5 pb-5 space-y-2 text-sm" style={{ borderTop: '1px solid #1E293B', paddingTop: '12px' }}>
            <div className="flex justify-between">
              <span style={{ color: '#475569' }}>Invoice amount</span>
              <span className="font-mono" style={{ color: '#F1F5F9' }}>{formatCurrency(invoice.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#475569' }}>Total paid</span>
              <span className="font-mono" style={{ color: '#10B981' }}>{formatCurrency(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between pt-2" style={{ borderTop: '1px solid #1E293B' }}>
              <span className="font-semibold" style={{ color: '#94A3B8' }}>Balance due</span>
              <span className="font-mono font-bold" style={{ color: balance > 0 ? '#EF4444' : '#10B981' }}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
