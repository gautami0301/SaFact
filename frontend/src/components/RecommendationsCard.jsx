import React from 'react';
import { Lightbulb, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RecommendationsCard({ recommendations, riskLevel }) {
  const getBadgeColor = (priority) => {
    if (priority.includes('P1') || priority.includes('IMMEDIATE')) {
      return 'bg-rose-950 text-rose-300 border-rose-800';
    }
    if (priority.includes('P2') || priority.includes('ELEVATED')) {
      return 'bg-orange-950 text-orange-300 border-orange-800';
    }
    if (priority.includes('P3') || priority.includes('ADVISORY')) {
      return 'bg-amber-950 text-amber-300 border-amber-800';
    }
    return 'bg-emerald-950 text-emerald-300 border-emerald-800';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white m-0">
              Autonomous Safety Directives
            </h3>
            <p className="text-xs text-slate-400 m-0">
              Triggered by active crowd hazard index ({riskLevel || 'LOW'})
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          AUTO-DISPATCH ENGINE
        </span>
      </div>

      {/* Directives List */}
      <div className="space-y-3">
        {recommendations && recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {rec.action_title}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getBadgeColor(
                    rec.priority
                  )}`}
                >
                  {rec.priority}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed m-0 font-medium">
                {rec.directive}
              </p>

              {rec.relief_zone && (
                <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono bg-cyan-950/40 p-2 rounded border border-cyan-900/60">
                  <span className="text-rose-400 font-semibold">{rec.target_zone}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-emerald-400 font-semibold">{rec.relief_zone}</span>
                  <span className="text-slate-400 text-[10px] ml-auto">Verified Relief Corridor</span>
                </div>
              )}

              <div className="text-[11px] text-slate-400 italic">
                <strong className="text-slate-400 not-italic">Rationale: </strong>
                {rec.rationale}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl bg-slate-950 text-center text-slate-500 text-xs">
            No active emergency directives. Routine surveillance continues.
          </div>
        )}
      </div>
    </div>
  );
}
