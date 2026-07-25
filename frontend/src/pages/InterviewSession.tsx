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
  HelpCircle,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function InterviewSessionPage() {
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



  // Active elapsed timer
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (reportId) {
      startSession();
    }
  }, [reportId]);

  // Elapsed timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (!completed && !loading) {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, completed]);



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
      setShowIntention(false);
      
      if (response.data.completed) {
        setCompleted(true);
        setTimeout(() => {
          navigate(`/results/${session._id}`);
        }, 3000);
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

  // Close evaluation and move to next question state
  const handleProceed = () => {
    setEvaluation(null);
  };

  const getCurrentQuestion = (): Question | null => {
    if (!session || !session.questions) return null;
    if (session.currentQuestionIndex < session.questions.length) {
      return session.questions[session.currentQuestionIndex];
    }
    return null;
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = getCurrentQuestion();
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const charCount = answer.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center bg-grid-pattern relative">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Spinning up AI interview workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center px-4 bg-grid-pattern relative">
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs px-6 py-4 rounded-2xl max-w-md backdrop-blur-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center px-4 bg-grid-pattern relative">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
          <p className="text-white text-lg font-bold">Interview Completed!</p>
          <p className="text-xs text-slate-500">Calculating final capability scorecard...</p>
        </div>
      </div>
    );
  }

  const currentIdx = session!.currentQuestionIndex;
  const totalQs = (session as any).totalQuestions || session!.questions.length;

  return (
    <div className="min-h-screen bg-[#05070c] text-slate-100 flex flex-col overflow-hidden bg-grid-pattern relative">
      
      {/* Distraction-Free Header */}
      <header className="sticky top-0 z-40 bg-[#080a10]/85 backdrop-blur-xl border-b border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Quit Workspace</span>
          </button>
          
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#0b0e15] border border-slate-850 text-slate-350">
            Interview Question {currentIdx + 1} of {totalQs}
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 bg-[#0b0e15] border border-slate-850 px-3 py-1 rounded-full">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>{formatTimer(elapsedTime)}</span>
          </div>
        </div>
      </header>

      {/* Main Split Panels */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch overflow-y-auto">
        
        {/* Left Side: Question Context Pane (4 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          
          {/* Progress Tracker list */}
          <div className="custom-glass rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450">Assessment Progress</h3>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalQs }).map((_, idx) => {
                const isActive = idx === currentIdx;
                const isPassed = idx < currentIdx;
                return (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full flex-grow transition-all duration-300 ${
                      isPassed ? 'bg-emerald-500' :
                      isActive ? 'bg-indigo-650 animate-pulse' :
                      'bg-slate-850 border border-slate-800'
                    }`}
                  />
                );
              })}
            </div>
            
            {/* Steps Timeline view */}
            <div className="space-y-3 pt-2">
              {Array.from({ length: totalQs }).map((_, idx) => {
                const isActive = idx === currentIdx;
                const isPassed = idx < currentIdx;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      isPassed ? 'bg-emerald-500/20 text-emerald-450 border border-emerald-500/30' :
                      isActive ? 'bg-indigo-500 text-white animate-pulse' :
                      'bg-slate-900 text-slate-600 border border-slate-850'
                    }`}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span className={`text-xs font-semibold ${
                      isActive ? 'text-indigo-400 font-bold' : 'text-slate-500'
                    }`}>
                      Question {idx + 1} {isActive ? '(Active)' : isPassed ? '(Answered)' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question Display Card */}
          <div className="custom-glass rounded-3xl p-6 space-y-4 relative flex-grow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                  currentQuestion.type === 'technical' 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' 
                    : 'bg-violet-500/10 text-violet-400 border border-violet-500/25'
                }`}>
                  {currentQuestion.type} question
                </span>

                <button
                  onClick={() => setShowIntention(!showIntention)}
                  className="text-[10px] text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors font-bold uppercase tracking-wider"
                >
                  <Info className="h-3 w-3" />
                  <span>{showIntention ? 'Hide Specs' : 'Read Intent'}</span>
                </button>
              </div>

              <h2 className="text-lg font-bold text-white leading-relaxed font-sans">
                "{currentQuestion.question}"
              </h2>

              {showIntention && (
                <div className="p-4 bg-slate-950/45 border border-slate-900 rounded-xl text-xs text-slate-400 flex items-start gap-2.5 animate-fadeIn">
                  <HelpCircle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-slate-200">Intent:</strong> {currentQuestion.intention}
                  </p>
                </div>
              )}
            </div>

            {/* AI Coach Hint Panel */}
            <div className="mt-8 pt-4 border-t border-slate-900/60 text-[10px] text-slate-500 leading-relaxed flex items-start gap-2 bg-[#090b12]/30 p-3.5 rounded-xl border border-slate-900">
              <Sparkles className="h-4 w-4 text-indigo-400 flex-shrink-0" />
              <span>
                <strong>Coach hint:</strong> Answer using structural methodologies. Address technical limitations, outline stack capabilities, and mention performance trade-offs.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Answer Input & Workspace (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Main workspace Textarea */}
          <div className="custom-glass rounded-3xl p-6 flex flex-col flex-1 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <span className="text-xs font-bold text-slate-350 uppercase tracking-wider">Workspace Draft</span>
              

            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={8}
              className="w-full flex-grow p-4 bg-slate-950/40 border border-slate-900 hover:border-slate-850 focus:border-indigo-500/50 rounded-2xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-sm font-mono resize-none transition-all leading-relaxed"
              placeholder="Draft your solution here. Focus on structural articulation and depth. Use markdown bullets or code syntax if required."
              disabled={submitting || completed}
            />

            <div className="flex items-center justify-between text-[11px] text-slate-505">
              <span>{wordCount} Words written</span>
              <span className={charCount > 2000 ? 'text-amber-500' : ''}>
                {charCount} / 2500 Characters
              </span>
            </div>
          </div>

          {/* Action trigger button */}
          {!evaluation ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || submitting}
              className="w-full py-3.5 rounded-xl bg-white text-slate-950 font-extrabold hover:bg-slate-100 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>AI Panel Reviewing Response...</span>
                </>
              ) : (
                <>
                  <Send className="h-4.5 w-4.5" />
                  <span>Commit Response</span>
                </>
              )}
            </button>
          ) : (
            /* Next Question Proceed Control */
            <button
              onClick={handleProceed}
              className="w-full py-3.5 rounded-xl bg-indigo-650 text-white font-extrabold hover:bg-indigo-600 active:scale-98 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <span>Proceed to Next Phase</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* Evaluation overlay panel (Appears if evaluation is present for current question) */}
          {evaluation && (
            <div className="custom-glass rounded-3xl p-6 space-y-5 animate-slideUp">
              <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 font-extrabold text-sm shadow-sm">
                  {evaluation.score}/10
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">AI Evaluation Scorecard</h4>
                  <p className="text-[10px] text-slate-500">Real-time modular capabilities report</p>
                </div>
              </div>

              <div className="space-y-1">
                <h5 className="text-xs font-bold text-slate-350 uppercase tracking-wider">Modular Feedback</h5>
                <p className="text-xs text-slate-400 leading-relaxed bg-[#0b0e15]/50 p-3 rounded-xl border border-slate-900/60">
                  {evaluation.feedback}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {evaluation.strengths && evaluation.strengths.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-emerald-450 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Core Strengths
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-450">
                      {evaluation.strengths.map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400/80 mt-0.5">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {evaluation.improvements && evaluation.improvements.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-450 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Capabilities Gaps
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-450">
                      {evaluation.improvements.map((imp: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
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
        </div>
      </div>
    </div>
  );
}
