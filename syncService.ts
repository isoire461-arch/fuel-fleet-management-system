// ============================================================================
// DATA SYNCHRONIZATION SERVICE
// Handles offline-first sync, queue management, conflict resolution, and
// automatic background synchronization with PHP backend
// ============================================================================

export interface SyncQueueItem {
  id: string;
  timestamp: number;
  action: 'create' | 'update' | 'delete' | 'read';
  entity: string;
  entityId?: string;
  data?: any;
  attempts: number;
  lastError?: string;
  synced: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: number;
  queueLength: number;
  failedItems: number;
  syncErrors: Map<string, string>;
}

class DataSyncManager {
  private isOnline = true;
  private isSyncing = false;
  private syncQueue: SyncQueueItem[] = [];
  private syncListeners: Set<(status: SyncStatus) => void> = new Set();
  private syncInterval: number | null = null;
  private lastSyncTime = 0;
  private MAX_RETRIES = 3;
  private SYNC_INTERVAL_MS = 30 * 1000; // 30 seconds
  private REQUEST_TIMEOUT_MS = 10 * 1000; // 10 seconds

  constructor() {
    this.loadQueueFromStorage();
    this.setupOfflineDetection();
    this.startAutoSync();
  }

  // ========== OFFLINE/ONLINE DETECTION ==========

  private setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('✓ Online - starting sync');
      this.notifyListeners();
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('⚠ Offline - queueing changes');
      this.notifyListeners();
    });

    // Check initial state
    this.isOnline = navigator.onLine;
  }

  // ========== QUEUE MANAGEMENT ==========

  private loadQueueFromStorage() {
    try {
      const stored = localStorage.getItem('fuel_fleet_sync_queue');
      this.syncQueue = stored ? JSON.parse(stored) : [];
      
      const storedTime = localStorage.getItem('fuel_fleet_last_sync');
      this.lastSyncTime = storedTime ? parseInt(storedTime, 10) : 0;
    } catch (err) {
      console.warn('Failed to load sync queue:', err);
      this.syncQueue = [];
      this.lastSyncTime = 0;
    }
  }

  private saveQueueToStorage() {
    try {
      localStorage.setItem('fuel_fleet_sync_queue', JSON.stringify(this.syncQueue));
      localStorage.setItem('fuel_fleet_last_sync', this.lastSyncTime.toString());
    } catch (err) {
      console.warn('Failed to save sync queue:', err);
    }
  }

  addToQueue(entity: string, action: 'create' | 'update' | 'delete', data: any, entityId?: string): SyncQueueItem {
    const item: SyncQueueItem = {
      id: `${entity}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      action,
      entity,
      entityId,
      data,
      attempts: 0,
      synced: false,
    };

    this.syncQueue.push(item);
    this.saveQueueToStorage();
    this.notifyListeners();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processQueue();
    }

    return item;
  }

  removeFromQueue(itemId: string) {
    this.syncQueue = this.syncQueue.filter(item => item.id !== itemId);
    this.saveQueueToStorage();
    this.notifyListeners();
  }

  getQueue(): SyncQueueItem[] {
    return [...this.syncQueue];
  }

  clearQueue() {
    this.syncQueue = [];
    this.saveQueueToStorage();
    this.notifyListeners();
  }

  // ========== SYNC EXECUTION ==========

  private async processQueue() {
    if (!this.isOnline || this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    const items = [...this.syncQueue];
    for (const item of items) {
      if (item.synced || item.attempts >= this.MAX_RETRIES) {
        continue;
      }

      try {
        await this.syncItem(item);
        item.synced = true;
        this.removeFromQueue(item.id);
      } catch (err: any) {
        item.attempts++;
        item.lastError = err.message;
        console.warn(`Sync failed for ${item.entity} (attempt ${item.attempts}):`, err);
      }
    }

    this.isSyncing = false;
    this.lastSyncTime = Date.now();
    this.saveQueueToStorage();
    this.notifyListeners();
  }

  private async syncItem(item: SyncQueueItem): Promise<any> {
    const { entity, action, data, entityId } = item;

    // Import API service dynamically to avoid circular dependencies
    const apiService = await import('./apiService');
    const apiExtraService = await import('./apiService_extra');

    switch (entity) {
      case 'users':
        return action === 'delete'
          ? apiService.deleteUser(parseInt(entityId!))
          : apiService.updateUser(data);

      case 'tanks':
        return action === 'delete'
          ? apiService.deleteTank(parseInt(entityId!))
          : apiExtraService.saveTank(data);

      case 'drivers':
        return action === 'delete'
          ? apiService.deleteDriver(entityId!)
          : apiService.saveDriver(data);

      case 'vehicles':
        return action === 'delete'
          ? apiService.deleteVehicle(parseInt(entityId!))
          : apiExtraService.saveVehicle(data);

      case 'fuel_requests':
        return action === 'delete'
          ? apiExtraService.deleteFuelRequest(entityId!)
          : (action === 'create' ? apiService.createFuelRequest(data) : apiExtraService.updateFuelRequest(data));

      case 'fuel_invoices':
        return action === 'delete'
          ? apiExtraService.deleteFuelInvoice(entityId!)
          : apiExtraService.saveFuelInvoice(data);

      case 'fuel_transactions':
        return action === 'delete'
          ? apiExtraService.deleteFuelTransaction(entityId!)
          : apiExtraService.saveFuelTransaction(data);

      case 'tank_issues':
        return action === 'delete'
          ? apiService.deleteTankIssue(parseInt(entityId!))
          : apiService.updateTankIssue(data);

      case 'payment_requests':
        return apiService.createPaymentRequest(data);

      default:
        throw new Error(`Unknown entity: ${entity}`);
    }
  }

  // ========== AUTO SYNC ==========

  private startAutoSync() {
    // Sync every 30 seconds if online and has items
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing && this.syncQueue.length > 0) {
        this.processQueue();
      }
    }, this.SYNC_INTERVAL_MS);
  }

  stopAutoSync() {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // ========== STATUS & LISTENERS ==========

  getStatus(): SyncStatus {
    const failedItems = this.syncQueue.filter(item => !item.synced && item.attempts >= this.MAX_RETRIES);
    const syncErrors = new Map<string, string>();

    failedItems.forEach(item => {
      if (item.lastError) {
        syncErrors.set(item.id, item.lastError);
      }
    });

    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      queueLength: this.syncQueue.length,
      failedItems: failedItems.length,
      syncErrors,
    };
  }

  onStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.add(listener);
    // Call immediately with current status
    listener(this.getStatus());
    // Return unsubscribe function
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  private notifyListeners() {
    const status = this.getStatus();
    this.syncListeners.forEach(listener => {
      try {
        listener(status);
      } catch (err) {
        console.warn('Error in sync listener:', err);
      }
    });
  }

  // ========== MANUAL SYNC ==========

  async forceSync(): Promise<SyncStatus> {
    await this.processQueue();
    return this.getStatus();
  }

  async retryFailedItems(): Promise<SyncStatus> {
    const failedItems = this.syncQueue.filter(item => item.attempts >= this.MAX_RETRIES);
    failedItems.forEach(item => {
      item.attempts = 0;
      item.lastError = undefined;
    });
    this.saveQueueToStorage();
    await this.processQueue();
    return this.getStatus();
  }
}

// Singleton instance
export const syncManager = new DataSyncManager();

// ============================================================================
// LEGACY HELPERS (Backward compatible)
// ============================================================================

export async function saveWithLocalFirst<T>(
  key: string,
  items: T[],
  dataItem: T,
  onSync?: (item: T) => Promise<any>,
  eventName?: string
) {
  const existsIndex = items.findIndex((i: any) => (i as any).id === (dataItem as any).id);
  let updated: T[];
  if (existsIndex >= 0) {
    updated = items.slice();
    updated[existsIndex] = dataItem;
  } else {
    updated = [dataItem, ...items];
  }

  localStorage.setItem(key, JSON.stringify(updated));
  if (eventName) window.dispatchEvent(new Event(eventName));

  // Try remote sync in background
  if (onSync) {
    try {
      await onSync(dataItem);
    } catch (err) {
      console.warn('Background sync failed for', key, err);
      // Queue for later sync
      const entity = key.replace('fuel_fleet_', '');
      syncManager.addToQueue(entity, 'update', dataItem);
    }
  }

  return updated;
}

export async function deleteWithLocalFirst<T>(
  key: string,
  items: T[],
  id: string,
  onSync?: (id: string) => Promise<any>,
  eventName?: string
) {
  const updated = items.filter((i: any) => (i as any).id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
  if (eventName) window.dispatchEvent(new Event(eventName));

  if (onSync) {
    try {
      await onSync(id);
    } catch (err) {
      console.warn('Background delete sync failed for', key, err);
      // Queue for later sync
      const entity = key.replace('fuel_fleet_', '');
      syncManager.addToQueue(entity, 'delete', null, id);
    }
  }

  return updated;
}
