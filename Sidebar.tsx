
import React from 'react';
import { UserRole, User } from '../types';

interface SidebarProps {
  role: UserRole;
  currentUser?: User;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  roles: UserRole[];
  section: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role, currentUser, currentView, onViewChange, onLogout, onUpdateUser }) => {
  const [fleetOpen, setFleetOpen] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const handleProfileClick = () => {
    if (fileRef.current) fileRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f || !currentUser) return;
    // read as data URL fallback
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result);
      // try server upload if token present
      try {
        const token = localStorage.getItem('fuel_fleet_auth_token');
        if (token) {
          const form = new FormData();
          form.append('file', f);
          const res = await fetch('/fuel-fleet-api/api.php?action=upload_attachment', {
            method: 'POST', body: form, headers: { 'Authorization': 'Bearer ' + token }
          });
          const j = await res.json();
          if (j.url) {
            const updated: User = { ...currentUser, photo: j.url };
            onUpdateUser?.(updated);
            return;
          }
        }
      } catch (err) {
        // ignore and fallback to dataUrl
      }
      const updated: User = { ...currentUser, photo: dataUrl };
      onUpdateUser?.(updated);
    };
    reader.readAsDataURL(f);
  };
  
  
    const navItems: NavItem[] = [
    // Main
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: [UserRole.MANAGER, UserRole.OFFICER, UserRole.STORE_KEEPER], section: 'main' },
    
    // Operations (Manager/Officer only)
    { id: 'requests', label: 'Fuel Requests', icon: '⛽', roles: [UserRole.MANAGER, UserRole.OFFICER], section: 'operations' },
    { id: 'stock', label: 'Fuel Stock Levels', icon: '📦', roles: [UserRole.MANAGER], section: 'operations' },
    { id: 'consumption', label: 'Fuel Consumption', icon: '📈', roles: [UserRole.MANAGER], section: 'operations' },
    { id: 'invoices', label: 'Supplier Invoices', icon: '🧾', roles: [UserRole.MANAGER, UserRole.OFFICER], section: 'operations' },
    { id: 'fleet', label: 'Fleet Management', icon: '🚚', roles: [UserRole.MANAGER], section: 'operations' },
    
    // Infrastructure & Management
    { id: 'stations', label: 'Station Management', icon: '🏭', roles: [UserRole.MANAGER], section: 'infrastructure' },
    { id: 'tanks', label: 'Tank Management', icon: '🛢️', roles: [UserRole.MANAGER], section: 'infrastructure' },
    { id: 'drivers', label: 'Driver Management', icon: '🧑‍✈️', roles: [UserRole.MANAGER], section: 'infrastructure' },
    { id: 'departments', label: 'Departments', icon: '🏢', roles: [UserRole.MANAGER, UserRole.OFFICER], section: 'infrastructure' },
    
    // Analytics & Reports
    { id: 'manager-dashboard', label: 'Manager Dashboard', icon: '📈', roles: [UserRole.MANAGER], section: 'analytics' },
    { id: 'performance', label: 'Plant Performance', icon: '🎯', roles: [UserRole.MANAGER, UserRole.PLANT_MANAGER], section: 'analytics' },
    { id: 'duty-waiver', label: 'Duty-Waiver Reconciliation', icon: '🧾', roles: [UserRole.MANAGER], section: 'analytics' },
    { id: 'reports', label: 'Reports & Analytics', icon: '📃', roles: [UserRole.MANAGER], section: 'analytics' },
    
    // Administration
    { id: 'users', label: 'User Management', icon: '👥', roles: [UserRole.MANAGER], section: 'admin' },
    { id: 'security', label: 'Security', icon: '🔐', roles: [UserRole.MANAGER], section: 'admin' },
    { id: 'settings', label: 'Settings', icon: '⚙️', roles: [UserRole.MANAGER], section: 'admin' },
  ];const filteredItems = navItems.filter(item => item.roles.includes(role));

  // Group items by section
  const groupedItems: { [key: string]: NavItem[] } = {};
  filteredItems.forEach(item => {
    if (!groupedItems[item.section]) {
      groupedItems[item.section] = [];
    }
    groupedItems[item.section].push(item);
  });

  const sectionOrder = ['main', 'operations', 'infrastructure', 'analytics', 'admin'];
  const sectionLabels: { [key: string]: string } = {
    main: 'MAIN',
    operations: 'OPERATIONS',
    infrastructure: 'INFRASTRUCTURE',
    analytics: 'ANALYTICS & INSIGHTS',
    admin: 'ADMINISTRATION'
  };

  const fleetSubItems = [
    { id: 'fleet', label: 'Vehicle Details', icon: '🚗' },
    { id: 'fuel-chit', label: 'Requisition Chit', icon: '📄' },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white p-4 shadow-xl z-10 flex flex-col overflow-y-auto">
      {/* Logo Section */}
      <div className="mb-8 px-2 flex items-center gap-3 sticky top-0">
        <div onClick={handleProfileClick} className="cursor-pointer w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-slate-800">
          {currentUser?.photo ? (
            <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold">F</div>
          )}
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white truncate">{currentUser?.name || 'FUEL & FLEET'}</div>
          <div className="text-xs text-slate-300">{currentUser?.role === UserRole.MANAGER ? '👑 ' + currentUser?.role : currentUser?.role}</div>
        </div>
        <input ref={fileRef} title="Upload profile photo" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 space-y-6">
        {sectionOrder.map((section) => {
          const items = groupedItems[section];
          if (!items || items.length === 0) return null;

          return (
            <div key={section} className="space-y-2">
              {/* Section Header */}
              <div className="px-4 pt-4 pb-2 border-b border-slate-700">
                <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">{sectionLabels[section]}</p>
              </div>

              {/* Section Items */}
              {items.map(item => (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => {
                      if (item.id === 'fleet') {
                        setFleetOpen(prev => !prev);
                      }
                      onViewChange(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      currentView === item.id || (item.id === 'fleet' && (currentView === 'fleet' || currentView === 'fuel-chit'))
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <span className="font-medium truncate">{item.label}</span>
                    {item.id === 'fleet' && (
                      <span className={`ml-auto text-sm transition-transform ${fleetOpen ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    )}
                  </button>

                  {/* Fleet Submenu */}
                  {item.id === 'fleet' && fleetOpen && (
                    <div className="ml-4 mt-2 space-y-1">
                      {fleetSubItems.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => onViewChange(sub.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                            currentView === sub.id
                              ? 'bg-indigo-500 text-white'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                          title={sub.label}
                        >
                          <span className="text-base">{sub.icon}</span>
                          <span className="truncate">{sub.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-slate-700 my-4"></div>

      {/* Sign Out Button */}
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-slate-400 hover:bg-red-600/20 hover:text-red-300 group mb-4"
        title="Sign out and go to login"
      >
        <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
        <span className="font-medium">Sign Out</span>
      </button>

      {/* Bottom User Info */}
      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Active User</p>
        <p className="text-sm font-semibold text-indigo-300 truncate">
          {currentUser?.name || role}
        </p>
        {(currentUser?.role === UserRole.MANAGER || currentUser?.role === UserRole.PLANT_MANAGER) && (
          <p className="text-xs text-yellow-400 mt-1 font-bold">👑 {currentUser?.role}</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

