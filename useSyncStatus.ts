import { useEffect, useState } from 'react';
import { syncManager, SyncStatus } from './syncService';

/**
 * React hook for syncing data with the backend
 * Provides sync status, queue management, and manual sync controls
 */
export const useSyncStatus = () => {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = syncManager.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  const forceSync = async () => {
    return await syncManager.forceSync();
  };

  const retryFailed = async () => {
    return await syncManager.retryFailedItems();
  };

  const clearQueue = () => {
    syncManager.clearQueue();
  };

  const getQueue = () => {
    return syncManager.getQueue();
  };

  return {
    ...status,
    forceSync,
    retryFailed,
    clearQueue,
    getQueue,
  };
};

/**
 * Hook for adding items to sync queue
 */
export const useSyncQueue = () => {
  const addToQueue = (entity: string, action: 'create' | 'update' | 'delete', data: any, entityId?: string) => {
    return syncManager.addToQueue(entity, action, data, entityId);
  };

  const removeFromQueue = (itemId: string) => {
    syncManager.removeFromQueue(itemId);
  };

  return { addToQueue, removeFromQueue };
};

export default useSyncStatus;
