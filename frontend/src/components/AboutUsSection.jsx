import React from 'react';
import { Shield, Cpu, Target, Award, Users, BookOpen } from 'lucide-react';

/**
 * About Us Section
 * Explains SAFACT's mission, origin, architectural philosophy, and research foundation.
 */
export default function AboutUsSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-slate-950 border-b border-slate-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-slate-300">
            OUR MISSION & GENESIS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            About SAFACT (Safe Act)
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            SAFACT was engineered to bridge computer-vision intelligence and real-time public safety.
            By translating raw optical camera streams into spatial density insights, we empower event organisers
            and individuals to navigate high-density venues with confidence.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 space-y-4 hover:border-slate-700 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white m-0">The Spatial Safety Problem</h3>
            <p className="text-xs text-slate-400 leading-relaxed m-0">
              Traditional crowd control relies on static door counts or delayed security reports. Compressive crowd crush occurs when people unknowingly surge into already congested corridors. SAFACT provides early spatial visibility before bottlenecks solidify.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 space-y-4 hover:border-slate-700 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white m-0">Privacy-First AI Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed m-0">
              We reject biometric surveillance. Our monocular YOLOv8 model calculates bounding box coordinates and centroids without identifying individuals, retaining zero images or facial records, adhering strictly to global privacy frameworks.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 space-y-4 hover:border-slate-700 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white m-0">Academic & Engineering Rigor</h3>
            <p className="text-xs text-slate-400 leading-relaxed m-0">
              Designed as a professional engineering demonstration, SAFACT incorporates Fruin Level-of-Service formulas, 4-zone spatial quadrant mapping, real-time FPS inference, and local LLM reasoning via Ollama.
            </p>
          </div>
        </div>

        {/* Technical Architecture Summary */}
        <div className="bg-slate-900/60 rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-left">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              System Architecture
            </span>
            <h4 className="text-base font-bold text-white m-0">
              React + Vite Frontend • FastAPI Python Core • YOLOv8n Vision • Local Ollama LLM
            </h4>
            <p className="text-xs text-slate-400 m-0">
              Fully self-contained, zero-dependency cloud-free architecture designed for resilient on-premise execution.
            </p>
          </div>

          <a
            href="#why-it-matters"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors whitespace-nowrap"
          >
            Explore Crowd Science
          </a>
        </div>
      </div>
    </section>
  );
}
