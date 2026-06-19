import { Request, Response } from "express";
import { fetchInterviewReport } from "../services/fetchReport.js";
import { InterviewSessionModel } from "../models/interviewSessionModel.js";
import { evaluateInterview } from "../services/evaluateAnswers.js";
import { calculateSimilarity } from "../utils/similarity.js";

export const startInterviewSession = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.body;

    if (!reportId) {
      return res.status(400).json({
        message: "Report Id is required",
        success: false,
      });
    }

    // Check if a session already exists for this report and user
    const existingSession = await InterviewSessionModel.findOne({
      userId: req.user?.id,
      reportId,
    });

    if (existingSession) {
      if (existingSession.status === "completed") {
        return res.status(400).json({
          message: "You have already completed the interview session for this report.",
          success: false,
        });
      }

      // If session is active, reset it to allow starting fresh (handles page refreshes gracefully)
      existingSession.currentQuestionIndex = 0;
      existingSession.answers = [] as any;
      await existingSession.save();

      return res.status(201).json({
        success: true,
        sessionId: existingSession._id,
        totalQuestions: existingSession.questions.length,
        firstQuestion: {
          question: existingSession.questions[0].question,
          type: existingSession.questions[0].type,
          intention: existingSession.questions[0].intention,
        },
      });
    }

    const report = await fetchInterviewReport(
      reportId,
      req.headers.authorization!,
    );

    const technicalQuestions = report.technicalQuestions.map((q: any) => ({
      question: q.question,
      intention: q.intention,
      expectedAnswer: q.answer,
      type: "technical",
    }));

    const behavioralQuestions = report.behavioralQuestions.map((q: any) => ({
      question: q.question,
      intention: q.intention,
      expectedAnswer: q.answer,
      type: "behavioral",
    }));

    const questions = [...technicalQuestions, ...behavioralQuestions];

    const session = await InterviewSessionModel.create({
      userId: req.user?.id,
      reportId,
      questions,
    });

    res.status(201).json({
      success: true,
      sessionId: session._id,
      totalQuestions: questions.length,
      firstQuestion: {
        question: questions[0].question,
        type: questions[0].type,
        intention: questions[0].intention,
      },
    });
  } catch (error: any) {
    console.error("Error in startInterviewSession:", error);
    res.status(error.response?.status || 500).json({
      message: error.message || "Failed to start interview session",
      success: false,
    });
  }
};



export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({
        message: "sessionId and answer are required",
        success: false,
      });
    }

    const session = await InterviewSessionModel.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Interview session not found",
        success: false,
      });
    }

    if (session.status === "completed") {
      return res.status(400).json({
        message: "Interview already completed",
        success: false,
      });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];

    if (!currentQuestion) {
      return res.status(400).json({
        message: "No more questions left",
        success: false,
      });
    }

    const similarity = calculateSimilarity(currentQuestion.expectedAnswer, answer);
    const isLikelyCopied = similarity > 0.9;

    session.answers.push({
      question: currentQuestion.question,
      expectedAnswer: currentQuestion.expectedAnswer,
      userAnswer: answer,
      isLikelyCopied,
    });

    session.currentQuestionIndex += 1;

    const isCompleted = session.currentQuestionIndex >= session.questions.length;

    console.log('Session state after answer:', {
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.questions.length,
      isCompleted,
      sessionId: session._id
    });

    if (isCompleted) {
      session.status = "completed";

      // Prepare answers for evaluation
      const answersForEvaluation = session.answers.map((answer, index) => ({
        question: answer.question || "",
        expectedAnswer: answer.expectedAnswer || "",
        candidateAnswer: answer.userAnswer || "",
        questionType: session.questions[index].type,
        isLikelyCopied: answer.isLikelyCopied || false,
      }));

      // Call evaluateInterview once with all answers
      const evaluationResult = await evaluateInterview(answersForEvaluation);

      // Map evaluations back to session answers
      session.answers.forEach((answer, index) => {
        answer.evaluation = evaluationResult.answers[index];
      });

      // Store overall scores from Gemini
      session.overallScore = evaluationResult.overallScore;
      session.technicalScore = evaluationResult.technicalScore;
      session.behavioralScore = evaluationResult.behavioralScore;
      session.communicationScore = evaluationResult.communicationScore;
      session.topStrengths = evaluationResult.topStrengths;
      session.topWeaknesses = evaluationResult.topWeaknesses;
      session.hiringRecommendation = evaluationResult.hiringRecommendation;

      // Store final report
      session.finalReport = {
        strengths: evaluationResult.topStrengths,
        weaknesses: evaluationResult.topWeaknesses,
        recommendation: evaluationResult.hiringRecommendation,
        communicationFeedback: evaluationResult.finalReport,
        technicalFeedback: evaluationResult.finalReport,
        improvementPlan: evaluationResult.topWeaknesses,
      };
    }

    await session.save();

    const nextQuestion = !isCompleted
      ? session.questions[session.currentQuestionIndex]
      : null;

    res.status(200).json({
      success: true,
      evaluation: isCompleted ? session.answers[session.answers.length - 1].evaluation : null,
      completed: isCompleted,
      overallScore: isCompleted ? session.overallScore : null,
      nextQuestion: nextQuestion
        ? {
            question: nextQuestion.question,
            type: nextQuestion.type,
            intention: nextQuestion.intention,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Error in submitAnswer:", error);
    res.status(500).json({
      message: error.message || "Failed to submit answer",
      success: false,
    });
  }
};

export const getInterviewResults = async (req: Request, res: Response) => {
  try {
    const session = await InterviewSessionModel.findOne({
      _id: req.params.id,
      userId: req.user?.id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Interview not completed yet",
      });
    }

    res.status(200).json({
      success: true,
      overallScore: session.overallScore,
      technicalScore: session.technicalScore,
      behavioralScore: session.behavioralScore,
      communicationScore: session.communicationScore,
      topStrengths: session.topStrengths,
      topWeaknesses: session.topWeaknesses,
      hiringRecommendation: session.hiringRecommendation,
      totalQuestions: session.questions.length,
      answers: session.answers,
      finalReport: session.finalReport,
    });
  } catch (error: any) {
    console.error("Error in getInterviewResults:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch interview results",
      success: false,
    });
  }
};

export const getSessionByReportId = async (req: Request, res: Response) => {
  try {
    const session = await InterviewSessionModel.findOne({
      userId: req.user?.id,
      reportId: req.params.reportId,
    });

    res.status(200).json({
      success: true,
      session: session
        ? {
            _id: session._id,
            status: session.status,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch session status",
      success: false,
    });
  }
};