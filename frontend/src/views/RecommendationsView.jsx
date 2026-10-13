import React from 'react';
import { Lightbulb, ArrowRight, ShieldCheck, AlertOctagon, Radio, Megaphone } from 'lucide-react';
import RecommendationsCard from '../components/RecommendationsCard';

export default function RecommendationsView({ recommendations, riskLevel }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white m-0">
              Autonomous Crowd Flow & Safety Directives
            </h2>
            <p className="text-xs text-slate-400 m-0">
              Real-time actionable operational guidance tied to active concourse hazard state
            </p>
          </div>
        </div>
      </div>

      {/* Main Recommendations Card */}
      <RecommendationsCard recommendations={recommendations} riskLevel={riskLevel} />

      {/* Standard Operating Procedures (SOP) Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white m-0 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Security Command SOP Protocols Reference
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              LOW (0–39)
            </span>
            <h4 className="text-sm font-bold text-white m-0">Routine Surveillance</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintain camera telemetry logging. Check perimeter turnstiles every 30 minutes. No active diversion needed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/40 space-y-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
              MODERATE (40–69)
            </span>
            <h4 className="text-sm font-bold text-white m-0">Advisory Inspection</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Increase optical sensor refresh. Security marshal conducts walk-through of transfer corridors. Verify auxiliary gate locks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-orange-900/40 space-y-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800">
              HIGH (70–84)
            </span>
            <h4 className="text-sm font-bold text-white m-0">Flow Balancing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Throttle incoming turnstile rate. Switch digital wayfinding screens to bypass corridors. Marshal stands at pinch-point.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/40 space-y-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
              CRITICAL (85–100)
            </span>
            <h4 className="text-sm font-bold text-white m-0">Emergency Intervention</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Halt ingress immediately. Dispatch emergency floor teams. Trigger calm public address directives. Prioritize safe egress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
