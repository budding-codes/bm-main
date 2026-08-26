/**
 * Where the API lives.
 *
 * `VITE_API_BASE_URL` is inlined at build time, so it must be set in the hosting
 * provider's environment before the production build runs — changing it later has
 * no effect until the frontend is rebuilt.
 *
 * Left empty in development: requests stay relative and Vite's dev server proxies
 * `/api` to the local backend, which keeps development same-origin and free of
 * CORS entirely.
 */
const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim();

export const API_BASE = rawApiBase.replace(/\/+$/, '');
export const ADMIN_TOKEN_KEY = 'bmPromoAdminToken';

if (import.meta.env.PROD && !API_BASE) {
  // Without a base URL the bundle calls its own origin, where the SPA rewrite
  // answers every /api path with index.html and the failure looks like a CORS or
  // JSON parsing error rather than missing configuration.
  console.error(
    '[api] VITE_API_BASE_URL is not set in this production build. API requests will ' +
      'be sent to the site origin and will not reach the backend.'
  );
}

if (API_BASE && !/^https?:\/\//i.test(API_BASE)) {
  console.error(`[api] VITE_API_BASE_URL must be an absolute http(s) URL. Received: ${API_BASE}`);
}

if (import.meta.env.PROD && API_BASE.startsWith('http://')) {
  // An https page cannot call an http API: the browser blocks it as mixed content.
  console.error('[api] VITE_API_BASE_URL uses http:// in a production build. Use https://.');
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function apiUrl(path: string) {
  if (!API_BASE) {
    return path;
  }

  return `${API_BASE}${path}`;
}

export function getAdminToken() {
  return window.localStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export function setAdminToken(token: string) {
  if (!token) {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    return;
  }

  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

/**
 * Builds headers for admin requests.
 *
 * When `body` is FormData, Content-Type must be omitted so the browser can set
 * the multipart boundary itself. Pass `includeJson: true` only for JSON bodies.
 */
export function buildAdminHeaders(token: string, includeJson = false) {
  const headers: Record<string, string> = {
    Accept: 'application/json'
  };

  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

type AdminFetchOptions = Omit<RequestInit, 'body'> & {
  token?: string;
  body?: BodyInit | Record<string, unknown> | null;
  /** Called when the server returns 401 so the auth layer can clear the session. */
  onUnauthorized?: () => void;
};

/**
 * Shared fetch for admin endpoints. Parses JSON, surfaces `{ error }` messages,
 * and notifies the caller of expired sessions.
 */
export async function adminFetch<T = unknown>(path: string, options: AdminFetchOptions = {}): Promise<T> {
  const {
    token = getAdminToken(),
    body,
    onUnauthorized,
    headers: extraHeaders,
    ...rest
  } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isPlainObject = Boolean(body) && typeof body === 'object' && !isFormData && !(body instanceof Blob);

  const headers = {
    ...buildAdminHeaders(token, isPlainObject),
    ...(extraHeaders as Record<string, string> | undefined)
  };

  let response: Response;

  try {
    response = await fetch(apiUrl(path), {
      ...rest,
      headers,
      body: isPlainObject ? JSON.stringify(body) : (body as BodyInit | null | undefined)
    });
  } catch {
    // fetch rejects without a status for DNS failures, a blocked CORS preflight and
    // offline clients alike. The browser's bare "Failed to fetch" is not actionable,
    // so it is replaced with something a user can report and a developer can trace.
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    onUnauthorized?.();
    throw new ApiError(401, (data as { error?: string }).error || 'Unauthorized.');
  }

  if (!response.ok) {
    const payload = data as { error?: string; code?: string };
    if (payload.code === 'BACKEND_UNAVAILABLE' || response.status === 503) {
      throw new ApiError(
        503,
        payload.error || 'API server is not running. Start it from the server folder: npm run dev'
      );
    }

    throw new ApiError(response.status, payload.error || 'Request failed.');
  }

  return data as T;
}
