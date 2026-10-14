import React, { useState } from 'react';
import { Box, Layers, Info, CheckCircle2, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';

/**
 * Interactive 3D Isometric Zone Map
 * Renders Zones A (Red), B (Yellow), C (Green), and D (Slate Grey) in an isometric 3D perspective.
 * Block height dynamically scales with detected people count.
 * Color represents zone classification status.
 */
export default function Zone3DMap({ zones = [], hasProcessedFrame = false }) {
  const [selectedZoneId, setSelectedZoneId] = useState('ZONE_A');
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d'

  // Standardize 4 zones if not fully provided
  const zoneA = zones?.find((z) => z.id === 'ZONE_A' || z.code === 'ZONE A') || {
    id: 'ZONE_A',
    code: 'ZONE A',
    name: 'Sector A — Primary Concourse',
    people_count: hasProcessedFrame ? 0 : 18,
    area_sqft: 215,
    sqft_per_person: hasProcessedFrame ? null : 11.9,
    people_per_sqft: hasProcessedFrame ? 0 : 0.084,
    density_category: hasProcessedFrame ? 'Zero Occupants' : 'High Density',
    color: '#ef4444',
    risk_level: 'HIGH',
    explanation: 'High estimated density based on spatial bounds and active concentration.',
  };

  const zoneB = zones?.find((z) => z.id === 'ZONE_B' || z.code === 'ZONE B') || {
    id: 'ZONE_B',
    code: 'ZONE B',
    name: 'Sector B — Transit Way',
    people_count: hasProcessedFrame ? 0 : 8,
    area_sqft: 194,
    sqft_per_person: hasProcessedFrame ? null : 24.3,
    people_per_sqft: hasProcessedFrame ? 0 : 0.041,
    density_category: hasProcessedFrame ? 'Zero Occupants' : 'Moderate Density',
    color: '#eab308',
    risk_level: 'MODERATE',
    explanation: 'Moderate estimated density with regular pedestrian thoroughfare.',
  };

  const zoneC = zones?.find((z) => z.id === 'ZONE_C' || z.code === 'ZONE C') || {
    id: 'ZONE_C',
    code: 'ZONE C',
    name: 'Sector C — Egress Corridor',
    people_count: hasProcessedFrame ? 0 : 4,
    area_sqft: 269,
    sqft_per_person: hasProcessedFrame ? null : 67.3,
    people_per_sqft: hasProcessedFrame ? 0 : 0.015,
    density_category: hasProcessedFrame ? 'Zero Occupants' : 'Lower Density',
    color: '#22c55e',
    risk_level: 'LOW',
    explanation: 'Lower estimated density with open egress reserve space.',
  };

  const zoneD = zones?.find((z) => z.id === 'ZONE_D' || z.code === 'ZONE D') || {
    id: 'ZONE_D',
    code: 'ZONE D',
    name: 'Sector D — Outer Perimeter',
    people_count: hasProcessedFrame ? 0 : 2,
    area_sqft: 161,
    sqft_per_person: hasProcessedFrame ? null : 80.5,
    people_per_sqft: hasProcessedFrame ? 0 : 0.012,
    density_category: 'Count Only',
    color: '#64748b',
    risk_level: 'COUNT_ONLY',
    is_count_only: true,
    explanation: 'Perimeter count-only sector without automated risk classification.',
  };

  const activeZones = [zoneA, zoneB, zoneC, zoneD];
  const selectedZone = activeZones.find((z) => z.id === selectedZoneId) || activeZones[0];

  // Helper to compute isometric block height (min 16px, max 80px)
  const getBlockHeight = (count) => {
    return Math.min(Math.max((count || 0) * 4 + 16, 16), 84);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight m-0">
              Interactive 3D Spatial Zone Map
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              ISOMETRIC PROJECTION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 mb-0">
            Block height represents <strong className="text-slate-200">detected occupants</strong>. Color represents <strong className="text-slate-200">zone classification</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!hasProcessedFrame && (
            <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md bg-amber-950/60 text-amber-400 border border-amber-800/80 animate-pulse">
              SAMPLE DATA — NOT A LIVE SCAN
            </span>
          )}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                viewMode === '3d'
                  ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Isometric
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                viewMode === '2d'
                  ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D Floor Plan
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Isometric 3D Canvas / Projection (Col 7) */}
        <div className="lg:col-span-7 bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 min-h-[340px] flex items-center justify-center relative select-none">
          {viewMode === '3d' ? (
            <div className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center">
              {/* Isometric SVG Container */}
              <svg
                viewBox="0 0 500 400"
                className="w-full h-full drop-shadow-2xl overflow-visible"
              >
                <defs>
                  {/* Subtle Grid Floor Gradient */}
                  <radialGradient id="floorGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.2" />
                  </radialGradient>
                </defs>

                {/* Base Ground Grid */}
                <polygon
                  points="250,90 440,200 250,310 60,200"
                  fill="url(#floorGlow)"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Grid Divider Lines */}
                <line x1="250" y1="90" x2="250" y2="310" stroke="#1e293b" strokeWidth="1" />
                <line x1="60" y1="200" x2="440" y2="200" stroke="#1e293b" strokeWidth="1" />

                {/*
                  Isometric Quadrants:
                  Center: (250, 200)
                  Zone A (Top-Left): Center roughly (155, 145)
                  Zone B (Top-Right): Center roughly (345, 145)
                  Zone C (Bottom-Left): Center roughly (155, 255)
                  Zone D (Bottom-Right): Center roughly (345, 255)
                */}

                {/* ZONE A (Top Left) */}
                {renderIsoBlock({
                  zone: zoneA,
                  cx: 155,
                  cy: 145,
                  height: getBlockHeight(zoneA.people_count),
                  baseColor: '#ef4444',
                  isSelected: selectedZoneId === 'ZONE_A',
                  onClick: () => setSelectedZoneId('ZONE_A'),
                })}

                {/* ZONE B (Top Right) */}
                {renderIsoBlock({
                  zone: zoneB,
                  cx: 345,
                  cy: 145,
                  height: getBlockHeight(zoneB.people_count),
                  baseColor: '#eab308',
                  isSelected: selectedZoneId === 'ZONE_B',
                  onClick: () => setSelectedZoneId('ZONE_B'),
                })}

                {/* ZONE C (Bottom Left) */}
                {renderIsoBlock({
                  zone: zoneC,
                  cx: 155,
                  cy: 255,
                  height: getBlockHeight(zoneC.people_count),
                  baseColor: '#22c55e',
                  isSelected: selectedZoneId === 'ZONE_C',
                  onClick: () => setSelectedZoneId('ZONE_C'),
                })}

                {/* ZONE D (Bottom Right) */}
                {renderIsoBlock({
                  zone: zoneD,
                  cx: 345,
                  cy: 255,
                  height: getBlockHeight(zoneD.people_count),
                  baseColor: '#64748b',
                  isSelected: selectedZoneId === 'ZONE_D',
                  onClick: () => setSelectedZoneId('ZONE_D'),
                })}
              </svg>
            </div>
          ) : (
            /* 2D Fallback Plan */
            <div className="w-full max-w-[360px] aspect-square grid grid-cols-2 gap-3 p-3">
              {activeZones.map((z) => {
                const isSelected = selectedZoneId === z.id;
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setSelectedZoneId(z.id)}
                    className={`rounded-xl p-4 flex flex-col justify-between border-2 transition-all text-left ${
                      isSelected
                        ? 'border-white bg-slate-800 shadow-lg scale-[1.02]'
                        : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: z.color }}>
                        {z.code}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {z.people_count} {z.people_count === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs font-medium text-slate-300">{z.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{z.density_category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Zone Deep Dive Telemetry (Col 5) */}
        <div className="lg:col-span-5 bg-slate-950/60 rounded-xl border border-slate-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-sm"
                style={{ backgroundColor: selectedZone.color }}
              />
              <div>
                <h4 className="text-base font-bold text-white m-0">
                  {selectedZone.code}: {selectedZone.name}
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedZone.is_count_only ? 'Perimeter Partition (Count-Only)' : 'Spatial Analysis Sector'}
                </span>
              </div>
            </div>
            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded-md border"
              style={{
                borderColor: `${selectedZone.color}60`,
                backgroundColor: `${selectedZone.color}20`,
                color: selectedZone.color === '#64748b' ? '#cbd5e1' : selectedZone.color,
              }}
            >
              {selectedZone.density_category}
            </span>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Detected People</span>
              <span className="text-2xl font-bold font-mono text-white">
                {selectedZone.people_count}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">YOLOv8 Monocular</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Sector Area</span>
              <span className="text-2xl font-bold font-mono text-slate-200">
                {selectedZone.area_sqft} <span className="text-xs font-normal text-slate-500">sq ft</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Physical Survey Area</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Space Per Person</span>
              <span className="text-lg font-bold font-mono text-cyan-400">
                {selectedZone.sqft_per_person !== null && selectedZone.sqft_per_person !== undefined
                  ? `${selectedZone.sqft_per_person} sq ft`
                  : 'Open / Zero Occ.'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Area ÷ Detected Count
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Density Rate</span>
              <span className="text-lg font-bold font-mono text-slate-200">
                {selectedZone.people_per_sqft !== undefined
                  ? `${selectedZone.people_per_sqft} p/sq ft`
                  : '0.000 p/sq ft'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Count ÷ Area
              </span>
            </div>
          </div>

          {/* Context Explanation */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs leading-relaxed">
            <span className="font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Safety & Classification Directive
            </span>
            <p className="text-slate-400 m-0">
              {selectedZone.explanation || selectedZone.recommended_action || 'Monitoring continuous pedestrian flow.'}
            </p>
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-slate-400 font-medium">Zone Classifications:</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <span className="text-slate-300">Zone A (Red) High Density</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-3 h-3 rounded-full bg-[#eab308]" />
            <span className="text-slate-300">Zone B (Yellow) Moderate Density</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span className="text-slate-300">Zone C (Green) Lower Density</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-3 h-3 rounded-full bg-[#64748b]" />
            <span className="text-slate-400">Zone D (Slate Grey) Count Only</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 italic">
          Click or hover blocks to inspect telemetry
        </span>
      </div>
    </div>
  );
}

/**
 * Helper to render an isometric 3D prism with top, left, and right faces
 */
function renderIsoBlock({ zone, cx, cy, height, baseColor, isSelected, onClick }) {
  // Isometric dimensions
  const w = 68; // half width
  const h = 38; // half depth
  const topY = cy - height;

  // Colors
  const topColor = baseColor;
  const leftColor = shadeColor(baseColor, -25);
  const rightColor = shadeColor(baseColor, -40);

  return (
    <g
      key={zone.id}
      onClick={onClick}
      className="cursor-pointer transition-transform duration-300 group"
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        filter: isSelected ? 'drop-shadow(0 0 14px rgba(255,255,255,0.35))' : 'none',
      }}
    >
      {/* Front-Left Face */}
      <polygon
        points={`
          ${cx - w},${topY}
          ${cx},${topY + h}
          ${cx},${cy + h}
          ${cx - w},${cy}
        `}
        fill={leftColor}
        stroke="#0f172a"
        strokeWidth="1.2"
        opacity={isSelected ? 1 : 0.88}
        className="transition-opacity group-hover:opacity-100"
      />

      {/* Front-Right Face */}
      <polygon
        points={`
          ${cx},${topY + h}
          ${cx + w},${topY}
          ${cx + w},${cy}
          ${cx},${cy + h}
        `}
        fill={rightColor}
        stroke="#0f172a"
        strokeWidth="1.2"
        opacity={isSelected ? 1 : 0.88}
        className="transition-opacity group-hover:opacity-100"
      />

      {/* Top Face */}
      <polygon
        points={`
          ${cx},${topY - h}
          ${cx + w},${topY}
          ${cx},${topY + h}
          ${cx - w},${topY}
        `}
        fill={topColor}
        stroke={isSelected ? '#ffffff' : '#0f172a'}
        strokeWidth={isSelected ? '2' : '1.2'}
        opacity={isSelected ? 1 : 0.92}
        className="transition-opacity group-hover:opacity-100"
      />

      {/* Top Label: Zone Code & Count */}
      <text
        x={cx}
        y={topY - 4}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12"
        fontWeight="bold"
        fontFamily="monospace"
        className="pointer-events-none drop-shadow"
      >
        {zone.code}
      </text>
      <text
        x={cx}
        y={topY + 12}
        textAnchor="middle"
        fill="#f8fafc"
        fontSize="11"
        fontWeight="600"
        fontFamily="monospace"
        className="pointer-events-none drop-shadow"
      >
        {zone.people_count} {zone.people_count === 1 ? 'p' : 'ppl'}
      </text>

      {/* Pulsing selection circle */}
      {isSelected && (
        <circle
          cx={cx}
          cy={topY - h - 10}
          r="4"
          fill="#38bdf8"
          className="animate-ping"
        />
      )}
    </g>
  );
}

/**
 * Utility to shade hex colors
 */
function shadeColor(color, percent) {
  let num = parseInt(color.replace('#', ''), 16);
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let B = ((num >> 8) & 0x00ff) + amt;
  let G = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
      (G < 255 ? (G < 1 ? 0 : G) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
