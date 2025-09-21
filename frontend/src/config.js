// Centralized API configuration for the frontend
// Set VITE_API_BASE_URL in your environment (e.g., .env or hosting provider) to your Render backend URL
// Example: VITE_API_BASE_URL=https://your-backend.onrender.com

const rawBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
// Remove possible trailing slash
export const API_BASE_URL = rawBase.replace(/\/$/, "");

// Convenience prefixes
export const API_URL = `${API_BASE_URL}/api`;
export const PUBLIC_API_URL = `${API_BASE_URL}/api/public`;

// Helper to resolve server-hosted asset paths that might be returned as relative '/uploads/..'
export function resolveAssetUrl(value) {
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("blob:")) return value;
  return `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}
