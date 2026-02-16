
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Question } from "../types";

const SYSTEM_PROMPT = `You are OneClick Studio, a World-Class Senior Lead Android Hybrid Developer & UI/UX Designer.
Your absolute priority is to ensure that EVERY button, menu, and UI element you generate is 100% FUNCTIONAL and CLICKABLE in the preview.

### DUAL-OUTPUT WORKSPACE PROTOCOL:
- organize code into "app/" (Mobile Client) and "admin/" (Web Management).
- Entry points: "app/index.html" and "admin/index.html".

### DATABASE BRIDGE (SUPABASE REAL-TIME) PROTOCOL:
- If Supabase credentials are provided in context, you MUST use them to create a Real-time Bridge between App and Admin.
- USE THIS CDN: "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
- **App/ Logic**: Use 'supabase.channel("table_db_changes").on("postgres_changes", ...).subscribe()' for instant UI updates.
- **Admin/ Logic**: Create forms that use 'supabase.from(table).insert/update/delete()' to control data.
- **Schema**: Provide a SQL block in your "thought" field if you need the user to create tables, but write the JS logic assuming the tables exist.
- Shared logic: Both App and Admin should connect to the same tables (e.g., 'products', 'orders', 'settings').

### AMBIGUITY PROTOCOL:
- If a user's request is broad, use "questions" array to narrow down requirements.
- Only proceed to generate files once details are provided.

### RESPONSE JSON SCHEMA:
{
  "answer": "Professional explanation.",
  "thought": "Internal reasoning + SQL Schema if needed.",
  "summary": "1-line summary.",
  "questions": [],
  "files": { "app/index.html": "...", "admin/index.html": "..." }
}

### DESIGN PHILOSOPHY:
- Visuals: Glassmorphism, Bento Box, Modern Gradients.
- UX: Use Tailwind CSS for all styling.`;

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
    projectConfig?: any // Added for Supabase context
  ): Promise<GenerationResult> {
    const key = process.env.API_KEY;
    
    if (!key || key === "undefined") {
      throw new Error("API_KEY not found in environment.");
    }

    const ai = new GoogleGenAI({ apiKey: key });
    const modelName = usePro ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    // Injecting Supabase credentials into the prompt context if they exist
    const supabaseContext = projectConfig?.supabase_url ? 
      `DATABASE BRIDGE ACTIVE: 
       URL: ${projectConfig.supabase_url}
       KEY: ${projectConfig.supabase_key}
       Instructions: Implement Real-time sync logic using these credentials.` : 
      "DATABASE BRIDGE: Offline (User has not configured Supabase yet). Generate standalone logic.";

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
            return {
                ...parsed,
                summary: parsed.summary || (prompt.slice(0, 50) + "...")
            };
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
