
import { GoogleGenAI, Type } from "@google/genai";
import { TargetLanguage, AgentResponse } from "../types";

export async function translateAndVisualize(
  text: string,
  targetLang: TargetLanguage
): Promise<AgentResponse> {
  // Use a fresh instance for every call to ensure the latest API key is used
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("Missing Gemini API key. Add GEMINI_API_KEY to your .env.local and restart.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    You are "The Weaver," an expert NMT architect. 
    Explain the translation of "${text}" into ${targetLang} using 4 distinct neural layers.

    STRICT CHAT RULES:
    1. Output 'chatText' with 4 sections, each starting with "### Step 1:", "### Step 2:", etc.
    2. THE ROYAL MIDDLE PATH: Each step description MUST be exactly 4-5 sentences. 
    3. Tone: Poetic yet technical. Use metaphors like "weaving," "neural threads," and "probability fields."
    4. Focus on why specific words or structures are chosen.

    STRICT JSON RULES:
    1. 'workspace.attention_map': Create a meaningful heatmap matrix (Target Tokens vs Source Tokens).
    2. 'workspace.suggested_questions': 2-3 dynamic, context-specific questions for EACH of the 4 steps.
    3. Ensure all fields are populated efficiently.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Execute the 4-layer neural deconstruction for: "${text}" into ${targetLang}.`,
      config: {
        systemInstruction,
        temperature: 0.4,
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for maximum speed and "lean" response
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            workspace: {
              type: Type.OBJECT,
              properties: {
                step_1_input: {
                  type: Type.OBJECT,
                  properties: {
                    source_text: { type: Type.STRING },
                    detected_language: { type: Type.STRING },
                    target_language: { type: Type.STRING },
                    intent: { type: Type.STRING },
                  },
                },
                step_2_tokenization: {
                  type: Type.OBJECT,
                  properties: {
                    explanation: { type: Type.STRING },
                    tokens: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
                step_3_decode_timeline: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      step: { type: Type.INTEGER },
                      current_token: { type: Type.STRING },
                      top_5_candidates: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            token: { type: Type.STRING },
                            prob: { type: Type.NUMBER },
                          },
                        },
                      },
                    },
                  },
                },
                step_4_final_output: {
                  type: Type.OBJECT,
                  properties: {
                    translation_script: { type: Type.STRING },
                    romanization: { type: Type.STRING },
                    literal_translation: { type: Type.STRING },
                  },
                },
                attention_map: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      target_token: { type: Type.STRING },
                      weights: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            source_token: { type: Type.STRING },
                            weight: { type: Type.NUMBER },
                          },
                        },
                      },
                    },
                  },
                },
                suggested_questions: {
                  type: Type.OBJECT,
                  properties: {
                    "1": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "2": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "3": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "4": { type: Type.ARRAY, items: { type: Type.STRING } },
                  }
                }
              },
            },
            chatText: { type: Type.STRING, description: "Exactly 4 steps, 4-5 sentences each, with ### Step X: headers." },
          },
        },
      },
    });

    const result = JSON.parse(response.text);
    return {
      workspace: result.workspace,
      chatText: result.chatText
    };
  } catch (error) {
    console.error("Gemini Execution Error:", error);
    throw new Error("The Weaver's loom encountered a synchronization error. Please try again.");
  }
}
