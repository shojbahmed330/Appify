
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Question } from "../types";

const SYSTEM_PROMPT = `You are OneClick Studio, a World-Class Senior Lead Android Hybrid Developer & UI/UX Designer.
Your absolute priority is to ensure that EVERY button, menu, and UI element you generate is 100% FUNCTIONAL and CLICKABLE in the preview.

### AMBIGUITY PROTOCOL (CRITICAL):
- If a user's request is broad (e.g., "make a calculator", "build a login page", "create a weather app"), you MUST NOT generate code immediately.
- Instead, you MUST use the "questions" array to provide 3-4 specific questions to narrow down the requirements (e.g., features, color theme, complexity).
- Only proceed to generate files once the user provides details or explicitly says "just build it".

### CRITICAL MOBILE RESPONSIVENESS RULES:
- **SAFE AREAS**: Use 'pt-[env(safe-area-inset-top)]' or ensure layouts don't collide with the top status bar (network, time).
- **VIEWPORT HEIGHT**: Always use 'h-[100dvh]' or 'min-h-[100dvh]' for main containers to ensure they fit exactly within any mobile screen.
- **NO VERTICAL OVERFLOW**: Ensure calculators, login forms, and tools fit within the screen without scrolling unless necessary.
- **BENTO & FLEX**: Use Flexbox ('flex-col') and 'justify-between' to distribute UI elements evenly across the screen.

### CRITICAL FUNCTIONALITY RULES:
- **NO PLACEHOLDERS**: Never write "// logic here" or "alert('clicked')". Write the actual production logic.
- **CLICKABLE INTERFACES**: Every button or menu item MUST have an event listener.
- **GLOBAL SCOPE**: Define functions in the global scope (window.functionName).
- **USER FEEDBACK**: Implement haptic feedback simulation (window.NativeBridge.vibrate).

### RESPONSE JSON SCHEMA:
{
  "answer": "Professional explanation of what you are doing or asking.",
  "thought": "Internal reasoning.",
  "questions": [
    {
      "id": "unique_id",
      "text": "The question text?",
      "type": "single",
      "options": [{"id": "opt1", "label": "Option 1", "subLabel": "Details"}]
    }
  ],
  "files": { "index.html": "..." }
}

### DESIGN PHILOSOPHY:
- Visuals: Glassmorphism, Bento Box, Soft Shadows.
- Mobile UX: Large touch targets (min 44x44px).`;

export interface GenerationResult {
  files?: Record<string, string>;
  answer: string;
  questions?: Question[];
  thought?: string;
}

export class GeminiService {
  async generateWebsite(
    prompt: string, 
    currentFiles: Record<string, string> = {}, 
    history: ChatMessage[] = [],
    image?: { data: string; mimeType: string },
    usePro: boolean = false
  ): Promise<GenerationResult> {
    const key = process.env.API_KEY;
    
    if (!key || key === "undefined") {
      throw new Error("API_KEY not found in environment. Please redeploy the app on Vercel after setting the environment variable.");
    }

    const ai = new GoogleGenAI({ apiKey: key });
    const modelName = usePro ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    const parts: any[] = [
      { text: `User Prompt: ${prompt}` },
      { text: `Current Modular Files: ${JSON.stringify(currentFiles)}` },
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
        // Safety: Ensure questions and files are handled correctly even if empty
        return {
          answer: parsed.answer || "Processing request...",
          thought: parsed.thought || "",
          questions: Array.isArray(parsed.questions) ? parsed.questions : [],
          files: typeof parsed.files === 'object' ? parsed.files : undefined
        };
      } catch (e) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error("Failed to parse AI response as JSON.");
      }
    } catch (error: any) {
      console.error(`Gemini Service Error (${modelName}):`, error);
      if (usePro && !error.message?.includes('API_KEY_INVALID')) {
        return this.generateWebsite(prompt, currentFiles, history, image, false);
      }
      throw error;
    }
  }
}
