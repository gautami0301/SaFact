import React from 'react';
import { Grid, Flame, Table, ShieldCheck, AlertTriangle, Layers, Clock, Info, CheckCircle2 } from 'lucide-react';
import Zone3DMap from './Zone3DMap';

/**
 * Four-Zone Crowd Analysis Section
 * Incorporates:
 * - 4-Quadrant Heatmap & Zone Cards (Zone A Red, B Yellow, C Green, D Slate Grey)
 * - Interactive 3D Zone Map
 * - Granular Zone Statistics Table (detected people, area, sq ft/person, people/sq ft, category, timestamp)
 * - Highlighted Hotspot Panel
 * - Prototype Thresholds & Configuration Reference
 */
export default function FourZoneSection({ dashboardData }) {
  const zones = dashboardData?.zones || [];
  const hasProcessedFrame = dashboardData?.has_processed_frame ?? false;
  const lastScanTimestamp = dashboardData?.timestamp
    ? new Date(dashboardData.timestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Awaiting initial scan';

  // Fallback demo zones if awaiting first scan
  const displayZones = zones.length === 4 ? zones : [
    {
      id: 'ZONE_A',
      code: 'ZONE A',
      name: 'Primary Concourse',
      people_count: hasProcessedFrame ? 0 : 18,
      area_sqft: 215,
      sqft_per_person: hasProcessedFrame ? null : 11.9,
      people_per_sqft: hasProcessedFrame ? 0 : 0.0837,
      density_category: hasProcessedFrame ? 'Zero Occupants' : 'High Density',
      density_ppm2: hasProcessedFrame ? 0 : 0.9,
      occupancy_pct: hasProcessedFrame ? 0 : 45,
      risk_level: 'HIGH',
      color: '#ef4444',
      is_count_only: false,
      recommended_action: 'Elevated concentration. Direct overflow toward Zone C egress corridor.',
      explanation: 'Estimated space per person indicates high density approaching prototype threshold.',
    },
    {
      id: 'ZONE_B',
      code: 'ZONE B',
      name: 'Transit Way',
      people_count: hasProcessedFrame ? 0 : 8,
      area_sqft: 194,
      sqft_per_person: hasProcessedFrame ? null : 24.3,
      people_per_sqft: hasProcessedFrame ? 0 : 0.0412,
      density_category: hasProcessedFrame ? 'Zero Occupants' : 'Moderate Density',
      density_ppm2: hasProcessedFrame ? 0 : 0.44,
      occupancy_pct: hasProcessedFrame ? 0 : 22,
      risk_level: 'MODERATE',
      color: '#eab308',
      is_count_only: false,
      recommended_action: 'Maintain regular flow. Observe transfer points.',
      explanation: 'Moderate estimated density. Space allows reasonable pedestrian movement.',
    },
    {
      id: 'ZONE_C',
      code: 'ZONE C',
      name: 'Egress Corridor',
      people_count: hasProcessedFrame ? 0 : 4,
      area_sqft: 269,
      sqft_per_person: hasProcessedFrame ? null : 67.3,
      people_per_sqft: hasProcessedFrame ? 0 : 0.0149,
      density_category: hasProcessedFrame ? 'Zero Occupants' : 'Lower Density',
      density_ppm2: hasProcessedFrame ? 0 : 0.16,
      occupancy_pct: hasProcessedFrame ? 0 : 8,
      risk_level: 'LOW',
      color: '#22c55e',
      is_count_only: false,
      recommended_action: 'Optimal egress corridor. Ample physical reserve available.',
      explanation: 'Lower estimated density. Estimated space per person exceeds 10 sq ft.',
    },
    {
      id: 'ZONE_D',
      code: 'ZONE D',
      name: 'Outer Perimeter',
      people_count: hasProcessedFrame ? 0 : 2,
      area_sqft: 161,
      sqft_per_person: hasProcessedFrame ? null : 80.5,
      people_per_sqft: hasProcessedFrame ? 0 : 0.0124,
      density_category: 'Count Only',
      density_ppm2: hasProcessedFrame ? 0 : 0.13,
      occupancy_pct: hasProcessedFrame ? 0 : 7,
      risk_level: 'COUNT_ONLY',
      color: '#64748b',
      is_count_only: true,
      recommended_action: 'Perimeter counting partition. Observation active without risk classification.',
      explanation: 'Zone D is configured for occupant count tracking only by default.',
    },
  ];

  // Identify highest concentration zone (excluding count-only Zone D unless others are 0)
  const nonCountOnlyZones = displayZones.filter((z) => !z.is_count_only);
  const hotspotZone = nonCountOnlyZones.reduce(
    (max, z) => (z.people_count > (max?.people_count || 0) ? z : max),
    nonCountOnlyZones[0]
  );

  return (
    <section id="zone-analysis" className="py-16 md:py-24 bg-slate-900/60 border-b border-slate-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-xs font-mono font-semibold text-cyan-400 mb-3">
              FOUR-ZONE SPATIAL INTELLIGENCE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Four-Zone Crowd Analysis
            </h2>
            <p className="text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Spatial segmentation divides monitored areas into four distinct quadrants,
              evaluating physical space per person and density distribution across each partition.
            </p>
          </div>

          {/* Timestamp and Live vs Demo indicator */}
          <div className="flex flex-col sm:items-end gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>LATEST SCAN: {lastScanTimestamp}</span>
            </div>
            {!hasProcessedFrame ? (
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-amber-950/60 text-amber-400 border border-amber-800/80">
                SAMPLE DATA — NOT A LIVE SCAN
              </span>
            ) : (
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE CAMERA TELEMETRY ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Highlighted Hotspot Alert Panel */}
        {hotspotZone && (
          <div className="bg-gradient-to-r from-rose-950/50 via-slate-900 to-slate-900 border border-rose-800/60 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-900/60 border border-rose-700/80 flex items-center justify-center text-rose-400 flex-shrink-0 shadow-lg shadow-rose-950">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-900 text-rose-200">
                    PRIMARY HOTSPOT
                  </span>
                  <h3 className="text-lg font-bold text-white m-0">
                    {hotspotZone.code}: {hotspotZone.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 m-0 max-w-2xl leading-relaxed">
                  {hotspotZone.explanation ||
                    `Highest relative crowd concentration detected (${hotspotZone.people_count} occupants in ${hotspotZone.area_sqft} sq ft).`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Est. Space</span>
                <span className="text-xl font-bold font-mono text-rose-400">
                  {hotspotZone.sqft_per_person ? `${hotspotZone.sqft_per_person} sq ft` : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 block">per individual</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Classification</span>
                <span className="text-sm font-bold font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 block">
                  {hotspotZone.density_category}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive 3D Isometric Map Component */}
        <Zone3DMap zones={displayZones} hasProcessedFrame={hasProcessedFrame} />

        {/* Granular Zone Statistics Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight m-0">
                Zone Density & Spatial Measurements Table
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              4 PARTITIONS RECORDED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Zone Sector</th>
                  <th className="py-3 px-4">Detected People</th>
                  <th className="py-3 px-4">Configured Area</th>
                  <th className="py-3 px-4">Space Per Person</th>
                  <th className="py-3 px-4">People / Sq Ft</th>
                  <th className="py-3 px-4">Density Category</th>
                  <th className="py-3 px-4">Action Directive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {displayZones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: zone.color }}
                        />
                        <div>
                          <span className="font-bold text-white block font-mono">{zone.code}</span>
                          <span className="text-[11px] text-slate-400">{zone.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-white">
                      {zone.people_count}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {zone.area_sqft} sq ft
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {zone.sqft_per_person !== null && zone.sqft_per_person !== undefined
                        ? `${zone.sqft_per_person} sq ft`
                        : 'Open / Zero occ.'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {zone.people_per_sqft !== undefined
                        ? `${zone.people_per_sqft} p/sq ft`
                        : '0.0000'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: `${zone.color}20`,
                          borderColor: `${zone.color}60`,
                          color: zone.color === '#64748b' ? '#cbd5e1' : zone.color,
                        }}
                      >
                        {zone.density_category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400 max-w-xs leading-relaxed">
                      {zone.recommended_action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prototype Thresholds & Engineering Note */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-white m-0">
              Prototype Classification Thresholds & Formulas
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-rose-400 font-mono font-bold block mb-1">
                &lt; 5.0 sq ft / person
              </span>
              <strong className="text-white block mb-1">High Estimated Density (Red)</strong>
              <p className="text-slate-400 m-0 leading-relaxed">
                Represents physical contact proximity. Pedestrian speed is severely constrained.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-amber-400 font-mono font-bold block mb-1">
                5.0 – 10.0 sq ft / person
              </span>
              <strong className="text-white block mb-1">Moderate Density (Yellow)</strong>
              <p className="text-slate-400 m-0 leading-relaxed">
                Nominal walking movement maintained, but passing manoeuvres require coordination.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-emerald-400 font-mono font-bold block mb-1">
                &gt; 10.0 sq ft / person
              </span>
              <strong className="text-white block mb-1">Lower Density (Green)</strong>
              <p className="text-slate-400 m-0 leading-relaxed">
                Unrestricted pedestrian flow with ample spatial safety buffer.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 m-0 leading-relaxed border-t border-slate-900 pt-3">
            <strong className="text-slate-400">Engineering Note:</strong> These are prototype classification thresholds based on spatial crowd-science literature, not unconditional safety guarantees. Real-world venue safety additionally depends on physical obstacles, clear egress doors, and active event marshalling. Zone D is configured for count tracking only without automated risk score by default.
          </p>
        </div>
      </div>
    </section>
  );
}
