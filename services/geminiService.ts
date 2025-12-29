
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export const getMoreInformation = async (prompt: string): Promise<string> => {
  // FIXED: Strictly following guidelines for initializing GoogleGenAI with a named parameter and direct process.env.API_KEY usage.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    // FIXED: Using .text property directly as per GenerateContentResponse guidelines.
    return response.text || "Brak dodatkowych informacji. Zapytaj lekarza na miejscu.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Wystąpił błąd podczas pobierania informacji. Spróbuj ponownie później.";
  }
};
