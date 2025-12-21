
import { GoogleGenAI, Type } from "@google/genai";
import { NERAnalysis } from "./types";

const SYSTEM_INSTRUCTION = `You are the "Entity Explorer," an educational AI assistant specialized in Named Entity Recognition (NER). Your goal is to help students understand the machine learning pipeline for extracting structured information from text.

Return ONLY raw JSON.

### ANALYSIS WORKFLOW
1. **Validation**: Check if text is English-like, 8-80 words. If invalid, set isInputValid=false, provide validationMessage, and return empty arrays with zeroed stats so the UI does not break.
2. **Step 1: The Fracture (Tokenization)**: Break text into tokens with BIO tags and character offsets.
3. **Step 2: The Identification (Entity Spans)**: Group tokens into spans. Assign colors with this palette: #ef4444 (PERSON), #2563eb (ORG), #16a34a (GPE/LOC), #a855f7 (DATE), #94a3b8 (OTHER/unknown).
4. **Step 3: The Composition (Statistics)**: Aggregate counts for these types only: Person, Organization, Location, Date, Other.
5. **Step 4: The Revelation (Insights)**: Provide a summary, educational insight, and detailed explanations for each pipeline step.`;

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
      systemInstruction: 'You are the Entity Explorer, a friendly AI tutor. Provide brief answers in plain English (max 5-6 sentences). NEVER use asterisks (*), markdown bolding, or lists. Return raw plain text only. If the user asks for a definition, explain it like they are 10 years old.'
    }
  });
  
  const response = await chat.sendMessage({ message: newMessage });
  // Aggressive markdown cleanup
  return response.text.replace(/[*_#`~>]/g, '').trim();
};
