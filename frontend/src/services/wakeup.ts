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

const serviceNameMap: Record<string, string> = {
  "User Service": "user",
  "JobPrep Service": "jobprep",
  "Session Service": "session",
};

const pollHealth = async (onUpdate: () => void, state: WakeupState) => {
  const maxRetries = 15; // 15 retries * 5 seconds = 75 seconds limit for Gateway itself to respond
  let attempts = 0;

  while (attempts < maxRetries) {
    if (state !== currentState) return;
    if (state.allOnline) return;

    try {
      const controller = new AbortController();
      // Allow up to 4 minutes for the entire warm-up manager to complete and respond
      const timeoutId = setTimeout(() => controller.abort(), 240000);

      const url = `${GATEWAY_URL}/warmup`;

      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (res.status === 200) {
        state.services.gateway = 'online';
        state.services.user = 'online';
        state.services.jobprep = 'online';
        state.services.session = 'online';
        state.allOnline = true;
        onUpdate();
        return;
      } else if (res.status === 503) {
        const data = await res.json();
        const failedList: string[] = data.failedServices || [];
        
        state.services.gateway = 'online';
        state.services.user = 'online';
        state.services.jobprep = 'online';
        state.services.session = 'online';

        failedList.forEach((failedName) => {
          const serviceId = serviceNameMap[failedName];
          if (serviceId) {
            state.services[serviceId] = 'offline';
          }
        });

        state.allOnline = false;
        onUpdate();
        return;
      } else {
        throw new Error(`Unexpected HTTP status ${res.status}`);
      }
    } catch (e) {
      console.log(`Failed to fetch gateway warmup (attempt ${attempts + 1}):`, e);
      state.services.gateway = 'loading';
      state.services.user = 'loading';
      state.services.jobprep = 'loading';
      state.services.session = 'loading';
      state.allOnline = false;
      onUpdate();
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 5000));
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
