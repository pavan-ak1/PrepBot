


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobPrepAPI } from '../services/api';
import { 
  ArrowLeft, 
  Upload, 
  Loader2, 
  Play, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  FileText,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function GenerateReport() {
  const navigate = useNavigate();
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<any>(null);
  
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    'Parsing your resume credentials...',
    'Analyzing job description requirements...',
    'Matching competencies & core skills...',
    'Detecting critical skill gaps...',
    'Tailoring practice questions & schedules...'
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-xl border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-semibold">Back to Dashboard</span>
              </button>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-300">
                New Preparation Report
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col relative z-10">
        {loading ? (
          /* Premium Loading Screen */
          <div className="flex-1 flex flex-col items-center justify-center py-20 max-w-lg mx-auto w-full text-center">
            <div className="relative mb-8">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full bg-teal-500/10 animate-ping" />
              {/* Inner rotating ring */}
              <div className="relative p-6 rounded-full bg-slate-900 border border-slate-800">
                <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Analyzing Profile</h3>
            <div className="h-6 overflow-hidden relative w-full mb-1">
              <p className="text-sm text-teal-400 transition-all duration-500 font-medium animate-pulse">
                {loadingSteps[loadingStep]}
              </p>
            </div>
            <p className="text-xs text-slate-500 max-w-xs">
              PrepBot is matching your resume with the target job details to custom-craft questions.
            </p>
          </div>
        ) : !report ? (
          /* Form UI */
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">Generate Prep Report</h2>
              <p className="text-slate-400 text-sm mt-1">Upload your resume and paste the job spec to configure your dynamic preparation flow.</p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm px-4 py-3 rounded-xl backdrop-blur-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Left Side: Drag & Drop upload */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col">
                <label className="block text-sm font-bold text-slate-300 mb-3">
                  Resume (PDF format)
                </label>
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center hover:border-teal-500/30 transition-all flex-1 flex flex-col items-center justify-center bg-slate-950/20 group cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    id="resume-upload"
                  />
                  <div className="flex flex-col items-center space-y-3 pointer-events-none">
                    {resume ? (
                      <>
                        <div className="p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20 text-teal-400 group-hover:scale-105 transition-transform duration-300">
                          <FileText className="h-10 w-10" />
                        </div>
                        <div>
                          <span className="text-white font-bold block truncate max-w-[220px]">{resume.name}</span>
                          <span className="text-xs text-slate-500">{(resume.size / 1024 / 1024).toFixed(2)} MB • PDF</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-slate-400 group-hover:scale-105 group-hover:border-teal-500/30 group-hover:text-teal-400 transition-all duration-300">
                          <Upload className="h-10 w-10" />
                        </div>
                        <div>
                          <span className="text-white font-bold block text-sm">Upload PDF resume</span>
                          <span className="text-xs text-slate-500">Drag & drop or click to choose file</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Inputs */}
              <div className="flex flex-col gap-6">
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col flex-1">
                  <label htmlFor="jobDescription" className="block text-sm font-bold text-slate-300 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    id="jobDescription"
                    required
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={5}
                    className="w-full flex-1 p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 text-sm resize-none transition-all"
                    placeholder="Paste the target job description details here..."
                  />
                </div>

                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col flex-1">
                  <label htmlFor="selfDescription" className="block text-sm font-bold text-slate-300 mb-2">
                    Self Description (Optional)
                  </label>
                  <textarea
                    id="selfDescription"
                    value={selfDescription}
                    onChange={(e) => setSelfDescription(e.target.value)}
                    rows={4}
                    className="w-full flex-1 p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 text-sm resize-none transition-all"
                    placeholder="Describe your current focus, targets, or specific areas you want the mock questions to grill you on..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold rounded-xl hover:from-teal-300 hover:to-cyan-300 active:scale-98 transition-all duration-200 shadow-xl shadow-teal-500/10 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              <span>Generate Target Report</span>
            </button>
          </form>
        ) : (
          /* Report Showcase UI */
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Analysis complete</span>
                <h2 className="text-2xl font-extrabold tracking-tight text-white mt-0.5">Your Interview Strategy</h2>
              </div>
              <button
                onClick={() => navigate(`/session/${report._id}`)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold rounded-xl hover:from-teal-300 hover:to-cyan-300 active:scale-95 transition-all shadow-xl shadow-teal-500/10"
              >
                <Play className="h-5 w-5 fill-slate-950" />
                <span>Begin Practice Session</span>
              </button>
            </div>

            {/* Score & Gaps grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Radial Match Score Card */}
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

            {/* Preparation timeline layout */}
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
          </div>
        )}
      </main>
    </div>
  );
}
