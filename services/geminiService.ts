import { GoogleGenAI } from "@google/genai";
import { Scene } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSceneContent = async (
  prompt: string, 
  currentScene: Scene
): Promise<Partial<Scene> | null> => {
  try {
    // Context helper
    const existingDialogue = currentScene.script.map(d => `${d.id} [${d.speaker}]: ${d.text}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a creative writer helper for a visual novel engine.
        Based on the user's request: "${prompt}", generate or update the dialogue script and choices for the current scene.
        
        Current Scene Context:
        ${existingDialogue}
        
        Return ONLY a JSON object with the following fields (all optional, only return what makes sense to change):
        {
          "script": [
            { 
              "id": "optional_id", 
              "speaker": "string", 
              "text": "string",
              "choices": [ { "text": "Choice inside dialogue", "nextDialogueId": "target_id" } ],
              "nextDialogueId": "optional_auto_jump_id"
            }
          ],
          "choices": [ { "text": "End Scene Choice", "nextSceneId": "scene_id" } ]
        }
        
        Important: 
        1. "script" is an array of dialogue steps. 
        2. "choices" inside script are for branching WITHIN the scene.
        3. "choices" at root are for leaving the scene.
        
        Do not wrap in markdown code blocks. Just raw JSON.
      `,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini generation failed", error);
    return null;
  }
};