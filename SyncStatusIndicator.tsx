import React from 'react';
import { useSyncStatus } from '../services/useSyncStatus';

/**
 * Component that displays data sync status
 * Shows offline indicator, queue count, and sync controls
 */
export const SyncStatusIndicator: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isOnline, isSyncing, queueLength, failedItems, forceSync, retryFailed, getQueue } = useSyncStatus();
  const [showQueue, setShowQueue] = React.useState(() => {
    try {
      return localStorage.getItem('fuel_show_sync_queue') === 'true';
    } catch {
      return false;
    }
  });

  // Persist showQueue state
  React.useEffect(() => {
    localStorage.setItem('fuel_show_sync_queue', String(showQueue));
  }, [showQueue]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Online/Offline Indicator */}
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs font-medium text-gray-600">
          {isOnline ? 'Online' : 'Offline'}
        </span>

        {/* Queue Count */}
        {queueLength > 0 && (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
            {queueLength} pending
          </span>
        )}

        {/* Sync Indicator */}
        {isSyncing && (
          <span className="text-xs text-blue-600 flex items-center gap-1">
            <span className="animate-spin">⟳</span> Syncing
          </span>
        )}

        {/* Failed Items */}
        {failedItems > 0 && (
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
            {failedItems} failed
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Sync Status</h3>
        <button
          type="button"
          onClick={() => setShowQueue(!showQueue)}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          {showQueue ? 'Hide' : 'Show'} Queue
        </button>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Online Status */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="font-semibold text-gray-900">{isOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>

        {/* Queue Length */}
        <div>
          <p className="text-xs text-gray-500">Pending Changes</p>
          <p className="font-semibold text-gray-900">{queueLength}</p>
        </div>

        {/* Sync State */}
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <>
              <span className="animate-spin text-blue-600">⟳</span>
              <div>
                <p className="text-xs text-gray-500">Syncing</p>
                <p className="font-semibold text-blue-600">In Progress</p>
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs text-gray-500">Sync</p>
              <p className="font-semibold text-gray-900">Ready</p>
            </div>
          )}
        </div>

        {/* Failed Items */}
        <div>
          <p className="text-xs text-gray-500">Failed Items</p>
          <p className={`font-semibold ${failedItems > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {failedItems}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={forceSync}
          disabled={isSyncing || queueLength === 0}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded transition"
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>

        {failedItems > 0 && (
          <button
            type="button"
            onClick={retryFailed}
            className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded transition"
          >
            Retry Failed
          </button>
        )}
      </div>

      {/* Queue Display */}
      {showQueue && queueLength > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-3">Queue Items</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {getQueue().map(item => (
              <div key={item.id} className="text-xs bg-gray-50 p-2 rounded border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.action.toUpperCase()} {item.entity}
                    </p>
                    <p className="text-gray-600">{item.entityId || 'new'}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                    {item.attempts}/{3}
                  </span>
                </div>
                {item.lastError && (
                  <p className="text-red-600 mt-1">Error: {item.lastError}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Message */}
      {!isOnline && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          You are offline. Changes will be saved locally and synced when you're back online.
        </div>
      )}

      {queueLength > 0 && isOnline && !isSyncing && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
          You have {queueLength} pending change{queueLength > 1 ? 's' : ''}. Click "Sync Now" to upload them.
        </div>
      )}
    </div>
  );
};

export default SyncStatusIndicator;
