
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

export const parseSentence = async (sentence: string) => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Parse constituency for: "${sentence}"
Return JSON with: tokens [{word, tag}], constituents [{label, start, end}], linearized (parenthesized tree).
Use standard phrase labels (S, NP, VP, PP, etc.).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tokens: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                tag: { type: Type.STRING }
              },
              required: ["word", "tag"]
            }
          },
          constituents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                start: { type: Type.INTEGER },
                end: { type: Type.INTEGER }
              },
              required: ["label", "start", "end"]
            }
          },
          linearized: { type: Type.STRING }
        },
        required: ["tokens", "constituents", "linearized"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse constituency response:", error);
    return {
      tokens: [],
      constituents: [],
      linearized: ""
    };
  }
};

export const askArchitect = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: `Answer in <=2 sentences, plain text, no markdown. Explain simply for non-experts.`
      }
    });
    return response.text || "I hit a snag in the blueprints. Let's try again.";
  } catch (error) {
    console.error("Architect Error:", error);
    return "The site is currently experiencing high winds. Please try again in a moment.";
  }
};
