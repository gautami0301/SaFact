import React, { useState, useEffect } from 'react';
import { Bell, Filter, Plus, ShieldAlert, CheckCircle2, RefreshCw, FileText } from 'lucide-react';
import AlertsTable from '../components/AlertsTable';
import { api } from '../services/api';

export default function AlertsView() {
  const [incidents, setIncidents] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual dispatch form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSev, setNewSev] = useState('HIGH');
  const [newZone, setNewZone] = useState('ZONE_A');

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAlerts(severityFilter, statusFilter);
      setIncidents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [severityFilter, statusFilter]);

  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      await api.createAlert({
        title: newTitle,
        description: newDesc || 'Manual security notification logged by command desk.',
        severity: newSev,
        zone_id: newZone,
      });
      setShowManualModal(false);
      setNewTitle('');
      setNewDesc('');
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              Alerts & Incident Audit History
            </h2>
            <p className="text-xs text-slate-400 m-0">
              Persisted event logs from SQLite database with acknowledgment workflows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Dispatch Manual Incident
          </button>
          <button
            onClick={fetchIncidents}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-300">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded p-1.5 font-mono"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MODERATE">Moderate Only</option>
            <option value="LOW">Low Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded p-1.5 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Incidents</option>
            <option value="RESOLVED">Resolved Incidents</option>
          </select>
        </div>

        <span className="text-slate-400 font-mono ml-auto">
          {incidents.length} RECORDS FOUND
        </span>
      </div>

      {/* Incident Table */}
      <AlertsTable incidents={incidents} onUpdate={fetchIncidents} />

      {/* Manual Dispatch Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white m-0 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Dispatch Manual Security Incident
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken Barrier in Concourse C"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Details & Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe situational observations..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Severity Level</label>
                  <select
                    value={newSev}
                    onChange={(e) => setNewSev(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sector</label>
                  <select
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  >
                    <option value="ZONE_A">Zone A</option>
                    <option value="ZONE_B">Zone B</option>
                    <option value="ZONE_C">Zone C</option>
                    <option value="ZONE_D">Zone D</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md"
                >
                  Confirm & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
