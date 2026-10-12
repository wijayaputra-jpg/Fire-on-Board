import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Radio, Film, BookOpen, Volume2, VolumeX, AlertTriangle, Download, Compass, Shield, Waves } from 'lucide-react';
import { SCENARIO_STAGES, VESSEL_DATA, MASTER_VIDEO_PROMPT_DOC } from './data/scenarioData';
import { SpeakerRole } from './types/maritime';
import { TacticalRadar } from './components/TacticalRadar';
import { VhfRadioUnit } from './components/VhfRadioUnit';
import { DialoguePrompter } from './components/DialoguePrompter';
import { PromptStudio } from './components/PromptStudio';
import { ProtocolReferenceModal } from './components/ProtocolReferenceModal';
import { radioAudio } from './utils/radioAudioEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'prompt-studio'>('simulator');
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [isPttActive, setIsPttActive] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [isAmbientSeaOn, setIsAmbientSeaOn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<SpeakerRole>('captain');
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState<boolean>(false);

  const activeStage = SCENARIO_STAGES[activeStageIndex];
  const activeLine = activeStage.dialogue[activeLineIndex] || activeStage.dialogue[0];
  const audioCancelRef = useRef<(() => void) | null>(null);

  // Play dialogue line with VHF radio sound filter
  const handlePlayCurrentLine = useCallback(() => {
    if (audioCancelRef.current) {
      audioCancelRef.current();
      audioCancelRef.current = null;
    }

    const { cancel } = radioAudio.speakRadioMessage(
      activeLine.verbatimText,
      activeLine.speaker,
      () => {
        setIsAudioPlaying(true);
      },
      () => {
        setIsAudioPlaying(false);
        // If in auto-play mode, advance to next line or stage
        if (isAutoPlaying) {
          if (activeLineIndex < activeStage.dialogue.length - 1) {
            setActiveLineIndex((prev) => prev + 1);
          } else if (activeStageIndex < SCENARIO_STAGES.length - 1) {
            setActiveStageIndex((prev) => prev + 1);
            setActiveLineIndex(0);
          } else {
            setIsAutoPlaying(false);
          }
        }
      },
      activeLine.id
    );

    audioCancelRef.current = cancel;
  }, [activeLine, activeLineIndex, activeStage.dialogue.length, activeStageIndex, isAutoPlaying]);

  const handleStopAudio = useCallback(() => {
    if (audioCancelRef.current) {
      audioCancelRef.current();
      audioCancelRef.current = null;
    }
    setIsAudioPlaying(false);
    setIsAutoPlaying(false);
  }, []);

  // Auto-play trigger effect
  useEffect(() => {
    if (isAutoPlaying && !isAudioPlaying) {
      const timer = setTimeout(() => {
        handlePlayCurrentLine();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlaying, isAudioPlaying, activeStageIndex, activeLineIndex, handlePlayCurrentLine]);

  // PTT Press and Release handlers
  const handlePttDown = useCallback(() => {
    setIsPttActive(true);
    radioAudio.playPttPress();
  }, []);

  const handlePttUp = useCallback(() => {
    setIsPttActive(false);
    radioAudio.playPttRelease(true);
  }, []);

  // Ambient sea sound toggle
  const handleToggleSeaAmbience = () => {
    if (isAmbientSeaOn) {
      radioAudio.stopSeaAmbience();
      setIsAmbientSeaOn(false);
    } else {
      radioAudio.startSeaAmbience();
      setIsAmbientSeaOn(true);
    }
  };

  // Stage navigation
  const handleNextStage = () => {
    handleStopAudio();
    if (activeStageIndex < SCENARIO_STAGES.length - 1) {
      setActiveStageIndex(activeStageIndex + 1);
      setActiveLineIndex(0);
    }
  };

  const handlePrevStage = () => {
    handleStopAudio();
    if (activeStageIndex > 0) {
      setActiveStageIndex(activeStageIndex - 1);
      setActiveLineIndex(0);
    }
  };

  // Export full training transcript and prompt package
  const handleExportPackage = () => {
    const fullTranscript = `MAYDAY DISTRESS TRAINING TRANSCRIPT & GOOGLE FLOW PROMPT PACKAGE
======================================================================
Vessel: ${VESSEL_DATA.name} | Call Sign: ${VESSEL_DATA.phoneticCallSign}
Position: ${VESSEL_DATA.latitude}, ${VESSEL_DATA.longitude} (${VESSEL_DATA.reportedLocation})
Casualty: ${VESSEL_DATA.emergencyType} | POB: ${VESSEL_DATA.personsOnBoard}

4-STAGE EMERGENCY TRANSCRIPT:
----------------------------------------------------------------------
${SCENARIO_STAGES.map((s) => `[STAGE ${s.stageNumber}: ${s.title}]
${s.dialogue.map((d) => `${d.speakerName.toUpperCase()}:
"${d.verbatimText}"
Phonetic Check: ${d.phoneticPronunciationGuide.join(' | ')}
`).join('\n')}`).join('\n\n')}

MASTER VIDEO PROMPT SPECIFICATION:
----------------------------------------------------------------------
Style: ${MASTER_VIDEO_PROMPT_DOC.visualStyle}
Vessel Continuity: ${MASTER_VIDEO_PROMPT_DOC.vesselContinuity}
Character Continuity: ${MASTER_VIDEO_PROMPT_DOC.characterContinuity}
Audio Directives: ${MASTER_VIDEO_PROMPT_DOC.audioDirectives}
`;

    const blob = new Blob([fullTranscript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mayday_KM_Pariaman_Indah_Protocol_Package.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar Contract: 3 Zones (Wordmark - Navigation - Primary CTA) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-[#090e1a]/95 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
            <Radio className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            MAYDAY · KM PARIAMAN INDAH
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'simulator' ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-2' : 'hover:text-slate-200'
            }`}
          >
            VHF Radio Simulator
          </button>
          <button
            onClick={() => setActiveTab('prompt-studio')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'prompt-studio' ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-2' : 'hover:text-slate-200'
            }`}
          >
            Google Flow Prompt Studio
          </button>
          <button
            onClick={() => setIsProtocolModalOpen(true)}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            IMO SMCP Protocol Guide
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleToggleSeaAmbience}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              isAmbientSeaOn
                ? 'bg-sky-950 text-sky-300 border-sky-800'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle sea and wind background ambience"
          >
            <Waves className="w-3.5 h-3.5" />
            <span>{isAmbientSeaOn ? 'Ambience: ON' : 'Sea Sound'}</span>
          </button>

          <button
            onClick={handleExportPackage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Package</span>
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto flex flex-col gap-5">
        {/* Mobile Navigation Tab Bar */}
        <div className="flex md:hidden items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'simulator' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
            }`}
          >
            VHF Simulator
          </button>
          <button
            onClick={() => setActiveTab('prompt-studio')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'prompt-studio' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'
            }`}
          >
            Prompt Studio
          </button>
          <button
            onClick={() => setIsProtocolModalOpen(true)}
            className="flex-1 py-1.5 text-xs font-semibold rounded-md text-slate-400"
          >
            Protocol
          </button>
        </div>

        {/* Global Situation Metadata Bar (Zero-Pill Typography) */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <span className="text-red-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              DISTRESS
            </span>
            <span className="text-slate-600">·</span>
            <span>KM PARIAMAN INDAH</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-semibold">{VESSEL_DATA.callSign} (UDP3)</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{VESSEL_DATA.latitude} {VESSEL_DATA.longitude}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>12 NM W Pariaman</span>
            <span className="text-slate-600">·</span>
            <span>Wind: {VESSEL_DATA.windSpeedKnots} kts</span>
            <span className="text-slate-600">·</span>
            <span className="text-red-400 font-semibold">Engine Room Fire</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-semibold">POB: {VESSEL_DATA.personsOnBoard}</span>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'simulator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Situational Radar Deck (5 columns) */}
            <div className="lg:col-span-5 h-[580px] flex flex-col">
              <TacticalRadar
                activeStage={activeStage.stageNumber}
                isTransmitting={isPttActive || isAudioPlaying}
              />
            </div>

            {/* Right Column: VHF Transceiver & 4-Stage Dialogue Prompter (7 columns) */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Marine VHF Hardware Transceiver Unit */}
              <VhfRadioUnit
                isPttActive={isPttActive}
                onPttDown={handlePttDown}
                onPttUp={handlePttUp}
                isReceiving={isAudioPlaying}
                activeSpeakerName={activeLine.speakerName}
              />

              {/* 4-Stage Dialogue Prompter */}
              <DialoguePrompter
                currentStage={activeStage}
                activeLineIndex={activeLineIndex}
                onSelectLine={(idx) => {
                  handleStopAudio();
                  setActiveLineIndex(idx);
                }}
                onPlayCurrentLine={handlePlayCurrentLine}
                isAudioPlaying={isAudioPlaying}
                onStopAudio={handleStopAudio}
                isAutoPlaying={isAutoPlaying}
                onToggleAutoPlay={() => {
                  if (isAutoPlaying) {
                    setIsAutoPlaying(false);
                    handleStopAudio();
                  } else {
                    setIsAutoPlaying(true);
                  }
                }}
                onNextStage={handleNextStage}
                onPrevStage={handlePrevStage}
                userRole={userRole}
                onRoleChange={(role) => setUserRole(role)}
              />
            </div>
          </div>
        ) : (
          /* Tab 2: Cinematic Video Generation Prompt Studio */
          <PromptStudio />
        )}
      </main>

      {/* IMO Maritime Protocol Quick Reference Modal */}
      <ProtocolReferenceModal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
      />

      {/* Subdued Footer */}
      <footer className="mt-auto border-t border-slate-800/80 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#080d19]">
        <div className="flex items-center gap-2">
          <span>IMO SMCP Distress Communication Simulator</span>
          <span>·</span>
          <span>KM Pariaman Indah Emergency Training Scenario</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          VHF Ch 16 (156.800 MHz) · Padang SAR Region, West Sumatra
        </div>
      </footer>
    </div>
  );
}
