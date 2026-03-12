## Goal
Add a Supplier & Debt Management module (Manager role) with dual-currency invoices, aging buckets, currency toggle, supplier statements, and a financial-style dashboard (table + bar chart).

## Scope & Touchpoints
- Frontend: `views/FMUManagerDashboard.tsx` (add new tab/section and UI), possibly `components/Sidebar.tsx` (tab entry), shared types in `types.ts`.
- State/storage: reuse localStorage pattern (other modules do) or extend existing API services later; implement in-memory + localStorage persistence for now.
- Backend (optional future): `server/php/db` schema/sql if syncing to SQLite; initial plan keeps client-side persistence to deliver feature quickly.

## Data Model (frontend)
- Invoice type: `{ id, supplierName, invoiceDate, originalAmount, currency: 'USD'|'SLL', exchangeRateAtEntry, status: 'Paid'|'Unpaid', payments: Payment[], createdAt }`
- Payment type for statements: `{ id, supplierName, date, amount, currency, exchangeRateAtEntry, reference }`
- Derived fields: `amountUSD`, `amountSLL` using `exchangeRateAtEntry`; `daysOutstanding` = (today - invoiceDate).
- Aging buckets: 0-30, 31-60, 61-90, 90+ days; totals per bucket per currency.
- Current exchange toggle: `currentExchangeRate` (SLL per USD); totals recalc using this rate for display.

## Features to build
1) **Manager Tab**: Add “Supplier & Debt” tab/section to Manager dashboard (slide/tab list). Visible only for Manager role.
2) **Invoice CRUD (minimal)**: Form to add invoice (fields above, default currency USD, rate required). Mark Paid/Unpaid.
3) **Aging Report Table**: Shows buckets, count, total per currency; status badges.
4) **Bar Chart**: Recharts bar chart “Debt by Supplier” using selected display currency (USD/SLL via toggle and currentExchangeRate).
5) **Currency Toggle**: Switch between USD/SLL display totals; uses per-invoice stored rate for original amounts; uses `currentExchangeRate` for cross-currency view.
6) **Supplier Statement View**: Select supplier -> chronological list of invoices (debits) and payments (credits) with running balance in display currency.
7) **Persistence**: localStorage keys `supplier_invoices` and `supplier_payments`; seed sample data for demo.

## UI/UX
- Financial dashboard style: neutral light background, cards, tables with badges for status (Paid/Unpaid), clear typography.
- Components: cards for KPIs (Total Debt, Paid %, Top Supplier), toggle buttons for currency, table for aging, bar chart for supplier concentration, statement table with running balance.

## Implementation Steps
1) Types: extend `types.ts` with Invoice and Payment interfaces + helper enums; export currency union.
2) Manager Dashboard:
   - Add tab entry in `FMUManagerDashboard.tsx` tabs list (e.g., `supplier-debt`).
   - Add state for invoices, payments, currency toggle, currentExchangeRate.
   - Load/save invoices/payments from localStorage; seed sample data if empty.
3) Helpers:
   - `calcDaysOutstanding(date)`, `bucketIndex(days)`; `sumByBucket(invoices, displayCurrency, currentRate)`.
   - `convertToDisplay(amount, currency, rateAtEntry, displayCurrency, currentRate)`.
4) UI blocks inside Manager tab:
   - Header with currency toggle + current rate input.
   - KPI cards.
   - Aging table (buckets rows, totals columns).
   - Bar chart using Recharts (supplier totals in display currency).
   - Statement panel: supplier select, running balance table of debits/credits.
   - Add invoice form (minimal fields) + optional add payment form.
5) Status badges: Paid (green), Unpaid (amber).
6) Wiring: on invoice add -> recompute state, persist, update charts/tables; same for payments.
7) Testing/Verification:
   - `npm run build` (vite) should pass.
   - Manually add sample invoices: check aging buckets and bar chart update.
   - Toggle currency and confirm totals convert with current rate.
   - Statement view shows running balance and Paid invoices reduce outstanding.

## Risks / Follow-ups
- No backend persistence yet; future could sync to SQLite via PHP APIs.
- Mixed static/dynamic imports warnings remain (pre-existing).
