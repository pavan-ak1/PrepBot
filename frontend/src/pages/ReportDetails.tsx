import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobPrepAPI, sessionAPI } from '../services/api';
import { 
  ArrowLeft, 
  Play, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Loader2,
  CheckCircle2,
  Award,
  BookOpen,
  ChevronRight,
  Sparkles,
  FileText,
  Trash2
} from 'lucide-react';

export default function ReportDetails() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<{ _id: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'gaps' | 'roadmap'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteReport = async () => {
    if (!reportId) return;
    setDeleting(true);
    try {
      await jobPrepAPI.deleteReport(reportId);
      try {
        await sessionAPI.deleteSessionByReport(reportId);
      } catch (err) {
        console.error("Failed to delete sessions associated with report:", err);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error("Failed to delete report:", err);
      alert("Failed to delete this report. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await jobPrepAPI.getReport(reportId!);
      setReport(response.data.interviewReport);

      try {
        const sessionRes = await sessionAPI.getSessionByReport(reportId!);
        setSessionInfo(sessionRes.data.session);
      } catch (sessionErr) {
        console.error('Failed to fetch session status:', sessionErr);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  // Radial progress calculations
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = report ? circumference - (report.matchScore / 100) * circumference : circumference;

  const getScoreRating = (score: number) => {
    if (score >= 85) return { label: 'Optimal Match', color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' };
    if (score >= 70) return { label: 'Good Match', color: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/5' };
    if (score >= 50) return { label: 'Potential Match', color: 'text-amber-400 border-amber-500/25 bg-amber-500/5' };
    return { label: 'Skills Alignment Required', color: 'text-rose-455 border-rose-500/25 bg-rose-500/5' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center bg-grid-pattern relative">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading interview strategy...</p>
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

  if (!report) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center px-4 bg-grid-pattern relative">
        <div className="text-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
          Report not found
        </div>
      </div>
    );
  }

  const jobTitleSnippet = report.jobDescription?.trim().split('\n')[0] || 'Target Role';
  const displayTitle = jobTitleSnippet.length > 55 ? jobTitleSnippet.substring(0, 55) + '...' : jobTitleSnippet;

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb Nav */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Back to Dashboard</span>
        </button>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Strategy Strategy Overview
        </span>
      </div>

      {/* Title Details & Action panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Target Role Strategy Details</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">{displayTitle}</h2>
          <p className="text-xs text-slate-550">
            Created on {new Date(report.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center p-3 bg-rose-500/5 hover:bg-rose-650 text-rose-450 hover:text-white border border-rose-555/10 hover:border-rose-600 rounded-xl transition-all duration-200"
            title="Delete Report"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>

          {sessionInfo && sessionInfo.status === 'completed' ? (
            <button
              onClick={() => navigate(`/results/${sessionInfo._id}`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-950 font-extrabold rounded-xl hover:bg-slate-100 transition-all shadow-xl"
            >
              <Award className="h-4.5 w-4.5 text-indigo-650" />
              <span>View Results scorecard</span>
            </button>
          ) : (
            <button
              onClick={() => navigate(`/session/${report._id}`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold rounded-xl active:scale-95 transition-all shadow-xl"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>
                {sessionInfo && sessionInfo.status === 'active' ? 'Resume Prep Session' : 'Begin Mock Interview'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Menu Controls */}
      <div className="flex border-b border-slate-900/60 pb-px text-xs font-bold uppercase tracking-wider text-slate-450 gap-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'overview' ? 'text-white border-b-2 border-indigo-500' : 'hover:text-slate-200'
          }`}
        >
          Overview & Alignment
        </button>
        <button
          onClick={() => setActiveTab('gaps')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'gaps' ? 'text-white border-b-2 border-indigo-500' : 'hover:text-slate-200'
          }`}
        >
          Competency Gaps
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'roadmap' ? 'text-white border-b-2 border-indigo-500' : 'hover:text-slate-200'
          }`}
        >
          Preparation Calendar
        </button>
      </div>

      {/* Tab Body Contents */}
      <div className="pt-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left side: Fit Score ring */}
            <div className="lg:col-span-4 custom-glass rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl animate-pulse-slow" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Alignment Match</h3>
              
              <div className="relative flex items-center justify-center mb-5">
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
                    stroke="url(#overviewScoreGrad)"
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
                    <linearGradient id="overviewScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black text-white">{report.matchScore}%</span>
                </div>
              </div>

              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getScoreRating(report.matchScore).color}`}>
                {getScoreRating(report.matchScore).label}
              </div>
            </div>

            {/* Right side: Job JD text preview */}
            <div className="lg:col-span-8 custom-glass rounded-3xl p-6 flex flex-col space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <FileText className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">Job Description Specifications</h3>
              </div>
              
              <div className="bg-[#0b0e15]/40 border border-slate-900 rounded-2xl p-4 flex-grow overflow-y-auto max-h-[220px] scrollbar-thin">
                <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                  {report.jobDescription}
                </pre>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="custom-glass rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">Target stacking gaps</h3>
            </div>

            {report.skillGaps && report.skillGaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {report.skillGaps.map((gap: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="bg-[#0b0e15]/60 border border-slate-900 p-4 rounded-xl flex items-center justify-between group hover:border-slate-800 transition-colors"
                  >
                    <div className="space-y-1 pr-3 truncate">
                      <span className="text-xs font-bold text-slate-200 block truncate">{gap.skill}</span>
                      <span className="text-[10px] text-slate-500 block">Framework requirement mismatch</span>
                    </div>
                    
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                      gap.severity === 'high' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' :
                      gap.severity === 'medium' ? 'bg-amber-500/10 text-amber-455 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20'
                    }`}>
                      {gap.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-450 mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">Alignments fully matched</h4>
                <p className="text-xs text-slate-500">Your profile features overlap with all critical dependencies listed in the job description.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="custom-glass rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Calendar className="h-4.5 w-4.5 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">Preparation roadmap milestones</h3>
            </div>

            {report.preparationPlan && report.preparationPlan.length > 0 ? (
              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-900">
                {report.preparationPlan.map((day: any, idx: number) => (
                  <div key={idx} className="relative group">
                    
                    {/* Circle bullet on timeline */}
                    <div className="absolute left-[-22px] top-1.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-indigo-500 group-hover:bg-indigo-500 transition-colors z-10" />
                    
                    <div className="bg-[#0b0e15]/40 border border-slate-900 hover:border-slate-800 p-5 rounded-2xl transition-all max-w-2xl">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">Day {day.day} target</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Focus area</span>
                      </div>
                      
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                        {day.focus}
                      </h4>

                      <ul className="space-y-2 text-xs text-slate-450">
                        {day.tasks.map((task: string, taskIdx: number) => (
                          <li key={taskIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-550 rounded-full mt-1.5 flex-shrink-0" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                No preparation plan available for this report.
              </div>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="custom-glass rounded-3xl p-6 max-w-md w-full border border-slate-900 space-y-6 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-450 border border-rose-555/20">
                <AlertTriangle className="h-6 w-6 text-rose-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">Delete Report?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-200">"{displayTitle}"</strong>? 
                  This will permanently delete this report and all associated mock interview sessions, answers, and scorecards. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReport}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
