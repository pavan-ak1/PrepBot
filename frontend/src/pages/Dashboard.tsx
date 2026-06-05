import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { jobPrepAPI } from '../services/api';
import { GraduationCap, FileText, LogOut, Plus, TrendingUp } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-teal-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Job Prep</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Generate interview reports and practice with AI-powered sessions</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/generate-report')}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl p-6 text-left transition-all group hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Plus className="h-6 w-6 text-teal-400 group-hover:text-teal-300" />
              <h3 className="text-lg font-semibold text-white">Generate Report</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Upload your resume and job description to get a personalized interview preparation report
            </p>
          </button>

          <button
            onClick={() => {
              // Show progress summary
              window.scrollTo({ top: 500, behavior: 'smooth' });
            }}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl p-6 text-left transition-all group hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="h-6 w-6 text-teal-400 group-hover:text-teal-300" />
              <h3 className="text-lg font-semibold text-white">View Progress</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Track your interview preparation progress over time
            </p>
            <div className="mt-3 text-2xl font-bold text-white">{reports.length} Reports</div>
          </button>

          <button
            onClick={() => {
              // Scroll to reports section
              window.scrollTo({ top: 500, behavior: 'smooth' });
            }}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl p-6 text-left transition-all group hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="h-6 w-6 text-teal-400 group-hover:text-teal-300" />
              <h3 className="text-lg font-semibold text-white">Saved Reports</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Access your previously generated interview reports
            </p>
            <div className="mt-3 text-2xl font-bold text-white">{reports.length} Available</div>
          </button>
        </div>

        {/* Recent Reports */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Saved Reports</h2>
          
          {loading ? (
            <div className="text-slate-400">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-slate-400 space-y-2">
              <p>No reports yet. Generate your first report to get started!</p>
              <ol className="list-decimal list-inside space-y-2 mt-4">
                <li>Click "Generate Report" to upload your resume and job description</li>
                <li>Review the AI-generated interview questions and preparation plan</li>
                <li>Start an interactive interview session to practice your answers</li>
                <li>Get detailed feedback and improvement suggestions</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-lg p-4 cursor-pointer transition-all hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 backdrop-blur-sm"
                  onClick={() => navigate(`/report/${report._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">
                        {report.jobDescription?.substring(0, 50) || 'Untitled Report'}...
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Created: {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {report.technicalQuestions?.length || 0} Technical Questions • {report.behavioralQuestions?.length || 0} Behavioral Questions
                      </p>
                    </div>
                    <FileText className="h-5 w-5 text-teal-400 ml-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
