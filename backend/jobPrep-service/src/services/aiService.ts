import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const llm = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_JOB_PREP,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job describe",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in the interview along with their intention and how to answer them",
    ),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe(
            "The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances",
          ),
      }),
    )
    .describe(
      "List of skill gaps in the candidate's profile along with their severity",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("The day number in the preparation plan, starting from 1"),
        focus: z
          .string()
          .describe(
            "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc.",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.",
          ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
    ),
  title: z
    .string()
    .describe(
      "The title of the job for which the interview report is generated",
    ),
});

interface input {
  resume: string;
  selfDescription: string;
  jobDescription: string;
}

export const generateResponse = async (inp: input) => {
  const prompt = `
Generate an interview report for a candidate with the following details:

Resume:
${inp.resume}

Self Description:
${inp.selfDescription}

Job Description:
${inp.jobDescription}
`;

  const maxRetries = 5;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await llm.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: zodToJsonSchema(interviewReportSchema),
        },
      });

      const text = response.text;

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      const parsed = JSON.parse(text);

      return interviewReportSchema.parse(parsed);
    } catch (err: any) {
      lastError = err;

      // Retry only on temporary overload errors
      const isRetryable =
        err?.status === 503 ||
        err?.error?.code === 503 ||
        err?.message?.includes("503") ||
        err?.message?.includes("UNAVAILABLE");

      if (isRetryable && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;

        console.log(
          `Gemini overloaded (attempt ${attempt + 1}/${maxRetries}). Retrying in ${
            delay / 1000
          } seconds...`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      console.error("Gemini error:", err);
      throw err;
    }
  }

  throw new Error(
    `Failed to generate interview report after ${maxRetries} attempts.\n${
      lastError instanceof Error ? lastError.message : "Unknown error"
    }`
  );
};