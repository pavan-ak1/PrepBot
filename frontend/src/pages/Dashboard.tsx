import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobPrepAPI, sessionAPI } from '../services/api';
import { 
  Plus, 
  TrendingUp, 
  Sparkles, 
  Award, 
  Clock, 
  ChevronRight,
  Briefcase,
  Search,
  BookOpen,
  CheckCircle,
  FileText,
  AlertTriangle,
  Play,
  Trash2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportToDelete, setReportToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteClick = (id: string, title: string) => {
    setReportToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    setDeletingId(reportToDelete.id);
    try {
      await jobPrepAPI.deleteReport(reportToDelete.id);
      try {
        await sessionAPI.deleteSessionByReport(reportToDelete.id);
      } catch (err) {
        console.error("Failed to delete sessions associated with report:", err);
      }
      setReports(prev => prev.filter(r => r._id !== reportToDelete.id));
      setReportToDelete(null);
    } catch (err) {
      console.error("Failed to delete report:", err);
      alert("Failed to delete the preparation report. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };
  const [filterTab, setFilterTab] = useState<'all' | 'high' | 'action'>('all');

  // Interactive Checklist State
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('prepbot_dashboard_checklist');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, text: 'Review core algorithms & structures', checked: false },
      { id: 2, text: 'Draft STAR method behavioral templates', checked: false },
      { id: 3, text: 'Upload latest resume and sync skills', checked: true },
      { id: 4, text: 'Complete at least one full mock session', checked: false },
      { id: 5, text: 'Study identified gaps from scorecard', checked: false }
    ];
  });

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

  const handleCheckToggle = (id: number) => {
    const updated = checklist.map((item: any) => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    localStorage.setItem('prepbot_dashboard_checklist', JSON.stringify(updated));
  };

  const reportsWithScore = reports.filter(r => r.matchScore);
  const avgMatchScore = reportsWithScore.length > 0 
    ? Math.round(reportsWithScore.reduce((acc, curr) => acc + curr.matchScore, 0) / reportsWithScore.length)
    : null;

  // Filter and Search logic
  const filteredReports = reports.filter(report => {
    const jobSnippet = report.jobDescription?.toLowerCase() || '';
    const matchesSearch = jobSnippet.includes(searchQuery.toLowerCase());
    
    if (filterTab === 'high') {
      return matchesSearch && report.matchScore && report.matchScore >= 80;
    }
    if (filterTab === 'action') {
      return matchesSearch && (!report.matchScore || report.matchScore < 80);
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Workspace Dashboard <Sparkles className="h-5 w-5 text-indigo-400" />
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Benchmarking resume profiles against industry standards and conducting simulation sprints.
          </p>
        </div>
        <button
          onClick={() => navigate('/generate-report')}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-white text-slate-950 font-extrabold rounded-xl hover:bg-slate-100 active:scale-98 transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>New Prep Session</span>
        </button>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="custom-glass rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Roles</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{reports.length}</div>
          <p className="text-xs text-slate-500 mt-1.5">Role preparation strategies generated</p>
        </div>

        <div className="custom-glass rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mean Fit score</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {avgMatchScore ? `${avgMatchScore}%` : 'N/A'}
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Average skill fit rating</p>
        </div>

        <div className="custom-glass rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Preparation Index</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {reports.length > 0 ? (avgMatchScore && avgMatchScore >= 80 ? 'Optimal' : 'Sprint Mode') : 'Ready'}
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Interview preparation profile readiness</p>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Reports Explorer */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <h2 className="text-lg font-bold text-white">Target Job Reports</h2>
            
            {/* Filter Tabs */}
            <div className="flex bg-[#0b0e15] border border-slate-900 p-1 rounded-xl text-xs">
              <button 
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterTab === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterTab('high')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterTab === 'high' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                High Match
              </button>
              <button 
                onClick={() => setFilterTab('action')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterTab === 'action' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Focus Areas
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative group">
            <Search className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search reports by job title or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0b0e15]/60 border border-slate-900 hover:border-slate-800 focus:border-indigo-500/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder-slate-650"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-950/20 border border-slate-900 rounded-2xl">
              <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <span className="text-sm text-slate-400">Loading strategy database...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-20 px-6 border border-slate-900 border-dashed rounded-3xl flex flex-col items-center justify-center bg-slate-950/10">
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-550 mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">No reports matching filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
                Try searching other keywords, altering filters, or generate a new custom target report matching your latest profile.
              </p>
              <button
                onClick={() => navigate('/generate-report')}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-lg transition-all"
              >
                Create Strategy Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredReports.map((report) => {
                const jobSnippet = report.jobDescription?.trim().split('\n')[0] || 'Target Role';
                const title = jobSnippet.length > 60 ? jobSnippet.substring(0, 60) + '...' : jobSnippet;

                const score = report.matchScore;
                const isHighFit = score && score >= 80;

                return (
                  <div
                    key={report._id}
                    onClick={() => navigate(`/report/${report._id}`)}
                    className="custom-glass custom-glass-hover rounded-2xl p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-3 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-md">
                          {title}
                        </h3>
                        {score !== undefined && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isHighFit 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {score}% Match
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-slate-800 hidden sm:inline">•</span>
                        <span className="bg-[#0b0e15] px-2.5 py-1 rounded-lg border border-slate-900 text-slate-400">
                          {report.technicalQuestions?.length || 0} Technical Questions
                        </span>
                        <span className="bg-[#0b0e15] px-2.5 py-1 rounded-lg border border-slate-900 text-slate-400">
                          {report.behavioralQuestions?.length || 0} Behavioral
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 self-end sm:self-auto">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(report._id, title);
                        }}
                        className="p-2 rounded-xl bg-rose-500/5 hover:bg-rose-650 text-rose-450 hover:text-white border border-rose-550/10 hover:border-rose-600 transition-all duration-200"
                        title="Delete Report"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/session/${report._id}`);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-600 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Practice</span>
                      </button>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar Checklist */}
        <div className="space-y-6">
          <div className="custom-glass rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
              Preparation Checklist
            </h3>
            
            <div className="space-y-3.5">
              {checklist.map((item: any) => (
                <div 
                  key={item.id} 
                  onClick={() => handleCheckToggle(item.id)}
                  className="flex items-start gap-3 cursor-pointer group text-xs"
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all ${
                    item.checked 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                      : 'border-slate-800 group-hover:border-slate-700 bg-slate-950/50'
                  }`}>
                    {item.checked && <CheckCircle className="h-3 w-3" />}
                  </div>
                  <span className={`leading-relaxed transition-colors ${
                    item.checked ? 'text-slate-500 line-through' : 'text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-900/60 text-[10px] text-slate-550 flex items-center justify-between">
              <span>Sprint Progress</span>
              <span className="font-bold text-indigo-400">
                {Math.round((checklist.filter((item: any) => item.checked).length / checklist.length) * 100)}% Complete
              </span>
            </div>
            {/* Small simple progress indicator */}
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(checklist.filter((item: any) => item.checked).length / checklist.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-gradient-to-tr from-slate-950/80 to-[#0e111a]/80 border border-slate-900 rounded-2xl p-5 relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Agent Instruction
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              PrepBot uses Gemini models to assess technical correctness, structure, depth, and communication style. Focus on formatting answers with bullet points or step checklists when practicing.
            </p>
          </div>
        </div>
      </div>

      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="custom-glass rounded-3xl p-6 max-w-md w-full border border-slate-900 space-y-6 animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-450 border border-rose-555/20">
                <AlertTriangle className="h-6 w-6 text-rose-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">Delete Report?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-200">"{reportToDelete.title}"</strong>? 
                  This will permanently delete this report and all associated mock interview sessions, answers, and scorecards. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setReportToDelete(null)}
                disabled={deletingId !== null}
                className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1.5"
              >
                {deletingId ? (
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
