const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim();

export const API_BASE = rawApiBase.replace(/\/$/, '');
export const ADMIN_TOKEN_KEY = 'bmPromoAdminToken';

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

  const response = await fetch(apiUrl(path), {
    ...rest,
    headers,
    body: isPlainObject ? JSON.stringify(body) : (body as BodyInit | null | undefined)
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    onUnauthorized?.();
    throw new ApiError(401, (data as { error?: string }).error || 'Unauthorized.');
  }

  if (!response.ok) {
    throw new ApiError(response.status, (data as { error?: string }).error || 'Request failed.');
  }

  return data as T;
}
