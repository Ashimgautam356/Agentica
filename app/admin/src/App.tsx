import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  adminsQueryOptions,
  currentAdminQueryOptions,
  emptyAdminData,
  useAdminData,
} from "./api/admin";
import { RequireAdmin, RequireVerifiedAdmin } from "./components/RequireAdmin";
import { Shell } from "./components/Shell";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { pageRoutes, type PageKey, renderPage } from "./pages/pages";
import "./styles.css";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/verify-email"
        element={
          <RequireAdmin>
            <VerifyEmailPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/*"
        element={
          <RequireAdmin>
            <RequireVerifiedAdmin>
              <AdminRoutes />
            </RequireVerifiedAdmin>
          </RequireAdmin>
        }
      />
    </Routes>
  );
}

function AdminRoutes() {
  const { data: admin } = useQuery(currentAdminQueryOptions());
  const allowedRoutes = Object.entries(pageRoutes).filter(
    ([page]) => admin?.role === "SUPER_ADMIN" || page !== "admins",
  );

  return (
    <Shell>
      <Routes>
        {allowedRoutes.map(([page, path]) => (
          <Route key={page} path={path} element={<AdminPage page={page as PageKey} />} />
        ))}
        <Route path="*" element={<Navigate replace to={pageRoutes.dashboard} />} />
      </Routes>
    </Shell>
  );
}

const aggregatePages = new Set<PageKey>([
  "dashboard",
  "ai",
  "mcp",
  "analytics",
  "audit",
  "settings",
]);

function AdminPage({ page }: { page: PageKey }) {
  const queryClient = useQueryClient();
  const { data: admin } = useQuery(currentAdminQueryOptions());
  const needsAggregateData = aggregatePages.has(page);
  const { data, error, isLoading } = useAdminData(needsAggregateData);

  useEffect(() => {
    if (page === "dashboard" && !error && !isLoading && admin?.role === "SUPER_ADMIN") {
      void queryClient.prefetchQuery(adminsQueryOptions());
    }
  }, [admin?.role, error, isLoading, page, queryClient]);

  return renderPage(
    page,
    needsAggregateData ? data : emptyAdminData,
    needsAggregateData ? isLoading : false,
    needsAggregateData ? error : null,
  );
}
