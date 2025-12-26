
import { GoogleGenAI, Type } from "@google/genai";
import { NERAnalysis } from "./types";

const SYSTEM_INSTRUCTION = `Return strict JSON for NER.
If text is not English-like or outside 8-80 words, set isInputValid=false and keep arrays/stats empty with a validationMessage.
Tokenize with BIO and offsets; spans need colors: PERSON #ef4444, ORG #2563eb, GPE/LOC #16a34a, DATE #a855f7, OTHER #94a3b8.
Stats keys: Person, Organization, Location, Date, Other. Include summary, insight, and brief pipeline step explanations.`;

const STEP_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    explanation: { type: Type.STRING },
    inputDescription: { type: Type.STRING },
    outputDescription: { type: Type.STRING }
  },
  required: ["title", "explanation", "inputDescription", "outputDescription"]
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isInputValid: { type: Type.BOOLEAN },
    validationMessage: { type: Type.STRING },
    tokens: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          bioTag: { type: Type.STRING },
          label: { type: Type.STRING },
          start: { type: Type.INTEGER },
          end: { type: Type.INTEGER }
        },
        required: ["text", "bioTag", "label", "start", "end"]
      }
    },
    spans: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          label: { type: Type.STRING },
          start: { type: Type.INTEGER },
          end: { type: Type.INTEGER },
          color: { type: Type.STRING }
        },
        required: ["text", "label", "start", "end", "color"]
      }
    },
    stats: {
      type: Type.OBJECT,
      properties: {
        Person: { type: Type.NUMBER },
        Organization: { type: Type.NUMBER },
        Location: { type: Type.NUMBER },
        Date: { type: Type.NUMBER },
        Other: { type: Type.NUMBER }
      },
      required: ["Person", "Organization", "Location", "Date", "Other"]
    },
    summary: { type: Type.STRING },
    insight: { type: Type.STRING },
    pipelineExplanations: {
      type: Type.OBJECT,
      properties: {
        step1: STEP_SCHEMA,
        step2: STEP_SCHEMA,
        step3: STEP_SCHEMA,
        step4: STEP_SCHEMA
      },
      required: ["step1", "step2", "step3", "step4"]
    }
  },
  required: ["isInputValid", "validationMessage", "tokens", "spans", "stats", "summary", "insight", "pipelineExplanations"]
};

export const analyzeText = async (text: string): Promise<NERAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this text for NER: "${text}"`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  try {
    return JSON.parse(response.text) as NERAnalysis;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Could not parse AI response.");
  }
};

export const chatWithExplorer = async (history: { role: string, message: string }[], newMessage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || '' });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'Be concise (<=6 sentences), plain text only, no markdown. Explain definitions simply when asked.'
    }
  });
  
  const response = await chat.sendMessage({ message: newMessage });
  // Aggressive markdown cleanup
  return response.text.replace(/[*_#`~>]/g, '').trim();
};
