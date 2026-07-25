import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  Terminal, 
  TrendingUp 
} from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authService.register(username, email, password);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
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
              Build confidence & <br/>
              <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Get Hired Fast
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Create an account to benchmark your resume, generate target role prep checklists, and practice interactive mock interviews evaluated by advanced AI scoring agents.
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

        <div className="text-xs text-slate-550">
          © {new Date().getFullYear()} PrepBot. Advanced agentic coaching for software developers.
        </div>
      </div>

      {/* Right panel: Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative z-10 lg:w-1/2">
        <div className="max-w-sm w-full space-y-6">
          
          {/* Logo & Header for Mobile */}
          <div className="text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center justify-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl mb-4">
              <GraduationCap className="h-8 w-8 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Create account
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Start practicing with our mock interview simulation panels.
            </p>
          </div>

          {/* Form */}
          <div className="bg-[#080a11]/40 border border-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-350 text-xs px-4 py-3 rounded-xl backdrop-blur-sm animate-shake">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Username
                  </label>
                  <div className="relative rounded-xl shadow-sm group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-sm"
                      placeholder="johndoe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Email address
                  </label>
                  <div className="relative rounded-xl shadow-sm group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-550 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative rounded-xl shadow-sm group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-550 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-11 py-2.5 bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-550 hover:text-slate-350"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative rounded-xl shadow-sm group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-550 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-11 py-2.5 bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl shadow-white/5"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </span>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                  Already have an account? <span className="font-bold underline">Sign in</span>
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
