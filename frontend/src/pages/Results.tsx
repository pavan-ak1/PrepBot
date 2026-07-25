import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import type { InterviewSession, Answer } from '../types';
import { 
  ArrowLeft, 
  TrendingUp, 
  Award, 
  BookOpen, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Accordion active state for question explorer
  const [expandedAnswerIdx, setExpandedAnswerIdx] = useState<number | null>(null);

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

  const toggleAccordion = (idx: number) => {
    setExpandedAnswerIdx(prev => prev === idx ? null : idx);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center bg-grid-pattern relative">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Compiling capabilities feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center px-4 bg-grid-pattern relative">
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-350 text-xs px-6 py-4 rounded-xl max-w-md backdrop-blur-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const finalReport = session.finalReport;
  const score = session.overallScore || 0;

  // Radial progress calculations
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  const getPerformanceRating = (overallScore: number) => {
    if (overallScore >= 8.5) return { label: 'Optimal Readiness', color: 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' };
    if (overallScore >= 7.0) return { label: 'Strong Competency', color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' };
    if (overallScore >= 5.5) return { label: 'Solid Core / Practice Recommended', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
    return { label: 'Alignment Required', color: 'bg-rose-500/10 text-rose-455 border border-rose-500/20' };
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Back to Dashboard</span>
        </button>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Assessment Scorecard
        </span>
      </div>

      {/* Main Score & Fit Indicators */}
      <div className="custom-glass rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl animate-pulse-slow" />
        
        <div className="space-y-3.5 text-center md:text-left flex-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-455 flex items-center justify-center md:justify-start gap-1.5 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" /> Evaluation Sprint Completed
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Performance Scorecard</h2>
          <p className="text-xs sm:text-sm text-slate-450 leading-relaxed max-w-lg">
            Our agentic evaluation service reviewed your answers based on knowledge depth, structural logic, conceptual frameworks, and situational communications.
          </p>
          <div className="pt-2">
            <span className={`inline-flex px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider ${getPerformanceRating(score).color}`}>
              {getPerformanceRating(score).label}
            </span>
          </div>
        </div>

        {/* Circular Gauge */}
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
              stroke="url(#resultsScoreGrad)"
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
              <linearGradient id="resultsScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center">
            <span className="text-4xl font-black text-white">{score.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold mt-1">out of 10</span>
          </div>
        </div>
      </div>

      {/* Structured metrics grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommendation Panel */}
        {finalReport?.recommendation && (
          <div className="custom-glass rounded-2xl p-6 relative lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 mb-3 flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-amber-500" />
              Strategic AI Recommendations
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              {finalReport.recommendation}
            </p>
          </div>
        )}

        {/* Strengths Card */}
        {finalReport?.strengths && finalReport.strengths.length > 0 && (
          <div className="custom-glass rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-2 border-b border-slate-900 pb-3">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-450" />
              Primary Strengths
            </h3>
            <ul className="space-y-3 text-xs text-slate-450 leading-relaxed">
              {finalReport.strengths.map((strength, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 mt-1.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses Card */}
        {finalReport?.weaknesses && finalReport.weaknesses.length > 0 && (
          <div className="custom-glass rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-355 flex items-center gap-2 border-b border-slate-900 pb-3">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-455" />
              Focus Weaknesses
            </h3>
            <ul className="space-y-3 text-xs text-slate-450 leading-relaxed">
              {finalReport.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-455 mt-1.5 flex-shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Communication Card */}
        {finalReport?.communicationFeedback && (
          <div className="custom-glass rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-2 border-b border-slate-900 pb-3">
              <MessageSquare className="h-4.5 w-4.5 text-indigo-400" />
              Communication Delivery
            </h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              {finalReport.communicationFeedback}
            </p>
          </div>
        )}

        {/* Technical Domain Feedback */}
        {finalReport?.technicalFeedback && (
          <div className="custom-glass rounded-2xl p-6 space-y-3 lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-2 border-b border-slate-900 pb-3">
              <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
              Technical capability feedback
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {finalReport.technicalFeedback}
            </p>
          </div>
        )}

        {/* Improvement Plan checklist */}
        {finalReport?.improvementPlan && finalReport.improvementPlan.length > 0 && (
          <div className="custom-glass rounded-2xl p-6 space-y-4 lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-2 border-b border-slate-900 pb-3">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
              Target Roadmap Milestones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finalReport.improvementPlan.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#0b0e15]/40 border border-slate-900 p-4 rounded-xl flex items-start gap-3 group hover:border-slate-800 transition-colors"
                >
                  <div className="w-5 h-5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-450 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DETAILED ANSWER EXPLORER ACCORDION */}
        {session.answers && session.answers.length > 0 && (
          <div className="custom-glass rounded-3xl p-6 space-y-4 lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-2 border-b border-slate-900 pb-3">
              <FileText className="h-4.5 w-4.5 text-indigo-400" />
              Detailed Q&A Transcript Explorer
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Expand questions below to review your answers side-by-side with AI evaluations, strengths, weaknesses, and ideal model responses.
            </p>

            <div className="space-y-3 pt-2">
              {session.answers.map((ans: Answer, idx: number) => {
                const isExpanded = expandedAnswerIdx === idx;
                const evalScore = ans.evaluation?.score || 0;
                
                return (
                  <div 
                    key={idx} 
                    className="border border-slate-900 rounded-2xl overflow-hidden bg-[#07090f]/50 hover:bg-[#07090f]/75 transition-all"
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => toggleAccordion(idx)}
                      className="w-full flex items-center justify-between p-4 text-left gap-4"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-[10px] font-black text-indigo-500/40 uppercase">Q{idx + 1}</span>
                        <p className="text-xs font-bold text-slate-200 truncate flex-1">{ans.question}</p>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          evalScore >= 8 ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' :
                          evalScore >= 6 ? 'bg-amber-500/10 text-amber-455 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                        }`}>
                          {evalScore}/10
                        </span>
                      </div>
                      <div className="text-slate-500 hover:text-white">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {/* Accordion content */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-900/60 space-y-4 bg-[#05060b]/30 animate-slideDown text-xs leading-relaxed">
                        
                        {/* User Answer */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Submitted Answer</span>
                          <div className="p-3 bg-[#0a0c14]/80 border border-slate-900 rounded-xl text-xs text-slate-350 font-mono whitespace-pre-wrap">
                            {ans.userAnswer || "No answer provided"}
                          </div>
                        </div>

                        {/* Expect Answer / Model Answer */}
                        {ans.expectedAnswer && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                              <Lightbulb className="h-3 w-3" /> Ideal Model Response
                            </span>
                            <div className="p-3 bg-indigo-950/10 border border-indigo-950/20 rounded-xl text-xs text-indigo-300">
                              {ans.expectedAnswer}
                            </div>
                          </div>
                        )}

                        {/* AI Feedback */}
                        {ans.evaluation && (
                          <div className="space-y-3 pt-1 border-t border-slate-900/50">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Evaluation Feedback</span>
                              <p className="text-xs text-slate-450 mt-1">{ans.evaluation.feedback}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {ans.evaluation.strengths && ans.evaluation.strengths.length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-450 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Strengths
                                  </span>
                                  <ul className="space-y-1 text-slate-450 text-[11px]">
                                    {ans.evaluation.strengths.map((str, sIdx) => (
                                      <li key={sIdx} className="flex items-start gap-1">
                                        <span className="text-emerald-400">•</span>
                                        <span>{str}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {ans.evaluation.improvements && ans.evaluation.improvements.length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-450 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> Improvements
                                  </span>
                                  <ul className="space-y-1 text-slate-450 text-[11px]">
                                    {ans.evaluation.improvements.map((imp, iIdx) => (
                                      <li key={iIdx} className="flex items-start gap-1">
                                        <span className="text-amber-450">•</span>
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full sm:w-auto px-6 py-3 bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white font-bold rounded-xl transition-all text-xs"
        >
          Return to Dashboard
        </button>
        
        <button
          onClick={() => navigate('/generate-report')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-950 font-extrabold rounded-xl hover:bg-slate-100 transition-all shadow-xl text-xs"
        >
          <span>Run Another Session</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>

    </div>
  );
}

