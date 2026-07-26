const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL ||
  (typeof window !== 'undefined' && window.location.hostname.includes('localhost')
    ? 'http://localhost:3000'
    : 'https://prepbot-api-gateway.onrender.com');

const USER_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8080'

const JOBPREP_URL = import.meta.env.VITE_JOBPREP_SERVICE_URL || 'http://localhost:8081'

const SESSION_URL = import.meta.env.VITE_SESSION_SERVICE_URL || 'http://localhost:8082'

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
  const maxAttempts = 90; // 90 attempts * 2 seconds = 180 seconds total limit
  let attempts = 0;

  const services = [
    { id: 'gateway', url: `${GATEWAY_URL}/health` },
    { id: 'user', url: `${USER_URL}/health` },
    { id: 'jobprep', url: `${JOBPREP_URL}/health` },
    { id: 'session', url: `${SESSION_URL}/health` },
  ];

  while (attempts < maxAttempts) {
    if (state !== currentState) return;
    if (state.allOnline) return;

    // Ping each service that is not yet online
    const promises = services.map(async (service) => {
      if (state.services[service.id] === 'online') {
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(service.url, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(timeoutId);

        if (res.status === 200) {
          state.services[service.id] = 'online';
        } else {
          state.services[service.id] = 'loading';
        }
      } catch (e) {
        console.log(`Failed to ping ${service.id} (attempt ${attempts + 1}):`, e);
        state.services[service.id] = 'loading';
      }
    });

    await Promise.all(promises);

    state.allOnline = Object.values(state.services).every((s) => s === 'online');
    onUpdate();

    if (state.allOnline) {
      return;
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
