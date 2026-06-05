import { z } from "zod";

export const evaluationSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "Overall score for the candidate answer out of 10"
    ),

  feedback: z
    .string()
    .describe(
      "Detailed interview feedback for the candidate answer"
    ),

  strengths: z
    .array(z.string())
    .describe(
      "Strong points in the candidate answer"
    ),

  improvements: z
    .array(z.string())
    .describe(
      "Areas where the answer can be improved"
    ),
});

export type EvaluationType =
  z.infer<typeof evaluationSchema>;