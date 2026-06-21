import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import type { InterviewSession, Question } from '../types';


import { 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Loader2, 
  Info, 
  CheckCircle, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function InterviewSession() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [showIntention, setShowIntention] = useState(false);


  useEffect(() => {
    if (reportId) {
      startSession();
    }
  }, [reportId]);

  const startSession = async () => {
    try {
      setLoading(true);
      const sessionResponse = await sessionAPI.startSession(reportId!);
      
      const sessionData = {
        _id: sessionResponse.data.sessionId,
        questions: [sessionResponse.data.firstQuestion],
        currentQuestionIndex: 0,
        totalQuestions: sessionResponse.data.totalQuestions,
      };
      setSession(sessionData as any);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !session) return;

    try {
      setSubmitting(true);
      const response = await sessionAPI.submitAnswer(session._id, answer);
      
      setEvaluation(response.data.evaluation);
      setAnswer('');
      setShowIntention(false); // Reset intention help toggle
      
      if (response.data.completed) {
        setCompleted(true);
        setTimeout(() => {
          navigate(`/results/${session._id}`);
        }, 2500);
      } else {
        if (response.data.nextQuestion) {
          setSession((prev: any) => {
            if (!prev) return null;
            const newIndex = prev.currentQuestionIndex + 1;
            return {
              ...prev,
              questions: [...prev.questions, response.data.nextQuestion],
              currentQuestionIndex: newIndex,
            };
          });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentQuestion = (): Question | null => {
    if (!session || !session.questions) return null;
    if (session.currentQuestionIndex < session.questions.length) {
      return session.questions[session.currentQuestionIndex];
    }
    return null;
  };

  const currentQuestion = getCurrentQuestion();
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const charCount = answer.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Spinning up AI interview panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm px-6 py-4 rounded-xl max-w-md backdrop-blur-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-teal-400 mx-auto mb-4" />
          <p className="text-white text-lg font-bold">Interview Completed!</p>
          <p className="text-xs text-slate-500 mt-1">Calculating final metrics...</p>
        </div>
      </div>
    );
  }

  const currentIdx = session!.currentQuestionIndex;
  const totalQs = (session as any).totalQuestions || session!.questions.length;
  const progressionPct = ((currentIdx + 1) / totalQs) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-xl border-b border-slate-900">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex items-center justify-between h-16">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Quit Session</span>
          </button>
          
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
            Question {currentIdx + 1} of {totalQs}
          </div>
        </div>
      </header>

      {/* Main Focus Content */}
      <main className="max-w-3xl mx-auto w-full px-4 py-8 flex-1 flex flex-col gap-6 relative z-10">
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-900">
          <div
            className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full rounded-full transition-all duration-300 shadow-md shadow-teal-500/20"
            style={{ width: `${progressionPct}%` }}
          />
        </div>

        {/* Question Panel */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 relative">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
              currentQuestion.type === 'technical' 
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
            }`}>
              {currentQuestion.type} question
            </span>

            <button
              onClick={() => setShowIntention(!showIntention)}
              className="text-xs text-slate-400 hover:text-teal-400 flex items-center gap-1.5 transition-colors font-medium"
            >
              <Info className="h-3.5 w-3.5" />
              <span>{showIntention ? 'Hide Intent' : 'Check Intent'}</span>
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-white leading-relaxed">
            "{currentQuestion.question}"
          </h2>

          {/* Intention helper block */}
          {showIntention && (
            <div className="mt-4 p-4 bg-slate-950/40 border border-slate-900 rounded-xl text-xs text-slate-400 flex items-start gap-2.5">
              <HelpCircle className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-300">Intention:</strong> {currentQuestion.intention}
              </p>
            </div>
          )}
        </div>

        {/* Evaluation Output (Appears if evaluation is present for the previous step) */}
        {evaluation && (
          <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-base">
                {evaluation.score}/10
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Latest Answer Evaluated</h4>
                <p className="text-xs text-slate-500">AI Scoring Feedback</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/20 border border-slate-950 p-4 rounded-xl">
              {evaluation.feedback}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" /> Strengths
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {evaluation.strengths.map((str: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400/80 mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.improvements && evaluation.improvements.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" /> Improvements
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {evaluation.improvements.map((imp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400/80 mt-0.5">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text Input Block */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col gap-4 relative">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Answer</span>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 text-sm resize-none transition-all"
            placeholder="Type your response... Tip: Be structured, outline steps, and provide code context if requested."
            disabled={submitting || completed}
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>{wordCount} words</span>
            <span>{charCount} / 2500 chars</span>
          </div>
        </div>

        {/* CTA Buttons */}
        {!completed ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!answer.trim() || submitting}
            className="w-full py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold rounded-xl hover:from-teal-300 hover:to-cyan-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-teal-500/10 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>AI Panel Evaluating Response...</span>
              </>
            ) : (
              <>
                <Send className="h-4.5 w-4.5" />
                <span>Submit Response</span>
              </>
            )}
          </button>
        ) : (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="h-10 w-10 text-teal-400 animate-bounce mx-auto" />
            <p className="text-sm font-bold text-white">Interview session complete!</p>
            <p className="text-xs text-slate-400">Loading final evaluation metrics report...</p>
          </div>
        )}

      </main>
    </div>
  );
}
