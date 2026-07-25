import { WarmupConfig } from "../warmup/types.js";

export function getWarmupConfig(): WarmupConfig {
  return {
    timeout: process.env.WARMUP_TIMEOUT_MS ? parseInt(process.env.WARMUP_TIMEOUT_MS, 10) : 180000,
    minDelay: process.env.WARMUP_MIN_DELAY_MS ? parseInt(process.env.WARMUP_MIN_DELAY_MS, 10) : 1000,
    maxDelay: process.env.WARMUP_MAX_DELAY_MS ? parseInt(process.env.WARMUP_MAX_DELAY_MS, 10) : 10000,
    cacheDuration: process.env.WARMUP_CACHE_DURATION_MS ? parseInt(process.env.WARMUP_CACHE_DURATION_MS, 10) : 300000,
  };
}
