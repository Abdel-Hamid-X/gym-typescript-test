import type { User } from "@/shared/mockData";

export const getRoleHome = (role?: User["role"]) => {
  if (role === "admin") return "/admin";
  if (role === "coach") return "/coach";
  return "/profile";
};
