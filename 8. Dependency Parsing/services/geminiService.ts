
import { GoogleGenAI, Type } from "@google/genai";
import { ParsingResult } from "../types";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const PARSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    sentence: {
      type: Type.STRING,
      description: "The original sentence being analyzed."
    },
    isValid: { 
      type: Type.BOOLEAN,
      description: "True if the input is a grammatically sound or parsable English sentence, false otherwise."
    },
    validationMessage: { 
      type: Type.STRING,
      description: "A user-friendly explanation if the sentence is invalid or highly ambiguous."
    },
    anchor: {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING },
        pos: { type: Type.STRING },
        explanation: { type: Type.STRING },
      },
      required: ["word", "pos", "explanation"]
    },
    linkage: {
      type: Type.OBJECT,
      properties: {
        connections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              head: { type: Type.STRING },
              relation: { type: Type.STRING },
              dependent: { type: Type.STRING },
            },
            required: ["head", "relation", "dependent"]
          }
        },
        explanation: { type: Type.STRING },
      },
      required: ["connections", "explanation"]
    },
    hierarchy: {
      type: Type.OBJECT,
      properties: {
        tree: { type: Type.STRING },
        explanation: { type: Type.STRING },
      },
      required: ["tree", "explanation"]
    },
    revelation: {
      type: Type.OBJECT,
      properties: {
        actor: { type: Type.STRING },
        action: { type: Type.STRING },
        recipient: { type: Type.STRING },
        explanation: { type: Type.STRING },
      },
      required: ["actor", "action", "recipient", "explanation"]
    },
    suggestedQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["sentence", "isValid", "anchor", "linkage", "hierarchy", "revelation", "suggestedQuestions"]
};

export async function parseSentence(sentence: string): Promise<ParsingResult> {
  const model = ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Dependency-parse: "${sentence}"
First, if not a parsable English sentence, set isValid=false, add validationMessage, and return empty placeholders so UI stays stable.
If valid, fill schema with: root verb (anchor), key connections (linkage), ASCII tree (hierarchy), core tuple [Actor]->[Action]->[Recipient] (revelation), and 3 short suggestedQuestions.`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: PARSE_SCHEMA,
    },
  });

  const response = await model;
  const parsed = JSON.parse(response.text || "{}") as Partial<ParsingResult>;

  if (!parsed.isValid) {
    return {
      sentence,
      isValid: false,
      validationMessage: parsed.validationMessage || "Input not suitable for dependency parsing. Please provide a clear English sentence.",
      anchor: parsed.anchor || { word: "", pos: "", explanation: "" },
      linkage: parsed.linkage || { connections: [], explanation: "" },
      hierarchy: parsed.hierarchy || { tree: "", explanation: "" },
      revelation: parsed.revelation || { actor: "", action: "", recipient: "", explanation: "" },
      suggestedQuestions: parsed.suggestedQuestions || []
    };
  }

  return parsed as ParsingResult;
}

export async function askQuestion(sentence: string, question: string, history: {role: string, text: string}[]): Promise<string> {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { text: `The user is studying this sentence: "${sentence}"` },
      ...history.map(m => ({ text: `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}` })),
      { text: `Question: ${question}` }
    ],
    config: {
      systemInstruction: "Answer dependency questions in 1-2 sentences, plain text, no markdown, concise and neutral."
    }
  });

  const response = await model;
  return response.text || "I'm sorry, I couldn't process that question.";
}
