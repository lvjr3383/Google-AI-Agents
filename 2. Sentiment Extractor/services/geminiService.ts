import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SentimentAnalysis, SentimentLabel } from "../types";

const apiKey = process.env.API_KEY;

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

  const systemInstruction = `
    ROLE: Sentiment Extractor (Chapter 6: Sentiment Extraction)
    CONTEXT: You are the interactive companion for the "Practical NLP Field Guide." 
    MISSION: Demystify "Sentiment Extraction". Reverse-engineer your own processing.
    
    TONE: Professional, insightful, rigorous but accessible. "Stanford CS translated for a startup CTO."
    
    TASK: Analyze the user's input.
    1. THE SIGNAL: Classify Positive/Negative/Neutral. Provide a confidence score. Use a "Binning" metaphor.
    2. THE MECHANICS: 
       - Tokenize the text: split into tokens AND assign hypothetical integer IDs.
       - Describe the Vector Space location.
       - Generate visual coordinates for a 2D scatter plot (Range: -10 to 10). 
       - Place the user's text (isCurrent=true) intelligently.
       - Generate 6 'Anchor' points.
       - MAPPING RULES for X/Y:
           X-AXIS = SENTIMENT (-10 is pure negative, +10 is pure positive).
           Y-AXIS = INTENSITY/ABSTRACTION (-10 is mundane/concrete, +10 is intense/abstract).
    3. THE WHY: 
       - Identify high impact words.
       - **GENERATE SENTIMENT ARC**: Create a sequence of numbers (matching token count) that represents the emotional journey of the sentence. 
         - Start near 0.
         - Go up for positive words, down for negative.
         - Handle negation (e.g., "not good" should go up for "good" then crash down for "not" or vice versa depending on your tokenization logic, or stay flat then drop).
         - Example: "I loved it" -> [0, 5, 8]. "I hated it" -> [0, -5, -8].
    4. THE LESSON: Connect to an engineering principle (e.g., handling sarcasm, negation, magnitude).
  `;

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
        systemInstruction: systemInstruction,
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

  const systemInstruction = `
    ROLE: Sentiment Extractor.
    CONTEXT: You are a helpful NLP expert explaining concepts like Tokenization, Vector Spaces, and Sentiment Analysis.
    TONE: Brief, educational, slightly technical but clear.
    
    If the user asks about the "last analysis", refer to the provided context JSON.
    If the user asks general questions, answer them conceptually.
    If the user is asking to proceed to the next step (e.g. "yes", "next"), acknowledge it briefly.
    Keep answers under 80 words.
  `;

  let prompt = text;
  if (context) {
    prompt = `Context (Last Analysis): ${JSON.stringify(context)}\n\nUser Question: ${text}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text || "I'm having trouble retrieving that information.";
  } catch (error) {
    return "I encountered a connection error. Please try again.";
  }
};
