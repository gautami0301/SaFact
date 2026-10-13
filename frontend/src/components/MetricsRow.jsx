import React from 'react';
import { Users, Gauge, ShieldAlert, BarChart3, Activity } from 'lucide-react';

export default function MetricsRow({ dashboardData }) {
  const isAvailable = Boolean(dashboardData?.has_processed_frame && dashboardData?.person_count !== null && dashboardData?.person_count !== undefined);
  const personCount = dashboardData?.person_count ?? 0;
  const risk = dashboardData?.risk || {};
  const riskScore = risk?.risk_score ?? 0;
  const riskLevel = risk?.risk_level ?? 'LOW';
  const density = risk?.avg_density_ppm2 ?? 0.0;
  const occupancyPct = risk?.occupancy_pct ?? 0.0;
  const activeAlerts = dashboardData?.active_alerts_count ?? 0;

  // Level color palette
  const getLevelBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-950/60 text-rose-400 border-rose-800/80';
      case 'HIGH':
        return 'bg-orange-950/60 text-orange-400 border-orange-800/80';
      case 'MODERATE':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/80';
      default:
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80';
    }
  };

  const cards = [
    {
      title: 'Current Headcount',
      value: isAvailable ? personCount : 'Waiting for detection',
      unit: isAvailable ? 'people' : '',
      subtitle: isAvailable ? 'Real-time AI detection' : 'Activate webcam feed',
      icon: Users,
      color: 'text-cyan-400',
      badge: isAvailable ? 'LIVE SENSOR' : 'CAM OFFLINE',
      badgeClass: isAvailable ? 'bg-cyan-950 text-cyan-400 border-cyan-800/60' : 'bg-slate-800 text-slate-400 border-slate-700',
      isText: !isAvailable,
    },
    {
      title: 'Pedestrian Density',
      value: isAvailable ? `${density}` : 'Waiting for detection',
      unit: isAvailable ? 'p/m²' : '',
      subtitle: isAvailable
        ? (density > 2.5 ? 'Severe bottleneck' : density > 1.5 ? 'Restricted flow' : 'Free nominal flow')
        : 'Awaiting sensor data',
      icon: Gauge,
      color: 'text-blue-400',
      badge: isAvailable
        ? (density > 2.5 ? 'LOS E-F' : density > 1.5 ? 'LOS C-D' : 'LOS A-B')
        : 'STANDBY',
      badgeClass: isAvailable
        ? (density > 2.5 ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-blue-950 text-blue-400 border-blue-800')
        : 'bg-slate-800 text-slate-400 border-slate-700',
      isText: !isAvailable,
    },
    {
      title: 'Composite Risk Index',
      value: isAvailable ? `${riskScore}` : 'Waiting for detection',
      unit: isAvailable ? '/ 100' : '',
      subtitle: isAvailable ? riskLevel : 'Awaiting sensor data',
      icon: Activity,
      color: !isAvailable
        ? 'text-slate-400'
        : (riskLevel === 'CRITICAL' ? 'text-rose-400' : riskLevel === 'HIGH' ? 'text-orange-400' : riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'),
      badge: isAvailable ? `LEVEL: ${riskLevel}` : 'PENDING',
      badgeClass: isAvailable ? getLevelBadge(riskLevel) : 'bg-slate-800 text-slate-400 border-slate-700',
      isText: !isAvailable,
    },
    {
      title: 'Capacity Load',
      value: isAvailable ? `${occupancyPct}` : 'Waiting for detection',
      unit: isAvailable ? '%' : '',
      subtitle: isAvailable ? 'Calibrated venue floor' : 'Awaiting sensor data',
      icon: BarChart3,
      color: 'text-indigo-400',
      badge: isAvailable ? `${personCount} / 120 MAX` : 'STANDBY',
      badgeClass: isAvailable ? 'bg-indigo-950 text-indigo-400 border-indigo-800' : 'bg-slate-800 text-slate-400 border-slate-700',
      isText: !isAvailable,
    },
    {
      title: 'Active Alerts',
      value: activeAlerts,
      unit: 'pending',
      subtitle: activeAlerts > 0 ? 'Action required' : 'All sectors nominal',
      icon: ShieldAlert,
      color: activeAlerts > 0 ? 'text-rose-400' : 'text-slate-400',
      badge: activeAlerts > 0 ? 'ATTENTION' : 'NOMINAL',
      badgeClass: activeAlerts > 0 ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse' : 'bg-slate-800 text-slate-300 border-slate-700',
      isText: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {c.title}
              </span>
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`font-bold tracking-tight text-white font-mono ${
                    c.isText ? 'text-xs text-slate-400 font-normal italic' : 'text-2xl'
                  }`}
                >
                  {c.value}
                </span>
                {c.unit && <span className="text-xs text-slate-400 font-medium">{c.unit}</span>}
              </div>
              <p className="text-xs text-slate-400 m-0 truncate">{c.subtitle}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${c.badgeClass}`}>
                {c.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
