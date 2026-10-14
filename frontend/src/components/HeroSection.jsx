import React from 'react';
import { ShieldCheck, Camera, ArrowRight, Activity, Eye, Compass, AlertCircle } from 'lucide-react';

/**
 * Hero Section
 * Headline: "Know which side of the crowd is safe before you move."
 * Supporting text: "Understand crowd distribution through privacy-conscious person detection, zone-level density analysis, and actionable crowd-safety insights."
 * CTA: "Scan My Area" (scrolls to #scan-area)
 */
export default function HeroSection({ onScanClick }) {
  return (
    <section id="hero" className="relative py-16 md:py-24 overflow-hidden border-b border-slate-850">
      {/* Background Ambience: Deep navy mesh */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">SAFACT</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Next-Gen Spatial Crowd Intelligence</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Know which side of the crowd is safe{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                before you move.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Understand crowd distribution through privacy-conscious person detection,
              zone-level density analysis, and actionable crowd-safety insights.
            </p>

            {/* Key Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onScanClick}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-cyan-600/20 hover:shadow-cyan-600/35 transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <Camera className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform" />
                <span>Scan My Area</span>
                <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#why-it-matters"
                className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 text-slate-300 hover:text-white font-medium text-sm border border-slate-800 transition-all flex items-center gap-2"
              >
                <span>Why It Matters</span>
              </a>
            </div>

            {/* Trust & Transparency Badges */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-850 max-w-xl text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero Facial Recognition</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Activity className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Real-Time YOLOv8</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Compass className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>4-Zone Hotspots</span>
              </div>
            </div>
          </div>

          {/* Right Column: Isometric 4-Zone Animated Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-square rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 p-6 shadow-2xl flex flex-col justify-between">
              {/* Floor Plan Card Header */}
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Concourse Partition Matrix
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  QUADRANT SENSORS
                </span>
              </div>

              {/* Four Interactive / Animated Zone Tiles */}
              <div className="grid grid-cols-2 gap-3.5 my-auto py-2">
                {/* Zone A - Red */}
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/60 transition-all hover:bg-rose-950/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-400">ZONE A</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-900/50 text-rose-300">
                      HOTSPOT
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">18 <span className="text-xs text-slate-400 font-normal">p</span></div>
                  <div className="text-[11px] text-rose-300/80 mt-1 font-sans">High Est. Density</div>
                </div>

                {/* Zone B - Yellow */}
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 transition-all hover:bg-amber-950/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">ZONE B</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300">
                      TRANSIT
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">8 <span className="text-xs text-slate-400 font-normal">p</span></div>
                  <div className="text-[11px] text-amber-300/80 mt-1 font-sans">Moderate Flow</div>
                </div>

                {/* Zone C - Green */}
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 transition-all hover:bg-emerald-950/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">ZONE C</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300">
                      OPTIMAL
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">4 <span className="text-xs text-slate-400 font-normal">p</span></div>
                  <div className="text-[11px] text-emerald-300/80 mt-1 font-sans">Lower Density (Free Flow)</div>
                </div>

                {/* Zone D - Slate Grey */}
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 transition-all hover:bg-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300">ZONE D</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      COUNT ONLY
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">2 <span className="text-xs text-slate-400 font-normal">p</span></div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">Perimeter Count</div>
                </div>
              </div>

              {/* Directional Safety Banner */}
              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Optimal Corridor:</span>
                <span className="text-emerald-400 font-semibold font-mono flex items-center gap-1">
                  ZONE C (EGRESS)
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
