import mongoose from 'mongoose';
import { stringFormat } from 'zod/v4';

const finalReportSchema = new mongoose.Schema({
  strengths: [String],
  weaknesses: [String],
  recommendation: String,
  communicationFeedback: String,
  technicalFeedback: String,
  improvementPlan: [String],
});



const answerSchema = new mongoose.Schema({
  question: String,

  expectedAnswer: String,

  userAnswer: String,

  isLikelyCopied: {
    type: Boolean,
    default: false,
  },

  evaluation: {
    score: Number,

    feedback: String,

    strengths: [String],

    improvements: [String],
  },
});


const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },

  intention: {
    type: String,
    required: true,
  },

  expectedAnswer: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["technical", "behavioral"],
    required: true,
  },
});

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    questions: [questionSchema],

    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    answers: [answerSchema],

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    overallScore: {
      type: Number,
      default: 0,
    },

    technicalScore: {
      type: Number,
      default: 0,
    },

    behavioralScore: {
      type: Number,
      default: 0,
    },

    communicationScore: {
      type: Number,
      default: 0,
    },

    topStrengths: [String],

    topWeaknesses: [String],

    hiringRecommendation: String,

    finalReport: finalReportSchema,
  },
  {
    timestamps: true,
  }
);

export const InterviewSessionModel =
  mongoose.model(
    "InterviewSession",
    interviewSessionSchema
  );