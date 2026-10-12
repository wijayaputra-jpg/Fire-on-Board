/**
 * High-fidelity Marine VHF Radio Web Audio DSP Engine with Neural Voice Provider
 * Features:
 * - 24kHz Studio Neural Audio Master Clips for all scenario dialogue lines
 * - Wavenet and Neural2 Voice Provider selection for distinct, non-mechanical speech
 * - Separate acoustic profiling for Captain (Bridge handheld mic) and SAR Operator (MRCC headset)
 * - Analog warmth saturation (hyperbolic tangent curve) preventing harsh digital clipping
 * - Authentic maritime VHF telephony bandpass filtering (300Hz - 3400Hz)
 * - Procedural RF Squelch Bursts, PTT mic clicks, and Roger Beeps
 */

class RadioAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private radioFilter: BiquadFilterNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private presenceFilter: BiquadFilterNode | null = null;
  private saturationNode: WaveShaperNode | null = null;
  private seaNoiseNode: AudioNode | null = null;
  private seaGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.85;
  private isSeaAmbienceRunning: boolean = false;

  // Active audio source node
  private currentSourceNode: AudioBufferSourceNode | null = null;

  // Decoded AudioBuffer cache
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private pendingFetches: Map<string, Promise<AudioBuffer | null>> = new Map();

  // OS Speech synthesis voices cache
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        this.availableVoices = window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Generates a soft-saturation hyperbolic tangent curve for warm analog radio presence
   */
  private makeDistortionCurve(amount: number = 8): Float32Array {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      // Analyser for real-time waveform visualization
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;

      // Maritime VHF Telephony Bandpass filter (ITU-R standard 300 Hz to 3400 Hz)
      this.highpassFilter = this.ctx.createBiquadFilter();
      this.highpassFilter.type = 'highpass';
      this.highpassFilter.frequency.setValueAtTime(300, this.ctx.currentTime);
      this.highpassFilter.Q.setValueAtTime(0.85, this.ctx.currentTime);

      this.radioFilter = this.ctx.createBiquadFilter();
      this.radioFilter.type = 'lowpass';
      this.radioFilter.frequency.setValueAtTime(3400, this.ctx.currentTime);
      this.radioFilter.Q.setValueAtTime(1.1, this.ctx.currentTime);

      // Presence filter for vocal intelligibility
      this.presenceFilter = this.ctx.createBiquadFilter();
      this.presenceFilter.type = 'peaking';
      this.presenceFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
      this.presenceFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);
      this.presenceFilter.gain.setValueAtTime(2.0, this.ctx.currentTime);

      // Soft analog saturation node
      this.saturationNode = this.ctx.createWaveShaper();
      this.saturationNode.curve = this.makeDistortionCurve(4) as unknown as Float32Array<ArrayBuffer>;
      this.saturationNode.oversample = '2x';

      // DSP Chain: Highpass -> Lowpass -> Presence -> Saturation -> MasterGain -> Analyser -> Destination
      this.highpassFilter.connect(this.radioFilter);
      this.radioFilter.connect(this.presenceFilter);
      this.presenceFilter.connect(this.saturationNode);
      this.saturationNode.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    if (!this.ctx) this.initContext();
    return this.analyser;
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  private createNoiseBuffer(durationSeconds: number): AudioBuffer {
    const ctx = this.initContext();
    const bufferSize = ctx.sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Procedural Squelch Burst & Mic Click on PTT Key Press
   */
  public playPttPress(): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain!);
    osc.start(now);
    osc.stop(now + 0.05);

    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.07);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(3.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain!);

    noise.start(now);
    noise.stop(now + 0.07);
  }

  /**
   * Squelch Trail & Roger Beep on PTT Release
   */
  public playPttRelease(withRogerBeep = true): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.1);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.24, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain!);

    noise.start(now);
    noise.stop(now + 0.1);

    if (withRogerBeep) {
      const beep = ctx.createOscillator();
      const beepGain = ctx.createGain();
      beep.type = 'sine';
      beep.frequency.setValueAtTime(1450, now + 0.08);

      beepGain.gain.setValueAtTime(0.0001, now);
      beepGain.gain.setValueAtTime(0.14, now + 0.08);
      beepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      beep.connect(beepGain);
      beepGain.connect(this.masterGain!);

      beep.start(now + 0.08);
      beep.stop(now + 0.19);
    }
  }

  /**
   * Continuous procedural sea wind and hull swell ambience
   */
  public startSeaAmbience(): void {
    if (this.isSeaAmbienceRunning) return;
    const ctx = this.initContext();

    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, ctx.currentTime);

    this.seaGain = ctx.createGain();
    this.seaGain.gain.setValueAtTime(0.1, ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.seaGain);
    this.seaGain.connect(this.masterGain!);

    noise.start();
    this.seaNoiseNode = noise;
    this.isSeaAmbienceRunning = true;
  }

  public stopSeaAmbience(): void {
    if (!this.isSeaAmbienceRunning || !this.seaNoiseNode) return;
    try {
      (this.seaNoiseNode as AudioBufferSourceNode).stop();
      this.seaNoiseNode.disconnect();
    } catch {
      // Ignored
    }
    this.seaNoiseNode = null;
    this.isSeaAmbienceRunning = false;
  }

  /**
   * Loads high-fidelity neural audio for a given line from static storage or server
   */
  public async preloadAudio(
    text: string,
    role: 'captain' | 'mrcc',
    lineId?: string
  ): Promise<AudioBuffer | null> {
    const cacheKey = lineId ? `id:${lineId}` : `${role}:${text}`;
    if (this.bufferCache.has(cacheKey)) {
      return this.bufferCache.get(cacheKey)!;
    }

    if (this.pendingFetches.has(cacheKey)) {
      return this.pendingFetches.get(cacheKey)!;
    }

    const fetchPromise = (async () => {
      const ctx = this.initContext();

      // 1. First priority: Check pre-rendered 24kHz master WAV if lineId is given
      if (lineId) {
        try {
          const staticRes = await fetch(`/audio/${lineId}.wav`);
          if (staticRes.ok) {
            const arrayBuf = await staticRes.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuf);
            this.bufferCache.set(cacheKey, audioBuffer);
            return audioBuffer;
          }
        } catch {
          // Fall through to live endpoint
        }
      }

      // 2. Second priority: Query server-side Gemini Neural TTS endpoint
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, role }),
        });

        if (res.ok) {
          const data = await res.json();
          if (!data.fallback && data.audioBase64) {
            const binaryString = atob(data.audioBase64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
            this.bufferCache.set(cacheKey, audioBuffer);
            return audioBuffer;
          }
        }
      } catch {
        // Fall through
      }

      return null;
    })();

    this.pendingFetches.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  /**
   * Speaks the radio message with Neural Audio Provider and distinct acoustic profiling
   */
  public speakRadioMessage(
    text: string,
    role: 'captain' | 'mrcc',
    onStart?: () => void,
    onEnd?: () => void,
    lineId?: string
  ): { cancel: () => void } {
    const ctx = this.initContext();
    this.playPttPress();

    // Adjust acoustic EQ based on character role
    if (this.presenceFilter) {
      if (role === 'captain') {
        // Captain: Wheelhouse bridge acoustic profile (warmth, proximity, 1200Hz focus)
        this.presenceFilter.frequency.setValueAtTime(1200, ctx.currentTime);
        this.presenceFilter.gain.setValueAtTime(2.5, ctx.currentTime);
      } else {
        // SAR Operator: Operations room headset profile (crisp 2400Hz clarity)
        this.presenceFilter.frequency.setValueAtTime(2400, ctx.currentTime);
        this.presenceFilter.gain.setValueAtTime(3.0, ctx.currentTime);
      }
    }

    let isCancelled = false;

    // Stop any existing playing source
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch {
        // Ignored
      }
      this.currentSourceNode = null;
    }

    const cancel = () => {
      isCancelled = true;
      if (this.currentSourceNode) {
        try {
          this.currentSourceNode.stop();
          this.currentSourceNode.disconnect();
        } catch {
          // Ignored
        }
        this.currentSourceNode = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.playPttRelease(false);
      onEnd?.();
    };

    // Load Neural audio or fallback to Wavenet-prioritized browser synthesis
    this.preloadAudio(text, role, lineId).then((audioBuffer) => {
      if (isCancelled) return;

      if (audioBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.highpassFilter!);

        source.onended = () => {
          if (!isCancelled) {
            this.playPttRelease(true);
            this.currentSourceNode = null;
            onEnd?.();
          }
        };

        this.currentSourceNode = source;
        onStart?.();
        source.start(ctx.currentTime + 0.05);
      } else {
        // High-Fidelity WaveNet/Neural Voice Fallback
        this.playHighFidelityWavenetVoice(text, role, onStart, onEnd);
      }
    });

    return { cancel };
  }

  /**
   * Selects highest-fidelity WaveNet, Neural2, or Natural voice provider
   * with customized prosody and natural pauses to prevent mechanical artifacts.
   */
  private playHighFidelityWavenetVoice(
    text: string,
    role: 'captain' | 'mrcc',
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!('speechSynthesis' in window)) {
      onStart?.();
      setTimeout(() => {
        this.playPttRelease(true);
        onEnd?.();
      }, 4000);
      return;
    }

    window.speechSynthesis.cancel();

    // Natural prosody insertion: Comma separators enforce deliberate cadence
    const formatted = text
      .replace(/MAYDAY,\s*MAYDAY,\s*MAYDAY/gi, 'Mayday... Mayday... Mayday.')
      .replace(/KM PARIAMAN INDAH/gi, 'K M, Pariaman Indah')
      .replace(/UNIFORM DELTA PAPA THREE/gi, 'Uniform, Delta, Papa, Three')
      .replace(/UDP3/gi, 'Uniform, Delta, Papa, Three')
      .replace(/ZERO ZERO DEGREES/gi, 'Zero, zero degrees')
      .replace(/THREE FIVE MINUTES SOUTH/gi, 'three, five minutes south')
      .replace(/ONE ZERO ZERO DEGREES/gi, 'One, zero, zero degrees')
      .replace(/ZERO FIVE MINUTES EAST/gi, 'zero, five minutes east')
      .replace(/ONE TWO NAUTICAL MILES/gi, 'one, two nautical miles')
      .replace(/TWO ZERO KNOTS/gi, 'two, zero knots')
      .replace(/FOUR FIVE MINUTES/gi, 'four, five minutes')
      .replace(/CO2/gi, 'C O 2')
      .replace(/EPIRB/gi, 'E P I R B')
      .replace(/OVER\./gi, '... Over.');

    const utterance = new SpeechSynthesisUtterance(formatted);
    utterance.lang = 'en-US';

    if (this.availableVoices.length === 0) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }

    const voices = this.availableVoices;

    if (role === 'captain') {
      // Captain Voice: Prioritize Wavenet, Neural2, or Natural deep male voices
      const wavenetCaptain =
        voices.find(v => v.name.includes('Wavenet') && (v.name.includes('-D') || v.name.includes('-B') || v.name.includes('Male'))) ||
        voices.find(v => v.name.includes('Neural2') && (v.name.includes('-D') || v.name.includes('-B'))) ||
        voices.find(v => v.name.includes('Google US English')) ||
        voices.find(v => v.name.includes('Guy') && v.name.includes('Natural')) ||
        voices.find(v => v.name.includes('Christopher') && v.name.includes('Natural')) ||
        voices.find(v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('Male'))) ||
        voices.find(v => v.lang.startsWith('en'));

      if (wavenetCaptain) utterance.voice = wavenetCaptain;
      utterance.pitch = 0.94; // Deep, steady vessel master
      utterance.rate = 0.92; // Deliberate emergency transmission pace
    } else {
      // SAR Operator Voice: Prioritize Wavenet, Neural2, or Natural clear female voices
      const wavenetSar =
        voices.find(v => v.name.includes('Wavenet') && (v.name.includes('-F') || v.name.includes('-C') || v.name.includes('Female'))) ||
        voices.find(v => v.name.includes('Neural2') && (v.name.includes('-F') || v.name.includes('-C'))) ||
        voices.find(v => v.name.includes('Jenny') && v.name.includes('Natural')) ||
        voices.find(v => v.name.includes('Aria') && v.name.includes('Natural')) ||
        voices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria')) ||
        voices.find(v => v.lang.startsWith('en') && (v.name.includes('Zira') || v.name.includes('Google US English') || v.name.includes('Female'))) ||
        voices.find(v => v.lang.startsWith('en'));

      if (wavenetSar) utterance.voice = wavenetSar;
      utterance.pitch = 1.05; // Crisp, calm, authoritative rescue officer
      utterance.rate = 0.96; // Professional dispatch pace
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => {
      this.playPttRelease(true);
      onEnd?.();
    };
    utterance.onerror = () => {
      this.playPttRelease(false);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const radioAudio = new RadioAudioEngine();
