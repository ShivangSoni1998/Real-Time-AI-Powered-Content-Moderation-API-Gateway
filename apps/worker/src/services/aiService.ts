import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const classifyContent = async (content: string): Promise<{ status: 'APPROVED' | 'FLAGGED'; reason?: string; confidence: number }> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
      Analyze the following content for moderation. 
      Classify it as either "APPROVED" (safe) or "FLAGGED" (unsafe, contains hate speech, violence, explicit content, or harassment).
      Provide a confidence score between 0 and 1.
      If FLAGGED, provide a short reason.
      
      Content: "${content}"
      
      Respond ONLY in JSON format:
      {
        "status": "APPROVED" | "FLAGGED",
        "reason": "string" | null,
        "confidence": number
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('AI Classification Error:', error);
        // Fail safe: Flag for manual review if AI fails, or Approve if you want to be lenient.
        // For safety, let's flag it with a system error reason.
        return {
            status: 'FLAGGED',
            reason: 'AI Service Unavailable - Manual Review Required',
            confidence: 0
        };
    }
};
