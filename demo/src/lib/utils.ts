import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function daysAgo(iso: string): number {
  const now = new Date('2026-11-06');
  const then = new Date(iso);
  return Math.floor((now.getTime() - then.getTime()) / 86_400_000);
}

export function daysUntil(iso: string): number {
  const now = new Date('2026-11-06');
  const then = new Date(iso);
  return Math.ceil((then.getTime() - now.getTime()) / 86_400_000);
}

export function dsoColor(dso: number): string {
  if (dso <= 35) return '#10B981';
  if (dso <= 45) return '#F59E0B';
  if (dso <= 60) return '#EF4444';
  return '#DC2626';
}

export function agingBucket(dueDate: string): '0' | '30' | '60' | '90' | '90+' {
  const days = daysAgo(dueDate);
  if (days <= 0) return '0';
  if (days <= 30) return '30';
  if (days <= 60) return '60';
  if (days <= 90) return '90';
  return '90+';
}
