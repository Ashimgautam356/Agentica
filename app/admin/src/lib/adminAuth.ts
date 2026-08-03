const adminAuthKey = "agentica:admin-token";

export function clearAdminToken() {
  localStorage.removeItem(adminAuthKey);
}
