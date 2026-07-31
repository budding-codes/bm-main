/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Absolute base URL of the API, without a trailing slash.
   *
   * Empty in development so requests stay relative and Vite's proxy forwards
   * `/api` to the local server. Required in every production build.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
