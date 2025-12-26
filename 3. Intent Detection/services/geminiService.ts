import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse, WizardStep, CLUSTERS } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

/**
 * Analyzes the user's text to extract intent data.
 * Uses gemini-3-pro-preview for deep reasoning.
 */
export const analyzeIntent = async (text: string): Promise<AnalysisResponse> => {
  const systemPrompt = `
  You are an intent classifier. Return strict JSON matching the schema.
  Use landscape coords: X -10 informational to +10 transactional; Y -10 low urgency to +10 high urgency.
  Known clusters: Account Security ~(8,8); Payments ~(5,-5); General Support ~(-8,-2).
  Keep text brief; fill all required fields.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: text,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 1024 }, // Enable thinking for better classification reasoning
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          signal: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              triggers: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["text", "triggers"]
          },
          landscape: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER, description: "X coordinate -10 to 10" },
              y: { type: Type.NUMBER, description: "Y coordinate -10 to 10" },
              explanation: { type: Type.STRING }
            },
            required: ["x", "y", "explanation"]
          },
          competition: {
            type: Type.ARRAY,
            description: "Top 3 intents",
            items: {
              type: Type.OBJECT,
              properties: {
                intent: { type: Type.STRING },
                probability: { type: Type.NUMBER, description: "0.0 to 1.0" }
              },
              required: ["intent", "probability"]
            }
          },
          routing: {
            type: Type.OBJECT,
            properties: {
              winner: { type: Type.STRING },
              payload: { 
                type: Type.OBJECT, 
                description: "Simulated JSON output for the backend handler", 
                properties: {
                  action: { type: Type.STRING, description: "Technical action name e.g. BLOCK_CARD" },
                  priority: { type: Type.STRING, description: "HIGH, MEDIUM, LOW" },
                  target_queue: { type: Type.STRING, description: "Queue name e.g. FRAUD_OPS" }
                }
              },
              reasoning: { type: Type.STRING }
            },
            required: ["winner", "payload", "reasoning"]
          }
        },
        required: ["signal", "landscape", "competition", "routing"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(response.text) as AnalysisResponse;
};

/**
 * Chat with the context of the current analysis.
 * Uses gemini-2.5-flash for speed.
 */
export const chatWithContext = async (
  history: { role: string; parts: { text: string }[] }[],
  currentStep: WizardStep,
  analysisData: AnalysisResponse | null,
  userMessage: string
): Promise<string> => {
  
  let contextPrompt = `You are a concise intent assistant.
  Current Phase: ${WizardStep[currentStep]}`;

  if (analysisData) {
    contextPrompt += `
    Analysis Data:
    - Input: "${analysisData.signal.text}"
    - Triggers: ${analysisData.signal.triggers.join(", ")}
    - Landscape Coords: (${analysisData.landscape.x}, ${analysisData.landscape.y})
    - Top Intent: ${analysisData.competition[0].intent} (${(analysisData.competition[0].probability * 100).toFixed(1)}%)
    `;
  } else {
    contextPrompt += `Waiting for user to input text for analysis.`;
  }

  contextPrompt += ` Keep responses brief and plain; guide the user without extra flair.`;

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: contextPrompt,
    },
    history: history.map(h => ({ role: h.role, parts: h.parts })),
  });

  const result = await chat.sendMessage({ message: userMessage });
  return result.text || "System silence.";
};
