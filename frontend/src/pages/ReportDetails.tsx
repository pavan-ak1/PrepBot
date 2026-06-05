import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobPrepAPI } from '../services/api';
import { ArrowLeft, Play, TrendingUp, AlertTriangle, Calendar, Loader2 } from 'lucide-react';

export default function ReportDetails() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading report...</p>
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

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-400">Report not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">Back</span>
            </button>
            <span className="text-slate-600">|</span>
            <h1 className="text-lg font-bold text-white">Interview Report</h1>
            <span className="text-slate-400 text-sm">
              Created: {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col p-4 gap-4 min-h-0">
        {/* Top Section: Left Column + Preparation Plan */}
        <div className="flex-1 overflow-hidden grid grid-cols-[320px_1fr] gap-4 min-h-0">
          {/* Left Column: Match Score and Skill Gaps */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Match Score Card */}
            {report.matchScore && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex-shrink-0 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-teal-400" />
                  <span className="text-base font-semibold text-white">Match Score</span>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">{report.matchScore}%</div>
              </div>
            )}

            {/* Skill Gaps Card */}
            {report.skillGaps && report.skillGaps.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex-shrink-0 backdrop-blur-sm">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Skill Gaps ({report.skillGaps.length})</span>
                </h3>
                <div className="space-y-2">
                  {report.skillGaps.map((gap: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-1">
                      <span className="text-sm text-white">{gap.skill}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        gap.severity === 'high' ? 'bg-rose-500/20 text-rose-300' :
                        gap.severity === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {gap.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Preparation Plan */}
          {report.preparationPlan && report.preparationPlan.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col overflow-hidden min-h-0 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-white mb-2 flex items-center space-x-2 flex-shrink-0">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span>Preparation Plan ({report.preparationPlan.length} days)</span>
              </h3>
              <div className="overflow-y-auto flex-1 min-h-0">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-800/50">
                    <tr className="border-b border-slate-600">
                      <th className="text-left text-slate-400 py-2 px-3 w-16">Day</th>
                      <th className="text-left text-slate-400 py-2 px-3 w-32">Focus</th>
                      <th className="text-left text-slate-400 py-2 px-3">Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.preparationPlan.map((day: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-700/50">
                        <td className="py-2 px-3 text-teal-400 font-medium">{day.day}</td>
                        <td className="py-2 px-3 text-white">{day.focus}</td>
                        <td className="py-2 px-3 text-slate-400">{day.tasks.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Start Session Button */}
        <button
          onClick={() => navigate(`/session/${report._id}`)}
          className="flex-shrink-0 flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-lg shadow-teal-500/20 text-base font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all"
        >
          <Play className="h-5 w-5 mr-2" />
          Give answers for the generated questions
        </button>
      </main>
    </div>
  );
}
