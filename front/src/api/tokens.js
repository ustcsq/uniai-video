const ACCESS = "uniai_access_token";
const REFRESH = "uniai_refresh_token";

export function getAccessToken() {
  return localStorage.getItem(ACCESS) || "";
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH) || "";
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem(ACCESS, accessToken);
  localStorage.setItem(REFRESH, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}
