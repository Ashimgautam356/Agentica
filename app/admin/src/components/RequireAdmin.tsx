import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "../api/client";
import { clearAdminToken } from "../lib/adminAuth";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    let isMounted = true;

    api("/api/admin/me")
      .then(() => {
        if (isMounted) {
          setStatus("allowed");
        }
      })
      .catch(() => {
        clearAdminToken();

        if (isMounted) {
          setStatus("denied");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "checking") {
    return null;
  }

  if (status === "denied") {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return children;
}
