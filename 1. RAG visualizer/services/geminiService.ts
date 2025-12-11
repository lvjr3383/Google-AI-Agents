
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// Initialize Gemini Client
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const EMBEDDING_MODEL = "text-embedding-004";
export const DEFAULT_CHAT_MODEL = "gemini-2.5-flash";

/**
 * Generate embeddings for a list of texts.
 */
export const getEmbeddings = async (texts: string[]): Promise<number[][]> => {
  if (!ai) {
    console.warn("No API Key found. Returning mock embeddings.");
    return mockEmbeddings(texts.length);
  }

  try {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
        const result = await ai.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: text,
        });
        if (result.embedding?.values) {
            embeddings.push(result.embedding.values);
        } else {
            // Fallback for failure
            embeddings.push(new Array(768).fill(0).map(() => Math.random()));
        }
    }
    return embeddings;

  } catch (error) {
    console.error("Embedding Error:", error);
    throw new Error("Failed to generate embeddings. Check API Key.");
  }
};

/**
 * Generate a single text response.
 */
export const generateResponse = async (prompt: string): Promise<string> => {
  if (!ai) {
     return "API Key missing. Cannot generate response.";
  }

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_CHAT_MODEL,
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Generation Error:", error);
    return `Error generating response: ${(error as Error).message}`;
  }
};

/**
 * Count tokens in a text string.
 * Uses API if available, otherwise a rough character-based heuristic.
 */
export const countTokens = async (text: string): Promise<number> => {
    if (!ai) {
        // Heuristic: ~4 characters per token is a common approximation for English
        return Math.ceil(text.length / 4);
    }

    try {
        const response = await ai.models.countTokens({
            model: DEFAULT_CHAT_MODEL,
            contents: text,
        });
        return response.totalTokens || Math.ceil(text.length / 4);
    } catch (error) {
        console.warn("Token counting failed, using heuristic", error);
        return Math.ceil(text.length / 4);
    }
}


// --- MOCK FALLBACKS ---
const mockEmbeddings = (count: number): number[][] => {
    return Array.from({ length: count }, () => 
        Array.from({ length: 768 }, () => Math.random() * 2 - 1)
    );
};
