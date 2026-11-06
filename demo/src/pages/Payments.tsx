import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, AlertCircle, Zap, ArrowRight,
} from 'lucide-react';
import { fetchUnappliedPayments, applyPayment, rejectPaymentMatch } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { UnappliedPayment } from '@/types';

type PaymentStatus = UnappliedPayment['status'];

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, string> = {
    Unmatched: 'badge-open',
    Matched: 'badge-watch',
    Applied: 'badge-paid',
    'Short Pay': 'badge-partial',
  };
  return <span className={`badge ${map[status]}`}>{status}</span>;
}

function ConfidenceDot({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  const colors = { high: '#10B981', medium: '#F59E0B', low: '#EF4444' };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: colors[confidence] }} />
      <span className="text-xs capitalize" style={{ color: colors[confidence] }}>{confidence}</span>
    </span>
  );
}

function Toast({ message }: { message: string }) {
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

export function Payments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<UnappliedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchUnappliedPayments().then((data) => {
      setPayments(data);
      setLoading(false);
    });
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApply = async (paymentId: string, invoiceId: string) => {
    setApplying(paymentId);
    await applyPayment(paymentId, invoiceId);
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'Applied' } : p))
    );
    setApplying(null);
    showToast('Payment applied to invoice.');
  };

  const handleReject = async (paymentId: string) => {
    await rejectPaymentMatch(paymentId);
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, suggestedMatches: [], status: 'Unmatched' } : p))
    );
    showToast('Match rejected — payment returned to unmatched queue.');
  };

  const unmatched = payments.filter((p) => p.status === 'Unmatched' || p.status === 'Short Pay');
  const matched = payments.filter((p) => p.status === 'Matched');
  const applied = payments.filter((p) => p.status === 'Applied');
  const totalUnapplied = unmatched.reduce((s, p) => s + p.amount, 0);
  const totalMatched = matched.reduce((s, p) => s + p.amount, 0);
  const totalApplied = applied.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      {toast && <Toast message={toast} />}

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="kpi-tile">
          <span className="kpi-label">Unapplied Cash</span>
          <span className="kpi-value" style={{ color: '#F59E0B' }}>{formatCurrency(totalUnapplied, true)}</span>
          <span className="text-xs" style={{ color: '#475569' }}>{unmatched.length} payments pending</span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Auto-Matched</span>
          <span className="kpi-value" style={{ color: '#06B6D4' }}>{formatCurrency(totalMatched, true)}</span>
          <span className="text-xs" style={{ color: '#475569' }}>{matched.length} ready to apply</span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Applied Today</span>
          <span className="kpi-value" style={{ color: '#10B981' }}>{formatCurrency(totalApplied, true)}</span>
          <span className="text-xs" style={{ color: '#475569' }}>{applied.length} payments cleared</span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Total Received</span>
          <span className="kpi-value">{formatCurrency(totalUnapplied + totalMatched + totalApplied, true)}</span>
          <span className="text-xs" style={{ color: '#475569' }}>This week</span>
        </div>
      </div>

      {loading ? (
        <div className="ar-card flex h-40 items-center justify-center text-sm animate-pulse" style={{ color: '#475569' }}>
          Loading payments…
        </div>
      ) : (
        <div className="space-y-4">
          {/* Unmatched & Short Pay */}
          {unmatched.length > 0 && (
            <div className="ar-card">
              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #1E293B' }}>
                <AlertCircle className="h-4 w-4" style={{ color: '#F59E0B' }} />
                <h2 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>
                  Unapplied Payments
                </h2>
                <span
                  className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
                >
                  {unmatched.length}
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: '#1E293B' }}>
                {unmatched.map((pmt) => (
                  <div key={pmt.id} className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Payment info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
                            {pmt.customerName || 'Unknown Remitter'}
                          </span>
                          <PaymentStatusBadge status={pmt.status} />
                          {pmt.status === 'Short Pay' && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-md"
                              style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}
                            >
                              Short Pay
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs" style={{ color: '#475569' }}>
                          <span>Received: <span style={{ color: '#94A3B8' }}>{formatDate(pmt.receivedDate)}</span></span>
                          <span>Ref: <span className="font-mono" style={{ color: '#94A3B8' }}>{pmt.reference}</span></span>
                          <span>Bank Ref: <span className="font-mono" style={{ color: '#94A3B8' }}>{pmt.bankRef}</span></span>
                        </div>
                        <div className="mt-2">
                          <span className="font-mono text-lg font-semibold" style={{ color: '#F1F5F9' }}>
                            {formatCurrency(pmt.amount)}
                          </span>
                          <span className="text-xs ml-2" style={{ color: '#475569' }}>received</span>
                        </div>
                      </div>

                      {/* Auto-match suggestions */}
                      <div className="md:w-96">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-3.5 w-3.5" style={{ color: '#06B6D4' }} />
                          <span className="text-xs font-semibold" style={{ color: '#06B6D4' }}>
                            Auto-match Suggestions
                          </span>
                        </div>
                        {pmt.suggestedMatches.length === 0 ? (
                          <div
                            className="rounded-lg p-3 text-xs"
                            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444' }}
                          >
                            No matching invoices found. Manual review required.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {pmt.suggestedMatches.map((match) => {
                              const diff = pmt.amount - match.amount;
                              return (
                                <div
                                  key={match.invoiceId}
                                  className="rounded-lg p-3"
                                  style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)' }}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="text-xs font-mono font-semibold"
                                          style={{ color: '#06B6D4' }}
                                        >
                                          {match.invoiceRef}
                                        </span>
                                        <ConfidenceDot confidence={match.confidence} />
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono text-sm font-semibold" style={{ color: '#F1F5F9' }}>
                                          {formatCurrency(match.amount)}
                                        </span>
                                        {diff !== 0 && (
                                          <span
                                            className="text-xs font-mono"
                                            style={{ color: diff < 0 ? '#EF4444' : '#10B981' }}
                                          >
                                            {diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)} diff
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleApply(pmt.id, match.invoiceId)}
                                        disabled={applying === pmt.id}
                                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
                                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        {applying === pmt.id ? '…' : 'Accept'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <button
                              onClick={() => handleReject(pmt.id)}
                              className="w-full rounded-md px-3 py-1.5 text-xs font-medium transition-colors text-center"
                              style={{ background: 'rgba(100,116,139,0.1)', color: '#64748B' }}
                            >
                              <XCircle className="h-3.5 w-3.5 inline mr-1" />
                              Reject all suggestions
                            </button>
                          </div>
                        )}

                        {/* Short pay handling */}
                        {pmt.status === 'Short Pay' && pmt.suggestedMatches.length > 0 && (
                          <div
                            className="mt-2 rounded-lg p-3 text-xs"
                            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}
                          >
                            <strong>Short Pay:</strong> This payment is less than the invoice amount. Accepting will apply a partial payment
                            and leave the remainder outstanding. Optionally raise a dispute for the difference.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched */}
          {matched.length > 0 && (
            <div className="ar-card">
              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #1E293B' }}>
                <Zap className="h-4 w-4" style={{ color: '#06B6D4' }} />
                <h2 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>
                  Auto-Matched — Ready to Apply
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Customer</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Payment Amt</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Matched Invoice</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Confidence</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Received</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {matched.map((pmt) => (
                      <tr key={pmt.id}>
                        <td className="name px-4 py-3">{pmt.customerName}</td>
                        <td className="num px-4 py-3">{formatCurrency(pmt.amount)}</td>
                        <td className="px-4 py-3">
                          {pmt.suggestedMatches[0] ? (
                            <span
                              className="font-mono text-xs cursor-pointer hover:underline"
                              style={{ color: '#06B6D4' }}
                              onClick={() => navigate(`/invoices/${pmt.suggestedMatches[0].invoiceId}`)}
                            >
                              {pmt.suggestedMatches[0].invoiceRef}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {pmt.suggestedMatches[0] && <ConfidenceDot confidence={pmt.suggestedMatches[0].confidence} />}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#94A3B8' }}>{formatDate(pmt.receivedDate)}</td>
                        <td className="px-4 py-3">
                          {pmt.suggestedMatches[0] && (
                            <button
                              onClick={() => handleApply(pmt.id, pmt.suggestedMatches[0].invoiceId)}
                              disabled={applying === pmt.id}
                              className="btn-primary text-xs disabled:opacity-40"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                              Apply
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applied */}
          {applied.length > 0 && (
            <div className="ar-card">
              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #1E293B' }}>
                <CheckCircle2 className="h-4 w-4" style={{ color: '#10B981' }} />
                <h2 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Applied This Session</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Customer</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Amount Applied</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Reference</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applied.map((pmt) => (
                      <tr key={pmt.id}>
                        <td className="name px-4 py-3">{pmt.customerName}</td>
                        <td className="num px-4 py-3">
                          <span style={{ color: '#10B981' }}>{formatCurrency(pmt.amount)}</span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: '#475569' }}>{pmt.reference}</td>
                        <td className="px-4 py-3"><PaymentStatusBadge status={pmt.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {payments.length === 0 && (
            <div className="ar-card flex h-40 items-center justify-center text-sm" style={{ color: '#475569' }}>
              No unapplied payments found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
