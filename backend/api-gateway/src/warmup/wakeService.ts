import { getWarmupConfig } from "../config/warmupConfig.js";
import { retryWithBackoff } from "./retry.js";

/**
 * Wakes up a service by repeatedly calling its health endpoint.
 * @param url The base URL of the service.
 * @param serviceName The display name of the service for logging.
 */
export async function wakeService(url: string, serviceName: string): Promise<void> {
  const config = getWarmupConfig();
  const healthUrl = `${url}/health`;

  await retryWithBackoff(
    async (attempt) => {
      console.log(`[Warmup] ${serviceName} - Attempt ${attempt}`);
      
      const controller = new AbortController();
      // 15 seconds request timeout
      const requestTimeout = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(healthUrl, { signal: controller.signal });
        if (response.status === 200) {
          console.log(`[Warmup] ${serviceName} Ready`);
          return;
        }
        throw new Error(`HTTP status ${response.status}`);
      } finally {
        clearTimeout(requestTimeout);
      }
    },
    {
      maxTimeout: config.timeout,
      minDelay: config.minDelay,
      maxDelay: config.maxDelay,
    },
    serviceName
  );
}
