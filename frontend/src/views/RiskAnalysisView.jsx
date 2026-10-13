import React, { useState } from 'react';
import { Activity, AlertTriangle, Sliders, CheckCircle2, Shield, Info, HelpCircle } from 'lucide-react';
import { api } from '../services/api';

export default function RiskAnalysisView({ currentRisk }) {
  const [simCount, setSimCount] = useState(45);
  const [simZone, setSimZone] = useState('ZONE_C');
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const risk = currentRisk || {};
  const score = risk.risk_score ?? 0;
  const level = risk.risk_level ?? 'LOW';
  const breakdown = risk.breakdown || {
    density_score: 0,
    occupancy_score: 0,
    accumulation_rate_score: 0,
    constriction_factor: 0,
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const res = await api.simulateRisk(Number(simCount), simZone);
      setSimResult(res.assessment);
    } catch (e) {
      console.error(e);
    } finally {
      setSimLoading(false);
    }
  };

  const getRiskColor = (lvl) => {
    switch (lvl) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/60 border-rose-800';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/60 border-orange-800';
      case 'MODERATE':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              Multi-Factor Crowd Hazard Engine
            </h2>
            <p className="text-xs text-slate-400 m-0">
              Evaluates pedestrian density, structural constriction, and accumulation velocity
            </p>
          </div>
        </div>

        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${getRiskColor(level)}`}>
          ACTIVE STATUS: {level}
        </span>
      </div>

      {/* Hero Composite Score & Rationale Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Composite Hazard Index
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-6xl font-black font-mono tracking-tight ${getRiskColor(level).split(' ')[0]}`}>
                {score}
              </span>
              <span className="text-xl font-mono text-slate-400">/ 100</span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1 text-slate-400 font-mono">
                <span>Threshold:</span>
                <span>{score < 40 ? 'LOW (<40)' : score < 70 ? 'MODERATE (40-69)' : score < 85 ? 'HIGH (70-84)' : 'CRITICAL (85+)'}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-700 ${
                    score >= 85 ? 'bg-rose-500' : score >= 70 ? 'bg-orange-500' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(score, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="m-0 leading-relaxed text-slate-300">
                <strong className="text-white">Assigned Rationale: </strong>
                {risk.reason || 'Concourse running within nominal safe pedestrian thresholds.'}
              </p>
            </div>
            <div className="text-[11px] text-slate-400 italic bg-slate-950 p-2.5 rounded border border-slate-800">
              <strong className="text-slate-400 not-italic">Limitations: </strong>
              {risk.limitations || 'Optical estimation calibrated to 55m² floor area.'}
            </div>
          </div>
        </div>

        {/* 4 Factor Vector Breakdown */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white mb-4 m-0 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Synthesized Contributing Vector Weights
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">1. Density Saturation (35% Weight)</span>
                <span className="text-cyan-400 font-mono font-bold">{breakdown.density_score} / 100</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${breakdown.density_score}%` }} />
              </div>
              <span className="text-[11px] text-slate-400">Benchmarked to Fruin Pedestrian Level of Service (LOS A–F).</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">2. Venue Capacity Load (25% Weight)</span>
                <span className="text-indigo-400 font-mono font-bold">{breakdown.occupancy_score} / 100</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${breakdown.occupancy_score}%` }} />
              </div>
              <span className="text-[11px] text-slate-400">Total detected individuals relative to design ceiling (120 people).</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">3. Geometric Constriction (20% Weight)</span>
                <span className="text-amber-400 font-mono font-bold">{breakdown.constriction_factor} / 100</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${breakdown.constriction_factor}%` }} />
              </div>
              <span className="text-[11px] text-slate-400">Worst-case localized pinch-point sector pressure.</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">4. Accumulation Surge Velocity (20% Weight)</span>
                <span className="text-rose-400 font-mono font-bold">{breakdown.accumulation_rate_score} / 100</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${breakdown.accumulation_rate_score}%` }} />
              </div>
              <span className="text-[11px] text-slate-400">Rate of change in crowd influx over trailing 30-second window.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controlled Input Scenario Simulator (Section 12 requirement) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white m-0 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Controlled Input Scenario Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Verify risk-level transitions with test crowd inputs without needing physical crowd surges.
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
            TEST SUITE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Simulated Headcount ({simCount} people):
            </label>
            <input
              type="range"
              min="0"
              max="150"
              value={simCount}
              onChange={(e) => setSimCount(e.target.value)}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0 (Empty)</span>
              <span>40 (Moderate)</span>
              <span>80 (High)</span>
              <span>150 (Crush)</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Target Bottleneck Sector:
            </label>
            <select
              value={simZone}
              onChange={(e) => setSimZone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2 text-white font-mono"
            >
              <option value="ZONE_A">Zone A (North Concourse)</option>
              <option value="ZONE_B">Zone B (Central Platform)</option>
              <option value="ZONE_C">Zone C (West Turnstiles)</option>
              <option value="ZONE_D">Zone D (East Egress)</option>
            </select>
          </div>

          <div>
            <button
              onClick={handleSimulate}
              disabled={simLoading}
              className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs transition-all shadow-md disabled:opacity-50"
            >
              {simLoading ? 'Simulating...' : 'Run Scenario Assessment'}
            </button>
          </div>
        </div>

        {simResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Scenario Simulation Results
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getRiskColor(simResult.risk_level)}`}>
                SIMULATED: {simResult.risk_level} ({simResult.risk_score} / 100)
              </span>
            </div>
            <p className="text-xs text-slate-300 m-0">
              <strong>Simulated Rationale: </strong>
              {simResult.reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
