import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import type { InterviewSession } from '../types';
import { ArrowLeft, TrendingUp, Award, BookOpen, MessageSquare, CheckCircle } from 'lucide-react';

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      fetchResults();
    }
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await sessionAPI.getResults(sessionId!);
      setSession(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading results...</p>
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

  if (!session) {
    return null;
  }

  const finalReport = session.finalReport;
  const scorePercentage = (session.overallScore / 10) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-xl font-semibold text-white">Interview Results</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Overview */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-8 mb-8 shadow-lg shadow-teal-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Overall Score</h2>
              <p className="text-teal-100">Your interview performance summary</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-white">{session.overallScore.toFixed(1)}</div>
              <div className="text-teal-100 text-sm">out of 10</div>
            </div>
          </div>
          <div className="mt-6 bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendation */}
          {finalReport?.recommendation && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="h-6 w-6 text-amber-400" />
                <h3 className="text-xl font-semibold text-white">Recommendation</h3>
              </div>
              <p className="text-slate-300">{finalReport.recommendation}</p>
            </div>
          )}

          {/* Strengths */}
          {finalReport?.strengths && finalReport.strengths.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-semibold text-white">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {finalReport.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-300">
                    <span className="text-emerald-400 mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {finalReport?.weaknesses && finalReport.weaknesses.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="h-6 w-6 text-rose-400" />
                <h3 className="text-xl font-semibold text-white">Areas to Improve</h3>
              </div>
              <ul className="space-y-2">
                {finalReport.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-300">
                    <span className="text-rose-400 mt-1">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Communication Feedback */}
          {finalReport?.communicationFeedback && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className="h-6 w-6 text-teal-400" />
                <h3 className="text-xl font-semibold text-white">Communication Feedback</h3>
              </div>
              <p className="text-slate-300">{finalReport.communicationFeedback}</p>
            </div>
          )}

          {/* Technical Feedback */}
          {finalReport?.technicalFeedback && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="h-6 w-6 text-violet-400" />
                <h3 className="text-xl font-semibold text-white">Technical Feedback</h3>
              </div>
              <p className="text-slate-300">{finalReport.technicalFeedback}</p>
            </div>
          )}

          {/* Improvement Plan */}
          {finalReport?.improvementPlan && finalReport.improvementPlan.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 lg:col-span-2 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="h-6 w-6 text-teal-400" />
                <h3 className="text-xl font-semibold text-white">Personalized Improvement Plan</h3>
              </div>
              <div className="space-y-3">
                {finalReport.improvementPlan.map((item, idx) => (
                  <div key={idx} className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/generate-report')}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg shadow-lg shadow-teal-500/20 transition-all"
          >
            Generate New Report
          </button>
        </div>
      </main>
    </div>
  );
}
