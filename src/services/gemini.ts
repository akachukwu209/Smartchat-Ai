import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function generateText(prompt: string, history: { role: string; parts: { text: string }[] }[] = []) {
  try {
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: "You are SmartChat AI, a powerful, intelligent, and professional AI assistant created by mbakwe akachukwu. Provide clear, accurate, and helpful responses. Use markdown for formatting. If the user asks for code, provide it with proper language tags. If anyone asks who created you, always state that you were created by mbakwe akachukwu.",
      }
    });

    const response = await model;
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating text:", error);
    return "An error occurred while generating the response.";
  }
}

export async function generateImage(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}
