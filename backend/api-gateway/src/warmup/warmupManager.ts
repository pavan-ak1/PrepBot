import { SERVICES } from "../config/services.js";
import { getWarmupConfig } from "../config/warmupConfig.js";
import { wakeService } from "./wakeService.js";
import { ServiceStatus, WarmupStatusResult } from "./types.js";

let lastWarmedTimestamp: number | null = null;
let isWarmingUp = false;

const servicesToWarm = [
  { name: "User Service", url: SERVICES.USER },
  { name: "JobPrep Service", url: SERVICES.JOBPREP },
  { name: "Session Service", url: SERVICES.SESSION },
];

const serviceNameMap: Record<string, keyof ServiceStatus> = {
  "User Service": "user",
  "JobPrep Service": "jobprep",
  "Session Service": "session",
};

const currentStatus: ServiceStatus = {
  gateway: "online",
  user: "loading",
  jobprep: "loading",
  session: "loading",
};

export function getWarmupStatus(): WarmupStatusResult {
  const allOnline =
    currentStatus.user === "online" &&
    currentStatus.jobprep === "online" &&
    currentStatus.session === "online";

  const failedServices: string[] = [];
  if (currentStatus.user === "offline") failedServices.push("User Service");
  if (currentStatus.jobprep === "offline") failedServices.push("JobPrep Service");
  if (currentStatus.session === "offline") failedServices.push("Session Service");

  return {
    ready: allOnline,
    isWarmingUp,
    services: { ...currentStatus },
    failedServices,
  };
}

export async function warmup(force = false): Promise<WarmupStatusResult> {
  const config = getWarmupConfig();

  if (force) {
    lastWarmedTimestamp = null;
    isWarmingUp = false;
    currentStatus.user = "loading";
    currentStatus.jobprep = "loading";
    currentStatus.session = "loading";
  }

  // 1. Check cache
  if (
    lastWarmedTimestamp !== null &&
    Date.now() - lastWarmedTimestamp < config.cacheDuration
  ) {
    currentStatus.user = "online";
    currentStatus.jobprep = "online";
    currentStatus.session = "online";
    return getWarmupStatus();
  }

  // 2. Trigger background warmup if not already warming up
  if (!isWarmingUp) {
    isWarmingUp = true;

    // Set all to loading when starting a fresh warmup cycle
    currentStatus.user = "loading";
    currentStatus.jobprep = "loading";
    currentStatus.session = "loading";

    const promises = servicesToWarm.map(async (service) => {
      const serviceKey = serviceNameMap[service.name];
      try {
        await wakeService(service.url, service.name);
        if (serviceKey) {
          currentStatus[serviceKey] = "online";
        }
      } catch (error) {
        console.error(`[Warmup] failed to warm ${service.name}:`, error);
        if (serviceKey) {
          currentStatus[serviceKey] = "offline";
        }
      }
    });

    // Handle resolution of all wakers in background
    Promise.all(promises).then(() => {
      isWarmingUp = false;
      const allOnline =
        currentStatus.user === "online" &&
        currentStatus.jobprep === "online" &&
        currentStatus.session === "online";
      if (allOnline) {
        lastWarmedTimestamp = Date.now();
      }
    }).catch((err) => {
      console.error("[Warmup Background Error]:", err);
      isWarmingUp = false;
    });
  }

  // Return the immediate status of the warmup process
  return getWarmupStatus();
}

export function resetWarmupCache(): void {
  lastWarmedTimestamp = null;
  currentStatus.user = "loading";
  currentStatus.jobprep = "loading";
  currentStatus.session = "loading";
}

