/**
 * token.js — Centralised JWT token helpers
 *
 * All token read/write operations go through here so that
 * changing the storage strategy (e.g. to httpOnly cookie) only
 * requires editing this single file.
 */

const ACCESS_KEY = 'tm_access_token';
const REFRESH_KEY = 'tm_refresh_token';

// ─── Access Token ──────────────────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const setAccessToken = (token) => localStorage.setItem(ACCESS_KEY, token);
export const removeAccessToken = () => localStorage.removeItem(ACCESS_KEY);

// ─── Refresh Token ─────────────────────────────────────────────────────────────
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const setRefreshToken = (token) => localStorage.setItem(REFRESH_KEY, token);
export const removeRefreshToken = () => localStorage.removeItem(REFRESH_KEY);

// ─── Store Both ────────────────────────────────────────────────────────────────
export const storeTokens = ({ accessToken, refreshToken }) => {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
};

// ─── Clear Both ────────────────────────────────────────────────────────────────
export const clearTokens = () => {
  removeAccessToken();
  removeRefreshToken();
};

// ─── Decode JWT Payload (no verification) ─────────────────────────────────────
export const decodeToken = (token) => {
  try {
    const base64 = token.split('.')[1];
    const decoded = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

// ─── Check if access token is expired ────────────────────────────────────────
export const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 >= payload.exp;
};
