import { useQuery } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";
import { currentAdminQueryOptions, useAdminData } from "./api/admin";
import { LoadingState } from "./components/LoadingState";
import { RequireAdmin, RequireVerifiedAdmin } from "./components/RequireAdmin";
import { Shell } from "./components/Shell";
import { LoginPage } from "./pages/LoginPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { pageRoutes, type PageKey, renderPage } from "./pages/pages";
import "./styles.css";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
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
  const { data, isLoading } = useAdminData();
  const { data: admin } = useQuery(currentAdminQueryOptions());
  const allowedRoutes = Object.entries(pageRoutes).filter(
    ([page]) => admin?.role === "SUPER_ADMIN" || page !== "admins",
  );

  return (
    <Shell>
      {isLoading ? <LoadingState message="Loading admin data" /> : null}
      {data ? (
        <Routes>
          {allowedRoutes.map(([page, path]) => (
            <Route key={page} path={path} element={renderPage(page as PageKey, data)} />
          ))}
          <Route path="/categories" element={<Navigate replace to={pageRoutes.categories} />} />
          <Route path="*" element={<Navigate replace to={pageRoutes.dashboard} />} />
        </Routes>
      ) : null}
    </Shell>
  );
}
