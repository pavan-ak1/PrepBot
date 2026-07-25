const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('localhost')
    ? 'http://localhost:3000'
    : 'https://prepbot-api-gateway.onrender.com');

export interface WakeupState {
  services: Record<string, 'loading' | 'online' | 'offline'>;
  allOnline: boolean;
}

export type StatusListener = (state: WakeupState) => void;

let listeners: StatusListener[] = [];
let currentState: WakeupState = {
  services: {
    gateway: 'loading',
    user: 'loading',
    jobprep: 'loading',
    session: 'loading',
  },
  allOnline: false,
};
let isTriggered = false;


const pollHealth = async (onUpdate: () => void, state: WakeupState, force = false) => {
  const maxAttempts = 90; // 90 attempts * 2 seconds = 180 seconds total limit
  let attempts = 0;
  let forceParam = force;

  while (attempts < maxAttempts) {
    if (state !== currentState) return;
    if (state.allOnline) return;

    try {
      const controller = new AbortController();
      // Fast timeout per poll request since it returns immediately
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const url = `${GATEWAY_URL}/warmup` + (forceParam ? '?force=true' : '');
      forceParam = false; // Only send force on the first poll request

      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (res.status === 200) {
        const data = await res.json();
        
        if (data.services) {
          state.services = { ...data.services };
        }
        state.allOnline = data.ready;
        onUpdate();

        if (data.ready) {
          return;
        }

        if (!data.isWarmingUp) {
          // Warmup run has completed, but not all services are ready (timed out/offline)
          return;
        }
      } else {
        throw new Error(`Unexpected HTTP status ${res.status}`);
      }
    } catch (e) {
      console.log(`Failed to fetch gateway warmup status (attempt ${attempts + 1}):`, e);
      state.services.gateway = 'loading';
      onUpdate();
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // After max retries, mark any unresolved services as offline
  Object.entries(state.services).forEach(([id, status]) => {
    if (status === 'loading') {
      state.services[id] = 'offline';
    }
  });
  state.allOnline = Object.values(state.services).every((s) => s === 'online');
  onUpdate();
};


export const wakeupService = {
  subscribe(listener: StatusListener) {
    listeners.push(listener);
    listener(currentState);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  getState() {
    return currentState;
  },

  startWakeup(force = false) {
    if (isTriggered && !force) return;
    isTriggered = true;

    const notify = () => {
      listeners.forEach((l) => l(currentState));
    };

    pollHealth(notify, currentState, force);
  },

  reset() {
    isTriggered = false;
    currentState = {
      services: {
        gateway: 'loading',
        user: 'loading',
        jobprep: 'loading',
        session: 'loading',
      },
      allOnline: false,
    };
    listeners.forEach((l) => l(currentState));
  },
};
