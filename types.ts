
export enum UserRole {
  MANAGER = 'FMU Manager',
  OFFICER = 'Fuel Officer',
  PLANT_MANAGER = 'Plant Manager',
  STORE_KEEPER = 'Store Keeper'
}

export enum FuelType {
  HFO = 'HFO',
  LFO = 'LFO'
}

export enum RequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  CLOSED = 'Closed'
}

export enum Currency {
  USD = 'USD',
  LE = 'LE',
  SLL = 'SLL'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  pin: string;
  assignedLocation?: string; // Location/Station ID for Store Keepers
  photo?: string | null; // data URL or remote URL to profile photo
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string; // base32 secret
}

export interface AdminSecuritySettings {
  id: string;
  userName: string;
  role: UserRole;
  pin: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface LoginLog {
  id: string;
  userName: string;
  role: UserRole;
  timestamp: string;
  status: 'success' | 'failed';
}

export interface FuelRequest {
  id: string;
  reference?: string;
  requestDate: string;
  fuelType: FuelType;
  quantity: number;
  supplier: string;
  department?: string;
  location: string;
  station: string;
  expectedDate: string;
  status: RequestStatus;
  requestedBy: string;
  approvedBy?: string;
  amount?: number;
  currency: Currency;
  pumpPrice?: number;
  totalDutiesRemoved?: number;
  dutywaiverPrice?: number;
}

export interface SupplierInvoice {
  id: string;
  supplier: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: Currency;
  linkedRequestId?: string; // associates invoice with a fuel delivery/request
  notes?: string;
  attachmentUrl?: string; // URL to the scanned invoice image/PDF
  quantity?: number; // Fuel quantity stated on the invoice
}

// Debt management invoice with dual-currency details
export interface DebtInvoice {
  id: string;
  supplierName: string;
  invoiceDate: string; // ISO string
  originalAmount: number;
  currency: Currency; // USD or SLL preferred
  exchangeRateAtEntry: number; // SLL per USD at entry time
  status: 'Paid' | 'Unpaid';
}

// Payment/credit line for supplier statements
export interface SupplierPayment {
  id: string;
  supplierName: string;
  date: string; // ISO string
  amount: number;
  currency: Currency;
  exchangeRateAtEntry: number;
  reference?: string;
}

export interface Tank {
  id: string;
  name: string;
  fuelType: FuelType;
  capacity: number;
  deadStock: number;
  currentLevel: number;
  installationDate: string;
  location: string;
}

export interface Vehicle {
  regNumber: string;
  makeModel: string;
  fuelType: FuelType;
  dept: string;
  currentOdometer: number;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email?: string;
  assignedVehicle: string; // Vehicle registration number
  licenseExpiry: string;
  passportPhoto?: string; // Base64 encoded image or URL
  dateOfBirth?: string;
  address?: string;
  createdDate: string;
}

export interface PlantPerformance {
  date: string;
  shift: 'Day' | 'Night';
  energyGenerated: number; // kWh
  runningHours: number;
  fuelConsumed: number;
}

export interface Plant {
  id: string;
  name: string;
  type: 'Hydro' | 'Thermal' | 'Solar';
  location?: string;
  coords?: {
    lat: number;
    lng: number;
  };
}

export interface DailyFuelRecord {
  id: string;
  date: string;
  stationId: string;
  recordedBy: string;
  fuelType: FuelType;
  quantityReceived: number; // Daily fuel received in liters
  quantitySupplied: number; // Daily fuel supplied to operations in liters
  notes?: string;
  timestamp: string;
}

// Fuel invoice record for supplier billing and ATG verification
export interface FuelInvoice {
  id: number;
  supplier_id: string; // NP, Leon Oil, Conoil, etc.
  fuel_type: 'HFO' | 'LFO';
  invoice_vol: number; // The volume stated on the supplier's invoice
  actual_vol?: number; // Read-Only: Pulled from the Automatic Tank Gauge (ATG)
  api_gravity?: number; // Density at 15°C (from the Lab Certificate)
  unit_price?: number; // Price per liter
  attachments?: string; // JSON string for list of PDF, JPG, PNG URLs
  created_at: string;
}

export enum AuditStatus {
  PENDING = 'Pending',
  MATCHED = 'Matched',
  DISCREPANCY = 'Discrepancy'
}

// Fuel Transaction record for Duty-Waiver Reconciliation
export interface FuelTransaction {
  id: number;
  station_location: string;
  fuel_type: 'HFO' | 'LFO';
  qty_requested: number; // Original PO amount
  qty_received: number; // Actual meter reading from discharge
  qty_recorded_waiver: number; // Amount stated on the NRA Duty-Free form
  qty_verified_waiver?: number; // The final audited amount for tax exemption
  waiver_certificate_img?: string; // URL/Path of the physical NRA document
  audit_status: AuditStatus;
  unit_price?: number;
  tax_rate?: number;
  verified_by?: number;
  verified_at?: string;
  created_at: string;
}

// Fuel requisition chit entered by fleet officers/drivers
export interface FuelRequisition {
  id: string;
  rfNumber: string;
  date: string;
  enteredBy: string;
  department: string;
  driverId?: string;
  vehicleReg: string;
  vehicleUser?: string;
  lastSupplyDetails: string;
  lastFuelSupplyDate?: string;
  fuelRequestLitres?: number;
  lastFuelSupplyLiters?: number;
  activities?: string;
  fuelType?: 'HFO' | 'LFO';
  odometerStart: number;
  odometerEnd: number;
  distance: number;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  createdDate: string;
  createdBy: string;
  isActive: boolean;
}

export enum FuelTransactionType {
  RECEIPT = 'Receipt',
  ISSUE = 'Issue',
  ADJUSTMENT = 'Adjustment'
}

// Fuel stock transaction for receipts and issues
export interface FuelStockTransaction {
  id: string;
  stationId: string;
  tankId?: string; // optional; specific tank involved in transaction
  transactionType: FuelTransactionType;
  fuelType: FuelType;
  quantity: number; // in liters
  date: string;
  recordedBy: string;
  supplier?: string; // For receipts - supplier name
  invoiceNumber?: string; // For receipts - invoice reference
  deliveryNote?: string; // For receipts - delivery note number
  department?: string; // For issues - department name
  reason?: string; // For issues/adjustments - reason for transaction
  approvedBy?: string; // Approval officer name
  approvalDate?: string; // Date of approval
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected'; // Transaction status
  notes?: string;
  timestamp: string; // Creation timestamp
}

// Additional strongly-typed records for backend tables
export interface VehicleRecord {
  vehicle_id: number;
  plate_number: string;
  fuel_type: string;
  tank_capacity: number;
  current_odometer: number;
  avg_kmpl?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface FuelRequestRecord {
  request_id: number;
  vehicle_id: number;
  driver_id: number;
  start_odometer: number;
  end_odometer?: number | null;
  liters_requested: number;
  status: 'pending' | 'approved' | 'rejected' | 'dispensed' | 'cancelled';
  voucher_qr_code?: string | null;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentRequestRecord {
  request_id: number;
  dept_id: number;
  category_id: number;
  amount: number;
  vendor_name?: string | null;
  attachment_url?: string | null;
  approval_level_required: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetMaster {
  dept_id: number;
  year: number;
  total_allocation: number;
  spent_to_date: number;
}

export interface ApprovalLog {
  id: number;
  request_type: 'payment' | 'fuel';
  request_id: number;
  approver_id: number;
  level: number;
  action: 'approved' | 'rejected';
  comment?: string | null;
  acted_at?: string;
}

export enum TankIssueStatus {
  REPORTED = 'Reported',
  INVESTIGATING = 'Investigating',
  RESOLVED = 'Resolved',
  ESCALATED = 'Escalated'
}

export enum TankIssueSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

// Daily tank issues tracking for store keepers
export interface DailyTankIssue {
  id: string;
  stationId: string;
  tankId: string;
  tankName: string;
  date: string;
  time: string;
  issueType: 'Leak' | 'Overflow' | 'Contamination' | 'Discrepancy' | 'Hardware' | 'Calibration' | 'Other';
  description: string;
  severity: TankIssueSeverity;
  status: TankIssueStatus;
  reportedBy: string;
  assignedTo?: string;
  estimatedLitresLost?: number; // For leaks
  investivationNotes?: string;
  resolution?: string;
  resolutionDate?: string;
  photo?: string; // Base64 encoded image
  createdAt: string;
  updatedAt: string;
}
