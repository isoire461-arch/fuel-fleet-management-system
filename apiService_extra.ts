// helper wrapper exposing API calls for departments, fuel requests, tanks, stations, and users
import { apiGet, apiPost } from './apiService';

// ===== DEPARTMENTS =====
export async function listDepartments() {
  return apiGet('list_departments');
}

export async function saveDepartment(data: any) {
  return apiPost('save_department', data);
}

export async function deleteDepartment(id: string) {
  return apiGet(`delete_department&id=${encodeURIComponent(id)}`);
}

// ===== FUEL REQUESTS =====
export async function updateFuelRequest(data: any) {
  return apiPost('update_request', data);
}

export async function deleteFuelRequest(id: string) {
  return apiGet(`delete_request&id=${encodeURIComponent(id)}`);
}

// ===== TANKS =====
export async function listTanks() {
  return apiGet('list_tanks');
}

export async function saveTank(data: any) {
  // choose which action based on presence of id
  if (data.id) {
    return apiPost('update_tank', data);
  } else {
    return apiPost('create_tank', data);
  }
}

export async function deleteTank(id: string) {
  return apiGet(`delete_tank&id=${encodeURIComponent(id)}`);
}

// ===== STATIONS =====
export async function listStations() {
  return apiGet('list_stations');
}

export async function saveStation(data: any) {
  // not yet implemented on server; placeholder
  return apiPost('save_station', data);
}

export async function deleteStation(id: string) {
  return apiGet(`delete_station&id=${encodeURIComponent(id)}`);
}

// ===== USERS =====
export async function listUsers() {
  return apiGet('list_users');
}

export async function saveUser(data: any) {
  if (data.id && !data.id.toString().startsWith('USR-')) {
    return apiPost('update_user', data);
  } else {
    return apiPost('create_user', data);
  }
}

export async function deleteUser(id: string) {
  return apiGet(`delete_user&id=${encodeURIComponent(id)}`);
}

// ===== SECURITY LOGS =====
export async function listSecurityLogs() {
  return apiGet('list_security_logs');
}

export async function createSecurityLog(data: any) {
  return apiPost('create_security_log', data);
}

// ===== INVOICES =====
export async function listInvoices() {
  return apiGet('list_invoices');
}

export async function saveInvoice(data: any) {
  return apiPost('save_invoice', data);
}

export async function deleteInvoice(id: string) {
  return apiGet(`delete_invoice&id=${encodeURIComponent(id)}`);
}

// ===== FUEL INVOICES (WITH ATG VALIDATION) =====
export async function listFuelInvoices() {
  return apiGet('list_fuel_invoices');
}

export async function saveFuelInvoice(data: any) {
  if (data.id) {
    return apiPost('update_fuel_invoice', data);
  }
  return apiPost('create_fuel_invoice', data);
}

export async function deleteFuelInvoice(id: string | number) {
  return apiGet(`delete_fuel_invoice&id=${encodeURIComponent(id)}`);
}

// ===== FUEL TRANSACTIONS (DUTY-WAIVER RECONCILIATION) =====
export async function listFuelTransactions() {
  return apiGet('list_fuel_transactions');
}

export async function saveFuelTransaction(data: any) {
  if (data.id) {
    return apiPost('update_fuel_transaction', data);
  }
  return apiPost('create_fuel_transaction', data);
}

export async function deleteFuelTransaction(id: string | number) {
  return apiGet(`delete_fuel_transaction&id=${encodeURIComponent(id)}`);
}

// ===== VEHICLES =====
export async function listVehicles() {
  return apiGet('list_vehicles');
}

export async function saveVehicle(data: any) {
  if (data.vehicle_id || data.id) {
    // server uses vehicle_id for update
    return apiPost('update_vehicle', data);
  }
  return apiPost('create_vehicle', data);
}

export async function deleteVehicle(id: string) {
  return apiGet(`delete_vehicle&id=${encodeURIComponent(id)}`);
}

// ===== TANK ISSUES =====
export async function listTankIssues() {
  return apiGet('list_tank_issues');
}

export async function saveTankIssue(data: any) {
  if (data.id) {
    return apiPost('update_tank_issue', data);
  }
  return apiPost('create_tank_issue', data);
}

export async function deleteTankIssue(id: string) {
  return apiGet(`delete_tank_issue&id=${encodeURIComponent(id)}`);
}