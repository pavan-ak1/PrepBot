import { z } from "zod";

export const interviewEvaluationSchema =
  z.object({
    answers: z.array(
      z.object({
        question: z.string(),

        score: z.number().min(0).max(10),

        feedback: z.string(),

        strengths: z.array(z.string()),

        improvements: z.array(z.string()),
      })
    ),

    overallScore: z.number(),

    technicalScore: z.number(),

    behavioralScore: z.number(),

    communicationScore: z.number(),

    topStrengths: z.array(z.string()),

    topWeaknesses: z.array(z.string()),

    hiringRecommendation: z.string(),

    finalReport: z.string(),
  });

export type InterviewEvaluationType =
  z.infer<
    typeof interviewEvaluationSchema
  >;