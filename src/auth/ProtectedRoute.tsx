import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { User } from "@/shared/mockData";

type Props = {
  children: ReactNode;
  role?: User["role"];
};

const ProtectedRoute = ({ children, role }: Props) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/profile"} replace />;
  }

  return children;
};

export default ProtectedRoute;
