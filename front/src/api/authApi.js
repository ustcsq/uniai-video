import { apiRequest } from "./client.js";
import { clearTokens, getRefreshToken, setTokens } from "./tokens.js";

export async function sendSms(phone) {
  return apiRequest("/api/v1/auth/sms/send", {
    method: "POST",
    body: { phone },
    skipAuth: true,
  });
}

export async function smsLogin(phone, code) {
  const data = await apiRequest("/api/v1/auth/sms/login", {
    method: "POST",
    body: { phone, code: code.trim() },
    skipAuth: true,
  });
  setTokens(data.access_token, data.refresh_token);
  return data;
}

export async function refreshSession() {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const data = await apiRequest("/api/v1/auth/refresh", {
      method: "POST",
      body: { refresh_token: rt },
      skipAuth: true,
    });
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

export async function fetchMe() {
  return apiRequest("/api/v1/user/me", { method: "GET" });
}

export async function updateMe(payload) {
  return apiRequest("/api/v1/user/me", { method: "PUT", body: payload });
}

export async function fetchCredits() {
  return apiRequest("/api/v1/user/me/credits", { method: "GET" });
}

export function logout() {
  clearTokens();
}

/** 阶段0：可选探测后端是否可用 */
export async function fetchHealth() {
  return apiRequest("/api/v1/health", { method: "GET", skipAuth: true });
}
