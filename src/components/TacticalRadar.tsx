import React, { useEffect, useRef, useState } from 'react';
import { Compass, Eye, ShieldAlert, Wind } from 'lucide-react';
import { VESSEL_DATA } from '../data/scenarioData';

interface TacticalRadarProps {
  activeStage: number;
  isTransmitting: boolean;
}

export const TacticalRadar: React.FC<TacticalRadarProps> = ({ activeStage, isTransmitting }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rangeNm, setRangeNm] = useState<number>(18);
  const [showCoastline, setShowCoastline] = useState<boolean>(true);
  const [sweepAngle, setSweepAngle] = useState<number>(0);

  useEffect(() => {
    let animId: number;
    let angle = 0;

    const render = () => {
      angle = (angle + 0.02) % (Math.PI * 2);
      setSweepAngle(angle);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxRadius = Math.min(cx, cy) - 24;

      // Dark maritime radar canvas
      ctx.fillStyle = '#080E1A';
      ctx.fillRect(0, 0, w, h);

      // Distance rings
      const rings = [0.25, 0.5, 0.75, 1.0];
      rings.forEach((ratio, idx) => {
        const r = maxRadius * ratio;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === rings.length - 1 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ring label
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`${((rangeNm * ratio)).toFixed(0)} NM`, cx + 4, cy - r + 12);
      });

      // Crosshairs
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.stroke();

      // Heading ticks around perimeter
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.3)';
      for (let d = 0; d < 360; d += 30) {
        const rad = (d * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * maxRadius;
        const y1 = cy + Math.sin(rad) * maxRadius;
        const x2 = cx + Math.cos(rad) * (maxRadius - (d % 90 === 0 ? 10 : 5));
        const y2 = cy + Math.sin(rad) * (maxRadius - (d % 90 === 0 ? 10 : 5));
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (d % 90 === 0) {
          const label = d === 0 ? '090° E' : d === 90 ? '180° S' : d === 180 ? '270° W' : '000° N';
          ctx.fillStyle = '#38bdf8';
          ctx.font = '10px "JetBrains Mono", monospace';
          const lx = cx + Math.cos(rad) * (maxRadius + 14) - 14;
          const ly = cy + Math.sin(rad) * (maxRadius + 14) + 4;
          ctx.fillText(label, lx, ly);
        }
      }

      // Pariaman Coastline approximation (East of vessel)
      if (showCoastline) {
        ctx.beginPath();
        // Coastline is to the East (right side of radar display)
        const coastX = cx + (12 / rangeNm) * maxRadius;
        ctx.moveTo(coastX, cy - maxRadius * 0.9);
        ctx.bezierCurveTo(coastX - 15, cy - maxRadius * 0.4, coastX + 25, cy + maxRadius * 0.2, coastX + 5, cy + maxRadius * 0.9);
        ctx.lineTo(w, cy + maxRadius * 0.9);
        ctx.lineTo(w, cy - maxRadius * 0.9);
        ctx.closePath();
        ctx.fillStyle = 'rgba(15, 45, 60, 0.45)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Coastline landmark labels
        ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
        ctx.font = '11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('PARIAMAN COASTLINE', coastX + 10, cy - 20);
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.fillText('West Sumatra, ID', coastX + 10, cy - 6);
      }

      // Radar Sweep Line & Phosphor Glow
      const sweepX = cx + Math.cos(angle) * maxRadius;
      const sweepY = cy + Math.sin(angle) * maxRadius;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxRadius, angle - 0.35, angle);
      ctx.closePath();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Vessel Blip: KM Pariaman Indah (at center origin)
      const vesselX = cx;
      const vesselY = cy;

      // Pulsing distress ping
      const pingSize = (Date.now() / 35) % 36;
      ctx.beginPath();
      ctx.arc(vesselX, vesselY, pingSize, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0, 1 - pingSize / 36)})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vessel Target Mark
      ctx.beginPath();
      ctx.arc(vesselX, vesselY, 5, 0, Math.PI * 2);
      ctx.fillStyle = isTransmitting ? '#f87171' : '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Wind Vector Arrow (20 kts NW, blowing to SE)
      const windRad = (315 * Math.PI) / 180;
      const windLen = 32;
      ctx.beginPath();
      ctx.moveTo(vesselX, vesselY);
      ctx.lineTo(vesselX + Math.cos(windRad) * windLen, vesselY + Math.sin(windRad) * windLen);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vessel Data Tag
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('KM PARIAMAN INDAH', vesselX + 12, vesselY - 14);

      ctx.fillStyle = '#f87171';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('[MAYDAY: ENGINE FIRE]', vesselX + 12, vesselY);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`00°35′S 100°05′E · 12NM OFF COAST`, vesselX + 12, vesselY + 12);

      // SAR cutter deployment in Stage 4
      if (activeStage >= 4) {
        const sarX = cx + (8 / rangeNm) * maxRadius;
        const sarY = cy + (6 / rangeNm) * maxRadius;

        ctx.beginPath();
        ctx.arc(sarX, sarY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Vector line towards vessel
        ctx.beginPath();
        ctx.moveTo(sarX, sarY);
        ctx.lineTo(vesselX, vesselY);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('SAR RESCUE CUTTER (ETA 45m)', sarX + 8, sarY + 4);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [rangeNm, showCoastline, activeStage, isTransmitting]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col h-full">
      {/* Radar Control Strip */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-semibold text-slate-200">Tactical Situational Radar</span>
          <span className="text-xs font-mono text-slate-400">· 156.800 MHz (Ch 16)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCoastline(!showCoastline)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              showCoastline ? 'bg-sky-950 text-sky-300 border border-sky-800' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Eye className="w-3 h-3" />
            Coast
          </button>

          <div className="flex items-center bg-slate-800 rounded-md p-0.5">
            {[12, 18, 24].map((nm) => (
              <button
                key={nm}
                onClick={() => setRangeNm(nm)}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                  rangeNm === nm ? 'bg-slate-700 text-sky-300 font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {nm}NM
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Radar Screen Canvas */}
      <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden rounded-lg bg-black/40 border border-slate-800/80">
        <canvas
          ref={canvasRef}
          width={420}
          height={380}
          className="w-full h-full max-h-[380px] object-contain"
        />

        {/* Real-time Bearing Hud Overlay */}
        <div className="absolute top-2 left-2 text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 pointer-events-none">
          <div className="text-sky-400 font-medium">DATUM: 00°35′S 100°05′E</div>
          <div>BEARING: 270°T FROM PARIAMAN</div>
          <div>SWEEP: {((sweepAngle * 180) / Math.PI).toFixed(0)}°</div>
        </div>

        <div className="absolute bottom-2 right-2 text-[11px] font-mono text-amber-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 pointer-events-none flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-amber-400" />
          <span>WIND: 20 KTS NW · SEAS: 2.8M</span>
        </div>
      </div>

      {/* Vessel Quick Data Feed */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/70">
          <div className="text-slate-400 text-[11px]">DISTRESS VESSEL</div>
          <div className="font-semibold text-slate-200 text-sm">{VESSEL_DATA.name}</div>
          <div className="font-mono text-amber-400 text-xs mt-0.5">CALL SIGN: {VESSEL_DATA.callSign} ({VESSEL_DATA.phoneticCallSign})</div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/70">
          <div className="text-slate-400 text-[11px] flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-400" />
            CASUALTY STATUS
          </div>
          <div className="font-semibold text-red-400 text-sm">POB: 8 · ENGINE FIRE</div>
          <div className="font-mono text-slate-300 text-xs mt-0.5">PROPULSION: DISABLED</div>
        </div>
      </div>
    </div>
  );
};
