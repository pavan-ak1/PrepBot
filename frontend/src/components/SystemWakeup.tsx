import { useState, useEffect } from 'react';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Wifi,
  Server
} from 'lucide-react';
import { wakeupService, type WakeupState } from '../services/wakeup';

interface SystemWakeupProps {
  onReady: () => void;
}

export default function SystemWakeup({ onReady }: SystemWakeupProps) {
  const [state, setState] = useState<WakeupState>(wakeupService.getState());

  useEffect(() => {
    // Start waking up the services
    wakeupService.startWakeup();

    // Subscribe to state updates
    const unsubscribe = wakeupService.subscribe((newState) => {
      setState({ ...newState });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle auto-unlock when all services are online
  useEffect(() => {
    if (state.allOnline) {
      const readyTimeout = setTimeout(() => {
        onReady();
      }, 1500); // 1.5s delay to show completed animation status

      return () => {
        clearTimeout(readyTimeout);
      };
    }
  }, [state.allOnline, onReady]);

  const handleRetry = () => {
    wakeupService.reset();
    wakeupService.startWakeup(true);
  };

  const serviceNames: Record<string, string> = {
    gateway: 'API Gateway',
    user: 'User & Auth Service',
    jobprep: 'JobPrep & Report Service',
    session: 'Interview Session Service'
  };

  const totalServices = Object.keys(state.services).length;
  const onlineServices = Object.values(state.services).filter((s) => s === 'online').length;
  const progressPercent = totalServices > 0 ? (onlineServices / totalServices) * 100 : 0;
  const hasOffline = Object.values(state.services).includes('offline');

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#060814] via-[#0b0f19] to-[#04060d] text-white p-4">
      {/* Glow decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse" />

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Glow effect on the container border */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-15 pointer-events-none transition-colors duration-500 ${
          state.allOnline ? 'bg-emerald-500' : 'bg-indigo-500'
        }`} />

        {/* Center Animated Logo / Icon */}
        <div className="relative inline-flex mb-6">
          <div className={`p-4 rounded-2xl border bg-slate-950/60 transition-all duration-500 ${
            state.allOnline 
              ? 'border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10' 
              : 'border-indigo-500/30 text-indigo-400'
          }`}>
            {state.allOnline ? (
              <Wifi className="h-10 w-10 animate-bounce" />
            ) : (
              <Server className="h-10 w-10 animate-pulse" />
            )}
          </div>
          <span className="absolute -inset-1 rounded-2xl border border-dashed border-indigo-500/20 animate-[spin_12s_linear_infinite] pointer-events-none" />
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">
          PrepBot System Warmup
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          {state.allOnline 
            ? 'All systems connected! Starting application...' 
            : 'Starting cloud backend instances (Render free tier). This may take a few minutes if they are sleeping.'}
        </p>

        {/* Progress Bar */}
        <div className="mt-8 mb-6 text-left max-w-sm mx-auto">
          <div className="flex justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Connection Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Detailed Services Status */}
        <div className="space-y-3 text-left bg-slate-950/40 p-4 rounded-2xl border border-slate-900/60 max-w-sm mx-auto">
          {Object.entries(state.services).map(([id, status]) => (
            <div key={id} className="flex items-center justify-between py-1.5 border-b border-slate-900/40 last:border-0">
              <span className="text-xs text-slate-300 font-semibold">{serviceNames[id] || id}</span>
              <div className="flex items-center space-x-2">
                {status === 'loading' && (
                  <>
                    <span className="text-[11px] text-amber-400 font-medium">Waking up...</span>
                    <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                  </>
                )}
                {status === 'online' && (
                  <>
                    <span className="text-[11px] text-emerald-400 font-medium">Online</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </>
                )}
                {status === 'offline' && (
                  <>
                    <span className="text-[11px] text-rose-400 font-medium">Offline</span>
                    <XCircle className="h-3.5 w-3.5 text-rose-400" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Offline Warning & Retry Action */}
        {hasOffline && (
          <div className="mt-6 animate-fade-in">
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs rounded-xl p-3.5 mb-4 text-left max-w-sm mx-auto flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-rose-300">Connection Timeout</h5>
                <p className="mt-0.5 leading-relaxed text-rose-400/80">
                  One or more services did not wake up in time. Click below to try connecting again.
                </p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/25 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Retry Connection</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

