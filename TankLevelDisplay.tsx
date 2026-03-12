import React, { useState, useEffect } from 'react';
import { Tank, FuelType, DailyTankIssue } from '../types';

interface Station {
  id: string;
  name: string;
  location: string;
  manager: string;
  tanks: Tank[];
  totalCapacity: number;
  totalStock: number;
  utilizationPercent: number;
}

interface TankLevelDisplayProps {
  stationId: string;
}

const TankLevelDisplay: React.FC<TankLevelDisplayProps> = ({ stationId }) => {
  const [station, setStation] = useState<Station | null>(null);
  const [editingTank, setEditingTank] = useState<{ tankId: string; value: number } | null>(null);
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const [tankIssues, setTankIssues] = useState<DailyTankIssue[]>([]);
  const [viewTab, setViewTab] = useState<'overview' | 'issues'>('overview');

  useEffect(() => {
    const loadStationData = () => {
      const saved = localStorage.getItem('fuel_stock_stations');
      if (saved) {
        try {
          const stations: Station[] = JSON.parse(saved);
          const foundStation = stations.find(s => s.id === stationId);
          if (foundStation) {
            setStation(foundStation);
          }
        } catch (e) {
          console.error('Failed to load station data:', e);
        }
      }
    };

    loadStationData();

    // Listen for updates from FuelStock
    const handleUpdate = () => loadStationData();
    window.addEventListener('fuel_stock:updated', handleUpdate);
    return () => window.removeEventListener('fuel_stock:updated', handleUpdate);
  }, [stationId]);

  // Load tank issues for the selected tank
  useEffect(() => {
    if (!selectedTankId) {
      setTankIssues([]);
      return;
    }

    const saved = localStorage.getItem('daily_tank_issues');
    if (saved) {
      try {
        const allIssues: DailyTankIssue[] = JSON.parse(saved);
        const filtered = allIssues.filter(
          issue => issue.stationId === stationId && issue.tankId === selectedTankId
        );
        setTankIssues(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (e) {
        console.error('Failed to load tank issues:', e);
      }
    }
  }, [selectedTankId, stationId]);

  const handleUpdateTankLevel = (tankId: string) => {
    if (!editingTank || !station) return;

    const newLevel = editingTank.value;
    if (newLevel < 0 || isNaN(newLevel)) {
      alert('Please enter a valid quantity');
      return;
    }

    // Update the station data in localStorage
    const saved = localStorage.getItem('fuel_stock_stations');
    if (saved) {
      try {
        const stations: Station[] = JSON.parse(saved);
        const updatedStations = stations.map(s => {
          if (s.id === station.id) {
            const updatedTanks = s.tanks.map(t => {
              if (t.id === tankId) {
                return { ...t, currentLevel: newLevel };
              }
              return t;
            });
            const newTotalStock = updatedTanks.reduce((sum, t) => sum + t.currentLevel, 0);
            const newUtilization = (newTotalStock / s.totalCapacity) * 100;
            return {
              ...s,
              tanks: updatedTanks,
              totalStock: newTotalStock,
              utilizationPercent: newUtilization,
            };
          }
          return s;
        });
        localStorage.setItem('fuel_stock_stations', JSON.stringify(updatedStations));
        setStation(updatedStations.find(s => s.id === station.id) || null);
        setEditingTank(null);
        window.dispatchEvent(new Event('fuel_stock:updated'));

        // also update global tankData store so dashboard can read latest levels
        try {
          const savedTankData = localStorage.getItem('fuel_stock_tank_data');
          if (savedTankData) {
            const tanks = JSON.parse(savedTankData) as any[];
            const updated = tanks.map(t =>
              t.id === tankId ? { ...t, currentLevel: newLevel, lastModified: new Date().toISOString() } : t
            );
            localStorage.setItem('fuel_stock_tank_data', JSON.stringify(updated));
          }
        } catch (err) {
          console.error('Failed to sync tank data global store', err);
        }
      } catch (e) {
        console.error('Failed to update tank level:', e);
      }
    }
  };

  if (!station) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl mb-4 block">⚠️</span>
        <p className="text-gray-600">No station data available</p>
      </div>
    );
  }

  const getUtilizationColor = (value: number): { bg: string; text: string; bar: string } => {
    if (value < 20) return { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' };
    if (value < 40) return { bg: 'bg-orange-50', text: 'text-orange-700', bar: 'bg-orange-500' };
    if (value < 70) return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' };
    if (value < 90) return { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' };
    return { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' };
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Reported':
        return 'bg-gray-100 text-gray-800';
      case 'Investigating':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {selectedTankId ? (
        // Tank Issues View
        <div>
          <button
            onClick={() => {
              setSelectedTankId(null);
              setViewTab('overview');
            }}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold text-sm transition-colors"
          >
            ← Back to Tank Overview
          </button>

          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-gray-200 mb-6">
            <button
              onClick={() => setViewTab('overview')}
              className={`px-6 py-3 font-semibold transition-colors ${
                viewTab === 'overview'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Tank Details
            </button>
            <button
              onClick={() => setViewTab('issues')}
              className={`px-6 py-3 font-semibold transition-colors ${
                viewTab === 'issues'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚠️ Issues ({tankIssues.length})
            </button>
          </div>

          {/* Tank Overview Tab */}
          {viewTab === 'overview' && station && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              {station.tanks.find(t => t.id === selectedTankId) && (
                <div>
                  {(() => {
                    const tank = station.tanks.find(t => t.id === selectedTankId)!;
                    const utilization = (tank.currentLevel / tank.capacity) * 100;
                    const colors = getUtilizationColor(utilization);

                    return (
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">{tank.name}</h3>
                            <p className="text-gray-600">Tank ID: {tank.id}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                              tank.fuelType === FuelType.HFO
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {tank.fuelType}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className={`${colors.bg} p-4 rounded-lg`}>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Current Level</p>
                            <p className="text-2xl font-bold text-gray-900">{tank.currentLevel.toLocaleString()} L</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Capacity</p>
                            <p className="text-2xl font-bold text-gray-900">{tank.capacity.toLocaleString()} L</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Dead Stock</p>
                            <p className="text-2xl font-bold text-gray-900">{tank.deadStock.toLocaleString()} L</p>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Available Space</p>
                            <p className="text-2xl font-bold text-gray-900">{(tank.capacity - tank.currentLevel).toLocaleString()} L</p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-700">Utilization</span>
                            <span className={`text-lg font-bold ${colors.text}`}>{utilization.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
                            <div
                              className={`${colors.bar} h-4 rounded-full transition-all duration-300 w-[${Math.min(utilization, 100)}%]`}
                              role="progressbar"
                              aria-label={`Tank utilization: ${utilization.toFixed(1)}%`}
                            />
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          <p>Installation Date: <span className="font-semibold">{tank.installationDate}</span></p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Issues Tab */}
          {viewTab === 'issues' && (
            <div className="bg-white rounded-2xl border border-gray-100">
              {tankIssues.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-5xl mb-4 block">✅</span>
                  <p className="text-gray-600 font-semibold">No issues reported for this tank</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-900 text-sm">Date & Time</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-900 text-sm">Issue Type</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-900 text-sm">Description</th>
                        <th className="px-6 py-3 text-center font-semibold text-gray-900 text-sm">Severity</th>
                        <th className="px-6 py-3 text-center font-semibold text-gray-900 text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tankIssues.map((issue) => (
                        <tr key={issue.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="font-semibold">{issue.date}</div>
                            <div className="text-xs text-gray-600">{issue.time}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                            {issue.issueType === 'Leak' && '🚨'}
                            {issue.issueType === 'Overflow' && '💦'}
                            {issue.issueType === 'Contamination' && '⚗️'}
                            {issue.issueType === 'Discrepancy' && '📊'}
                            {issue.issueType === 'Hardware' && '🔧'}
                            {issue.issueType === 'Calibration' && '📏'}
                            {' '}{issue.issueType}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{issue.description}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(issue.status)}`}>
                              {issue.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Tank Overview View
        <div className="space-y-6">
      {/* Station Info Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-2xl border-2 border-indigo-200">
        <h3 className="text-2xl font-bold text-indigo-900 mb-2">{station.name}</h3>
        <p className="text-indigo-700 mb-4">📍 {station.location} • Manager: {station.manager}</p>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Total Capacity</p>
            <p className="text-2xl font-bold text-indigo-900">{station.totalCapacity.toLocaleString()} L</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-600">Current Stock</p>
            <p className="text-2xl font-bold text-indigo-900">{station.totalStock.toLocaleString()} L</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-600">Utilization</p>
            <p className="text-2xl font-bold text-indigo-900">{station.utilizationPercent.toFixed(1)}%</p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-indigo-700 font-semibold">Tank Occupancy</span>
            <span className="text-indigo-900 font-bold">
              {station.totalStock.toLocaleString()} / {station.totalCapacity.toLocaleString()} L
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
            <div
              className={`bg-indigo-600 h-4 rounded-full transition-all duration-300 w-[${Math.min(station.utilizationPercent, 100)}%]`}
              role="progressbar"
              aria-label={`Station occupancy: ${station.totalStock.toLocaleString()} of ${station.totalCapacity.toLocaleString()} liters`}
            />
          </div>
        </div>
      </div>

      {/* Individual Tanks */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-gray-900">⛽ Tank Details ({station.tanks.length} tanks)</h4>

        {station.tanks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <span className="text-5xl mb-4 block">🚫</span>
            <p className="text-gray-600">No tanks assigned to this station</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {station.tanks.map((tank) => {
              const utilization = (tank.currentLevel / tank.capacity) * 100;
              const availableSpace = tank.capacity - tank.currentLevel;
              const colors = getUtilizationColor(utilization);
              const isEditing = editingTank?.tankId === tank.id;

              return (
                <div
                  key={tank.id}
                  className={`${colors.bg} p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-400 transition-all shadow-sm`}
                >
                  {/* Tank Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5 className="text-lg font-bold text-gray-900">{tank.name}</h5>
                      <p className="text-sm text-gray-600">Tank ID: {tank.id}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        tank.fuelType === FuelType.HFO
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tank.fuelType}
                    </span>
                  </div>

                  {/* Tank Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Current Level</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {tank.currentLevel.toLocaleString()} L
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Capacity</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {tank.capacity.toLocaleString()} L
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Dead Stock</p>
                      <p className="text-lg font-bold text-gray-900">
                        {tank.deadStock.toLocaleString()} L
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Available Space</p>
                      <p className="text-lg font-bold text-gray-900">
                        {availableSpace.toLocaleString()} L
                      </p>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">Utilization</span>
                      <span className={`text-lg font-bold ${colors.text}`}>
                        {utilization.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
                        <div
                          className={`${colors.bar} h-4 rounded-full transition-all duration-300 w-[${Math.min(utilization, 100)}%]`}
                          role="progressbar"
                          aria-label={`Tank ${tank.name} utilization: ${utilization.toFixed(1)}%`}
                        />
                    </div>
                  </div>

                  {/* Installation Date */}
                  <div className="text-sm text-gray-600 mb-4">
                    Installation Date: <span className="font-semibold">{tank.installationDate}</span>
                  </div>

                  {/* Edit Level Button */}
                  {!isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingTank({ tankId: tank.id, value: tank.currentLevel })}
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-semibold text-sm transition-colors"
                      >
                        ✏️ Update Level
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTankId(tank.id);
                          setViewTab('issues');
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm transition-colors"
                      >
                        ⚠️ View Issues
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={editingTank.value}
                        onChange={(e) =>
                          setEditingTank({ tankId: tank.id, value: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="Enter current level (L)"
                        className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateTankLevel(tank.id)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm transition-colors"
                        >
                          ✅ Save
                        </button>
                        <button
                          onClick={() => setEditingTank(null)}
                          className="flex-1 px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tank Status Summary */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100">
        <h5 className="text-lg font-bold text-gray-900 mb-4">📊 Tank Status Summary</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-xs text-green-600 font-semibold">Adequate Level</p>
            <p className="text-2xl font-bold text-green-700">
              {station.tanks.filter(t => (t.currentLevel / t.capacity) * 100 >= 70).length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-600 font-semibold">Fair Level</p>
            <p className="text-2xl font-bold text-yellow-700">
              {station.tanks.filter(t => (t.currentLevel / t.capacity) * 100 >= 40 && (t.currentLevel / t.capacity) * 100 < 70).length}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-600 font-semibold">Low Level</p>
            <p className="text-2xl font-bold text-orange-700">
              {station.tanks.filter(t => (t.currentLevel / t.capacity) * 100 >= 20 && (t.currentLevel / t.capacity) * 100 < 40).length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-xs text-red-600 font-semibold">Critical Level</p>
            <p className="text-2xl font-bold text-red-700">
              {station.tanks.filter(t => (t.currentLevel / t.capacity) * 100 < 20).length}
            </p>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default TankLevelDisplay;
