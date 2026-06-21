import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { jobPrepAPI } from '../services/api';
import { 
  GraduationCap, 
  FileText, 
  LogOut, 
  Plus, 
  TrendingUp, 
  Sparkles, 
  Award, 
  Clock, 
  ChevronRight,
  Briefcase
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const user = authService.getCurrentUserFromStorage();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await jobPrepAPI.getAllReports();
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const reportsWithScore = reports.filter(r => r.matchScore);
  const avgMatchScore = reportsWithScore.length > 0 
    ? Math.round(reportsWithScore.reduce((acc, curr) => acc + curr.matchScore, 0) / reportsWithScore.length)
    : null;



  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-xl border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="p-2 rounded-xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
                <GraduationCap className="h-6 w-6 text-teal-400" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                PrepBot
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium text-slate-300 hidden sm:inline">
                  {user?.username}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 px-3 py-1.5 rounded-lg bg-slate-900/40 hover:bg-rose-500/5 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 relative z-10 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Dashboard <Sparkles className="h-5 w-5 text-teal-400" />
            </h1>
            <p className="text-slate-400 mt-1 text-sm sm:text-base">
              Generate tailored interview prep schedules and test your knowledge against AI agents.
            </p>
          </div>
          <button
            onClick={() => navigate('/generate-report')}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-semibold rounded-xl hover:from-teal-300 hover:to-cyan-300 active:scale-95 transition-all duration-200 shadow-lg shadow-teal-500/10"
          >
            <Plus className="h-5 w-5" />
            <span>Generate Report</span>
          </button>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Profiles</span>
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{reports.length}</div>
            <p className="text-xs text-slate-500 mt-1">Ready for practice sessions</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Fit Score</span>
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {avgMatchScore ? `${avgMatchScore}%` : 'N/A'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Average fit based on resume</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Readiness Level</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {reports.length > 0 ? (avgMatchScore && avgMatchScore >= 80 ? 'High' : 'Medium') : 'Beginner'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Overall interview preparation</p>
          </div>
        </div>

        {/* Layout split: Left search & Reports, Right tips/info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Reports Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-white">Saved Job Reports</h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-900 rounded-2xl">
                <div className="h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-sm text-slate-400">Loading reports...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-16 px-6 bg-slate-900/20 border border-slate-900 rounded-2xl border-dashed flex flex-col items-center justify-center">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-slate-600 mb-4">
                  <FileText className="h-10 w-10 text-slate-500" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">No preparation profiles</h3>
                <p className="text-sm text-slate-400 max-w-sm mb-6">
                  Generate your first customized preparation plan by uploading your resume.
                </p>
                <button
                  onClick={() => navigate('/generate-report')}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-teal-500/30 text-teal-400 text-sm font-semibold rounded-lg transition-all"
                >
                  Create Plan Now
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {reports.map((report) => {
                  const jobSnippet = report.jobDescription?.trim().split('\n')[0] || 'Target Role';
                  const title = jobSnippet.length > 55 ? jobSnippet.substring(0, 55) + '...' : jobSnippet;

                  return (
                    <div
                      key={report._id}
                      onClick={() => navigate(`/report/${report._id}`)}
                      className="bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900/80 hover:border-slate-800/80 rounded-2xl p-5 cursor-pointer transition-all duration-300 flex items-center justify-between group"
                    >
                      <div className="space-y-2.5 flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-teal-400 transition-colors truncate">
                            {title}
                          </h3>
                          {report.matchScore && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                              {report.matchScore}% Fit
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                          <span className="hidden sm:inline text-slate-600">•</span>
                          <span className="bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-900 text-slate-300">
                            {report.technicalQuestions?.length || 0} Tech Qs
                          </span>
                          <span className="bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-900 text-slate-300">
                            {report.behavioralQuestions?.length || 0} Behavioral Qs
                          </span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 group-hover:border-teal-500/30 group-hover:bg-teal-500/5 text-slate-400 group-hover:text-teal-400 transition-all">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right sidebar: AI Coaching Insight */}
          <div className="space-y-5">
            <div className="bg-gradient-to-tr from-slate-900/60 to-slate-900/30 border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl" />
              <h2 className="text-base font-bold text-white mb-3.5 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-teal-400" />
                AI Coaching Insights
              </h2>
              <ul className="space-y-4 text-xs text-slate-400">
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-1.5 flex-shrink-0" />
                  <p>
                    <strong className="text-slate-300">Keep it custom:</strong> Always review the skill gaps list generated for each role to know exactly which concepts to research.
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-1.5 flex-shrink-0" />
                  <p>
                    <strong className="text-slate-300">AI Scoring:</strong> Answer submission evaluations grade your knowledge depth, structure, and communication.
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-1.5 flex-shrink-0" />
                  <p>
                    <strong className="text-slate-300">Spaced Repetition:</strong> Practice questions twice. Try correcting mistakes highlighted in your weak points report.
                  </p>
                </li>
              </ul>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
