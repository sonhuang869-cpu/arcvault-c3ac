import type { CustomerStatus, RiskLevel } from '@/types';

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  const map: Record<CustomerStatus, string> = {
    current: 'badge-current',
    watch: 'badge-watch',
    collections: 'badge-collections',
    dispute: 'badge-dispute',
  };
  return <span className={`badge ${map[status]}`}>{status}</span>;
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const map: Record<RiskLevel, string> = {
    low: 'badge-low',
    medium: 'badge-medium',
    high: 'badge-high',
    critical: 'badge-critical',
  };
  return <span className={`badge ${map[level]}`}>{level}</span>;
}
