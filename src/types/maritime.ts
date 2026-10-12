export type SpeakerRole = 'captain' | 'mrcc';

export interface DialogueLine {
  id: string;
  speaker: SpeakerRole;
  speakerName: string;
  speakerRoleLabel: string;
  verbatimText: string;
  phoneticPronunciationGuide: string[];
  audioTimingSeconds: number;
  criticalPoints: string[];
}

export interface ScenarioStage {
  stageNumber: number;
  stageName: string;
  phaseCode: string;
  title: string;
  objective: string;
  captainLocation: string;
  dialogue: DialogueLine[];
  scenePrompt: {
    title: string;
    cameraShot: string;
    lighting: string;
    action: string;
    audioAmbience: string;
    googleFlowPrompt: string;
  };
}

export interface VesselData {
  name: string;
  callSign: string;
  phoneticCallSign: string;
  personsOnBoard: number;
  latitude: string;
  longitude: string;
  spokenLatitude: string;
  spokenLongitude: string;
  reportedLocation: string;
  bearingFromPort: string;
  distanceNm: number;
  weather: string;
  windSpeedKnots: number;
  windDirection: string;
  seaState: string;
  emergencyType: string;
  hullDescription: string;
  propulsionStatus: string;
}

export interface RadioState {
  channel: number;
  frequencyMhz: number;
  powerWatt: number;
  squelchLevel: number; // 0 to 10
  volumeLevel: number; // 0 to 100
  rfGain: number; // 0 to 100
  isPttActive: boolean;
  isReceiving: boolean;
  staticHumActive: boolean;
}
