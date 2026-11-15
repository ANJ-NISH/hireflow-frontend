import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { getUser, type StoredUser } from "../lib/auth";

type Role = StoredUser["role"];

function AccessDenied() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-display text-xl font-semibold text-ink">You don't have access to this page</p>
        <p className="mt-2 text-sm text-ink-soft">This area is for a different type of account.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-deep"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const location = useLocation();
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  return getUser() ? <Navigate to="/" replace /> : <Outlet />;
}