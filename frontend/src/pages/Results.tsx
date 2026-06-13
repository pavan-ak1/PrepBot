import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import type { InterviewSession } from '../types';
import { 
  ArrowLeft, 
  TrendingUp, 
  Award, 
  BookOpen, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Compiling performance feedback...</p>
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

  if (!session) {
    return null;
  }

  const finalReport = session.finalReport;
  const score = session.overallScore;

  // Radial progress calculations
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  const getPerformanceRating = (overallScore: number) => {
    if (overallScore >= 8.5) return { label: 'Ready to Interview', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    if (overallScore >= 7.0) return { label: 'Strong Candidate', color: 'bg-teal-500/10 text-teal-400 border border-teal-500/20' };
    if (overallScore >= 5.5) return { label: 'Solid Core / Practice Recommended', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
    return { label: 'Requires Preparation', color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-xl border-b border-slate-900">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 flex items-center justify-between h-16">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Back to Dashboard</span>
          </button>
          
          <div className="text-sm font-bold text-slate-300">
            Performance Scorecard
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-grow relative z-10 space-y-8">
        
        {/* Overall Score Section */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/5 rounded-full blur-2xl" />
          
          <div className="space-y-3 text-center sm:text-left flex-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="h-4 w-4" /> Assessment Finished
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Interview Performance Summary</h2>
            <p className="text-sm text-slate-400 max-w-md">
              PrepBot evaluated your technical precision, code fluency, and situational structure. Below is your tailored feedback dashboard.
            </p>
            <div className="pt-2">
              <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${getPerformanceRating(score).color}`}>
                {getPerformanceRating(score).label}
              </span>
            </div>
          </div>

          {/* Radial score gauge */}
          <div className="relative flex items-center justify-center flex-shrink-0">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                stroke="rgba(30, 41, 59, 0.4)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="url(#resultsScoreGradient)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="resultsScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-black text-white">{score.toFixed(1)}</span>
              <span className="text-xs text-slate-500 block">out of 10</span>
            </div>
          </div>
        </div>

        {/* Structured Feedback Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recommendation Card */}
          {finalReport?.recommendation && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 relative lg:col-span-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-amber-400" />
                Strategic Recommendation
              </h3>
              <p className="text-sm text-slate-350 leading-relaxed">
                {finalReport.recommendation}
              </p>
            </div>
          )}

          {/* Strengths Card */}
          {finalReport?.strengths && finalReport.strengths.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                Identified Strengths
              </h3>
              <ul className="space-y-3 text-xs text-slate-400">
                {finalReport.strengths.map((strength, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses Card */}
          {finalReport?.weaknesses && finalReport.weaknesses.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-400" />
                Critical Weaknesses
              </h3>
              <ul className="space-y-3 text-xs text-slate-400">
                {finalReport.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Communication Card */}
          {finalReport?.communicationFeedback && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-teal-400" />
                Communication feedback
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {finalReport.communicationFeedback}
              </p>
            </div>
          )}

          {/* Technical Card */}
          {finalReport?.technicalFeedback && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 lg:col-span-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
                Technical & Core Skill feedback
              </h3>
              <p className="text-sm text-slate-355 leading-relaxed">
                {finalReport.technicalFeedback}
              </p>
            </div>
          )}

          {/* Improvement Plan Checklist */}
          {finalReport?.improvementPlan && finalReport.improvementPlan.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 lg:col-span-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-teal-400" />
                Personalized Improvement Milestones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finalReport.improvementPlan.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-start gap-3 group hover:border-slate-800 transition-colors"
                  >
                    <div className="w-5 h-5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-400 font-semibold rounded-xl transition-all"
          >
            Dashboard Overview
          </button>
          
          <button
            onClick={() => navigate('/generate-report')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold rounded-xl hover:from-teal-300 hover:to-cyan-300 transition-all shadow-xl shadow-teal-500/10"
          >
            <span>Generate New Report</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </main>
    </div>
  );
}
