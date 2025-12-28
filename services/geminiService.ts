import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCreativeTeamName = async (members: string[]): Promise<string> => {
  try {
    const prompt = `Generate a short, fun, and creative team name for a group consisting of these people: ${members.join(', ')}. Return ONLY the team name, nothing else.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text?.trim() || `Team ${members[0]}`;
  } catch (error) {
    console.error("Error generating team name:", error);
    return "Awesome Team";
  }
};

export const generateCongratulation = async (winnerName: string, prize: string): Promise<string> => {
   try {
    const prompt = `Write a very short (one sentence), enthusiastic congratulatory message for ${winnerName} who just won the ${prize}.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text?.trim() || `Congratulations ${winnerName}!`;
  } catch (error) {
    console.error("Error generating congra message:", error);
    return `Congrats ${winnerName}!`;
  }
}