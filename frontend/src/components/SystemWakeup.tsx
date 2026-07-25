import { useState, useEffect } from 'react';
import { 
  Server, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Wifi,
  WifiOff
} from 'lucide-react';
import { wakeupService, type WakeupState } from '../services/wakeup';

export default function SystemWakeup() {
  const [state, setState] = useState<WakeupState>(wakeupService.getState());
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start waking up the services
    wakeupService.startWakeup();

    // Subscribe to state updates
    const unsubscribe = wakeupService.subscribe((newState) => {
      setState({ ...newState });

      // If any service is still loading or offline, show the indicator
      if (!newState.allOnline) {
        setShouldRender(true);
        setFadeOut(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle auto-fadeout when all services are online
  useEffect(() => {
    if (state.allOnline && shouldRender) {
      const fadeTimeout = setTimeout(() => {
        setFadeOut(true);
      }, 3000); // Show "All systems connected" for 3 seconds

      const removeTimeout = setTimeout(() => {
        setShouldRender(false);
      }, 3500); // Completely unmount after transition

      return () => {
        clearTimeout(fadeTimeout);
        clearTimeout(removeTimeout);
      };
    }
  }, [state.allOnline, shouldRender]);

  if (!shouldRender) return null;

  const serviceNames: Record<string, string> = {
    gateway: 'API Gateway',
    user: 'User & Auth Service',
    jobprep: 'JobPrep & Report Service',
    session: 'Interview Session Service'
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-full transition-all duration-500 ease-in-out transform ${
        fadeOut ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-15 pointer-events-none transition-colors duration-500 ${
          state.allOnline ? 'bg-emerald-500' : 'bg-indigo-500'
        }`} />

        {/* Header/Capsule Summary */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border transition-all duration-300 ${
              state.allOnline 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
            }`}>
              {state.allOnline ? (
                <Wifi className="h-5 w-5 animate-pulse" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                {state.allOnline ? 'All Systems Connected' : 'Connecting to Cloud...'}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                {state.allOnline 
                  ? 'All services are operational' 
                  : 'Starting backend instances (Render free tier)'}
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Detailed Services list (Collapsible) */}
        <div className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? 'max-h-60 mt-4 border-t border-slate-900 pt-4 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="space-y-3">
            {Object.entries(state.services).map(([id, status]) => (
              <div key={id} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">{serviceNames[id] || id}</span>
                <div className="flex items-center space-x-2">
                  {status === 'loading' && (
                    <>
                      <span className="text-amber-400 font-medium">Waking up...</span>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    </>
                  )}
                  {status === 'online' && (
                    <>
                      <span className="text-emerald-400 font-medium">Online</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </>
                  )}
                  {status === 'offline' && (
                    <>
                      <span className="text-rose-400 font-medium">Offline</span>
                      <XCircle className="h-4 w-4 text-rose-400" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {!state.allOnline && (
            <p className="text-[10px] text-slate-500 mt-4 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-900/60">
              💡 Render free instances spin down when inactive. Cold starts can take 40-50 seconds. Thanks for your patience!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
