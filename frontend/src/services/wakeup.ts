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
  const maxRetries = 300; // 300 retries * 3 seconds = 15 min limit
  let attempts = 0;
  const gatewayUrl = `${GATEWAY_URL}/health`;
  
  let gatewayOnline = false;
  let serviceUrls: Record<string, string> = {};

  while (attempts < maxRetries) {
    if (state !== currentState) return;
    if (state.allOnline) return;

    try {
      // 1. Check Gateway first if not already online
      if (!gatewayOnline) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s request timeout
        
        const res = await fetch(gatewayUrl, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          gatewayOnline = true;
          state.services.gateway = 'online';
          if (data.serviceUrls) {
            serviceUrls = data.serviceUrls;
          }
          onUpdate();
        } else {
          state.services.gateway = 'loading';
          onUpdate();
        }
      }

      // 2. If Gateway is online, ping downstream microservices directly from browser
      if (gatewayOnline && Object.keys(serviceUrls).length > 0) {
        const pingPromises = Object.entries(serviceUrls).map(async ([id, url]) => {
          if (!url) {
            state.services[id] = 'loading';
            return;
          }
          if (state.services[id] === 'online') return;

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for each service check
            const res = await fetch(url, {
              method: 'GET',
              signal: controller.signal,
              cache: 'no-store',
            });
            clearTimeout(timeoutId);

            if (res.ok) {
              state.services[id] = 'online';
            } else {
              state.services[id] = 'loading';
            }
          } catch (e) {
            state.services[id] = 'loading';
          }
        });

        await Promise.all(pingPromises);

        // Check if all services are online
        const allServicesOnline = Object.entries(state.services).every(([_, status]) => status === 'online');
        if (allServicesOnline) {
          state.allOnline = true;
          onUpdate();
          return;
        }
        onUpdate();
      }
    } catch (e) {
      console.log(`Failed to poll health (attempt ${attempts + 1}):`, e);
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
