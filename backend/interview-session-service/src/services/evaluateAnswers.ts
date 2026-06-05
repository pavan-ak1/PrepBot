import { GoogleGenAI } from "@google/genai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { interviewEvaluationSchema, InterviewEvaluationType } from "./interviewEvaluationSchema";



const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

interface InterviewAnswer {
  question: string;

  expectedAnswer: string;

  candidateAnswer: string;

  questionType: string;

  isLikelyCopied: boolean;
}

export const evaluateInterview =
  async (
    answers: InterviewAnswer[]
  ): Promise<InterviewEvaluationType> => {
    const prompt = `
You are a senior software engineering interviewer.

Evaluate the ENTIRE interview.

For every answer:

- Score from 0 to 10
- Give detailed feedback
- Mention strengths
- Mention improvements

Also generate:

- overallScore
- technicalScore
- behavioralScore
- communicationScore
- topStrengths
- topWeaknesses
- hiringRecommendation
- finalReport

Important:

If isLikelyCopied=true, penalize the answer heavily.

Interview Data:

${JSON.stringify(answers, null, 2)}
`;

    try {
      const response =
        await ai.models.generateContent({
          model: "gemini-2.5-flash",

          contents: prompt,

          config: {
            responseMimeType:
              "application/json",

            responseSchema:
              zodToJsonSchema(
                interviewEvaluationSchema
              ),
          },
        });

      const text = response.text;

      if (!text) {
        throw new Error(
          "Empty Gemini response"
        );
      }

      const parsed =
        JSON.parse(text);

      return interviewEvaluationSchema.parse(
        parsed
      );

    } catch (error) {

      console.error(
        "Interview evaluation failed:",
        error
      );

      throw new Error(
        "Failed to evaluate interview"
      );
    }
  };