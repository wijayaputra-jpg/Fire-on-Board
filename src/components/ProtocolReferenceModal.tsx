import React, { useState } from 'react';
import { X, BookOpen, Volume2, ShieldCheck, HelpCircle } from 'lucide-react';
import { IMO_PHONETIC_ALPHABET, VESSEL_DATA } from '../data/scenarioData';
import { radioAudio } from '../utils/radioAudioEngine';

interface ProtocolReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProtocolReferenceModal: React.FC<ProtocolReferenceModalProps> = ({ isOpen, onClose }) => {
  const [testWord, setTestWord] = useState<string>('UDP3');

  if (!isOpen) return null;

  const handleTestPhonetic = (word: string) => {
    radioAudio.playPttPress();
    setTimeout(() => {
      const phoneticSpoken = word
        .split('')
        .map((char) => IMO_PHONETIC_ALPHABET[char.toUpperCase()] || char)
        .join(' ');
      radioAudio.speakRadioMessage(phoneticSpoken, 'mrcc');
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">IMO SMCP & VHF Maritime Distress Protocol</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-6 text-sm">
          {/* Section 1: Digit-by-Digit Number Pronunciation Rules */}
          <div className="bg-slate-950/70 border border-amber-900/40 rounded-xl p-4">
            <h3 className="font-bold text-amber-400 text-xs tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              MANDATORY NUMBER PRONUNCIATION PROTOCOL
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Under IMO SMCP regulations and the project dialogue rules, all coordinates, distances, bearings, and call signs must be read strictly digit-by-digit:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">CORRECT PRONUNCIATION:</div>
                <div className="text-emerald-400 font-bold">100° → "one zero zero degrees"</div>
                <div className="text-red-400/80 text-[11px] line-through">Never "one hundred degrees"</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">CORRECT PRONUNCIATION:</div>
                <div className="text-emerald-400 font-bold">05′ → "zero five minutes"</div>
                <div className="text-red-400/80 text-[11px] line-through">Never "five minutes"</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">CORRECT PRONUNCIATION:</div>
                <div className="text-emerald-400 font-bold">00°35′ S → "zero zero degrees three five minutes south"</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">CALL SIGN PHONETICS:</div>
                <div className="text-emerald-400 font-bold">UDP3 → "Uniform Delta Papa Three"</div>
              </div>
            </div>
          </div>

          {/* Section 2: NATO / IMO Phonetic Alphabet Quick Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-200 text-xs tracking-wider uppercase">
                IMO PHONETIC ALPHABET TABLE
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={testWord}
                  onChange={(e) => setTestWord(e.target.value.toUpperCase())}
                  placeholder="Test word"
                  className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-xs border border-slate-700 font-mono w-24 uppercase"
                />
                <button
                  onClick={() => handleTestPhonetic(testWord)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Pronounce</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs font-mono">
              {Object.entries(IMO_PHONETIC_ALPHABET).map(([char, word]) => (
                <div
                  key={char}
                  onClick={() => handleTestPhonetic(char)}
                  className="bg-slate-950 hover:bg-slate-800 p-1.5 rounded border border-slate-800/80 cursor-pointer transition-colors flex items-center justify-between"
                  title={`Click to hear ${word}`}
                >
                  <span className="font-bold text-amber-400">{char}</span>
                  <span className="text-slate-300 text-[11px]">{word}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Distress Priority & Procedure Words */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <h4 className="font-bold text-sky-400 uppercase text-[11px] mb-2">Distress Signal Priorities</h4>
              <ul className="space-y-1.5 text-slate-300">
                <li><strong className="text-red-400">MAYDAY</strong> — Grave & imminent danger threatening life or vessel. Requires immediate assistance.</li>
                <li><strong className="text-amber-400">PAN-PAN</strong> — Urgency signal concerning safety of vessel or person (no immediate danger to life).</li>
                <li><strong className="text-sky-400">SECURITE</strong> — Navigational or meteorological safety warning.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <h4 className="font-bold text-emerald-400 uppercase text-[11px] mb-2">VHF Radio Procedure Words</h4>
              <ul className="space-y-1.5 text-slate-300">
                <li><strong className="text-white">OVER</strong> — My transmission has ended, I expect a response.</li>
                <li><strong className="text-white">OUT</strong> — Transmission completed, no response expected. (Never say "Over and Out").</li>
                <li><strong className="text-white">STAND BY</strong> — Hold on, station busy or compiling information.</li>
                <li><strong className="text-white">ROGER</strong> — Message received and understood.</li>
              </ul>
            </div>
          </div>

          {/* Section 4: KM Pariaman Indah Scenario Geography */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Incident Context:</strong> KM Pariaman Indah is positioned 12 NM due west of Pariaman port (West Sumatra, coordinates 00°35′S, 100°05′E). Emergency response falls within the Padang Search and Rescue region. Rough seas with 20-knot winds create critical drift risk toward open ocean swells.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
