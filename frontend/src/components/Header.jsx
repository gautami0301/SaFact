import React, { useState, useEffect } from 'react';
import { Shield, Camera, Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';

export default function Header({ systemStatus, onRefresh, isRefreshing }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const isOnline = systemStatus?.system_online ?? false;
  const isCamOnline = systemStatus?.camera_connected ?? false;

  return (
    <header className="bg-slate-900/90 border-b border-slate-800/80 px-6 py-4 sticky top-0 z-30 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0">SaFact</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                v2.0 AI-CORE
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0">
              Smart AI for Crowd Flow & Threat Detection
            </p>
          </div>
        </div>

        {/* Telemetry Status Pills & Clock */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{timeStr || '00:00:00'} LOCAL</span>
          </div>

          {/* Camera Status */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              isCamOnline
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                : 'bg-rose-950/40 text-rose-400 border-rose-800/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isCamOnline ? 'CAM-01 ACTIVE' : 'CAM OFFLINE'}</span>
          </div>

          {/* System Online Status */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              isOnline
                ? 'bg-blue-950/40 text-blue-400 border-blue-800/60'
                : 'bg-amber-950/40 text-amber-400 border-amber-800/60'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-amber-400'
              }`}
            />
            {isOnline ? (
              <span className="flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" />
                SYSTEM ONLINE
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                CONNECTING
              </span>
            )}
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 disabled:opacity-50"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
