import React from 'react';
import { TrendingUp, Clock } from 'lucide-react';

export default function DensityChart({ history }) {
  const data = history && history.length > 0 ? history : [
    { datetime_str: '18:00', risk_score: 12, density: 0.4 },
    { datetime_str: '18:05', risk_score: 18, density: 0.6 },
    { datetime_str: '18:10', risk_score: 25, density: 0.8 },
    { datetime_str: '18:15', risk_score: 42, density: 1.4 },
    { datetime_str: '18:20', risk_score: 55, density: 1.8 },
    { datetime_str: '18:25', risk_score: 68, density: 2.2 },
    { datetime_str: '18:30', risk_score: 48, density: 1.5 },
  ];

  // SVG Chart dimensions
  const width = 600;
  const height = 180;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;

  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  // Max score scale is 100
  const maxScore = 100;
  const points = data.map((d, i) => {
    const x = padL + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padT + chartH - (d.risk_score / maxScore) * chartH;
    return { x, y, ...d };
  });

  const pathStr = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaStr = `${pathStr} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white m-0">
              Crowd Density & Risk Index Trend
            </h3>
            <p className="text-xs text-slate-400 m-0">
              Trailing time-series telemetry (Fruin LOS thresholds)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            Composite Risk (0-100)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-0.5 bg-rose-500" />
            Hazard Line (70)
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 select-none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padT + chartH - (val / 100) * chartH;
            return (
              <g key={val}>
                <line
                  x1={padL}
                  y1={y}
                  x2={width - padR}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray={val === 70 ? '4 4' : '2 2'}
                />
                <text
                  x={padL - 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Hazard Threshold Line at 70 */}
          {(() => {
            const y70 = padT + chartH - (70 / 100) * chartH;
            return (
              <line
                x1={padL}
                y1={y70}
                x2={width - padR}
                y2={y70}
                stroke="#f43f5e"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
            );
          })()}

          {/* Area Fill */}
          <path d={areaStr} fill="url(#chartGradient)" />

          {/* Line Stroke */}
          <path d={pathStr} fill="none" stroke="#22d3ee" strokeWidth="2.5" />

          {/* Data Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="#0f172a"
              stroke={p.risk_score >= 70 ? '#f43f5e' : '#22d3ee'}
              strokeWidth="2"
            />
          ))}

          {/* X Axis Timestamps */}
          {points.map((p, i) => {
            if (i % Math.ceil(points.length / 5) === 0 || i === points.length - 1) {
              return (
                <text
                  key={i}
                  x={p.x}
                  y={height - 8}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {p.datetime_str || `${i}m`}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
}
