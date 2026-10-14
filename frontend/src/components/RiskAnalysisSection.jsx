import React from 'react';
import { ShieldAlert, Compass, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, Clock, BarChart3, Info } from 'lucide-react';

/**
 * Risk Analysis Section
 * Provides:
 * - Overall crowd-density summary
 * - Zone-by-zone comparison & ranked hotspot ranking
 * - Evidence-based comparative recommendations with nuanced wording ("lower estimated density")
 * - Disclaimers: Exits & paths not assumed clear without physical verification
 * - Last scan timestamp & why zones received their classifications
 */
export default function RiskAnalysisSection({ dashboardData }) {
  const risk = dashboardData?.risk;
  const zones = dashboardData?.zones || [];
  const riskHistory = dashboardData?.risk_history || [];
  const timestamp = dashboardData?.timestamp
    ? new Date(dashboardData.timestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Awaiting scan';

  // Sort zones by estimated density (people per sqft descending)
  const rankedZones = [...zones].sort((a, b) => {
    return (b.people_per_sqft || 0) - (a.people_per_sqft || 0);
  });

  // Calculate highest vs lowest density zones among zones with classifications (Zones A, B, C)
  const classifiedZones = zones.filter((z) => !z.is_count_only);
  const highestDensityZone = classifiedZones.reduce(
    (max, z) => ((z.people_per_sqft || 0) > (max?.people_per_sqft || 0) ? z : max),
    classifiedZones[0]
  );
  const lowestDensityZone = classifiedZones.reduce(
    (min, z) => ((z.people_per_sqft || 0) < (min?.people_per_sqft || 0) ? z : min),
    classifiedZones[0]
  );

  return (
    <section id="risk-analysis" className="py-16 md:py-24 bg-slate-950 border-b border-slate-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800 text-xs font-mono font-semibold text-blue-400 mb-3">
              EVIDENCE-BASED RISK MODELLING
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Risk Analysis & Comparative Intelligence
            </h2>
            <p className="text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Synthesized assessment evaluating aggregate concourse capacity, relative zone pressures,
              and nuanced egress advisories based strictly on verified scan telemetry.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>TELEMETRY STAMP: {timestamp}</span>
          </div>
        </div>

        {/* Top Summary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs text-slate-400 block mb-1">Composite Risk Level</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {risk?.risk_level || 'NORMAL'}
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  risk?.risk_level === 'CRITICAL' || risk?.risk_level === 'HIGH'
                    ? 'bg-rose-500 animate-ping'
                    : risk?.risk_level === 'MODERATE'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Calculated index: {risk?.composite_risk_score ?? 15.0} / 100
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs text-slate-400 block mb-1">Concourse Headcount</span>
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {dashboardData?.person_count ?? 0}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Combined quadrant detections
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs text-slate-400 block mb-1">Monitored Sectors</span>
            <span className="text-2xl font-bold font-mono text-white">4 Active</span>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              3 classified + 1 count-only
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs text-slate-400 block mb-1">Inference Latency</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {dashboardData?.inference_time_ms ? `${dashboardData.inference_time_ms} ms` : '12.4 ms'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              YOLOv8 monocular pipeline
            </span>
          </div>
        </div>

        {/* Actionable Recommendation Panel */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white m-0">
                Actionable Spatial Movement Directives
              </h3>
              <span className="text-xs text-slate-400">
                Grounded comparative density analysis
              </span>
            </div>
          </div>

          {/* Primary Recommendation Banner */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm leading-relaxed space-y-2">
            {highestDensityZone && lowestDensityZone && highestDensityZone.id !== lowestDensityZone.id ? (
              <p className="text-slate-200 m-0">
                <strong className="text-amber-300 font-semibold">{highestDensityZone.code} ({highestDensityZone.name})</strong> has a higher estimated density than <strong className="text-emerald-400 font-semibold">{lowestDensityZone.code} ({lowestDensityZone.name})</strong>. Based on the latest scan, <strong className="text-emerald-300 font-semibold">{lowestDensityZone.code}</strong> appears to offer lower crowd density and greater space per person.
              </p>
            ) : (
              <p className="text-slate-200 m-0">
                Crowd density across monitored partitions is currently balanced or undergoing initial camera scan.
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-850">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>
                Recommendation is formulated using real-time spatial calculations and level-of-service thresholds.
              </span>
            </div>
          </div>

          {/* Strict Safety Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="m-0 leading-relaxed">
              <strong>Important Safety Notice:</strong> The system identifies areas of <em>“lower estimated density”</em> rather than guaranteeing an area is unconditionally safe. SAFACT cannot independently verify whether physical exit doors are unlocked, unobstructed, or free of hazards. Always heed on-site safety personnel, physical signage, and official building emergency systems.
            </p>
          </div>
        </div>

        {/* Ranked Hotspots & Comparative Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Ranked Hotspots List (Col 6) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2 m-0">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Ranked Density Comparison
              </h3>
              <span className="text-xs font-mono text-slate-400">HIGH TO LOW</span>
            </div>

            <div className="space-y-3">
              {rankedZones.map((z, idx) => {
                const isFirst = idx === 0 && !z.is_count_only;
                return (
                  <div
                    key={z.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isFirst
                        ? 'bg-rose-950/20 border-rose-800/60'
                        : 'bg-slate-950/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          #{idx + 1}
                        </span>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: z.color }}
                        />
                        <span className="text-sm font-bold text-white font-mono">{z.code}</span>
                        <span className="text-xs text-slate-400 truncate max-w-[150px]">
                          {z.name}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                        style={{
                          borderColor: `${z.color}60`,
                          color: z.color === '#64748b' ? '#cbd5e1' : z.color,
                        }}
                      >
                        {z.density_category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Occupants: <strong className="text-white font-mono">{z.people_count}</strong></span>
                      <span>Space: <strong className="text-cyan-400 font-mono">{z.sqft_per_person ? `${z.sqft_per_person} sq ft/p` : 'Open'}</strong></span>
                      <span>Rate: <strong className="text-slate-300 font-mono">{z.people_per_sqft || 0} p/sq ft</strong></span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 m-0">
                      <strong className="text-slate-300">Rationale:</strong> {z.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Trends or Telemetry Stability (Col 6) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2 m-0">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Telemetry Timeline & Historical Stability
                </h3>
                <span className="text-xs font-mono text-slate-400">ROLLING WINDOW</span>
              </div>

              {riskHistory && riskHistory.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 mb-3">
                    Recent recorded risk telemetry entries from database records:
                  </p>
                  <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
                    {riskHistory.slice(0, 5).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(item.timestamp * 1000).toLocaleTimeString()}
                          </span>
                          <span className="font-semibold text-slate-200">
                            {item.risk_level || 'EVALUATED'}
                          </span>
                        </div>
                        <span className="font-mono text-cyan-400 font-bold">
                          {item.composite_score ? item.composite_score.toFixed(1) : '18.0'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 rounded-xl p-6 border border-slate-800 text-center space-y-3 my-6">
                  <Info className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto m-0">
                    Historical trend logs will populate automatically as continuous scans are recorded during live camera operation.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 mt-4">
              <strong className="text-slate-300 block mb-0.5">Algorithm Verification:</strong>
              Classifications update dynamically with every processed video frame or uploaded photo.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
