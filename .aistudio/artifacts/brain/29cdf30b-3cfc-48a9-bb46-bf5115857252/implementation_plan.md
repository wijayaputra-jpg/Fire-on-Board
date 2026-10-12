# Mayday: Fire on Board — Maritime VHF Radio Simulator & Prompt Studio

An educational maritime emergency training application and cinematic prompt director based on the distress incident of Indonesian fishing vessel *KM Pariaman Indah* (Call Sign: Uniform Delta Papa Three) with an engine-room fire off Pariaman, West Sumatra.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed during initial clarification and guide this implementation:

- **Confirmed Application Scope**: Dual-mode platform featuring an **Interactive VHF Radio Simulator** (with role-switchable tactical wheelhouse / MRCC operator views) and a **Cinematic Video Generation Prompt Studio** (exporting camera directions, character continuity cards, and exact Google Flow scene prompts).
- **Confirmed Structure**: Standard 4-stage distress emergency sequence:
  1. *Stage 1 — The Distress Call (Mayday Broadcast)*: Captain transmits initial distress on Channel 16 with vessel identification, position coordinates, nature of distress, and POB.
  2. *Stage 2 — MRCC Acknowledgment & Relay*: Rescue Coordination Officer acknowledges Mayday, verifies coordinates digit-by-digit, and confirms vessel description.
  3. *Stage 3 — SITREP & Damage Assessment*: Captain reports fire suppression status, engine disability, heavy smoke containment, and crew readiness with lifejackets.
  4. *Stage 4 — SAR Tasking & Standby Directive*: MRCC announces BASARNAS SAR vessel dispatch, provides ETA, instructs EPIRB activation, and maintains radio watch on VHF Ch 16.
- **Confirmed Audio & Radio Simulation**: Realistic Web Audio API DSP pipeline simulating marine VHF radio characteristics (bandpass filter 300Hz–3.4kHz, noise burst squelch on PTT press/release, subtle background sea/engine drone, mic clicks, and natural text-to-speech radio voice with strict phonetic pronunciation).

---

## 1. Overview & Core Concept

- **What It Does**: Provides maritime students, instructors, and AI video creators with a high-fidelity simulator for IMO standard maritime distress communications (GMDSS / VHF Channel 16 protocol) alongside an production-grade prompt generator designed for cinematic AI video generation tools (Google Flow / Imagen / Veo).
- **Target Audience / Persona**: Maritime vocational trainees (SMK Pelayaran / nautical academy cadets), SAR communication instructors, and cinematic AI directors seeking physically plausible, authentic maritime emergency simulations.
- **Key Value**: Bridges strict maritime communication compliance (IMO SMCP — Standard Marine Communication Phrases, digit-by-digit coordinate recitation, phonetic call signs) with ready-to-run prompt engineering for photorealistic multi-clip video generation.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Interactive Comms Deck (Training Mode)**:
   - Trainee selects perspective: **Captain (KM Pariaman Indah)** or **MRCC Radio Operator**.
   - Trainee steps through the 4 emergency stages or hits "Auto-Play Scenario".
   - Holding or toggling Push-To-Talk (PTT) initiates realistic VHF transmission with mic static, squelch open/close audio, and teleprompter highlighting IMO-compliant phonetic lines.
   - Interactive tactical radar & situational nautical chart displays vessel position ($00^\circ 35' \text{ S}, 100^\circ 05' \text{ E}$, 12 NM off Pariaman), wind vectors ($20\text{ kts}$), drift, and SAR cutter ETA vector.
2. **Cinematic Prompt Studio (Director Mode)**:
   - Dedicated tab containing master visual continuity cards for **KM Pariaman Indah** (Indonesian wooden/steel fishing vessel, blue/white hull, wheelhouse radar mast, billowing smoke) and **Characters** (Captain in navy uniform, MRCC Officer with tactical headset).
   - Detailed shot-by-shot prompts formatted with camera movement (dolly, whip pan, over-the-shoulder, macro radio mic), lighting (amber wheelhouse glow vs fluorescent MRCC screens), and dialogue rules.
   - One-click "Copy Prompt for Google Flow", formatted with aspect ratio ($16:9$), style guidelines, and negative safety constraints.
3. **Phonetic & Protocol Reference Tray**:
   - Quick-reference drawer with IMO standard digit-by-digit pronunciation rules (`100°` $\to$ "One Zero Zero Degrees"), phonetic alphabet (`UDP3` $\to$ "Uniform Delta Papa Three"), and GMDSS distress checklist.

### Visual Identity & Theme
- **Aesthetic Direction**: Utilitarian maritime electronic console paired with documentary cinematic design. Dark naval cockpit atmosphere inspired by modern marine ECDIS (Electronic Chart Display) and bridge radio consoles.
- **Color Palette & Mood**:
  - Neutral Canvas: Deep marine slate (`#0B1120`, `#0F172A`).
  - Structural Panels: Subdued ECDIS console surfaces (`#1E293B`, `#162032`) with hairline border dividers (`#334155`).
  - Signal Accents: High-visibility maritime alert amber (`#F59E0B`), VHF signal emerald (`#10B981`), and Mayday distress crimson (`#EF4444`).
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` (bold, maritime command presence).
  - Body & Dialogue Prose: `DM Sans` (clean, high legibility for scripts).
  - Telemetry & Coordinates: `JetBrains Mono` with `tabular-nums` for latitude/longitude, wind speed, frequencies (156.800 MHz Ch 16), and call signs.
- **Component Styling & Layout**:
  - Strict Top Bar Contract: 3 clean zones (`Mayday Protocol Console` wordmark — navigation links `Simulator`, `Prompt Studio`, `Maritime Protocol` — `Export Package` primary CTA).
  - Split View: Left zone tactical radar chart & vessel telemetry ($45\%$), right zone VHF radio unit & dialogue prompter ($55\%$).
  - Zero-pill metadata: Coordinates and status indicators rendered with typographic separators (`00°35′ S · 100°05′ E · Ch 16 · 20 kts NW`).

---

## 3. Key Product Decisions & Trade-Offs

- **Audio Engine via Web Audio API**:
  - *Chosen Approach*: Pure in-browser Web Audio synthesis generating procedural radio white noise, 2nd-order Biquad bandpass filter ($300\text{Hz} - 3200\text{Hz}$ radio acoustic band), squelch clicks, and integration with the Web Speech API (with pitch/rate tuning to replicate VHF transceiver characteristics).
  - *Why*: Instant zero-latency interactive feedback with zero external dependencies or server roundtrips. Works seamlessly across desktop and mobile.
- **Standard 4-Stage Distress Architecture**:
  - *Chosen Approach*: Stage-based state machine enforcing the standard GMDSS distress workflow: (1) Distress Broadcast $\to$ (2) Acknowledgment $\to$ (3) Situation Report $\to$ (4) SAR Tasking.
  - *Why*: Matches international IMO SMCP curriculum and gives trainees clear pedagogical checkpoints while structuring AI video prompts into a coherent 4-scene narrative arc.
- **Dedicated Master Prompt Export Studio**:
  - *Chosen Approach*: Interactive cards for each scene prompt with syntax highlighting, individual parameter toggles (camera motion, lens type, lighting style), and full master prompt bundle export.
  - *Why*: Allows video creators to directly paste generation prompts into Google Flow or other text-to-video tools with continuity guaranteed across all scenes.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Bar                              │
│ [Brand: MAYDAY SIMULATOR]  ·  [VHF Comms | Prompt Studio | Protocol]  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────────────────┐       ┌──────────────────────────────────┐
│   Tactical Situational Deck     │       │     VHF Radio & Script Console   │
│ ┌─────────────────────────────┐ │       │ ┌──────────────────────────────┐ │
│ │ Interactive Radar & Map     │ │       │ │ Marine VHF Transceiver (Ch16)│ │
│ │ • KM Pariaman Indah (Pos)   │ │       │ │ • Squelch / Vol / RF Gain    │ │
│ │ • 12 NM Pariaman Coastline  │ │       │ │ • PTT (Push-To-Talk) Control │ │
│ │ • Wind Vector (20 kts)      │ │       │ └──────────────────────────────┘ │
│ └─────────────────────────────┘ │       │ ┌──────────────────────────────┐ │
│ ┌─────────────────────────────┐ │       │ │ 4-Stage Dialogue Prompter    │ │
│ │ Vessel Status Telemetry     │ │       │ │ • Active Speaker Indicator   │ │
│ │ • Call Sign: UDP3           │ │       │ │ • Phonetic Coordinate Guide  │ │
│ │ • POB: 8 · Engine Fire      │ │       │ │ • Audio Waveform & Playback  │ │
│ └─────────────────────────────┘ │       │ └──────────────────────────────┘ │
└─────────────────────────────────┘       └──────────────────────────────────┘
```

### Data Model & State
- **Scenario State**:
  - `activeStage`: 1 to 4 (Current step in the distress protocol).
  - `activeSpeaker`: `'captain' | 'mrcc' | null`.
  - `isPttPressed`: Boolean for active radio transmission.
  - `isAutoPlaying`: Boolean for automated scenario demonstration.
  - `audioEffectsEnabled`: Boolean (radio bandpass filter, squelch noise).
- **Scene Prompt Model**:
  - `sceneId`: Identifier (`scene_01` to `scene_04`).
  - `title`: e.g., "The Mayday Call — Wheelhouse Interior".
  - `character`: Captain or MRCC Operator specifications.
  - `visualPrompt`: Full photorealistic descriptive prompt for Google Flow.
  - `cameraDirection`: Angle, focal length, motion.
  - `spokenDialogue`: Verbatim English line with phonetic guide.
  - `soundDesign`: Specific ambient sound layers (wind, engine alarm, VHF static).

### Interactive Component Mapping
- **TacticalRadar.tsx**: Canvas-based maritime radar display with sweeping beam, Pariaman coastline reference, vessel marker, wind indicator, and distance scale rings (3 NM, 6 NM, 12 NM).
- **VhfRadioUnit.tsx**: Marine transceiver panel with frequency display (156.800 MHz / Channel 16), functional volume/squelch knobs, active signal meter, and interactive PTT button (supports mouse hold and spacebar).
- **DialoguePrompter.tsx**: Live script display highlighting the active dialogue line, speaker badge, phonetic pronunciation tips, and manual play/test speech synthesis buttons.
- **PromptStudio.tsx**: Director suite presenting the 4 master scene generation prompts with copy buttons, continuity tokens (vessel identity, character costumes), camera angles, and format selector.
- **ProtocolModal.tsx**: Quick-reference guide explaining IMO SMCP guidelines, digit-by-digit rules, and maritime radio safety standards.
