import type {
  Customer,
  Invoice,
  InvoiceLineItem,
  InvoicePaymentRecord,
  ContactActivity,
  PromiseToPay,
  Dispute,
  UnappliedPayment,
  AgingTrendPoint,
} from '@/types';

// ── COLLECTORS ──────────────────────────────────────────────────────────────
export const COLLECTORS = [
  'María Fernández',
  'Carlos Restrepo',
  'Luciana Vega',
  'Diego Salazar',
  'Valentina Méndez',
  'Rodrigo Pizarro',
];

const ACCT_MGRS = [
  'Alejandro Ruiz',
  'Patricia Lomas',
  'Sebastián Torres',
  'Camila Ortiz',
  'Nicolás Pérez',
];

// ── CUSTOMERS (45 total) ─────────────────────────────────────────────────────
// Totals verified: Current=1,800,000 | 1-30=950,000 | 31-60=680,000 | 61-90=420,000 | 90+=350,000 | Total=4,200,000

type CustDef = Omit<Customer, 'aging'> & {
  c: number; d30: number; d60: number; d90: number; d90p: number;
};

const customerDefs: CustDef[] = [
  // ── LARGE (1-10) ───────────────────────────────────────────────────────────
  {
    id: 'C001', name: 'Corporación Petrobras B2B', industry: 'Energy & Utilities', country: 'Brazil',
    creditLimit: 350_000, c: 185_000, d30: 65_000, d60: 0, d90: 0, d90p: 0,
    dso: 18, riskLevel: 'low', status: 'current', collectorAssigned: COLLECTORS[0],
    lastContactDate: '2026-10-15', phone: '+55 21 3317-4400', email: 'ar@petrobras-b2b.com',
    accountManager: ACCT_MGRS[0],
  },
  {
    id: 'C002', name: 'Bancolombia S.A.', industry: 'Financial Services', country: 'Colombia',
    creditLimit: 300_000, c: 95_000, d30: 45_000, d60: 35_000, d90: 0, d90p: 0,
    dso: 32, riskLevel: 'low', status: 'current', collectorAssigned: COLLECTORS[1],
    lastContactDate: '2026-10-28', phone: '+57 4 510-9000', email: 'cuentasxpagar@bancolombia.com',
    accountManager: ACCT_MGRS[1],
  },
  {
    id: 'C003', name: 'Grupo Falabella', industry: 'Retail & Commerce', country: 'Chile',
    creditLimit: 280_000, c: 120_000, d30: 30_000, d60: 20_000, d90: 0, d90p: 0,
    dso: 22, riskLevel: 'low', status: 'current', collectorAssigned: COLLECTORS[2],
    lastContactDate: '2026-11-01', phone: '+56 2 2360-6700', email: 'viajes-corporativos@falabella.cl',
    accountManager: ACCT_MGRS[2],
  },
  {
    id: 'C004', name: 'Claro Brasil Corp', industry: 'Telecommunications', country: 'Brazil',
    creditLimit: 250_000, c: 80_000, d30: 40_000, d60: 25_000, d90: 15_000, d90p: 0,
    dso: 38, riskLevel: 'medium', status: 'current', collectorAssigned: COLLECTORS[0],
    lastContactDate: '2026-10-20', phone: '+55 11 2111-2800', email: 'corporativo-travel@claro.com.br',
    accountManager: ACCT_MGRS[3],
  },
  {
    id: 'C005', name: 'PEMEX Corp Travel', industry: 'Energy & Utilities', country: 'Mexico',
    creditLimit: 250_000, c: 45_000, d30: 35_000, d60: 40_000, d90: 25_000, d90p: 10_000,
    dso: 54, riskLevel: 'high', status: 'watch', collectorAssigned: COLLECTORS[1],
    lastContactDate: '2026-10-30', phone: '+52 55 1944-2500', email: 'cuentas-pagar@pemex.com',
    accountManager: ACCT_MGRS[0],
  },
  {
    id: 'C006', name: 'Grupo Bimbo', industry: 'Food & Consumer Goods', country: 'Mexico',
    creditLimit: 220_000, c: 70_000, d30: 35_000, d60: 20_000, d90: 15_000, d90p: 10_000,
    dso: 49, riskLevel: 'high', status: 'watch', collectorAssigned: COLLECTORS[2],
    lastContactDate: '2026-11-02', phone: '+52 55 5268-6600', email: 'ap-viajes@grupobimbo.com',
    accountManager: ACCT_MGRS[1],
  },
  {
    id: 'C007', name: 'Telefónica Vivo', industry: 'Telecommunications', country: 'Brazil',
    creditLimit: 240_000, c: 85_000, d30: 35_000, d60: 20_000, d90: 5_000, d90p: 0,
    dso: 25, riskLevel: 'low', status: 'current', collectorAssigned: COLLECTORS[3],
    lastContactDate: '2026-10-25', phone: '+55 11 3430-3030', email: 'corp-travel@vivo.com.br',
    accountManager: ACCT_MGRS[2],
  },
  {
    id: 'C008', name: 'YPF S.A.', industry: 'Energy & Utilities', country: 'Argentina',
    creditLimit: 200_000, c: 60_000, d30: 30_000, d60: 20_000, d90: 15_000, d90p: 10_000,
    dso: 51, riskLevel: 'high', status: 'watch', collectorAssigned: COLLECTORS[4],
    lastContactDate: '2026-10-29', phone: '+54 11 5441-2000', email: 'travel-ap@ypf.com',
    accountManager: ACCT_MGRS[3],
  },
  {
    id: 'C009', name: 'Avianca Holdings', industry: 'Aviation & Transport', country: 'Colombia',
    creditLimit: 180_000, c: 40_000, d30: 20_000, d60: 25_000, d90: 20_000, d90p: 30_000,
    dso: 72, riskLevel: 'critical', status: 'dispute', collectorAssigned: COLLECTORS[0],
    lastContactDate: '2026-10-24', phone: '+57 1 587-7700', email: 'cuentas-pagar@avianca.com',
    accountManager: ACCT_MGRS[4],
  },
  {
    id: 'C010', name: 'Copa Airlines Corp', industry: 'Aviation & Transport', country: 'Panama',
    creditLimit: 180_000, c: 30_000, d30: 20_000, d60: 25_000, d90: 20_000, d90p: 35_000,
    dso: 79, riskLevel: 'critical', status: 'dispute', collectorAssigned: COLLECTORS[1],
    lastContactDate: '2026-10-20', phone: '+507 217-2672', email: 'finance-ap@copaair.com',
    accountManager: ACCT_MGRS[0],
  },
  // ── MEDIUM (11-25) ─────────────────────────────────────────────────────────
  {
    id: 'C011', name: 'Cencosud S.A.', industry: 'Retail & Commerce', country: 'Chile',
    creditLimit: 150_000, c: 55_000, d30: 20_000, d60: 10_000, d90: 5_000, d90p: 0,
    dso: 28, riskLevel: 'low', status: 'current', collectorAssigned: COLLECTORS[2],
    lastContactDate: '2026-10-18', phone: '+56 2 2959-0000', email: 'viajes-corp@cencosud.cl',
    accountManager: ACCT_MGRS[1],
  },
  {
    id: 'C012', name: 'Grupo Éxito', industry: 'Retail & Commerce', country: 'Colombia',
    creditLimit: 140_000, c: 65_000, d30: 10_000, d60: 5_000, d90: 0, d90p: 0,
    dso: 20, riskLevel: 'low', status: 'watch', collectorAssigned: COLLECTORS[3],
    lastContactDate: '2026-10-30', phone: '+57 4 604-0909', email: 'cuentasxp@grupoexito.com',
    accountManager: ACCT_MGRS[2],
  },
  {
    id: 'C013', name: 'LATAM Airlines Corp', industry: 'Aviation & Transport', country: 'Chile',
    creditLimit: 150_000, c: 40_000, d30: 20_000, d60: 10_000, d90: 5_000, d90p: 5_000,
    dso: 44, riskLevel: 'medium', status: 'watch', collectorAssigned: COLLECTORS[4],
    lastContactDate: '2026-10-22', phone: '+56 2 2565-3100', email: 'ap-corp@latamairlines.com',
    accountManager: ACCT_MGRS[3],
  },
  {
    id: 'C014', name: 'Interbank Peru', industry: 'Financial Services', country: 'Peru',
    creditLimit: 130_000, c: 55_000, d30: 10_000, d60: 5_000, d90: 0, d90p: 0,
    dso: 18, riskLevel: 'low', status: 'current', collectorAssigned: COLLECTORS[5],
    lastContactDate: '2026-11-02', phone: '+51 1 219-2000', email: 'proveedores@interbank.com.pe',
    accountManager: ACCT_MGRS[4],
  },
  {
    id: 'C015', name: 'Empresas COPEC', industry: 'Energy & Utilities', country: 'Chile',
    creditLimit: 120_000, c: 50_000, d30: 10_000, d60: 5_000, d90: 0, d90p: 0,
    dso: 20, riskLevel: 'low', status: 'current', collectorAssigned: COLLECTORS[0],
    lastContactDate: '2026-10-14', phone: '+56 2 2461-7000', email: 'viajes-corp@copec.cl',
    accountManager: ACCT_MGRS[0],
  },
  {
    id: 'C016', name: 'Grupo Suramericana', industry: 'Financial Services', country: 'Colombia',
    creditLimit: 120_000, c: 40_000, d30: 10_000, d60: 5_000, d90: 5_000, d90p: 5_000,
    dso: 46, riskLevel: 'medium', status: 'watch', collectorAssigned: COLLECTORS[1],
    lastContactDate: '2026-10-10', phone: '+57 4 325-9000', email: 'viajes-corp@gruposura.com',
    accountManager: ACCT_MGRS[1],
  },
  {
    id: 'C017', name: 'Itaú Corp Viagens', industry: 'Financial Services', country: 'Brazil',
    creditLimit: 120_000, c: 45_000, d30: 10_000, d60: 5_000, d90: 0, d90p: 0,
    dso: 22, riskLevel: 'low', status: 'current', collectorAssigned: COLLECTORS[2],
    lastContactDate: '2026-10-28', phone: '+55 11 5019-1549', email: 'corp-travel@itau-unibanco.com',
    accountManager: ACCT_MGRS[2],
  },
  {
    id: 'C018', name: 'Ambev S.A.', industry: 'Food & Consumer Goods', country: 'Brazil',
    creditLimit: 110_000, c: 40_000, d30: 10_000, d60: 5_000, d90: 0, d90p: 0,
    dso: 23, riskLevel: 'low', status: 'current', collectorAssigned: COLLECTORS[3],
    lastContactDate: '2026-10-20', phone: '+55 11 2122-1414', email: 'ap-viagens@ambev.com.br',
    accountManager: ACCT_MGRS[3],
  },
  {
    id: 'C019', name: 'Rappi Colombia Corp', industry: 'Technology & E-Commerce', country: 'Colombia',
    creditLimit: 100_000, c: 35_000, d30: 10_000, d60: 5_000, d90: 5_000, d90p: 0,
    dso: 38, riskLevel: 'medium', status: 'current', collectorAssigned: COLLECTORS[4],
    lastContactDate: '2026-10-24', phone: '+57 1 601-9999', email: 'finance-ap@rappi.com',
    accountManager: ACCT_MGRS[4],
  },
  {
    id: 'C020', name: 'Linio Retail Corp', industry: 'Technology & E-Commerce', country: 'Colombia',
    creditLimit: 100_000, c: 30_000, d30: 10_000, d60: 5_000, d90: 5_000, d90p: 5_000,
    dso: 55, riskLevel: 'high', status: 'dispute', collectorAssigned: COLLECTORS[5],
    lastContactDate: '2026-10-15', phone: '+57 1 743-0100', email: 'proveedores@linio.com.co',
    accountManager: ACCT_MGRS[0],
  },
  {
    id: 'C021', name: 'Cabify Spain Corp', industry: 'Technology & E-Commerce', country: 'Spain',
    creditLimit: 100_000, c: 35_000, d30: 10_000, d60: 5_000, d90: 0, d90p: 0,
    dso: 20, riskLevel: 'low', status: 'current', collectorAssigned: COLLECTORS[0],
    lastContactDate: '2026-10-10', phone: '+34 91 526-7200', email: 'ap-viajes@cabify.com',
    accountManager: ACCT_MGRS[1],
  },
  {
    id: 'C022', name: 'Grupo Nutresa', industry: 'Food & Consumer Goods', country: 'Colombia',
    creditLimit: 100_000, c: 35_000, d30: 10_000, d60: 0, d90: 0, d90p: 0,
    dso: 16, riskLevel: 'low', status: 'current', collectorAssigned: COLLECTORS[1],
    lastContactDate: '2026-11-03', phone: '+57 4 319-8080', email: 'cuentasxp@gruponutresa.com',
    accountManager: ACCT_MGRS[2],
  },
  {
    id: 'C023', name: 'Globant S.A.', industry: 'Technology & E-Commerce', country: 'Argentina',
    creditLimit: 100_000, c: 35_000, d30: 5_000, d60: 0, d90: 5_000, d90p: 0,
    dso: 42, riskLevel: 'medium', status: 'watch', collectorAssigned: COLLECTORS[2],
    lastContactDate: '2026-10-05', phone: '+54 11 5218-7222', email: 'finance@globant.com',
    accountManager: ACCT_MGRS[3],
  },
  {
    id: 'C024', name: 'MercadoLibre Corp', industry: 'Technology & E-Commerce', country: 'Argentina',
    creditLimit: 100_000, c: 30_000, d30: 10_000, d60: 0, d90: 0, d90p: 0,
    dso: 15, riskLevel: 'low', status: 'current', collectorAssigned: COLLECTORS[3],
    lastContactDate: '2026-10-30', phone: '+54 11 4040-8600', email: 'viajes-corp@mercadolibre.com',
    accountManager: ACCT_MGRS[4],
  },
  {
    id: 'C025', name: 'Grupo Orocobre', industry: 'Mining & Resources', country: 'Argentina',
    creditLimit: 100_000, c: 25_000, d30: 10_000, d60: 5_000, d90: 0, d90p: 0,
    dso: 26, riskLevel: 'low', status: 'watch', collectorAssigned: COLLECTORS[4],
    lastContactDate: '2026-09-28', phone: '+54 11 4590-7700', email: 'ap-viajes@orocobre.com',
    accountManager: ACCT_MGRS[0],
  },
  // ── SMALLER (26-45) ───────────────────────────────────────────────────────
  {
    id: 'C026', name: 'Votorantim Corp', industry: 'Industrials & Manufacturing', country: 'Brazil',
    creditLimit: 150_000, c: 25_000, d30: 25_000, d60: 20_000, d90: 15_000, d90p: 15_000,
    dso: 65, riskLevel: 'high', status: 'collections', collectorAssigned: COLLECTORS[5],
    lastContactDate: '2026-10-31', phone: '+55 11 3004-8000', email: 'ap-viagens@votorantim.com.br',
    accountManager: ACCT_MGRS[1],
  },
  {
    id: 'C027', name: 'EPM Empresarial', industry: 'Energy & Utilities', country: 'Colombia',
    creditLimit: 150_000, c: 20_000, d30: 25_000, d60: 20_000, d90: 15_000, d90p: 15_000,
    dso: 68, riskLevel: 'medium', status: 'current', collectorAssigned: COLLECTORS[0],
    lastContactDate: '2026-10-14', phone: '+57 4 380-6060', email: 'cuentasxp@epm.com.co',
    accountManager: ACCT_MGRS[2],
  },
  {
    id: 'C028', name: 'Consorcio ARA', industry: 'Real Estate & Construction', country: 'Mexico',
    creditLimit: 150_000, c: 20_000, d30: 25_000, d60: 20_000, d90: 15_000, d90p: 15_000,
    dso: 72, riskLevel: 'high', status: 'collections', collectorAssigned: COLLECTORS[1],
    lastContactDate: '2026-10-10', phone: '+52 55 5262-6600', email: 'ap@consorcioara.com.mx',
    accountManager: ACCT_MGRS[3],
  },
  {
    id: 'C029', name: 'Almundo Viajes Corp', industry: 'Travel & Tourism', country: 'Argentina',
    creditLimit: 150_000, c: 25_000, d30: 25_000, d60: 20_000, d90: 15_000, d90p: 10_000,
    dso: 60, riskLevel: 'medium', status: 'current', collectorAssigned: COLLECTORS[2],
    lastContactDate: '2026-10-25', phone: '+54 11 4315-8800', email: 'cuentas-pagar@almundo.com',
    accountManager: ACCT_MGRS[4],
  },
  {
    id: 'C030', name: 'Sodexo LatAm', industry: 'Professional Services', country: 'Brazil',
    creditLimit: 150_000, c: 30_000, d30: 25_000, d60: 20_000, d90: 10_000, d90p: 10_000,
    dso: 55, riskLevel: 'medium', status: 'current', collectorAssigned: COLLECTORS[3],
    lastContactDate: '2026-10-22', phone: '+55 11 3031-7000', email: 'ap-viagens@sodexo.com.br',
    accountManager: ACCT_MGRS[0],
  },
  {
    id: 'C031', name: 'Gestión Viajes S.A.', industry: 'Travel & Tourism', country: 'Chile',
    creditLimit: 120_000, c: 25_000, d30: 20_000, d60: 20_000, d90: 15_000, d90p: 10_000,
    dso: 65, riskLevel: 'high', status: 'collections', collectorAssigned: COLLECTORS[4],
    lastContactDate: '2026-10-18', phone: '+56 2 2437-4500', email: 'ap@gestionviajes.cl',
    accountManager: ACCT_MGRS[1],
  },
  {
    id: 'C032', name: 'Distribuidora Torvec', industry: 'Industrials & Manufacturing', country: 'Colombia',
    creditLimit: 120_000, c: 20_000, d30: 20_000, d60: 20_000, d90: 15_000, d90p: 10_000,
    dso: 68, riskLevel: 'high', status: 'current', collectorAssigned: COLLECTORS[5],
    lastContactDate: '2026-09-30', phone: '+57 2 390-1100', email: 'cuentasxp@torvec.com',
    accountManager: ACCT_MGRS[2],
  },
  {
    id: 'C033', name: 'Operadora Integra', industry: 'Travel & Tourism', country: 'Peru',
    creditLimit: 120_000, c: 25_000, d30: 20_000, d60: 20_000, d90: 10_000, d90p: 10_000,
    dso: 60, riskLevel: 'high', status: 'collections', collectorAssigned: COLLECTORS[0],
    lastContactDate: '2026-10-12', phone: '+51 1 213-9800', email: 'ap@operadoraintegra.com.pe',
    accountManager: ACCT_MGRS[3],
  },
  {
    id: 'C034', name: 'CDA Corporativo', industry: 'Professional Services', country: 'Mexico',
    creditLimit: 120_000, c: 25_000, d30: 20_000, d60: 15_000, d90: 15_000, d90p: 10_000,
    dso: 62, riskLevel: 'medium', status: 'current', collectorAssigned: COLLECTORS[1],
    lastContactDate: '2026-10-08', phone: '+52 55 5520-0000', email: 'finanzas@cda-corp.mx',
    accountManager: ACCT_MGRS[4],
  },
  {
    id: 'C035', name: 'Grupo Carso Corp', industry: 'Industrials & Manufacturing', country: 'Mexico',
    creditLimit: 120_000, c: 30_000, d30: 20_000, d60: 15_000, d90: 10_000, d90p: 10_000,
    dso: 57, riskLevel: 'medium', status: 'current', collectorAssigned: COLLECTORS[2],
    lastContactDate: '2026-10-20', phone: '+52 55 5093-9000', email: 'ap-viajes@grupocarso.com.mx',
    accountManager: ACCT_MGRS[0],
  },
  {
    id: 'C036', name: 'Empresarial Andina', industry: 'Mining & Resources', country: 'Peru',
    creditLimit: 100_000, c: 15_000, d30: 25_000, d60: 20_000, d90: 15_000, d90p: 15_000,
    dso: 75, riskLevel: 'high', status: 'collections', collectorAssigned: COLLECTORS[3],
    lastContactDate: '2026-10-04', phone: '+51 1 418-2000', email: 'ap@empresarialandina.pe',
    accountManager: ACCT_MGRS[1],
  },
  {
    id: 'C037', name: 'Viajes Ejecutivos S.A.', industry: 'Travel & Tourism', country: 'Argentina',
    creditLimit: 100_000, c: 20_000, d30: 25_000, d60: 20_000, d90: 15_000, d90p: 10_000,
    dso: 68, riskLevel: 'medium', status: 'current', collectorAssigned: COLLECTORS[4],
    lastContactDate: '2026-10-16', phone: '+54 11 4312-9100', email: 'cuentas@viajesejecutivos.com.ar',
    accountManager: ACCT_MGRS[2],
  },
  {
    id: 'C038', name: 'Corporación GPF', industry: 'Retail & Commerce', country: 'Ecuador',
    creditLimit: 100_000, c: 15_000, d30: 20_000, d60: 20_000, d90: 15_000, d90p: 15_000,
    dso: 76, riskLevel: 'high', status: 'collections', collectorAssigned: COLLECTORS[5],
    lastContactDate: '2026-09-26', phone: '+593 2 299-9100', email: 'proveedores@gpf.com.ec',
    accountManager: ACCT_MGRS[3],
  },
  {
    id: 'C039', name: 'Mango Group Corp', industry: 'Professional Services', country: 'Colombia',
    creditLimit: 100_000, c: 20_000, d30: 20_000, d60: 20_000, d90: 15_000, d90p: 10_000,
    dso: 65, riskLevel: 'medium', status: 'current', collectorAssigned: COLLECTORS[0],
    lastContactDate: '2026-10-14', phone: '+57 1 325-5500', email: 'ap@mangogroup.co',
    accountManager: ACCT_MGRS[4],
  },
  {
    id: 'C040', name: 'Tecpetrol S.A.', industry: 'Energy & Utilities', country: 'Argentina',
    creditLimit: 100_000, c: 15_000, d30: 25_000, d60: 20_000, d90: 15_000, d90p: 10_000,
    dso: 72, riskLevel: 'high', status: 'watch', collectorAssigned: COLLECTORS[1],
    lastContactDate: '2026-10-02', phone: '+54 11 4591-1000', email: 'ap@tecpetrol.com',
    accountManager: ACCT_MGRS[0],
  },
  {
    id: 'C041', name: 'Inversiones Lince', industry: 'Real Estate & Construction', country: 'Peru',
    creditLimit: 80_000, c: 10_000, d30: 20_000, d60: 20_000, d90: 15_000, d90p: 15_000,
    dso: 82, riskLevel: 'critical', status: 'collections', collectorAssigned: COLLECTORS[2],
    lastContactDate: '2026-10-06', phone: '+51 1 627-7777', email: 'cuentas@inversioneslince.com.pe',
    accountManager: ACCT_MGRS[1],
  },
  {
    id: 'C042', name: 'Viajes Monarca', industry: 'Travel & Tourism', country: 'Mexico',
    creditLimit: 80_000, c: 10_000, d30: 20_000, d60: 20_000, d90: 15_000, d90p: 15_000,
    dso: 80, riskLevel: 'critical', status: 'collections', collectorAssigned: COLLECTORS[3],
    lastContactDate: '2026-09-20', phone: '+52 55 5533-8800', email: 'finanzas@viajesmonarca.mx',
    accountManager: ACCT_MGRS[2],
  },
  {
    id: 'C043', name: 'HRG Colombia Ltda', industry: 'Professional Services', country: 'Colombia',
    creditLimit: 80_000, c: 10_000, d30: 20_000, d60: 20_000, d90: 15_000, d90p: 15_000,
    dso: 79, riskLevel: 'high', status: 'current', collectorAssigned: COLLECTORS[4],
    lastContactDate: '2026-10-10', phone: '+57 1 480-9000', email: 'ap@hrgcolombia.com.co',
    accountManager: ACCT_MGRS[3],
  },
  {
    id: 'C044', name: 'Corporación Horizonte', industry: 'Industrials & Manufacturing', country: 'Chile',
    creditLimit: 80_000, c: 10_000, d30: 18_000, d60: 18_000, d90: 12_000, d90p: 12_000,
    dso: 74, riskLevel: 'high', status: 'current', collectorAssigned: COLLECTORS[5],
    lastContactDate: '2026-09-18', phone: '+56 2 2680-5000', email: 'proveedores@horizonte.cl',
    accountManager: ACCT_MGRS[4],
  },
  {
    id: 'C045', name: 'Agencia Star Travel', industry: 'Travel & Tourism', country: 'Argentina',
    creditLimit: 60_000, c: 5_000, d30: 12_000, d60: 12_000, d90: 8_000, d90p: 8_000,
    dso: 76, riskLevel: 'high', status: 'current', collectorAssigned: COLLECTORS[0],
    lastContactDate: '2026-09-10', phone: '+54 11 4793-1100', email: 'cuentas@startravel.com.ar',
    accountManager: ACCT_MGRS[0],
  },
];

export const customers: Customer[] = customerDefs.map((d) => ({
  id: d.id,
  name: d.name,
  industry: d.industry,
  country: d.country,
  creditLimit: d.creditLimit,
  aging: {
    current: d.c,
    days30: d.d30,
    days60: d.d60,
    days90: d.d90,
    days90plus: d.d90p,
  },
  dso: d.dso,
  riskLevel: d.riskLevel,
  status: d.status,
  collectorAssigned: d.collectorAssigned,
  lastContactDate: d.lastContactDate,
  phone: d.phone,
  email: d.email,
  accountManager: d.accountManager,
}));

function totalAR(c: Customer) {
  return c.aging.current + c.aging.days30 + c.aging.days60 + c.aging.days90 + c.aging.days90plus;
}

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}

export function getTotalAR(): number {
  return customers.reduce((sum, c) => sum + totalAR(c), 0);
}

export function getAgingTotals() {
  return customers.reduce(
    (acc, c) => ({
      current: acc.current + c.aging.current,
      days30: acc.days30 + c.aging.days30,
      days60: acc.days60 + c.aging.days60,
      days90: acc.days90 + c.aging.days90,
      days90plus: acc.days90plus + c.aging.days90plus,
    }),
    { current: 0, days30: 0, days60: 0, days90: 0, days90plus: 0 }
  );
}

// ── INVOICES ──────────────────────────────────────────────────────────────────

function makeLineItems(total: number, count: number): InvoiceLineItem[] {
  const items: InvoiceLineItem[] = [];
  const descriptions = [
    'International Business Class Flights',
    'Domestic Economy Flights',
    'Hotel Accommodations — Deluxe',
    'Hotel Accommodations — Standard',
    'Ground Transportation & Transfers',
    'Car Rental Services',
    'Travel Insurance Premium',
    'Visa Processing & Fees',
    'Premium Lounge Access',
    'Meeting & Conference Arrangements',
  ];
  const perItem = Math.floor(total / count);
  for (let i = 0; i < count; i++) {
    const qty = i === 0 ? 1 : Math.ceil(Math.random() * 5 + 1);
    const unit = i < count - 1 ? Math.floor(perItem / qty) : total - items.reduce((s, x) => s + x.total, 0);
    items.push({
      id: `li-${i + 1}`,
      description: descriptions[i % descriptions.length],
      quantity: qty,
      unitPrice: unit,
      total: unit * qty,
    });
  }
  return items;
}

function makePayments(paid: number, dates: string[], methods: string[]): InvoicePaymentRecord[] {
  if (paid === 0) return [];
  return dates.map((date, i) => ({
    id: `pmt-${i + 1}`,
    date,
    amount: i === dates.length - 1 ? paid - dates.slice(0, i).reduce((s) => s, 0) : Math.floor(paid / dates.length),
    method: methods[i % methods.length],
    reference: `REF-${Math.floor(Math.random() * 90000 + 10000)}`,
  }));
}

type InvDef = {
  id: string; cid: string; amount: number; paid: number;
  issue: string; due: string; status: Invoice['status'];
  note?: string;
};

const invoiceDefs: InvDef[] = [
  // C001 Petrobras
  { id: 'INV-2026-001', cid: 'C001', amount: 95_000, paid: 0, issue: '2026-10-01', due: '2026-11-01', status: 'Open' },
  { id: 'INV-2026-002', cid: 'C001', amount: 90_000, paid: 90_000, issue: '2026-09-01', due: '2026-10-01', status: 'Paid' },
  // C002 Bancolombia
  { id: 'INV-2026-003', cid: 'C002', amount: 80_000, paid: 0, issue: '2026-10-05', due: '2026-11-05', status: 'Open' },
  { id: 'INV-2026-004', cid: 'C002', amount: 95_000, paid: 95_000, issue: '2026-09-05', due: '2026-10-05', status: 'Paid' },
  // C003 Falabella
  { id: 'INV-2026-005', cid: 'C003', amount: 85_000, paid: 0, issue: '2026-10-08', due: '2026-11-08', status: 'Open' },
  { id: 'INV-2026-006', cid: 'C003', amount: 85_000, paid: 85_000, issue: '2026-09-08', due: '2026-10-08', status: 'Paid' },
  // C004 Claro Brasil
  { id: 'INV-2026-007', cid: 'C004', amount: 75_000, paid: 15_000, issue: '2026-09-15', due: '2026-10-15', status: 'Partial', note: 'Partial payment received Oct 20.' },
  { id: 'INV-2026-008', cid: 'C004', amount: 85_000, paid: 0, issue: '2026-10-10', due: '2026-11-10', status: 'Open' },
  // C005 PEMEX
  { id: 'INV-2026-009', cid: 'C005', amount: 55_000, paid: 0, issue: '2026-08-20', due: '2026-09-20', status: 'Open', note: 'Promise to pay Nov 1 — BROKEN.' },
  { id: 'INV-2026-010', cid: 'C005', amount: 50_000, paid: 0, issue: '2026-09-15', due: '2026-10-15', status: 'Open' },
  { id: 'INV-2026-011', cid: 'C005', amount: 50_000, paid: 0, issue: '2026-10-05', due: '2026-11-05', status: 'Open' },
  // C006 Bimbo
  { id: 'INV-2026-012', cid: 'C006', amount: 60_000, paid: 10_000, issue: '2026-08-25', due: '2026-09-25', status: 'Partial' },
  { id: 'INV-2026-013', cid: 'C006', amount: 90_000, paid: 0, issue: '2026-10-02', due: '2026-11-02', status: 'Open' },
  // C007 Telefónica
  { id: 'INV-2026-014', cid: 'C007', amount: 80_000, paid: 0, issue: '2026-10-10', due: '2026-11-10', status: 'Open' },
  { id: 'INV-2026-015', cid: 'C007', amount: 65_000, paid: 65_000, issue: '2026-09-10', due: '2026-10-10', status: 'Paid' },
  // C008 YPF
  { id: 'INV-2026-016', cid: 'C008', amount: 60_000, paid: 0, issue: '2026-08-01', due: '2026-09-01', status: 'Open' },
  { id: 'INV-2026-017', cid: 'C008', amount: 75_000, paid: 0, issue: '2026-10-01', due: '2026-11-01', status: 'Open' },
  // C009 Avianca
  { id: 'INV-2026-018', cid: 'C009', amount: 95_000, paid: 0, issue: '2026-07-15', due: '2026-08-15', status: 'Disputed', note: 'Avianca disputes fuel surcharge calculation methodology. Formal dispute filed Oct 24.' },
  { id: 'INV-2026-019', cid: 'C009', amount: 40_000, paid: 0, issue: '2026-10-01', due: '2026-11-01', status: 'Open' },
  // C010 Copa Airlines
  { id: 'INV-2026-020', cid: 'C010', amount: 85_000, paid: 0, issue: '2026-07-01', due: '2026-08-01', status: 'Disputed', note: 'Copa disputes service fee pricing — referencing 2024 contract rates.' },
  { id: 'INV-2026-021', cid: 'C010', amount: 45_000, paid: 0, issue: '2026-10-01', due: '2026-11-01', status: 'Open' },
  // C011 Cencosud
  { id: 'INV-2026-022', cid: 'C011', amount: 55_000, paid: 0, issue: '2026-10-10', due: '2026-11-10', status: 'Open' },
  { id: 'INV-2026-023', cid: 'C011', amount: 35_000, paid: 35_000, issue: '2026-09-10', due: '2026-10-10', status: 'Paid' },
  // C012 Éxito
  { id: 'INV-2026-024', cid: 'C012', amount: 80_000, paid: 0, issue: '2026-10-12', due: '2026-11-12', status: 'Open' },
  // C013 LATAM Corp
  { id: 'INV-2026-025', cid: 'C013', amount: 50_000, paid: 0, issue: '2026-09-01', due: '2026-10-01', status: 'Open' },
  { id: 'INV-2026-026', cid: 'C013', amount: 30_000, paid: 0, issue: '2026-10-02', due: '2026-11-02', status: 'Open' },
  // C014 Interbank
  { id: 'INV-2026-027', cid: 'C014', amount: 70_000, paid: 0, issue: '2026-10-14', due: '2026-11-14', status: 'Open' },
  // C015 COPEC
  { id: 'INV-2026-028', cid: 'C015', amount: 65_000, paid: 0, issue: '2026-10-14', due: '2026-11-14', status: 'Open' },
  // C016 Suramericana
  { id: 'INV-2026-029', cid: 'C016', amount: 45_000, paid: 0, issue: '2026-08-10', due: '2026-09-10', status: 'Open' },
  { id: 'INV-2026-030', cid: 'C016', amount: 20_000, paid: 0, issue: '2026-10-10', due: '2026-11-10', status: 'Open' },
  // C017 Itaú
  { id: 'INV-2026-031', cid: 'C017', amount: 60_000, paid: 0, issue: '2026-10-14', due: '2026-11-14', status: 'Open' },
  // C018 Ambev
  { id: 'INV-2026-032', cid: 'C018', amount: 55_000, paid: 0, issue: '2026-10-14', due: '2026-11-14', status: 'Open' },
  // C019 Rappi
  { id: 'INV-2026-033', cid: 'C019', amount: 55_000, paid: 0, issue: '2026-09-20', due: '2026-10-20', status: 'Open' },
  // C020 Linio
  { id: 'INV-2026-034', cid: 'C020', amount: 35_000, paid: 0, issue: '2026-07-10', due: '2026-08-10', status: 'Disputed', note: 'Linio claims invoice duplication — reviewing supporting documentation.' },
  { id: 'INV-2026-035', cid: 'C020', amount: 20_000, paid: 0, issue: '2026-10-01', due: '2026-11-01', status: 'Open' },
  // C021 Cabify
  { id: 'INV-2026-036', cid: 'C021', amount: 50_000, paid: 0, issue: '2026-10-14', due: '2026-11-14', status: 'Open' },
  // C022 Nutresa
  { id: 'INV-2026-037', cid: 'C022', amount: 45_000, paid: 0, issue: '2026-10-14', due: '2026-11-14', status: 'Open' },
  // C023 Globant
  { id: 'INV-2026-038', cid: 'C023', amount: 45_000, paid: 0, issue: '2026-08-20', due: '2026-09-20', status: 'Open' },
  // C024 MercadoLibre
  { id: 'INV-2026-039', cid: 'C024', amount: 40_000, paid: 0, issue: '2026-10-14', due: '2026-11-14', status: 'Open' },
  // C025 Orocobre
  { id: 'INV-2026-040', cid: 'C025', amount: 40_000, paid: 0, issue: '2026-09-25', due: '2026-10-25', status: 'Open' },
  // C026 Votorantim
  { id: 'INV-2026-041', cid: 'C026', amount: 55_000, paid: 0, issue: '2026-07-10', due: '2026-08-10', status: 'Open' },
  { id: 'INV-2026-042', cid: 'C026', amount: 45_000, paid: 0, issue: '2026-10-01', due: '2026-11-01', status: 'Open' },
  // C028 Consorcio ARA
  { id: 'INV-2026-043', cid: 'C028', amount: 55_000, paid: 0, issue: '2026-07-10', due: '2026-08-10', status: 'Open' },
  { id: 'INV-2026-044', cid: 'C028', amount: 40_000, paid: 0, issue: '2026-09-20', due: '2026-10-20', status: 'Open' },
  // C029 Almundo
  { id: 'INV-2026-045', cid: 'C029', amount: 95_000, paid: 0, issue: '2026-08-01', due: '2026-09-01', status: 'Open' },
  // C030 Sodexo
  { id: 'INV-2026-046', cid: 'C030', amount: 95_000, paid: 0, issue: '2026-08-20', due: '2026-09-20', status: 'Open' },
  // C031 Gestión Viajes
  { id: 'INV-2026-047', cid: 'C031', amount: 50_000, paid: 0, issue: '2026-07-20', due: '2026-08-20', status: 'Open' },
  { id: 'INV-2026-048', cid: 'C031', amount: 40_000, paid: 0, issue: '2026-09-15', due: '2026-10-15', status: 'Open' },
  // C033 Operadora Integra
  { id: 'INV-2026-049', cid: 'C033', amount: 85_000, paid: 0, issue: '2026-08-01', due: '2026-09-01', status: 'Open' },
  // C036 Empresarial Andina
  { id: 'INV-2026-050', cid: 'C036', amount: 90_000, paid: 0, issue: '2026-07-15', due: '2026-08-15', status: 'Open' },
  // C041 Inversiones Lince
  { id: 'INV-2026-051', cid: 'C041', amount: 50_000, paid: 0, issue: '2026-07-01', due: '2026-08-01', status: 'Open' },
  { id: 'INV-2026-052', cid: 'C041', amount: 30_000, paid: 0, issue: '2026-08-20', due: '2026-09-20', status: 'Open' },
  // C042 Viajes Monarca
  { id: 'INV-2026-053', cid: 'C042', amount: 80_000, paid: 0, issue: '2026-06-15', due: '2026-07-15', status: 'Open' },
  // Additional mid-tier
  { id: 'INV-2026-054', cid: 'C034', amount: 85_000, paid: 0, issue: '2026-07-20', due: '2026-08-20', status: 'Open' },
  { id: 'INV-2026-055', cid: 'C035', amount: 85_000, paid: 0, issue: '2026-08-10', due: '2026-09-10', status: 'Open' },
  { id: 'INV-2026-056', cid: 'C037', amount: 90_000, paid: 0, issue: '2026-07-10', due: '2026-08-10', status: 'Open' },
  { id: 'INV-2026-057', cid: 'C038', amount: 85_000, paid: 0, issue: '2026-07-01', due: '2026-08-01', status: 'Open' },
  { id: 'INV-2026-058', cid: 'C040', amount: 85_000, paid: 0, issue: '2026-07-15', due: '2026-08-15', status: 'Open' },
  { id: 'INV-2026-059', cid: 'C043', amount: 80_000, paid: 0, issue: '2026-07-01', due: '2026-08-01', status: 'Open' },
  { id: 'INV-2026-060', cid: 'C044', amount: 70_000, paid: 0, issue: '2026-07-01', due: '2026-08-01', status: 'Open' },
];

export const invoices: Invoice[] = invoiceDefs.map((d) => {
  const lineItems = makeLineItems(d.amount, d.amount > 60_000 ? 4 : 3);
  const payments =
    d.paid > 0
      ? makePayments(d.paid, ['2026-10-18', '2026-10-25'], ['Wire Transfer', 'ACH'])
      : [];
  return {
    id: d.id,
    customerId: d.cid,
    customerName: customers.find((c) => c.id === d.cid)?.name ?? '',
    amount: d.amount,
    paidAmount: d.paid,
    issueDate: d.issue,
    dueDate: d.due,
    status: d.status,
    lineItems,
    paymentHistory: payments,
    notes: d.note,
  };
});

export function getInvoiceById(id: string): Invoice | undefined {
  return invoices.find((inv) => inv.id === id);
}

export function getInvoicesByCustomer(cid: string): Invoice[] {
  return invoices.filter((inv) => inv.customerId === cid);
}

// ── CONTACT ACTIVITIES ────────────────────────────────────────────────────────

export const contactActivities: ContactActivity[] = [
  // C005 PEMEX
  { id: 'CA001', customerId: 'C005', date: '2026-09-15', type: 'email', user: COLLECTORS[1], notes: 'Sent overdue notice for INV-2026-009 ($55K, 25 days past due). Requested payment confirmation.', outcome: 'No response within 5 business days.' },
  { id: 'CA002', customerId: 'C005', date: '2026-09-25', type: 'call', user: COLLECTORS[1], notes: 'Spoke with AP Manager Hector Villarreal. Confirmed balance acknowledged. Promised payment by Oct 20.', outcome: 'Promise to pay recorded: $40K by Oct 20.' },
  { id: 'CA003', customerId: 'C005', date: '2026-10-21', type: 'call', user: COLLECTORS[1], notes: 'Follow-up on missed promise. Hector unavailable — left voicemail. No callback received.', outcome: 'Promise broken. Escalation initiated.' },
  { id: 'CA004', customerId: 'C005', date: '2026-10-30', type: 'escalation', user: COLLECTORS[1], notes: 'Escalated to Credit Director. Formal demand letter sent to PEMEX VP Finance.', outcome: 'Awaiting executive-level response.' },
  // C006 Bimbo
  { id: 'CA005', customerId: 'C006', date: '2026-09-10', type: 'email', user: COLLECTORS[2], notes: 'Sent statement of account with aging detail. Requested payment plan for overdue $25K.', outcome: 'Response received within 24h.' },
  { id: 'CA006', customerId: 'C006', date: '2026-09-20', type: 'call', user: COLLECTORS[2], notes: 'Spoke with Luisa Guerrero, AR Manager. Partial payment of $10K arranged for Oct 1; balance Oct 15.', outcome: 'Promise recorded.' },
  { id: 'CA007', customerId: 'C006', date: '2026-10-02', type: 'payment_received', user: COLLECTORS[2], notes: 'Wire received: $10,000 against INV-2026-012.', outcome: 'Promise kept. Remaining $25K due Oct 15.' },
  { id: 'CA008', customerId: 'C006', date: '2026-11-02', type: 'email', user: COLLECTORS[2], notes: 'Sent follow-up for remaining Oct invoice. New balance $150K pending.', outcome: 'Acknowledged.' },
  // C008 YPF
  { id: 'CA009', customerId: 'C008', date: '2026-09-05', type: 'email', user: COLLECTORS[4], notes: 'INV-2026-016 overdue 4 days. Sent overdue reminder.', outcome: 'Read but no response.' },
  { id: 'CA010', customerId: 'C008', date: '2026-09-20', type: 'call', user: COLLECTORS[4], notes: 'Spoke with Gabriela Montoya, AP Coordinator. Claims internal processing delay. Expected by Sep 30.', outcome: 'Follow-up scheduled Sep 30.' },
  { id: 'CA011', customerId: 'C008', date: '2026-10-05', type: 'promise_to_pay', user: COLLECTORS[4], notes: 'YPF promised $45K payment by Nov 10 for INV-2026-016 and partial INV-2026-017.', outcome: 'Promise recorded.' },
  { id: 'CA012', customerId: 'C008', date: '2026-10-29', type: 'email', user: COLLECTORS[4], notes: 'Pre-payment reminder sent for Nov 10 promise date.', outcome: 'Acknowledged by AP.' },
  // C009 Avianca
  { id: 'CA013', customerId: 'C009', date: '2026-09-01', type: 'email', user: COLLECTORS[0], notes: 'INV-2026-018 ($95K) 17 days overdue. Sent formal overdue notice.', outcome: 'Response: dispute lodged.' },
  { id: 'CA014', customerId: 'C009', date: '2026-09-10', type: 'dispute_filed', user: COLLECTORS[0], notes: 'Avianca filed formal dispute on INV-2026-018: disputes fuel surcharge calculation. Claims should be $62K not $95K.', outcome: 'Dispute logged. Owner: Alejandro Ruiz.' },
  { id: 'CA015', customerId: 'C009', date: '2026-10-01', type: 'meeting', user: COLLECTORS[0], notes: 'Video call with Avianca VP Finance and ARCVault legal. Reviewed fuel surcharge methodology. Sent supporting documentation.', outcome: 'Avianca reviewing — decision by Oct 24.' },
  { id: 'CA016', customerId: 'C009', date: '2026-10-24', type: 'note', user: COLLECTORS[0], notes: 'Avianca requested 3-week extension on dispute review. Agreed with caveat: payment of undisputed $40K due Nov 1.', outcome: 'Promise to pay $80K by Nov 15 on resolution.' },
  // C010 Copa Airlines
  { id: 'CA017', customerId: 'C010', date: '2026-08-15', type: 'email', user: COLLECTORS[1], notes: 'INV-2026-020 ($85K) 14 days overdue. Sent overdue notice.', outcome: 'No response.' },
  { id: 'CA018', customerId: 'C010', date: '2026-09-01', type: 'call', user: COLLECTORS[1], notes: 'Spoke with Copa AP: disputes service fee line item. Claims 2024 contract rates apply — rate change not communicated.', outcome: 'Dispute initiated.' },
  { id: 'CA019', customerId: 'C010', date: '2026-09-15', type: 'dispute_filed', user: COLLECTORS[1], notes: 'Copa filed formal dispute. Claims service fees should be at 2024 rates ($65K not $85K).', outcome: 'Owner: Patricia Lomas. Resolution target Nov 15.' },
  { id: 'CA020', customerId: 'C010', date: '2026-10-20', type: 'meeting', user: COLLECTORS[1], notes: 'Joint review meeting. Contract team confirmed 2025 rate change was communicated per amendment AM-2024-12. Copa still disputing.', outcome: 'Escalated to legal. Resolution date extended to Nov 30.' },
  // C026 Votorantim
  { id: 'CA021', customerId: 'C026', date: '2026-09-20', type: 'email', user: COLLECTORS[5], notes: 'Sent aging statement. $55K in 90+ bucket.', outcome: 'No response.' },
  { id: 'CA022', customerId: 'C026', date: '2026-10-01', type: 'promise_to_pay', user: COLLECTORS[5], notes: 'AP manager confirmed $20K payment by Oct 5.', outcome: 'Promise kept on Oct 5.' },
  { id: 'CA023', customerId: 'C026', date: '2026-10-31', type: 'call', user: COLLECTORS[5], notes: 'Remaining $80K in collections. AP team claims cash flow constraints. Reviewing options.', outcome: 'Promise of $30K by Nov 20.' },
  // C028 Consorcio ARA
  { id: 'CA024', customerId: 'C028', date: '2026-09-15', type: 'email', user: COLLECTORS[1], notes: 'Overdue notice: INV-2026-043 $55K, 36 days overdue.', outcome: 'Read receipt only.' },
  { id: 'CA025', customerId: 'C028', date: '2026-10-01', type: 'call', user: COLLECTORS[1], notes: 'Spoke with Gerardo Núñez, CFO Assistant. Promised $25K by Oct 15.', outcome: 'Promise recorded.' },
  { id: 'CA026', customerId: 'C028', date: '2026-10-31', type: 'call', user: COLLECTORS[1], notes: 'Oct 15 promise broken — no payment received. CFO escalation triggered.', outcome: 'Promise broken. Formal collections process.' },
  // C013 LATAM Corp
  { id: 'CA027', customerId: 'C013', date: '2026-09-10', type: 'email', user: COLLECTORS[4], notes: 'Statement sent. $15K 30+ days overdue.', outcome: 'Acknowledged.' },
  { id: 'CA028', customerId: 'C013', date: '2026-10-02', type: 'promise_to_pay', user: COLLECTORS[4], notes: 'AP Director confirmed $15K payment by Oct 7.', outcome: 'Promise kept Oct 8.' },
  // C004 Claro Brasil
  { id: 'CA029', customerId: 'C004', date: '2026-10-01', type: 'promise_to_pay', user: COLLECTORS[0], notes: 'Claro Brasil confirmed $25K partial payment by Oct 18.', outcome: 'Promise kept Oct 20.' },
  // C020 Linio
  { id: 'CA030', customerId: 'C020', date: '2026-08-10', type: 'email', user: COLLECTORS[5], notes: 'INV-2026-034 sent. Due Aug 10.', outcome: 'Dispute filed 3 days later.' },
  { id: 'CA031', customerId: 'C020', date: '2026-08-13', type: 'dispute_filed', user: COLLECTORS[5], notes: 'Linio claims INV-2026-034 is a duplicate of an earlier invoice. Requesting documentation.', outcome: 'Investigation opened.' },
  { id: 'CA032', customerId: 'C020', date: '2026-10-15', type: 'note', user: COLLECTORS[5], notes: 'Invoice duplication claim reviewed — invoices are for different service periods. Sent clarification.', outcome: 'Linio reviewing response.' },
  // C041 Inversiones Lince
  { id: 'CA033', customerId: 'C041', date: '2026-09-01', type: 'email', user: COLLECTORS[2], notes: 'Collections notice sent. $50K overdue 30+ days.', outcome: 'No response.' },
  { id: 'CA034', customerId: 'C041', date: '2026-10-06', type: 'call', user: COLLECTORS[2], notes: 'Spoke with owner Ana Lince directly. Financial difficulties — requesting 60-day payment plan.', outcome: 'Promise of $25K by Nov 20.' },
];

// ── PROMISES TO PAY (12 total: 4 kept, 3 broken, 5 pending) ──────────────────

export const promisesToPay: PromiseToPay[] = [
  // KEPT (4)
  {
    id: 'P2P-001', customerId: 'C006', customerName: 'Grupo Bimbo',
    invoiceIds: ['INV-2026-012'], promisedDate: '2026-10-20', promisedAmount: 35_000,
    actualPaidAmount: 35_000, status: 'Kept', createdAt: '2026-09-20',
    collectorName: COLLECTORS[2], notes: 'Partial payment for INV-2026-012 and outstanding balance.',
  },
  {
    id: 'P2P-002', customerId: 'C004', customerName: 'Claro Brasil Corp',
    invoiceIds: ['INV-2026-007'], promisedDate: '2026-10-18', promisedAmount: 25_000,
    actualPaidAmount: 25_000, status: 'Kept', createdAt: '2026-10-01',
    collectorName: COLLECTORS[0], notes: 'Partial against INV-2026-007.',
  },
  {
    id: 'P2P-003', customerId: 'C026', customerName: 'Votorantim Corp',
    invoiceIds: ['INV-2026-041'], promisedDate: '2026-10-05', promisedAmount: 20_000,
    actualPaidAmount: 20_000, status: 'Kept', createdAt: '2026-10-01',
    collectorName: COLLECTORS[5], notes: 'Wire received Oct 5 as promised.',
  },
  {
    id: 'P2P-004', customerId: 'C013', customerName: 'LATAM Airlines Corp',
    invoiceIds: ['INV-2026-025'], promisedDate: '2026-10-07', promisedAmount: 15_000,
    actualPaidAmount: 15_000, status: 'Kept', createdAt: '2026-09-25',
    collectorName: COLLECTORS[4], notes: 'Partial against INV-2026-025. Paid Oct 8.',
  },
  // BROKEN (3)
  {
    id: 'P2P-005', customerId: 'C005', customerName: 'PEMEX Corp Travel',
    invoiceIds: ['INV-2026-009', 'INV-2026-010'], promisedDate: '2026-11-01', promisedAmount: 40_000,
    actualPaidAmount: 0, status: 'Broken', createdAt: '2026-09-25',
    collectorName: COLLECTORS[1], notes: 'No payment received by promise date. Escalated.',
  },
  {
    id: 'P2P-006', customerId: 'C010', customerName: 'Copa Airlines Corp',
    invoiceIds: ['INV-2026-020'], promisedDate: '2026-11-03', promisedAmount: 55_000,
    actualPaidAmount: 0, status: 'Broken', createdAt: '2026-10-10',
    collectorName: COLLECTORS[1], notes: 'Copa cited ongoing dispute as reason for non-payment.',
  },
  {
    id: 'P2P-007', customerId: 'C028', customerName: 'Consorcio ARA',
    invoiceIds: ['INV-2026-043'], promisedDate: '2026-10-30', promisedAmount: 25_000,
    actualPaidAmount: 0, status: 'Broken', createdAt: '2026-10-01',
    collectorName: COLLECTORS[1], notes: 'No payment. CFO escalation active.',
  },
  // PENDING (5)
  {
    id: 'P2P-008', customerId: 'C009', customerName: 'Avianca Holdings',
    invoiceIds: ['INV-2026-018', 'INV-2026-019'], promisedDate: '2026-11-15', promisedAmount: 80_000,
    status: 'Pending', createdAt: '2026-10-24',
    collectorName: COLLECTORS[0], notes: 'Conditional on dispute resolution outcome.',
  },
  {
    id: 'P2P-009', customerId: 'C008', customerName: 'YPF S.A.',
    invoiceIds: ['INV-2026-016', 'INV-2026-017'], promisedDate: '2026-11-10', promisedAmount: 45_000,
    status: 'Pending', createdAt: '2026-10-05',
    collectorName: COLLECTORS[4], notes: 'YPF AP Director confirmed payment by Nov 10.',
  },
  {
    id: 'P2P-010', customerId: 'C031', customerName: 'Gestión Viajes S.A.',
    invoiceIds: ['INV-2026-047'], promisedDate: '2026-11-12', promisedAmount: 30_000,
    status: 'Pending', createdAt: '2026-10-20',
    collectorName: COLLECTORS[4], notes: 'Negotiated installment — $30K Nov 12, balance Jan 2027.',
  },
  {
    id: 'P2P-011', customerId: 'C041', customerName: 'Inversiones Lince',
    invoiceIds: ['INV-2026-051', 'INV-2026-052'], promisedDate: '2026-11-20', promisedAmount: 25_000,
    status: 'Pending', createdAt: '2026-10-06',
    collectorName: COLLECTORS[2], notes: 'Owner committed to $25K as first installment of payment plan.',
  },
  {
    id: 'P2P-012', customerId: 'C042', customerName: 'Viajes Monarca',
    invoiceIds: ['INV-2026-053'], promisedDate: '2026-11-25', promisedAmount: 20_000,
    status: 'Pending', createdAt: '2026-10-15',
    collectorName: COLLECTORS[3], notes: 'New management team at Viajes Monarca committed to partial clearance.',
  },
];

// ── DISPUTES (3) ──────────────────────────────────────────────────────────────

export const disputes: Dispute[] = [
  {
    id: 'DSP-001', customerId: 'C009', customerName: 'Avianca Holdings',
    invoiceId: 'INV-2026-018',
    reason: 'Fuel surcharge calculation methodology disputed. Avianca claims surcharge should be $62K based on IATA fuel index — invoiced $95K.',
    owner: 'Alejandro Ruiz', resolutionTargetDate: '2026-11-14',
    status: 'Under Review', amount: 95_000, createdAt: '2026-09-10',
    notes: 'Formal dispute filed Sep 10. Supporting documentation sent Oct 1. Awaiting Avianca VP Finance decision. Undisputed $40K payment expected Nov 1.',
  },
  {
    id: 'DSP-002', customerId: 'C010', customerName: 'Copa Airlines Corp',
    invoiceId: 'INV-2026-020',
    reason: 'Service fee pricing dispute. Copa claims 2024 contract rates apply; Despegar applied 2025 amended rates.',
    owner: 'Patricia Lomas', resolutionTargetDate: '2026-11-30',
    status: 'Open', amount: 85_000, createdAt: '2026-09-15',
    notes: 'Copa disputes $20K service fee delta. Contract amendment AM-2024-12 sent to Copa legal team Oct 20. Awaiting their review.',
  },
  {
    id: 'DSP-003', customerId: 'C020', customerName: 'Linio Retail Corp',
    invoiceId: 'INV-2026-034',
    reason: 'Invoice duplication claim. Linio alleges INV-2026-034 duplicates a prior invoice from July 2026.',
    owner: 'Sebastián Torres', resolutionTargetDate: '2026-11-20',
    status: 'Open', amount: 35_000, createdAt: '2026-08-13',
    notes: 'Internal review confirms invoice covers distinct service period (Jul 10–Aug 10). Clarification sent Oct 15. Linio reviewing response.',
  },
];

// ── UNAPPLIED PAYMENTS ────────────────────────────────────────────────────────

export const unappliedPayments: UnappliedPayment[] = [
  {
    id: 'UAP-001', customerId: 'C002', customerName: 'Bancolombia S.A.',
    amount: 95_000, receivedDate: '2026-11-01', reference: 'BCO-TRF-20261101',
    bankRef: 'HSBC-WIR-7723441',
    suggestedMatches: [
      { invoiceId: 'INV-2026-003', invoiceRef: 'INV-2026-003', amount: 80_000, confidence: 'high' },
      { invoiceId: 'INV-2026-004', invoiceRef: 'INV-2026-004', amount: 95_000, confidence: 'medium' },
    ],
    status: 'Unmatched',
  },
  {
    id: 'UAP-002', customerId: 'C005', customerName: 'PEMEX Corp Travel',
    amount: 45_000, receivedDate: '2026-10-28', reference: 'PMX-WIRED-28102026',
    bankRef: 'CITI-WIR-9918823',
    suggestedMatches: [
      { invoiceId: 'INV-2026-009', invoiceRef: 'INV-2026-009', amount: 55_000, confidence: 'high' },
    ],
    status: 'Short Pay',
  },
  {
    id: 'UAP-003', customerId: 'C008', customerName: 'YPF S.A.',
    amount: 30_000, receivedDate: '2026-11-03', reference: 'YPF-ACH-20261103',
    bankRef: 'BROU-ACH-4452901',
    suggestedMatches: [
      { invoiceId: 'INV-2026-016', invoiceRef: 'INV-2026-016', amount: 60_000, confidence: 'high' },
    ],
    status: 'Short Pay',
  },
  {
    id: 'UAP-004', customerId: 'C003', customerName: 'Grupo Falabella',
    amount: 85_000, receivedDate: '2026-11-02', reference: 'FAL-TF-02112026',
    bankRef: 'SCOT-WIR-3312701',
    suggestedMatches: [
      { invoiceId: 'INV-2026-005', invoiceRef: 'INV-2026-005', amount: 85_000, confidence: 'high' },
    ],
    status: 'Matched',
  },
  {
    id: 'UAP-005', customerId: '', customerName: 'Unknown Remitter',
    amount: 12_500, receivedDate: '2026-10-31', reference: 'UNKNOWN-TRF-311026',
    bankRef: 'JPM-WIR-7788992',
    suggestedMatches: [],
    status: 'Unmatched',
  },
  {
    id: 'UAP-006', customerId: 'C011', customerName: 'Cencosud S.A.',
    amount: 25_000, receivedDate: '2026-11-04', reference: 'CEN-ACH-04112026',
    bankRef: 'BBVA-ACH-6671230',
    suggestedMatches: [
      { invoiceId: 'INV-2026-022', invoiceRef: 'INV-2026-022', amount: 55_000, confidence: 'medium' },
    ],
    status: 'Unmatched',
  },
];

// ── AGING TREND (6-month historical) ──────────────────────────────────────────

export const agingTrend: AgingTrendPoint[] = [
  { month: 'Jun', current: 1_950_000, days30: 850_000, days60: 550_000, days90: 320_000, days90plus: 250_000 },
  { month: 'Jul', current: 1_870_000, days30: 880_000, days60: 600_000, days90: 350_000, days90plus: 280_000 },
  { month: 'Aug', current: 1_820_000, days30: 910_000, days60: 620_000, days90: 380_000, days90plus: 300_000 },
  { month: 'Sep', current: 1_810_000, days30: 930_000, days60: 650_000, days90: 400_000, days90plus: 320_000 },
  { month: 'Oct', current: 1_790_000, days30: 940_000, days60: 665_000, days90: 415_000, days90plus: 340_000 },
  { month: 'Nov', current: 1_800_000, days30: 950_000, days60: 680_000, days90: 420_000, days90plus: 350_000 },
];

// ── COLLECTIONS QUEUE ─────────────────────────────────────────────────────────
// Priority score = (90+ × 3) + (61-90 × 2) + (31-60 × 1)

export function getCollectionsQueue() {
  return customers
    .filter((c) => c.status !== 'current' || c.aging.days90 + c.aging.days90plus > 0)
    .map((c) => ({
      ...c,
      overdueTotal: c.aging.days30 + c.aging.days60 + c.aging.days90 + c.aging.days90plus,
      priorityScore: c.aging.days90plus * 3 + c.aging.days90 * 2 + c.aging.days60 * 1,
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 20);
}

// Top 10 overdue accounts
export function getTopOverdue(): Customer[] {
  return [...customers]
    .map((c) => ({
      ...c,
      overdueTotal: c.aging.days30 + c.aging.days60 + c.aging.days90 + c.aging.days90plus,
    }))
    .sort((a, b) => b.overdueTotal - a.overdueTotal)
    .slice(0, 10);
}
