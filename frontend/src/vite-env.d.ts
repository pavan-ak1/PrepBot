/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_GATEWAY_URL?: string;
  readonly VITE_USER_SERVICE_URL?: string;
  readonly VITE_JOBPREP_SERVICE_URL?: string;
  readonly VITE_SESSION_SERVICE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
