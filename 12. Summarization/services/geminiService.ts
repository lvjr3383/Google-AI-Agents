
import { GoogleGenAI, Type, Modality } from "@google/genai";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn("Missing Gemini API key. Set GEMINI_API_KEY in .env.local.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const requireClient = () => {
  if (!ai) {
    throw new Error("Gemini API key missing. Add GEMINI_API_KEY to .env.local and restart.");
  }
  return ai;
};

const getResponseText = (response: any): string => {
  if (!response) return '';
  if (typeof response.text === 'function') return response.text();
  if (typeof response.text === 'string') return response.text;
  if (response.response && typeof response.response.text === 'function') return response.response.text();
  return '';
};

export const getGeminiResponse = async (step: number, content: string, flavor: string) => {
  const client = requireClient();
  const model = 'gemini-3-flash-preview';

  const flavorContext = {
    article: "Focus: Objective facts and events.",
    email: "Focus: Professional intent and requirements.",
    paper: "Focus: Technical concepts and definitions.",
    custom: "Focus: Data structure and logic."
  }[flavor] || "General context.";

  const systemInstructions: Record<number, string> = {
    1: `You are Agent Summarizer. Analyze data 'Anatomy'. Return JSON: 'input_physics' (tokens:int, target_tokens:int, reading_time_original:str, reading_time_summary:str), 'complexity_score' (Low/Medium/High), 'audience_dial'. Explain the tradeoff between brevity and value in 'chat_explanation'. Strictly one single paragraph. No kitchen or distilling metaphors.`,
    2: `Value Mapping. Break text into 6 segments. Return JSON: 'heatmap_segments' (array of {text, score[0-1], importance, category: 'Core'|'Context'|'Extra'|'Fluff'}), 'top_3_entities' (array), 'chat_explanation' explaining 'Salience'. Strictly one single paragraph. No analogies.`,
    3: `Smart Merging. Identify TWO concepts and merge them. Return JSON: 'bottleneck' ({input:[str, str], process:str, output:str}), 'chat_explanation' explaining 'Abstraction'. Strictly one single paragraph.`,
    4: `The Essence. Provide a polished summary (max 2 sentences). Return JSON: 'final_summary' (Clean text), 'cutting_room_floor' (array of objects { type: 'Detail'|'Side-story'|'Background', content: string }), 'faithfulness_score' (int), 'chat_explanation' explaining the 'Accuracy Rating'. Strictly one single paragraph.`
  };

  const schema: Record<number, any> = {
    1: {
      type: Type.OBJECT,
      properties: {
        input_physics: {
          type: Type.OBJECT,
          properties: { tokens: { type: Type.INTEGER }, target_tokens: { type: Type.INTEGER }, reading_time_original: { type: Type.STRING }, reading_time_summary: { type: Type.STRING } },
          required: ["tokens", "target_tokens", "reading_time_original", "reading_time_summary"]
        },
        complexity_score: { type: Type.STRING },
        audience_dial: { type: Type.STRING },
        chat_explanation: { type: Type.STRING }
      },
      required: ["input_physics", "complexity_score", "audience_dial", "chat_explanation"]
    },
    2: {
      type: Type.OBJECT,
      properties: {
        heatmap_segments: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, score: { type: Type.NUMBER }, importance: { type: Type.STRING }, category: { type: Type.STRING } }, required: ["text", "score", "importance", "category"] } },
        top_3_entities: { type: Type.ARRAY, items: { type: Type.STRING } },
        chat_explanation: { type: Type.STRING }
      },
      required: ["heatmap_segments", "top_3_entities", "chat_explanation"]
    },
    3: {
      type: Type.OBJECT,
      properties: {
        bottleneck: { type: Type.OBJECT, properties: { input: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 2 }, process: { type: Type.STRING }, output: { type: Type.STRING } }, required: ["input", "process", "output"] },
        chat_explanation: { type: Type.STRING }
      },
      required: ["bottleneck", "chat_explanation"]
    },
    4: {
      type: Type.OBJECT,
      properties: {
        final_summary: { type: Type.STRING },
        cutting_room_floor: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, content: { type: Type.STRING } }, required: ["type", "content"] } },
        faithfulness_score: { type: Type.INTEGER },
        chat_explanation: { type: Type.STRING }
      },
      required: ["final_summary", "cutting_room_floor", "faithfulness_score", "chat_explanation"]
    }
  };

  const response = await client.models.generateContent({
    model,
    contents: `CONTEXT: ${flavorContext}\nTEXT: ${content}\nACTION: Step ${step}`,
    config: { systemInstruction: systemInstructions[step], responseMimeType: "application/json", responseSchema: schema[step], temperature: 0.1 }
  });

  const text = getResponseText(response);
  if (!text) {
    throw new Error("Empty response from Gemini.");
  }

  return JSON.parse(text);
};

export const askQuestion = async (question: string, currentStep: number, currentData: any) => {
  const client = requireClient();
  const model = 'gemini-3-flash-preview';
  const response = await client.models.generateContent({
    model,
    contents: `Question: ${question}\nContext: Step ${currentStep}, Data: ${JSON.stringify(currentData)}`,
    config: { 
      systemInstruction: "You are Agent Summarizer. Explain simply. One single paragraph only. No lists, no bold headers, no kitchen metaphors. Direct and helpful.",
      temperature: 0.5 
    }
  });
  return getResponseText(response);
};

export const textToSpeech = async (text: string) => {
  const client = requireClient();
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text.substring(0, 1000) }] }], // Clamp for speed
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};
