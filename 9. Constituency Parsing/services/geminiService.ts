
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

export const parseSentence = async (sentence: string) => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the constituency structure of the sentence: "${sentence}".
    Return a JSON object with:
    1. "tokens": list of {word, tag} (Brick Classification)
    2. "constituents": list of {label, start, end} spans for the CKY matrix (Foundation Build)
    3. "linearized": standard parenthesized parse tree string for the assembly.
    
    Ensure all phrase labels are strictly standard (S, NP, VP, PP, etc.).`,
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
        systemInstruction: `You are the "Syntax Architect", an expert NLP educator. 
        Explain linguistics using construction metaphors:
        - POS Tags = "Brick Classification" (sorting materials).
        - CNF = "The Rule of Two" (stability through pairs).
        - CKY = "The Foundation Build".
        - Tree = "The Hierarchy of Support".
        Keep it very simple for a layperson. Use zero markdown formatting like asterisks or bolding. 
        Be concise and encouraging. Max 2 sentences.`
      }
    });
    return response.text || "I hit a snag in the blueprints. Let's try again.";
  } catch (error) {
    console.error("Architect Error:", error);
    return "The site is currently experiencing high winds. Please try again in a moment.";
  }
};
