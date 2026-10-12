import React, { useState } from 'react';
import { Copy, Check, Film, Sliders, ShieldCheck, Sparkles, ExternalLink, Video } from 'lucide-react';
import { SCENARIO_STAGES, MASTER_VIDEO_PROMPT_DOC, IMAGE_ASSETS, VESSEL_DATA } from '../data/scenarioData';

export const PromptStudio: React.FC = () => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [copiedSceneId, setCopiedSceneId] = useState<string | null>(null);
  const [copiedMaster, setCopiedMaster] = useState<boolean>(false);
  const [cameraRig, setCameraRig] = useState<'documentary' | 'steadicam' | 'drone'>('documentary');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '2.39:1'>('16:9');

  const activeStage = SCENARIO_STAGES[selectedSceneIndex];

  const handleCopyScene = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedSceneId(id);
    setTimeout(() => setCopiedSceneId(null), 2500);
  };

  const handleCopyMasterBundle = () => {
    const fullText = `GOOGLE FLOW — MASTER VIDEO GENERATION PROMPT

PROJECT TITLE:
${MASTER_VIDEO_PROMPT_DOC.projectTitle}

SCENARIO:
${MASTER_VIDEO_PROMPT_DOC.scenarioSummary}

VISUAL STYLE:
${MASTER_VIDEO_PROMPT_DOC.visualStyle}

VESSEL IDENTITY:
Fishing vessel name: ${VESSEL_DATA.name}
Call sign: ${VESSEL_DATA.phoneticCallSign}
Persons on board: ${VESSEL_DATA.personsOnBoard}
Position: ${VESSEL_DATA.latitude}, ${VESSEL_DATA.longitude} (${VESSEL_DATA.spokenLatitude}, ${VESSEL_DATA.spokenLongitude})
Reported position: ${VESSEL_DATA.reportedLocation}
Weather: ${VESSEL_DATA.weather}
Wind: ${VESSEL_DATA.windSpeedKnots} knots (${VESSEL_DATA.windDirection})
Emergency: ${VESSEL_DATA.emergencyType}

VESSEL CONTINUITY:
${MASTER_VIDEO_PROMPT_DOC.vesselContinuity}

CHARACTER CONTINUITY:
${MASTER_VIDEO_PROMPT_DOC.characterContinuity}

AUDIO DIRECTIVES:
${MASTER_VIDEO_PROMPT_DOC.audioDirectives}

SAFETY AND AUTHENTICITY:
${MASTER_VIDEO_PROMPT_DOC.safetyGuidelines}

==================================================
SCENE PROMPTS (4-STAGE CINEMATIC DISTRESS SEQUENCE)
==================================================

${SCENARIO_STAGES.map(
  (stage) => `--- SCENE ${stage.stageNumber}: ${stage.scenePrompt.title.toUpperCase()} ---
Aspect Ratio: ${aspectRatio}
Camera: ${stage.scenePrompt.cameraShot}
Lighting: ${stage.scenePrompt.lighting}
Action: ${stage.scenePrompt.action}
Sound Ambience: ${stage.scenePrompt.audioAmbience}

PROMPT:
${stage.scenePrompt.googleFlowPrompt}
`
).join('\n\n')}
`;

    navigator.clipboard.writeText(fullText);
    setCopiedMaster(true);
    setTimeout(() => setCopiedMaster(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Studio Banner & Master Export Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-amber-400 font-bold">GOOGLE FLOW READY</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Cinematic 16:9 Maritime Training Video Director</span>
          </div>
          <h1 className="text-xl font-black text-slate-100 tracking-tight mt-1">
            Prompt Studio: Mayday — Fire on Board
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Fully synthesized, photorealistic multi-clip prompts designed for video generation with strict vessel continuity, character consistency, and IMO standard SMCP phonetics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyMasterBundle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md whitespace-nowrap shrink-0 ${
              copiedMaster
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500'
            }`}
          >
            {copiedMaster ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedMaster ? 'Master Bundle Copied!' : 'Copy Full 4-Scene Master Prompt'}</span>
          </button>
        </div>
      </div>

      {/* Continuity Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vessel Continuity */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="relative aspect-video w-full bg-slate-950">
            <img
              src={IMAGE_ASSETS.vessel}
              alt="KM Pariaman Indah Vessel Continuity"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-3">
              <span className="text-[10px] font-mono font-bold text-amber-400">VESSEL CONTINUITY</span>
              <h3 className="text-sm font-bold text-white">{VESSEL_DATA.name}</h3>
            </div>
          </div>
          <div className="p-3 text-xs text-slate-400 space-y-1 bg-slate-950/40 flex-1">
            <p className="text-[11px] leading-relaxed">
              <strong className="text-slate-200">Preserve:</strong> Weathered navy-blue/white wooden hull, high bow, Padang registry markings, wheelhouse radar mast, dense dark smoke plume from engine stack.
            </p>
            <div className="font-mono text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
              Call Sign: {VESSEL_DATA.callSign} · POB: {VESSEL_DATA.personsOnBoard} · 12 NM W Pariaman
            </div>
          </div>
        </div>

        {/* Captain Continuity */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="relative aspect-video w-full bg-slate-950">
            <img
              src={IMAGE_ASSETS.captain}
              alt="Captain Character Continuity"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-3">
              <span className="text-[10px] font-mono font-bold text-sky-400">CHARACTER CONTINUITY #1</span>
              <h3 className="text-sm font-bold text-white">Vessel Captain (Master)</h3>
            </div>
          </div>
          <div className="p-3 text-xs text-slate-400 space-y-1 bg-slate-950/40 flex-1">
            <p className="text-[11px] leading-relaxed">
              <strong className="text-slate-200">Preserve:</strong> Indonesian male, 40–50 years old, dark navy uniform with gold shoulder rank stripes, handheld marine VHF mic, alert concerned demeanor, wheelhouse console lighting.
            </p>
            <div className="font-mono text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
              VHF Ch 16 Transmit · Handheld Mic · Wheelhouse
            </div>
          </div>
        </div>

        {/* MRCC Officer Continuity */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="relative aspect-video w-full bg-slate-950">
            <img
              src={IMAGE_ASSETS.mrcc}
              alt="MRCC Radio Officer Continuity"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-3">
              <span className="text-[10px] font-mono font-bold text-emerald-400">CHARACTER CONTINUITY #2</span>
              <h3 className="text-sm font-bold text-white">SAR / MRCC Radio Operator</h3>
            </div>
          </div>
          <div className="p-3 text-xs text-slate-400 space-y-1 bg-slate-950/40 flex-1">
            <p className="text-[11px] leading-relaxed">
              <strong className="text-slate-200">Preserve:</strong> Indonesian female, 30–40 years old, professional navy-blue uniform with insignia, communications headset with boom mic, calm authoritative expression.
            </p>
            <div className="font-mono text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
              MRCC Operations Room · Radar Displays · Headset
            </div>
          </div>
        </div>
      </div>

      {/* Scene Navigation Tabs & Director Parameters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          {/* Scene Selectors */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {SCENARIO_STAGES.map((stage, idx) => (
              <button
                key={stage.stageNumber}
                onClick={() => setSelectedSceneIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  selectedSceneIndex === idx
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Scene {stage.stageNumber}: {stage.stageName}
              </button>
            ))}
          </div>

          {/* Prompt Modifiers */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Ratio:</span>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as '16:9' | '2.39:1')}
                className="bg-slate-800 text-slate-200 rounded px-2 py-1 text-xs border border-slate-700 font-mono"
              >
                <option value="16:9">16:9 (Standard Video)</option>
                <option value="2.39:1">2.39:1 (Cinemascope)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Selected Scene Prompt Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Prompt Code Box */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  SCENE {activeStage.stageNumber} OF 4
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{activeStage.scenePrompt.title}</h3>
              </div>

              <button
                onClick={() => handleCopyScene(activeStage.scenePrompt.googleFlowPrompt, `scene_${activeStage.stageNumber}`)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                  copiedSceneId === `scene_${activeStage.stageNumber}`
                    ? 'bg-emerald-600 text-white'
                    : 'bg-sky-600 text-white hover:bg-sky-500'
                }`}
              >
                {copiedSceneId === `scene_${activeStage.stageNumber}` ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedSceneId === `scene_${activeStage.stageNumber}` ? 'Copied!' : 'Copy Scene Prompt'}</span>
              </button>
            </div>

            {/* Prompt Text Container */}
            <div className="bg-black/60 border border-slate-800 rounded-lg p-4 font-mono text-xs leading-relaxed text-slate-200 select-all whitespace-pre-wrap">
              {activeStage.scenePrompt.googleFlowPrompt}
            </div>

            {/* Scene Cinematic Directives */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" />
                  CAMERA & LENS DIRECTION
                </div>
                <div className="text-slate-300 text-xs mt-1 leading-normal">
                  {activeStage.scenePrompt.cameraShot}
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  LIGHTING & ATMOSPHERE
                </div>
                <div className="text-slate-300 text-xs mt-1 leading-normal">
                  {activeStage.scenePrompt.lighting}
                </div>
              </div>
            </div>
          </div>

          {/* Audio Directives & Safety Specifications */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                AUDIO & DIALOGUE REQUIREMENTS
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                {activeStage.scenePrompt.audioAmbience}
              </p>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-amber-300/90 leading-normal">
                "Speak every English line exactly as written. Read coordinates digit by digit (e.g., 'one zero zero degrees')."
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                SAFETY & AUTHENTICITY GUARD
              </h4>
              <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Educational maritime simulation only</li>
                <li>No graphic injuries, burns, or jumping overboard</li>
                <li>No fabricated official agency logos</li>
                <li>Physically plausible vessel heave and ocean swell</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
