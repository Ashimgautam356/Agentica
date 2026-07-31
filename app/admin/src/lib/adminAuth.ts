const adminAuthKey = "agentica:admin-token";

export function getAdminToken() {
  return localStorage.getItem(adminAuthKey);
}

export function setAdminToken(token = "authenticated") {
  localStorage.setItem(adminAuthKey, token);
}

export function clearAdminToken() {
  localStorage.removeItem(adminAuthKey);
}

export function isAdminAuthenticated() {
  return Boolean(getAdminToken());
}
