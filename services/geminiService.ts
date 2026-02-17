
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client using the environment variable as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getMotivationalQuote(workoutName: string = "The Sovereign Soul"): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a short, powerful, and stoic motivational quote for a warrior completing an intense workout named "${workoutName}". Focus on themes of discipline, internal strength, and the "Sovereign Soul" spirit. Keep it under 20 words.`,
      config: {
        temperature: 0.8,
      },
    });
    // The text property is a getter, do not call it as a function.
    return response.text?.trim() || "The soul that suffers, conquers.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Discipline is the bridge between goals and accomplishment.";
  }
}

export async function getExerciseTip(exerciseName: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Briefly explain the benefit and proper form of "${exerciseName}" in 2-3 sentences. Make it sound encouraging but professional.`,
    });
    // The text property is a getter, do not call it as a function.
    return response.text?.trim() || "Focus on your breathing and maintain proper alignment throughout the movement.";
  } catch (error) {
    return "Stay focused and maintain consistent form.";
  }
}
