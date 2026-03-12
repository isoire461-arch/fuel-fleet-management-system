import React, { useState } from 'react';
import { FuelType, FuelStockTransaction, FuelTransactionType } from '../types';

interface FuelReceiptFormProps {
  stationId: string;
  currentUserName: string;
  availableTanks: { id: string; name: string }[]; // tanks at the station
  onSubmit: (transaction: FuelStockTransaction) => void;
  onCancel: () => void;
}

const FuelReceiptForm: React.FC<FuelReceiptFormProps> = ({
  stationId,
  currentUserName,
  availableTanks,
  onSubmit,
  onCancel,
}) => {
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.HFO);
  const [tankId, setTankId] = useState(availableTanks.length > 0 ? availableTanks[0].id : '');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || !supplier || !invoiceNumber || !tankId) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (parseFloat(quantity) <= 0) {
      setErrorMessage('Quantity must be greater than 0');
      return;
    }

    const newTransaction: FuelStockTransaction = {
      id: `FST-${Date.now()}`,
      stationId,
      tankId,
      transactionType: FuelTransactionType.RECEIPT,
      fuelType,
      quantity: parseFloat(quantity),
      date,
      recordedBy: currentUserName,
      supplier,
      invoiceNumber,
      deliveryNote: deliveryNote || undefined,
      status: 'Submitted',
      notes: notes || undefined,
      timestamp: new Date().toISOString(),
    };

    onSubmit(newTransaction);

    // Reset form
    setFuelType(FuelType.HFO);
    setQuantity('');
    setSupplier('');
    setInvoiceNumber('');
    setDeliveryNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setErrorMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ❌ {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
        <input
          type="date"
          title="Receipt date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label htmlFor="tank-select" className="block text-sm font-semibold text-gray-700 mb-2">Select Tank *</label>
        <select
          id="tank-select"
          value={tankId}
          onChange={(e) => setTankId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        >
          {availableTanks.map((tank) => (
            <option key={tank.id} value={tank.id}>{tank.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="fuel-type-select" className="block text-sm font-semibold text-gray-700 mb-2">Fuel Type *</label>
        <select
          id="fuel-type-select"
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value as FuelType)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        >
          <option value={FuelType.HFO}>HFO (Heavy Fuel Oil)</option>
          <option value={FuelType.LFO}>LFO (Light Fuel Oil)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity Received (Liters) *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity in liters"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier Name *</label>
        <input
          type="text"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          placeholder="Enter supplier name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Number *</label>
        <input
          type="text"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="Enter invoice number"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Note (Optional)</label>
        <input
          type="text"
          value={deliveryNote}
          onChange={(e) => setDeliveryNote(e.target.value)}
          placeholder="Enter delivery note number if available"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          💾 Submit Receipt
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default FuelReceiptForm;
