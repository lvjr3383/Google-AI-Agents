
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types";

const SYSTEM_INSTRUCTION = `You are a POS tagging helper. Return strict JSON per schema.
If text is non-English or outside 10-60 tokens, set isInputValid=false.
Use Universal POS tags; chart labels should be human-readable (e.g., Nouns, Verbs).
Use colors: NOUN=#3b82f6, VERB=#22c55e, ADJ=#f59e0b, ADV=#a855f7, PRON=#ec4899, DET=#64748b, default=#94a3b8.
Provide a one-sentence summary and two brief tag explanations.`;

export async function analyzeText(text: string): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this text for a student: "${text}"`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isInputValid: { type: Type.BOOLEAN },
          validationMessage: { type: Type.STRING },
          markdownSummary: { type: Type.STRING },
          tagExplanations: { type: Type.STRING },
          tokens: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                index: { type: Type.INTEGER },
                token: { type: Type.STRING },
                lemma: { type: Type.STRING },
                pos: { type: Type.STRING, description: "Short POS tag like NOUN, VERB" },
                fine_tag: { type: Type.STRING },
                dep: { type: Type.STRING },
                head_token: { type: Type.STRING },
              },
              required: ["index", "token", "lemma", "pos", "fine_tag", "dep", "head_token"],
            },
          },
          chartData: {
            type: Type.OBJECT,
            properties: {
              labels: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Full names like 'Nouns', 'Verbs'" },
              counts: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            },
            required: ["labels", "counts"],
          },
          colorizedSpans: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                pos: { type: Type.STRING, description: "Full name for tooltip" },
                color_hex: { type: Type.STRING },
              },
              required: ["text", "pos", "color_hex"],
            },
          },
        },
        required: ["isInputValid", "markdownSummary", "tagExplanations", "tokens", "chartData", "colorizedSpans"],
      },
    },
  });

  return JSON.parse(response.text);
}
