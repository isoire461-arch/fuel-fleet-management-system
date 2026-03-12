# Data Synchronization System

## Overview

The data synchronization system enables seamless offline-first functionality for the Fuel Fleet Management System. It automatically synchronizes data between the React frontend and PHP backend, with built-in queue management, conflict resolution, and automatic retry mechanisms.

## Key Features

- **Offline-First Architecture**: Changes are immediately saved to localStorage
- **Automatic Background Sync**: Syncs pending changes when online (every 30 seconds)
- **Online/Offline Detection**: Automatically detects network state changes
- **Queue Management**: Tracks pending operations in localStorage
- **Auto-Retry**: Failed items automatically retry up to 3 times
- **Conflict Resolution**: Latest changes take precedence
- **Event-Driven**: Real-time sync status notifications
- **TypeScript Support**: Fully typed for type safety

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
│                  (Frontend Components)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Sync Manager (Singleton)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Queue Management    Auto Sync    Status Tracking     │   │
│  │ Offline Detection   Retry Logic   Event Dispatch     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────┬──────────────────────────────┬──────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐      ┌────────────────────────┐
│  localStorage        │      │  PHP API Endpoint      │
│  (Sync Queue)        │      │  (/server/php/api.php) │
└──────────────────────┘      └────────────────────────┘
```

## Usage

### 1. Basic Sync Status Monitoring

```tsx
import { useSyncStatus } from './services/useSyncStatus';

function MyComponent() {
  const { isOnline, isSyncing, queueLength, forceSync } = useSyncStatus();

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <p>Pending changes: {queueLength}</p>
      <button onClick={forceSync} disabled={isSyncing}>
        {isSyncing ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
}
```

### 2. Adding Items to Sync Queue

```tsx
import { useSyncUsers } from './services/entitySyncHooks';

function UserForm() {
  const { syncCreateUser, syncUpdateUser } = useSyncUsers();

  const handleCreateUser = async (userData) => {
    // Will be queued immediately, synced when online
    const queueItem = syncCreateUser(userData);
    console.log('User queued for sync:', queueItem.id);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleCreateUser({
        name: 'John Doe',
        role: 'Fuel Officer',
        pin: '2222'
      });
    }}>
      {/* form fields */}
    </form>
  );
}
```

### 3. Syncing Different Entities

#### Users
```tsx
import { useSyncUsers } from './services/entitySyncHooks';

const { syncCreateUser, syncUpdateUser, syncDeleteUser } = useSyncUsers();

// Create
syncCreateUser({ name: 'John', role: 'Officer' });

// Update
syncUpdateUser('123', { name: 'Jane' });

// Delete
syncDeleteUser('123');
```

#### Tanks
```tsx
import { useSyncTanks } from './services/entitySyncHooks';

const { syncCreateTank, syncUpdateTank, syncDeleteTank } = useSyncTanks();

syncCreateTank({
  name: 'Main Tank A',
  fuel_type: 'HFO',
  capacity: 50000
});
```

#### Vehicles
```tsx
import { useSyncVehicles } from './services/entitySyncHooks';

const { syncCreateVehicle, syncUpdateVehicle, syncDeleteVehicle } = useSyncVehicles();

syncUpdateVehicle('V-001', {
  plate_number: 'ABC-123',
  current_odometer: 150000
});
```

#### Other Entities
```tsx
import { useSyncDrivers, useSyncFuelRequests, useSyncTankIssues } from './services/entitySyncHooks';

// Drivers
const { syncCreateDriver, syncUpdateDriver } = useSyncDrivers();

// Fuel Requests
const { syncCreateRequest, syncUpdateRequest } = useSyncFuelRequests();

// Tank Issues
const { syncCreateIssue, syncUpdateIssue } = useSyncTankIssues();
```

### 4. Displaying Sync Status

```tsx
import SyncStatusIndicator from './components/SyncStatusIndicator';

// Compact inline version
<SyncStatusIndicator compact={true} />

// Full panel version
<SyncStatusIndicator />
```

### 5. Manual Sync Control

```tsx
import { useSyncStatus } from './services/useSyncStatus';

function SyncControls() {
  const { forceSync, retryFailed, clearQueue, getQueue } = useSyncStatus();

  return (
    <div>
      <button onClick={forceSync}>Sync Now</button>
      <button onClick={retryFailed}>Retry Failed (x items)</button>
      <button onClick={clearQueue}>Clear Queue</button>
      <button onClick={() => console.log(getQueue())}>
        Show Queue
      </button>
    </div>
  );
}
```

## Sync Manager API

### `syncManager`

Singleton instance that manages all sync operations.

#### Methods

- **`addToQueue(entity, action, data, entityId?)`**
  - Adds an item to the sync queue
  - Returns: `SyncQueueItem`
  - Example: `syncManager.addToQueue('users', 'create', userData)`

- **`removeFromQueue(itemId)`**
  - Removes an item from the queue
  - Example: `syncManager.removeFromQueue('queueItem1')`

- **`getQueue()`**
  - Returns all queued items
  - Returns: `SyncQueueItem[]`

- **`clearQueue()`**
  - Clears entire sync queue

- **`getStatus()`**
  - Returns current sync status
  - Returns: `SyncStatus`

- **`forceSync()`**
  - Manually triggers sync immediately
  - Returns: `Promise<SyncStatus>`

- **`retryFailedItems()`**
  - Retries all failed items (max 3 attempts each)
  - Returns: `Promise<SyncStatus>`

- **`onStatusChange(listener)`**
  - Subscribe to sync status changes
  - Returns: Unsubscribe function

## Data Types

### SyncQueueItem
```typescript
interface SyncQueueItem {
  id: string;              // Unique queue item ID
  timestamp: number;       // When added to queue
  action: 'create' | 'update' | 'delete' | 'read';
  entity: string;          // Entity type (users, tanks, etc)
  entityId?: string;       // ID of entity being modified
  data?: any;              // Payload data
  attempts: number;        // Sync retry attempts
  lastError?: string;      // Last error message
  synced: boolean;         // Whether successfully synced
}
```

### SyncStatus
```typescript
interface SyncStatus {
  isOnline: boolean;                   // Network status
  isSyncing: boolean;                  // Currently syncing
  lastSyncTime?: number;               // Last successful sync time
  queueLength: number;                 // Items pending sync
  failedItems: number;                 // Failed sync attempts
  syncErrors: Map<string, string>;     // Error details by item ID
}
```

## Offline Workflow Example

### Scenario: User Creates Record While Offline

1. **User creates a new tank** → Immediately saved to localStorage
2. **Item added to sync queue** → Tracked with timestamp and status
3. **Auto-sync attempted** → Fails silently (offline)
4. **User sees UI indicator** → "Offline - 1 pending change"
5. **User goes online** → Sync automatically triggers
6. **Record uploaded to server** → Item removed from queue
7. **Success indicator shown** → "All changes synced"

### Scenario: Duplicate Operations

If user creates same item twice while offline:
- Both are queued separately
- First sync succeeds, updates server
- Second sync gets processed next batch
- No conflicts due to sequential processing

## Configuration

Edit `services/syncService.ts` to adjust:

```typescript
private MAX_RETRIES = 3;              // Max retry attempts
private SYNC_INTERVAL_MS = 30 * 1000; // Auto-sync interval
private REQUEST_TIMEOUT_MS = 10 * 1000; // Request timeout
```

## Event Listeners

The sync system dispatches global events:

```typescript
// Listen for online event
window.addEventListener('online', () => {
  console.log('Sync will auto-trigger');
});

// Listen for offline event
window.addEventListener('offline', () => {
  console.log('Changes will be queued');
});

// Listen for session warning (from auth)
window.addEventListener('auth:sessionWarning', (e) => {
  console.log('Session expiring in:', e.detail.timeLeft);
});
```

## Monitoring and Debugging

### View Queue in Console
```javascript
import { syncManager } from './services/syncService';
console.log(syncManager.getQueue());
```

### Check Sync Status
```javascript
console.log(syncManager.getStatus());
// {
//   isOnline: true,
//   isSyncing: false,
//   queueLength: 0,
//   failedItems: 0,
//   lastSyncTime: 1678886456123,
//   syncErrors: Map(0) {}
// }
```

### Monitor Real-time Changes
```javascript
const unsubscribe = syncManager.onStatusChange((status) => {
  console.log('Sync status changed:', status);
});

// Later: unsubscribe()
```

## Error Handling

### Automatic Retry Logic

- Failed items automatically retry up to 3 times
- Retry happens on next sync cycle (every 30 seconds)
- After 3 failures, item marked as "failed" in queue
- User can manually retry via "Retry Failed" button

### Manual Error Recovery

```typescript
// Get failed items
const { syncErrors } = useSyncStatus();

// Retry all failed items
const { retryFailed } = useSyncStatus();
await retryFailed();

// Clear queue if needed
const { clearQueue } = useSyncStatus();
clearQueue();
```

## Best Practices

1. **Always use sync hooks** for data modifications
   ```tsx
   // ✓ Good
   const { syncCreateUser } = useSyncUsers();
   syncCreateUser(userData);
   
   // ✗ Avoid
   localStorage.setItem('users', JSON.stringify(data));
   ```

2. **Check sync status before critical operations**
   ```tsx
   const { isOnline, queueLength } = useSyncStatus();
   if (!isOnline && queueLength > 0) {
     showWarning('Offline mode - changes will sync when online');
   }
   ```

3. **Provide user feedback**
   - Show sync status indicator
   - Notify on queue changes
   - Display last sync time

4. **Handle network transitions gracefully**
   ```tsx
   useEffect(() => {
     const handleOffline = () => {
       showNotification('Offline mode enabled');
     };
     window.addEventListener('offline', handleOffline);
     return () => window.removeEventListener('offline', handleOffline);
   }, []);
   ```

5. **Test offline scenarios**
   - DevTools → Network tab → Offline
   - Modify data while offline
   - Go back online and verify sync
   - Check localStorage sync queue

## Troubleshooting

### Sync Queue Not Clearing

**Problem**: Items remain in queue after going online

**Solutions**:
1. Check if API endpoint is accessible
2. Verify auth token is valid
3. Check browser console for errors
4. Manually retry via UI button
5. Check PHP API logs

### Data Not Syncing

**Problem**: Changes made offline don't sync

**Solutions**:
1. Ensure using sync hooks, not direct localStorage
2. Check network tab - verify requests sent
3. Check PHP API responses for errors
4. Verify database write permissions
5. Check lastError in queue items

### Duplicate Records

**Problem**: Same data appears multiple times

**Solutions**:
1. Check queue for duplicate items
2. Verify server-side deduplication
3. Clear queue if necessary
4. Use entity ID to match updates
5. Check timestamps for ordering

## Integration with Other Services

### With Authentication
```tsx
// Token included automatically in all API calls
// If token expires, sync queue is preserved
// User can re-authenticate and sync resumes
```

### With Notifications
```tsx
// Integrate sync events with notification system
syncManager.onStatusChange((status) => {
  if (status.failedItems > 0) {
    showNotification('Some changes failed to sync');
  }
});
```

### With Analytics
```tsx
// Track sync metrics
syncManager.onStatusChange((status) => {
  analytics.track('sync_status', {
    queue_length: status.queueLength,
    failed_items: status.failedItems,
    is_online: status.isOnline
  });
});
```

## Performance Considerations

- **Queue stored in localStorage**: Limited to ~5-10MB per browser
- **Auto-sync interval**: 30 seconds (configurable)
- **Max retries**: 3 attempts per item
- **Batch processing**: Items synced sequentially
- **Memory**: Sync manager is a singleton

## Security Notes

- Auth tokens are automatically included in sync requests
- Sensitive data in queue is NOT encrypted in localStorage
- For sensitive data, consider additional encryption
- Token expiration is handled by auth context
- Queue is user-specific (localStorage per browser)

## Future Enhancements

- [ ] Batch upload multiple items in one request
- [ ] Compression for large payloads
- [ ] Encryption for sensitive queue data
- [ ] Sync metrics and analytics
- [ ] Selective field sync (delta sync)
- [ ] Conflict resolution strategies
- [ ] P2P sync between clients
- [ ] IndexedDB for larger offline storage
