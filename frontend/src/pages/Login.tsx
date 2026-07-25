import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { 
  GraduationCap, 
  User, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Terminal 
} from 'lucide-react';

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(usernameOrEmail, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#05070c] overflow-hidden relative">
      {/* Background radial glows */}
      <div className="premium-glow-indigo top-[-20%] left-[-20%] w-[800px] h-[800px] opacity-60" />
      <div className="premium-glow-emerald bottom-[-10%] right-[-10%] w-[600px] h-[600px] opacity-30" />

      {/* Left panel: Product showcase (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-slate-950/40 border-r border-slate-900/50 backdrop-blur-md relative z-10">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-100 bg-clip-text text-transparent">
            PrepBot
          </span>
        </div>

        <div className="space-y-8 my-auto max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Driven Preparation Platform</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Master your next <br/>
              <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Technical Interview
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload your resume and the target job description. Our advanced AI parses core competency gaps, drafts tailored study schedules, and runs mock coding & behavioral sessions.
            </p>
          </div>

          {/* Interactive Feature Cards */}
          <div className="space-y-3.5">
            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-900/20 border border-slate-900/80 hover:border-slate-800 transition-all duration-300">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                <Terminal className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Interactive Coding Workspace</h3>
                <p className="text-xs text-slate-500 mt-0.5">Simulate actual tech assessments with instant score breakdown.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-900/20 border border-slate-900/80 hover:border-slate-800 transition-all duration-300">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Detailed Gap Analytics</h3>
                <p className="text-xs text-slate-500 mt-0.5">Identify domain deficiencies and follow a day-by-day learning plan.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} PrepBot. Advanced agentic coaching for software developers.
        </div>
      </div>

      {/* Right panel: Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative z-10 lg:w-1/2">
        <div className="max-w-sm w-full space-y-8">
          
          {/* Logo & Header for Mobile */}
          <div className="text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center justify-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl mb-4">
              <GraduationCap className="h-8 w-8 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to resume your active interview preparation sessions.
            </p>
          </div>

          {/* Form */}
          <div className="bg-[#080a11]/40 border border-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-350 text-xs px-4 py-3 rounded-xl backdrop-blur-sm animate-shake">
                  {error}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="usernameOrEmail" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Username or Email
                  </label>
                  <div className="relative rounded-xl shadow-sm group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      id="usernameOrEmail"
                      name="usernameOrEmail"
                      type="text"
                      required
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-sm"
                      placeholder="Enter username or email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Password
                  </label>
                  <div className="relative rounded-xl shadow-sm group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-11 py-3 bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl shadow-white/5"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link to="/register" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                  Don't have an account? <span className="font-bold underline">Sign up</span>
                </Link>
              </div>
            </form>
          </div>

          <div className="text-center lg:hidden text-xs text-slate-550 pt-8">
            © {new Date().getFullYear()} PrepBot. Advanced agentic coaching.
          </div>
        </div>
      </div>
    </div>
  );
}
