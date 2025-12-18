import { GoogleGenAI, Type } from "@google/genai";
import { DetectionResult, PipelineStep } from "../types";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const detectPrompt =
  (process.env.DETECT_PROMPT || "").trim() ||
  `Detect the language of the input, classify if it's gibberish, and return JSON that matches the schema provided. Include language name, confidence (0-1), linguistic family, two confusable candidates with scores, a list of distinctive clues (characters/letter patterns), and an action packet (isoCode, text direction, formattingRule, flag, actionDescription). Keep explanations concise.`;

const chatPrompt =
  (process.env.DETECT_CHAT_PROMPT || "").trim() ||
  `You are a language detection guide. Answer briefly about the current pipeline step, referencing clues, families, probabilities, and the action packet without revealing the final answer too early. Keep responses under 4 sentences.`;

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
    [PipelineStep.CLUE_HUNT]: "Scanning for character and pattern clues (fingerprints)",
    [PipelineStep.NEIGHBORHOOD]: "Determining linguistic family and global positioning on the map",
    [PipelineStep.TIE_BREAKER]: "Calculating probability and racing between top suspects",
    [PipelineStep.PASSPORT]: "Final identification and system integration (The Big Reveal)"
  };

  const systemInstruction = `${chatPrompt}
Current step: ${stepMap[currentStep]}.
Underlying detection (if known): ${currentDetection?.language || 'unknown'}.
Tone: ${eli5 ? 'Simple, friendly' : 'Concise, professional'}.`;

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
