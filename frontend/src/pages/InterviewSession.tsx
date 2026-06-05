import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import type { InterviewSession, Question } from '../types';
import { ArrowLeft, Send, CheckCircle, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    if (reportId) {
      startSession();
    }
  }, [reportId]);

  const startSession = async () => {
    try {
      setLoading(true);
      const sessionResponse = await sessionAPI.startSession(reportId!);
      
      console.log('Start session response:', sessionResponse.data);
      
      // Transform backend response to frontend expected structure
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
      
      console.log('Submit answer response:', response.data);
      console.log('Current index:', session.currentQuestionIndex);
      console.log('Total questions:', (session as any).totalQuestions);
      
      setEvaluation(response.data.evaluation);
      setAnswer('');
      
      if (response.data.completed) {
        console.log('Interview completed');
        setCompleted(true);
        setTimeout(() => {
          navigate(`/results/${session._id}`);
        }, 2000);
      } else {
        // Add next question to the array
        if (response.data.nextQuestion) {
          // Update session with next question and increment index
          setSession((prev: any) => {
            if (!prev) return null;
            const newIndex = prev.currentQuestionIndex + 1;
            console.log('Moving to index:', newIndex);
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
    
    console.log('Getting question at index:', session.currentQuestionIndex);
    console.log('Total questions available:', session.questions.length);
    
    // Access question by index from the fully populated array
    if (session.currentQuestionIndex < session.questions.length) {
      return session.questions[session.currentQuestionIndex];
    }
    
    return null;
  };

  const currentQuestion = getCurrentQuestion();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading interview session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-300 px-6 py-4 rounded-lg max-w-md backdrop-blur-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <p className="text-white">Interview completed!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Exit</span>
            </button>
            <div className="text-slate-300">
              Question {session!.currentQuestionIndex + 1} of {(session as any).totalQuestions || session!.questions.length}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all"
              style={{
                width: `${((session!.currentQuestionIndex + 1) / ((session as any).totalQuestions || session!.questions.length)) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentQuestion.type === 'technical' 
                ? 'bg-teal-500/20 text-teal-300' 
                : 'bg-violet-500/20 text-violet-300'
            }`}>
              {currentQuestion.type.charAt(0).toUpperCase() + currentQuestion.type.slice(1)}
            </span>
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-4">{currentQuestion.question}</h2>
          
          <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-slate-400">
              <span className="font-medium text-slate-300">Intention:</span> {currentQuestion.intention}
            </p>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 resize-none backdrop-blur-sm transition-all"
            placeholder="Type your answer here..."
            disabled={submitting || completed}
          />
        </div>

        {/* Evaluation Feedback */}
        {evaluation && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">{evaluation.score}/10</span>
              <span className="text-slate-400">Score</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">Feedback</h4>
                <p className="text-slate-300">{evaluation.feedback}</p>
              </div>
              
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div>
                  <h4 className="font-medium text-emerald-400 mb-2">Strengths</h4>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {evaluation.strengths.map((strength: string, idx: number) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {evaluation.improvements && evaluation.improvements.length > 0 && (
                <div>
                  <h4 className="font-medium text-amber-400 mb-2">Areas for Improvement</h4>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {evaluation.improvements.map((improvement: string, idx: number) => (
                      <li key={idx}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!completed && (
          <button
            onClick={handleSubmitAnswer}
            disabled={!answer.trim() || submitting}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-teal-500/20 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Answer
              </>
            )}
          </button>
        )}

        {completed && (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-white text-lg">Interview completed! Redirecting to results...</p>
          </div>
        )}
      </main>
    </div>
  );
}
