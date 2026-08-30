const adminAuthKey = "agentica:admin-token";

export function getAdminToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(adminAuthKey);
}

export function setAdminToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(adminAuthKey, token);
}

export function clearAdminToken() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(adminAuthKey);
}
