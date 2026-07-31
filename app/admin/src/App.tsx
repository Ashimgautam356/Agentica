import { Navigate, Route, Routes } from "react-router-dom";
import { useAdminData } from "./api/admin";
import { LoadingState } from "./components/LoadingState";
import { RequireAdmin } from "./components/RequireAdmin";
import { Shell } from "./components/Shell";
import { LoginPage } from "./pages/LoginPage";
import { pageRoutes, type PageKey, renderPage } from "./pages/pages";
import "./styles.css";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <RequireAdmin>
            <AdminRoutes />
          </RequireAdmin>
        }
      />
    </Routes>
  );
}

function AdminRoutes() {
  const { data, isLoading } = useAdminData();

  return (
    <Shell>
      {isLoading ? <LoadingState message="Loading admin data" /> : null}
      {data ? (
        <Routes>
          {Object.entries(pageRoutes).map(([page, path]) => (
            <Route key={page} path={path} element={renderPage(page as PageKey, data)} />
          ))}
          <Route path="/categories" element={<Navigate replace to={pageRoutes.categories} />} />
          <Route path="*" element={<Navigate replace to={pageRoutes.dashboard} />} />
        </Routes>
      ) : null}
    </Shell>
  );
}
