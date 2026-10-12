import React, { useEffect, useRef, useState } from 'react';
import { Mic, Radio, Volume2, VolumeX, Activity } from 'lucide-react';
import { radioAudio } from '../utils/radioAudioEngine';

interface VhfRadioUnitProps {
  isPttActive: boolean;
  onPttDown: () => void;
  onPttUp: () => void;
  isReceiving: boolean;
  activeSpeakerName: string;
}

export const VhfRadioUnit: React.FC<VhfRadioUnitProps> = ({
  isPttActive,
  onPttDown,
  onPttUp,
  isReceiving,
  activeSpeakerName,
}) => {
  const [channel, setChannel] = useState<number>(16);
  const [powerHigh, setPowerHigh] = useState<boolean>(true);
  const [squelch, setSquelch] = useState<number>(4);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio waveform rendering
  useEffect(() => {
    let animId: number;
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = radioAudio.getAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animId = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#0a101d';
      ctx.fillRect(0, 0, w, h);

      if (analyser && (isPttActive || isReceiving)) {
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = isPttActive ? '#ef4444' : '#10b981';
        ctx.beginPath();

        const sliceWidth = (w * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(w, h / 2);
        ctx.stroke();
      } else {
        // Flat carrier / squelched line with slight noise
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPttActive, isReceiving]);

  // Volume synchronization
  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    radioAudio.setVolume(newVal / 100);
  };

  const handleToggleMute = () => {
    const muted = radioAudio.toggleMute();
    setIsMuted(muted);
  };

  // Keyboard shortcut: Spacebar triggers PTT
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body && !isPttActive) {
        e.preventDefault();
        onPttDown();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body && isPttActive) {
        e.preventDefault();
        onPttUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPttActive, onPttDown, onPttUp]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-4">
      {/* Radio Header & Model Identity */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-100 tracking-wider text-xs">VHF MARINE TRANSCEIVER</span>
          <span className="text-[11px] font-mono text-slate-400">IC-M506 / GMDSS CLASS D</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setPowerHigh(!powerHigh)}
            className={`px-2 py-0.5 rounded font-mono font-semibold transition-colors ${
              powerHigh ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {powerHigh ? '25W HIGH' : '1W LOW'}
          </button>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-mono text-[11px]">DUPLEX/SIMPLEX</span>
        </div>
      </div>

      {/* Main LCD Display Panel */}
      <div className="bg-[#0b1523] border-2 border-slate-800 rounded-lg p-4 relative overflow-hidden shadow-inner">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-sky-400 font-semibold">
              INTERNATIONAL MARITIME CALLING & DISTRESS
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-5xl font-black font-mono text-amber-400 tracking-tight drop-shadow-sm">
                CH {channel}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-mono font-bold text-slate-200">156.800 MHz</span>
                <span className="text-[10px] font-mono text-red-400 font-semibold tracking-wider">
                  GUARD: EMERGENCY
                </span>
              </div>
            </div>
          </div>

          {/* TX / RX Status Indicators */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400">TX</span>
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  isPttActive
                    ? 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                    : 'bg-red-950/60 border border-red-900/60'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400">RX BUSY</span>
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  isReceiving
                    ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                    : 'bg-emerald-950/60 border border-emerald-900/60'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Signal Strength S-Meter & Active Speaker Readout */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>SIG:</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((bar) => {
                const isActive = (isPttActive || isReceiving) ? bar <= 8 : bar <= 2;
                return (
                  <div
                    key={bar}
                    className={`w-1.5 h-3 rounded-xs ${
                      isActive
                        ? bar > 6
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                        : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-slate-300 ml-1">{(isPttActive || isReceiving) ? '+20dB' : 'SQL'}</span>
          </div>

          <div className="text-[11px] font-mono">
            {isPttActive ? (
              <span className="text-red-400 font-bold animate-pulse">TRANSMITTING OVER CH 16</span>
            ) : isReceiving ? (
              <span className="text-emerald-400 font-bold">RECEIVING: {activeSpeakerName || 'INCOMING SIGNAL'}</span>
            ) : (
              <span className="text-slate-500">STANDBY · CARRIER CLEAR</span>
            )}
          </div>
        </div>

        {/* Oscilloscope Waveform Display */}
        <div className="mt-2.5 h-10 w-full rounded border border-slate-800/80 overflow-hidden bg-black/60">
          <canvas
            ref={waveformCanvasRef}
            width={380}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Control Dials & Push-To-Talk Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        {/* Squelch Control */}
        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">Squelch (SQL)</span>
            <span className="font-mono text-sky-400 text-[11px]">Level {squelch}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={squelch}
            onChange={(e) => setSquelch(Number(e.target.value))}
            className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>OPEN</span>
            <span>TIGHT</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleMute}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-300" />}
              </button>
              <span className="font-semibold text-slate-300">Volume (VOL)</span>
            </div>
            <span className="font-mono text-sky-400 text-[11px]">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>MIN</span>
            <span>MAX</span>
          </div>
        </div>

        {/* Heavy-Duty PTT Button */}
        <div className="flex flex-col items-center">
          <button
            onMouseDown={onPttDown}
            onMouseUp={onPttUp}
            onTouchStart={(e) => {
              e.preventDefault();
              onPttDown();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onPttUp();
            }}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all select-none shadow-lg active:scale-98 ${
              isPttActive
                ? 'bg-red-600 text-white shadow-red-600/50 ring-4 ring-red-500/30'
                : 'bg-gradient-to-b from-red-700 to-red-800 text-red-100 hover:from-red-600 hover:to-red-700 border border-red-500/40'
            }`}
          >
            <Mic className={`w-4 h-4 ${isPttActive ? 'animate-bounce' : ''}`} />
            <span>{isPttActive ? 'TRANSMITTING (PTT)' : 'PUSH-TO-TALK (PTT)'}</span>
          </button>
          <span className="text-[10px] font-mono text-slate-400 mt-1">HOLD CLICK OR SPACEBAR</span>
        </div>
      </div>

      {/* Channel Preset Buttons */}
      <div className="flex items-center gap-1.5 pt-1 text-xs border-t border-slate-800/80">
        <span className="text-slate-400 font-mono text-[11px] mr-1">CH QUICK:</span>
        {[
          { ch: 16, label: '16 (Distress)' },
          { ch: 6, label: '06 (Safety)' },
          { ch: 12, label: '12 (Port)' },
          { ch: 70, label: '70 (DSC)' },
        ].map((item) => (
          <button
            key={item.ch}
            onClick={() => setChannel(item.ch)}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
              channel === item.ch
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
