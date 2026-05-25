// In dev, requests go through the Vite proxy (see vite.config.ts).
// In production, set VITE_API_BASE_URL to your deployed API URL.
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
