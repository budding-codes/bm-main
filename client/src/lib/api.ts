const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim();

export const API_BASE = rawApiBase.replace(/\/$/, '');
export const ADMIN_TOKEN_KEY = 'bmPromoAdminToken';

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