import { GoogleGenAI } from "@google/genai";
import { Scene } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateSceneContent = async (
  prompt: string, 
  currentScene: Scene
): Promise<Partial<Scene> | null> => {
  if (!ai) {
    console.warn("API Key not found");
    return null;
  }

  try {
    const model = ai.models;
    const response = await model.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a creative writer helper for a visual novel engine.
        Based on the user's request: "${prompt}", generate or update the dialogue and choices for the current scene.
        
        Current Scene Context:
        Speaker: ${currentScene.speakerName}
        Text: ${currentScene.dialogueText}
        
        Return ONLY a JSON object with the following fields (all optional, only return what makes sense to change):
        {
          "speakerName": "string",
          "dialogueText": "string",
          "choices": [ { "text": "string", "nextSceneId": "existing_scene_id_or_new_placeholder" } ]
        }
        
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