
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TripData, FactData, TimelineData } from "../types";

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

export const extractMonth = async (input: string): Promise<string> => {
  const client = requireClient();
  const prompt = `Extract exactly one month name from this sentence: "${input}". Return ONLY the month name (e.g., "September"). If no month is clearly mentioned, return the input as is.`;
  const response = await client.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  return getResponseText(response).trim() || input;
};

export const recommendMonth = async (destination: string): Promise<string> => {
  const client = requireClient();
  const prompt = `What is the absolute best month to visit ${destination} for a family with kids? Return only the month name and a short reason (max 10 words). Example: "June (sunny weather and festivals)"`;
  const response = await client.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });
  return getResponseText(response) || "June (great weather)";
};

export const getTripFacts = async (data: TripData): Promise<FactData> => {
  const client = requireClient();
  const prompt = `Find real travel facts for a trip from Nashville (BNA) to ${data.destination} in ${data.month}. 
  Needs:
  1. A real airline and route from BNA to ${data.destination}.
  2. A highly-rated Indian Vegetarian restaurant in ${data.destination} including its address.
  3. A kid-friendly attraction in ${data.destination} related to ${data.interests}.
  Return as a valid JSON object. Ensure the JSON is clean and strictly follows the schema.`;

  const response = await client.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          flight: {
            type: Type.OBJECT,
            properties: {
              airline: { type: Type.STRING },
              route: { type: Type.STRING }
            },
            required: ["airline", "route"]
          },
          food: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              address: { type: Type.STRING }
            },
            required: ["name", "address"]
          },
          attraction: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["name", "description"]
          }
        },
        required: ["flight", "food", "attraction"]
      }
    }
  });

  const text = getResponseText(response) || "{}";
  const facts: FactData = JSON.parse(text);
  const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => c.web?.uri).filter(Boolean) as string[] || [];
  return { ...facts, groundingUrls: Array.from(new Set(urls)) };
};

export const createTimeline = async (facts: FactData, destination: string, duration: string): Promise<TimelineData> => {
  const client = requireClient();
  const requestedDays = parseInt(duration) || 5;
  const numDays = Math.max(5, Math.min(requestedDays, 10)); 
  
  const prompt = `Create a logical ${numDays}-day travel skeleton for a child's trip to ${destination}. 
  Use these ingredients:
  - Flight: ${facts.flight.airline} ${facts.flight.route}
  - Food: ${facts.food.name}
  - Attraction: ${facts.attraction.name}
  Include a different morning and afternoon activity for each of the ${numDays} days.
  Return a JSON array of objects with dayNumber, morning, and afternoon.`;

  const response = await client.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            dayNumber: { type: Type.INTEGER },
            morning: { type: Type.STRING },
            afternoon: { type: Type.STRING }
          },
          required: ["dayNumber", "morning", "afternoon"]
        }
      }
    }
  });

  return JSON.parse(getResponseText(response) || "[]");
};

export const generateJournal = async (
  data: TripData, 
  facts: FactData, 
  timeline: TimelineData,
  style: { vocab: string, excitement: string }
): Promise<string> => {
  const client = requireClient();
  const prompt = `Write a "Junior Jetsetter Journal" story for a 7-10 year old about their ${timeline.length}-day trip to ${data.destination}.
  - Facts to include: ${JSON.stringify(facts)}
  - Timeline to follow: ${JSON.stringify(timeline)}
  - Voice Style: ${style.excitement} excitement, ${style.vocab} vocabulary.
  - Tone: Educational, fun, non-fiction.
  - Length: Around 300 words.
  - IMPORTANT: Do NOT use any Markdown (no asterisks, no bolding). Use plain text paragraphs only.
  - Finish with a "Parent's Footnote" with technical travel details.`;

  const response = await client.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      temperature: 0.9,
    }
  });

  return getResponseText(response) || "Generation failed.";
};

export const generateSpeech = async (text: string): Promise<string> => {
  const client = requireClient();
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text.substring(0, 1000) }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};
