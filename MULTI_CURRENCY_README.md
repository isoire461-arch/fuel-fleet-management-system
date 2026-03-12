# Multi-Currency Transactions Implementation

## Overview
Complete multi-currency support has been integrated into the FUEL&FLEET system to handle transactions in USD (US Dollar), LE (Egyptian Pound), and SLL (Sierra Leone Leone).

## Supported Currencies

### 1. **USD - US Dollar**
- Symbol: `$`
- Decimal Places: 2
- Base currency for exchange rate calculations
- Primary currency for international suppliers

### 2. **LE - Egyptian Pound (EGP)**
- Symbol: `₊`
- Decimal Places: 2
- Used for local Egyptian suppliers
- Approximate exchange rate: 30 LE = 1 USD

### 3. **SLL - Sierra Leone Leone**
- Symbol: `Le`
- Decimal Places: 0 (whole numbers)
- Used for local Sierra Leone suppliers
- Approximate exchange rate: 21,500 SLL = 1 USD

## Implementation Details

### Currency Service (`services/currencyService.ts`)

The currency service provides utility functions for handling multi-currency transactions:

#### Exchange Rates
```typescript
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.0,      // Base currency
  LE: 30.0,      // Egyptian Pound
  SLL: 21500,    // Sierra Leone Leone
};
```

**Note:** Exchange rates are static in the current implementation. For production:
- Implement dynamic exchange rates from external API (e.g., Open Exchange Rates, XE.com)
- Update rates hourly or daily
- Cache rates with timestamp

#### Key Functions

##### `formatCurrency(amount: number, currency: Currency): string`
Formats an amount with proper currency symbol and decimal places.

**Examples:**
```typescript
formatCurrency(42500, Currency.USD)    // Returns: "$42,500.00"
formatCurrency(250000000, Currency.LE) // Returns: "₊250,000,000.00"
formatCurrency(750750000, Currency.SLL) // Returns: "Le750,750,000"
```

##### `convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number`
Converts amount between currencies using exchange rates.

**Examples:**
```typescript
convertCurrency(1000, Currency.USD, Currency.SLL)  // Returns: ~21,500,000
convertCurrency(30, Currency.LE, Currency.USD)     // Returns: 1
```

##### `getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number`
Gets the exchange rate between two currencies.

**Examples:**
```typescript
getExchangeRate(Currency.USD, Currency.SLL)  // Returns: 21500
getExchangeRate(Currency.LE, Currency.USD)   // Returns: 0.0333...
```

##### `formatCurrencyTable(amount: number | undefined, currency: Currency): string`
Formats currency for display in tables (handles undefined values).

##### `parseCurrencyInput(value: string): number`
Parses user input to extract numeric value (removes symbols).

**Examples:**
```typescript
parseCurrencyInput("$1,000.50")     // Returns: 1000.50
parseCurrencyInput("Le500,000")     // Returns: 500000
parseCurrencyInput("₊100,000.00")   // Returns: 100000
```

## Features Implemented

### 1. **Fuel Requests with Multi-Currency Support**

#### Creating Requests
Location: `views/FuelRequests.tsx`

When creating a fuel request, users can:
- Select currency (USD, LE, SLL) from dropdown
- Enter amounts in selected currency
- View formatted amounts with proper symbols
- See currency in table display

```typescript
<select>
  <option value={Currency.USD}>US Dollar (USD)</option>
  <option value={Currency.LE}>Egyptian Pound (EGP)</option>
  <option value={Currency.SLL}>Sierra Leone Leone (SLL)</option>
</select>
```

#### Request Storage
Each FuelRequest stores:
- `amount`: Numeric value
- `currency`: Currency enum (USD, LE, SLL)
- `pumpPrice`, `totalDutiesRemoved`, `dutywaiverPrice`: All calculated in selected currency

#### Display Formatting
Table displays use `formatCurrency()` to show amounts appropriately:
```tsx
<td>{formatCurrency(req.amount, req.currency)}</td>
// Output: "$42,500.00" or "₊250,000,000.00" or "Le750,750,000"
```

### 2. **Manager Dashboard Multi-Currency Display**

Location: `views/FMUManagerDashboard.tsx`

Features:
- Displays total budgets across multiple currencies
- Shows individual request amounts in their original currencies
- Approval modal displays currency-formatted amounts
- Support for approving requests in any currency

```typescript
<td className="font-bold text-indigo-600">
  {formatCurrency(request.amount, request.currency)}
</td>
```

### 3. **Currency Converter Component**

Location: `components/CurrencyConverter.tsx`

Two-part component system:

#### CurrencyConverter
Displays converted amount between two currencies inline.

```typescript
<CurrencyConverter 
  fromAmount={1000}
  fromCurrency={Currency.USD}
  toCurrency={Currency.SLL}
/>
// Output: "$1,000.00 → Le21,500,000 (21500.00)"
```

#### CurrencyConverterModal
Full modal interface for currency conversion.

Features:
- Input any amount
- Select "from" and "to" currencies
- Real-time conversion display
- Shows exchange rate

### 4. **Dashboard Supplier Debt Example**

Location: `views/Dashboard.tsx`

The supplier debt metric displays using currency formatting:
```typescript
<MetricCard 
  title="Supplier Debt" 
  value={formatCurrency(42500, Currency.USD)}
  subValue="Due in 12 days"
/>
// Output: "$42,500.00"
```

### 5. **Mock Data with Multiple Currencies**

Location: `constants.tsx`

Example mock requests demonstrate each currency:

```typescript
{
  id: 'FR-001',
  currency: Currency.USD,
  amount: 42500,          // $42,500.00
}

{
  id: 'FR-002',
  currency: Currency.LE,
  amount: 250000000,      // ₊250,000,000.00
}

{
  id: 'FR-003',
  currency: Currency.SLL,
  amount: 750750000,      // Le750,750,000
}
```

## User Interface Implementation

### Form Fields with Currency Selection

```tsx
<div className="grid grid-cols-2 gap-4">
  {/* Other form fields */}
  <div>
    <label>💱 Currency</label>
    <select value={newRequest.currency} onChange={...}>
      <option>US Dollar (USD)</option>
      <option>Egyptian Pound (EGP)</option>
      <option>Sierra Leone Leone (SLL)</option>
    </select>
  </div>
</div>
```

### Table Display

```tsx
<table>
  <thead>
    <tr>
      <th>Amount (Currency)</th>
    </tr>
  </thead>
  <tbody>
    {requests.map(req => (
      <tr>
        <td>{formatCurrency(req.amount, req.currency)}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## Data Types

### Currency Enum
```typescript
export enum Currency {
  USD = 'USD',
  LE = 'LE',
  SLL = 'SLL'
}
```

### FuelRequest Interface
```typescript
export interface FuelRequest {
  // ... other fields
  amount?: number;
  currency: Currency;
  pumpPrice?: number;
  totalDutiesRemoved?: number;
  dutywaiverPrice?: number;
}
```

## Best Practices

### 1. **Always Specify Currency**
- Every transaction must have associated currency
- Default to USD if not specified
- Store currency with amount (never assume)

### 2. **Use Service Functions**
- Import from `currencyService.ts`
- Use `formatCurrency()` for display
- Use `convertCurrency()` for calculations

### 3. **Maintain Exchange Rate Accuracy**
- Update rates from external APIs
- Log exchange rate changes
- Provide rate audit trail

### 4. **Validation**
- Validate currency selection before submission
- Handle negative amounts appropriately
- Validate exchange rates are positive

## Future Enhancements

1. **Dynamic Exchange Rates**
   - Connect to real-time API
   - Auto-update hourly
   - Store rate history

2. **Currency Reports**
   - Convert all transactions to base currency
   - Multi-currency billing reports
   - Currency variance analysis

3. **Bulk Currency Operations**
   - Batch conversion tools
   - Currency reconciliation
   - Multi-currency ledger

4. **Advanced Features**
   - Currency-specific validation rules
   - Payment method by currency
   - Auto-conversion on receipt/payment
   - Currency hedging tools

## Testing Multi-Currency Transactions

### Test Cases

**USD Transaction:**
```
Amount: 42,500 USD
Create request → Approve → View formatted: $42,500.00
```

**EGP Transaction:**
```
Amount: 250,000,000 LE
Create request → Approximate USD: $8,333,333.33
Formatted display: ₊250,000,000.00
```

**SLL Transaction:**
```
Amount: 750,750,000 SLL
Create request → Approximate USD: $34,900
Formatted display: Le750,750,000
```

## Support & Maintenance

- Exchange rates should be reviewed monthly
- Implementation handles 0-2 decimal places per currency
- Rounding handled appropriately per currency
- All currencies properly formatted throughout system

For questions or enhancements, refer to `services/currencyService.ts` for implementation details.
