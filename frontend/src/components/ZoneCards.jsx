import React from 'react';
import { Grid, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ZoneCards({ zones }) {
  if (!zones || zones.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">
        Initializing concourse sectors...
      </div>
    );
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'CRITICAL':
        return { text: 'text-rose-400', bg: 'bg-rose-950/60', border: 'border-rose-800', bar: 'bg-rose-500' };
      case 'HIGH':
        return { text: 'text-orange-400', bg: 'bg-orange-950/60', border: 'border-orange-800', bar: 'bg-orange-500' };
      case 'MODERATE':
        return { text: 'text-amber-400', bg: 'bg-amber-950/60', border: 'border-amber-800', bar: 'bg-amber-500' };
      default:
        return { text: 'text-emerald-400', bg: 'bg-emerald-950/60', border: 'border-emerald-800', bar: 'bg-emerald-500' };
    }
  };

  const getTrendIcon = (trend) => {
    if (trend.includes('Surging') || trend.includes('Rising')) {
      return <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />;
    }
    if (trend.includes('Declining') || trend.includes('Easing')) {
      return <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 m-0">
          <Grid className="w-4 h-4 text-cyan-400" />
          Concourse Spatial Sectors (Zones A–D)
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          4 ACTIVE MONITORING PARTITIONS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((zone) => {
          const colors = getRiskColor(zone.risk_level);
          const occupancy = Math.min(Math.max(zone.occupancy_pct, 0), 100);

          return (
            <div
              key={zone.id}
              className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
            >
              {/* Zone Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {zone.code}
                    </span>
                    <h4 className="text-sm font-bold text-white m-0 truncate">
                      {zone.name}
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    {zone.risk_level}
                  </span>
                </div>

                {/* Density & Count Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/60">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Detected Count</span>
                    <span className="text-lg font-bold font-mono text-white">
                      {zone.people_count}{' '}
                      <span className="text-xs text-slate-500 font-normal">/ {zone.capacity}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Density (p/m²)</span>
                    <span className="text-lg font-bold font-mono text-cyan-400">
                      {zone.density_ppm2}
                    </span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Capacity Load</span>
                    <span className="font-mono text-slate-300 font-semibold">{occupancy}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Trend & Action Directives */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Vector Velocity:</span>
                  <span className="font-medium text-slate-200 flex items-center gap-1 font-mono text-[11px]">
                    {getTrendIcon(zone.trend)}
                    {zone.trend}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 leading-relaxed">
                  <strong className="text-slate-300 block mb-0.5">Directive:</strong>
                  {zone.recommended_action}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
