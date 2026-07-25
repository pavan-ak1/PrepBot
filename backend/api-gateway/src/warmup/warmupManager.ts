import { SERVICES } from "../config/services.js";
import { getWarmupConfig } from "../config/warmupConfig.js";
import { wakeService } from "./wakeService.js";
import { WarmupResult } from "./types.js";

let lastWarmedTimestamp: number | null = null;
let activeWarmupPromise: Promise<WarmupResult> | null = null;

const servicesToWarm = [
  { name: "User Service", url: SERVICES.USER },
  { name: "JobPrep Service", url: SERVICES.JOBPREP },
  { name: "Session Service", url: SERVICES.SESSION },
];

export async function warmup(): Promise<WarmupResult> {
  const config = getWarmupConfig();

  // 1. Check cache
  if (lastWarmedTimestamp !== null && (Date.now() - lastWarmedTimestamp) < config.cacheDuration) {
    return { success: true };
  }

  // 2. Reuse active warmup promise if one is already running
  if (activeWarmupPromise) {
    return activeWarmupPromise;
  }

  // 3. Define the actual warm-up execution
  const executeWarmup = async (): Promise<WarmupResult> => {
    console.log("[Warmup] Starting warmup...");

    const promises = servicesToWarm.map(async (service) => {
      try {
        await wakeService(service.url, service.name);
        return { name: service.name, success: true };
      } catch (error) {
        return { name: service.name, success: false };
      }
    });

    const results = await Promise.all(promises);
    const failedServices = results
      .filter((r) => !r.success)
      .map((r) => r.name);

    if (failedServices.length > 0) {
      return {
        success: false,
        failedServices,
      };
    }

    console.log("[Warmup] All services are ready.");
    lastWarmedTimestamp = Date.now();
    return { success: true };
  };

  // Assign the promise and clean it up when completed (either success or fail)
  activeWarmupPromise = executeWarmup().finally(() => {
    activeWarmupPromise = null;
  });

  return activeWarmupPromise;
}

export function resetWarmupCache(): void {
  lastWarmedTimestamp = null;
}
