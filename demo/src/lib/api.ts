import {
  customers,
  invoices,
  contactActivities,
  promisesToPay,
  disputes,
  unappliedPayments,
  agingTrend,
  getCollectionsQueue,
  getTopOverdue,
  getTotalAR,
  getAgingTotals,
  getCustomerById,
  getInvoiceById,
  getInvoicesByCustomer,
} from './data';
import type {
  Customer,
  Invoice,
  ContactActivity,
  PromiseToPay,
  Dispute,
  UnappliedPayment,
  AgingTrendPoint,
} from '@/types';

const STORAGE_KEY = 'arcvault_state';

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

type State = {
  customers: Customer[];
  invoices: Invoice[];
  promises: PromiseToPay[];
  disputes: Dispute[];
  payments: UnappliedPayment[];
  contacts: ContactActivity[];
};

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {}
  return {
    customers: structuredClone(customers),
    invoices: structuredClone(invoices),
    promises: structuredClone(promisesToPay),
    disputes: structuredClone(disputes),
    payments: structuredClone(unappliedPayments),
    contacts: structuredClone(contactActivities),
  };
}

function saveState(s: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

let _state = loadState();

function state(): State {
  return _state;
}

export function resetDemoData() {
  _state = {
    customers: structuredClone(customers),
    invoices: structuredClone(invoices),
    promises: structuredClone(promisesToPay),
    disputes: structuredClone(disputes),
    payments: structuredClone(unappliedPayments),
    contacts: structuredClone(contactActivities),
  };
  saveState(_state);
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export async function fetchDashboardSummary() {
  await delay(200);
  const totals = getAgingTotals();
  const total = getTotalAR();
  const watchCount = state().customers.filter((c) => c.status === 'watch' || c.status === 'collections').length;
  const disputeCount = state().customers.filter((c) => c.status === 'dispute').length;
  const queueCount = getCollectionsQueue().length;
  const pendingP2P = state().promises.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.promisedAmount, 0);
  return { totals, total, watchCount, disputeCount, queueCount, pendingP2P, dso: 42, dsoBenchmark: 35 };
}

export async function fetchAgingTrend(): Promise<AgingTrendPoint[]> {
  await delay(150);
  return agingTrend;
}

export async function fetchTopOverdue(): Promise<Customer[]> {
  await delay(150);
  return getTopOverdue().map((c) => state().customers.find((x) => x.id === c.id) ?? c);
}

// ── Customers ──────────────────────────────────────────────────────────────

export async function fetchCustomers(): Promise<Customer[]> {
  await delay(200);
  return state().customers;
}

export async function fetchCustomer(id: string): Promise<Customer | undefined> {
  await delay(100);
  return state().customers.find((c) => c.id === id);
}

export async function updateCustomerStatus(id: string, status: Customer['status']): Promise<void> {
  await delay(200);
  const s = state();
  const c = s.customers.find((x) => x.id === id);
  if (c) { c.status = status; saveState(s); }
}

// ── Invoices ──────────────────────────────────────────────────────────────

export async function fetchInvoices(): Promise<Invoice[]> {
  await delay(200);
  return state().invoices;
}

export async function fetchInvoice(id: string): Promise<Invoice | undefined> {
  await delay(100);
  return state().invoices.find((inv) => inv.id === id);
}

export async function fetchCustomerInvoices(cid: string): Promise<Invoice[]> {
  await delay(100);
  return state().invoices.filter((inv) => inv.customerId === cid);
}

export async function markInvoicePaid(invoiceId: string): Promise<void> {
  await delay(300);
  const s = state();
  const inv = s.invoices.find((x) => x.id === invoiceId);
  if (inv) {
    inv.paidAmount = inv.amount;
    inv.status = 'Paid';
    saveState(s);
  }
}

export async function writeOffInvoice(invoiceId: string): Promise<void> {
  await delay(300);
  const s = state();
  const inv = s.invoices.find((x) => x.id === invoiceId);
  if (inv) { inv.status = 'Written Off'; saveState(s); }
}

export async function sendReminder(invoiceId: string): Promise<void> {
  await delay(400);
}

// ── Collections ────────────────────────────────────────────────────────────

export async function fetchCollectionsQueue() {
  await delay(200);
  return getCollectionsQueue().map((q) => ({
    ...q,
    ...state().customers.find((c) => c.id === q.id),
    overdueTotal: q.overdueTotal,
    priorityScore: q.priorityScore,
  }));
}

export async function fetchContactHistory(cid: string): Promise<ContactActivity[]> {
  await delay(100);
  return state().contacts
    .filter((a) => a.customerId === cid)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function logContactActivity(activity: Omit<ContactActivity, 'id'>): Promise<ContactActivity> {
  await delay(300);
  const s = state();
  const newActivity: ContactActivity = {
    ...activity,
    id: `CA${String(s.contacts.length + 1).padStart(3, '0')}`,
  };
  s.contacts.push(newActivity);
  saveState(s);
  return newActivity;
}

// ── Promises to Pay ────────────────────────────────────────────────────────

export async function fetchPromises(): Promise<PromiseToPay[]> {
  await delay(150);
  return state().promises;
}

export async function updatePromiseStatus(id: string, status: PromiseToPay['status']): Promise<void> {
  await delay(200);
  const s = state();
  const p = s.promises.find((x) => x.id === id);
  if (p) { p.status = status; saveState(s); }
}

// ── Disputes ──────────────────────────────────────────────────────────────

export async function fetchDisputes(): Promise<Dispute[]> {
  await delay(150);
  return state().disputes;
}

export async function updateDisputeStatus(id: string, status: Dispute['status']): Promise<void> {
  await delay(200);
  const s = state();
  const d = s.disputes.find((x) => x.id === id);
  if (d) { d.status = status; saveState(s); }
}

// ── Payments ──────────────────────────────────────────────────────────────

export async function fetchUnappliedPayments(): Promise<UnappliedPayment[]> {
  await delay(150);
  return state().payments;
}

export async function applyPayment(paymentId: string, invoiceId: string): Promise<void> {
  await delay(400);
  const s = state();
  const pmt = s.payments.find((x) => x.id === paymentId);
  const inv = s.invoices.find((x) => x.id === invoiceId);
  if (pmt && inv) {
    if (pmt.amount >= inv.amount - inv.paidAmount) {
      inv.paidAmount = inv.amount;
      inv.status = 'Paid';
    } else {
      inv.paidAmount += pmt.amount;
      inv.status = 'Partial';
    }
    pmt.status = 'Applied';
    saveState(s);
  }
}

export async function rejectPaymentMatch(paymentId: string): Promise<void> {
  await delay(200);
  const s = state();
  const pmt = s.payments.find((x) => x.id === paymentId);
  if (pmt) { pmt.suggestedMatches = []; pmt.status = 'Unmatched'; saveState(s); }
}

export { getCustomerById, getInvoiceById, getInvoicesByCustomer };
