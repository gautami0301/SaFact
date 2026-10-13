import React from 'react';
import {
  LayoutDashboard,
  Video,
  Grid3X3,
  Activity,
  Lightbulb,
  Bell,
  Settings,
  Cpu,
  Layers,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'live-monitoring', label: 'Live Monitoring', icon: Video },
  { id: 'zones', label: 'Zone Analysis', icon: Grid3X3 },
  { id: 'risk', label: 'Risk Analysis', icon: Activity },
  { id: 'recommendations', label: 'Safety Directives', icon: Lightbulb },
  { id: 'alerts', label: 'Alerts & Incidents', icon: Bell, badgeKey: 'activeAlerts' },
  { id: 'settings', label: 'System Settings', icon: Settings },
];

export default function Sidebar({ activeView, setActiveView, activeAlertsCount, systemStatus }) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-73px)]">
      {/* Navigation Links */}
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
          Operation Modules
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const badgeVal = item.badgeKey === 'activeAlerts' ? activeAlertsCount : null;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-blue-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {badgeVal > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white animate-pulse">
                  {badgeVal}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hardware & Model Diagnostics Info Box */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 m-3 rounded-xl border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            AI Model Engine
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono">
            LIVE
          </span>
        </div>
        <p className="text-xs font-mono text-cyan-300 truncate m-0">
          {systemStatus?.model_name || 'YOLOv8n'}
        </p>

        <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Inference Latency:</span>
            <span className="text-slate-200 font-mono">
              {systemStatus?.inference_time_ms ? `${systemStatus.inference_time_ms} ms` : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Video Pipeline:</span>
            <span className="text-emerald-400 font-mono font-semibold">
              {systemStatus?.fps ? `${systemStatus.fps} FPS` : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
