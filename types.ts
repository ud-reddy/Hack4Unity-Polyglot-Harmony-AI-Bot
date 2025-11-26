export enum AppMode {
  Standard = 'Standard',
  Cultural = 'Cultural Context',
  Harmony = 'Harmony Mediation'
}

export enum Speaker {
  User = 'user',     // User A
  Bot = 'bot',
  Partner = 'partner' // User B
}

export interface ChatMessage {
  id: string;
  sender: Speaker;
  text: string;
  timestamp: number;
  emotion?: string;
  culturalInsight?: string;
  originalLanguage?: string;
  isAudio?: boolean;
  transliteration?: string; // English/Romanized spelling
}

export interface HarmonySettings {
  userALang: string;
  userBLang: string;
}

// Structure expected from Gemini JSON response
export interface GeminiResponseSchema {
  reply: string;
  detected_emotion: string;
  cultural_insight: string | null;
  detected_language: string;
  harmony_translation?: string; // If in harmony mode
  transliteration?: string; // Phonetic pronunciation
}