import { apiUrl } from "../config.js";
import { getAccessToken } from "./tokens.js";

/**
 * @param {string} path 须以 /api/v1 开头
 * @param {RequestInit & { body?: object, skipAuth?: boolean }} options
 */
export async function apiRequest(path, options = {}) {
  const { method = "GET", body, skipAuth = false, headers: extraHeaders, ...rest } = options;
  const headers = { ...extraHeaders };
  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
  }
  if (!skipAuth) {
    const t = getAccessToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(apiUrl(path), {
    method,
    headers,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text || res.statusText };
  }

  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || "请求失败");
    err.code = data?.code;
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
