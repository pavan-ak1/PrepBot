import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap, 
  User, 
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const user = authService.getCurrentUserFromStorage();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Generate Prep Report',
      path: '/generate-report',
      icon: PlusCircle
    }
  ];

  return (
    <div className="min-h-screen bg-[#05070c] text-slate-100 flex overflow-hidden bg-grid-pattern relative">
      {/* Background Glows */}
      <div className="premium-glow-indigo top-[-10%] left-[-10%] w-[600px] h-[600px] animate-pulse-slow" />
      <div className="premium-glow-emerald bottom-[-10%] right-[-10%] w-[500px] h-[500px]" />

      {/* Sidebar for Desktop */}
      <aside 
        className={`hidden md:flex flex-col border-r border-slate-900 bg-[#080a10]/80 backdrop-blur-xl transition-all duration-300 relative z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-[-12px] top-6 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-1 rounded-full hover:border-indigo-500/50 transition-all shadow-md z-40"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Brand/Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-900/50">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            {!collapsed && (
              <span className="font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-indigo-100 to-indigo-300 bg-clip-text text-transparent text-lg">
                PrepBot
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 border border-transparent'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                {!collapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-900/50 bg-[#06080d]/40">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-200 truncate">{user?.username || 'Candidate'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || 'user@prepbot.ai'}</p>
              </div>
            )}
          </div>

          {!collapsed ? (
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/5 hover:bg-rose-600 border border-rose-500/10 hover:border-rose-500 transition-all duration-200"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center p-2 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden w-full h-16 bg-[#080a10]/80 backdrop-blur-xl border-b border-slate-900 px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-100 bg-clip-text text-transparent text-base">
            PrepBot
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        >
          <aside 
            className="w-64 h-full bg-[#080a10] border-r border-slate-900 p-6 flex flex-col space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-extrabold tracking-tight text-white text-base">PrepBot</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30' 
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-900 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{user?.username}</p>
                  <p className="text-[10px] text-slate-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/5 hover:bg-rose-600 border border-rose-500/10 hover:border-rose-500 transition-all duration-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pt-0 pt-16 h-screen overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
