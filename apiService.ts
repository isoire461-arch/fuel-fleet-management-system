// Comprehensive API service for PHP backend
// Supports all endpoints from server/php/api.php

// Allow overriding API base for deployments (e.g., Vercel static frontend + external API host)
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/fuel-fleet-api/api.php';
let authToken: string | null = null;

function getApiBase() {
  // Ensure we always return an absolute URL for fetch/new URL
  return API_BASE.startsWith('http')
    ? API_BASE
    : new URL(API_BASE, window.location.origin).toString();
}

// ============================================================================
// AUTH & UTILITY
// ============================================================================

function handleResponse(res: Response) {
  if (!res.ok) {
    return res.json().then((data: any) => {
      throw new Error(data.error || res.statusText);
    }).catch(() => {
      throw new Error(res.statusText);
    });
  }
  return res.json();
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

export function setAuthToken(token: string) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
}

// generic GET helper
export async function apiGet(action: string, params?: Record<string, any>): Promise<any> {
  const url = new URL(getApiBase());
  url.searchParams.set('action', action);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  const r = await fetch(url.toString(), { headers: getHeaders() });
  return handleResponse(r);
}

export async function apiPost(action: string, data: any): Promise<any> {
  const r = await fetch(`${getApiBase()}?action=${action}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(r);
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export interface LoginRequest {
  name: string;
  pin: string;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiPost('login', credentials);
  setAuthToken(response.token);
  return response;
}

// ============================================================================
// USERS
// ============================================================================

export interface User {
  id: number;
  uid: string;
  name: string;
  role: string;
  pin?: string;
  meta?: any;
  created_at?: string;
}

export async function listUsers(): Promise<User[]> {
  return apiGet('list_users');
}

export async function getUser(id: number): Promise<User | null> {
  return apiGet('get_user', { id });
}

export async function createUser(user: Omit<User, 'id' | 'uid' | 'created_at'>): Promise<{ id: number; uid: string }> {
  return apiPost('create_user', user);
}

export async function updateUser(user: Partial<User> & { id: number }): Promise<{ updated: number }> {
  return apiPost('update_user', user);
}

export async function deleteUser(id: number): Promise<{ deleted: number }> {
  return apiGet('delete_user', { id });
}

// ============================================================================
// TANKS
// ============================================================================

export interface Tank {
  id: string;
  name: string;
  fuelType: string;
  capacity: number;
  deadStock: number;
  currentLevel?: number;
  installationDate?: string;
  location?: string;
  manufacturer?: string;
  serial_number?: string;
  notes?: string;
}

export async function listTanks(): Promise<Tank[]> {
  const data = await apiGet('list_tanks');
  if (!Array.isArray(data)) return [];
  
  // Convert snake_case API response to camelCase for frontend
  return data.map((tank: any) => {
    // Normalize fuel type values
    const fuelTypeMap: Record<string, string> = {
      'hfo': 'HFO',
      'HFO': 'HFO',
      'lfo': 'LFO',
      'LFO': 'LFO',
      'diesel': 'LFO',
      'Diesel': 'LFO',
      'petrol': 'HFO',
      'Petrol': 'HFO',
    };
    
    return {
      id: tank.id?.toString() || `tank_${tank.name}`,
      name: tank.name || '',
      fuelType: fuelTypeMap[tank.fuel_type] || 'HFO',
      capacity: Number(tank.capacity) || 0,
      deadStock: Number(tank.dead_stock) || 0,
      currentLevel: Number(tank.current_level) || 0,
      installationDate: tank.created_at || new Date().toISOString(),
      location: tank.location || '',
    };
  });
}

export async function createTank(tank: Omit<Tank, 'id'>): Promise<{ id: number }> {
  return apiPost('create_tank', tank);
}

export async function updateTank(tank: Partial<Tank> & { id: number }): Promise<{ updated: number }> {
  return apiPost('update_tank', tank);
}

export async function deleteTank(id: number): Promise<{ deleted: number }> {
  return apiGet('delete_tank', { id });
}

// ============================================================================
// REQUISITIONS
// ============================================================================

export interface Requisition {
  id?: string;
  rfNumber: string;
  date: string;
  enteredBy: string;
  department: string;
  driverId?: string;
  vehicleReg?: string;
  lastSupplyDetails?: string;
  lastFuelSupplyDate?: string;
  odometerStart?: number;
  odometerEnd?: number;
  distance?: number;
  created_at?: string;
}

export async function listRequisitions(): Promise<Requisition[]> {
  return apiGet('list_requisitions');
}

export async function createRequisition(requisition: Requisition): Promise<{ id: number }> {
  // Convert string id to number if present for API compatibility
  const apiReq = {
    ...requisition,
    id: requisition.id ? parseInt(requisition.id, 10) : undefined,
    driverId: requisition.driverId ? parseInt(requisition.driverId, 10) : undefined,
  };
  return apiPost('create_requisition', apiReq);
}

// ============================================================================
// FUEL REQUESTS (DFO)
// ============================================================================

export interface FuelRequest {
  id?: string;
  reference?: string;
  requestDate: string;
  fuelType: string;
  quantity: number;
  supplier?: string;
  station?: string;
  expectedDate?: string;
  status?: string;
  requestedBy?: string;
  currency?: string;
  amount?: number;
  pumpPrice?: number;
  totalDutiesRemoved?: number;
  dutywaiverPrice?: number;
  created_at?: string;
}

export async function listFuelRequests(): Promise<any[]> {
  const data = await apiGet('list_requests');
  if (!Array.isArray(data)) return [];
  
  // Convert snake_case API response to camelCase for frontend
  return data.map((request: any) => {
    // Normalize status values to match RequestStatus enum
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'Pending': 'Pending',
      'approved': 'Approved',
      'Approved': 'Approved',
      'delivered': 'Delivered',
      'Delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'Cancelled': 'Cancelled',
      'closed': 'Closed',
      'Closed': 'Closed',
    };
    
    // Normalize fuel type values
    const fuelTypeMap: Record<string, string> = {
      'hfo': 'HFO',
      'HFO': 'HFO',
      'lfo': 'LFO',
      'LFO': 'LFO',
      'diesel': 'LFO',
      'Diesel': 'LFO',
      'petrol': 'HFO',
      'Petrol': 'HFO',
    };
    
    return {
      id: request.id?.toString() || '',
      reference: request.reference || '',
      requestDate: request.request_date || '',
      fuelType: fuelTypeMap[request.fuel_type] || 'HFO',
      quantity: request.quantity || 0,
      supplier: request.supplier || '',
      department: request.department || '',
      location: request.station || '', // Map station to location
      station: request.station || '',
      expectedDate: request.expected_date || '',
      status: statusMap[request.status] || 'Pending',
      requestedBy: request.requested_by || '',
      approvedBy: request.approved_by || undefined,
      amount: request.amount || 0,
      currency: request.currency || 'USD',
      pumpPrice: request.pump_price || 0,
      totalDutiesRemoved: request.total_duties_removed || 0,
      dutywaiverPrice: request.dutywaiver_price || 0
    };
  });
}

export async function createFuelRequest(request: FuelRequest): Promise<{ id: number }> {
  return apiPost('create_request', request);
}

// ============================================================================
// DRIVERS
// ============================================================================

export interface Driver {
  id?: string;
  name: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  assignedVehicle?: string;
  licenseExpiry?: string;
  passportPhoto?: string;
  dateOfBirth?: string;
  address?: string;
  createdDate?: string;
}

export async function listDrivers(): Promise<Driver[]> {
  return apiGet('list_drivers');
}

export async function saveDriver(driver: Driver): Promise<{ id?: number; updated?: number }> {
  // Convert string id to number if present for API compatibility
  const apiDriver = {
    ...driver,
    id: driver.id ? parseInt(driver.id, 10) : undefined,
  };
  return apiPost('save_driver', apiDriver);
}

export async function deleteDriver(id: string): Promise<{ deleted: number }> {
  return apiGet('delete_driver', { id: parseInt(id, 10) });
}

// ============================================================================
// VEHICLES
// ============================================================================

export interface Vehicle {
  vehicle_id?: number;
  plate_number: string;
  fuel_type?: string;
  tank_capacity?: number;
  current_odometer?: number;
  avg_kmpl?: number;
}

export async function listVehicles(): Promise<Vehicle[]> {
  return apiGet('list_vehicles');
}

export async function getVehicle(id: number): Promise<Vehicle | null> {
  return apiGet('get_vehicle', { id });
}

export async function createVehicle(vehicle: Omit<Vehicle, 'vehicle_id'>): Promise<{ vehicle_id: number }> {
  return apiPost('create_vehicle', vehicle);
}

export async function updateVehicle(vehicle: Partial<Vehicle> & { vehicle_id: number }): Promise<{ updated: number }> {
  return apiPost('update_vehicle', vehicle);
}

export async function deleteVehicle(id: number): Promise<{ deleted: number }> {
  return apiGet('delete_vehicle', { id });
}

// ============================================================================
// FUEL REQUESTS (INTERNAL)
// ============================================================================

export interface InternalFuelRequest {
  request_id?: number;
  vehicle_id: number;
  driver_id?: number;
  start_odometer?: number;
  end_odometer?: number;
  liters_requested: number;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  created_by?: number;
  voucher_qr_code?: string;
  created_at?: string;
}

export async function listInternalFuelRequests(): Promise<InternalFuelRequest[]> {
  return apiGet('list_fuel_requests');
}

export async function createInternalFuelRequest(request: InternalFuelRequest): Promise<{ request_id: number }> {
  return apiPost('create_fuel_request', request);
}

export async function updateInternalFuelRequest(request: Partial<InternalFuelRequest> & { request_id: number }): Promise<{ updated: number }> {
  return apiPost('update_fuel_request', request);
}

// ============================================================================
// TANK ISSUES
// ============================================================================

export interface TankIssue {
  id?: number;
  station_id?: number;
  tank_id: number;
  tank_name: string;
  date: string;
  time: string;
  issue_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in_progress' | 'resolved';
  reported_by?: string;
  assigned_to?: string;
  estimated_litres_lost?: number;
  investivation_notes?: string;
  resolution?: string;
  resolution_date?: string;
  photo?: string;
  created_at?: string;
}

export async function listTankIssues(): Promise<TankIssue[]> {
  return apiGet('list_tank_issues');
}

export async function createTankIssue(issue: Omit<TankIssue, 'id' | 'created_at'>): Promise<{ id: number }> {
  return apiPost('create_tank_issue', issue);
}

export async function updateTankIssue(issue: Partial<TankIssue> & { id: number }): Promise<{ updated: number }> {
  return apiPost('update_tank_issue', issue);
}

export async function deleteTankIssue(id: number): Promise<{ deleted: number }> {
  return apiGet('delete_tank_issue', { id });
}

// ============================================================================
// PAYMENT REQUESTS
// ============================================================================

export interface PaymentRequest {
  request_id?: number;
  dept_id: number;
  category_id: number;
  amount: number;
  vendor_name: string;
  attachment_url?: string;
  approval_level_required?: number;
  status?: 'pending' | 'approved' | 'rejected';
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export async function listPaymentRequests(): Promise<PaymentRequest[]> {
  return apiGet('list_payment_requests');
}

export async function createPaymentRequest(request: Omit<PaymentRequest, 'request_id' | 'created_at' | 'updated_at'>): Promise<{ request_id: number }> {
  return apiPost('create_payment_request', request);
}

// ============================================================================
// PAYMENT APPROVALS
// ============================================================================

export interface ApprovalAction {
  request_id: number;
  approver_id: number;
  level?: number;
  action: 'approved' | 'rejected';
  comment?: string;
}

export async function approvePaymentRequest(approval: ApprovalAction): Promise<{ ok: boolean }> {
  return apiPost('approve_payment_request', approval);
}

// ============================================================================
// FILE UPLOAD
// ============================================================================

export async function uploadAttachment(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const url = new URL(getApiBase());
  url.searchParams.set('action', 'upload_attachment');

  const r = await fetch(url.toString(), {
    method: 'POST',
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    body: formData,
  });
  return handleResponse(r);
}

// ============================================================================
// VOUCHERS
// ============================================================================

export async function createVoucher(requestId: number): Promise<{ token: string; voucher_url: string }> {
  return apiPost('create_voucher', { request_id: requestId });
}

export async function validateVoucher(token: string): Promise<{ voucher: any }> {
  return apiGet('validate_voucher', { token });
}
