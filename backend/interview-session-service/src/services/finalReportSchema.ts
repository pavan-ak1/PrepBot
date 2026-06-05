import {z} from "zod";

export const finalReportSchema = z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    recommendation: z.string(),
    communicationFeedback: z.string(),
    technicalFeedback: z.string(),
    improvementPlan: z.array(z.string()),
});

export type FinalReport =
  z.infer<typeof finalReportSchema>;