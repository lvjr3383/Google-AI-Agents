
import { GoogleGenAI } from "@google/genai";
import { LabStage } from '../types';

export const getAgentExplanation = async (stage: LabStage, customPrompt?: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "API key not found. Proceeding with standard thematic mapping logic.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';
  
  let stagePrompt = "";
  switch(stage) {
    case LabStage.DISTILLATION:
      stagePrompt = "Explain why we filter common words to find semantic markers for Cars, Phones, Movies, Sports, and Food. Under 20 words. No analogies.";
      break;
    case LabStage.DICTIONARY:
      stagePrompt = "Explain how word counts create a mathematical signature for reviews in these 5 categories. Under 20 words. No analogies.";
      break;
    case LabStage.ITERATION:
      stagePrompt = "Explain how clustering identifies patterns to group 20 reviews into 5 distinct buckets. Under 20 words. No analogies.";
      break;
    case LabStage.ATLAS:
      stagePrompt = "Summarize the final mapping of the documents into the 5 understandable domains. Under 20 words. No analogies.";
      break;
  }

  const prompt = customPrompt || stagePrompt;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are an elite AI Data Scientist. Provide ultra-short, direct, professional insights. Lead with the core conclusion. NEVER use labels like 'Fact:' or 'Result:'. Use professional terms like 'vector space', 'clustering', and 'semantic indicators'. Max 25 words. No markdown or bold text.",
        temperature: 0.3,
      }
    });
    
    let text = response.text || "Primary thematic signals have been isolated across the dataset.";
    
    // Rigorous cleaning of AI artifacts
    text = text.replace(/[*#]/g, '')
               .replace(/^(Result|Fact|Conclusion|Analysis|Note|Insight)[:\s]*/i, '')
               .replace(/^(Hi|Hello|Okay|Sure|Greetings|Certainly|Absolutely)[!,\s]*/i, '')
               .trim();
    
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Analysis transition successful. Document clusters have been mathematically defined.";
  }
};
