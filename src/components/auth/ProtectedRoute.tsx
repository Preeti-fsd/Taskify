import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const ProtectedRoute = ({
  children,
  role,
}: {
  children: ReactNode;
  role?: "user" | "admin";
}) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <p>Loading session...</p>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (role && session.role !== role) {
    return <Navigate to={session.role === "admin" ? "/admin" : "/tasks"} replace />;
  }

  return children;
};

export default ProtectedRoute;
