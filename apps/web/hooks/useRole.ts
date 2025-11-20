import { UserRoleInterface } from "@/context/types";
import { useAuth } from "./useAuth";
import { UserRole as UserRoleEnum } from "@/types/schema.types";

export const useRole = () => {
  const { user, loading, isInitialized } = useAuth();

  const roleName: UserRoleEnum[] =
    user?.userRoles?.map((e: UserRoleInterface) => e.role.name) ?? [];

  const hasRole = (requiredRole: UserRoleEnum): boolean => {
    if (!user || !roleName.length) {
      return false;
    }
    return roleName.includes(requiredRole);
  };

  return {
    currentUser: user,
    isLoading: loading,
    isAuthInitialized: isInitialized,
    roles: roleName,
    hasRole,
  };
};
