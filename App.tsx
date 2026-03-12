
import React, { useState, useEffect } from 'react';
import { UserRole, FuelRequest, Department, User } from './types';
import { MOCK_REQUESTS, MOCK_DEPARTMENTS } from './constants';
import { AuthProvider, useAuth } from './services/authContext';
import AuthGuard from './components/AuthGuard';
import { syncManager } from './services/syncService';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import StoreKeeperDashboard from './views/StoreKeeperDashboard';
import Sidebar from './components/Sidebar';
import NotificationBar from './components/NotificationBar';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import FuelRequests from './views/FuelRequests';
import TankManagement from './views/TankManagement';
import StationManagement from './views/StationManagement';
import TankProfile from './views/TankProfile';
import SecurityManagement from './views/SecurityManagement';
import FMUManagerDashboard from './views/FMUManagerDashboard';
import UserManagement from './views/UserManagement';
import FuelStock from './views/FuelStock';
import FuelConsumption from './views/FuelConsumption';
import SystemReports from './views/SystemReports';
import PlantPerformance from './views/PlantPerformance';
import VehicleDetails from './views/VehicleDetails';
import DriverManagement from './views/DriverManagement';
import FuelRequisition from './views/FuelRequisition';
import DepartmentManagement from './views/DepartmentManagement';
import InvoiceManagement from './views/InvoiceManagement';
import DutyWaiverReconciliation from './views/DutyWaiverReconciliation';
import { listDepartments as apiListDepartments, listTanks as apiListTanks, listStations as apiListStations, listUsers as apiListUsers, listFuelInvoices as apiListInvoices } from './services/apiService_extra';
import { FuelInvoice } from './types';

// Main app content component that requires authentication
const AppContent: React.FC = () => {
  const { currentUser, logout, updateUser } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Set initial view for Plant Manager
  useEffect(() => {
    if (currentUser?.role === UserRole.PLANT_MANAGER && currentView === 'dashboard') {
      setCurrentView('performance');
    }
  }, [currentUser]);

  const [showSyncPanel, setShowSyncPanel] = useState(() => {
    try {
      return localStorage.getItem('fuel_show_sync_panel') === 'true';
    } catch {
      return false;
    }
  });

  // Persist sync panel state
  useEffect(() => {
    localStorage.setItem('fuel_show_sync_panel', String(showSyncPanel));
  }, [showSyncPanel]);
  const [fuelRequests, setFuelRequests] = useState<FuelRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const raw = localStorage.getItem('fuel_departments');
      return raw ? JSON.parse(raw) : MOCK_DEPARTMENTS;
    } catch {
      return MOCK_DEPARTMENTS;
    }
  });
  const [invoices, setInvoices] = useState<FuelInvoice[]>(() => {
    try {
      const raw = localStorage.getItem('fuel_invoices');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Initialize sync manager on mount
  useEffect(() => {
    // Start automatic sync
    // Sync manager is already initialized as singleton

    // Handle sync events
    const handleOnline = () => {
      console.log('✓ Back online - syncing...');
      syncManager.forceSync();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      // Note: We don't stop auto sync here to keep it running
    };
  }, []);

  // load fuel requests from localStorage cache first, then attempt API sync
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fuel_requests');
      if (raw) {
        setFuelRequests(JSON.parse(raw));
      } else {
        setFuelRequests(MOCK_REQUESTS);
      }
    } catch {
      setFuelRequests(MOCK_REQUESTS);
    }

    // attempt API sync in background
    import('./services/apiService').then(({ listFuelRequests }) => {
      listFuelRequests()
        .then((data) => {
          if (data && data.length > 0) {
            setFuelRequests(data);
            localStorage.setItem('fuel_requests', JSON.stringify(data));
            window.dispatchEvent(new Event('fuel_requests:updated'));
          }
        })
        .catch((err) => {
          console.warn('failed to sync fuel requests from API, using cache', err);
        });
    });
  }, []);

  // sync departments from API
  useEffect(() => {
    apiListDepartments()
      .then((data) => {
        if (data && data.length > 0) {
          setDepartments(data);
          localStorage.setItem('fuel_departments', JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.warn('failed to load departments from API, using cache', err);
      });
  }, []);

  // sync tanks from API (background)
  useEffect(() => {
    apiListTanks()
      .then((data) => {
        if (data && data.length > 0) {
          localStorage.setItem('fuel_fleet_tanks', JSON.stringify(data));
          window.dispatchEvent(new Event('tanks:updated'));
        }
      })
      .catch((err) => {
        console.warn('failed to sync tanks from API, using cache', err);
      });
  }, []);

  // sync stations from API (background)
  useEffect(() => {
    apiListStations()
      .then((data) => {
        if (data && data.length > 0) {
          localStorage.setItem('fuel_stations', JSON.stringify(data));
          window.dispatchEvent(new Event('stations_updated'));
        }
      })
      .catch((err) => {
        console.warn('failed to sync stations from API, using cache', err);
      });
  }, []);

  // sync users from API (background)
  useEffect(() => {
    apiListUsers()
      .then((data) => {
        if (data && data.length > 0) {
          localStorage.setItem('fuel_fleet_users', JSON.stringify(data));
          window.dispatchEvent(new Event('users:updated'));
        }
      })
      .catch((err) => {
        console.warn('failed to sync users from API, using cache', err);
      });
  }, []);

  // sync invoices from API (background)
  useEffect(() => {
    apiListInvoices()
      .then((data) => {
        if (data && data.length > 0) {
          localStorage.setItem('fuel_invoices', JSON.stringify(data));
          window.dispatchEvent(new Event('invoices:updated'));
          setInvoices(data);
        }
      })
      .catch((err) => {
        console.warn('failed to sync invoices from API, using cache', err);
      });
  }, []);

  // Manager-only specialized Reports & Analytics communication logic
  useEffect(() => {
    if (currentUser?.role === UserRole.MANAGER) {
      const timer = setTimeout(() => {
        // Trigger a system notification about consolidated reporting
        window.dispatchEvent(new CustomEvent('notification:new', {
          detail: {
            type: 'system',
            title: '📋 Reports Consolidated',
            message: 'All system-wide reports and analytics are now exclusively consolidated for Manager review. Real-time insights are now active.',
            actionBy: 'FMU System AI',
            icon: '📊'
          }
        }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    setCurrentView('dashboard');
  };

  if (!currentUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        if (currentUser.role === UserRole.PLANT_MANAGER) return <PlantPerformance />;
        return currentUser.role === UserRole.STORE_KEEPER 
          ? <StoreKeeperDashboard currentUser={currentUser} />
          : <Dashboard userRole={currentUser.role} />;
      case 'requests':
        return <FuelRequests fuelRequests={fuelRequests} setFuelRequests={setFuelRequests} currentUser={currentUser} />;
      case 'stock':
        return <FuelStock />;
      case 'consumption':
        return <FuelConsumption />;
      case 'tanks':
        return <TankManagement />;
      case 'stations':
        return <StationManagement />;
      case 'tank-profile':
        return <TankProfile onBack={() => setCurrentView('tanks')} />;
      case 'security':
        return <SecurityManagement currentUser={currentUser} />;
      case 'manager-dashboard':
        return currentUser.role === UserRole.MANAGER 
          ? <FMUManagerDashboard fuelRequests={fuelRequests} setFuelRequests={setFuelRequests} />
          : <Dashboard userRole={currentUser.role} />;
      case 'users':
        return <UserManagement />;
      case 'performance':
        return (currentUser.role === UserRole.MANAGER || currentUser.role === UserRole.PLANT_MANAGER)
          ? <PlantPerformance />
          : <Dashboard userRole={currentUser.role} />;
      case 'fleet':
        // Fleet view is Manager only
        return currentUser.role === UserRole.MANAGER ? <VehicleDetails /> : <Dashboard userRole={currentUser.role} />;
      case 'fuel-chit':
        // Fuel requisition is Manager only
        return currentUser.role === UserRole.MANAGER 
          ? <FuelRequisition departments={departments} setDepartments={setDepartments} /> 
          : <Dashboard userRole={currentUser.role} />;
      case 'drivers':
        return <DriverManagement />;
      case 'departments':
        return <DepartmentManagement departments={departments} setDepartments={setDepartments} currentUser={currentUser} />;
      case 'invoices':
        return <InvoiceManagement invoices={invoices} setInvoices={setInvoices} fuelRequests={fuelRequests} />;
      case 'duty-waiver':
        return <DutyWaiverReconciliation currentUser={currentUser} />;
      case 'reports':
        return currentUser.role === UserRole.MANAGER 
          ? <SystemReports fuelRequests={fuelRequests} />
          : <Dashboard userRole={currentUser.role} />;
      case 'settings':
        return (
          <div className="p-12 bg-white rounded-3xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
            <span className="text-5xl mb-4">⚙️</span>
            <h2 className="text-2xl font-bold">System Settings</h2>
            <p className="text-gray-500 mt-2">General system configuration and preferences coming soon.</p>
          </div>
        );
      default:
        return <Dashboard userRole={currentUser.role} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar 
        role={currentUser.role}
        currentUser={currentUser}
        currentView={currentView} 
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        onUpdateUser={(u: User) => {
          updateUser(u);
          // also update users list cache if present
          try {
            const raw = localStorage.getItem('fuel_fleet_users');
            if (raw) {
              const arr = JSON.parse(raw);
              const updated = arr.map((x: any) => x.id === u.id ? { ...x, photo: u.photo, name: u.name, role: u.role } : x);
              localStorage.setItem('fuel_fleet_users', JSON.stringify(updated));
              window.dispatchEvent(new Event('users:updated'));
            }
          } catch {}
        }}
      />

      {/* Manager-only Notification Bar */}
      {currentUser.role === UserRole.MANAGER && <NotificationBar isManagerOnly={true} />}
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto max-h-screen">
        {/* Top Navigation / Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <button type="button" className="lg:hidden p-2 text-gray-600">
              ☰
            </button>
            <div className="flex flex-col">
              <span className="text-xs text-indigo-600 font-bold uppercase tracking-widest">{currentView}</span>
              <h1 className="text-xl font-bold text-gray-900">Workplace Overview</h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Sync Status Button */}
            <button
              type="button"
              onClick={() => setShowSyncPanel(!showSyncPanel)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition group"
            >
              <span className="text-xl">🔄</span>
              <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Sync Status
              </div>
            </button>

            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{(currentUser.role === UserRole.MANAGER || currentUser.role === UserRole.PLANT_MANAGER) ? '👑 ' + currentUser.role : currentUser.role}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl overflow-hidden flex items-center justify-center font-bold text-indigo-600">
                {currentUser.photo ? (
                  <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">{currentUser.name.split(' ').map((n: string) => n[0]).join('')}</div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Sync Status Panel */}
        {showSyncPanel && (
          <div className="mb-8 max-w-md ml-auto">
            <SyncStatusIndicator />
          </div>
        )}

        {renderView()}

        {/* Floating AI Assistant Trigger (Simulated) - Manager Only Reports & Analytics Communication */}
        {currentUser.role === UserRole.MANAGER && (
          <div className="fixed bottom-8 right-8 z-20">
            <button 
              type="button"
              className="w-14 h-14 bg-indigo-600 rounded-full shadow-2xl shadow-indigo-500/50 flex items-center justify-center text-2xl hover:scale-110 transition-transform cursor-pointer group relative"
              onClick={() => alert('Gemini FMU Assistant: "Manager, I have analyzed the Reports & Analytics for the entire system. All stations, tanks and fuel consumption records are consolidated. Current health score is ' + (Math.floor(Math.random() * 15) + 85) + '%. Should I generate the final monthly report for all departments?"')}
            >
              <span>✨</span>
              <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 text-sm font-medium text-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                AI Reporting Assistant
              </div>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// Main App wrapper that provides authentication context
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthGuard fallback={<Login />}>
        <AppContent />
      </AuthGuard>
    </AuthProvider>
  );
};

export default App;
