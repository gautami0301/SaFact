import React, { useState } from 'react';
import { ShieldAlert, Check, CheckCircle2, Clock, Filter, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function AlertsTable({ incidents, onUpdate }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleAcknowledge = async (id) => {
    setLoadingId(id);
    try {
      await api.acknowledgeAlert(id);
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleResolve = async (id) => {
    setLoadingId(id);
    try {
      await api.resolveAlert(id);
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-950/70 text-rose-300 border-rose-800';
      case 'HIGH':
        return 'bg-orange-950/70 text-orange-300 border-orange-800';
      case 'MODERATE':
        return 'bg-amber-950/70 text-amber-300 border-amber-800';
      default:
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white m-0">
              Active Incidents & Alerts Log
            </h3>
            <p className="text-xs text-slate-400 m-0">
              Recorded in SQLite audit database
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">ID / Time</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Incident Description</th>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {incidents && incidents.length > 0 ? (
              incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono">
                    <span className="font-bold text-white block">{inc.id}</span>
                    <span className="text-[11px] text-slate-400">{inc.datetime_str}</span>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(
                        inc.severity
                      )}`}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <strong className="text-white block font-medium">{inc.title}</strong>
                    <span className="text-slate-400 text-[11px] line-clamp-1">
                      {inc.description}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">
                    {inc.zone_id || 'GENERAL'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        inc.status === 'ACTIVE'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          inc.status === 'ACTIVE' ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'
                        }`}
                      />
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {inc.status === 'ACTIVE' && (
                      <>
                        {!inc.acknowledged && (
                          <button
                            onClick={() => handleAcknowledge(inc.id)}
                            disabled={loadingId === inc.id}
                            className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            Ack
                          </button>
                        )}
                        <button
                          onClick={() => handleResolve(inc.id)}
                          disabled={loadingId === inc.id}
                          className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-colors disabled:opacity-50"
                        >
                          Resolve
                        </button>
                      </>
                    )}
                    {inc.status === 'RESOLVED' && (
                      <span className="text-slate-500 text-[11px] italic">Completed</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-500 text-xs">
                  No incident records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
