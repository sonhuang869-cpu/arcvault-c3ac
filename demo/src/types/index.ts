export type CustomerStatus = 'current' | 'watch' | 'collections' | 'dispute';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AgingBuckets {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days90plus: number;
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  country: string;
  creditLimit: number;
  aging: AgingBuckets;
  dso: number;
  riskLevel: RiskLevel;
  status: CustomerStatus;
  collectorAssigned: string;
  lastContactDate?: string;
  phone: string;
  email: string;
  accountManager: string;
}

export type InvoiceStatus = 'Open' | 'Partial' | 'Paid' | 'Disputed' | 'Written Off';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoicePaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paidAmount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  paymentHistory: InvoicePaymentRecord[];
  notes?: string;
}

export type ContactType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'promise_to_pay'
  | 'dispute_filed'
  | 'escalation'
  | 'payment_received'
  | 'note';

export interface ContactActivity {
  id: string;
  customerId: string;
  date: string;
  type: ContactType;
  user: string;
  notes: string;
  outcome?: string;
  relatedInvoiceId?: string;
}

export type PromiseStatus = 'Pending' | 'Kept' | 'Broken' | 'Partial';

export interface PromiseToPay {
  id: string;
  customerId: string;
  customerName: string;
  invoiceIds: string[];
  promisedDate: string;
  promisedAmount: number;
  actualPaidAmount?: number;
  status: PromiseStatus;
  createdAt: string;
  collectorName: string;
  notes: string;
}

export type DisputeStatus = 'Open' | 'Under Review' | 'Resolved' | 'Withdrawn';

export interface Dispute {
  id: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  reason: string;
  owner: string;
  resolutionTargetDate: string;
  status: DisputeStatus;
  amount: number;
  createdAt: string;
  notes: string;
}

export interface InvoiceMatch {
  invoiceId: string;
  invoiceRef: string;
  amount: number;
  confidence: 'high' | 'medium' | 'low';
}

export type UnappliedStatus = 'Unmatched' | 'Matched' | 'Applied' | 'Short Pay';

export interface UnappliedPayment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  receivedDate: string;
  reference: string;
  bankRef: string;
  suggestedMatches: InvoiceMatch[];
  status: UnappliedStatus;
}

export interface AgingTrendPoint {
  month: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days90plus: number;
}
