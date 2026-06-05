export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface TechnicalQuestion {
  question: string;
  intention: string;
  answer: string;
}

export interface BehavioralQuestion {
  question: string;
  intention: string;
  answer: string;
}

export interface SkillGap {
  skill: string;
  severity: 'low' | 'medium' | 'high';
}

export interface PreparationTask {
  day: number;
  focus: string;
  tasks: string[];
}

export interface InterviewReport {
  _id: string;
  userId: string;
  jobDescription: string;
  resume: string;
  selfDescription: string;
  matchScore: number;
  technicalQuestions: TechnicalQuestion[];
  behavioralQuestions: BehavioralQuestion[];
  skillGaps: SkillGap[];
  preparationPlan: PreparationTask[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  question: string;
  intention: string;
  expectedAnswer: string;
  type: 'technical' | 'behavioral';
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface Answer {
  question: string;
  expectedAnswer: string;
  userAnswer: string;
  evaluation: AnswerEvaluation;
}

export interface FinalReport {
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  communicationFeedback: string;
  technicalFeedback: string;
  improvementPlan: string[];
}

export interface InterviewSession {
  _id: string;
  userId: string;
  reportId: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];
  status: 'active' | 'completed';
  overallScore: number;
  finalReport?: FinalReport;
  createdAt: string;
  updatedAt: string;
}
