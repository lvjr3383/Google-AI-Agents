import { GoogleGenAI, Type } from "@google/genai";
import { DetectionResult, PipelineStep } from "../types";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const detectPrompt =
  (process.env.DETECT_PROMPT || "").trim() ||
  `Detect language, flag gibberish, and return JSON matching the schema. Fill: language, confidence (0-1), family, two confusable candidates with scores, clues (characters/patterns), actionPacket (isoCode, direction, formattingRule, flag, actionDescription), summary, isGibberish. Keep it concise.`;

const chatPrompt =
  (process.env.DETECT_CHAT_PROMPT || "").trim() ||
  `Be brief. Explain the current detection step, reference clues/families/probabilities/action packet as needed. Keep under 4 sentences.`;

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const detectLanguage = async (text: string, eli5: boolean): Promise<DetectionResult> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `${detectPrompt}
Input: "${text}"
Audience: ${eli5 ? 'Explain simply (ELI5).' : 'Explain concisely for an adult learner.'}
Families to choose from (pick the closest): Romance, Germanic, Slavic, IndoAryan, Austronesian, SinoTibetan, Afroasiatic, NigerCongo, Turkic, Uralic, Kartvelian, Amerindian, Dravidian, Austroasiatic, NiloSaharan, KraDai, Japonic, Koreanic, HmongMien, Quechuan, Other.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          clues: { type: Type.ARRAY, items: { type: Type.STRING } },
          family: { type: Type.STRING },
          confusability: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ["name", "score"]
            }
          },
          actionPacket: {
            type: Type.OBJECT,
            properties: {
              isoCode: { type: Type.STRING },
              direction: { type: Type.STRING },
              formattingRule: { type: Type.STRING },
              flag: { type: Type.STRING },
              actionDescription: { type: Type.STRING }
            },
            required: ["isoCode", "direction", "formattingRule", "flag", "actionDescription"]
          },
          summary: { type: Type.STRING },
          isGibberish: { type: Type.BOOLEAN }
        },
        required: ["language", "confidence", "clues", "family", "confusability", "actionPacket", "summary", "isGibberish"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const getDetectiveLogResponse = async (
  query: string, 
  history: { role: 'user' | 'model', text: string }[], 
  currentDetection: DetectionResult | null,
  currentStep: PipelineStep,
  eli5: boolean
) => {
  const model = 'gemini-3-pro-preview';
  
  const stepMap = {
    [PipelineStep.INPUT]: "Initial evidence collection",
    [PipelineStep.CLUE_HUNT]: "Character/pattern clues",
    [PipelineStep.NEIGHBORHOOD]: "Family estimation",
    [PipelineStep.TIE_BREAKER]: "Probability tie-breaker",
    [PipelineStep.PASSPORT]: "Final identification"
  };

  const systemInstruction = `${chatPrompt}
Current step: ${stepMap[currentStep]}.
Underlying detection (if known): ${currentDetection?.language || 'unknown'}.
Tone: ${eli5 ? 'Simple' : 'Concise'}.`;

  const response = await ai.models.generateContent({
    model,
    contents: history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })),
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  return response.text || "The trail has gone cold. Could you rephrase your question, colleague?";
};
