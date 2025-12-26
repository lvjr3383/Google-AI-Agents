
import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "./constants";
import { SplitContent } from "./types";

export class DetectiveService {
  private chat: Chat | null = null;

  constructor() {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      console.warn("Missing Gemini API key. Set GEMINI_API_KEY in .env.local.");
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    this.chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for more consistent formatting
      },
    });
  }

  async sendMessage(text: string): Promise<string> {
    if (!this.chat) {
      return "API key missing. Add GEMINI_API_KEY to .env.local and restart.";
    }
    try {
      const response = await this.chat.sendMessage({ message: text });
      return response.text || "I encountered a logical gap. Let's try that again.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Detective Error: Connection to the logic core lost. Please retry.";
    }
  }

  static parseSplitContent(content: string): SplitContent {
    const chatMarker = "[LEFT PANEL - CHAT]";
    const workspaceMarker = "[RIGHT PANEL - WORKSPACE]";

    let chat = "";
    let workspace = "";

    const chatIdx = content.toUpperCase().indexOf(chatMarker.toUpperCase());
    const workspaceIdx = content.toUpperCase().indexOf(workspaceMarker.toUpperCase());

    if (chatIdx !== -1 && workspaceIdx !== -1) {
      if (chatIdx < workspaceIdx) {
        chat = content.substring(chatIdx + chatMarker.length, workspaceIdx).trim();
        workspace = content.substring(workspaceIdx + workspaceMarker.length).trim();
      } else {
        workspace = content.substring(workspaceIdx + workspaceMarker.length, chatIdx).trim();
        chat = content.substring(chatIdx + chatMarker.length).trim();
      }
    } else if (chatIdx !== -1) {
      chat = content.substring(chatIdx + chatMarker.length).trim();
      // Try to find if workspace content exists without the marker
      if (chat.includes("STAGE:")) {
        const parts = chat.split(/STAGE:/i);
        chat = parts[0].trim();
        workspace = "STAGE: " + parts[1].trim();
      } else {
        workspace = "Analyzing data stream...";
      }
    } else if (workspaceIdx !== -1) {
      workspace = content.substring(workspaceIdx + workspaceMarker.length).trim();
      chat = "I've updated the investigation workspace.";
    } else {
      // Fallback: search for the STAGE marker directly
      const stageIdx = content.toUpperCase().indexOf("STAGE:");
      if (stageIdx !== -1) {
        chat = content.substring(0, stageIdx).trim();
        workspace = content.substring(stageIdx).trim();
      } else {
        chat = content;
        workspace = "Awaiting analytical breakdown...";
      }
    }

    // Sanitize markers that might have leaked into text
    chat = chat.replace(/^:\s*/, '').trim();
    workspace = workspace.replace(/^:\s*/, '').trim();

    return { chat, workspace };
  }
}
