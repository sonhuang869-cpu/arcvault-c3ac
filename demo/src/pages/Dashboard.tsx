import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle, Clock,
  ArrowUpRight, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  fetchDashboardSummary,
  fetchAgingTrend,
  fetchTopOverdue,
} from '@/lib/api';
import { formatCurrency, dsoColor } from '@/lib/utils';
import type { Customer, AgingTrendPoint } from '@/types';

type Summary = {
  totals: { current: number; days30: number; days60: number; days90: number; days90plus: number };
  total: number;
  watchCount: number;
  disputeCount: number;
  queueCount: number;
  pendingP2P: number;
  dso: number;
  dsoBenchmark: number;
};

type SortKey = 'overdueTotal' | 'days90plus' | 'dso' | 'name';
type SortDir = 'asc' | 'desc';

const BUCKET_COLORS: Record<string, string> = {
  current: '#06B6D4',
  days30: '#3B82F6',
  days60: '#F59E0B',
  days90: '#EF4444',
  days90plus: '#DC2626',
};

const BUCKET_LABELS: Record<string, string> = {
  current: 'Current',
  days30: '1–30 Days',
  days60: '31–60 Days',
  days90: '61–90 Days',
  days90plus: '90+ Days',
};

function AgingBar({ aging }: { aging: Customer['aging'] }) {
  const total = aging.current + aging.days30 + aging.days60 + aging.days90 + aging.days90plus;
  if (total === 0) return null;
  const pct = (v: number) => ((v / total) * 100).toFixed(1) + '%';
  return (
    <div className="aging-bar" title={`$${formatCurrency(total)}`}>
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
    current: 'badge-current',
    watch: 'badge-watch',
    collections: 'badge-collections',
    dispute: 'badge-dispute',
  };
  const labels: Record<string, string> = {
    current: 'Current',
    watch: 'Watch',
    collections: 'Collections',
    dispute: 'Dispute',
  };
  return <span className={`badge ${map[status] ?? 'badge-current'}`}>{labels[status] ?? status}</span>;
}

function RiskBadge({ risk }: { risk: Customer['riskLevel'] }) {
  const map: Record<string, string> = {
    low: 'badge-low',
    medium: 'badge-medium',
    high: 'badge-high',
    critical: 'badge-critical',
  };
  const labels: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };
  return <span className={`badge ${map[risk] ?? 'badge-medium'}`}>{labels[risk] ?? risk}</span>;
}

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid #1E293B',
  borderRadius: '8px',
  color: '#F1F5F9',
  fontSize: '12px',
};

function formatK(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trend, setTrend] = useState<AgingTrendPoint[]>([]);
  const [topOverdue, setTopOverdue] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('overdueTotal');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    Promise.all([fetchDashboardSummary(), fetchAgingTrend(), fetchTopOverdue()]).then(
      ([s, t, o]) => {
        setSummary(s);
        setTrend(t);
        setTopOverdue(o);
        setLoading(false);
      }
    );
  }, []);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      else { setSortKey(key); setSortDir('desc'); }
    },
    [sortKey]
  );

  const sortedOverdue = [...topOverdue].sort((a, b) => {
    const getVal = (c: Customer) => {
      if (sortKey === 'name') return 0;
      if (sortKey === 'overdueTotal') return c.aging.days30 + c.aging.days60 + c.aging.days90 + c.aging.days90plus;
      if (sortKey === 'days90plus') return c.aging.days90plus;
      if (sortKey === 'dso') return c.dso;
      return 0;
    };
    const aVal = sortKey === 'name' ? a.name : getVal(a);
    const bVal = sortKey === 'name' ? b.name : getVal(b);
    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm animate-pulse" style={{ color: '#475569' }}>Loading AR data…</div>
      </div>
    );
  }

  if (!summary) return null;

  const { totals, total, watchCount, disputeCount, dso, dsoBenchmark, pendingP2P } = summary;
  const overdueTotal = totals.days30 + totals.days60 + totals.days90 + totals.days90plus;

  const agingBarData = [
    { label: 'Current', value: totals.current, color: '#06B6D4' },
    { label: '1–30', value: totals.days30, color: '#3B82F6' },
    { label: '31–60', value: totals.days60, color: '#F59E0B' },
    { label: '61–90', value: totals.days90, color: '#EF4444' },
    { label: '90+', value: totals.days90plus, color: '#DC2626' },
  ];

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronDown className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  }

  function ThSort({ k, label, right }: { k: SortKey; label: string; right?: boolean }) {
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

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="kpi-tile">
          <span className="kpi-label">Total AR</span>
          <span className="kpi-value">{formatCurrency(total, true)}</span>
          <span className="text-xs" style={{ color: '#475569' }}>45 customers</span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Overdue</span>
          <span className="kpi-value num-negative">{formatCurrency(overdueTotal, true)}</span>
          <span className="text-xs" style={{ color: '#94A3B8' }}>
            {((overdueTotal / total) * 100).toFixed(1)}% of portfolio
          </span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">DSO</span>
          <div className="flex items-baseline gap-2">
            <span className="kpi-value" style={{ color: dsoColor(dso) }}>{dso} days</span>
            <span className="text-xs" style={{ color: '#EF4444' }}>
              <ArrowUpRight className="h-3 w-3 inline" /> +{dso - dsoBenchmark}
            </span>
          </div>
          <span className="text-xs" style={{ color: '#475569' }}>Benchmark: {dsoBenchmark} days</span>
        </div>
        <div className="kpi-tile">
          <span className="kpi-label">Pending P2P</span>
          <span className="kpi-value" style={{ color: '#06B6D4' }}>{formatCurrency(pendingP2P, true)}</span>
          <span className="text-xs" style={{ color: '#475569' }}>
            {watchCount} watch · {disputeCount} dispute
          </span>
        </div>
      </div>

      {/* Aging bucket bar + trend */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Aging buckets */}
        <div className="ar-card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>AR Aging Buckets</h2>
            <span className="text-xs" style={{ color: '#475569' }}>Nov 2026</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agingBarData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatK} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [formatCurrency(v), 'Amount']}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {agingBarData.map((entry) => (
                  <rect key={entry.label} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Bucket detail rows */}
          <div className="mt-4 space-y-2">
            {agingBarData.map((b) => (
              <div key={b.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: b.color }} />
                  <span style={{ color: '#94A3B8' }}>{b.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono" style={{ color: '#F1F5F9' }}>{formatCurrency(b.value, true)}</span>
                  <span className="w-10 text-right font-mono" style={{ color: '#475569' }}>
                    {((b.value / total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aging trend */}
        <div className="ar-card p-5 xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>AR Aging Trend — 6 Months</h2>
            <span className="text-xs" style={{ color: '#475569' }}>Jun–Nov 2026</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatK} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number, name: string) => [formatCurrency(v, true), BUCKET_LABELS[name] ?? name]}
                cursor={{ stroke: '#1E293B', strokeWidth: 1 }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(v) => <span style={{ color: '#94A3B8' }}>{BUCKET_LABELS[v] ?? v}</span>}
              />
              {Object.entries(BUCKET_COLORS).map(([key, color]) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.7}
                  strokeWidth={1}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 overdue */}
      <div className="ar-card">
        <div className="flex items-center justify-between p-5 pb-0">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Top 10 Overdue Accounts</h2>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
              Click any row to view account detail
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
            <AlertTriangle className="h-3.5 w-3.5" style={{ color: '#F59E0B' }} />
            <span>{topOverdue.filter((c) => c.riskLevel === 'critical' || c.riskLevel === 'high').length} high-risk accounts</span>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <ThSort k="name" label="Customer" />
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Country</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Risk</th>
                <ThSort k="overdueTotal" label="Overdue" right />
                <ThSort k="days90plus" label="90+ Days" right />
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Credit Util.</th>
                <ThSort k="dso" label="DSO" right />
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Aging Distribution</th>
              </tr>
            </thead>
            <tbody>
              {sortedOverdue.map((c) => {
                const overdueAmt = c.aging.days30 + c.aging.days60 + c.aging.days90 + c.aging.days90plus;
                const totalAmt = overdueAmt + c.aging.current;
                const util = ((totalAmt / c.creditLimit) * 100).toFixed(0);
                const utilNum = parseInt(util);
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/customers/${c.id}`)}
                    className="cursor-pointer"
                  >
                    <td className="name px-4 py-3">
                      <div>
                        <span style={{ color: '#F1F5F9' }}>{c.name}</span>
                        <span className="block text-[11px] mt-0.5" style={{ color: '#475569' }}>{c.industry}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#94A3B8' }}>{c.country}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3"><RiskBadge risk={c.riskLevel} /></td>
                    <td className="num px-4 py-3">
                      <span className={overdueAmt > 50_000 ? 'num-negative' : overdueAmt > 20_000 ? 'num-warn' : 'num-primary'}>
                        {formatCurrency(overdueAmt)}
                      </span>
                    </td>
                    <td className="num px-4 py-3">
                      <span className={c.aging.days90plus > 20_000 ? 'num-negative' : 'num-muted'}>
                        {c.aging.days90plus > 0 ? formatCurrency(c.aging.days90plus) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#1E293B' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, utilNum)}%`,
                              background: utilNum > 90 ? '#EF4444' : utilNum > 70 ? '#F59E0B' : '#06B6D4',
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs" style={{ color: utilNum > 90 ? '#EF4444' : '#94A3B8' }}>
                          {util}%
                        </span>
                      </div>
                    </td>
                    <td className="num px-4 py-3">
                      <span style={{ color: dsoColor(c.dso) }}>{c.dso}d</span>
                    </td>
                    <td className="px-4 py-3 w-32">
                      <AgingBar aging={c.aging} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom row: quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="ar-card p-4 flex items-start gap-3">
          <div className="rounded-lg p-2" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <AlertTriangle className="h-4 w-4" style={{ color: '#EF4444' }} />
          </div>
          <div>
            <p className="text-lg font-mono font-semibold" style={{ color: '#EF4444' }}>{disputeCount}</p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Formal Disputes</p>
          </div>
        </div>
        <div className="ar-card p-4 flex items-start gap-3">
          <div className="rounded-lg p-2" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <Clock className="h-4 w-4" style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <p className="text-lg font-mono font-semibold" style={{ color: '#F59E0B' }}>{watchCount}</p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Collections Watch</p>
          </div>
        </div>
        <div className="ar-card p-4 flex items-start gap-3">
          <div className="rounded-lg p-2" style={{ background: 'rgba(6,182,212,0.1)' }}>
            <TrendingUp className="h-4 w-4" style={{ color: '#06B6D4' }} />
          </div>
          <div>
            <p className="text-lg font-mono font-semibold" style={{ color: '#06B6D4' }}>
              {formatCurrency(totals.current, true)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Current (not overdue)</p>
          </div>
        </div>
        <div className="ar-card p-4 flex items-start gap-3">
          <div className="rounded-lg p-2" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <TrendingDown className="h-4 w-4" style={{ color: '#EF4444' }} />
          </div>
          <div>
            <p className="text-lg font-mono font-semibold" style={{ color: '#EF4444' }}>
              {formatCurrency(totals.days90plus, true)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>90+ Days Overdue</p>
          </div>
        </div>
      </div>
    </div>
  );
}
