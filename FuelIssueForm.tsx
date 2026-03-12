import React, { useState } from 'react';
import { FuelType, FuelStockTransaction, FuelTransactionType } from '../types';

interface FuelIssueFormProps {
  stationId: string;
  currentUserName: string;
  availableTanks: { id: string; name: string }[];
  onSubmit: (transaction: FuelStockTransaction) => void;
  onCancel: () => void;
}

const DEPARTMENTS = [
  'Operations',
  'Maintenance',
  'Transport',
  'Fleet Management',
  'Administration',
  'Other',
];

const ISSUE_REASONS = [
  'Regular Supply to Operations',
  'Maintenance & Repairs',
  'Testing & Commissioning',
  'Emergency Supply',
  'Stock Adjustment',
  'Wastage/Spillage',
  'Other',
];

const FuelIssueForm: React.FC<FuelIssueFormProps> = ({
  stationId,
  currentUserName,
  availableTanks,
  onSubmit,
  onCancel,
}) => {
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.HFO);
  const [tankId, setTankId] = useState(availableTanks.length > 0 ? availableTanks[0].id : '');
  const [quantity, setQuantity] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [reason, setReason] = useState('Regular Supply to Operations');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || !department || !reason || !tankId) {
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
      transactionType: FuelTransactionType.ISSUE,
      fuelType,
      quantity: parseFloat(quantity),
      date,
      recordedBy: currentUserName,
      department,
      reason,
      status: 'Submitted',
      notes: notes || undefined,
      timestamp: new Date().toISOString(),
    };

    onSubmit(newTransaction);

    // Reset form
    setFuelType(FuelType.HFO);
    setQuantity('');
    setDepartment('Operations');
    setReason('Regular Supply to Operations');
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
        <label htmlFor="date-input" className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
        <input
          id="date-input"
          type="date"
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity Issued (Liters) *</label>
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
        <label htmlFor="department-select" className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
        <select
          id="department-select"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        >
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="reason-select" className="block text-sm font-semibold text-gray-700 mb-2">Reason for Issue *</label>
        <select
          id="reason-select"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        >
          {ISSUE_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
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
          💾 Submit Issue
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

export default FuelIssueForm;
