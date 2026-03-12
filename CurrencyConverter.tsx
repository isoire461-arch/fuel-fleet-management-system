import React, { useState } from 'react';
import { Currency } from '../types';
import { formatCurrency, convertCurrency, CURRENCY_NAMES, getExchangeRate } from '../services/currencyService';

interface CurrencyConverterProps {
  fromAmount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ fromAmount, fromCurrency, toCurrency }) => {
  const convertedAmount = convertCurrency(fromAmount, fromCurrency, toCurrency);
  const exchangeRate = getExchangeRate(fromCurrency, toCurrency);

  if (fromCurrency === toCurrency) {
    return <span>{formatCurrency(fromAmount, fromCurrency)}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span>{formatCurrency(fromAmount, fromCurrency)}</span>
      <span className="text-gray-400">→</span>
      <span className="font-semibold text-indigo-600">{formatCurrency(convertedAmount, toCurrency)}</span>
      <span className="text-xs text-gray-500">({exchangeRate.toFixed(2)})</span>
    </div>
  );
};

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState<Currency>(Currency.USD);
  const [toCurrency, setToCurrency] = useState<Currency>(Currency.SLL);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amount) || 0;
  const convertedAmount = convertCurrency(parsedAmount, fromCurrency, toCurrency);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">💱 Currency Converter</h3>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* From Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* From Currency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value as Currency)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={Currency.USD}>{CURRENCY_NAMES[Currency.USD]}</option>
              <option value={Currency.LE}>{CURRENCY_NAMES[Currency.LE]}</option>
              <option value={Currency.SLL}>{CURRENCY_NAMES[Currency.SLL]}</option>
            </select>
          </div>

          {/* To Currency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value as Currency)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={Currency.USD}>{CURRENCY_NAMES[Currency.USD]}</option>
              <option value={Currency.LE}>{CURRENCY_NAMES[Currency.LE]}</option>
              <option value={Currency.SLL}>{CURRENCY_NAMES[Currency.SLL]}</option>
            </select>
          </div>

          {/* Result */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-600">Converted Amount</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {formatCurrency(convertedAmount, toCurrency)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              1 {fromCurrency} = {(1 / getExchangeRate(fromCurrency, toCurrency)).toFixed(4)} {toCurrency}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CurrencyConverter;
