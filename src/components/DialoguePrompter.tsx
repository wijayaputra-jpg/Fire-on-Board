import React from 'react';
import { Play, Pause, SkipForward, Volume2, Info, CheckCircle2, ChevronRight, User, Shield } from 'lucide-react';
import { DialogueLine, ScenarioStage, SpeakerRole } from '../types/maritime';
import { IMAGE_ASSETS } from '../data/scenarioData';

interface DialoguePrompterProps {
  currentStage: ScenarioStage;
  activeLineIndex: number;
  onSelectLine: (index: number) => void;
  onPlayCurrentLine: () => void;
  isAudioPlaying: boolean;
  onStopAudio: () => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  onNextStage: () => void;
  onPrevStage: () => void;
  userRole: SpeakerRole;
  onRoleChange: (role: SpeakerRole) => void;
}

export const DialoguePrompter: React.FC<DialoguePrompterProps> = ({
  currentStage,
  activeLineIndex,
  onSelectLine,
  onPlayCurrentLine,
  isAudioPlaying,
  onStopAudio,
  isAutoPlaying,
  onToggleAutoPlay,
  onNextStage,
  onPrevStage,
  userRole,
  onRoleChange,
}) => {
  const activeLine: DialogueLine = currentStage.dialogue[activeLineIndex] || currentStage.dialogue[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Stage Header & Sequence Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-sky-400 font-semibold">{currentStage.phaseCode}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-medium">Stage {currentStage.stageNumber} of 4</span>
          </div>
          <h2 className="text-base font-bold text-slate-100 mt-0.5">{currentStage.title}</h2>
        </div>

        {/* Playback & Automation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoPlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isAutoPlaying
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoPlaying ? 'Pause Auto-Play' : 'Auto-Play Sequence'}</span>
          </button>

          <button
            onClick={onNextStage}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Next Stage"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Role Perspective Toggle */}
      <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium pl-1">Training Perspective:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onRoleChange('captain')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              userRole === 'captain'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Captain (KM Pariaman Indah)</span>
          </button>
          <button
            onClick={() => onRoleChange('mrcc')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              userRole === 'mrcc'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>MRCC Radio Officer</span>
          </button>
        </div>
      </div>

      {/* Active Line Display / Teleprompter Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        {/* Character Portrait & Continuity Avatar */}
        <div className="md:col-span-4 bg-slate-950/80 rounded-lg border border-slate-800 overflow-hidden flex flex-col">
          <div className="relative aspect-video md:aspect-auto md:flex-1 w-full bg-slate-900 overflow-hidden">
            <img
              src={activeLine.speaker === 'captain' ? IMAGE_ASSETS.captain : IMAGE_ASSETS.mrcc}
              alt={activeLine.speakerName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                {activeLine.speaker === 'captain' ? 'VESSEL WHEELHOUSE' : 'SAR OPERATIONS ROOM'}
              </div>
              <div className="text-xs font-bold text-white truncate">{activeLine.speakerName}</div>
            </div>
          </div>
          <div className="p-2.5 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 bg-slate-950">
            {activeLine.speaker === 'captain' ? (
              <div>VHF Handheld Mic · West Sumatra (12 NM off)</div>
            ) : (
              <div>MRCC Headset Comms · Channel 16 Guard</div>
            )}
          </div>
        </div>

        {/* Verbatim Script & Phonetic Recitation Card */}
        <div className="md:col-span-8 bg-slate-950/90 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  activeLine.speaker === 'captain' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {activeLine.speaker === 'captain' ? 'CAPTAIN TRANSMISSION' : 'MRCC ACKNOWLEDGMENT'}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Neural Voice Provider (Wavenet & 24kHz Master)
                </span>
              </div>

              {/* Broadcast Line Audio Button */}
              <button
                onClick={isAudioPlaying ? onStopAudio : onPlayCurrentLine}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-md ${
                  isAudioPlaying
                    ? 'bg-amber-500 text-slate-950 animate-pulse'
                    : 'bg-gradient-to-r from-sky-600 to-sky-500 text-white hover:from-sky-500 hover:to-sky-400'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isAudioPlaying ? 'Transmitting Neural Audio...' : 'Broadcast Neural VHF Voice'}</span>
              </button>
            </div>

            {/* Verbatim Spoken Line Box */}
            <div className="p-3 bg-black/50 border border-slate-800 rounded-lg font-mono text-sm leading-relaxed text-slate-100 select-text">
              {activeLine.verbatimText}
            </div>

            {/* Phonetic Pronunciation Guide */}
            <div className="mt-3 p-2.5 bg-sky-950/30 border border-sky-900/40 rounded-lg">
              <div className="flex items-center gap-1 text-[11px] font-bold text-sky-300 mb-1">
                <Info className="w-3 h-3" />
                <span>MANDATORY NUMBER & PHONETIC RULES:</span>
              </div>
              <ul className="text-xs text-sky-200/90 space-y-0.5 list-disc list-inside">
                {activeLine.phoneticPronunciationGuide.map((guide, idx) => (
                  <li key={idx} className="font-mono text-[11px]">
                    {guide}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Critical SMCP Checkpoints */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protocol Focus:</span>
              <span className="text-slate-300 font-medium">{activeLine.criticalPoints.join(' · ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Step Selector Tabs */}
      <div className="flex items-center gap-2 pt-1 overflow-x-auto">
        {currentStage.dialogue.map((line, idx) => (
          <button
            key={line.id}
            onClick={() => onSelectLine(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-all whitespace-nowrap shrink-0 border ${
              activeLineIndex === idx
                ? 'bg-slate-800 border-sky-500 text-sky-300 font-semibold'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Line {idx + 1}: </span>
            <span className="font-semibold">{line.speaker === 'captain' ? 'Captain' : 'MRCC Officer'}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
