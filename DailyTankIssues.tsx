import React, { useState, useEffect } from 'react';
import { DailyTankIssue, TankIssueSeverity, TankIssueStatus } from '../types';

interface DailyTankIssuesProps {
  stationId: string;
  tankId?: string;
  currentUserName: string;
}

const DailyTankIssues: React.FC<DailyTankIssuesProps> = ({ stationId, tankId, currentUserName }) => {
  const [issues, setIssues] = useState<DailyTankIssue[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterTankId, setFilterTankId] = useState(tankId || '');
  const [filterStatus, setFilterStatus] = useState<TankIssueStatus | 'All'>('All');

  // Form state
  const [formData, setFormData] = useState({
    tankId: tankId || '',
    tankName: '',
    issueType: 'Other' as 'Leak' | 'Overflow' | 'Contamination' | 'Discrepancy' | 'Hardware' | 'Calibration' | 'Other',
    description: '',
    severity: TankIssueSeverity.MEDIUM,
    estimatedLitresLost: '0',
  });

  // Load issues from localStorage
  useEffect(() => {
    loadIssues();
  }, [stationId]);

  const loadIssues = () => {
    const saved = localStorage.getItem('daily_tank_issues');
    if (saved) {
      try {
        const allIssues: DailyTankIssue[] = JSON.parse(saved);
        const filtered = allIssues.filter(issue => issue.stationId === stationId);
        setIssues(filtered);
      } catch (e) {
        console.error('Failed to load issues:', e);
      }
    }
  };

  const saveIssues = (updatedIssues: DailyTankIssue[]) => {
    const saved = localStorage.getItem('daily_tank_issues');
    const allIssues: DailyTankIssue[] = saved ? JSON.parse(saved) : [];
    const filtered = allIssues.filter(issue => issue.stationId !== stationId);
    const combined = [...filtered, ...updatedIssues];
    localStorage.setItem('daily_tank_issues', JSON.stringify(combined));
    setIssues(updatedIssues);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tankId || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const newIssue: DailyTankIssue = {
      id: `ISSUE-${Date.now()}`,
      stationId,
      tankId: formData.tankId,
      tankName: formData.tankName,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      issueType: formData.issueType,
      description: formData.description,
      severity: formData.severity,
      status: TankIssueStatus.REPORTED,
      reportedBy: currentUserName,
      estimatedLitresLost: formData.estimatedLitresLost ? parseFloat(formData.estimatedLitresLost) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveIssues([newIssue, ...issues]);
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      tankId: tankId || '',
      tankName: '',
      issueType: 'Other',
      description: '',
      severity: TankIssueSeverity.MEDIUM,
      estimatedLitresLost: '0',
    });
  };

  const updateIssueStatus = (issueId: string, newStatus: TankIssueStatus) => {
    const updated = issues.map(issue =>
      issue.id === issueId
        ? { ...issue, status: newStatus, updatedAt: new Date().toISOString() }
        : issue
    );
    saveIssues(updated);
  };

  const deleteIssue = (issueId: string) => {
    if (confirm('Are you sure you want to delete this issue?')) {
      const updated = issues.filter(issue => issue.id !== issueId);
      saveIssues(updated);
    }
  };

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const dateMatch = issue.date === filterDate;
    const tankMatch = !filterTankId || issue.tankId === filterTankId;
    const statusMatch = filterStatus === 'All' || issue.status === filterStatus;
    return dateMatch && tankMatch && statusMatch;
  });

  const getSeverityColor = (severity: TankIssueSeverity) => {
    switch (severity) {
      case TankIssueSeverity.LOW:
        return 'bg-blue-100 text-blue-800';
      case TankIssueSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case TankIssueSeverity.HIGH:
        return 'bg-orange-100 text-orange-800';
      case TankIssueSeverity.CRITICAL:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusColor = (status: TankIssueStatus) => {
    switch (status) {
      case TankIssueStatus.REPORTED:
        return 'bg-gray-100 text-gray-800';
      case TankIssueStatus.INVESTIGATING:
        return 'bg-blue-100 text-blue-800';
      case TankIssueStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case TankIssueStatus.ESCALATED:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-2xl border border-red-200">
        <h3 className="text-2xl font-bold text-red-900 mb-2">⚠️ Daily Tank Issues</h3>
        <p className="text-red-700">Track, report, and manage tank issues on a daily basis</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              title="Select date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tank</label>
            <input
              type="text"
              placeholder="All tanks"
              value={filterTankId}
              onChange={(e) => setFilterTankId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              aria-label="Filter by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TankIssueStatus | 'All')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="All">All</option>
              <option value={TankIssueStatus.REPORTED}>Reported</option>
              <option value={TankIssueStatus.INVESTIGATING}>Investigating</option>
              <option value={TankIssueStatus.RESOLVED}>Resolved</option>
              <option value={TankIssueStatus.ESCALATED}>Escalated</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
            >
              {showForm ? '✕ Cancel' : '➕ Report Issue'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 mb-6">Report New Tank Issue</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tank ID *</label>
                <input
                  type="text"
                  placeholder="Tank identifier"
                  value={formData.tankId}
                  onChange={(e) => setFormData({ ...formData, tankId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tank Name</label>
                <input
                  type="text"
                  placeholder="Tank name (optional)"
                  value={formData.tankName}
                  onChange={(e) => setFormData({ ...formData, tankName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Type *</label>
                <select
                  aria-label="Issue type"
                  value={formData.issueType}
                  onChange={(e) => setFormData({ ...formData, issueType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="Leak">🚨 Leak</option>
                  <option value="Overflow">💦 Overflow</option>
                  <option value="Contamination">⚗️ Contamination</option>
                  <option value="Discrepancy">📊 Discrepancy</option>
                  <option value="Hardware">🔧 Hardware Damage</option>
                  <option value="Calibration">📏 Calibration Issue</option>
                  <option value="Other">❓ Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Severity *</label>
                <select
                  aria-label="Issue severity"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as TankIssueSeverity })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value={TankIssueSeverity.LOW}>🟢 Low</option>
                  <option value={TankIssueSeverity.MEDIUM}>🟡 Medium</option>
                  <option value={TankIssueSeverity.HIGH}>🟠 High</option>
                  <option value={TankIssueSeverity.CRITICAL}>🔴 Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                placeholder="Detailed description of the issue..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            {formData.issueType === 'Leak' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Litres Lost</label>
                <input
                  type="number"
                  placeholder="Estimated loss in litres"
                  value={formData.estimatedLitresLost}
                  onChange={(e) => setFormData({ ...formData, estimatedLitresLost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
              >
                ✅ Submit Issue Report
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="flex-1 px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issues List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">✅</span>
            <p className="text-gray-600 font-semibold">No issues recorded for selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 text-sm">Date & Time</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 text-sm">Tank</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 text-sm">Issue Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 text-sm">Description</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-900 text-sm">Severity</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-900 text-sm">Status</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-900 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-semibold">{issue.date}</div>
                      <div className="text-xs text-gray-600">{issue.time}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-gray-900">{issue.tankId}</div>
                      {issue.tankName && <div className="text-xs text-gray-600">{issue.tankName}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {issue.issueType === 'Leak' && '🚨'}
                      {issue.issueType === 'Overflow' && '💦'}
                      {issue.issueType === 'Contamination' && '⚗️'}
                      {issue.issueType === 'Discrepancy' && '📊'}
                      {issue.issueType === 'Hardware' && '🔧'}
                      {issue.issueType === 'Calibration' && '📏'}
                      {issue.issueType === 'Other' && '❓'}
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
                    <td className="px-6 py-4 text-center">
                      <select
                        aria-label="Update issue status"
                        value={issue.status}
                        onChange={(e) => updateIssueStatus(issue.id, e.target.value as TankIssueStatus)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs font-semibold focus:ring-2 focus:ring-red-500"
                      >
                        {Object.values(TankIssueStatus).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => deleteIssue(issue.id)}
                        className="ml-2 px-2 py-1 text-red-600 hover:bg-red-100 rounded transition-colors text-sm"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold">Total Issues (Today)</p>
          <p className="text-2xl font-bold text-gray-900">{filteredIssues.length}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-xs text-red-600 font-semibold">Critical</p>
          <p className="text-2xl font-bold text-red-900">
            {filteredIssues.filter(i => i.severity === TankIssueSeverity.CRITICAL).length}
          </p>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg">
          <p className="text-xs text-orange-600 font-semibold">High Priority</p>
          <p className="text-2xl font-bold text-orange-900">
            {filteredIssues.filter(i => i.severity === TankIssueSeverity.HIGH).length}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-xs text-green-600 font-semibold">Resolved</p>
          <p className="text-2xl font-bold text-green-900">
            {filteredIssues.filter(i => i.status === TankIssueStatus.RESOLVED).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyTankIssues;
