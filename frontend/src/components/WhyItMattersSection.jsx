import React from 'react';
import { AlertTriangle, Users, Compass, ShieldCheck, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

/**
 * Why It Matters Section
 * Explains crowd dynamics, density vs simple headcount, space per person, and 3 feature cards:
 * 1. Spot pressure early.
 * 2. Understand crowd distribution.
 * 3. Support informed movement and event planning.
 */
export default function WhyItMattersSection() {
  return (
    <section id="why-it-matters" className="py-16 md:py-24 bg-slate-950 border-b border-slate-850 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800 text-xs font-mono font-semibold text-blue-400">
            CROWD SCIENCE & SPATIAL DYNAMICS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Crowd Analysis Matters
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            Headcounts alone do not reveal where bottlenecks form. Real-world crowd safety requires
            understanding local spatial density, physical area per person, and rapid movement vectors.
          </p>
        </div>

        {/* 4 Core Scientific Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Pressure Develops Invisibly</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dangerous crowd compressive pressure can surge rapidly at constriction points before visual distress is obvious to human onlookers.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Headcount Alone Is Incomplete</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              One hundred people dispersed across an open hall are safe; those same one hundred funnelled into a single doorway create an immediate hazard.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Space Per Person Is Key</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculating square feet per person and localized zone density unlocks Fruin Level-of-Service insights that simple tally counters cannot provide.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Evidence-Based Directives</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clear, transparent spatial telemetry empowers both event organisers and everyday pedestrians to choose paths with lower estimated density.
            </p>
          </div>
        </div>

        {/* 3 Prominent Feature Cards Requested */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-7 hover:border-blue-600/50 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block mb-1">
              Feature 01
            </span>
            <h3 className="text-xl font-bold text-white mb-3">
              Spot pressure early.
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Identify emerging crowd compression and micro-hotspots in real-time before physical blockages become hazardous. Continuous inference detects rate-of-change surges within seconds.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800/80 pt-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Sub-second YOLOv8 person localization
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Square footage threshold alerts (&lt; 5 sq ft/person)
              </li>
            </ul>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-7 hover:border-cyan-600/50 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              Feature 02
            </span>
            <h3 className="text-xl font-bold text-white mb-3">
              Understand crowd distribution.
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Partition spaces into four synchronized spatial zones (A, B, C, D) to uncover density differentials. Understand which corridors are crowded versus which remain clear.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800/80 pt-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Interactive 3D isometric & 2D heatmap projections
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Perimeter count-only isolation (Zone D)
              </li>
            </ul>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-7 hover:border-emerald-600/50 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              Feature 03
            </span>
            <h3 className="text-xl font-bold text-white mb-3">
              Support informed movement and event planning.
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Provide safety marshals, stadium directors, and event-goers with evidence-based directives highlighting zones with lower estimated density, minimizing congestion.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800/80 pt-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Transparent, non-guaranteed safety recommendations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Grounded conversational AI assistant for fast queries
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
