import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router-dom";
import { currentAdminQueryOptions } from "../api/admin";
import { clearAdminToken } from "../lib/adminAuth";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { error, isLoading } = useQuery(currentAdminQueryOptions());

  if (isLoading) {
    return null;
  }

  if (error) {
    clearAdminToken();
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return children;
}
