
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Question } from "../types";

const SYSTEM_PROMPT = `You are OneClick Studio, a World-Class Senior Lead Android Hybrid Developer & UI/UX Designer.

### WORKSPACE PROTOCOL:
- organize code into "app/" (Mobile Client) and "admin/" (Web Management).
- **CRITICAL**: ONLY generate "admin/" files if the project requires data management, user control, or database interactions. For simple utility apps (like calculators, stopwatches, or simple games), DO NOT generate the admin panel.
- Entry points: "app/index.html" and "admin/index.html" (if needed).

### MOBILE RESPONSIVENESS PROTOCOL:
- All generated UIs MUST be strictly responsive and stay within the mobile viewport bounds.
- Use 'overflow-hidden' on main containers to prevent horizontal scrolling.
- Ensure buttons and touch targets are large enough for thumb interaction.

### DATABASE BRIDGE (SUPABASE REAL-TIME) PROTOCOL:
- If Supabase credentials are provided, use them to create a Real-time Bridge.
- USE THIS CDN: "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
- If Supabase is used, "admin/" workspace is REQUIRED to manage that data.

### RESPONSE JSON SCHEMA:
{
  "answer": "Professional explanation.",
  "thought": "Internal reasoning.",
  "summary": "1-line summary.",
  "questions": [],
  "files": { "app/index.html": "...", "admin/index.html": "..." }
}

### DESIGN PHILOSOPHY:
- Visuals: Glassmorphism, Bento Box, Modern Gradients.
- UX: Use Tailwind CSS for all styling. Ensure high-end professional look.`;

export interface GenerationResult {
  files?: Record<string, string>;
  answer: string;
  questions?: Question[];
  thought?: string;
  summary?: string;
}

export class GeminiService {
  async generateWebsite(
    prompt: string, 
    currentFiles: Record<string, string> = {}, 
    history: ChatMessage[] = [],
    image?: { data: string; mimeType: string },
    usePro: boolean = false,
    projectConfig?: any 
  ): Promise<GenerationResult> {
    const key = process.env.API_KEY;
    
    if (!key || key === "undefined") {
      throw new Error("API_KEY not found in environment.");
    }

    const ai = new GoogleGenAI({ apiKey: key });
    const modelName = usePro ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    const supabaseContext = projectConfig?.supabase_url ? 
      `DATABASE BRIDGE ACTIVE: 
       URL: ${projectConfig.supabase_url}
       KEY: ${projectConfig.supabase_key}` : 
      "DATABASE BRIDGE: Offline. Only generate standalone logic.";

    const parts: any[] = [
      { text: `User Prompt: ${prompt}` },
      { text: supabaseContext },
      { text: `Current Workspace Files: ${JSON.stringify(currentFiles)}` },
      { text: `History: ${JSON.stringify(history.slice(-10))}` }
    ];

    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json"
        }
      });
      
      const text = response.text;
      if (!text) throw new Error("Empty response from AI.");

      try {
        const parsed = JSON.parse(text);
        return {
          answer: parsed.answer || "Processing request...",
          thought: parsed.thought || "",
          summary: parsed.summary || (prompt.slice(0, 50) + "..."),
          questions: Array.isArray(parsed.questions) ? parsed.questions : [],
          files: typeof parsed.files === 'object' ? parsed.files : undefined
        };
      } catch (e) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return { ...parsed, summary: parsed.summary || (prompt.slice(0, 50) + "...") };
        }
        throw new Error("Failed to parse AI response.");
      }
    } catch (error: any) {
      console.error(`Gemini Service Error (${modelName}):`, error);
      if (usePro && !error.message?.includes('API_KEY_INVALID')) {
        return this.generateWebsite(prompt, currentFiles, history, image, false, projectConfig);
      }
      throw error;
    }
  }
}
