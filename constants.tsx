
import React from 'react';
import { UserRole, FuelType, RequestStatus, Currency, Department } from './types';

// Default PINs - These should be set by users on first login
// PINs should be hashed and stored securely
// Users must change their default PIN upon first login for security
export const MOCK_USERS = [
  { id: '1', name: 'John Manager', role: UserRole.MANAGER, email: 'john@fuelandfleet.com', pin: '' },
  { id: '2', name: 'Alice Officer', role: UserRole.OFFICER, email: 'alice@fuelandfleet.com', pin: '' },
  { id: '3', name: 'Bob Plant', role: UserRole.PLANT_MANAGER, email: 'bob@fuelandfleet.com', pin: '' },
  { id: '4', name: 'Charlie Keeper', role: UserRole.STORE_KEEPER, email: 'charlie@fuelandfleet.com', pin: '', assignedLocation: 'STN-01' },
  { id: '5', name: 'David Keeper', role: UserRole.STORE_KEEPER, email: 'david@fuelandfleet.com', pin: '', assignedLocation: 'STN-02' },
  { id: '6', name: 'Emma Keeper', role: UserRole.STORE_KEEPER, email: 'emma@fuelandfleet.com', pin: '', assignedLocation: 'STN-03' },
];

export const MOCK_REQUESTS = [
  {
    id: 'FR-001',
    requestDate: '2026-02-08',
    fuelType: FuelType.HFO,
    quantity: 50000,
    supplier: 'Apex Energy',
    department: 'Operations',
    location: 'Bumbuna Power Plant',
    station: 'STN-01',
    expectedDate: '2026-02-20',
    status: RequestStatus.PENDING,
    requestedBy: 'Alice Officer',
    currency: Currency.USD,
    amount: 42500,
    pumpPrice: 0.85,
    totalDutiesRemoved: 0.15,
    dutywaiverPrice: 0.70
  },
  {
    id: 'FR-002',
    requestDate: '2026-02-07',
    fuelType: FuelType.LFO,
    quantity: 12000,
    supplier: 'Global Oils Ltd',
    department: 'Logistics',
    location: 'Dodo Hydro Site',
    station: 'STN-02',
    expectedDate: '2026-02-18',
    status: RequestStatus.APPROVED,
    requestedBy: 'Alice Officer',
    currency: Currency.LE,
    amount: 250000000,
    pumpPrice: 20833.33,
    totalDutiesRemoved: 3000,
    dutywaiverPrice: 17833.33
  },
  {
    id: 'FR-003',
    requestDate: '2026-02-10',
    fuelType: FuelType.HFO,
    quantity: 35000,
    supplier: 'Sierra Energy Corp',
    department: 'Maintenance',
    location: 'Kinoya Storage Facility',
    station: 'STN-03',
    expectedDate: '2026-02-25',
    status: RequestStatus.PENDING,
    requestedBy: 'Alice Officer',
    currency: Currency.SLL,
    amount: 750750000,
    pumpPrice: 21450,
    totalDutiesRemoved: 3500,
    dutywaiverPrice: 17950
  }
];

export const MOCK_TANKS = [
  { id: 'TNK-01', name: 'HFO Main Tank A', fuelType: FuelType.HFO, capacity: 250000, deadStock: 5000, currentLevel: 185000, installationDate: '2010-06-15', location: 'STN-01' },
  { id: 'TNK-02', name: 'LFO Service Tank', fuelType: FuelType.LFO, capacity: 50000, deadStock: 1000, currentLevel: 12000, installationDate: '2012-09-20', location: 'STN-01' },
  { id: 'TNK-03', name: 'Black Start Tank', fuelType: FuelType.LFO, capacity: 15000, deadStock: 500, currentLevel: 8500, installationDate: '2015-01-10', location: 'STN-01' },
  { id: 'TNK-04', name: 'HFO Reserve Tank', fuelType: FuelType.HFO, capacity: 150000, deadStock: 3000, currentLevel: 120000, installationDate: '2016-03-12', location: 'STN-02' },
  { id: 'TNK-05', name: 'LFO Supply Tank', fuelType: FuelType.LFO, capacity: 45000, deadStock: 800, currentLevel: 32000, installationDate: '2018-07-08', location: 'STN-02' },
  { id: 'TNK-06', name: 'HFO Storage Tank A', fuelType: FuelType.HFO, capacity: 180000, deadStock: 4000, currentLevel: 92000, installationDate: '2014-05-20', location: 'STN-03' },
  { id: 'TNK-07', name: 'HFO Storage Tank B', fuelType: FuelType.HFO, capacity: 180000, deadStock: 4000, currentLevel: 68000, installationDate: '2014-05-20', location: 'STN-03' },
];

export const MOCK_VEHICLES = [
  { regNumber: 'SL-88-22', makeModel: 'Toyota Hilux 2023', fuelType: FuelType.LFO, dept: 'Operations', currentOdometer: 15420 },
  { regNumber: 'SL-45-67', makeModel: 'Mitsubishi Pajero', fuelType: FuelType.LFO, dept: 'Management', currentOdometer: 42100 },
];

export const MOCK_DRIVERS = [
  { 
    id: 'DRV-001', 
    name: 'Mohamed Sesay', 
    licenseNumber: 'SL-DL-2021-00001', 
    phone: '+232 76 123456', 
    email: 'm.sesay@fuelandfleet.com',
    assignedVehicle: 'SL-88-22',
    licenseExpiry: '2027-12-31',
    dateOfBirth: '1985-05-15',
    address: '12 Wilkinson Road, Freetown',
    createdDate: '2026-01-15'
  },
  { 
    id: 'DRV-002', 
    name: 'Aminata Jalloh', 
    licenseNumber: 'SL-DL-2020-00045', 
    phone: '+232 76 654321', 
    email: 'a.jalloh@fuelandfleet.com',
    assignedVehicle: 'SL-45-67',
    licenseExpiry: '2026-08-15',
    dateOfBirth: '1990-08-22',
    address: '45 Pademba Road, Freetown',
    createdDate: '2026-01-10'
  }
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'DEPT-001', name: 'Operations', description: 'Daily fuel operations and logistics', createdDate: '2026-01-01', createdBy: 'System Admin', isActive: true },
  { id: 'DEPT-002', name: 'Logistics', description: 'Supply chain and distribution management', createdDate: '2026-01-02', createdBy: 'System Admin', isActive: true },
  { id: 'DEPT-003', name: 'Maintenance', description: 'Equipment and facility maintenance', createdDate: '2026-01-03', createdBy: 'System Admin', isActive: true },
  { id: 'DEPT-004', name: 'Finance', description: 'Financial planning and budget control', createdDate: '2026-01-05', createdBy: 'System Admin', isActive: true },
  { id: 'DEPT-005', name: 'HR', description: 'Human resources and personnel management', createdDate: '2026-01-06', createdBy: 'System Admin', isActive: true },
];

export const MOCK_INVOICES = [
  {
    id: 'INV-001',
    supplier: 'Apex Energy',
    invoiceNumber: 'AXP-2026-1001',
    date: '2026-02-21',
    amount: 42500,
    currency: Currency.USD,
    linkedRequestId: 'FR-001',
    notes: 'Payment for delivery of HFO 50kL'
  },
  {
    id: 'INV-002',
    supplier: 'Global Oils Ltd',
    invoiceNumber: 'GOL-2026-2005',
    date: '2026-02-19',
    amount: 250000000,
    currency: Currency.LE,
    linkedRequestId: 'FR-002',
    notes: 'Delivery 12kL LFO to Dodo site'
  }
];
