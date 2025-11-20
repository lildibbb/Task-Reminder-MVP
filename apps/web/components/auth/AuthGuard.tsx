import { ReactNode, ReactElement, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { publicPath } from "./public-path";
import { getAllowedRolesForPath } from "./role-path";
import { Status } from "@/types/schema.types";

interface AuthGuardProps {
  children: ReactNode;
  fallback: ReactElement | null;
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props;
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth.isInitialized || auth.loading) return;

    const isPublicPath = publicPath.includes(pathname);

    if (!auth.user && !isPublicPath) {
      const loginRedirectPath = "/login";
      if (pathname && pathname !== "/") {
        router.replace(
          `${loginRedirectPath}?returnUrl=${encodeURIComponent(pathname)}`,
        );
      } else {
        router.replace(loginRedirectPath);
      }
      return;
    }

    if (auth.user && !isPublicPath) {
      if (auth.user.status !== Status.ACTIVE) {
        router.replace("/inactive");
        return;
      }

      const allowedRoles = getAllowedRolesForPath(pathname);
      if (allowedRoles) {
        const userRoles =
          auth.user.userRoles?.map((ur: any) => ur.role?.name) || [];
        const hasRole = allowedRoles.some((role) => userRoles.includes(role));
        if (!hasRole) {
          router.replace(
            `/forbidden?returnUrl=${encodeURIComponent(pathname)}`,
          );
          return;
        }
      }
    }
    if (auth.user && isPublicPath) {
      router.replace("/task");
      return;
    }
  }, [pathname, auth.user, auth.isInitialized, auth.loading, router]);

  if (!auth.isInitialized || auth.loading) {
    return fallback;
  }

  const isPublicPathForRender = publicPath.includes(pathname);

  if (auth.user !== null) {
    if (auth.user.status !== Status.ACTIVE) return null;

    const allowedRoles = getAllowedRolesForPath(pathname);
    if (allowedRoles) {
      const userRoles =
        auth.user.userRoles?.map((ur: any) => ur.role?.name) || [];
      const hasRole = allowedRoles.some((role) => userRoles.includes(role));
      if (!hasRole) return null;
    }
    return <>{children}</>;
  }

  if (isPublicPathForRender) {
    return <>{children}</>;
  }

  return fallback;
};

export default AuthGuard;
