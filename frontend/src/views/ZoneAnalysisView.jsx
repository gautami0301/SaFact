import React from 'react';
import { Grid3X3, MapPin, BarChart2, Shield, Info } from 'lucide-react';
import ZoneCards from '../components/ZoneCards';

export default function ZoneAnalysisView({ zones }) {
  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              Concourse Sector Partition Analysis
            </h2>
            <p className="text-xs text-slate-400 m-0">
              Granular localization prevents stampede risks before global congestion forms
            </p>
          </div>
        </div>
      </div>

      {/* Visual Spatial Diagram of Sectors */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 m-0">
          <MapPin className="w-4 h-4 text-cyan-400" />
          Concourse Spatial Layout Topology
        </h3>

        {/* 2x2 Interactive Spatial Layout */}
        <div className="grid grid-cols-2 gap-4 aspect-21/9 max-w-4xl mx-auto">
          {zones && zones.length >= 4 ? (
            zones.map((z) => {
              const occ = Math.min(Math.max(z.occupancy_pct, 0), 100);
              const isHigh = z.risk_level === 'HIGH' || z.risk_level === 'CRITICAL';
              return (
                <div
                  key={z.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isHigh
                      ? 'bg-rose-950/20 border-rose-800/80 shadow-md shadow-rose-900/20'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {z.code}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1 m-0">{z.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isHigh ? 'bg-rose-900 text-rose-200' : 'bg-emerald-950 text-emerald-400'
                      }`}
                    >
                      {z.risk_level}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-3">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Occupancy:</span>
                      <span className="text-white font-bold">{z.people_count} / {z.capacity} ({occ}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          occ > 75 ? 'bg-rose-500' : occ > 50 ? 'bg-amber-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${occ}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between font-mono">
                    <span>DENSITY: <strong className="text-cyan-400">{z.density_ppm2} p/m²</strong></span>
                    <span>AREA: {z.area_sqm} m²</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center text-slate-500 py-10">
              Loading Sector Maps...
            </div>
          )}
        </div>
      </div>

      {/* Sector Cards */}
      <ZoneCards zones={zones} />
    </div>
  );
}
