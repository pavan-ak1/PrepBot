export interface RetryOptions {
  maxTimeout: number; // Configurable overall timeout in ms
  minDelay: number;   // Configurable initial retry interval in ms
  maxDelay: number;   // Configurable maximum retry interval in ms
}

export interface WarmupConfig {
  timeout: number;
  minDelay: number;
  maxDelay: number;
  cacheDuration: number;
}

export interface ServiceConfig {
  name: string;
  url: string;
}

export interface WarmupResult {
  success: boolean;
  failedServices?: string[];
}

export interface ServiceStatus {
  gateway: 'online' | 'offline' | 'loading';
  user: 'online' | 'offline' | 'loading';
  jobprep: 'online' | 'offline' | 'loading';
  session: 'online' | 'offline' | 'loading';
}

export interface WarmupStatusResult {
  ready: boolean;
  isWarmingUp: boolean;
  services: ServiceStatus;
  failedServices: string[];
}

