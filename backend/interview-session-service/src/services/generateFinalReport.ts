import { GoogleGenAI } from "@google/genai";

import { zodToJsonSchema } from "zod-to-json-schema";
import { finalReportSchema } from "./finalReportSchema";



const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

interface Input {
  overallScore: number;

  answers: any[];
}

export const generateFinalReport = async ({
  overallScore,
  answers,
}: Input) => {

  const prompt = `
You are a senior software engineering interviewer.

Analyze the complete interview.

Overall Score:
${overallScore}

Interview Answers:
${JSON.stringify(answers)}

Generate:

1. Candidate strengths
2. Candidate weaknesses
3. Hiring recommendation
4. Communication feedback
5. Technical feedback
6. Personalized improvement plan

Return JSON only.
`;

  const response =
    await ai.models.generateContent({
      model: "gemini-3.5-flash",

      contents: prompt,

      config: {
        responseMimeType:
          "application/json",

        responseSchema:
          zodToJsonSchema(
            finalReportSchema
          ),
      },
    });

  if (!response.text) {
    throw new Error(
      "Empty AI response"
    );
  }

  const parsed = JSON.parse(
    response.text
  );

  return finalReportSchema.parse(
    parsed
  );
};