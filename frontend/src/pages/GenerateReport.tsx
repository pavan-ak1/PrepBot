import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobPrepAPI } from '../services/api';
import { ArrowLeft, Upload, Loader2, Play, TrendingUp, AlertTriangle, Calendar, FileText } from 'lucide-react';

export default function GenerateReport() {
  const navigate = useNavigate();
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!resume) {
      setError('Please upload your resume');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please provide a job description');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('jobDescription', jobDescription);
      if (selfDescription.trim()) {
        formData.append('selfDescription', selfDescription);
      }

      const response = await jobPrepAPI.generateReport(formData);
      setReport(response.data.interviewReport);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-lg font-bold text-white">Generate Interview Report</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col p-4 gap-4 min-h-0">
        {!report ? (
          /* Form State */
          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col gap-4 min-h-0">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/50 text-rose-300 px-4 py-2 rounded-lg flex-shrink-0 backdrop-blur-sm">
                {error}
              </div>
            )}

            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4 min-h-0">
              {/* Left Column: Resume Upload */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col backdrop-blur-sm">
                <label className="block text-sm font-medium text-slate-300 mb-3 flex-shrink-0">
                  Resume (PDF)
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-teal-500/50 transition-colors flex-1 flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    {resume ? (
                      <>
                        <FileText className="h-12 w-12 text-teal-400" />
                        <span className="text-white font-medium">{resume.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-slate-500" />
                        <span className="text-slate-400">Click to upload PDF resume</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Right Column: Job Description and Self Description */}
              <div className="flex flex-col gap-4 overflow-hidden">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex-1 flex flex-col overflow-hidden backdrop-blur-sm">
                  <label htmlFor="jobDescription" className="block text-sm font-medium text-slate-300 mb-2 flex-shrink-0">
                    Job Description *
                  </label>
                  <textarea
                    id="jobDescription"
                    required
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="flex-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 resize-none text-sm backdrop-blur-sm transition-all"
                    placeholder="Paste the job description here..."
                  />
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex-1 flex flex-col overflow-hidden backdrop-blur-sm">
                  <label htmlFor="selfDescription" className="block text-sm font-medium text-slate-300 mb-2 flex-shrink-0">
                    Self Description (Optional)
                  </label>
                  <textarea
                    id="selfDescription"
                    value={selfDescription}
                    onChange={(e) => setSelfDescription(e.target.value)}
                    className="flex-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 resize-none text-sm backdrop-blur-sm transition-all"
                    placeholder="Tell us about yourself, your experience, and career goals..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex-shrink-0 flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-lg shadow-teal-500/20 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </form>
        ) : (
          /* Report State */
          <>
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
          </>
        )}
      </main>
    </div>
  );
}
