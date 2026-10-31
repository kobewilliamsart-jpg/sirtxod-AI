export type VoiceGender = 'Female' | 'Male' | 'Neutral';

export interface VoiceModel {
  id: string;
  name: string;
  gender: VoiceGender;
  age: 'Young' | 'Adult' | 'Mature';
  language: string;
  accent: string;
  description: string;
  sampleText: string;
  baseVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  isCustomClone?: boolean;
  avatarColor?: string;
  avatarInitials?: string;
  tags: string[];
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  defaultVoiceId: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  category: 'Podcast' | 'Audiobook' | 'Voiceover' | 'Marketing' | 'Personal' | 'Other';
  lastModified: number;
  text: string;
  targetVoiceId: string;
  targetLanguage: string;
  readingSpeed: number;
  pitch: number;
  audioCount: number;
  tags?: string[];
}

export interface AudioRecord {
  id: string;
  projectId?: string;
  projectTitle?: string;
  title: string;
  text: string;
  durationSeconds: number;
  mimeType: string;
  format: 'wav' | 'mp3' | 'ogg' | 'aac';
  voiceId: string;
  voiceName: string;
  language: string;
  createdAt: number;
  fileSizeBytes: number;
  audioData: ArrayBuffer; // Binary audio bytes stored directly in IndexedDB
  waveformData?: number[];
}

export interface VoiceCloneProfile {
  id: string;
  speakerName: string;
  pitchHz: number;
  pitchCategory: string;
  timbre: string;
  cadence: string;
  breathiness: string;
  recommendedBaseVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  personaPrompt: string;
  audioSampleData?: ArrayBuffer;
  createdAt: number;
  accent: string;
  language: string;
}

export type BrandTheme = 'teal' | 'cyan' | 'emerald' | 'slate' | 'violet';
