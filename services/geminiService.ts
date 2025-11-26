import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AppMode, GeminiResponseSchema, HarmonySettings, Speaker } from "../types";

const SYSTEM_INSTRUCTION_BASE = `
You are "PolyGlot", a world-class linguistic AI assistant.
Your capabilities:
1. Real-Time Code-Switching: Seamlessly understand and generate mixed-language text (e.g., Hindi+English+Tamil).
2. Dialect Detection: Identify regional variations (e.g., Indian English vs. British English).
3. Emotion Detection: Always analyze the emotional undertone.
`;

const CULTURAL_MODE_INSTRUCTION = `
MODE: CULTURAL CONTEXT ENGINE
- Tailor responses to cultural norms, customs, and politeness levels.
- Provide a "cultural_insight" explaining how the message might be interpreted or specific cultural references (festivals, idioms).
- If a user is being rude or culturally insensitive, politely educate them in the insight.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: "The main response text from the AI. In Harmony mode, this is the mediated message for the TARGET user."
    },
    detected_emotion: {
      type: Type.STRING,
      description: "One or two words describing the emotion (e.g., 'Joyful', 'Frustrated', 'Confused', 'Empathetic')."
    },
    cultural_insight: {
      type: Type.STRING,
      description: "In Cultural Mode: A brief explanation of cultural nuance. In Harmony Mode: A brief note on why you mediated it this way. Otherwise: null."
    },
    detected_language: {
      type: Type.STRING,
      description: "The language(s) detected in the input (e.g., 'Hinglish', 'Tamil')."
    },
    harmony_translation: {
      type: Type.STRING,
      description: "Optional: The raw literal translation if the mediated reply differs significantly."
    },
    transliteration: {
      type: Type.STRING,
      description: "Optional: The English/Romanized phonetic spelling of the 'reply' text. Required if the reply is in a non-Latin script (e.g., Hindi, Arabic, Japanese)."
    }
  },
  required: ["reply", "detected_emotion", "detected_language"]
};

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  currentMessage: string,
  mode: AppMode,
  audioBase64?: string,
  harmonySettings?: HarmonySettings,
  currentSpeaker?: Speaker
): Promise<GeminiResponseSchema> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });

  // Construct System Instruction based on Mode
  let systemInstruction = SYSTEM_INSTRUCTION_BASE;
  
  if (mode === AppMode.Cultural) {
    systemInstruction += `\n${CULTURAL_MODE_INSTRUCTION}`;
  }
  
  if (mode === AppMode.Harmony) {
    const userALang = harmonySettings?.userALang || "English";
    const userBLang = harmonySettings?.userBLang || "English";
    
    const speakerName = currentSpeaker === Speaker.User ? "User A" : "User B";
    const targetName = currentSpeaker === Speaker.User ? "User B" : "User A";
    const targetLang = currentSpeaker === Speaker.User ? userBLang : userALang;

    systemInstruction += `
MODE: HARMONY (CROSS-LANGUAGE MEDIATION)
CONTEXT: 
- User A speaks: ${userALang}
- User B speaks: ${userBLang}
- CURRENT INPUT IS FROM: ${speakerName}

TASK:
1. Analyze the input from ${speakerName}.
2. Mediate and Translate the message for ${targetName} into ${targetLang}.
3. The 'reply' field MUST be in ${targetLang} (using its native script).
4. Provide the 'transliteration' field containing the English/Romanized phonetic spelling of the 'reply' so it can be read by anyone.
5. Maintain the intent but soften aggression or clarify misunderstandings.
6. In 'cultural_insight', explain any mediation choices or cultural bridges you built.
`;
  }

  // Prepare contents
  const parts: any[] = [];
  if (audioBase64) {
    parts.push({
      inlineData: {
        mimeType: "audio/webm;codecs=opus",
        data: audioBase64
      }
    });
    parts.push({ text: currentMessage || "Analyze this audio input." });
  } else {
    parts.push({ text: currentMessage });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7,
      }
    });

    const jsonText = response.text || "{}";
    const parsed: GeminiResponseSchema = JSON.parse(jsonText);
    return parsed;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      reply: "I'm having trouble connecting to the linguistic engine right now.",
      detected_emotion: "Neutral",
      detected_language: "Unknown",
      cultural_insight: null
    };
  }
};