import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateCreativeDescription = async (projectTitle: string, category: string): Promise<string> => {
  if (!ai) {
    console.warn("API Key missing");
    return "API Key not configured. Unable to generate description.";
  }

  try {
    const model = ai.models;
    const prompt = `Write a short, professional product design description (max 60 words) for a portfolio project titled "${projectTitle}" in the category of "${category}". The tone should be clean, objective, and user-centric, focusing on problem-solving and usability.`;
    
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Unable to retrieve description at this time.";
  }
};

export const enhanceBio = async (currentBio: string): Promise<string> => {
   if (!ai) {
    return "API Key missing.";
  }
  try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Rewrite the following bio to be more professional, concise, and impactful suitable for a senior product designer: "${currentBio}"`
     });
     return response.text.trim();
  } catch (error) {
      console.error(error);
      return currentBio;
  }
}