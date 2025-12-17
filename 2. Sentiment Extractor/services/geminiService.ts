import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SentimentAnalysis, SentimentLabel } from "../types";

// Allow prompts to be provided via env so the repo does not publish the full recipe.
const DEFAULT_ANALYSIS_PROMPT = `
ROLE: Sentiment Extractor. Explain sentiment decisions clearly and concisely.
TASK: Given user text, classify as Positive/Negative/Neutral with a confidence 0-1. Return JSON that matches the provided schema: tokens, tokenIds (ints), subwords, vectorSpaceDescription, 7 vectorCoordinates (one isCurrent=true), highImpactWords with impactScore and reason, nuanceExplanation, sentimentArc aligned to tokens, and a lesson (title/content). X axis = sentiment (-10 to 10), Y axis = intensity/abstraction (-10 to 10). Keep wording brief and factual.
`;

const DEFAULT_CHAT_PROMPT = `
ROLE: Sentiment guide. Answer questions about tokenization, vector space, and sentiment at a high level. If context JSON is provided, reference it briefly. Keep answers under 80 words.
`;

const apiKey = process.env.API_KEY;
const analysisPrompt = (process.env.ANALYSIS_PROMPT || "").trim() || DEFAULT_ANALYSIS_PROMPT.trim();
const chatPrompt = (process.env.CHAT_PROMPT || "").trim() || DEFAULT_CHAT_PROMPT.trim();

if (!apiKey) {
  console.error("API_KEY is not set in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// Schema definition to ensure strict JSON output matching our types
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    signal: {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING, enum: [SentimentLabel.POSITIVE, SentimentLabel.NEGATIVE, SentimentLabel.NEUTRAL] },
        confidenceScore: { type: Type.NUMBER, description: "A float between 0 and 1" },
        metaphor: { type: Type.STRING },
      },
      required: ["label", "confidenceScore", "metaphor"],
    },
    mechanics: {
      type: Type.OBJECT,
      properties: {
        tokens: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The input broken into word-level tokens" },
        tokenIds: { type: Type.ARRAY, items: { type: Type.INTEGER }, description: "Simulated integer IDs for each token (e.g. 101, 3402, 205)" },
        subwords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Interesting sub-word tokens if applicable, e.g. 'un', 'believ', 'able'" },
        vectorSpaceDescription: { type: Type.STRING },
        vectorCoordinates: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              label: { type: Type.STRING },
              isCurrent: { type: Type.BOOLEAN },
            },
            required: ["x", "y", "label", "isCurrent"],
          },
          description: "Generate exactly 7 points. Coordinates MUST be between -10 and 10. One point MUST be the current input (isCurrent=true). Others should be diverse reference words (e.g., 'Joy', 'Anger', 'Boredom') to show semantic distance.",
        },
      },
      required: ["tokens", "tokenIds", "subwords", "vectorSpaceDescription", "vectorCoordinates"],
    },
    why: {
      type: Type.OBJECT,
      properties: {
        highImpactWords: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              impactScore: { type: Type.NUMBER },
              reason: { type: Type.STRING },
            },
            required: ["word", "impactScore", "reason"],
          },
        },
        nuanceExplanation: { type: Type.STRING },
        sentimentArc: {
          type: Type.ARRAY,
          items: { type: Type.NUMBER },
          description: "An array of numbers representing the cumulative sentiment score (-10 to 10) as the sentence is read token by token. The length MUST match the number of tokens. Example: [0, 0, 2, 5, 5, -2, -8] for 'The start was good but then it failed'."
        }
      },
      required: ["highImpactWords", "nuanceExplanation", "sentimentArc"],
    },
    lesson: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        content: { type: Type.STRING },
      },
      required: ["title", "content"],
    },
  },
  required: ["signal", "mechanics", "why", "lesson"],
};

export const analyzeSentiment = async (text: string): Promise<SentimentAnalysis> => {
  const model = "gemini-3-pro-preview"; // Using Pro for complex reasoning/thinking

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [{ text: text }],
        },
      ],
      config: {
        systemInstruction: analysisPrompt,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        thinkingConfig: { thinkingBudget: 16000 }, 
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response content from Gemini.");
    }
    
    return JSON.parse(jsonText) as SentimentAnalysis;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const chatWithAgent = async (text: string, context?: SentimentAnalysis | null): Promise<string> => {
  const model = "gemini-2.5-flash"; // Faster model for chat

  let prompt = text;
  if (context) {
    prompt = `Context (Last Analysis): ${JSON.stringify(context)}\n\nUser Question: ${text}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: chatPrompt,
      },
    });
    return response.text || "I'm having trouble retrieving that information.";
  } catch (error) {
    return "I encountered a connection error. Please try again.";
  }
};
