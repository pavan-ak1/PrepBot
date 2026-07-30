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
  FileText,
  AlertTriangle,
  Play,
  Trash2,
  Calendar,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportToDelete, setReportToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Dynamic Roadmaps states
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [selectedRoadmapIdx, setSelectedRoadmapIdx] = useState<number>(0);
  const [roadmapsLoading, setRoadmapsLoading] = useState(true);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('prepbot_dashboard_completed_tasks');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleTaskChecked = (reportId: string, day: number, taskIdx: number) => {
    const key = `roadmap_${reportId}_day_${day}_task_${taskIdx}`;
    setCheckedTasks((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('prepbot_dashboard_completed_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const getActiveRoadmapProgress = (activeRoadmap: any) => {
    if (!activeRoadmap || !activeRoadmap.preparationPlan || activeRoadmap.preparationPlan.length === 0) {
      return 0;
    }
    
    let totalTasks = 0;
    let completedTasksCount = 0;
    
    activeRoadmap.preparationPlan.forEach((plan: any) => {
      if (plan.tasks && Array.isArray(plan.tasks)) {
        plan.tasks.forEach((_task: string, taskIdx: number) => {
          totalTasks++;
          const key = `roadmap_${activeRoadmap.reportId}_day_${plan.day}_task_${taskIdx}`;
          if (checkedTasks[key]) {
            completedTasksCount++;
          }
        });
      }
    });
    
    return totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
  };

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
      setRoadmaps(prev => {
        const filtered = prev.filter(r => r.reportId !== reportToDelete.id);
        setSelectedRoadmapIdx(0);
        return filtered;
      });
      setCheckedTasks((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (key.startsWith(`roadmap_${reportToDelete.id}_`)) {
            delete updated[key];
          }
        });
        localStorage.setItem('prepbot_dashboard_completed_tasks', JSON.stringify(updated));
        return updated;
      });
      setReportToDelete(null);
    } catch (err) {
      console.error("Failed to delete report:", err);
      alert("Failed to delete the preparation report. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Fetch reports and roadmaps on mount
  useEffect(() => {
    fetchReports();
    fetchRoadmaps();
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

  const fetchRoadmaps = async () => {
    try {
      setRoadmapsLoading(true);
      const response = await jobPrepAPI.getPreparationRoadmaps();
      setRoadmaps(response.data.roadmaps || []);
    } catch (error) {
      console.error('Failed to fetch roadmaps:', error);
    } finally {
      setRoadmapsLoading(false);
    }
  };

  const reportsWithScore = reports.filter(r => r.matchScore);
  const avgMatchScore = reportsWithScore.length > 0 
    ? Math.round(reportsWithScore.reduce((acc, curr) => acc + curr.matchScore, 0) / reportsWithScore.length)
    : null;

  // Display all reports directly as filtering/searching is disabled
  const filteredReports = reports;

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
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <h2 className="text-lg font-bold text-white">Target Job Reports</h2>
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

        {/* Right Sidebar Preparation plan */}
        <div className="space-y-6">
          <div className="custom-glass rounded-2xl p-6 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-indigo-400" />
              Preparation Plan
            </h3>

            {roadmapsLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                <span className="text-xs text-slate-500">Loading plan milestones...</span>
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No active preparation plans found. Generate a target job report to start.
              </div>
            ) : (
              <div className="space-y-5">
                {/* Selector Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Select Target Role
                  </label>
                  <select
                    value={selectedRoadmapIdx}
                    onChange={(e) => setSelectedRoadmapIdx(Number(e.target.value))}
                    className="w-full bg-[#0b0e15]/80 border border-slate-900 hover:border-slate-800 text-xs text-slate-350 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                  >
                    {roadmaps.map((r, idx) => (
                      <option key={r.reportId} value={idx}>
                        {r.jobTitle}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Progress Indicator */}
                {(() => {
                  const activeRoadmap = roadmaps[selectedRoadmapIdx];
                  if (!activeRoadmap) return null;
                  const progress = getActiveRoadmapProgress(activeRoadmap);
                  return (
                    <div className="space-y-2.5 bg-[#090b12]/30 p-4 rounded-xl border border-slate-900">
                      <div className="flex items-center justify-between text-[11px] text-slate-450 font-bold uppercase tracking-wider">
                        <span>Checklist Progress</span>
                        <span className="text-indigo-400">{progress}% Complete</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Day-by-Day Milestone Timelines */}
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {roadmaps[selectedRoadmapIdx]?.preparationPlan?.map((plan: any) => (
                    <div key={plan.day} className="space-y-2 bg-[#0b0e15]/30 border border-slate-900/60 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                          Day {plan.day}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          Focus
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {plan.focus}
                      </h4>
                      <div className="space-y-2 pt-1 border-t border-slate-900/30 mt-2">
                        {plan.tasks?.map((task: string, taskIdx: number) => {
                          const key = `roadmap_${roadmaps[selectedRoadmapIdx].reportId}_day_${plan.day}_task_${taskIdx}`;
                          const isChecked = !!checkedTasks[key];
                          return (
                            <div 
                              key={taskIdx}
                              onClick={() => toggleTaskChecked(roadmaps[selectedRoadmapIdx].reportId, plan.day, taskIdx)}
                              className="flex items-start gap-2.5 cursor-pointer group text-[11px]"
                            >
                              <div className={`w-3.5 h-3.5 rounded mt-0.5 flex items-center justify-center border transition-all ${
                                isChecked 
                                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                                  : 'border-slate-800 group-hover:border-slate-700 bg-slate-950/50'
                              }`}>
                                {isChecked && <span className="text-[9px] font-bold">✓</span>}
                              </div>
                              <span className={`leading-relaxed transition-colors ${
                                isChecked ? 'text-slate-500 line-through' : 'text-slate-400 group-hover:text-slate-200'
                              }`}>
                                {task}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
