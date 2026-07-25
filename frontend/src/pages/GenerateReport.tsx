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
  Sparkles,
  RefreshCw,
  X,
  ChevronRight,
  Info
} from 'lucide-react';

export default function GenerateReport() {
  const navigate = useNavigate();
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  // Stepper steps for loading state
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    'Parsing your resume credentials...',
    'Analyzing job description requirements...',
    'Matching competencies & core skills...',
    'Detecting critical skill gaps...',
    'Tailoring practice questions & schedules...'
  ];

  // Quick fill JD templates
  const templates = {
    frontend: `Position: Senior Frontend Engineer (React)\nWe are looking for a senior frontend engineer with 5+ years of experience. Core requirements:\n- Proficient in React, TypeScript, and state management (Redux, Zustand).\n- Deep understanding of modern bundlers (Vite, Webpack) and performance optimization techniques (code splitting, virtualization).\n- Experience with TailwindCSS or Styled Components.\n- Familiarity with CI/CD pipelines and unit testing frameworks (Jest, Vitest, Testing Library).\n- Strong communication skills and experience leading front-end architectural decisions.`,
    fullstack: `Position: Full-Stack Developer (NodeJS / Express / React)\nRequirements:\n- 4+ years of professional backend development with Node.js, Express, and NestJS.\n- Solid experience in TypeScript, React, and RESTful API integrations.\n- Production database knowledge: PostgreSQL, MongoDB, Redis caching layers.\n- Experience designing microservices architectures and handling Docker containerization.\n- Understanding of authentication protocols (OAuth, JWT) and web security principles.`,
    pm: `Position: Technical Product Manager (SaaS)\nResponsibilities:\n- Define product vision, roadmap, and core requirements for cloud services.\n- Translate technical constraints and features into user-facing requirements.\n- Core experience in agile methodologies, sprint planning, Jira, and scoping MVPs.\n- Familiarity with analytics platforms (Mixpanel, Amplitude) and data queries.\n- Background in engineering or a high degree of technical literacy is required.`,
    devops: `Position: Cloud DevOps Engineer\nRequirements:\n- 3+ years experience managing AWS cloud infrastructure (EC2, S3, RDS, VPC).\n- Hands-on expertise with Infrastructure as Code (IaC) using Terraform or CloudFormation.\n- Extensive experience building CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins).\n- Container orchestration with Docker and Kubernetes (EKS/ECS).\n- Monitoring and logging stacks: Prometheus, Grafana, ELK.`
  };

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

  // Drag and Drop listeners
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setResume(file);
      } else {
        setError('Only PDF resumes are supported');
      }
    }
  };

  const clearFile = () => {
    setResume(null);
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
    if (score >= 85) return { label: 'Optimal Match', color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' };
    if (score >= 70) return { label: 'Good Match', color: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/5' };
    if (score >= 50) return { label: 'Potential Match', color: 'text-amber-400 border-amber-500/25 bg-amber-500/5' };
    return { label: 'Skills Alignment Required', color: 'text-rose-450 border-rose-500/25 bg-rose-500/5' };
  };

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Back to Dashboard</span>
        </button>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          {report ? 'Interview Blueprint' : 'Configure Blueprint'}
        </h2>
      </div>

      {loading ? (
        /* Stepper Loading screen */
        <div className="max-w-xl mx-auto py-12 px-6 bg-[#080a11]/40 border border-slate-900 rounded-3xl backdrop-blur-xl space-y-8 text-center my-6">
          <div className="relative inline-flex items-center justify-center p-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white">Generating Preparation Strategy</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We are aligning your credentials against the target role schema. This process takes a moment.
            </p>
          </div>

          {/* Vertical Stepper UI */}
          <div className="max-w-xs mx-auto text-left space-y-4 pt-4">
            {loadingSteps.map((step, idx) => {
              const isActive = idx === loadingStep;
              const isCompleted = idx < loadingStep;
              
              return (
                <div key={idx} className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isCompleted ? 'bg-emerald-500 text-slate-950' : 
                    isActive ? 'bg-indigo-600 text-white animate-pulse' : 
                    'bg-slate-900 text-slate-650 border border-slate-800'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs font-semibold ${
                    isCompleted ? 'text-slate-400' :
                    isActive ? 'text-indigo-400' :
                    'text-slate-600'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : !report ? (
        /* Main Input Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Generate Blueprint <Sparkles className="h-5 w-5 text-indigo-400" />
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Upload your resume and outline requirements to formulate structured preparation milestones.
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-350 text-xs px-4 py-3 rounded-xl backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Box: Resume PDF Uploader */}
            <div className="custom-glass rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Resume (PDF format only)
                </label>
                <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                  Upload your CV in PDF. PrepBot will validate core concepts, packages, and frameworks against requirements.
                </p>
              </div>

              {/* Drag/Drop Input Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex-grow flex flex-col items-center justify-center relative min-h-[220px] ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-500/5' 
                    : resume 
                      ? 'border-slate-800 bg-slate-900/10' 
                      : 'border-slate-900 hover:border-slate-800 bg-slate-950/20'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  id="resume-upload"
                />

                <div className="flex flex-col items-center space-y-4 pointer-events-none relative z-10">
                  {resume ? (
                    <>
                      <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/25 text-indigo-400 animate-bounce-slow">
                        <FileText className="h-10 w-10" />
                      </div>
                      <div>
                        <span className="text-white font-bold block truncate max-w-[200px] text-sm">
                          {resume.name}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {(resume.size / 1024 / 1024).toFixed(2)} MB • PDF Profile
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl">
                        <Upload className="h-10 w-10" />
                      </div>
                      <div>
                        <span className="text-slate-200 font-bold block text-sm">Upload resume PDF</span>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Drag file here or click to import from folder
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {resume && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all z-30"
                    title="Remove File"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Box: Target Job Specifications */}
            <div className="flex flex-col gap-6">
              <div className="custom-glass rounded-3xl p-6 flex flex-col flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="jobDescription" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Job Description *
                  </label>
                  <span className="text-[10px] text-slate-550">Requirements specification</span>
                </div>

                {/* Quick Fill Templates */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  <button
                    type="button"
                    onClick={() => setJobDescription(templates.frontend)}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 text-slate-350 hover:text-white text-[10px] font-bold transition-all"
                  >
                    + Frontend Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobDescription(templates.fullstack)}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 text-slate-350 hover:text-white text-[10px] font-bold transition-all"
                  >
                    + Fullstack Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobDescription(templates.pm)}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 text-slate-350 hover:text-white text-[10px] font-bold transition-all"
                  >
                    + PM Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobDescription(templates.devops)}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 text-slate-350 hover:text-white text-[10px] font-bold transition-all"
                  >
                    + DevOps Template
                  </button>
                </div>

                <textarea
                  id="jobDescription"
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  className="w-full flex-grow p-3.5 bg-slate-950/40 border border-slate-900 hover:border-slate-800 focus:border-indigo-500/50 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs resize-none transition-all leading-relaxed"
                  placeholder="Paste the target job description details here, or click a template above..."
                />
              </div>

              {/* Optional focus details */}
              <div className="custom-glass rounded-3xl p-6 flex flex-col flex-1 space-y-3">
                <label htmlFor="selfDescription" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Focus Specifications (Optional)
                </label>
                <textarea
                  id="selfDescription"
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                  rows={3}
                  className="w-full flex-grow p-3 bg-slate-950/40 border border-slate-900 hover:border-slate-800 focus:border-indigo-500/50 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs resize-none transition-all leading-relaxed"
                  placeholder="e.g. Focus specifically on React hooks, system design, or keep the questions advanced level..."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-white text-slate-950 font-extrabold hover:bg-slate-100 active:scale-98 transition-all duration-200 shadow-xl flex items-center justify-center gap-2"
          >
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <span>Generate Strategy Blueprint</span>
          </button>
        </form>
      ) : (
        /* Generated Strategy Showcase UI */
        <div className="space-y-8">
          
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Alignment Complete</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">Strategic Interview Blueprint</h2>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setReport(null)}
                className="px-4 py-2.5 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Configure New</span>
              </button>

              <button
                onClick={() => navigate(`/session/${report._id}`)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl active:scale-95 transition-all shadow-lg"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run Mock Interview</span>
              </button>
            </div>
          </div>

          {/* Blueprint overview components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Score Ring */}
            {report.matchScore !== undefined && (
              <div className="custom-glass rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-indigo-400" /> Competency Alignment
                </h3>

                {/* SVG Gauge */}
                <div className="relative flex items-center justify-center mb-5">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      stroke="rgba(30, 41, 59, 0.4)"
                      fill="transparent"
                      strokeWidth={stroke}
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                    <circle
                      stroke="url(#stepperScoreGrad)"
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
                      <linearGradient id="stepperScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-black text-white">{report.matchScore}%</span>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-lg text-xs font-bold ${getScoreRating(report.matchScore).color}`}>
                  {getScoreRating(report.matchScore).label}
                </div>
              </div>
            )}

            {/* Gaps List */}
            <div className="custom-glass rounded-2xl p-6 lg:col-span-2 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-355 mb-4 flex items-center gap-1.5 border-b border-slate-900 pb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Detected Competency Discrepancies
              </h3>

              {report.skillGaps && report.skillGaps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[170px] pr-1.5 scrollbar-thin">
                  {report.skillGaps.map((gap: any, idx: number) => (
                    <div key={idx} className="bg-[#0b0e15]/65 border border-slate-900 p-3 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 truncate pr-2">{gap.skill}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
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
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-450 mb-2" />
                  <p className="text-sm font-bold text-slate-300">Resume matches job description perfectly!</p>
                  <p className="text-xs text-slate-500 mt-1">No missing dependencies or stack discrepancies detected.</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline roadmap calendar */}
          {report.preparationPlan && report.preparationPlan.length > 0 && (
            <div className="custom-glass rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-1.5 border-b border-slate-900 pb-3">
                <Calendar className="h-4 w-4 text-indigo-400" />
                Structured Preparation Timeline Path
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {report.preparationPlan.map((day: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="bg-[#0b0e15]/60 border border-slate-900 hover:border-slate-800 rounded-xl p-5 relative group transition-all duration-300"
                  >
                    <div className="absolute top-4 right-4 text-[10px] font-black text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors">
                      DAY {day.day}
                    </div>
                    
                    <h4 className="text-xs font-black text-slate-200 mb-3 uppercase tracking-wider pr-8 truncate">
                      {day.focus}
                    </h4>

                    <ul className="space-y-2.5 text-xs text-slate-450">
                      {day.tasks.map((task: string, taskIdx: number) => (
                        <li key={taskIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-indigo-500/60 rounded-full mt-1.5 flex-shrink-0" />
                          <span className="leading-relaxed">{task}</span>
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
    </div>
  );
}
