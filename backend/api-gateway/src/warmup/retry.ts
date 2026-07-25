import { RetryOptions } from "./types.js";

export async function retryWithBackoff<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions,
  serviceName: string
): Promise<T> {
  const { maxTimeout, minDelay, maxDelay } = options;
  const startTime = Date.now();
  let attempt = 1;

  while (true) {
    try {
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxTimeout) {
        throw new Error(`Timeout of ${maxTimeout}ms reached`);
      }

      return await operation(attempt);
    } catch (error) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxTimeout) {
        throw error;
      }

      // Calculate exponential backoff: minDelay * 2^(attempt - 1)
      const nextDelay = Math.min(minDelay * Math.pow(2, attempt - 1), maxDelay);
      
      console.warn(
        `[Warmup] ${serviceName} - Attempt ${attempt} failed. Retrying in ${nextDelay}ms... Error: ${error instanceof Error ? error.message : String(error)}`
      );

      const remainingTime = maxTimeout - elapsed;
      if (remainingTime <= 0) {
        throw new Error(`Timeout of ${maxTimeout}ms reached`);
      }

      const delayToUse = Math.min(nextDelay, remainingTime);
      await new Promise((resolve) => setTimeout(resolve, delayToUse));
      attempt++;
    }
  }
}
