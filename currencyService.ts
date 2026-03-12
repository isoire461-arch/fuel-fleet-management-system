import { Currency } from '../types';

// Exchange rates (relative to USD) - updated 2026-02-25
// In real application, these would be fetched from an API
export const EXCHANGE_RATES: Record<Currency, number> = {
  [Currency.USD]: 1.0, // Base currency
  [Currency.LE]: 30.0, // Egyptian Pound (approximate)
  [Currency.SLL]: 21500, // Sierra Leone Leone (approximate)
};

// Currency symbols
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.USD]: '$',
  [Currency.LE]: '₊',
  [Currency.SLL]: 'Le',
};

// Currency names
export const CURRENCY_NAMES: Record<Currency, string> = {
  [Currency.USD]: 'US Dollar (USD)',
  [Currency.LE]: 'Egyptian Pound (EGP)',
  [Currency.SLL]: 'Sierra Leone Leone (SLL)',
};

// Format amount with currency symbol
export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbol = CURRENCY_SYMBOLS[currency];
  
  // Format with appropriate decimal places based on currency
  let formatted: string;
  if (currency === Currency.SLL) {
    // SLL uses no decimals typically
    formatted = Math.round(amount).toLocaleString('en-US');
  } else if (currency === Currency.LE) {
    // LE uses 2 decimals
    formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    // USD uses 2 decimals
    formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  return `${symbol}${formatted}`;
};

// Format amount only (no symbol)
export const formatAmount = (amount: number, currency: Currency): string => {
  if (currency === Currency.SLL) {
    return Math.round(amount).toLocaleString('en-US');
  } else if (currency === Currency.LE) {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
};

// Convert amount from one currency to another
export const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  return amountInUSD * EXCHANGE_RATES[toCurrency];
};

// Get currency symbol
export const getCurrencySymbol = (currency: Currency): string => {
  return CURRENCY_SYMBOLS[currency];
};

// Get currency name
export const getCurrencyName = (currency: Currency): string => {
  return CURRENCY_NAMES[currency];
};

// Parse currency input (remove symbols and convert to number)
export const parseCurrencyInput = (value: string): number => {
  // Remove currency symbols and whitespace
  const cleaned = value.replace(/[$₊Le\s]/g, '').replace(/,/g, '');
  return parseFloat(cleaned) || 0;
};

// Format for display in tables
export const formatCurrencyTable = (amount: number | undefined, currency: Currency): string => {
  if (amount === undefined || amount === null) return '-';
  return formatCurrency(amount, currency);
};

// Get exchange rate between two currencies
export const getExchangeRate = (fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) return 1;
  return EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency];
};
