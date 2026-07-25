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

const pollHealth = async (onUpdate: () => void, state: WakeupState) => {
  const maxRetries = 20; // 20 retries * 3 seconds = 60s timeout limit
  let attempts = 0;
  const url = `${GATEWAY_URL}/health`;

  while (attempts < maxRetries) {
    if (state !== currentState) return;
    if (state.allOnline) return;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s request timeout

      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.services) {
          Object.entries(data.services).forEach(([id, status]) => {
            state.services[id] = status as 'online' | 'loading' | 'offline';
          });
          
          state.allOnline = data.status === 'UP';
          onUpdate();
          
          if (state.allOnline) return;
        }
      } else {
        // Gateway responded but with error; keep/set status to loading
        Object.keys(state.services).forEach((id) => {
          state.services[id] = 'loading';
        });
        onUpdate();
      }
    } catch (e) {
      console.log(`Failed to fetch gateway health (attempt ${attempts + 1}):`, e);
      // Network/CORS error or timeout; Gateway itself is waking up
      Object.keys(state.services).forEach((id) => {
        state.services[id] = 'loading';
      });
      onUpdate();
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 3000));
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

  startWakeup() {
    if (isTriggered) return;
    isTriggered = true;

    const notify = () => {
      listeners.forEach((l) => l(currentState));
    };

    pollHealth(notify, currentState);
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
