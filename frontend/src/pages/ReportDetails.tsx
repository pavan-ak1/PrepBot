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
  Sparkles,
  Award
} from 'lucide-react';

export default function ReportDetails() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<{ _id: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    if (score >= 85) return { label: 'Excellent Match', color: 'text-teal-400' };
    if (score >= 70) return { label: 'Good Match', color: 'text-cyan-400' };
    if (score >= 50) return { label: 'Potential Match', color: 'text-amber-400' };
    return { label: 'Training Recommended', color: 'text-rose-400' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading interview strategy...</p>
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

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center text-slate-400 text-sm">
          Report not found
        </div>
      </div>
    );
  }

  const jobTitleSnippet = report.jobDescription?.trim().split('\n')[0] || 'Target Role';
  const displayTitle = jobTitleSnippet.length > 50 ? jobTitleSnippet.substring(0, 50) + '...' : jobTitleSnippet;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-xl border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-semibold">Back to Dashboard</span>
            </button>
            <div className="text-right">
              <span className="text-xs text-slate-500">
                Created: {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col relative z-10 space-y-8">
        {/* Title and Top Level CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Preparation Strategy</span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-0.5">{displayTitle}</h2>
          </div>

          {sessionInfo && sessionInfo.status === 'completed' ? (
            <button
              onClick={() => navigate(`/results/${sessionInfo._id}`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold rounded-xl hover:from-emerald-300 hover:to-teal-300 active:scale-95 transition-all shadow-xl shadow-emerald-500/10"
            >
              <Award className="h-5 w-5" />
              <span>View Interview Results</span>
            </button>
          ) : (
            <button
              onClick={() => navigate(`/session/${report._id}`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold rounded-xl hover:from-teal-300 hover:to-cyan-300 active:scale-95 transition-all shadow-xl shadow-teal-500/10"
            >
              <Play className="h-5 w-5 fill-slate-950" />
              <span>
                {sessionInfo && sessionInfo.status === 'active' ? 'Resume Session' : 'Begin Practice Session'}
              </span>
            </button>
          )}
        </div>

        {/* Score & Gaps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Radial Score Card */}
          {report.matchScore !== undefined && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/5 rounded-full blur-xl" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-teal-400" /> Job Match Level
              </h3>

              {/* Circular SVG Gauge */}
              <div className="relative flex items-center justify-center mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    stroke="rgba(30, 41, 59, 0.5)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  <circle
                    stroke="url(#scoreGradient)"
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
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2dd4bf" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-white">{report.matchScore}%</span>
                </div>
              </div>

              <span className={`text-sm font-bold ${getScoreRating(report.matchScore).color}`}>
                {getScoreRating(report.matchScore).label}
              </span>
            </div>
          )}

          {/* Skill Gaps Card */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 lg:col-span-2 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Identified Skill Gaps
            </h3>

            {report.skillGaps && report.skillGaps.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[160px] pr-2">
                {report.skillGaps.map((gap: any, idx: number) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200 truncate pr-2">{gap.skill}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                      gap.severity === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      gap.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {gap.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <CheckCircle2 className="h-8 w-8 text-teal-400 mb-2" />
                <p className="text-sm text-slate-300">No major skill gaps identified!</p>
                <p className="text-xs text-slate-500 mt-0.5">Your credentials strongly line up with the targets.</p>
              </div>
            )}
          </div>
        </div>

        {/* Preparation Timeline */}
        {report.preparationPlan && report.preparationPlan.length > 0 && (
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-400" />
              Interview Preparation Calendar
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {report.preparationPlan.map((day: any, idx: number) => (
                <div 
                  key={idx} 
                  className="bg-slate-950/40 border border-slate-900 hover:border-slate-800/80 rounded-xl p-5 relative group transition-all duration-200"
                >
                  <div className="absolute top-4 right-4 text-xs font-extrabold text-teal-500/30 group-hover:text-teal-400/50 transition-colors">
                    DAY {day.day}
                  </div>
                  
                  <h4 className="text-sm font-bold text-white mb-3 tracking-wide truncate max-w-[80%] pr-4 uppercase">
                    {day.focus}
                  </h4>

                  <ul className="space-y-2 text-xs text-slate-400">
                    {day.tasks.map((task: string, taskIdx: number) => (
                      <li key={taskIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-teal-400/50 rounded-full mt-1.5 flex-shrink-0" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
