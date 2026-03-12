/**
 * Data Synchronization Hooks for Different Entities
 * Simplifies syncing of users, tanks, drivers, vehicles, etc.
 */

import { useSyncQueue } from './useSyncStatus';
import { useCallback } from 'react';

interface EntityConfig {
  name: string;
  entityKey: string;
}

// Entity configurations
const ENTITIES = {
  users: { name: 'users', entityKey: 'user_id' },
  tanks: { name: 'tanks', entityKey: 'id' },
  drivers: { name: 'drivers', entityKey: 'id' },
  vehicles: { name: 'vehicles', entityKey: 'vehicle_id' },
  fuelRequests: { name: 'fuel_requests', entityKey: 'request_id' },
  tankIssues: { name: 'tank_issues', entityKey: 'id' },
  paymentRequests: { name: 'payment_requests', entityKey: 'request_id' },
};

/**
 * Hook for syncing user data
 */
export const useSyncUsers = () => {
  const { addToQueue, removeFromQueue } = useSyncQueue();

  const syncCreateUser = useCallback((userData: any) => {
    return addToQueue('users', 'create', userData);
  }, [addToQueue]);

  const syncUpdateUser = useCallback((userId: string, userData: any) => {
    return addToQueue('users', 'update', userData, userId);
  }, [addToQueue]);

  const syncDeleteUser = useCallback((userId: string) => {
    return addToQueue('users', 'delete', null, userId);
  }, [addToQueue]);

  return { syncCreateUser, syncUpdateUser, syncDeleteUser, removeFromQueue };
};

/**
 * Hook for syncing tank data
 */
export const useSyncTanks = () => {
  const { addToQueue, removeFromQueue } = useSyncQueue();

  const syncCreateTank = useCallback((tankData: any) => {
    return addToQueue('tanks', 'create', tankData);
  }, [addToQueue]);

  const syncUpdateTank = useCallback((tankId: string, tankData: any) => {
    return addToQueue('tanks', 'update', tankData, tankId);
  }, [addToQueue]);

  const syncDeleteTank = useCallback((tankId: string) => {
    return addToQueue('tanks', 'delete', null, tankId);
  }, [addToQueue]);

  return { syncCreateTank, syncUpdateTank, syncDeleteTank, removeFromQueue };
};

/**
 * Hook for syncing driver data
 */
export const useSyncDrivers = () => {
  const { addToQueue, removeFromQueue } = useSyncQueue();

  const syncCreateDriver = useCallback((driverData: any) => {
    return addToQueue('drivers', 'create', driverData);
  }, [addToQueue]);

  const syncUpdateDriver = useCallback((driverId: string, driverData: any) => {
    return addToQueue('drivers', 'update', driverData, driverId);
  }, [addToQueue]);

  const syncDeleteDriver = useCallback((driverId: string) => {
    return addToQueue('drivers', 'delete', null, driverId);
  }, [addToQueue]);

  return { syncCreateDriver, syncUpdateDriver, syncDeleteDriver, removeFromQueue };
};

/**
 * Hook for syncing vehicle data
 */
export const useSyncVehicles = () => {
  const { addToQueue, removeFromQueue } = useSyncQueue();

  const syncCreateVehicle = useCallback((vehicleData: any) => {
    return addToQueue('vehicles', 'create', vehicleData);
  }, [addToQueue]);

  const syncUpdateVehicle = useCallback((vehicleId: string, vehicleData: any) => {
    return addToQueue('vehicles', 'update', vehicleData, vehicleId);
  }, [addToQueue]);

  const syncDeleteVehicle = useCallback((vehicleId: string) => {
    return addToQueue('vehicles', 'delete', null, vehicleId);
  }, [addToQueue]);

  return { syncCreateVehicle, syncUpdateVehicle, syncDeleteVehicle, removeFromQueue };
};

/**
 * Hook for syncing fuel requests
 */
export const useSyncFuelRequests = () => {
  const { addToQueue, removeFromQueue } = useSyncQueue();

  const syncCreateRequest = useCallback((requestData: any) => {
    return addToQueue('fuel_requests', 'create', requestData);
  }, [addToQueue]);

  const syncUpdateRequest = useCallback((requestId: string, requestData: any) => {
    return addToQueue('fuel_requests', 'update', requestData, requestId);
  }, [addToQueue]);

  const syncDeleteRequest = useCallback((requestId: string) => {
    return addToQueue('fuel_requests', 'delete', null, requestId);
  }, [addToQueue]);

  return { syncCreateRequest, syncUpdateRequest, syncDeleteRequest, removeFromQueue };
};

/**
 * Hook for syncing tank issues
 */
export const useSyncTankIssues = () => {
  const { addToQueue, removeFromQueue } = useSyncQueue();

  const syncCreateIssue = useCallback((issueData: any) => {
    return addToQueue('tank_issues', 'create', issueData);
  }, [addToQueue]);

  const syncUpdateIssue = useCallback((issueId: string, issueData: any) => {
    return addToQueue('tank_issues', 'update', issueData, issueId);
  }, [addToQueue]);

  const syncDeleteIssue = useCallback((issueId: string) => {
    return addToQueue('tank_issues', 'delete', null, issueId);
  }, [addToQueue]);

  return { syncCreateIssue, syncUpdateIssue, syncDeleteIssue, removeFromQueue };
};

/**
 * Hook for syncing payment requests
 */
export const useSyncPaymentRequests = () => {
  const { addToQueue, removeFromQueue } = useSyncQueue();

  const syncCreatePaymentRequest = useCallback((requestData: any) => {
    return addToQueue('payment_requests', 'create', requestData);
  }, [addToQueue]);

  return { syncCreatePaymentRequest, removeFromQueue };
};

/**
 * Generic entity sync hook
 * Use this for entities not covered by specific hooks
 */
export const useSyncEntity = (entityName: string) => {
  const { addToQueue, removeFromQueue } = useSyncQueue();

  const create = useCallback((data: any) => {
    return addToQueue(entityName, 'create', data);
  }, [entityName, addToQueue]);

  const update = useCallback((entityId: string, data: any) => {
    return addToQueue(entityName, 'update', data, entityId);
  }, [entityName, addToQueue]);

  const delete_ = useCallback((entityId: string) => {
    return addToQueue(entityName, 'delete', null, entityId);
  }, [entityName, addToQueue]);

  return { create, update, delete: delete_, removeFromQueue };
};

export default { useSyncUsers, useSyncTanks, useSyncDrivers, useSyncVehicles };
