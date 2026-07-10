import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

type Props = {
  children: ReactNode;
};

const AdminRoute = ({ children }: Props) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== "admin") {
    // If authenticated but not an admin, redirect to member profile
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default AdminRoute;
