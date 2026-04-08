/** 后端 API 根地址。开发留空则走相对路径 /api/*，由 Vite 代理到 8000；上云再设 VITE_API_BASE_URL */
const raw = import.meta.env.VITE_API_BASE_URL ?? "";
export const API_BASE_URL = String(raw).replace(/\/+$/, "");

/** @param {string} path 如 "/api/v1/health" */
export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) return p;
  return `${API_BASE_URL}${p}`;
}
