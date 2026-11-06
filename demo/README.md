# LedgerPulse — Revenue Assurance Dashboard

Enterprise revenue leakage detection and reconciliation platform for Despegar Group's Finance & Revenue Assurance team.

## Features

- **Overview Dashboard** — KPI summary (total detected, open exposure, recovered, under review), 90-day leakage trend chart, category breakdown, high-priority alert list
- **Leakage Records** — Full table with search, multi-filter (status/category/priority), sortable columns, pagination
- **Record Detail** — Reconciliation data comparison, activity timeline, status update, note-adding, reassignment dialogs
- **Data Ingestion** — Simulated file upload (CSV/XML), ingestion run history, reconciliation trigger
- **Analytics** — Monthly detected vs recovered, category breakdown, top-10 supplier ranking, recovery rate trend
- **Settings** — Notification preferences, data source configuration, user profile

## Stack

- Vite 5 + React 18 + TypeScript 5
- Tailwind CSS 3
- React Router v6
- Recharts 2
- Radix UI primitives
- Lucide React icons

## Demo Data

60 realistic leakage records across 8 categories for Despegar Group's supplier ecosystem (LATAM Airlines, Avianca, Copa, Marriott, Hilton, AccorHotels, GDS systems, payment gateways). Data persists through refresh via localStorage. Use **Reset Demo** in the header to restore seed data.

## Demo Credentials

No authentication required — open the app to access all features as Veronica Jalife (Revenue Assurance Director).

## Setup

```bash
npm install
npm run dev        # Development server at http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build
```

## Deployment

Configured for Vercel SPA routing via `vercel.json`. Deploy with:

```bash
vercel --prod
```

## Assumptions

- Leakage amounts in USD (Despegar's operational reporting currency)
- 60-record seed dataset covering May–November 2026
- All supplier data, amounts, and booking references are realistic simulations for demo purposes
- Payment capture failures are simulated — no real payment processing occurs
